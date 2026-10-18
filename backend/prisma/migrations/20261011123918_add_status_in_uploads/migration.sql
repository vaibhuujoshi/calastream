-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PROCESSING', 'PUBLISHED', 'FAILED');

-- AlterTable
ALTER TABLE "Uploads" ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'PROCESSING';
