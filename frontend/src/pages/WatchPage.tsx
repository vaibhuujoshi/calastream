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

export default function WatchPage() {
  // Extract videoId matching the route /watch/:videoId
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  
  const [video, setVideo] = useState<WatchVideo | null>(null);
  const [suggested, setSuggested] = useState<WatchVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch the current video and the global feed simultaneously using videoId
        const [videoData, allVideosData] = await Promise.all([
          getVideo(videoId || ""),
          getVideos()
        ]);
        
        setVideo(videoData);
        
        // Filter out the video we are currently watching from the suggestions list
        const filteredSuggestions = allVideosData.filter((v) => v.id !== videoData.id);
        setSuggested(filteredSuggestions);
        
      } catch (error) {
        console.error("Failed to load video data", error);
        // Optional: navigate to a 404 or show an error state if the video doesn't exist
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only attempt to load if videoId exists
    if (videoId) {
      loadData();
    }
  }, [videoId]); // Re-run this effect if the user clicks a suggested video and the URL changes

  if (isLoading || !video) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        isLoggedIn={true} 
        onOpenAuth={() => {}} 
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="w-60 h-full" onClick={e => e.stopPropagation()}>
            <Sidebar isCollapsed={false} />
          </div>
        </div>
      )}

      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto pb-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          <div className="flex-1 max-w-300">
            <VideoPlayer videoUrl={video.videoUrl} thumbnail={video.thumbnail} />
            <VideoInfo video={video} />
            <VideoDescription video={video} />
            <CommentsSection />
          </div>

          <div className="w-full lg:w-100 shrink-0">
            {/* The SuggestedVideos component now receives the real API data */}
            <SuggestedVideos videos={suggested} />
          </div>

        </div>
      </div>
    </div>
  );
}