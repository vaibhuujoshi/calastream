import { Router, type Request, type Response } from "express";
import auth from "../middlewares/authMiddleware";
import { prisma } from "../db/db";

const subsRouter = Router();

interface AuthenticatedRequest extends Request {
    userId?: string;
}

subsRouter.post('/subscribe/:creatorId', auth, async (req: AuthenticatedRequest, res: Response) => {
    const subscriberId = req.userId;
    const creatorId = req.params.creatorId as string;

    if (!subscriberId) return res.status(401).json({ error: "Unauthorized access." });
    if (subscriberId === creatorId) return res.status(400).json({ error: "Cannot subscribe to yourself." });

    try {
        // 1. Attempt to create the subscription record
        await prisma.subscription.create({
            data: { subscriberId, creatorId }
        });

        return res.status(200).json({ subscribed: true, message: "Subscribed successfully." });

    } catch (error: any) {
        // 2. Catch Prisma's Unique Constraint Violation (P2002)
        // This means the row already exists, so the user wants to unsubscribe.
        if (error.code === 'P2002') {
            await prisma.subscription.delete({
                where: {
                    subscriberId_creatorId: { subscriberId, creatorId }
                }
            });

            return res.status(200).json({ subscribed: false, message: "Unsubscribed successfully." });
        }

        console.error("Subscription Error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// Don't forget your status check route for the frontend!
subsRouter.get('/subscribe/status/:creatorId', auth, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) return res.status(200).json({ isSubscribed: false });

    const subscription = await prisma.subscription.findUnique({
        where: { subscriberId_creatorId: { subscriberId: req.userId, creatorId: req.params.creatorId as string } }
    });

    return res.status(200).json({ isSubscribed: !!subscription });
});

subsRouter.get('/subscription/videos', auth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { subscriberId: req.userId },
            select: {
                creator: {
                    select: { id: true, channelName: true, profilePicture: true }
                }
            }
        });

        const channels = subscriptions.map(sub => sub.creator);
        const creatorIds = channels.map(c => c.id);

        const videos = await prisma.uploads.findMany({
            where: {
                userId: { in: creatorIds }
            },
            include: {
                user: {
                    select: { id: true, channelName: true, profilePicture: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({ channels, videos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch subscription feed" });
    }
})

export default subsRouter;