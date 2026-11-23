import React from 'react';

interface MagicMotionLinesProps {
  className?: string;
  variant?: 'hero' | 'ambient' | 'horizontal';
}

/**
 * MagicMotionLines - Ultra-Lightweight Pure SVG/CSS (Zero JS/GSAP overhead)
 * Elemen pita emas estetis statis/subtle dengan zero CPU impact.
 */
export const MagicMotionLines: React.FC<MagicMotionLinesProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full object-cover opacity-40"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="gold-stream-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#caa152" stopOpacity="0" />
            <stop offset="30%" stopColor="#caa152" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#ebdcc8" stopOpacity="0.6" />
            <stop offset="85%" stopColor="#caa152" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7a5530" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="gold-stream-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7a5530" stopOpacity="0" />
            <stop offset="40%" stopColor="#caa152" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#ebdcc8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#caa152" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Golden Stream 1 */}
        <path
          d="M-100,550 C250,420 400,680 720,480 C1040,280 1200,520 1550,380"
          stroke="url(#gold-stream-1)"
          strokeWidth="2"
          strokeDasharray="16 20"
          fill="none"
        />

        {/* Golden Stream 2 */}
        <path
          d="M-50,300 C300,200 550,450 850,320 C1150,190 1350,400 1500,260"
          stroke="url(#gold-stream-2)"
          strokeWidth="1.5"
          strokeDasharray="12 24"
          fill="none"
        />
      </svg>
    </div>
  );
};
