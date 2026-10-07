// backend/routes/historyRoutes.ts
import { Router, type Request, type Response } from "express";
import auth from "../middlewares/authMiddleware";
import { prisma } from "../db/db";

const historyRouter = Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

// 1. Fetch Watch History with Cursor Pagination
historyRouter.get("/history", auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const cursor = req.query.cursor as string | undefined;
    const limit = 20;

    try {
        const history = await prisma.watchHistory.findMany({
            where: { userId: req.userId },
            take: limit + 1, // Fetch one extra to check if there is a next page
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), // Skip the cursor itself
            orderBy: { watchedAt: "desc" },
            include: {
                video: { include: { user: true } }
            }
        });

        let nextCursor: string | null = null;
        if (history.length > limit) {
            const nextItem = history.pop(); // Remove the extra item from the result array
            nextCursor = nextItem!.id; // Use its ID as the cursor for the next fetch
        }

        // Merge history metadata (watchedAt, historyId) with the video data
        const formattedData = history.map(h => ({
            historyId: h.id,
            watchedAt: h.watchedAt,
            ...h.video
        }));

        return res.status(200).json({ data: formattedData, nextCursor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch history" });
    }
});

// 2. Clear Specific History Item
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
        
        return res.status(200).json({ message: "Item removed from history" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to remove item" });
    }
});

// 3. Clear ALL History (Keep your existing route)
historyRouter.delete("/history/clear", auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        await prisma.watchHistory.deleteMany({ where: { userId: req.userId } });
        return res.status(200).json({ message: "History cleared" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to clear history" });
    }
});

// 4. Update History (Keep your existing POST route)
historyRouter.post("/history", auth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { videoId } = req.body;

    if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
    }

    try {
        // Using upsert because of the @@unique([userId, videoId]) constraint in your schema.
        // If they watch it again, it just updates the timestamp to 'now()'.
        await prisma.watchHistory.upsert({
            where: {
                userId_videoId: {
                    userId: req.userId!,
                    videoId: videoId
                }
            },
            update: {
                watchedAt: new Date()
            },
            create: {
                userId: req.userId!,
                videoId: videoId
            }
        });

        return res.status(200).json({ message: "History updated" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update history" });
    }
});

export default historyRouter;