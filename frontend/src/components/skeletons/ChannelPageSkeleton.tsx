interface ChannelPageSkeletonProps {
  isSidebarCollapsed: boolean;
}

export default function ChannelPageSkeleton({ isSidebarCollapsed }: ChannelPageSkeletonProps) {
  return (
    <div 
      className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 w-full animate-pulse ${
        isSidebarCollapsed ? "sm:ml-20" : "sm:ml-60"
      }`}
    >
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* 1. Channel Header Skeleton Layout */}
        <div className="flex flex-col w-full">
          {/* Banner Block Placeholder */}
          <div className="w-full h-32 sm:h-48 lg:h-60 bg-[#121212] border border-[#1A1A1A] rounded-2xl" />

          {/* Identity Context & Button Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center px-4 md:px-8 gap-4 md:gap-6 relative mt-4">
            
            {/* Round Avatar Mask Frame */}
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-[#050505] bg-[#121212] -mt-12 md:-mt-16 shrink-0 relative z-10" />

            {/* Profile Fields & Call to Actions Container */}
            <div className="flex flex-col md:flex-row md:items-start justify-between w-full gap-4 mt-2">
              <div className="flex flex-col space-y-3 w-full max-w-xl">
                {/* Channel Name Line */}
                <div className="h-7 bg-[#121212] rounded-lg w-1/2" />
                
                {/* Meta Handle / Subscriber Counts Strip */}
                <div className="h-4 bg-[#121212] rounded-md w-1/3" />
                
                {/* Bio Description Segment Block Lines */}
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 bg-[#121212] rounded-md w-full" />
                  <div className="h-3.5 bg-[#121212] rounded-md w-5/6" />
                </div>
              </div>

              {/* Action Subscribe Pill Button Silhouette */}
              <div className="w-28 h-10 bg-[#121212] rounded-full shrink-0 mt-2 md:mt-0" />
            </div>

          </div>

          {/* Decorative Divider Line */}
          <div className="w-full h-px bg-[#1A1A1A] mt-8" />
        </div>

        {/* 2. Uploads Grid Section Skeleton Layout */}
        <div className="mt-4">
          {/* Grid Heading Token */}
          <div className="h-5 bg-[#121212] rounded-md w-24 mb-6" />

          {/* Responsive Cards Video Grid Mapping Mocking 6 Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-x-4 gap-y-10 mx-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`video-skel-${i}`} className="flex flex-col gap-3 w-full">
                
                {/* Aspect-Video Media Thumbnail Screen Card */}
                <div className="w-full aspect-video bg-[#121212] border border-[#1A1A1A] rounded-xl" />

                {/* Card Info Meta Block */}
                <div className="flex gap-3 items-start w-full">
                  {/* Round Creator Avatar Placeholder */}
                  <div className="w-9 h-9 rounded-full bg-[#121212] shrink-0" />
                  
                  {/* Text Details Wrapper */}
                  <div className="flex flex-col space-y-2 w-full pt-1">
                    {/* Header Title Line 1 */}
                    <div className="h-4 bg-[#121212] rounded-md w-11/12" />
                    {/* Header Title Line 2 */}
                    <div className="h-4 bg-[#121212] rounded-md w-2/3" />
                    {/* Channel Metadata Row Line */}
                    <div className="h-3 bg-[#121212] rounded-md w-1/2 mt-2" />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}