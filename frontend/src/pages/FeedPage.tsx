import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { VideoCard } from "../components/VideoCard";
import AuthCard from "../components/auth/AuthCard";
import AuthModal from "../components/auth/AuthModal";
import { Navbar } from "../components/Navbar";
import { getVideos } from "../api/videos";
import { useUserStore, type ClientUserProfile } from "../store/useUserStore";
import { getUserProfile } from "../api/auth";
import VideoCardSkeleton from "../components/skeletons/VideoCardSkeleton";

export function FeedPage() {
    const [MOCK_VIDEOS, SET_MOCKVIDEOS] = useState([]);
    // const [isLoadingVideos, setIsLoadingVideos] = useState(true);
    
    const user = useUserStore((state) => state.user);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const isInitializing = useUserStore((state) => state.isInitializing);
    const setUser = useUserStore((state) => state.setUser);
    const setInitializing = useUserStore((state) => state.setInitializing);
    const logout = useUserStore((state) => state.logout);

    // Effect 1: Handle User Profile Recovery Sync on Mount
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
            .catch(() => {
                // Token cookie missing or expired, clear client fallback states quietly
                logout();
            })
            .finally(() => {
                setInitializing(false);
            });
    }, [setUser, logout, setInitializing]);

    // Effect 2: Load Video Feed content items
    useEffect(() => {
        // setIsLoadingVideos(true);
        getVideos()
            .then(res => {
                SET_MOCKVIDEOS(res || []);
                // setIsLoadingVideos(false);
            })
            .catch(() => {
                // setIsLoadingVideos(false);
            });
    }, []);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

    // Prevent interface rendering while looking up app-mounting cookie validation statuses
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
            <Navbar
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            <div className="pt-16 flex relative">
                {!isSidebarCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                <Sidebar isCollapsed={isSidebarCollapsed} />

                <main className={`flex-1 p-4 md:p-6 transition-all duration-300 w-full ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-60'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-x-4 gap-y-10">
                        {MOCK_VIDEOS.length === 0
                            ? Array.from({ length: 8 }).map((_, index) => (
                                  <VideoCardSkeleton key={`skeleton-${index}`} />
                              ))
                            : MOCK_VIDEOS.map((video) => (
                                  <VideoCard key={video.id} video={video} />
                              ))}
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