const MOCK_COMMENTS = [
  { id: 1, user: "SpaceFan77", time: "1d ago", text: "This video is absolutely stunning! The detail is incredible." },
  { id: 2, user: "AstroNerd", time: "2d ago", text: "I can't believe the resolution on these new captures." },
];

export function CommentsSection() {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-white mb-4">80 Comments</h3>
      
      {/* Input Row */}
      <div className="flex gap-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0" />
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Add a public comment..." 
            className="w-full bg-transparent border-b border-[#333] focus:border-white outline-none text-white pb-1 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {MOCK_COMMENTS.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="text-white font-medium">{comment.user}</span>
                <span className="text-zinc-500">{comment.time}</span>
              </div>
              <p className="text-sm text-zinc-300 mb-2">{comment.text}</p>
              <div className="flex items-center gap-4 text-zinc-400">
                <button className="hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg></button>
                <button className="hover:text-white"><svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg></button>
                <button className="text-xs font-semibold hover:text-white">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}