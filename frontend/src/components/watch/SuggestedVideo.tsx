import { useNavigate } from 'react-router-dom';
import { type WatchVideo } from '../../api/videos';

export function SuggestedVideos({ videos }: { videos: WatchVideo[] }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video) => (
        <div
          key={video.id}
          className="flex gap-2 cursor-pointer group"
        >
          <div
            className="w-40 h-22.5 shrink-0 rounded-xl overflow-hidden relative bg-[#111]"
            onClick={() => navigate(`/watch/${video.id}`)} // Route to the new video
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">12:34</span>
          </div>
          <div className="flex flex-col py-1">
            <h4 className="text-sm text-white font-medium leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors">
              {video.title}
            </h4>
            <span
              onClick={() => navigate(`/channel/${video.user.id}`)}
              className="text-sm text-zinc-400 mt-1.5 hover:text-white cursor-pointer transition-colors"
            >
              {video.user.channelName}
            </span>
            <span className="text-xs text-zinc-500">
              {/* Mocking views since it's not in the Prisma schema yet */}
              {Math.floor(Math.random() * 900) + 100}K views
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}