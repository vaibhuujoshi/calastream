const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function uploadThumbnail(file: File): Promise<string> {
    // 1. Get the signature from your backend
    const signatureResponse = await fetch(`${BASE_URL}/cloudinary-signature`, {
        method: 'GET',
        credentials: 'include'
    });
    
    if (!signatureResponse.ok) {
        throw new Error("Failed to get upload signature from server");
    }
    
    const data = await signatureResponse.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", data.apiKey);
    formData.append("timestamp", data.timestamp.toString());
    formData.append("signature", data.signature);
    formData.append("folder", "calastream/thumbnails"); 

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!uploadRes.ok) {
        throw new Error("Cloudinary upload failed");
    }

    const cloudinaryData = await uploadRes.json();

    return cloudinaryData.secure_url;
}