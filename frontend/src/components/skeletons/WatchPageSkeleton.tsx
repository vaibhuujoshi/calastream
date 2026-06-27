export default function WatchPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full animate-pulse">
      
      {/* Left Column: Core Player, Meta, and Editorial Thread */}
      <div className="flex-1 w-full max-w-7xl">
        
        {/* 1. Video Player Placeholder */}
        <div className="w-full aspect-video bg-[#121212] rounded-xl border border-[#1A1A1A]" />

        {/* 2. Video Title Placeholder */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="h-7 sm:h-8 bg-[#121212] rounded-lg w-11/12 md:w-4/5" />
          <div className="h-7 sm:h-8 bg-[#121212] rounded-lg w-2/3 md:w-1/2" />
        </div>

        {/* 3. Channel Info & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#121212] rounded-full shrink-0" />
            {/* Channel Name & Subs */}
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-[#121212] rounded-md w-32" />
              <div className="h-3 bg-[#121212] rounded-md w-24" />
            </div>
            {/* Subscribe Button */}
            <div className="h-9 w-24 sm:w-32 bg-[#121212] rounded-full ml-2" />
          </div>
          
          {/* Action Buttons (Like, Share, etc.) */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-[#121212] rounded-full" />
            <div className="h-9 w-24 bg-[#121212] rounded-full hidden sm:block" />
            <div className="h-9 w-10 bg-[#121212] rounded-full" />
          </div>
        </div>

        {/* 4. Video Description Box */}
        <div className="w-full h-28 bg-[#121212] rounded-xl mt-6 border border-[#1A1A1A]" />

        {/* 5. Comments Section Placeholder */}
        <div className="mt-8 flex flex-col gap-6">
          <div className="h-5 bg-[#121212] rounded-md w-32 mb-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`comment-skel-${i}`} className="flex gap-4">
              <div className="w-10 h-10 bg-[#121212] rounded-full shrink-0" />
              <div className="flex flex-col gap-2 w-full pt-1">
                <div className="h-3 bg-[#121212] rounded-md w-40" />
                <div className="h-4 bg-[#121212] rounded-md w-full max-w-2xl" />
                <div className="h-4 bg-[#121212] rounded-md w-4/5 max-w-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Sidebar Recommendation Stream */}
      <div className="w-full lg:w-100 xl:w-105 shrink-0 border-t lg:border-t-0 border-[#1A1A1A] pt-6 lg:pt-0 flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`suggested-skel-${i}`} className="flex gap-3 sm:gap-4 w-full">
            {/* Suggested Thumbnail */}
            <div className="w-40 sm:w-44 aspect-video bg-[#121212] rounded-xl shrink-0 border border-[#1A1A1A]" />
            {/* Suggested Text Info */}
            <div className="flex flex-col gap-2 w-full py-1">
              <div className="h-4 bg-[#121212] rounded-md w-11/12" />
              <div className="h-4 bg-[#121212] rounded-md w-4/5" />
              <div className="h-3 bg-[#121212] rounded-md w-1/2 mt-1" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}