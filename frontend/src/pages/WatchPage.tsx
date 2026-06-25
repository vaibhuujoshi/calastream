import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  // Core Data States
  const [video, setVideo] = useState<WatchVideo | null>(null);
  const [suggested, setSuggested] = useState<WatchVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Clean State Management: One unified boolean tracking if the slide-over drawer is active
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      if (!videoId) return;
      setIsLoading(true);
      try {
        const [videoData, allVideosData] = await Promise.all([
          getVideo(videoId),
          getVideos()
        ]);

        setVideo(videoData);

        // Filter currently playing asset out of recommended tracks list
        const filteredSuggestions = allVideosData.filter((v) => v.id !== videoData.id);
        setSuggested(filteredSuggestions);

      } catch (error) {
        console.error("Failed to load watch viewport connection stream:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [videoId]);

  if (isLoading || !video) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden antialiased">
      
      {/* 1. Global Navigation Plate */}
      <Navbar
        onToggleSidebar={() => setIsMenuDrawerOpen(!isMenuDrawerOpen)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 2. Slide-Over Overlay Menu System */}
      {/* This configuration keeps the view completely clean initially, floating above the player only when toggled */}
      {isMenuDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsMenuDrawerOpen(false)}
        >
          {/* Menu Panel Containment Frame */}
          <div 
            className="w-60 h-full bg-[#050505] relative z-50" 
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar isCollapsed={false} />
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      {/* The container uses standard structural values max-w-[1280px] and max-w-[420px] to match Tailwinds build engine */}
      <div className="pt-24 px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto pb-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* Core Player, Meta, and Editorial Thread Column */}
          <div className="flex-1 w-full max-w-7xl">
            <VideoPlayer videoUrl={video.videoUrl} thumbnail={video.thumbnail} />
            <VideoInfo video={video} />
            <VideoDescription video={video} />
            <CommentsSection />
          </div>

          {/* Sidebar Recommendation Stream Column */}
          <div className="w-full lg:w-100 xl:w-105 shrink-0 border-t lg:border-t-0 border-[#1A1A1A] pt-6 lg:pt-0">
            <SuggestedVideos videos={suggested} />
          </div>

        </div>
      </div>

      {/* 4. Portal Account Verification Overlays */}
      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
          <AuthCard onSuccess={() => setIsAuthModalOpen(false)} />
        </AuthModal>
      )}

    </div>
  );
}