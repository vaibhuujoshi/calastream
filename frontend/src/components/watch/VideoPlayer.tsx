import { Plyr } from "plyr-react";
import "plyr-react/plyr.css";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail: string;
}

export function VideoPlayer({ videoUrl, thumbnail }: VideoPlayerProps) {
  const plyrProps = {
    source: {
      type: 'video' as const,
      sources: [{ src: videoUrl, type: 'video/mp4' }],
      poster: thumbnail,
    },
    options: {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
      theme: '#9333ea', // Match the purple theme
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group z-10">
      {/* Ambient Purple Glow Behind Video */}
      <div className="absolute inset-0 bg-linear-to-tr from-purple-900/40 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      {/* Ensure Plyr fills the container */}
      <div className="absolute inset-0 w-full h-full [&>.plyr]:h-full [&>.plyr]:w-full">
        <Plyr {...plyrProps} />
      </div>
    </div>
  );
}