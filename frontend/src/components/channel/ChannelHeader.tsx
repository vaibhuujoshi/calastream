import { useState } from "react";
import { type WatchUser } from "../../api/videos";
import { formatSubscribers } from "../../lib/formatData";

interface ChannelHeaderProps {
  user: WatchUser;
}

export function ChannelHeader({ user }: ChannelHeaderProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  return (
    <div className="flex flex-col w-full mb-8">
      
      {/* 1. Banner Section */}
      <div className="w-full h-32 sm:h-48 lg:h-60 bg-zinc-900 rounded-2xl overflow-hidden relative border border-[#1A1A1A]">
        {user.banner ? (
          <img 
            src={user.banner} 
            alt={`${user.channelName} banner`} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-purple-900/40 via-[#111] to-[#050505]" />
        )}
      </div>

      {/* 2. Channel Info & Avatar Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center px-4 md:px-8 gap-4 md:gap-6 relative">
        
        {/* Overlapping Profile Picture */}
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-[#050505] bg-[#0A0A0A] overflow-hidden -mt-12 md:-mt-16 shrink-0 relative z-10 shadow-lg">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.channelName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-purple-900/50 flex items-center justify-center text-4xl font-bold text-purple-300 uppercase tracking-wider">
              {user.channelName.charAt(0)}
            </div>
          )}
        </div>

        {/* Text Details & Subscribe Button */}
        <div className="flex flex-col md:flex-row md:items-start justify-between w-full mt-2 md:mt-4 gap-4">
          
          <div className="flex flex-col max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {user.channelName}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 mt-1 font-medium">
              <span className="text-zinc-300">@{user.username}</span>
              <span className="text-zinc-600 text-[10px]">•</span>
              <span>{formatSubscribers(user.subscriberCount)} subscribers</span>
            </div>

            {/* Expandable Description */}
            {user.description && (
              <div className="mt-3 text-sm text-zinc-400">
                <p className={`whitespace-pre-wrap leading-relaxed ${!isDescExpanded && 'line-clamp-2'}`}>
                  {user.description}
                </p>
                {user.description.length > 90 && (
                  <button 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-zinc-300 hover:text-purple-400 font-semibold mt-1 focus:outline-none transition-colors text-xs uppercase tracking-wide cursor-pointer"
                  >
                    {isDescExpanded ? "Show less" : "...more"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Subscribe Button */}
          <button className="bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all shrink-0 h-fit mt-2 md:mt-0 shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer active:scale-95">
            Subscribe
          </button>

        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="w-full h-px bg-[#1A1A1A] mt-8" />
    </div>
  );
}