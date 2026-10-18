import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, sep, posix } from "node:path";

import { S3, B2_BUCKET_NAME } from "../../config/b2";


type UploadHlsOptions = {
    outputDirectory: string;
    videoId: string;
    concurrency?: number;
};

type LocalFile = {
    path: string;
    relativePath: string;
};

async function collectFiles(directory: string): Promise<LocalFile[]> {
    const files: LocalFile[] = [];
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await collectFiles(fullPath));
        } else if (entry.isFile()) {
            files.push({
                path: fullPath,
                relativePath: relative(directory, fullPath)
                    .split(sep)
                    .join("/"),
            });
        }
    }

    return files;
}

function getContentType(filePath: string): string {
    if (filePath.endsWith(".m3u8")) {
        return "application/vnd.apple.mpegurl";
    }

    if (filePath.endsWith(".ts")) {
        return "video/mp2t";
    }

    throw new Error(`Unsupported HLS file type: ${filePath}`);
}

export async function uploadHls({
    outputDirectory,
    videoId,
    concurrency = 4,
}: UploadHlsOptions): Promise<string> {
    if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
        throw new Error("Invalid video ID for HLS storage");
    }

    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) {
        throw new Error("Concurrency must be an integer between 1 and 16");
    }

    const files = await collectFiles(outputDirectory);

    const masterPlaylistExists = files.some(
        (file) => file.relativePath === "master.m3u8"
    );

    if (!masterPlaylistExists) {
        throw new Error("Master playlist is missing from HLS output");
    }

    if (files.length === 0) {
        throw new Error("No HLS files found to upload");
    }

    const prefix = `hls/${videoId}`;
    let nextIndex = 0;

    // Each worker uploads one file at a time.
    const uploadNext = async (): Promise<void> => {
        while (true) {
            const index = nextIndex++;

            if (index >= files.length) {
                return;
            }

            const file = files[index];
            const key = posix.join(prefix, file!.relativePath);

            const upload = new Upload({
                client: S3,
                params: {
                    Bucket: B2_BUCKET_NAME,
                    Key: key,
                    Body: createReadStream(file!.path),
                    ContentType: getContentType(file!.relativePath),
                },
                queueSize: 1,
            });

            await upload.done();
        }
    };

    const workers = Array.from(
        { length: Math.min(concurrency, files.length) },
        () => uploadNext()
    );

    await Promise.all(workers);

    return posix.join(prefix, "master.m3u8");
}