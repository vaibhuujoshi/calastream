import { CalaStreamLogo } from "./CalastreamLogo";

export default function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none z-50">

            {/* Ambient Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 bg-purple-900/20 rounded-full blur-[80px] animate-pulse" />
            </div>

            {/* Core Loader Container */}
            <div className="relative flex flex-col items-center gap-8 z-10">

                {/* Animated Rings & Brand Geometry */}
                <div className="relative flex items-center justify-center w-20 h-20">
                    {/* Outer fast-spinning accent ring */}
                    <div className="absolute inset-0 rounded-full border-[1.5px] border-purple-500/10 border-t-purple-500 animate-spin" />

                    {/* Middle reverse-spinning ring */}
                    <div className="absolute inset-2 rounded-full border-[1.5px] border-indigo-500/10 border-b-indigo-400 animate-[spin_1.5s_linear_infinite_reverse]" />
                    <span className="animate-pulse rounded-full shadow-[0_0_25px_rgba(147,51,234,0.6)] p-0"> <CalaStreamLogo /></span>

                    {/* Inner glowing pulsing brand logo (The rotated square from your Navbar) */}
                    {/* <div className="w-5 h-5 bg-linear-to-tr from-purple-600 to-indigo-400 rounded-sm transform rotate-45 animate-pulse shadow-[0_0_25px_rgba(147,51,234,0.6)]" /> */}
                </div>

                {/* Typography & Status */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-white font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
                        CalaStream
                    </span>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium tracking-wide">
                        <span>Establishing connection</span>
                        {/* Bouncing dots for extra detail */}
                        <span className="flex gap-0.5">
                            <span className="animate-[bounce_1.4s_infinite_0ms]">.</span>
                            <span className="animate-[bounce_1.4s_infinite_200ms]">.</span>
                            <span className="animate-[bounce_1.4s_infinite_400ms]">.</span>
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}