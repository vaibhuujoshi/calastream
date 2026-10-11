# Calastream
**A High-Performance, Decoupled Video Streaming Platform**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-purple.svg)](#) <!-- Add your Vercel link here -->
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL%20%7C%20Redis-black)](#)

Calastream is a full-stack video streaming and sharing platform designed with industry-standard patterns for media ingestion, processing, and delivery. Built to handle heavy media payloads without blocking the main API thread, it features a decoupled architecture, secure direct-to-cloud uploads, and robust caching.

## 🏗 System Architecture & Tech Stack

### Frontend (Client)
* **Framework:** React (Vite) + TypeScript
* **Styling & UI:** Tailwind CSS, Framer Motion, Radix UI
* **State Management:** Zustand (Global State)
* **Video Player:** Plyr + React
* **Deployment:** Vercel

### Backend (API & Workers)
* **Runtime:** Node.js with Express.js + TypeScript
* **Database:** PostgreSQL (hosted on Neon) with Prisma ORM
* **Caching:** Redis (Upstash) for high-performance feed caching
* **Authentication:** JWT-based HTTP-only cross-origin cookies
* **Deployment:** Railway

### Cloud Infrastructure
* **Video Storage:** Backblaze B2 (Secure, private buckets)
* **Image Storage:** Cloudinary (Thumbnails and Avatars via direct upload)

---

## 🚀 Key Technical Decisions & Trade-offs

### 1. Direct-to-Cloud Media Ingestion
**Challenge:** Passing massive 500MB+ video files through a standard Node.js Express server will quickly cause memory exhaustion and block the event loop for other users.
**Solution:** The backend generates secure cryptographically signed URLs (Presigned URLs for Backblaze B2). The React client uses these signatures to upload bytes directly to the cloud providers, completely bypassing the backend infrastructure.

### 2. Authenticated Video Streaming Proxy
**Challenge:** Backblaze B2 requires a credit card to enable public buckets (or Cloudflare CDN integration). Operating within a constrained environment, the B2 buckets had to remain entirely private.
**Solution:** Built a secure video proxy route (`/stream/:videoId`) in the Node.js backend. The server authenticates the user, fetches the media stream securely from the private B2 bucket using the AWS SDK, and pipes the readable stream directly to the client.
**Trade-off:** This increases egress bandwidth on the Node.js server. While not ideal for a massive scale (100k+ concurrent viewers), it perfectly secures the media assets and demonstrates an understanding of Node.js Streams and buffer management.

### 3. Redis Feed Caching
**Challenge:** Complex relational queries joining Videos, Users, Subscriptions, and Likes take a toll on the PostgreSQL database on every page load.
**Solution:** Implemented Redis (Upstash) to cache the global video feed and individual channel feeds. Cache invalidation is explicitly handled during video publish events to prevent stale data.

---

## 🗺 Future Roadmap: Asynchronous Transcoding

The current architecture serves static MP4 files securely. The next phase of development transitions the platform to **Adaptive Bitrate Streaming (HLS)** to optimize playback for varying network speeds.

* **Message Queue:** Implement BullMQ (on Upstash Redis) to handle video processing asynchronously.
* **Worker Threads:** Deploy a separate background Node.js worker to consume the queue.
* **FFmpeg Pipeline:** The worker will download raw MP4s from B2, chunk them into `.ts` segments and `.m3u8` playlists, and upload the optimized HLS streams back to the delivery bucket—all without blocking the primary Express API.

---

## 💻 Local Setup & Development

### Prerequisites
* Node.js (v18+)
* Bun (Recommended for fast installs)
* PostgreSQL database (Local or Neon)
* Redis instance (Local or Upstash)
* Backblaze B2 & Cloudinary accounts

### Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=3000
DATABASE_URL="postgresql://user:pass@host/db"
REDIS_URL="rediss://default:pass@host:port"
JWT_SECRET="your_secure_secret"
NODE_ENV="development"

# Backblaze B2
B2_BUCKET_NAME="your_bucket"
B2_ENDPOINT="your_endpoint"
B2_REGION="your_region"
B2_KEY_ID="your_key"
B2_APP_KEY="your_app_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Installation

**1. Install dependencies:**
```bash
cd frontend
bun install

cd ../backend
bun install
```

**2. Database Setup:**
```bash
cd backend
bunx prisma generate
bunx prisma db push
```

**3. Run the Application:**

Open your first terminal (Backend):
```bash
cd backend
bun run dev
```

Open your second terminal (Frontend):
```bash
cd frontend
bun run dev
```