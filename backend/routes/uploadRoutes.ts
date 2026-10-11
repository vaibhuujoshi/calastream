import { Router } from "express";
import { prisma } from "../db/db";
import { uploadSchema } from "../validators/uploadValidators";
import auth from "../middlewares/authMiddleware";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { redis } from "../db/redis";

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
        const activeCategory = category || 'All';
        const cacheKey = `feed:videos:${activeCategory}:${cursor || 'initial'}`;
        
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`[Cache Hit] Serving from Redis: ${cacheKey}`);
            return res.status(200).json(cachedData);
        }

        console.log(`[Cache Miss] Querying Database: ${cacheKey}`);

        const rawVideos = await prisma.uploads.findMany({
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            where: {
                ...(activeCategory !== "All" ? { title: { contains: activeCategory, mode: 'insensitive' } } : {})
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
                        _count: { select: { subscribers: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        let nextCursor: string | null = null;
        if (rawVideos.length > limit) {
            const nextItem = rawVideos.pop();
            nextCursor = nextItem!.id;
        }

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

        const responsePayload = { data: formattedVideos, nextCursor: nextCursor };

        await redis.set(cacheKey, responsePayload, { ex: 300 });

        return res.status(200).json(responsePayload);
    } catch (error) {
        console.error("Failed to fetch videos feed:", error);
        return res.status(500).json({ error: "Failed to fetch videos" });
    }
});

uploadRouter.get('/video/:id', async (req, res) => {
    try {
        const videoId = req.params.id;
        const cacheKey = `video:details:${videoId}`;

        const cachedVideo = await redis.get(cacheKey);

        if (cachedVideo) {
            console.log(`[Cache Hit] Serving Single Video: ${cacheKey}`);
            return res.status(200).json({ video: cachedVideo });
        }

        console.log(`[Cache Miss] Querying Database: ${cacheKey}`);

        const rawVideo = await prisma.uploads.findFirst({
            where: { id: videoId },
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

        const { _count, ...userData } = rawVideo.user;
        const formattedVideo = {
            ...rawVideo,
            user: {
                ...userData,
                subscriberCount: _count.subscribers
            }
        };

        const getCommand = new GetObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: formattedVideo.videoUrl
        });

        const getUrl = await getSignedUrl(S3, getCommand, { expiresIn: 7200 });

        if (formattedVideo.videoUrl.startsWith("videos/")) {
            formattedVideo.videoUrl = getUrl;
        }

        await redis.set(cacheKey, formattedVideo, { ex: 300 });

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

    try {
        const video = await prisma.uploads.create({
            data: { videoUrl, thumbnail, title, description, userId }
        });

        await redis.del('feed:videos:All:initial');
        
        await redis.del(`channel:videos:${userId}:initial`);

        res.status(201).json({ video });
    } catch (error) {
        console.error("Video Upload Error:", error);
        return res.status(500).json({ error: "Failed to save video" });
    }
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