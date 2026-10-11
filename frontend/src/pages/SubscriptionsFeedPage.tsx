import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { VideoCard } from "../components/VideoCard";
import AuthCard from "../components/auth/AuthCard";
import AuthModal from "../components/auth/AuthModal";
import FeedSkeleton from "../components/skeletons/FeedSkeleton";
import LoadingScreen from "../components/LoadingScreen";
import { useUserStore, type ClientUserProfile } from "../store/useUserStore";
import { getUserProfile } from "../api/auth";
import { toast } from "sonner";
import { getSubscribedChannels, getSubscriptionFeed, type SubscribedChannel } from "../api/subscription";
import type { WatchVideo } from "../api/videos";
import { ChannelSlider } from "../components/subscription/ChannelSlider";

export default function SubscriptionsPage() {
    // Content States
    const [videos, setVideos] = useState<WatchVideo[]>([]);
    const [channels, setChannels] = useState<SubscribedChannel[]>([]);
    
    // Loading & Pagination States
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    // Global Auth Store
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const isInitializing = useUserStore((state) => state.isInitializing);
    const setUser = useUserStore((state) => state.setUser);
    const setInitializing = useUserStore((state) => state.setInitializing);
    const logout = useUserStore((state) => state.logout);

    // UI States
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // 1. Initial Authentication & Data Fetch
    useEffect(() => {
        getUserProfile()
            .then((profileData) => {
                if (profileData) {
                    const { id, ...clientProfile } = profileData;
                    setUser(clientProfile as ClientUserProfile);
                    fetchInitialData();
                } else {
                    logout();
                    setIsLoading(false);
                }
            })
            .catch(() => {
                logout();
                setIsLoading(false);
            })
            .finally(() => {
                setInitializing(false);
            });
    }, [setUser, logout, setInitializing]);

    async function fetchInitialData() {
        setIsLoading(true);
        try {
            const [feedRes, channelsRes] = await Promise.all([
                getSubscriptionFeed(null),
                getSubscribedChannels()
            ]);
            
            setVideos(feedRes.data || []);
            setNextCursor(feedRes.nextCursor || null);
            setChannels(channelsRes || []);
        } catch (error) {
            toast.error("Failed to load subscriptions");
        } finally {
            setIsLoading(false);
        }
    }

    // 2. Stable Pagination Callback
    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoadingMore) return;
        
        setIsLoadingMore(true);
        try {
            const res = await getSubscriptionFeed(nextCursor);
            setVideos(prev => [...prev, ...res.data]);
            setNextCursor(res.nextCursor);
        } catch (error) {
            toast.error("Failed to load more videos");
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextCursor, isLoadingMore]);

    // 3. Stable Intersection Observer
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
        let timeoutId: ReturnType<typeof setTimeout>;
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

    // --- Main Render ---
    if (isInitializing) return <LoadingScreen />;

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
                    
                    {/* Unified Container Wrapper: Ensures slider and grid share exact alignment */}
                    <div className="max-w-[2000px] w-full mx-auto pb-12 pt-6 px-4 md:px-6 lg:px-8 flex flex-col">
                        
                        {!isLoggedIn ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                                <div className="w-20 h-20 mb-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shadow-xl">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Don't miss new videos</h3>
                                <p className="text-zinc-400 mb-6">Sign in to see updates from your favorite channels</p>
                                <button 
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-transform active:scale-95"
                                >
                                    Sign In
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* 1. Channel Slider (Shows skeleton if loading, actual slider if channels exist) */}
                                {(isLoading || channels.length > 0) && (
                                    <div className="w-full">
                                        <ChannelSlider isLoading={isLoading} channels={channels} />
                                        
                                        {/* Subtle dividing line to separate the horizontal slider from the vertical feed */}
                                        <div className="w-full h-px bg-zinc-800/60 mb-6 -mt-2"></div>
                                    </div>
                                )}

                                {/* 2. Video Grid / Skeleton / Empty State */}
                                {isLoading ? (
                                    <FeedSkeleton />
                                ) : videos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 mt-8">
                                        <div className="w-20 h-20 mb-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shadow-xl">
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Your feed is quiet</h3>
                                        <p className="text-zinc-400 max-w-md">Videos from channels you subscribe to will show up here.</p>
                                    </div>
                                ) : (
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
                                )}
                            </>
                        )}

                        {/* 3. Pagination Loading Spinner */}
                        {isLoadingMore && (
                            <div className="w-full flex justify-center py-8">
                                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        )}
                        
                    </div>
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