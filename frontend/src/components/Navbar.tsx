import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore"; 
import { logoutUser } from "../api/auth";
import { CalaStreamLogo } from "./CalastreamLogo";

interface NavbarProps {
    onToggleSidebar: () => void;
    onOpenAuth: () => void;
}

export function Navbar({ onToggleSidebar, onOpenAuth }: NavbarProps) {
    const navigate = useNavigate();
    
    // Select values and actions directly from your Zustand store
    const user = useUserStore((state) => state.user);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const logout = useUserStore((state) => state.logout);

    // Dropdown visibility and reference tracking
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Automatically close the dropdown if the user clicks anywhere outside of it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogoutClick = async () => {
        try {
            await logoutUser();
            
        } catch (error) {
            console.error("Cookie clearance error:", error);
        } finally {
            // Clear client UI state, close dropdown, and bounce user back home
            logout(); 
            setIsDropdownOpen(false);
            navigate("/"); 
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#050505] border-b border-[#1A1A1A] z-40 flex items-center justify-between px-4 select-none">

            {/* Left Column: Hamburger & Brand */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-[#1A1A1A] rounded-full transition-colors cursor-pointer focus:outline-none"
                    aria-label="Toggle sidebar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div onClick={() => { setIsDropdownOpen(false); navigate('/'); }} className="flex items-center gap-2 cursor-pointer group">
                    {/* <div className="w-5 h-5 bg-purple-600 rounded-sm transform rotate-45 shrink-0 group-hover:scale-105 
                    transition-transform duration-200"></div> */}
                    <CalaStreamLogo />
                    <span className="text-xl font-bold tracking-widest text-white hidden sm:block">
                        CalaStream
                    </span>
                </div>
            </div>

            {/* Center Column: Search Bar */}
            <div className="flex-1 max-w-2xl px-8 hidden md:block">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-[#0A0A0A] border border-[#222] text-white px-4 py-2 pl-11 rounded-full focus:outline-none focus:border-purple-600 focus:bg-[#0F0F0F] transition-colors text-sm"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-2.5 text-zinc-500 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Right Column: User Controls & Dropdown Menu */}
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                {isLoggedIn && user ? (
                    <>
                        {/* Profile Trigger Button */}
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="focus:outline-none block cursor-pointer group rounded-full"
                        >
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={`${user.username || 'User'}'s profile`}
                                    className="w-9 h-9 rounded-full border border-[#222] group-hover:border-purple-500 transition-colors object-cover"
                                />
                            ) : (
                                /* Fallback initials initials plate with absolute null safety */
                                <div className="w-9 h-9 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm uppercase cursor-pointer select-none group-hover:border-purple-500 transition-colors duration-150">
                                    {user.username?.substring(0, 2) || "??"}
                                </div>
                            )}
                        </button>

                        {/* Profile Menu Overlay panel */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-12 w-56 bg-[#0C0C0C] border border-[#1A1A1A] rounded-xl shadow-2xl py-2 z-50 transform origin-top-right transition-all">
                                {/* Profile Briefing Header Info */}
                                <div className="px-4 py-2.5 border-b border-[#1A1A1A] select-text">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {user.channelName || user.username}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                                        @{user.username || 'unknown'}
                                    </p>
                                </div>

                                {/* Custom Profile Action Items */}
                                <button
                                    onClick={() => { setIsDropdownOpen(false); navigate(`/channel/${user.id}`); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-[#111111] transition-colors text-left cursor-pointer focus:outline-none"
                                >
                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Your Channel
                                </button>

                                {/* Logout Command Option Button */}
                                <button
                                    onClick={handleLogoutClick}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 border-t border-[#1A1A1A] mt-1 transition-colors text-left font-medium cursor-pointer focus:outline-none"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Guest View Action Control Button */
                    <button
                        onClick={onOpenAuth}
                        className="flex items-center gap-2 border border-[#222] text-white px-5 py-2 rounded-full hover:bg-[#1A1A1A] hover:border-zinc-700 transition-all font-medium text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
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