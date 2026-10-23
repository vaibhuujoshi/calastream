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

/**
 * Recursively collects all files while preserving paths
 * relative to the original HLS output directory.
 */
async function collectFiles(
    rootDirectory: string,
    currentDirectory: string = rootDirectory,
): Promise<LocalFile[]> {
    const files: LocalFile[] = [];

    const entries = await readdir(currentDirectory, {
        withFileTypes: true,
    });

    for (const entry of entries) {
        const fullPath = join(currentDirectory, entry.name);

        if (entry.isDirectory()) {
            const nestedFiles = await collectFiles(
                rootDirectory,
                fullPath,
            );

            files.push(...nestedFiles);
        } else if (entry.isFile()) {
            files.push({
                path: fullPath,
                relativePath: relative(
                    rootDirectory,
                    fullPath,
                )
                    .split(sep)
                    .join("/"),
            });
        }
    }

    return files;
}

/**
 * Returns the correct MIME type for HLS files.
 */
function getContentType(filePath: string): string {
    if (filePath.endsWith(".m3u8")) {
        return "application/vnd.apple.mpegurl";
    }

    if (filePath.endsWith(".ts")) {
        return "video/mp2t";
    }

    throw new Error(
        `Unsupported HLS file type: ${filePath}`,
    );
}

export async function uploadHls({
    outputDirectory,
    videoId,
    concurrency = 4,
}: UploadHlsOptions): Promise<string> {
    // Validate video ID before constructing object keys.
    if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
        throw new Error(
            "Invalid video ID for HLS storage",
        );
    }

    if (
        !Number.isInteger(concurrency) ||
        concurrency < 1 ||
        concurrency > 16
    ) {
        throw new Error(
            "Concurrency must be an integer between 1 and 16",
        );
    }

    console.log("[HLS Upload] Bucket:", B2_BUCKET_NAME);
    console.log("[HLS Upload] Video ID:", videoId);
    console.log(
        "[HLS Upload] Output directory:",
        outputDirectory,
    );

    // Collect files with paths relative to outputDirectory.
    const files = await collectFiles(outputDirectory);

    console.log(
        "[HLS Upload] Total files collected:",
        files.length,
    );

    console.log(
        "[HLS Upload] Collected files:",
        files.map((file) => ({
            relativePath: file.relativePath,
            localPath: file.path,
        })),
    );

    if (files.length === 0) {
        throw new Error(
            "No HLS files found to upload",
        );
    }

    const availablePaths = new Set(
        files.map((file) => file.relativePath),
    );

    // Validate master playlist.
    if (!availablePaths.has("master.m3u8")) {
        throw new Error(
            "Master playlist is missing from HLS output",
        );
    }

    // Validate every rendition playlist.
    const requiredPlaylists = [
        "1080p/index.m3u8",
        "720p/index.m3u8",
        "480p/index.m3u8",
    ];

    const missingPlaylists = requiredPlaylists.filter(
        (path) => !availablePaths.has(path),
    );

    if (missingPlaylists.length > 0) {
        throw new Error(
            `Missing rendition playlists: ${missingPlaylists.join(", ")}`,
        );
    }

    // Reject unexpected files instead of uploading them silently.
    for (const file of files) {
        getContentType(file.relativePath);
    }

    const prefix = posix.join("hls", videoId);

    console.log("[HLS Upload] Destination prefix:", prefix);

    let nextIndex = 0;
    let uploadedCount = 0;

    /**
     * Each worker uploads a different file.
     * The shared index assigns each file to only one worker.
     */
    const uploadNext = async (): Promise<void> => {
        while (true) {
            const index = nextIndex++;

            if (index >= files.length) {
                return;
            }

            const file = files[index];

            if (!file) {
                continue;
            }

            // Preserve rendition directories in B2 keys.
            const key = posix.join(
                prefix,
                file.relativePath,
            );

            console.log(
                "[HLS Upload] Uploading:",
                key,
            );

            const upload = new Upload({
                client: S3,
                params: {
                    Bucket: B2_BUCKET_NAME,
                    Key: key,
                    Body: createReadStream(file.path),
                    ContentType: getContentType(
                        file.relativePath,
                    ),
                },
                queueSize: 1,
            });

            await upload.done();

            uploadedCount++;

            console.log(
                `[HLS Upload] Uploaded ${uploadedCount}/${files.length}:`,
                key,
            );
        }
    };

    const workerCount = Math.min(
        concurrency,
        files.length,
    );

    console.log(
        "[HLS Upload] Concurrent upload workers:",
        workerCount,
    );

    // If any upload fails, propagate the error to the caller.
    await Promise.all(
        Array.from(
            { length: workerCount },
            () => uploadNext(),
        ),
    );

    const masterPlaylistKey = posix.join(
        prefix,
        "master.m3u8",
    );

    console.log(
        "[HLS Upload] All files uploaded successfully.",
        {
            masterPlaylistKey,
            totalFiles: files.length,
        },
    );

    return masterPlaylistKey;
}
