import { Router } from "express";
import { prisma } from "../db/db";
import { uploadSchema } from "../validators/uploadValidators";
import auth from "../middlewares/authMiddleware";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const uploadRouter = Router();

const B2_ENDPOINT = process.env.B2_ENDPOINT;
const B2_REGION = process.env.B2_REGION;
const B2_KEY_ID = process.env.B2_KEY_ID!;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY!;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;

export const S3 = new S3Client({
    endpoint: B2_ENDPOINT,
    region: B2_REGION,
    credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APPLICATION_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});

uploadRouter.get('/videos', async (req, res): Promise<any> => {
    const cursor = req.query.cursor as string | undefined;
    const category = req.query.category as string | undefined;
    const limit = 16;
    
    try {
        // 1. Fetch raw data with aggregation count block & pagination
        const rawVideos = await prisma.uploads.findMany({
            take: limit + 1, // Fetch one extra to determine if there's a next page
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), // Skip the cursor itself
            where: {
                // Since there is no category field in schema yet, we can filter by title 
                // containing the category (or remove this block if you don't want filtering yet)
                ...(category && category !== "All" ? {
                    title: { contains: category, mode: 'insensitive' } 
                } : {})
            },
            include: {
                user: {
                    select: {
                        id: true,
                        channelName: true,
                        profilePicture: true,
                        gender: true,
                        banner: true,
                        username: true,
                        description: true,
                        _count: {
                            select: { subscribers: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // 2. Determine if there is a next page and extract the next cursor
        let nextCursor: string | null = null;
        if (rawVideos.length > limit) {
            const nextItem = rawVideos.pop(); // Remove the extra 17th item from the array
            nextCursor = nextItem!.id; // Set its ID as the cursor for the next request
        }

        // 3. Format loop to inject subscriberCount flatly
        const formattedVideos = rawVideos.map((video) => {
            const { _count, ...userData } = video.user;
            return {
                ...video,
                user: {
                    ...userData,
                    subscriberCount: _count.subscribers
                }
            };
        });

        // Return the formatted videos array AND the nextCursor for infinite scroll
        return res.status(200).json({ 
            data: formattedVideos, 
            nextCursor: nextCursor 
        });

    } catch (error) {
        console.error("Failed to fetch videos feed:", error);
        return res.status(500).json({ error: "Failed to fetch videos" });
    }
});

uploadRouter.get('/video/:id', async (req, res) => {
    try {
        // 1. Updated to match the /videos aggregation structure exactly
        const rawVideo = await prisma.uploads.findFirst({
            where: { id: req.params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        channelName: true,
                        profilePicture: true,
                        gender: true,
                        banner: true,
                        username: true,
                        description: true,
                        _count: {
                            select: { subscribers: true }
                        }
                    }
                }
            }
        });

        if (!rawVideo) {
            return res.status(404).json({ error: "Video not found" });
        }

        // 2. Format the single video payload identically to the map loop above
        const { _count, ...userData } = rawVideo.user;
        const formattedVideo = {
            ...rawVideo,
            user: {
                ...userData,
                subscriberCount: _count.subscribers
            }
        };

        // 3. Generate S3/B2 file delivery access URL signature
        const getCommand = new GetObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: formattedVideo.videoUrl
        });

        const getUrl = await getSignedUrl(S3, getCommand, { expiresIn: 7200 });

        if (formattedVideo.videoUrl.startsWith("videos/")) {
            formattedVideo.videoUrl = getUrl;
        }

        return res.json({ video: formattedVideo });

    } catch (error) {
        console.error("Single Video Details Fetch Error:", error);
        return res.status(500).json({ error: "Internal server error fetching video data." });
    }
});

uploadRouter.post('/video', auth, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

    const { videoUrl, thumbnail, title, description } = parsed.data;

    const video = await prisma.uploads.create({
        data: { videoUrl, thumbnail, title, description, userId }
    });

    res.status(201).json({ video });
});

uploadRouter.post('/getPresignedUploadUrl', async (req, res) => {
    try {
        const uniqueKey = `videos/${Date.now()}.mp4`;

        const putCommand = new PutObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: uniqueKey,
            ContentType: "video/mp4",
        });

        const putUrl = await getSignedUrl(S3, putCommand, { expiresIn: 900, signableHeaders: new Set(["host"]) });

        return res.status(200).json({
            success: true,
            putUrl: putUrl,
            videoPath: uniqueKey
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Error generating upload URL" });
    }
});

export default uploadRouter;