export default function FeedSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10 px-4">
            {[...Array(12)].map((_, i) => (
                <div key={`feed-skel-${i}`} className="flex flex-col gap-3 animate-pulse">
                    <div className="w-full aspect-video bg-zinc-900 rounded-xl" />
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-900 shrink-0" />
                        <div className="flex flex-col gap-2 w-full pt-1">
                            <div className="w-11/12 h-4 bg-zinc-900 rounded" />
                            <div className="w-3/4 h-4 bg-zinc-900 rounded" />
                            <div className="w-1/2 h-3 bg-zinc-900 rounded mt-1" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}