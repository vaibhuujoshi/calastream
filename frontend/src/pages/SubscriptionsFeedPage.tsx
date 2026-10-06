// pages/SubscriptionsFeedPage.tsx
import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { VideoCard } from "../components/VideoCard";
import AuthCard from "../components/auth/AuthCard";
import AuthModal from "../components/auth/AuthModal";
import { Navbar } from "../components/Navbar";
import { useUserStore, type ClientUserProfile } from "../store/useUserStore";
import { getUserProfile } from "../api/auth";
import VideoCardSkeleton from "../components/skeletons/VideoCardSkeleton";
import LoadingScreen from "../components/LoadingScreen";
import { ChannelSlider, type SubscribedChannel } from "../components/subscription/ChannelSlider";
// Assuming you create this API function to hit the `/feed` route we built earlier
import { getSubscriptionFeed } from "../api/subscription";

export function SubscriptionsFeedPage() {
    const [channels, setChannels] = useState<SubscribedChannel[]>([]);
    const [videos, setVideos] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

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

    // Sidebar Responsive Logic
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

    // Auth Initialization Logic
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

    // Fetch Subscriptions Feed Data
    useEffect(() => {
        if (!isLoggedIn && !isInitializing) {
            setIsLoadingData(false);
            return;
        }

        setIsLoadingData(true);
        getSubscriptionFeed()
            .then((res) => {
                setChannels(res?.channels || []);
                setVideos(res?.videos || []);
            })
            .catch(console.error)
            .finally(() => setIsLoadingData(false));
    }, [isLoggedIn, isInitializing]);

    // Prevent rendering while restoring auth context
    if (isInitializing) {
        return <LoadingScreen />;
    }

    // Require Auth for this specific page
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center">
                <Navbar onToggleSidebar={() => {}} onOpenAuth={() => setIsAuthModalOpen(true)} />
                <div className="flex flex-col items-center gap-4 text-center mt-16 px-4">
                    <h2 className="text-2xl font-bold">Don't miss new videos</h2>
                    <p className="text-zinc-400">Sign in to see updates from your favorite YouTube channels</p>
                    <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="mt-4 bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:bg-zinc-200 transition"
                    >
                        Sign In
                    </button>
                </div>
                {isAuthModalOpen && (
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
                        <AuthCard onSuccess={() => setIsAuthModalOpen(false)} />
                    </AuthModal>
                )}
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
                {/* Mobile Sidebar Overlay */}
                {!isSidebarCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                <Sidebar isCollapsed={isSidebarCollapsed} />

                <main className={`flex-1 p-4 md:p-6 transition-all duration-300 w-full ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-60'}`}>
                    
                    {/* Independent Channel Slider Component */}
                    <ChannelSlider channels={channels} isLoading={isLoadingData} />

                    {/* Videos Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-x-4 gap-y-10">
                        {isLoadingData
                            ? Array.from({ length: 8 }).map((_, index) => (
                                <VideoCardSkeleton key={`skeleton-${index}`} />
                            ))
                            : videos.length > 0 
                                ? videos.map((video: any) => (
                                    <VideoCard key={video.id} video={video} />
                                ))
                                : (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                        <p className="text-zinc-500 text-lg">No recent videos from your subscriptions.</p>
                                    </div>
                                )
                        }
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