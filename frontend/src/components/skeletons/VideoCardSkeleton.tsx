export default function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse w-full">
      {/* Top Section: Video Thumbnail */}
      <div className="w-full aspect-video bg-zinc-800 border border-[#1A1A1A] rounded-xl" />

      {/* Bottom Section: Avatar & Meta Data */}
      <div className="flex items-start gap-3">
        {/* Creator Avatar */}
        <div className="w-9 h-9 bg-zinc-800 rounded-full shrink-0 mt-1" />

        {/* Video Text Details */}
        <div className="flex flex-col w-full overflow-hidden">
          {/* Title Lines */}
          <div className="h-4 bg-zinc-800 rounded w-11/12 mt-1.5" />
          <div className="h-4 bg-zinc-800 rounded w-2/3 mt-2" />

          {/* Channel Name */}
          <div className="h-3 bg-zinc-800 rounded w-1/2 mt-3" />

          {/* Stats Row */}
          <div className="h-3 bg-zinc-800 rounded w-1/3 mt-2" />
        </div>
      </div>
    </div>
  );
}