import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config(); // Loads your .env keys

const S3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY,
    },
});

export const run = async () => {
    try {
        console.log("Applying CORS configuration to Backblaze B2...");
        await S3.send(new PutBucketCorsCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedOrigins: ["http://localhost:5173"], // Your frontend origin
                        AllowedMethods: ["GET", "PUT", "POST", "HEAD"],
                        AllowedHeaders: ["*"],
                        ExposeHeaders: ["ETag"],
                        MaxAgeSeconds: 3600,
                    },
                ],
            },
        }));
        console.log("✅ CORS configuration successfully updated!");
    } catch (err) {
        console.error("❌ Failed to update CORS configuration:", err);
    }
};