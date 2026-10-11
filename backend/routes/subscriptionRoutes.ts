// backend/routes/subsRouter.ts
import { Router, type Request, type Response } from "express";
import auth from "../middlewares/authMiddleware";
import { prisma } from "../db/db";
import { redis } from "../db/redis";

const subsRouter = Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

subsRouter.post('/subscribe/:creatorId', auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const subscriberId = req.userId;
    const creatorId = req.params.creatorId as string;

    if (!subscriberId) return res.status(401).json({ error: "Unauthorized access." });
    if (subscriberId === creatorId) return res.status(400).json({ error: "Cannot subscribe to yourself." });

    // Helper to invalidate all relevant caches
    const invalidateSubscriptionCaches = async () => {
        await Promise.all([
            redis.del(`subscription:status:${subscriberId}:${creatorId}`),
            redis.del(`subscription:videos:${subscriberId}:initial`),
            redis.del(`subscription:channels:${subscriberId}`),
            redis.del(`channel:info:${creatorId}`)
        ]);
    };

    try {
        await prisma.subscription.create({
            data: { subscriberId, creatorId }
        });

        await invalidateSubscriptionCaches();
        return res.status(200).json({ subscribed: true, message: "Subscribed successfully." });

    } catch (error: any) {
        if (error.code === 'P2002') {
            await prisma.subscription.delete({
                where: {
                    subscriberId_creatorId: { subscriberId, creatorId }
                }
            });

            await invalidateSubscriptionCaches();
            return res.status(200).json({ subscribed: false, message: "Unsubscribed successfully." });
        }

        console.error("Subscription Error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

subsRouter.get('/subscribe/status/:creatorId', auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    if (!req.userId) return res.status(200).json({ isSubscribed: false });

    const creatorId = req.params.creatorId as string;
    const cacheKey = `subscription:status:${req.userId}:${creatorId}`;

    try {
        const cachedStatus = await redis.get(cacheKey);
        if (cachedStatus !== null) {
            return res.status(200).json(cachedStatus);
        }

        const subscription = await prisma.subscription.findUnique({
            where: { subscriberId_creatorId: { subscriberId: req.userId, creatorId } }
        });

        const responseData = { isSubscribed: !!subscription };
        
        await redis.set(cacheKey, responseData, { ex: 300 });

        return res.status(200).json(responseData);
    } catch (error) {
        console.error("Error checking subscription status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

subsRouter.get('/subscription/videos', auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized access." });

    const cursor = req.query.cursor as string | undefined;
    const limit = 16;
    const cacheKey = `subscription:videos:${req.userId}:${cursor || 'initial'}`;

    try {
        const cachedVideos = await redis.get(cacheKey);
        if (cachedVideos) {
            console.log(`[Cache Hit] Serving Sub Feed for user ${req.userId}`);
            return res.status(200).json(cachedVideos);
        }

        console.log(`[Cache Miss] Fetching Sub Feed for user ${req.userId}`);

        const subscriptions = await prisma.subscription.findMany({
            where: { subscriberId: req.userId },
            select: { creatorId: true }
        });

        const creatorIds = subscriptions.map(sub => sub.creatorId);

        if (creatorIds.length === 0) {
            const emptyResponse = { data: [], nextCursor: null };
            await redis.set(cacheKey, emptyResponse, { ex: 300 });
            return res.status(200).json(emptyResponse);
        }

        const rawVideos = await prisma.uploads.findMany({
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            where: {
                userId: { in: creatorIds }
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
        console.error("Failed to fetch subscription feed:", error);
        return res.status(500).json({ error: "Failed to fetch subscription feed" });
    }
});

subsRouter.get('/subscription/channels', auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized access." });

    const cacheKey = `subscription:channels:${req.userId}`;

    try {
        const cachedChannels = await redis.get(cacheKey);
        if (cachedChannels) {
            return res.status(200).json(cachedChannels);
        }

        const subscriptions = await prisma.subscription.findMany({
            where: { subscriberId: req.userId },
            select: {
                creator: {
                    select: { id: true, channelName: true, profilePicture: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const channels = subscriptions.map(sub => sub.creator);
        
        await redis.set(cacheKey, channels, { ex: 300 });

        return res.status(200).json(channels);
    } catch (error) {
        console.error("Failed to fetch subscribed channels:", error);
        return res.status(500).json({ error: "Failed to fetch channels" });
    }
});

export default subsRouter;