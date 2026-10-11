import { useEffect, useState, useRef, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import AuthModal from "../components/auth/AuthModal";
import AuthCard from "../components/auth/AuthCard";
import { HistoryVideoCard } from "../components/history/HistoryVideoCard";
import HistoryPageSkeleton from "../components/skeletons/HistoryPageSkeleton";
import { getWatchHistory, clearWatchHistory, removeHistoryItem, type HistoryItem } from "../api/history";
import { toast } from "sonner";

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // 1. Stable Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading || isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && nextCursor) {
                loadMoreHistory();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoading, isLoadingMore, nextCursor]);

    // 2. Debounced Resize Listener
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

    useEffect(() => {
        loadInitialHistory();
    }, []);

    async function loadInitialHistory() {
        setIsLoading(true);
        try {
            const res = await getWatchHistory();
            setHistory(res.data);
            setNextCursor(res.nextCursor);
        } catch (error) {
            toast.error("Failed to load history.");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadMoreHistory() {
        if (!nextCursor) return;
        setIsLoadingMore(true);
        try {
            const res = await getWatchHistory(nextCursor);
            setHistory(prev => [...prev, ...res.data]);
            setNextCursor(res.nextCursor);
        } catch (error) {
            toast.error("Failed to load more videos.");
        } finally {
            setIsLoadingMore(false);
        }
    }

    async function handleRemoveItem(videoId: string) {
        setHistory(prev => prev.filter(item => item.id !== videoId));
        try {
            await removeHistoryItem(videoId);
            toast.success("Removed from history");
        } catch (error) {
            toast.error("Failed to remove item");
            loadInitialHistory(); 
        }
    }

    function handleClearHistory() {
        if (history.length === 0) return;
        toast.promise(clearWatchHistory(), {
            loading: 'Clearing your watch history...',
            success: () => {
                setHistory([]);
                setNextCursor(null);
                return 'History cleared successfully';
            },
            error: 'Failed to clear history.',
        });
    }

    const groupedHistory = history.reduce((groups, item) => {
        const date = new Date(item.watchedAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        
        if (date.toDateString() === today.toDateString()) {
            dateString = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateString = "Yesterday";
        }

        if (!groups[dateString]) groups[dateString] = [];
        groups[dateString].push(item);
        return groups;
    }, {} as Record<string, HistoryItem[]>);

    return (
        // 1. App Shell Layout: Locked screen height to prevent double scrollbars
        <div className="h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col antialiased">
            <Navbar 
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                onOpenAuth={() => setIsAuthModalOpen(true)} 
            />

            <div className="flex-1 flex overflow-hidden pt-16 relative w-full">
                
                {/* Mobile Sidebar Overlay */}
                {!isSidebarCollapsed && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-30 sm:hidden backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsSidebarCollapsed(true)} 
                    />
                )}
                
                <Sidebar isCollapsed={isSidebarCollapsed} />

                {/* 2. Main Workspace: Handles internal scrolling with the custom scrollbar */}
                <main className={`flex-1 transition-all duration-300 w-full overflow-y-auto custom-scrollbar flex flex-col ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-60'}`}>
                    
                    {/* Fixed max-w-250 to standard max-w-5xl for proper fluid constraints */}
                    <div className="max-w-5xl w-full mx-auto pb-12 pt-6 px-4 md:px-6 lg:px-8">
                        
                        {!isLoading && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-white">Watch History</h1>
                                </div>
                                {history.length > 0 && (
                                    <button 
                                        onClick={handleClearHistory} 
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-full transition-all text-sm font-medium active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Clear all watch history
                                    </button>
                                )}
                            </div>
                        )}

                        {isLoading ? (
                            <HistoryPageSkeleton />
                        ) : history.length > 0 ? (
                            <div className="flex flex-col gap-8 pb-20">
                                {Object.entries(groupedHistory).map(([dateLabel, items]) => (
                                    <div key={dateLabel}>
                                        <h2 className="text-lg font-bold text-white mb-4 pl-3">{dateLabel}</h2>
                                        <div className="flex flex-col gap-2">
                                            {items.map((item) => (
                                                <HistoryVideoCard 
                                                    key={item.historyId} 
                                                    item={item} 
                                                    onRemove={handleRemoveItem} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Pagination Trigger & Loader */}
                                <div ref={lastElementRef} className="h-10 w-full flex items-center justify-center mt-4">
                                    {isLoadingMore && (
                                        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                                <div className="w-20 h-20 mb-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shadow-xl">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-xl font-semibold text-white mb-2">Keep track of what you watch</p>
                                <p className="text-zinc-400">Watch history isn't viewable when signed out or cleared.</p>
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