// pages/UploadPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "../api/videos";
import { toast } from "sonner";
import { VideoDropzone } from "../components/upload/VideoDropzone";

const BASE_URL = "http://localhost:3000/api/v1";

export default function UploadPage() {
  const navigate = useNavigate();

  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "fetching" | "uploading" | "success" | "error">("idle");

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${BASE_URL}/profile`, { method: "GET", credentials: "include" });
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
      const response = await fetch(`${BASE_URL}/getPresignedUploadUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to secure upload route");
      const { putUrl, videoPath } = await response.json();

      setUploadStatus("uploading");
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
    if (!title) return toast.warning("Please provide a video title");
    if (!videoUrl) return toast.warning("Please wait for the video to finish uploading");

    toast.promise(
      uploadVideo(videoUrl, thumbnail, title, description),
      {
        loading: 'Publishing your video...',
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
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-8 lg:p-12 relative font-sans">
      
      {/* Ambient Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-[#0A0A0A]/80 backdrop-blur-2xl border border-zinc-800/80 rounded-[2rem] p-6 md:p-10 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Upload Video
          </h1>
          <p className="text-sm text-zinc-400">
            Configure your video details and publish it to your channel.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10">
          
          {/* Left Column: Dropzone */}
          <div className="md:col-span-2 flex flex-col">
            <VideoDropzone 
              onFileSelect={handleFileSelected}
              isUploading={isUploading}
              uploadStatus={uploadStatus}
              fileName={fileName}
              hasVideoUrl={!!videoUrl}
            />
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-3 flex flex-col gap-6">
            
            {/* REMOVED disabled={isUploading} from these inputs */}
            <FormInput 
              label="Title (Required)"
              value={title}
              onChange={setTitle}
              placeholder="Give your video a catchy title"
            />

            <FormInput 
              label="Thumbnail URL"
              value={thumbnail}
              onChange={setThumbnail}
              placeholder="https://example.com/thumbnail.jpg"
            />

            <div className="flex flex-col gap-3 flex-1">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Tell viewers about your video..."
                className="w-full h-full min-h-[140px] resize-none px-4 py-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-all shadow-inner text-sm leading-relaxed"
              />
            </div>
            
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="mt-10 pt-6 border-t border-zinc-800/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors font-medium text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleFormSubmission}
            disabled={isUploading || !title || !videoUrl}
            className="w-full sm:w-auto min-w-[200px] bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-semibold py-3 px-8 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:shadow-none"
          >
            {isUploading ? "Uploading Video..." : "Publish Video"}
          </button>
        </div>

      </div>
    </div>
  );
}

// Reusable Input Component
function FormInput({ label, value, onChange, placeholder }: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-all shadow-inner text-sm"
      />
    </div>
  );
}