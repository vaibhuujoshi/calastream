import { useNavigate } from "react-router-dom";
import { type UserData } from "../lib/mockData";

interface NavbarProps {
    onToggleSidebar: () => void;
    isLoggedIn: boolean;
    currentUser?: UserData;
    onOpenAuth: () => void;
}

export function Navbar({ onToggleSidebar, isLoggedIn, currentUser, onOpenAuth }: NavbarProps) {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#050505] border-b border-[#1A1A1A] z-40 flex items-center justify-between px-4">

            {/* Left Column: Hamburger & Brand */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-[#1A1A1A] rounded-full transition-colors cursor-pointer"
                    aria-label="Toggle sidebar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 bg-purple-600 rounded-sm transform rotate-45 shrink-0"></div>
                    <span className="text-xl font-bold tracking-widest text-white uppercase hidden sm:block">
                        StreamLine
                    </span>
                </div>
            </div>

            {/* Center Column: Search Bar */}
            <div className="flex-1 max-w-2xl px-8 hidden md:block">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-2 pl-11 rounded-full focus:outline-none focus:border-purple-600 focus:bg-[#0F0F0F] transition-colors"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-2.5 text-zinc-500 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Right Column: User Controls */}
            <div className="flex items-center gap-4">
                {isLoggedIn && currentUser ? (
                    <img
                        src={currentUser.profilePicture}
                        alt="Profile"
                        className="w-9 h-9 rounded-full cursor-pointer border border-[#222] hover:border-purple-500 transition-colors object-cover"
                    />
                ) : (
                    <button
                        onClick={onOpenAuth}
                        className="flex items-center gap-2 border border-[#222] text-white px-5 py-2 rounded-full hover:bg-[#1A1A1A] transition-colors font-medium text-sm cursor-pointer"
                    >
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        Sign In
                    </button>
                )}
            </div>

        </nav>
    );
}