import { type WatchVideo } from '../../api/videos';

export function VideoInfo({ video }: { video: WatchVideo }) {
  const formatCompactNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
        {video.title}
      </h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Channel Info */}
        <div className="flex items-center gap-4">
          <img 
            src={video.user.profilePicture || ""} 
            alt={video.user.channelName} 
            className="w-10 h-10 rounded-full border border-[#222]"
          />
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">{video.user.channelName}</span>
            <span className="text-zinc-400 text-xs">{formatCompactNumber(video.user.subscriberCount)} Subscribers</span>
          </div>
          <button className="ml-2 bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-zinc-200 transition">
            Subscribe
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="flex items-center bg-[#1A1A1A] rounded-full overflow-hidden shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 text-white hover:bg-[#2A2A2A] transition text-sm font-medium border-r border-[#333]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              1.3K
            </button>
            <button className="px-4 py-2 text-white hover:bg-[#2A2A2A] transition">
              <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            </button>
          </div>
          
          <button className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition text-sm font-medium shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
          
          <button className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition text-sm font-medium shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </button>

          <button className="bg-[#1A1A1A] text-white p-2 rounded-full hover:bg-[#2A2A2A] transition shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}