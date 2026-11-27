import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onViewCompetitions: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onViewCompetitions }) => {
  // Hitung selisih real-time akurat menuju 22 Maret 2027 00:00:00 WIB (UTC+7)
  const calculateTimeLeft = () => {
    const target = new Date('2027-03-22T00:00:00+07:00').getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, target - now);

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [titleLoupeActive, setTitleLoupeActive] = useState(false);
  const titleBoxRef = useRef<HTMLDivElement>(null);
  const titleLoupeRef = useRef<HTMLDivElement>(null);
  const titleCloneRef = useRef<HTMLDivElement>(null);

  const TITLE_LOUPE_SIZE = 156;
  const TITLE_LOUPE_ZOOM = 1.45;

  const handleTitleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = titleBoxRef.current;
    const loupe = titleLoupeRef.current;
    const clone = titleCloneRef.current;
    if (!box || !loupe || !clone) return;
    const rect = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const r = TITLE_LOUPE_SIZE / 2;

    if (!titleLoupeActive) setTitleLoupeActive(true);
    loupe.style.transform = `translate3d(${(x - r).toFixed(1)}px, ${(y - r).toFixed(1)}px, 0)`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transform = `translate3d(${(r - x * TITLE_LOUPE_ZOOM).toFixed(1)}px, ${(r - y * TITLE_LOUPE_ZOOM).toFixed(1)}px, 0) scale(${TITLE_LOUPE_ZOOM})`;
  };

  const handleTitleMouseLeave = () => {
    setTitleLoupeActive(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-10 lg:px-16 pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24"
      style={{ minHeight: '92vh' }}
    >
      <picture aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <source media="(min-width: 1024px)" srcSet="/gambar/hero-view-dekstop.webp" />
        <source media="(min-width: 768px)" srcSet="/gambar/hero-view-ipad.webp" />
        <img src="/gambar/hero-view-mobile.webp" alt="" fetchPriority="high" className="w-full h-full object-cover object-center" />
      </picture>

      {/* Radial backlight for reading comfort */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 48%, rgba(254, 252, 246, 0.84) 0%, rgba(253, 249, 240, 0.5) 58%, transparent 100%)',
        }}
      />

      <div aria-hidden="true" className="hero-mist pointer-events-none absolute inset-x-0 bottom-0" />

      {/* ── Paper-cut horizon: lapisan bukit/awan kertas menyambung ke About ── */}
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full z-[1]"
        style={{ height: 'clamp(3.5rem, 7vw, 6rem)', filter: 'drop-shadow(0 -4px 12px rgba(92,62,40,0.07))' }}
      >
        {/* Layer 3 — paling dalam, paling gelap */}
        <path
          d="M0,70 C120,38 260,22 400,42 C520,58 600,30 720,32 C840,34 940,54 1080,38 C1200,24 1330,46 1440,50 L1440,90 L0,90 Z"
          fill="#ece0cc"
        />
        {/* Layer 2 */}
        <path
          d="M0,78 C80,56 200,40 340,56 C460,70 560,44 680,48 C800,52 920,66 1060,52 C1180,40 1310,60 1440,62 L1440,90 L0,90 Z"
          fill="#f3e9d8"
        />
        {/* Layer 1 — paling depan, paling terang */}
        <path
          d="M0,84 C100,66 240,54 380,68 C500,80 620,60 740,62 C860,64 980,76 1120,64 C1240,54 1350,70 1440,72 L1440,90 L0,90 Z"
          fill="#faf4e8"
        />
      </svg>

      {/* ── HERO CENTERED CONTENT ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Baris Logo Resmi Penyelenggara (Urutan: BI → GenBI → UB) */}
        <div className="flex items-center justify-center gap-3.5 sm:gap-5 mb-3 sm:mb-4">
          <img
            src="/Logo/logo-bi.webp"
            alt="Bank Indonesia"
            className="h-4 sm:h-5 md:h-6 w-auto object-contain"
          />
          <span className="w-px h-4 sm:h-5 bg-[#b8925a]/45" aria-hidden="true" />
          <img
            src="/Logo/logo-genbi.webp"
            alt="GenBI Komisariat Universitas Brawijaya"
            className="h-5 sm:h-6 md:h-7 w-auto object-contain"
          />
          <span className="w-px h-4 sm:h-5 bg-[#b8925a]/45" aria-hidden="true" />
          <img
            src="/Logo/logo-ub.webp"
            alt="Universitas Brawijaya"
            className="h-6 sm:h-7 md:h-8 w-auto object-contain"
          />
        </div>

        {/* Eyebrow Editorial Polos & Bersih */}
        <p className="font-cinzel text-[9px] sm:text-[10.5px] md:text-xs tracking-[0.22em] sm:tracking-[0.3em] text-[#7a4e26] uppercase font-medium mb-2 sm:mb-3 px-2">
          GENBI KOMISARIAT UNIVERSITAS BRAWIJAYA MEMPERSEMBAHKAN
        </p>

        {/* Main Title: Digiconomic & Fest 2027 dengan Efek Kaca Pembesar (Magnifier Loupe) */}
        <div
          ref={titleBoxRef}
          onMouseMove={handleTitleMouseMove}
          onMouseLeave={handleTitleMouseLeave}
          className="relative inline-block select-none px-4 sm:px-8 py-1 cursor-zoom-in"
        >
          <h1 className="font-cormorant text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.25rem] tracking-tight leading-[1.08] font-normal text-center">
            <span className="text-[#1a0f07] block drop-shadow-xs font-normal">
              Digiconomic
            </span>
            <span className="shimmer-text block mt-0.5 sm:mt-1 font-normal">
              Fest 2027
            </span>
          </h1>

          {/* Lensa Magnifier Optik (Desktop Hover Only, 60fps via Ref Transform) */}
          <div
            ref={titleLoupeRef}
            aria-hidden="true"
            className={`hidden sm:block pointer-events-none absolute left-0 top-0 z-30 rounded-full overflow-hidden border-2 border-[#d8ad56] ring-2 ring-[#fffdf9]/80 transition-opacity duration-200 ${
              titleLoupeActive ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: TITLE_LOUPE_SIZE,
              height: TITLE_LOUPE_SIZE,
              background:
                'radial-gradient(circle at 32% 28%, rgba(255, 253, 248, 0.96) 0%, rgba(248, 240, 224, 0.94) 68%, rgba(235, 220, 194, 0.95) 100%)',
              boxShadow:
                '0 14px 34px -6px rgba(42, 23, 11, 0.34), 0 0 0 1px rgba(202, 161, 82, 0.45), inset 0 0 22px rgba(202, 161, 82, 0.22)',
              willChange: 'transform, opacity',
            }}
          >
            <div
              ref={titleCloneRef}
              className="px-4 sm:px-8 py-1"
              style={{ transformOrigin: '0 0', willChange: 'transform' }}
            >
              <div className="font-cormorant text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.25rem] tracking-tight leading-[1.08] font-normal text-center">
                <span className="text-[#2f1a0c] block font-normal">
                  Digiconomic
                </span>
                <span className="shimmer-text block mt-0.5 sm:mt-1 font-normal">
                  Fest 2027
                </span>
              </div>
            </div>

            {/* Kilau pantulan kaca lensa */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 250, 235, 0.12) 42%, transparent 68%)',
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center w-full mt-2 sm:mt-3">
          {/* Subtle Decorative Star Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-2.5 sm:my-4 text-[#caa152] opacity-80">
            <span className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-r from-transparent to-[#caa152]" />
            <span className="text-[8px] sm:text-[10px]">✦</span>
            <span className="text-xs sm:text-sm">✦</span>
            <span className="text-[8px] sm:text-[10px]">✦</span>
            <span className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-transparent to-[#caa152]" />
          </div>

          {/* Poetic Subtitle */}
          <p className="font-sans-body text-base sm:text-lg md:text-xl text-[#392517] max-w-xl px-4 leading-relaxed font-medium text-center text-balance">
            Bawa <strong className="text-[#241308] font-semibold underline decoration-[#caa152]/70 underline-offset-4">ide digitalmu</strong> ke kompetisi nasional dan bantu <strong className="text-[#241308] font-semibold">UMKM lokal</strong> berkembang.
          </p>

          {/* Date & Location Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 my-3.5 sm:my-6 text-[9px] sm:text-[10px] md:text-[11px] font-cinzel font-normal text-[#7d4f2b] tracking-[0.15em] sm:tracking-[0.2em] uppercase">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#caa152]" />
              <span>22 MARET 2027</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#caa152]" />
              <span>UNIVERSITAS BRAWIJAYA</span>
            </div>
          </div>

          {/* ── REAL-TIME COUNTDOWN TIMER (Target: 22 Maret 2027) ── */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-[280px] sm:max-w-sm md:max-w-md my-1 sm:my-2">
            {[
              { val: timeLeft.days, label: 'HARI' },
              { val: String(timeLeft.hours).padStart(2, '0'), label: 'JAM' },
              { val: String(timeLeft.minutes).padStart(2, '0'), label: 'MENIT' },
              { val: String(timeLeft.seconds).padStart(2, '0'), label: 'DETIK' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="card-modern-hover group relative flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-[#dfccb0] hover:border-[#caa152]/75 shadow-2xs"
                style={{
                  background: 'rgba(255, 253, 248, 0.95)',
                }}
              >
                <span className="font-cormorant tabular-nums text-xl sm:text-2xl md:text-3xl text-[#2a170b] font-semibold leading-none mb-0.5 sm:mb-1">
                  {item.val}
                </span>
                <span className="font-cinzel text-[8px] sm:text-[9px] md:text-[10px] text-[#8a5e38] tracking-[0.15em] sm:tracking-[0.2em] font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── ACTION CTA BUTTONS: Rapi, proporsional, tidak memanjang selebar layar ── */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-3.5 md:gap-4 mt-4 sm:mt-6 w-auto max-w-sm sm:max-w-md mx-auto px-2">
            <button
              onClick={onExplore}
              className="px-4 sm:px-7 py-2 sm:py-2.5 md:py-3 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] hover:from-[#c9954a] hover:via-[#d8b060] hover:to-[#c69342] text-white font-cinzel text-[9.5px] sm:text-xs font-semibold tracking-[0.14em] sm:tracking-[0.2em] shadow-xs hover:shadow transition-all duration-300 ease-out active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer"
            >
              <span>JELAJAHI ACARA</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={onViewCompetitions}
              className="px-4 sm:px-7 py-2 sm:py-2.5 md:py-3 rounded-full bg-white/85 hover:bg-white text-[#2a170b] font-cinzel text-[9.5px] sm:text-xs font-medium tracking-[0.14em] sm:tracking-[0.18em] border border-[#d8be99] shadow-xs hover:shadow transition-all duration-300 ease-out active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
            >
              LIHAT KOMPETISI
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
