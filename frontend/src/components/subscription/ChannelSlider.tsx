import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface SubscribedChannel {
    id: string;
    channelName: string;
    profilePicture: string | null;
}

interface ChannelSliderProps {
    channels: SubscribedChannel[];
    isLoading: boolean;
}

export function ChannelSlider({ channels, isLoading }: ChannelSliderProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    // Handle scroll arrow visibility based on scroll position
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    // Check initial arrow state on mount and channel load
    useEffect(() => {
        handleScroll();
    }, [channels]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = window.innerWidth < 768 ? 250 : 400;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="w-full mb-8 pt-4 pb-2">
                <div className="flex gap-4 sm:gap-6 overflow-hidden px-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={`skeleton-channel-${i}`} className="flex flex-col items-center gap-3 shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800/50 animate-pulse" />
                            <div className="w-14 h-3 bg-zinc-800/50 animate-pulse rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!channels || channels.length === 0) {
        return null;
    }

    return (
        <div className="w-full mb-8 relative group/slider">
            {/* Header / Label */}
            <div className="px-2 mb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">Subscriptions</h2>
            </div>

            <div className="relative">
                {/* Left Fade & Arrow */}
                <div 
                    className={`absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-[#050505] via-[#050505]/80 to-transparent z-10 flex items-center transition-opacity duration-300 pointer-events-none ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`}
                >
                    <button 
                        onClick={() => scroll("left")}
                        className="ml-2 pointer-events-auto p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white shadow-xl shadow-black/50 border border-zinc-700/50 backdrop-blur-md transform transition-all hover:scale-110 active:scale-95"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </button>
                </div>

                {/* Scrollable Container */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex items-center gap-4 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth w-full px-2 pb-2 pt-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {channels.map((channel) => (
                        <div 
                            key={channel.id} 
                            onClick={() => navigate(`/channel/${channel.id}`)}
                            className="flex flex-col items-center gap-2.5 shrink-0 cursor-pointer group/channel w-18 sm:w-22"
                        >
                            {/* Avatar Ring Container */}
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-transform duration-300 group-hover/channel:scale-105">
                                {/* Gradient Hover Border (Hidden by default, visible on hover) */}
                                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-purple-600 to-blue-500 opacity-0 group-hover/channel:opacity-100 transition-opacity duration-300 blur-[2px] -m-0.5" />
                                
                                {/* Image Wrapper */}
                                <div className="absolute inset-0 rounded-full border-[3px] border-[#050505] overflow-hidden bg-zinc-900 shadow-inner">
                                    {channel.profilePicture ? (
                                        <img 
                                            src={channel.profilePicture} 
                                            alt={channel.channelName} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-800 to-zinc-900 text-zinc-400 font-bold text-2xl uppercase">
                                            {channel.channelName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Truncated Channel Name */}
                            <span className="text-xs sm:text-sm font-medium text-zinc-400 group-hover/channel:text-white transition-colors truncate w-full text-center">
                                {channel.channelName}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right Fade & Arrow */}
                <div 
                    className={`absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-[#050505] via-[#050505]/80 to-transparent z-10 flex items-center justify-end transition-opacity duration-300 pointer-events-none ${showRightArrow ? 'opacity-100' : 'opacity-0'}`}
                >
                    <button 
                        onClick={() => scroll("right")}
                        className="mr-2 pointer-events-auto p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white shadow-xl shadow-black/50 border border-zinc-700/50 backdrop-blur-md transform transition-all hover:scale-110 active:scale-95 opacity-0 group-hover/slider:opacity-100"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </button>
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}