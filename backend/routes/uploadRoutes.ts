import { type Request, type Response, Router } from "express";
import { prisma } from "../db/db";

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

