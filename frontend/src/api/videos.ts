const BASE_URL = "http://localhost:3000/api/v1";

export async function getVideos() {
    const response = await fetch(`${BASE_URL}/videos`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });

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