import { useState } from "react";
import { uploadVideo } from "../api/videos";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [videoUrl, setVideoUrl] = useState("");

    const navigate = useNavigate();

    function submitVideo() {
        uploadVideo(videoUrl, thumbnail, title, description)
            .then(() => {
                console.log("video uploaded");
                navigate('/');
            });
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl rounded-2xl border border-purple-900/40 bg-zinc-900 p-8 shadow-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Upload Video
                    </h1>
                    <p className="mt-2 text-zinc-400">
                        Upload your video and provide the required details.
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Video Upload */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-purple-300">
                            Video File
                        </label>

                        <input
                            type="file"
                            className="block w-full text-sm text-zinc-400
                            file:mr-4 file:rounded-lg file:border-0
                            file:bg-purple-600 file:px-4 file:py-2
                            file:font-medium file:text-white
                            hover:file:bg-purple-500
                            file:cursor-pointer"
                            onChange={async (e) => {
                                if (!e.target.files || e.target.files.length === 0)
                                    return;

                                const file = e.target.files[0];
                                console.log(file);

                                const BASE_URL =
                                    "http://localhost:3000/api/v1";

                                const response = await fetch(
                                    `${BASE_URL}/getPresignedUploadUrl`,
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        credentials: "include",
                                    }
                                );

                                const data = await response.json();
                                const { putUrl, videoPath } = data;

                                const uploadResponse = await fetch(putUrl, {
                                    method: "PUT",
                                    body: file,
                                    headers: {
                                        "Content-Type": "video/mp4",
                                    },
                                });

                                if (uploadResponse.ok) {
                                    console.log(
                                        "✅ Video uploaded successfully!"
                                    );
                                    setVideoUrl(videoPath);
                                } else {
                                    console.error(
                                        "❌ Upload failed:",
                                        uploadResponse.statusText
                                    );
                                }
                            }}
                        />
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-purple-300">
                            Thumbnail URL
                        </label>
                        <input
                            type="text"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="https://example.com/thumbnail.jpg"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-purple-300">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter video title"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-purple-300">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Describe your video..."
                            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={submitVideo}
                        className="w-full rounded-lg bg-purple-600 py-3 font-medium cursor-pointer text-white transition hover:bg-purple-500"
                    >
                        Upload Video
                    </button>
                </div>
            </div>
        </div>
    );
}