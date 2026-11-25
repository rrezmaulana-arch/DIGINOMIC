import React from 'react';

interface CornerFiligreeProps {
  className?: string;
  color?: string;
}

/**
 * Ornamen sudut bergaya arsip/heritage (L-frame halus + aksen berlian tipis).
 */
export const CornerFiligree: React.FC<CornerFiligreeProps> = ({
  className = '',
  color = '#caa152',
}) => (
  <>
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none absolute top-2.5 left-2.5 w-7 h-7 sm:w-9 sm:h-9 opacity-65 ${className}`}
    >
      <path d="M2 24V6C2 3.8 3.8 2 6 2H24" stroke={color} strokeWidth="1.2" />
      <path d="M7 18V9C7 7.9 7.9 7 9 7H18" stroke={color} strokeWidth="0.8" strokeOpacity="0.65" />
      <path d="M12 2L14 4L12 6L10 4L12 2Z" fill={color} fillOpacity="0.75" />
    </svg>
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none absolute top-2.5 right-2.5 w-7 h-7 sm:w-9 sm:h-9 opacity-65 scale-x-[-1] ${className}`}
    >
      <path d="M2 24V6C2 3.8 3.8 2 6 2H24" stroke={color} strokeWidth="1.2" />
      <path d="M7 18V9C7 7.9 7.9 7 9 7H18" stroke={color} strokeWidth="0.8" strokeOpacity="0.65" />
      <path d="M12 2L14 4L12 6L10 4L12 2Z" fill={color} fillOpacity="0.75" />
    </svg>
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none absolute bottom-2.5 left-2.5 w-7 h-7 sm:w-9 sm:h-9 opacity-65 scale-y-[-1] ${className}`}
    >
      <path d="M2 24V6C2 3.8 3.8 2 6 2H24" stroke={color} strokeWidth="1.2" />
      <path d="M7 18V9C7 7.9 7.9 7 9 7H18" stroke={color} strokeWidth="0.8" strokeOpacity="0.65" />
      <path d="M12 2L14 4L12 6L10 4L12 2Z" fill={color} fillOpacity="0.75" />
    </svg>
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none absolute bottom-2.5 right-2.5 w-7 h-7 sm:w-9 sm:h-9 opacity-65 scale-[-1] ${className}`}
    >
      <path d="M2 24V6C2 3.8 3.8 2 6 2H24" stroke={color} strokeWidth="1.2" />
      <path d="M7 18V9C7 7.9 7.9 7 9 7H18" stroke={color} strokeWidth="0.8" strokeOpacity="0.65" />
      <path d="M12 2L14 4L12 6L10 4L12 2Z" fill={color} fillOpacity="0.75" />
    </svg>
  </>
);

interface SectionDividerProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'light',
  className = '',
}) => {
  const stroke = variant === 'dark' ? '#caa152' : '#9c7244';
  return (
    <div className={`flex items-center justify-center gap-3 my-3 sm:my-4 ${className}`} aria-hidden="true">
      <span
        className="h-px w-12 sm:w-20"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${stroke} 100%)`, opacity: 0.6 }}
      />
      <svg viewBox="0 0 28 28" className="w-5 h-5 shrink-0" fill="none">
        <circle cx="14" cy="14" r="10" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
        <path
          d="M14 4L16.2 11.8L24 14L16.2 16.2L14 24L11.8 16.2L4 14L11.8 11.8L14 4Z"
          stroke={stroke}
          strokeWidth="1"
          fill={stroke}
          fillOpacity="0.2"
        />
      </svg>
      <span
        className="h-px w-12 sm:w-20"
        style={{ background: `linear-gradient(270deg, transparent 0%, ${stroke} 100%)`, opacity: 0.6 }}
      />
    </div>
  );
};

/**
 * Pola latar Batik Kawung halus (SVG seamless tile) untuk memberi tekstur Nusantara elegan.
 */
export const BatikKawungPattern: React.FC<{ color?: string; opacity?: number; id?: string }> = ({
  color = '#7a5530',
  opacity = 0.06,
  id = 'kawung-pattern',
}) => (
  <svg
    aria-hidden="true"
    className="pointer-events-none select-none absolute inset-0 w-full h-full"
    style={{
      opacity,
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
    }}
  >
    <defs>
      <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
        <ellipse cx="32" cy="16" rx="8" ry="14" fill="none" stroke={color} strokeWidth="1.1" />
        <ellipse cx="32" cy="48" rx="8" ry="14" fill="none" stroke={color} strokeWidth="1.1" />
        <ellipse cx="16" cy="32" rx="14" ry="8" fill="none" stroke={color} strokeWidth="1.1" />
        <ellipse cx="48" cy="32" rx="14" ry="8" fill="none" stroke={color} strokeWidth="1.1" />
        <circle cx="32" cy="32" r="3" fill={color} />
        <circle cx="0" cy="0" r="2.2" fill={color} />
        <circle cx="64" cy="0" r="2.2" fill={color} />
        <circle cx="0" cy="64" r="2.2" fill={color} />
        <circle cx="64" cy="64" r="2.2" fill={color} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
);

/**
 * Transisi antar section:
 * - "mist": peleburan gradasi murni tanpa garis potong (ideal untuk section terang ke terang)
 * - "cloud" / "ridge" / "wave": 3 lapisan gelombang lembut untuk perpindahan terang <-> espresso
 */
export const SectionWaveTransition: React.FC<{
  fromColor: string;
  toColor: string;
  accentColor?: string;
  variant?: 'mist' | 'cloud' | 'wave' | 'ridge';
}> = ({ fromColor, toColor, accentColor = '#caa152', variant = 'mist' }) => {
  if (variant === 'mist') {
    return (
      <div
        className="relative w-full h-8 sm:h-10 -my-px select-none pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${fromColor} 0%, ${toColor} 100%)`,
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden leading-none -my-px select-none pointer-events-none"
      style={{ backgroundColor: fromColor }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="block w-full h-10 sm:h-14 md:h-16">
        {variant === 'ridge' ? (
          <>
            <path d="M0,48 C320,8 680,62 1060,26 C1240,10 1360,24 1440,34 L1440,72 L0,72 Z" fill={toColor} fillOpacity="0.22" />
            <path d="M0,56 C360,22 720,66 1120,34 C1280,22 1380,34 1440,44 L1440,72 L0,72 Z" fill={toColor} fillOpacity="0.52" />
            <path d="M0,64 C380,34 760,70 1160,44 C1300,34 1390,46 1440,54 L1440,72 L0,72 Z" fill={toColor} />
          </>
        ) : variant === 'wave' ? (
          <>
            <path d="M0,26 C340,68 700,8 1080,44 C1260,60 1370,38 1440,30 L1440,72 L0,72 Z" fill={toColor} fillOpacity="0.22" />
            <path d="M0,38 C360,72 740,18 1120,50 C1280,64 1380,46 1440,40 L1440,72 L0,72 Z" fill={toColor} fillOpacity="0.52" />
            <path d="M0,50 C380,76 760,30 1140,58 C1300,68 1390,54 1440,50 L1440,72 L0,72 Z" fill={toColor} />
          </>
        ) : (
          <>
            <path d="M0,42 C240,12 520,58 840,28 C1100,4 1300,40 1440,26 L1440,72 L0,72 Z" fill={accentColor} fillOpacity="0.14" />
            <path d="M0,52 C280,22 560,64 880,36 C1140,14 1320,48 1440,36 L1440,72 L0,72 Z" fill={toColor} fillOpacity="0.55" />
            <path d="M0,60 C300,32 600,68 920,44 C1160,26 1340,54 1440,46 L1440,72 L0,72 Z" fill={toColor} />
          </>
        )}
      </svg>
    </div>
  );
};

/**
 * Ilustrasi latar kartu Journey bergaya referensi "Choose Your Journey"
 * (matahari terbit, awan tipis, dan bukit berlapis dalam palet hangat Digiconomic).
 */
export const JourneyCardArtwork: React.FC<{ variant: 'esai' | 'case' }> = ({ variant }) => {
  const isEsai = variant === 'esai';
  const sunColor = isEsai ? '#c96f28' : '#b85a2a';
  const hillBack = isEsai ? '#b8915c' : '#8f6742';
  const hillFront = isEsai ? '#6b4728' : '#4a2e19';

  return (
    <svg
      viewBox="0 0 600 260"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 w-full h-full"
    >
      {/* Matahari hangat */}
      <circle
        cx={isEsai ? 145 : 455}
        cy="64"
        r="26"
        fill={sunColor}
        fillOpacity="0.72"
      />
      {/* Awan tipis melintang */}
      <g fill="#fffdf9" fillOpacity="0.65">
        <rect x={isEsai ? 158 : 420} y="56" width="54" height="7" rx="3.5" />
        <rect x={isEsai ? 172 : 434} y="66" width="32" height="5" rx="2.5" />
        <rect x={isEsai ? 460 : 88} y="42" width="46" height="6" rx="3" />
        <rect x={isEsai ? 472 : 98} y="51" width="28" height="4.5" rx="2.25" />
      </g>
      {/* Bukit belakang */}
      <path
        d="M0 225 Q110 155 230 198 T460 175 T600 205 L600 260 L0 260 Z"
        fill={hillBack}
        fillOpacity="0.28"
      />
      {/* Bukit depan */}
      <path
        d="M0 240 Q150 185 310 225 T600 192 L600 260 L0 260 Z"
        fill={hillFront}
        fillOpacity="0.32"
      />
      {/* Aksen siluet gerbang / pena Nusantara di sisi ilustrasi */}
      {isEsai ? (
        <g transform="translate(56, 78)" opacity="0.88">
          {/* Siluet buku & pena bulu heritage */}
          <path d="M18 118 C42 104 68 104 92 118 V44 C68 32 42 32 18 44 Z" fill="#3b2412" fillOpacity="0.85" />
          <path d="M92 118 C116 104 142 104 166 118 V44 C142 32 116 32 92 44 Z" fill="#52331b" fillOpacity="0.85" />
          <path d="M92 44 V118" stroke="#caa152" strokeWidth="2.5" />
          <path d="M126 14 C146 28 152 54 134 78 L108 92 L116 64 C118 44 114 26 126 14 Z" fill="#caa152" />
        </g>
      ) : (
        <g transform="translate(52, 72)" opacity="0.88">
          {/* Siluet Gapura / Torii Nusantara bergaya klasik */}
          <rect x="24" y="28" width="124" height="11" rx="4" fill="#3b2412" />
          <rect x="34" y="50" width="104" height="8" rx="3" fill="#5b391e" />
          <rect x="44" y="34" width="11" height="96" rx="2" fill="#3b2412" />
          <rect x="117" y="34" width="11" height="96" rx="2" fill="#3b2412" />
          <rect x="81" y="36" width="10" height="18" rx="2" fill="#caa152" />
        </g>
      )}
    </svg>
  );
};
