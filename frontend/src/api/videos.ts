const BASE_URL = "http://localhost:3000/api/v1";

export type Gender = 'MALE' | 'FEMALE' | 'OTHERS';

export interface WatchUser {
  id: string;
  username: string;
  channelName: string;
  gender: Gender;
  banner: string | null;
  profilePicture: string | null;
  subscriberCount: number;
  description: string | null;
}

export interface WatchVideo {
    id: string;
    videoUrl: string;
    thumbnail: string;
    title: string;
    description: string;
    createdAt: string;
    user: WatchUser;
    viewCount?: number;
}

// 1. Fetch Single Video (For the main player)
export async function getVideo(id: string): Promise<WatchVideo> {
    const response = await fetch(`${BASE_URL}/video/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });

    if (!response.ok) throw new Error("Failed to fetch video");
    const data = await response.json();
    return data.video;
}

// 2. Fetch All Videos (For the feed and the suggested sidebar)
export interface PaginatedVideosResponse {
    data: WatchVideo[];
    nextCursor: string | null;
}

export async function getVideos(cursor?: string | null, category?: string): Promise<PaginatedVideosResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    if (category) params.append("category", category);

    const response = await fetch(`${BASE_URL}/videos?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch videos");
    
    // If your backend isn't updated yet and still returns an array, wrap it to prevent breaking:
    const result = await response.json();
    return Array.isArray(result) ? { data: result, nextCursor: null } : result;
}

export async function uploadVideo(videoUrl: string, thumbnail: string, title: string, description: string) {
    const response = await fetch(`${BASE_URL}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, thumbnail, title, description }),
        credentials: "include"
    });

    const data = await response.json();
    return data;
}