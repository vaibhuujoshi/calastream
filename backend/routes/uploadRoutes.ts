import { Router } from "express";
import { prisma } from "../db/db";
import { uploadSchema } from "../validators/uploadValidators";
import auth from "../middlewares/authMiddleware";
import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { redis } from "../db/redis";
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from "bullmq";
import { videoQueue } from "../queues/videoQueue";
import { S3 } from "../config/b2";
import { createPlaybackToken } from "../utils/playbackToken";
import type { VideoMetadata } from "../types/video";

const uploadRouter = Router();

const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;

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

uploadRouter.get("/video/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    const cacheKey = `video:details:${videoId}`;

    let video: VideoMetadata | null = await redis.get<VideoMetadata>(cacheKey);

    if (video) {
      console.log(`[Cache Hit] Serving Single Video: ${cacheKey}`);
    } else {
      console.log(`[Cache Miss] Querying Database: ${cacheKey}`);

      const rawVideo = await prisma.uploads.findUnique({
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
                select: { subscribers: true },
              },
            },
          },
        },
      });

      if (!rawVideo) {
        return res.status(404).json({ error: "Video not found" });
      }

      const { _count, ...userData } = rawVideo.user;

      const { videoUrl: _originalVideoKey, ...videoMetadata } =
        rawVideo;

      video = {
        ...videoMetadata,
        user: {
          ...userData,
          subscriberCount: _count.subscribers,
        },
      };

      // Cache metadata, never a signed URL or playback token.
      await redis.set(cacheKey, video, { ex: 300 });
    }

    // Return the video's metadata even if it isn't published.
    // Only published videos with a master playlist can be played.
    let playbackUrl = null;

    if (video.status === "PUBLISHED" && video.hlsMasterKey) {
      const expectedPrefix = `hls/${video.id}/`;

      if (!video.hlsMasterKey.startsWith(expectedPrefix)) {
        console.error("Unexpected HLS master key:", video.id);

        return res.status(500).json({
          error: "Invalid video playback configuration",
        });
      }

      const gatewayUrl = process.env.VIDEO_GATEWAY_URL;
      const playbackSecret = process.env.PLAYBACK_TOKEN_SECRET;

      if (!gatewayUrl || !playbackSecret) {
        throw new Error("Playback gateway configuration is missing");
      }

      const token = createPlaybackToken(
        video.id,
        playbackSecret,
        300,
      );

      const encodedKey = video.hlsMasterKey
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      playbackUrl =
        `${gatewayUrl.replace(/\/+$/, "")}/${encodedKey}` +
        `?token=${encodeURIComponent(token)}`;
    }

    return res.status(200).json({
      video: {
        ...video,
        playbackUrl,
      },
    });
  } catch (error) {
    console.error("Single Video Details Fetch Error:", error);

    return res.status(500).json({
      error: "Internal server error fetching video data.",
    });
  }
});

uploadRouter.post('/video', auth, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

    const { videoUrl, thumbnail, title, description } = parsed.data;

    try {
        await S3.send(
            new HeadObjectCommand({
                Bucket: B2_BUCKET_NAME,
                Key: videoUrl
            })
        );

        const video = await prisma.uploads.create({
            data: {
                videoUrl,
                thumbnail,
                title,
                description,
                userId,
                status: "PROCESSING"
            }
        });

        try {
            await videoQueue.add(
                "process-video",
                {
                    videoId: video.id,
                    sourceKey: video.videoUrl
                },
                {
                    jobId: video.id,
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 5000
                    }
                }
            );
        } catch (queueError) {
            console.error("Failed to enqueue video:", queueError);

            await prisma.uploads.update({
                where: { id: video.id },
                data: { status: "FAILED" }
            });

            return res.status(503).json({
                error: "Video saved, but processing could not be scheduled",
                videoId: video.id
            });
        }

        await Promise.all([
            redis.del("feed:videos:All:initial"),
            redis.del(`channel:videos:${userId}:initial`)
        ]);

        return res.status(201).json({
            video,
            processingStatus: "PROCESSING"
        });
    } catch (error) {
        console.error("Video Upload Error:", error);
        return res.status(500).json({ error: "Failed to save or verify video" });
    }
});

uploadRouter.post("/getPresignedUploadUrl", auth, async (req, res) => {
    try {
        const uniqueKey = `videos/${randomUUID()}.mp4`;

        const putCommand = new PutObjectCommand({
            Bucket: B2_BUCKET_NAME,
            Key: uniqueKey,
            ContentType: "video/mp4",
        });

        const putUrl = await getSignedUrl(S3, putCommand, {
            expiresIn: 900,
            signableHeaders: new Set(["host"]),
        });

        return res.status(200).json({
            success: true,
            putUrl,
            videoPath: uniqueKey,
        });
    } catch (error) {
        console.error("Presigned URL error:", error);

        return res.status(500).json({
            success: false,
            message: "Error generating upload URL",
        });
    }
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

uploadRouter.get('/cloudinary-signature', auth, async (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);

        // We define the folder here to keep your Cloudinary dashboard organized
        const paramsToSign = {
            timestamp: timestamp,
            folder: 'calastream/thumbnails'
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return res.status(200).json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error("Error generating Cloudinary signature:", error);
        return res.status(500).json({ error: "Failed to generate signature" });
    }
});

export default uploadRouter;