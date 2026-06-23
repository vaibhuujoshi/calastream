import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "../api/videos";

export default function UploadPage() {
  const navigate = useNavigate();

  // Core Form Input State
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  // UI Flow Status Indicators
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "fetching" | "uploading" | "success" | "error">("idle");

  // Multi-stage Binary Pre-signed Storage File Processor
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus("fetching");

    const BASE_URL = "http://localhost:3000/api/v1";

    try {
      // Step 1: Request pre-signed secure signature path from backend pipeline
      const response = await fetch(`${BASE_URL}/getPresignedUploadUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to clear cloud authorization route");
      
      const data = await response.json();
      const { putUrl, videoPath } = data;

      // Step 2: Stream raw binary stream directly to Object Cloud Storage bucket
      setUploadStatus("uploading");
      const uploadResponse = await fetch(putUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "video/mp4" },
      });

      if (uploadResponse.ok) {
        console.log("✅ Video payload routed successfully!");
        setVideoUrl(videoPath);
        setUploadStatus("success");
      } else {
        throw new Error("Cloud pipe transmission failure");
      }
    } catch (error) {
      console.error("❌ Process interrupted:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  }

  // Final Form Submit Trigger
  function handleFormSubmission() {
    if (!title || !videoUrl) return;

    uploadVideo(videoUrl, thumbnail, title, description)
      .then(() => {
        console.log("video uploaded");
        navigate('/');
      });
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-12 relative overflow-hidden font-sans select-none">
      
      {/* Immersive Deep-Purple Radial Atmosphere Ambient Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E"),
            radial-gradient(100% 100% at 50% 100%, #4c1d95 0%, #050505 80%)
          `,
          backgroundBlendMode: 'overlay, normal',
        }}
      />

      {/* Main Structural Layout Form Container Wrapper */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0C0C0C]/90 backdrop-blur-xl border border-[#1A1A1A] rounded-3xl p-6 md:p-10 shadow-[0px_40px_100px_0px_rgba(0,0,0,0.8)]">
        
        {/* Header Block Section */}
        <div className="mb-8 border-b border-[#1A1A1A] pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-5 bg-purple-500 rounded-xs" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Studio Upload
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Publish your high-fidelity content files straight to your global subscriber stream line ecosystem.
          </p>
        </div>

        {/* Input Interface Stack Grid */}
        <div className="space-y-6">
          
          {/* Row 1: Drag & Drop Interactive Media Loader Box */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Video File Asset
            </label>
            <div className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all group ${
              videoUrl ? 'border-emerald-500/40 bg-emerald-950/5' : 
              uploadStatus === 'error' ? 'border-rose-500/40 bg-rose-950/5' :
              isUploading ? 'border-purple-500/40 bg-purple-950/5' : 'border-[#222] hover:border-purple-500/40 bg-[#0F0F0F]'
            }`}>
              
              <input
                type="file"
                accept="video/mp4"
                disabled={isUploading}
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-30"
                aria-label="Upload raw video clip"
              />

              {/* Loader Dynamic View Rendering */}
              {uploadStatus === "idle" && (
                <div className="text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#161616] flex items-center justify-center border border-[#222] group-hover:text-purple-400 transition-colors">
                    <svg className="w-5 h-5 text-zinc-400 group-hover:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-4-4m4 4l4-4M4 4h16" />
                    </svg>
                  </div>
                  <div className="text-sm text-zinc-300 font-medium">
                    Drag and drop file here or <span className="text-purple-400 underline">browse</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">MP4 formats supported</div>
                </div>
              )}

              {isUploading && (
                <div className="w-full max-w-xs text-center flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                  <div className="text-sm text-zinc-300 font-medium">
                    {uploadStatus === "fetching" ? "Securing channel path lock..." : "Streaming bits to bucket..."}
                  </div>
                  <span className="text-xs text-zinc-500 font-mono truncate max-w-50">{fileName}</span>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    ✓
                  </div>
                  <div className="text-sm text-emerald-400 font-semibold">Video Synchronized Successfully!</div>
                  <span className="text-xs text-zinc-500 font-mono truncate max-w-62.5">{fileName}</span>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    ✕
                  </div>
                  <div className="text-sm text-rose-400 font-semibold">Transmission pipeline failure</div>
                  <button className="text-xs text-zinc-400 underline hover:text-white mt-1 z-40">Try again</button>
                </div>
              )}

            </div>
          </div>

          {/* Row 2: Title Field Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Video Stream Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Catchy descriptive headline name"
              className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#0F0F0F] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-colors text-sm"
            />
          </div>

          {/* Row 3: Thumbnail Asset Router String Link */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Thumbnail Cover Cover Source URL
            </label>
            <input
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://images.storage.com/cover-frame-placeholder.jpg"
              className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#0F0F0F] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-colors text-sm"
            />
          </div>

          {/* Row 4: Expandable Editorial Description Editor Area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Description Workspace Block
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide context markers, timeline index codes, links, and production notes..."
              className="w-full resize-none px-4 py-3.5 border border-[#222] rounded-lg bg-[#0F0F0F] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-colors text-sm leading-relaxed"
            />
          </div>

          {/* Row 5: Interaction Form Execution Triggers Panel */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            
            {/* Cancel Action */}
            <button
              onClick={() => navigate('/')}
              disabled={isUploading}
              className="w-full sm:w-auto px-6 py-3.5 text-zinc-400 hover:text-white rounded-lg border border-[#222] hover:bg-[#111] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>

            {/* Core Action Submit Button */}
            <button
              onClick={handleFormSubmission}
              disabled={isUploading || !title || !videoUrl}
              className="w-full sm:flex-1 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-semibold py-3.5 px-6 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed text-center shadow-[0px_4px_20px_rgba(255,255,255,0.05)]"
            >
              Finalize & Broadcast Video
            </button>
            
          </div>

        </div>

      </div>
    </div>
  );
}