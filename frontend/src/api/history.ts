// frontend/src/api/history.ts
import type { WatchVideo } from "./videos";

const BASE_URL = "http://localhost:3000/api/v1";

export interface HistoryItem extends WatchVideo {
    historyId: string;
    watchedAt: string;
}

export interface HistoryResponse {
    data: HistoryItem[];
    nextCursor: string | null;
}

export async function getWatchHistory(cursor?: string | null): Promise<HistoryResponse> {
    const url = cursor ? `${BASE_URL}/history?cursor=${cursor}` : `${BASE_URL}/history`;
    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
}

export async function removeHistoryItem(videoId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/history/${videoId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to remove item");
}

export async function clearWatchHistory(): Promise<void> {
    const response = await fetch(`${BASE_URL}/history/clear`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to clear history");
}

export async function recordWatchHistory(videoId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ videoId })
    });

    if (!response.ok) throw new Error("Failed to record history");
}