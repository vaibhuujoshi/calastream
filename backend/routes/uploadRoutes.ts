import { Router } from "express";
import { prisma } from "../db/db";
import { uploadSchema } from "../validators/uploadValidators";
import auth from "../middlewares/authMiddleware";

const uploadRouter = Router();

uploadRouter.get('/videos', async (req, res) => {
    const videos = await prisma.uploads.findMany({
        include: { user: { select: { id: true, channelName: true, profilePicture: true } } },
        orderBy: { createdAt: "desc" }
    });

    res.json(videos);
})

uploadRouter.get('/video/:id', async (req, res) => {
    const video = await prisma.uploads.findFirst({
        where: { id: req.params.id },
        include: { user: { select: { id: true, channelName: true, profilePicture: true } } }
    });

    res.json(video);
})

uploadRouter.post('/video', auth, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; };

    const { videoUrl, thumbnail, title, description } = parsed.data;

    const video = await prisma.uploads.create({
        data: { videoUrl, thumbnail, title, description, userId }
    });

    res.status(201).json(video);
})

export default uploadRouter;