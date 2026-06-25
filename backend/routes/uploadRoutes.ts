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

uploadRouter.get('/videos', async (req, res) => {
    const videos = await prisma.uploads.findMany({
        include: { user: { select: { id: true, channelName: true, profilePicture: true, subscriberCount: true, gender: true, banner: true, username: true, description: true,  } } },
        orderBy: { createdAt: "desc" }
    });
    res.json({ videos });
});

uploadRouter.get('/video/:id', async (req, res) => {
    const video = await prisma.uploads.findFirst({
        where: { id: req.params.id },
        include: { user: { select: { id: true, channelName: true, profilePicture: true, subscriberCount: true, } } }
    });

    if (!video) return res.status(404).json({ error: "Video not found" });

    const getCommand = new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: video.videoUrl
    });

    const getUrl = await getSignedUrl(S3, getCommand, { expiresIn: 7200 });

    if (video.videoUrl.startsWith("videos/")) {
        video.videoUrl = getUrl;
    }

    res.json({ video });
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