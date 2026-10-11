import type { PaginatedVideosResponse } from "./videos";

const BASE_URL = "http://localhost:3000/api/v1";

interface SubscriptionResponse {
    subscribed: boolean;
    message: string;
    error?: string;
}

export async function toggleSubscription(creatorId: string): Promise<SubscriptionResponse> {
    const response = await fetch(`${BASE_URL}/subscribe/${creatorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });

    const data = await response.json();

    // If the user tries to subscribe without being logged in, 
    // you likely want to trigger the Auth Modal from the UI, so we still throw here.
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized");
        throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    return data;
}

export async function checkSubscriptionStatus(creatorId: string): Promise<{ isSubscribed: boolean }> {
    const response = await fetch(`${BASE_URL}/subscribe/status/${creatorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });

    // Gracefully handle unauthenticated users (Guests are simply not subscribed)
    if (response.status === 401) {
        return { isSubscribed: false };
    }

    if (!response.ok) throw new Error("Failed to fetch subscription status");
    return response.json();
}

export async function getSubscriptionFeed(cursor?: string | null): Promise<PaginatedVideosResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);

    const response = await fetch(`${BASE_URL}/subscription/videos?${params.toString()}`, {
        credentials: "include" 
    });
    
    // Return empty feed for unauthenticated users instead of crashing
    if (response.status === 401) {
        return { data: [], nextCursor: null };
    }

    if (!response.ok) throw new Error("Failed to fetch subscription feed");
    
    const result = await response.json();
    return Array.isArray(result) ? { data: result, nextCursor: null } : result;
}

export interface SubscribedChannel {
    id: string;
    channelName: string;
    profilePicture: string | null;
}

export async function getSubscribedChannels(): Promise<SubscribedChannel[]> {
    const response = await fetch(`${BASE_URL}/subscription/channels`, {
        credentials: "include"
    });
    
    // Return empty channel list for unauthenticated users
    if (response.status === 401) {
        return [];
    }

    if (!response.ok) throw new Error("Failed to fetch subscribed channels");
    return await response.json();
}