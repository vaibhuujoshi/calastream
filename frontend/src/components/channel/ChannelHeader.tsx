import { useState } from "react";
import { type WatchUser } from "../../api/videos";
import { formatSubscribers } from "../../lib/formatData";
import { SubscribeButton } from "../SubscribeButton";

interface ChannelHeaderProps {
  user: WatchUser;
  // initialIsSubscribed?: boolean;
}

export function ChannelHeader({ user }: ChannelHeaderProps) {
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [headerSubCount, setHeaderSubCount] = useState<number>(user.subscriberCount);

  // Sync the visual count whenever the minimal button triggers an optimistic update or rollback
  const handleSubscribeChange = (newSubStatus: boolean) => {
    setHeaderSubCount((prev) => (newSubStatus ? prev + 1 : Math.max(0, prev - 1)));
  };

  return (
    <div className="flex flex-col w-full mb-8 relative select-none animate-fade-in">
      
      {/* 1. Banner Section */}
      <div className="w-full h-32 sm:h-48 lg:h-60 bg-zinc-900 rounded-2xl overflow-hidden relative border border-[#1A1A1A]">
        {user.banner ? (
          <img src={user.banner} alt={`${user.channelName} banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-purple-900/40 via-[#111] to-[#050505]" />
        )}
      </div>

      {/* 2. Channel Info & Avatar Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center px-4 md:px-8 gap-4 md:gap-6 relative">

        {/* Overlapping Profile Picture */}
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-[#050505] bg-[#0A0A0A] overflow-hidden -mt-12 md:-mt-16 shrink-0 relative z-10 shadow-lg">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.channelName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-purple-900/50 flex items-center justify-center text-4xl font-bold text-purple-300 uppercase tracking-wider">
              {user.channelName?.charAt(0) || "?"}
            </div>
          )}
        </div>

        {/* Text Details & Subscribe Component */}
        <div className="flex flex-col md:flex-row md:items-start justify-between w-full mt-2 md:mt-4 gap-4">

          <div className="flex flex-col max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {user.channelName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mt-1 font-medium">
              <span className="text-purple-400 hover:underline cursor-pointer font-semibold transition-all">
                @{user.username}
              </span>
              <span className="text-zinc-600 text-[10px]">•</span>
              <span className="text-zinc-300 tabular-nums">
                {formatSubscribers(headerSubCount)} subscribers
              </span>
            </div>

            {/* Expandable Description */}
            {user.description && (
              <div className="mt-3 text-sm text-zinc-400">
                <p className={`whitespace-pre-wrap leading-relaxed transition-all duration-300 ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
                  {user.description}
                </p>
                {user.description.length > 90 && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-purple-400/80 hover:text-purple-300 font-bold mt-1.5 focus:outline-none transition-colors text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1"
                  >
                    {isDescExpanded ? "Show less" : "Read more..."}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Minimal Standalone Button Integration */}
          <SubscribeButton
            channelId={user.id}
            // initialIsSubscribed={initialIsSubscribed}
            onSubscribeChange={handleSubscribeChange}
            className="mt-2 md:mt-0"
          />

        </div>
      </div>

      <div className="w-full h-px bg-[#1A1A1A] mt-8" />
    </div>
  );
}