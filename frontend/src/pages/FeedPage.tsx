import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { VideoCard } from "../components/VideoCard";
// import { MOCK_VIDEOS } from "../lib/mockData";
import AuthCard from "../components/auth/AuthCard";
import AuthModal from "../components/auth/AuthModal";
import { Navbar } from "../components/Navbar";
import { getVideos } from "../api/videos";

export function FeedPage() {
    const [MOCK_VIDEOS, SET_MOCKVIDEOS] = useState([]);
    useEffect(() => {
        getVideos().then(res => {
            SET_MOCKVIDEOS(res || []);
            console.log(res)
        });
    }, []);
    // Check if it's mobile on mount to start collapsed
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Optional: Automatically close mobile sidebar when window is resized to desktop
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

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">

            <Navbar
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isLoggedIn={isLoggedIn}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                currentUser={isLoggedIn ? MOCK_VIDEOS[0].user : undefined}
            />

            <div className="pt-16 flex relative">

                {/* Mobile Backdrop Overlay - Only visible on small screens when sidebar is open */}
                {!isSidebarCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarCollapsed(true)}
                    />
                )}

                <Sidebar isCollapsed={isSidebarCollapsed} />

                <main
                    className={`flex-1 p-4 md:p-6 transition-all duration-300 w-full ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-60'
                        }`}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-x-4 gap-y-10">
                        {MOCK_VIDEOS.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                </main>

            </div>

            {/* Auth Modal Portal Placeholder */}
            {isAuthModalOpen && (
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
                    <AuthCard
                        onSuccess={() => {
                            setIsLoggedIn(true);
                            setIsAuthModalOpen(false);
                        }}
                    />
                </AuthModal>
            )}

        </div>
    );
}