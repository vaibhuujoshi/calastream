// frontend/src/components/feed/CategoryChips.tsx
import { useRef, useState, useEffect } from "react";

const CATEGORIES = [
    "All", "Gaming", "Music", "Live", "Web Development", 
    "React routers", "Computer programming", "Podcasts", 
    "News", "Mixes", "Action-adventure games"
];

interface CategoryChipsProps {
    activeCategory: string;
    onSelect: (category: string) => void;
}

export function CategoryChips({ activeCategory, onSelect }: CategoryChipsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -200 : 200,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="relative w-full bg-[#050505] z-20 py-3 mb-4 border-b border-[#1A1A1A]">
            
            {showLeftArrow && (
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent flex items-center z-10">
                    <button onClick={() => scroll("left")} className="p-1.5 ml-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                </div>
            )}

            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex items-center gap-3 overflow-x-auto hide-scrollbar px-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelect(category)}
                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeCategory === category 
                            ? "bg-white text-black" 
                            : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {showRightArrow && (
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-[#050505] via-[#050505]/90 to-transparent flex items-center justify-end z-10">
                    <button onClick={() => scroll("right")} className="p-1.5 mr-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}