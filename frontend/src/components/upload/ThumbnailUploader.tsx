import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadThumbnail } from "../../api/thumbnail";

interface ThumbnailUploaderProps {
    onUploadSuccess: (thumbnailUrl: string) => void;
}

export default function ThumbnailUploader({ onUploadSuccess }: ThumbnailUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            return toast.error("Please select a valid image file (PNG, JPG, WebP)");
        }
        if (file.size > 5 * 1024 * 1024) {
            return toast.error("Thumbnail must be less than 5MB");
        }

        setPreviewUrl(URL.createObjectURL(file));
        setIsUploading(true);

        try {
            // Call our clean API function
            const secureUrl = await uploadThumbnail(file);
            
            onUploadSuccess(secureUrl);
            toast.success("Thumbnail uploaded successfully!");

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Thumbnail upload failed");
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Thumbnail
            </label>
            
            <div 
                className={`relative w-full aspect-video rounded-xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center cursor-pointer group ${
                    isUploading ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-700 hover:border-purple-500 bg-zinc-900/30 hover:bg-zinc-900/80'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                />

                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                            <p className="text-white font-medium flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Change Image
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-500 group-hover:text-purple-400 transition-colors p-6 text-center">
                        <div className="p-3 bg-zinc-900 rounded-full group-hover:bg-purple-500/10 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-300 mb-1">Upload thumbnail</p>
                            <p className="text-xs text-zinc-500">PNG, JPG or WebP (Max 5MB)</p>
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            <p className="text-sm font-medium text-purple-400 animate-pulse">Uploading...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}