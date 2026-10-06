import { useNavigate } from 'react-router-dom';
import { type WatchVideo } from '../../api/videos';
import { SubscribeButton } from '../SubscribeButton';
import { useState } from 'react';
import { toast } from 'sonner'; // 1. Import toast from sonner

interface VideoHeaderProps {
  video: WatchVideo;
  initialIsSubscribed?: boolean;
}

export function VideoInfo({ video, initialIsSubscribed = false }: VideoHeaderProps) {
  const navigate = useNavigate();

  // Number Formatter
  const formatCompactNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  // Subscription State
  const [headerSubCount, setHeaderSubCount] = useState<number>(video.user.subscriberCount);
  const handleSubscribeChange = (newSubStatus: boolean) => {
    setHeaderSubCount((prev) => (newSubStatus ? prev + 1 : Math.max(0, prev - 1)));
  };

  // Like & Dislike Interaction States
  const [isLiked, setIsLiked] = useState<boolean>(video.isLiked || false);
  const [isDisliked, setIsDisliked] = useState<boolean>(video.isDisliked || false);

  // Toggle Like Interaction
  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
      if (isDisliked) {
        setIsDisliked(false);
      }
    }
    // TODO: Trigger API Call to save like status to the database here
  };

  // Toggle Dislike Interaction
  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
      }
    }
    // TODO: Trigger API Call to save dislike status to the database here
  };

  // 2. Add the Share Handler
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
        {video.title}
      </h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Channel Info */}
        <div className="flex items-center gap-4">
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
          <div className="flex flex-col">
            <span
              onClick={() => navigate(`/channel/${video.user.id}`)}
              className="text-base font-semibold text-white leading-tight line-clamp-2 hover:text-gray-400 cursor-pointer transition-colors"
            >
              {video.user.channelName}
            </span>
            <span className="text-zinc-400 text-xs">{formatCompactNumber(headerSubCount)} Subscribers</span>
          </div>
          <SubscribeButton
            channelId={video.user.id}
            initialIsSubscribed={initialIsSubscribed}
            onSubscribeChange={handleSubscribeChange}
            className="mt-2 md:mt-0"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="flex items-center bg-[#1A1A1A] rounded-full overflow-hidden shrink-0 border border-[#222]">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center cursor-pointer justify-center px-4 py-2 hover:bg-[#2A2A2A] transition border-r border-[#333] ${isLiked ? 'text-purple-500' : 'text-white'}`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>

            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className={`flex items-center cursor-pointer justify-center px-4 py-2 hover:bg-[#2A2A2A] transition ${isDisliked ? 'text-purple-500' : 'text-white'}`}
            >
              <svg
                className="w-5 h-5 transform rotate-180"
                fill={isDisliked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
          </div>

          {/* 3. Attach onClick handler to the Share button */}
          <button
            onClick={handleShare}
            className="flex items-center cursor-pointer gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition text-sm font-medium shrink-0 border border-[#222]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
          <button className="flex items-center cursor-pointer gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition text-sm font-medium shrink-0 border border-[#222]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </button>
          <button className="bg-[#1A1A1A] text-white cursor-pointer p-2 rounded-full hover:bg-[#2A2A2A] transition shrink-0 border border-[#222]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}