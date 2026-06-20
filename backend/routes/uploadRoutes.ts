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

const S3 = new S3Client({
    endpoint: B2_ENDPOINT,
    region: B2_REGION,
    credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APPLICATION_KEY,
    },
});

uploadRouter.get('/videos', async (req, res) => {
    const videos = await prisma.uploads.findMany({
        include: { user: { select: { id: true, channelName: true, profilePicture: true, subscriberCount: true, gender: true } } },
        orderBy: { createdAt: "desc" }
    });

    res.json({ videos });
})

uploadRouter.get('/video/:id', async (req, res) => {
    const video = await prisma.uploads.findFirst({
        where: { id: req.params.id },
        include: { user: { select: { id: true, channelName: true, profilePicture: true } } }
    });

    const getCommand = new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: video!.videoUrl // Uses the unique key saved from Step 1
    });

    const getUrl = await getSignedUrl(S3, getCommand, { expiresIn: 7200 });

    res.json({video, getUrl});
})

uploadRouter.post('/video', auth, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; };

    const { videoUrl, thumbnail, title, description } = parsed.data;

    const video = await prisma.uploads.create({
        data: { videoUrl, thumbnail, title, description, userId }
    });

    res.status(201).json(video);
})

uploadRouter.post('/getPresignedUploadUrl', async (req, res) => {
    try {
        const uniqueKey = `videos/${Date.now()}`;

        const putCommand = new PutObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: uniqueKey,
            ContentType: "video/mp4",
        });

        // Generate an upload link valid for 15 minutes
        const putUrl = await getSignedUrl(S3, putCommand, { expiresIn: 900 });

        // Return both the upload link AND the key you must save in the database
        return res.status(200).json({
            success: true,
            putUrl: putUrl,
            videoPath: uniqueKey // Save this string to your DB later!
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Error" });
    }
});

export default uploadRouter;