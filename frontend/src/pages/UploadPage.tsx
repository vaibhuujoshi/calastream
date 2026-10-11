import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "../api/videos"; 
import { toast } from "sonner";
import { VideoDropzone } from "../components/upload/VideoDropzone";
import ThumbnailUploader from "../components/upload/ThumbnailUploader";
import { FormInput } from "../components/upload/FormInput";
import { FormTextarea } from "../components/upload/FormTextarea";

const BASE_URL = import.meta.env.BACKEND_URL;

export default function UploadPage() {
  const navigate = useNavigate();

  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "fetching" | "uploading" | "success" | "error">("idle");

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${BASE_URL}/profile`, { 
            method: "GET", 
            credentials: "include" 
        });
        
        if (!response.ok) {
          toast.error("Session expired. Please log in.");
          return navigate("/"); 
        }
        setIsAuthChecking(false); 
      } catch {
        toast.error("Authentication check failed");
        navigate("/");
      }
    }
    checkAuth();
  }, [navigate]);

  async function handleFileSelected(file: File) {
    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus("fetching");
    setVideoUrl("");

    try {
      // 1. Get Presigned URL for Backblaze B2 (Video)
      const response = await fetch(`${BASE_URL}/getPresignedUploadUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to secure upload route");
      const { putUrl, videoPath } = await response.json();

      setUploadStatus("uploading");
      
      // 2. Direct PUT to B2
      const uploadResponse = await fetch(putUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "video/mp4" },
      });

      if (uploadResponse.ok) {
        setVideoUrl(videoPath);
        setUploadStatus("success");
        toast.success("Video uploaded successfully!");
      } else {
        throw new Error("Transmission failed");
      }
    } catch (error) {
      setUploadStatus("error");
      toast.error(error instanceof Error ? error.message : "Upload interrupted");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFormSubmission() {
    if (!title.trim()) return toast.warning("Please provide a video title");
    if (!videoUrl) return toast.warning("Please wait for the video to finish uploading");
    if (!thumbnailUrl) return toast.warning("Please upload a thumbnail");

    toast.promise(
      uploadVideo(videoUrl, thumbnailUrl, title, description),
      {
        loading: 'Publishing your video to Calastream...',
        success: () => {
          navigate('/');
          return 'Video published successfully! 🚀';
        },
        error: 'Failed to publish video.',
      }
    );
  }

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isFormValid = title.trim().length > 0 && !!videoUrl && !!thumbnailUrl;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6 lg:p-8 relative font-sans overflow-y-auto custom-scrollbar">
      
      {/* Subtle Ambient Background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-100 bg-white/2 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Workspace Card */}
      <div className="relative z-10 w-full max-w-275 bg-[#0A0A0A] border border-zinc-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-8 py-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/20">
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                    Video Details
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                    Configure your video metadata before publishing.
                </p>
            </div>
            
            {/* Top Right Action (Cancel) */}
            <button 
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="Close"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Content Grid */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Left Column: Metadata (7 columns wide on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-8 h-full">
            <FormInput 
              label="Title (Required)"
              value={title}
              onChange={setTitle}
              placeholder="e.g., Building a Fullstack Video Platform from Scratch"
              maxLength={100}
            />

            <FormTextarea 
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Tell viewers about your video, add links, and describe the content..."
              rows={9}
              maxLength={5000}
            />
          </div>

          {/* Right Column: Media Uploads (5 columns wide on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <VideoDropzone 
              onFileSelect={handleFileSelected}
              isUploading={isUploading}
              uploadStatus={uploadStatus}
              fileName={fileName}
              hasVideoUrl={!!videoUrl}
            />
            
            <ThumbnailUploader 
              onUploadSuccess={setThumbnailUrl} 
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-zinc-800/80 bg-zinc-900/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 hidden sm:flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Videos are published instantly upon submission.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 py-2.5 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors font-medium text-sm border border-transparent hover:border-zinc-700"
            >
                Discard
            </button>

            <button
                onClick={handleFormSubmission}
                disabled={!isFormValid || isUploading}
                className={`w-full sm:w-auto min-w-40 py-2.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                    ${isFormValid && !isUploading 
                        ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    }
                `}
            >
                {isUploading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-400 rounded-full animate-spin" />
                        Uploading...
                    </>
                ) : (
                    "Publish Video"
                )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}