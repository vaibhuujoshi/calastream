import { Worker, type Job } from "bullmq";
import { join } from "path";
import { rm } from "fs/promises";

import { redisConnection } from "../queues/redisConnection";
import { type VideoProcessingJob } from "../queues/videoQueue";
import { downloadOriginal } from "../services/video-processing/downloadOriginal";
import { generateHls } from "../services/video-processing/generateHls";
import { uploadHls } from "../services/video-processing/uploadHls";
import { prisma } from "../db/db";

async function processVideo(job: Job<VideoProcessingJob>) {
    const { videoId, sourceKey } = job.data;

    let temporaryDirectory: string | undefined;

    console.log(`[${job.id}] Starting video processing`, { videoId });

    try {
        console.log(`[${job.id}] Downloading original video...`);

        const download = await downloadOriginal(sourceKey);
        temporaryDirectory = download.directory;

        console.log(`[${job.id}] Original video downloaded`);

        const outputDirectory = join(temporaryDirectory, "hls");

        console.log(`[${job.id}] Generating HLS...`);

        await generateHls({
            inputPath: download.filePath,
            outputDirectory,
        });

        console.log(`[${job.id}] HLS generation completed`);

        console.log(`[${job.id}] Uploading HLS to B2...`);

        const masterPlaylistKey = await uploadHls({
            outputDirectory,
            videoId,
            concurrency: 4,
        });

        console.log(`[${job.id}] HLS upload completed`);

        console.log(`[${job.id}] Updating database...`);

        await prisma.uploads.update({
            where: { id: videoId },
            data: {
                hlsMasterKey: masterPlaylistKey,
                status: "PUBLISHED",
            },
        });

        console.log(`[${job.id}] Video published successfully`);

        return { videoId, masterPlaylistKey };
    } catch (error) {
        console.error(`[${job.id}] Video processing failed`, {
            videoId,
            error,
        });

        const maxAttempts = job.opts.attempts ?? 1;
        const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts;

        if (isFinalAttempt) {
            try {
                await prisma.uploads.update({
                    where: { id: videoId },
                    data: { status: "FAILED" },
                });
            } catch (databaseError) {
                console.error(
                    `Could not mark video ${videoId} as FAILED`,
                    databaseError,
                );
            }
        }

        throw error;
    } finally {
        if (temporaryDirectory) {
            try {
                await rm(temporaryDirectory, {
                    recursive: true,
                    force: true,
                });
            } catch (cleanupError) {
                console.error(
                    `[${job.id}] Failed to clean up temporary files`,
                    cleanupError,
                );
            }
        }
    }
}

const videoWorker = new Worker<VideoProcessingJob>(
    "video-processing",
    processVideo,
    {
        connection: {
            ...redisConnection,
            maxRetriesPerRequest: null,
        },
        concurrency: 1,
    }
);