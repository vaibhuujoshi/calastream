// frontend/src/components/history/HistoryVideoCard.tsx
import { useNavigate } from "react-router-dom";
import type { HistoryItem } from "../../api/history";

interface HistoryVideoCardProps {
    item: HistoryItem;
    onRemove: (videoId: string) => void;
}

export function HistoryVideoCard({ item, onRemove }: HistoryVideoCardProps) {
    const navigate = useNavigate();

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(item.id);
    };

    return (
        <div 
            onClick={() => navigate(`/watch/${item.id}`)}
            className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors cursor-pointer group relative"
        >
            {/* Thumbnail */}
            <div className="w-full sm:w-60 md:w-[320px] aspect-video bg-[#111] rounded-lg overflow-hidden shrink-0 relative">
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    14:20
                </span>
            </div>

            {/* Details */}
            <div className="flex flex-col flex-1 py-1 pr-8">
                <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
                    {item.title}
                </h3>
                
                <div className="text-sm text-zinc-400 mb-2 flex items-center gap-1">
                    <span className="hover:text-white transition-colors" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/channel/${item.user.id}`);
                    }}>
                        {item.user.channelName}
                    </span>
                    <span>•</span>
                    <span>{Math.floor(Math.random() * 50) + 1}K views</span>
                </div>

                <p className="text-sm text-zinc-500 line-clamp-2 hidden sm:block">
                    {item.description}
                </p>
            </div>

            {/* Remove Action Button */}
            <button 
                onClick={handleRemove}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                title="Remove from watch history"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}