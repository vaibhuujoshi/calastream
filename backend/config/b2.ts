import { S3Client } from "@aws-sdk/client-s3";

const B2_ENDPOINT = process.env.B2_ENDPOINT;
const B2_REGION = process.env.B2_REGION;
const B2_KEY_ID = process.env.B2_KEY_ID!;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY!;
export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;

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