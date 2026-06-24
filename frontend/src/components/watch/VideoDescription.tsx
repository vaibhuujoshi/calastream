import { useState } from 'react';
import { type WatchVideo } from '../../api/videos';
import { formatDate } from '../../lib/formatData';

export function VideoDescription({ video }: { video: WatchVideo }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`mt-4 bg-[#1A1A1A] rounded-xl p-4 cursor-pointer hover:bg-[#222] transition-colors ${isExpanded ? '' : 'h-24 overflow-hidden relative'}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="text-sm text-white font-medium mb-1">
        1.2M views • {formatDate(video.createdAt)} ago
      </div>
      <p className="text-sm text-zinc-300 whitespace-pre-wrap">
        {video.description}
      </p>
      
      {!isExpanded && (
        <div className="absolute bottom-0 right-0 left-0 h-10 bg-linear-to-t from-[#1A1A1A] to-transparent flex items-end px-4 pb-1">
          <span className="text-white font-bold text-sm bg-[#1A1A1A] px-1 rounded">...more</span>
        </div>
      )}
      {isExpanded && (
        <div className="mt-4">
          <span className="text-white font-bold text-sm hover:underline">Show less</span>
        </div>
      )}
    </div>
  );
}