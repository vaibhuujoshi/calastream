import { useState, useCallback, useEffect } from "react";
import { toggleSubscription, checkSubscriptionStatus } from "../api/subscription";

interface SubscribeButtonProps {
  channelId: string;
  initialIsSubscribed?: boolean; // Prop value used as our pristine starter fallback
  onSubscribeChange?: (isSubscribed: boolean) => void;
  className?: string;
}

export function SubscribeButton({
  channelId,
  initialIsSubscribed = false, // Give it a clear default configuration value
  onSubscribeChange,
  className = "",
}: SubscribeButtonProps) {
  
  // Fix 1: Pass the initial prop value to prevent 'undefined' ghost rendering artifacts
  const [isSubscribed, setIsSubscribed] = useState<boolean>(initialIsSubscribed);
  
  // Fix 2: Start as false if using props, true if you want to execute an immediate fetch query overlay
  const [isPending, setIsPending] = useState(true); 

  // Synchronise state accurately if the channelId prop modifications change mid-lifecycle
  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        setIsPending(true);
        const data = await checkSubscriptionStatus(channelId);
        
        if (isMounted) {
          setIsSubscribed(data.isSubscribed);
        }
      } catch (error) {
        console.error("Failed to fetch sub status", error);
      } finally {
        if (isMounted) setIsPending(false);
      }
    }

    loadStatus();

    return () => { isMounted = false; };
  }, [channelId]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isPending) return;

      const prev = isSubscribed;
      
      // Optimistic UI Update adjustments
      setIsSubscribed(!prev);
      onSubscribeChange?.(!prev);
      setIsPending(true);

      try {
        const result = await toggleSubscription(channelId);
        setIsSubscribed(result.subscribed);
        if (result.subscribed !== !prev) {
          onSubscribeChange?.(result.subscribed);
        }
      } catch (err) {
        setIsSubscribed(prev);
        onSubscribeChange?.(prev);
      } finally {
        setIsPending(false);
      }
    },
    [channelId, isSubscribed, isPending, onSubscribeChange]
  );

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={`
        group relative flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold
        transition-all duration-200 overflow-hidden outline-none select-none min-w-30 cursor-pointer 
        disabled:cursor-not-allowed
        ${
          // Fix 3: Keep the button context styling tied strictly to states 
          isPending
            ? "bg-zinc-800 text-zinc-500 border border-zinc-700 opacity-70" // Dedicated loading color layout palette
            : isSubscribed
            ? "bg-[#1A1A1A] text-zinc-300 border border-[#333] hover:bg-[#222] hover:border-[#444] hover:text-white"
            : "bg-white text-black hover:bg-zinc-200 border border-transparent"
        }
        ${className}
      `}
    >
      {isPending ? (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-zinc-400 font-medium">Checking...</span>
        </div>
      ) : isSubscribed ? (
        <>
          <span className="block group-hover:hidden">Subscribed</span>
          <span className="hidden group-hover:block text-red-400 font-bold">Unsubscribe</span>
        </>
      ) : (
        <span>Subscribe</span>
      )}
    </button>
  );
}
