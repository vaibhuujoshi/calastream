import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { SuggestedVideos } from '../components/watch/SuggestedVideo';
import { getVideo, getVideos, type WatchVideo } from '../api/videos';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { VideoPlayer } from '../components/watch/VideoPlayer';
import { VideoInfo } from '../components/watch/VideoInfo';
import { VideoDescription } from '../components/watch/VideoDescription';
import { CommentsSection } from '../components/watch/CommentSection';
import AuthModal from '../components/auth/AuthModal';
import AuthCard from '../components/auth/AuthCard';
import WatchPageSkeleton from '../components/skeletons/WatchPageSkeleton';
import { recordWatchHistory } from '../api/history';

export default function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>();

  const [video, setVideo] = useState<WatchVideo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Pagination States for Suggested Videos
  const [suggested, setSuggested] = useState<WatchVideo[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Intersection Observer for Infinite Scrolling Suggested Videos
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSuggestedElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextCursor) {
        loadMoreSuggested();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, nextCursor]);

  // Initial Load
  useEffect(() => {
    async function loadData() {
      if (!videoId) return;
      setIsLoading(true);
      
      try {
        const [videoData, allVideosResponse] = await Promise.all([
          getVideo(videoId),
          getVideos()
        ]);

        setVideo(videoData);
        
        const videosArray = allVideosResponse.data || [];
        const filteredSuggestions = videosArray.filter((v) => v.id !== videoData.id);
        setSuggested(filteredSuggestions);
        setNextCursor(allVideosResponse.nextCursor || null);

        recordWatchHistory(videoId).catch((error) => {
          console.error("Silent history sync failed:", error);
        });

      } catch (error) {
        console.error("Failed to load video:", error);
        toast.error("Failed to load video data. Please try refreshing."); 
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [videoId]);

  // Action: Load Next Page of Suggestions
  async function loadMoreSuggested() {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const res = await getVideos(nextCursor);
      const newFiltered = (res.data || []).filter(v => v.id !== video?.id);
      setSuggested(prev => [...prev, ...newFiltered]);
      setNextCursor(res.nextCursor || null);
    } catch (error) {
      toast.error("Failed to load more suggested videos");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    // 1. Lock the outer container to screen height and hide default overflow
    <div className="h-screen bg-[#050505] text-white overflow-hidden antialiased">
      
      {/* Global Navigation Plate */}
      <Navbar
        onToggleSidebar={() => setIsMenuDrawerOpen(!isMenuDrawerOpen)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Slide-Over Overlay Menu System */}
      {isMenuDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsMenuDrawerOpen(false)}
        >
          <div
            className="w-60 h-full bg-[#050505] relative z-50 shadow-2xl border-r border-[#1A1A1A]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar isCollapsed={false} />
          </div>
        </div>
      )}

      {/* 2. Main Workspace Area: Handles its own scrolling with custom-scrollbar */}
      <main className="h-full w-full overflow-y-auto custom-scrollbar pt-24 pb-12 px-4 md:px-6 lg:px-8 relative">
        <div className="max-w-[1800px] mx-auto">
          {isLoading || !video ? (
            <WatchPageSkeleton />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">

              {/* Core Player, Meta, and Editorial Thread Column */}
              <div className="flex-1 w-full max-w-7xl">
                <VideoPlayer videoUrl={video.playbackUrl} thumbnail={video.thumbnail} />
                <VideoInfo video={video} />
                <VideoDescription video={video} />
                <CommentsSection />
              </div>

              {/* Sidebar Recommendation Stream Column */}
              {/* Adjusted sticky top spacing slightly since padding is now on the <main> tag */}
              <div className="w-full lg:w-100 xl:w-105 shrink-0 border-t lg:border-t-0 border-[#1A1A1A] pt-6 lg:pt-0 lg:sticky lg:top-2 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto custom-scrollbar pr-2">
                <SuggestedVideos 
                  videos={suggested} 
                  lastElementRef={lastSuggestedElementRef}
                  isLoadingMore={isLoadingMore}
                />
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Portal Account Verification Overlays */}
      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
          <AuthCard onSuccess={() => setIsAuthModalOpen(false)} />
        </AuthModal>
      )}

    </div>
  );
}