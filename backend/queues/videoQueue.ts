import { Queue } from "bullmq";
import { redisConnection } from "./redisConnection";

export type VideoProcessingJob = {
    videoId: string;
    sourceKey: string;
};

export const videoQueue = new Queue<VideoProcessingJob>(
    "video-processing",
    {
        connection: {
            ...redisConnection,
            maxRetriesPerRequest: 1,
        },
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: {
                age: 24 * 60 * 60,
                count: 1000,
            },
            removeOnFail: {
                age: 7 * 24 * 60 * 60,
            },
        },
    },
);