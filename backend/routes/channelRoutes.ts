// backend/routes/channelRouter.ts
import { Router, type Request, type Response } from "express";
import { prisma } from "../db/db";
import { redis } from "../db/redis";

const channelRouter = Router();

// 1. Fetch Channel Info
channelRouter.get('/:channelId', async (req: Request, res: Response): Promise<any> => {
    const channelId = req.params.channelId as string;
    const cacheKey = `channel:info:${channelId}`;

    try {
        const cachedChannel = await redis.get(cacheKey);
        if (cachedChannel) {
            console.log(`[Cache Hit] Serving Channel Info: ${cacheKey}`);
            return res.status(200).json(cachedChannel);
        }

        console.log(`[Cache Miss] Querying Database: ${cacheKey}`);

        const channel = await prisma.user.findUnique({
            where: { id: channelId },
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
        });

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        const { _count, ...userData } = channel;
        const responseData = {
            ...userData,
            subscriberCount: _count.subscribers
        };

        await redis.set(cacheKey, responseData, { ex: 300 });

        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Error fetching channel info:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Fetch Channel Videos (GET /api/v1/channel/:channelId/videos)
channelRouter.get('/:channelId/videos', async (req: Request, res: Response): Promise<any> => {
    const { channelId } = req.params;
    const cursor = req.query.cursor as string | undefined;
    const limit = 16; 
    
    const cacheKey = `channel:videos:${channelId}:${cursor || 'initial'}`;

    try {
        const cachedVideos = await redis.get(cacheKey);
        if (cachedVideos) {
            console.log(`[Cache Hit] Serving Channel Videos: ${cacheKey}`);
            return res.status(200).json(cachedVideos);
        }

        console.log(`[Cache Miss] Querying Database: ${cacheKey}`);

        const rawVideos = await prisma.uploads.findMany({
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            where: {
                userId: channelId as string
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
            orderBy: {
                createdAt: "desc"
            }
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

        const responsePayload = { data: formattedVideos, nextCursor };

        await redis.set(cacheKey, responsePayload, { ex: 300 });

        return res.status(200).json(responsePayload);

    } catch (error) {
        console.error("Error fetching channel videos:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default channelRouter;