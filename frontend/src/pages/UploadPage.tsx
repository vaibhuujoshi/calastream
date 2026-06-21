export default function UploadPage() {
    return (
        <div className="m-8">
            <input
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer"
                type="file"
                onChange={async (e) => { // Removed unused 'files' argument
                    if (!e.target.files || e.target.files.length === 0) return;
                    
                    const file = e.target.files[0];
                    console.log(file);
                    const BASE_URL = "http://localhost:3000/api/v1";

                    // 1. Fetch the pre-signed URL from your Express backend
                    const response = await fetch(`${BASE_URL}/getPresignedUploadUrl`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    });
                    const data = await response.json();
                    const { putUrl, videoPath } = data;

                    // 2. Upload the raw binary stream to Backblaze
                    const uploadResponse = await fetch(putUrl, {
                        method: "PUT",
                        body: file,
                        headers: {
                            // FIX: Must be explicitly "video/mp4" to match your PutObjectCommand backend setup
                            'Content-Type': 'video/mp4', 
                        },
                    });

                    if (uploadResponse.ok) {
                        console.log("✅ Video uploaded successfully!");
                        // Next step: Send `videoPath` to your backend route `/video` to save it in Prisma!
                    } else {
                        console.error("❌ Upload failed:", uploadResponse.statusText);
                    }
                }} />
            <input
                type="file"
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer"
            />
        </div>
    )
}
