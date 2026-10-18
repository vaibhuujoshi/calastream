import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { B2_BUCKET_NAME, S3 } from "../../config/b2";
import { join } from "path";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { pipeline } from "stream/promises";
import { randomUUID } from "crypto";
import { createWriteStream } from "fs";

const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;

export type DownloadedOriginal = {
    directory: string;
    filePath: string;
};

export async function downloadOriginal(
    sourceKey: string
): Promise<DownloadedOriginal> {
    const metaData = await S3.send(
        new HeadObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: sourceKey,
        })
    );

    const contentLength = metaData.ContentLength;

    if (
        contentLength === undefined ||
        contentLength <= 0 ||
        contentLength > MAX_VIDEO_SIZE_BYTES
    ) {
        throw new Error("Video is empty, too large, or has unknown size");
    }

    const directory = await mkdtemp(
        join(tmpdir(), "calastream-video-")
    );

    const filePath = join(directory, `${randomUUID()}.mp4`);

    try {
        const response = await S3.send(
            new GetObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: sourceKey
            })
        );

        if (!response.Body) {
            throw new Error("B2 returned an empty response body");
        }

        await pipeline(
            response.Body as NodeJS.ReadableStream,
            createWriteStream(filePath, { flags: "wx" })
        );

        return { directory, filePath };
    } catch (error) {
        await rm(directory, { recursive: true, force: true });
        throw error;
    }

}