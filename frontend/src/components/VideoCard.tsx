import { useNavigate } from "react-router-dom";
import { type VideoData, formatSubscribers } from "../lib/mockData";
import { formatDate } from "../lib/formatData";

interface VideoCardProps {
  video: VideoData;
}

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 group">

      {/* Top Section: Video Thumbnail */}
      <div
        onClick={() => navigate(`/watch/${video.id}`)}
        className="w-full aspect-video bg-[#111] border border-[#1A1A1A] group-hover:border-[#333] rounded-xl overflow-hidden cursor-pointer relative transition-colors"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Mock Duration Badge */}
        <span className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded font-medium tracking-wide">
          14:20
        </span>
      </div>

      {/* Bottom Section: Avatar & Meta Data */}
      <div className="flex items-start gap-3">

        {/* Creator Avatar */}
        {/* <img 
          src={video.user.profilePicture} 
          alt={video.user.channelName} 
          onClick={() => navigate(`/channel/${video.user.id}`)}
          className="w-9 h-9 rounded-full object-cover mt-1 cursor-pointer border border-[#222] hover:border-purple-500 transition-colors shrink-0"
        /> */}
        <div className="w-9 h-9 rounded-full overflow-hidden mt-1 cursor-pointer border border-[#222] hover:border-purple-500 transition-colors shrink-0">
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

        {/* Video Text Details */}
        <div className="flex flex-col overflow-hidden">

          {/* Title */}
          <h3
            onClick={() => navigate(`/watch/${video.id}`)}
            className="text-base font-semibold text-white leading-tight line-clamp-2 cursor-pointer group-hover:text-purple-400 transition-colors"
          >
            {video.title}
          </h3>

          {/* Channel Name */}
          <div
            onClick={() => navigate(`/channel/${video.user.id}`)}
            className="text-sm text-zinc-400 mt-1.5 hover:text-white cursor-pointer transition-colors"
          >
            {video.user.channelName}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5 font-medium">
            <span>{formatSubscribers(video.user.subscriberCount)} views</span>
            <span className="text-[10px]">•</span>
            <span>{formatDate(video.createdAt)} ago</span>
          </div>

        </div>
      </div>

    </div>
  );
}