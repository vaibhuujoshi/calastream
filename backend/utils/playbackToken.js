import { createHmac } from "crypto";

export function createPlaybackToken(videoId, secret, ttlSeconds = 300) {
  if (!secret) {
    throw new Error("PLAYBACK_TOKEN_SECRET is not configured");
  }

  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const expiryString = String(expiry);

  const signature = createHmac("sha256", secret)
    .update(`${videoId}:${expiryString}`)
    .digest("hex");

  return `${expiryString}.${signature}`;
}