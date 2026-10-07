import { useNavigate } from "react-router-dom";
import { type VideoData } from "../lib/mockData";
import { formatDate } from "../lib/formatData";
import { toast } from "sonner";

interface VideoCardProps {
  video: VideoData;
}

const getDeterministicViews = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 1500) + 120;
};

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoUrl = `${window.location.origin}/watch/${video.id}`;

    navigator.clipboard.writeText(videoUrl)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const mockViews = getDeterministicViews(video.id);

  return (
    <div className="flex flex-col gap-3 group">

      {/* Top Section: Video Thumbnail */}
      <div
        onClick={() => navigate(`/watch/${video.id}`)}
        className="w-full aspect-video group bg-[#111] border border-[#1A1A1A] group-hover:border-[#444] rounded-xl overflow-hidden cursor-pointer relative transition-colors duration-200"
      >
        <div className="group overflow-hidden rounded-lg">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ease-in-out group-hover:saturate-50"
          />
        </div>

        <span className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded font-medium tracking-wide">
          14:20
        </span>

        <button
          onClick={handleShare}
          className="absolute top-2 right-2 cursor-pointer bg-black/80 hover:bg-black text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
          title="Copy link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Bottom Section: Avatar & Meta Data */}
      <div className="flex items-start gap-3">
        <div
          onClick={() => navigate(`/channel/${video.user.id}`)}
          className="w-9 h-9 rounded-full overflow-hidden mt-1 cursor-pointer border border-[#222] hover:border-purple-500 transition-colors shrink-0">
          {video.user.profilePicture ? (
            <img
              src={video.user.profilePicture}
              alt={video.user.channelName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-purple-900/50 flex items-center justify-center text-sm font-bold text-purple-300 uppercase tracking-wider">
              {video.user.channelName?.charAt(0) || "?"}
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-hidden">
          <h3
            onClick={() => navigate(`/watch/${video.id}`)}
            className="text-base font-semibold text-white leading-tight line-clamp-2 cursor-pointer group-hover:text-purple-400 transition-colors"
          >
            {video.title}
          </h3>

          <div
            onClick={() => navigate(`/channel/${video.user.id}`)}
            className="text-sm text-zinc-400 mt-1.5 hover:text-white cursor-pointer transition-colors"
          >
            {video.user.channelName}
          </div>

          <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5 font-medium">
            <span>{mockViews} views</span>
            <span className="text-[10px]">•</span>
            <span>{formatDate(video.createdAt)} ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}