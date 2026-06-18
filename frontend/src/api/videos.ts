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