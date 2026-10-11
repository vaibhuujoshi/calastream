import { useNavigate } from 'react-router-dom';
import { type WatchVideo } from '../../api/videos';

interface SuggestedVideosProps {
  videos: WatchVideo[];
  lastElementRef?: (node: HTMLDivElement | null) => void;
  isLoadingMore?: boolean;
}

// Helper to prevent view counts from rapidly changing during re-renders
const getDeterministicViews = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 900) + 100;
};

export function SuggestedVideos({ videos, lastElementRef, isLoadingMore }: SuggestedVideosProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video, index) => {
        const isLastElement = index === videos.length - 1;
        const mockViews = getDeterministicViews(video.id);

        return (
          <div
            key={video.id}
            ref={isLastElement ? lastElementRef : null}
            className="flex gap-2 cursor-pointer group"
          >
            <div
              className="w-40 h-22.5 shrink-0 rounded-xl overflow-hidden relative bg-[#111] border border-transparent group-hover:border-[#444] transition-colors duration-200"
              onClick={() => navigate(`/watch/${video.id}`)}
            >
              <div className="group overflow-hidden rounded-lg">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ease-in-out group-hover:saturate-50"
                />
              </div>
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">12:34</span>
            </div>

            <div className="flex flex-col py-1">
              <h4
                onClick={() => navigate(`/watch/${video.id}`)}
                className="text-sm text-white font-medium leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors"
              >
                {video.title}
              </h4>

              <span
                onClick={(e) => {
                  e.stopPropagation(); // Prevents clicking the channel name from triggering the video container click
                  navigate(`/channel/${video.user.id}`);
                }}
                className="text-sm text-zinc-400 mt-1.5 hover:text-white cursor-pointer transition-colors"
              >
                {video.user.channelName}
              </span>

              <span className="text-xs text-zinc-500">
                {mockViews}K views
              </span>
            </div>
          </div>
        );
      })}

      {isLoadingMore && (
        <div className="w-full flex justify-center py-4">
          <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}