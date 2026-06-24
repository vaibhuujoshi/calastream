const BASE_URL = "http://localhost:3000/api/v1";

export interface WatchUser {
    id: string;
    channelName: string;
    profilePicture: string | null;
    subscriberCount: number;
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
export async function getVideos(): Promise<WatchVideo[]> {
    const response = await fetch(`${BASE_URL}/videos`, { // Adjust endpoint if your route is named differently
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });

    if (!response.ok) throw new Error("Failed to fetch feed videos");
    const data = await response.json();
    return data.videos;
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