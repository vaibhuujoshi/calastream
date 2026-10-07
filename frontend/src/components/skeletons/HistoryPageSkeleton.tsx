export default function HistoryPageSkeleton() {
    return (
        <div className="flex flex-col w-full animate-pulse max-w-250 mx-auto">
            
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
                <div className="w-48 h-8 bg-zinc-900 rounded-lg" />
                <div className="w-40 h-10 bg-zinc-900 rounded-full" />
            </div>

            {/* Date Group Skeleton */}
            <div className="flex flex-col gap-8 pb-20">
                <div>
                    {/* "Today" Header */}
                    <div className="w-24 h-6 bg-zinc-900 rounded-md mb-4 ml-3" />
                    
                    <div className="flex flex-col gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={`history-skeleton-${i}`} className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl border border-transparent">
                                
                                {/* Thumbnail */}
                                <div className="w-full sm:w-60 md:w-[320px] aspect-video bg-zinc-900 rounded-lg shrink-0" />
                                
                                {/* Details */}
                                <div className="flex flex-col flex-1 py-1 pr-8 gap-3">
                                    <div className="w-full h-5 bg-zinc-900 rounded" />
                                    <div className="w-3/4 h-5 bg-zinc-900 rounded" />
                                    
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-24 h-4 bg-zinc-900 rounded" />
                                        <div className="w-16 h-4 bg-zinc-900 rounded" />
                                    </div>

                                    <div className="w-full h-3 bg-zinc-900 rounded mt-2 hidden sm:block" />
                                    <div className="w-2/3 h-3 bg-zinc-900 rounded hidden sm:block" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
        </div>
    );
}