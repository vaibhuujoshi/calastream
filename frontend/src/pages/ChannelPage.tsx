import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { VideoCard } from "../components/VideoCard";
import { ChannelHeader } from "../components/channel/ChannelHeader";
import { getVideos, type WatchVideo, type WatchUser } from "../api/videos";
import AuthModal from "../components/auth/AuthModal";
import AuthCard from "../components/auth/AuthCard";

export default function ChannelPage() {
    // Extract channelId using searchParams (e.g. /channel?channelId=123)
    const { channelId } = useParams();

    const [channelVideos, setChannelVideos] = useState<WatchVideo[]>([]);
    const [channelInfo, setChannelInfo] = useState<WatchUser | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        async function loadChannelData() {
            if (!channelId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch all videos from the backend
                const allVideos = await getVideos();

                // Filter videos belonging ONLY to this specific channel ID
                const filteredVideos = allVideos.filter(video => video.user.id === channelId);
                setChannelVideos(filteredVideos);

                // Extract the user details from the first video to populate the header
                if (filteredVideos.length > 0) {
                    setChannelInfo(filteredVideos[0].user);
                } else {
                    // Fallback UI if the channel has 0 videos
                    setChannelInfo({
                        id: channelId,
                        channelName: "Verified Channel",
                        username: "creator",
                        gender: "OTHERS",
                        profilePicture: null,
                        banner: null,
                        subscriberCount: 0,
                        description: "No description available. Subscribe to get updates when new videos are posted.",
                    });
                }
            } catch (error) {
                console.error("Failed to load channel data", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadChannelData();
    }, [channelId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden antialiased">

            {/* 1. Global Navbar */}
            <Navbar
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            <div className="pt-16 flex relative w-full">

                {/* Mobile Backdrop Overlay for Sidebar */}
                {!isSidebarCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                {/* 2. Global Sidebar */}
                <Sidebar isCollapsed={isSidebarCollapsed} />

                {/* 3. Main Channel Content Area */}
                <main
                    className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 w-full ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-60'
                        }`}
                >
                    <div className="max-w-[1600px] mx-auto">

                        {/* Render Channel Header */}
                        {channelInfo && <ChannelHeader user={channelInfo} />}

                        {/* Video Grid Layout */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider">
                                Uploads
                            </h3>

                            {channelVideos.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-x-4 gap-y-10 mx-4">
                                    {channelVideos.map((video) => (
                                        <VideoCard key={video.id} video={video} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-[#1A1A1A] rounded-2xl bg-[#0A0A0A]/50">
                                    <svg className="w-16 h-16 mb-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    <p className="font-medium text-lg text-zinc-400">No videos available</p>
                                    <p className="text-sm mt-1">This channel hasn't uploaded any videos yet.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>

            {/* Render Auth Modal if triggered */}
            {isAuthModalOpen && (
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
                    <AuthCard onSuccess={() => setIsAuthModalOpen(false)} />
                </AuthModal>
            )}

        </div>
    );
}