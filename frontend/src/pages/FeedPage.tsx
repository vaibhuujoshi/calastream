import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { VideoCard } from "../components/VideoCard";
import AuthCard from "../components/auth/AuthCard";
import AuthModal from "../components/auth/AuthModal";
import { Navbar } from "../components/Navbar";
import { getVideos, type WatchVideo } from "../api/videos";
import { useUserStore, type ClientUserProfile } from "../store/useUserStore";
import { getUserProfile } from "../api/auth";
import LoadingScreen from "../components/LoadingScreen";
import { CategoryChips } from "../components/feed/CategoryChips";
import FeedSkeleton from "../components/skeletons/FeedSkeleton";
import { toast } from "sonner";

export function FeedPage() {
    const [videos, setVideos] = useState<WatchVideo[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");
    
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const user = useUserStore((state) => state.user);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const isInitializing = useUserStore((state) => state.isInitializing);
    const setUser = useUserStore((state) => state.setUser);
    const setInitializing = useUserStore((state) => state.setInitializing);
    const logout = useUserStore((state) => state.logout);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    }, [isLoading, isLoadingMore, nextCursor]);

    useEffect(() => {
        getUserProfile()
            .then((profileData) => {
                if (profileData) {
                    const { id, ...clientProfile } = profileData;
                    setUser(clientProfile as ClientUserProfile);
                } else {
                    logout();
                }
            })
            .catch(() => logout())
            .finally(() => setInitializing(false));
    }, [setUser, logout, setInitializing]);

    useEffect(() => {
        async function fetchInitial() {
            setIsLoading(true);
            try {
                const res = await getVideos(null, activeCategory);
                setVideos(res.data || []);
                setNextCursor(res.nextCursor || null);
            } catch (error) {
                toast.error("Failed to load feed");
            } finally {
                setIsLoading(false);
            }
        }
        
        setVideos([]);
        setNextCursor(null);
        fetchInitial();
    }, [activeCategory]);

    async function loadMore() {
        if (!nextCursor) return;
        setIsLoadingMore(true);
        try {
            const res = await getVideos(nextCursor, activeCategory);
            setVideos(prev => [...prev, ...res.data]);
            setNextCursor(res.nextCursor);
        } catch (error) {
            toast.error("Failed to load more videos");
        } finally {
            setIsLoadingMore(false);
        }
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640 && isSidebarCollapsed) {
                setIsSidebarCollapsed(false);
            } else if (window.innerWidth < 640 && !isSidebarCollapsed) {
                setIsSidebarCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarCollapsed]);

    if (isInitializing) {
        return <LoadingScreen />;
    }

    return (
        // 1. App Shell: Locked to screen height, no outer scrolling
        <div className="h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
            
            {/* Top Navigation */}
            <Navbar
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            {/* 2. Main Workspace: Takes remaining height, handles its own overflow */}
            <div className="flex-1 flex overflow-hidden pt-16 relative w-full">
                
                {!isSidebarCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                <Sidebar isCollapsed={isSidebarCollapsed} />

                {/* 3. Scrolling Container: custom-scrollbar applied here */}
                <main className={`flex-1 transition-all duration-300 w-full overflow-y-auto custom-scrollbar flex flex-col ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-60'}`}>
                    
                    <div className="sticky top-0 z-20">
                        <CategoryChips 
                            activeCategory={activeCategory} 
                            onSelect={setActiveCategory} 
                        />
                    </div>

                    <div className="max-w-[2000px] w-full mx-auto pb-12 pt-2">
                        {isLoading ? (
                            <FeedSkeleton />
                        ) : videos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10 px-4">
                                {videos.map((video, index) => (
                                    <div 
                                        key={video.id} 
                                        ref={index === videos.length - 1 ? lastVideoElementRef : null}
                                    >
                                        <VideoCard video={video} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                                <div className="w-20 h-20 mb-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
                                <p className="text-zinc-400">Try selecting a different category or check back later.</p>
                            </div>
                        )}

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