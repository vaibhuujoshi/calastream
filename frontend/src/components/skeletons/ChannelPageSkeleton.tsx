// frontend/src/components/skeletons/ChannelPageSkeleton.tsx

export default function ChannelPageSkeleton() {
    return (
        <div className="w-full animate-pulse pt-4 md:pt-6">
            
            {/* 1. Banner Skeleton */}
            <div className="w-full h-32 sm:h-48 md:h-64 lg:h-80 bg-zinc-800/40 rounded-2xl mb-6 md:mb-8" />

            {/* 2. Profile Header Skeleton */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 px-4 sm:px-0">
                {/* Avatar */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-800/40 shrink-0" />

                {/* Info Container */}
                <div className="flex flex-col items-center sm:items-start w-full max-w-3xl gap-3 text-center sm:text-left">
                    {/* Channel Name */}
                    <div className="h-8 w-48 bg-zinc-800/40 rounded-lg" />
                    
                    {/* Handle & Sub Count */}
                    <div className="h-4 w-64 bg-zinc-800/40 rounded-md" />
                    
                    {/* Description (Hidden on very small screens to match typical behavior) */}
                    <div className="hidden sm:flex flex-col gap-2 w-full mt-2">
                        <div className="h-3.5 w-full bg-zinc-800/40 rounded-md" />
                        <div className="h-3.5 w-4/5 bg-zinc-800/40 rounded-md" />
                    </div>
                    
                    {/* Subscribe Button */}
                    <div className="h-10 w-32 bg-zinc-800/40 rounded-full mt-3" />
                </div>
            </div>

            {/* 3. Uploads Section Header */}
            <div className="border-t border-[#1A1A1A] pt-6 mb-6">
                <div className="h-6 w-24 bg-zinc-800/40 rounded-lg mb-6" />
            </div>

            {/* 4. Video Grid Skeleton (Matches exact breakpoints of the real Feed) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        {/* Thumbnail */}
                        <div className="w-full aspect-video bg-zinc-800/40 rounded-xl" />
                        
                        {/* Video Meta */}
                        <div className="flex gap-3 px-1">
                            {/* Uploader Avatar */}
                            <div className="w-9 h-9 rounded-full bg-zinc-800/40 shrink-0 mt-0.5" />
                            
                            {/* Title & Stats */}
                            <div className="flex flex-col gap-2.5 w-full pt-1">
                                <div className="h-4 w-[90%] bg-zinc-800/40 rounded-md" />
                                <div className="h-3 w-[60%] bg-zinc-800/40 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
        </div>
    );
}