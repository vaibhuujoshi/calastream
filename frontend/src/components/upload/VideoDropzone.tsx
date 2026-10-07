// components/upload/VideoDropzone.tsx
import { useState, useEffect, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadStatus: "idle" | "fetching" | "uploading" | "success" | "error";
  fileName: string;
  hasVideoUrl: boolean;
}

export function VideoDropzone({ 
  onFileSelect, 
  isUploading, 
  uploadStatus, 
  fileName, 
  hasVideoUrl 
}: VideoDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulated progress bar for better perceived UX
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading && uploadStatus === 'uploading') {
      interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + (Math.random() * 5) : p));
      }, 500);
    } else if (uploadStatus === 'success') {
      setProgress(100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isUploading, uploadStatus]);

  // Drag and Drop Handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "video/mp4") {
        onFileSelect(file);
      } else {
        toast.error("Please drop a valid MP4 video file.");
      }
    }
  };

  const handleInputSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const getContainerStyles = () => {
    if (hasVideoUrl) return 'border-emerald-500/40 bg-emerald-950/20';
    if (uploadStatus === 'error') return 'border-rose-500/40 bg-rose-950/20';
    if (isDragActive) return 'border-purple-400 bg-purple-900/20 scale-[1.02]';
    if (isUploading) return 'border-purple-500/40 bg-purple-950/10';
    return 'border-zinc-800 hover:border-purple-500/40 bg-zinc-900/50 hover:bg-zinc-900/80';
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Media Asset
      </label>
      
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl h-[320px] md:h-full min-h-[320px] flex flex-col items-center justify-center transition-all duration-300 ease-out group overflow-hidden ${getContainerStyles()}`}
      >
        <input
          type="file"
          accept="video/mp4"
          disabled={isUploading}
          onChange={handleInputSelect}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-30"
          title=""
        />

        {/* Upload Progress Bar Background Layer */}
        {isUploading && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-purple-500 transition-all duration-500 ease-out z-0"
            style={{ width: `${progress}%` }}
          />
        )}

        {/* State: IDLE */}
        {uploadStatus === "idle" && (
          <div className="text-center flex flex-col items-center gap-4 z-10 pointer-events-none">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 ${isDragActive ? 'bg-purple-500/20 border-purple-400 text-purple-300 scale-110' : 'bg-zinc-900 border-zinc-700 text-zinc-400 group-hover:text-purple-400 group-hover:border-purple-500/50 group-hover:bg-purple-500/10'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-4-4m4 4l4-4M4 4h16" />
              </svg>
            </div>
            <div>
              <div className="text-base text-zinc-200 font-medium mb-1">
                {isDragActive ? "Drop video here!" : "Drag & drop video"}
              </div>
              <div className="text-sm text-zinc-500">
                or <span className="text-purple-400 font-medium">browse files</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-mono text-zinc-500 mt-2">
              MP4 ONLY
            </div>
          </div>
        )}

        {/* State: UPLOADING */}
        {isUploading && (
          <div className="w-full max-w-xs text-center flex flex-col items-center gap-4 z-10">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full border-4 border-purple-500/20" />
              <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
              <div className="absolute text-xs font-bold text-purple-400">{Math.round(progress)}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-zinc-200 font-medium">
                {uploadStatus === "fetching" ? "Securing cloud lock..." : "Uploading to storage..."}
              </div>
              <div className="text-xs text-zinc-500 font-mono truncate max-w-[200px] mx-auto">
                {fileName}
              </div>
            </div>
          </div>
        )}

        {/* State: SUCCESS */}
        {uploadStatus === "success" && (
          <div className="text-center flex flex-col items-center gap-3 z-10">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <div className="text-sm text-emerald-400 font-semibold mb-1">Upload Complete!</div>
              <div className="text-xs text-zinc-500 font-mono truncate max-w-[200px] mx-auto">{fileName}</div>
            </div>
            <div className="text-xs text-zinc-400 font-medium hover:text-white mt-2 transition-colors relative z-40 pointer-events-none group-hover:pointer-events-auto">
              Click to replace
            </div>
          </div>
        )}

        {/* State: ERROR */}
        {uploadStatus === "error" && (
          <div className="text-center flex flex-col items-center gap-3 z-10">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div>
              <div className="text-sm text-rose-400 font-semibold mb-1">Upload Failed</div>
              <div className="text-xs text-zinc-500">Pipeline transmission error</div>
            </div>
            <div className="text-xs text-zinc-400 font-medium hover:text-white mt-2 transition-colors relative z-40 pointer-events-none group-hover:pointer-events-auto">
              Click to try again
            </div>
          </div>
        )}
      </div>
    </div>
  );
}