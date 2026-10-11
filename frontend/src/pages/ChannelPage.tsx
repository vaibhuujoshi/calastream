// frontend/src/pages/ChannelPage.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { VideoCard } from "../components/VideoCard";
import { ChannelHeader } from "../components/channel/ChannelHeader";
import { getChannelInfo, getChannelVideos, type WatchVideo, type WatchUser } from "../api/videos";
import AuthModal from "../components/auth/AuthModal";
import AuthCard from "../components/auth/AuthCard";
import ChannelPageSkeleton from "../components/skeletons/ChannelPageSkeleton";
import { toast } from "sonner";

export default function ChannelPage() {
    const { channelId } = useParams();

    // Data States
    const [videos, setVideos] = useState<WatchVideo[]>([]);
    const [channelInfo, setChannelInfo] = useState<WatchUser | null>(null);

    // Loading & Pagination States
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    // UI States
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // 1. Initial Data Fetch (Concurrent Profile & First Page)
    useEffect(() => {
        async function fetchInitialData() {
            if (!channelId) {
                setIsLoading(false);
                toast.error("Channel ID is missing");
                return;
            }

            setIsLoading(true);
            try {
                const [infoRes, videosRes] = await Promise.all([
                    getChannelInfo(channelId),
                    getChannelVideos(channelId, null)
                ]);
                
                setChannelInfo(infoRes);
                setVideos(videosRes.data || []);
                setNextCursor(videosRes.nextCursor || null);
            } catch (error) {
                console.error("Failed to load channel data", error);
                toast.error("Failed to load channel data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchInitialData();
    }, [channelId]);

    // 2. Stable Pagination Callback
    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoadingMore || !channelId) return;
        
        setIsLoadingMore(true);
        try {
            const res = await getChannelVideos(channelId, nextCursor);
            setVideos(prev => [...prev, ...res.data]);
            setNextCursor(res.nextCursor);
        } catch (error) {
            toast.error("Failed to load more videos");
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextCursor, isLoadingMore, channelId]);

    // 3. Stable Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastVideoElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading || isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && nextCursor) {
                loadMore();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoading, isLoadingMore, nextCursor, loadMore]);

    // 4. Debounced Resize Listener
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const isMobile = window.innerWidth < 640;
                if (isMobile && !isSidebarCollapsed) {
                    setIsSidebarCollapsed(true);
                } else if (!isMobile && isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                }
            }, 150);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [isSidebarCollapsed]);

    // 5. Flattened Content Render Helper
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="max-w-[2000px] w-full mx-auto pb-12 px-4 md:px-6 lg:px-8">
                    <ChannelPageSkeleton />
                </div>
            );
        }

        return (
            <div className="max-w-[2000px] w-full mx-auto pb-12 px-4 md:px-6 lg:px-8">
                
                {/* Channel Header */}
                {channelInfo && (
                    <div className="mb-6 md:mb-8 pt-4 md:pt-6">
                        <ChannelHeader user={channelInfo} />
                    </div>
                )}

                {/* Uploads Section */}
                <div className="border-t border-[#1A1A1A] pt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            Videos
                        </h3>
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            {videos.length} {nextCursor ? '+' : ''}
                        </span>
                    </div>

                    {videos.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
                                {videos.map((video, index) => (
                                    <div 
                                        key={video.id} 
                                        ref={index === videos.length - 1 ? lastVideoElementRef : null}
                                    >
                                        <VideoCard video={video} />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pagination Loading Spinner */}
                            {isLoadingMore && (
                                <div className="w-full flex justify-center py-8">
                                    <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-4 mt-4 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A]">
                            <div className="w-20 h-20 mb-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shadow-xl">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No videos available</h3>
                            <p className="text-zinc-400 max-w-sm">This channel hasn't uploaded any public videos yet. Check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
            <Navbar
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            <div className="flex-1 flex overflow-hidden pt-16 relative w-full">
                {!isSidebarCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                <Sidebar isCollapsed={isSidebarCollapsed} />

                <main className={`flex-1 transition-all duration-300 w-full overflow-y-auto custom-scrollbar flex flex-col ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-60'}`}>
                    {renderContent()}
                </main>
            </div>

            {isAuthModalOpen && (
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
                    <AuthCard onSuccess={() => setIsAuthModalOpen(false)} />
                </AuthModal>
            )}
        </div>
    );
}