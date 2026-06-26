export const CalaStreamLogo = () => (
  <svg
    className="w-7 h-7 shrink-0 text-purple-500 group-hover:scale-105 transition-transform duration-300"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* The sweeping 'C' curve representing the brand and a streaming wave */}
    <path
      d="M 75 25 A 35 35 0 1 0 75 75"
      stroke="url(#calaMinimalGrad)"
      strokeWidth="14"
      strokeLinecap="round"
    />
    
    {/* Minimalist Play Triangle advancing forward */}
    <polygon 
      points="45,32 75,50 45,68" 
      fill="url(#calaMinimalGrad)" 
    />
    
    <defs>
      <linearGradient id="calaMinimalGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7" /> {/* Bright Purple */}
        <stop offset="1" stopColor="#6D28D9" /> {/* Deep Purple */}
      </linearGradient>
    </defs>
  </svg>
);