// backend/routes/historyRoutes.ts
import { Router, type Request, type Response } from "express";
import auth from "../middlewares/authMiddleware";
import { prisma } from "../db/db";
import { redis } from "../db/redis";

const historyRouter = Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

// 1. Fetch Watch History with Caching
historyRouter.get("/history", auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const cursor = req.query.cursor as string | undefined;
    const limit = 20;

    try {
        const cacheKey = `history:${req.userId}:${cursor || 'initial'}`;

        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`[Cache Hit] Serving History for user ${req.userId}`);
            return res.status(200).json(cachedData);
        }

        console.log(`[Cache Miss] Fetching History from DB for user ${req.userId}`);

        const history = await prisma.watchHistory.findMany({
            where: { userId: req.userId },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy: { watchedAt: "desc" },
            include: {
                video: { include: { user: true } }
            }
        });

        let nextCursor: string | null = null;
        if (history.length > limit) {
            const nextItem = history.pop();
            nextCursor = nextItem!.id;
        }

        const formattedData = history.map(h => ({
            historyId: h.id,
            watchedAt: h.watchedAt,
            ...h.video
        }));

        const responsePayload = { data: formattedData, nextCursor };

        await redis.set(cacheKey, responsePayload, { ex: 300 });

        return res.status(200).json(responsePayload);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch history" });
    }
});

// 2. Clear ALL History 
historyRouter.delete("/history/clear", auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        await prisma.watchHistory.deleteMany({ where: { userId: req.userId } });
        
        await redis.del(`history:${req.userId}:initial`);

        return res.status(200).json({ message: "History cleared" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to clear history" });
    }
});

// 3. Clear Specific History Item
historyRouter.delete("/history/:videoId", auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        await prisma.watchHistory.delete({
            where: {
                userId_videoId: {
                    userId: req.userId!,
                    videoId: req.params.videoId as string
                }
            }
        });
        
        await redis.del(`history:${req.userId}:initial`);

        return res.status(200).json({ message: "Item removed from history" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to remove item" });
    }
});

// 4. Update History
historyRouter.post("/history", auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { videoId } = req.body;

    if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
    }

    try {
        await prisma.watchHistory.upsert({
            where: {
                userId_videoId: {
                    userId: req.userId!,
                    videoId: videoId
                }
            },
            update: { watchedAt: new Date() },
            create: { userId: req.userId!, videoId: videoId }
        });

        await redis.del(`history:${req.userId}:initial`);

        return res.status(200).json({ message: "History updated" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update history" });
    }
});

export default historyRouter;