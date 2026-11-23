import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden flex flex-col items-center justify-center text-center px-6 sm:px-10 lg:px-16 pt-16 pb-20 sm:pt-20 sm:pb-24"
      style={{ minHeight: '88vh' }}
    >
      {/* ── BACKGROUND IMAGE (bg-public.svg) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none select-none z-0"
        style={{
          backgroundImage: "url('/gambar/bg-public.svg')",
          filter: 'contrast(1.02) saturate(1.04)',
        }}
      />

      {/* Radial backlight for reading comfort */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 65% at 50% 48%, rgba(254, 252, 246, 0.82) 0%, rgba(253, 249, 240, 0.48) 58%, transparent 100%)',
        }}
      />

      {/* ── SEAMLESS MULTI-STOP BOTTOM FADE TO ELIMINATE ANY LINE BREAK ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44 sm:h-52 pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(253, 248, 239, 0.25) 25%, rgba(253, 248, 239, 0.65) 55%, rgba(253, 248, 239, 0.92) 80%, #fdf8ef 100%)',
        }}
      />

      {/* ── HERO CENTERED CONTENT ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Eyebrow: GENBI MEMPERSEMBAHKAN */}
        <p className="font-cinzel text-[11px] sm:text-xs tracking-[0.34em] text-[#8a5e38] uppercase font-normal mb-3">
          GENBI MEMPERSEMBAHKAN
        </p>

        {/* Main Title: Digiconomic (Hitam/Antique Dark Brown) & Fest 2027 (Emas Bercahaya/Shimmer) */}
        <h1 className="font-cormorant text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] xl:text-[6.5rem] tracking-tight leading-[1.08] font-normal select-none text-center px-4">
          <span className="text-[#1a0f07] block drop-shadow-xs font-normal">
            Digiconomic
          </span>
          <span className="shimmer-text block mt-1 sm:mt-2 font-normal">
            Fest 2027
          </span>
        </h1>

        <div className="flex flex-col items-center w-full">
          {/* Subtle Decorative Star Divider */}
          <div className="flex items-center justify-center gap-3 my-5 text-[#caa152] opacity-80">
            <span className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#caa152]" />
            <span className="text-[10px]">✦</span>
            <span className="text-sm">✦</span>
            <span className="text-[10px]">✦</span>
            <span className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#caa152]" />
          </div>

          {/* Poetic Subtitle - Lebar 2xl agar tidak terpotong di layar manapun */}
          <p className="font-sans text-xs sm:text-sm md:text-base text-[#4a2e18] max-w-2xl px-4 mx-auto leading-relaxed font-normal text-center">
            Sebuah festival tempat gagasan muda berubah menjadi keajaiban nyata bagi UMKM lokal.
          </p>

          {/* Date & Location Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-9 my-6 text-[10px] sm:text-[11px] font-cinzel font-normal text-[#7d4f2b] tracking-[0.2em] uppercase">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#caa152]" />
              <span>22 MARET 2027</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#caa152]" />
              <span>MALANG, JAWA TIMUR</span>
            </div>
          </div>

          {/* ── REAL-TIME COUNTDOWN TIMER (Target: 22 Maret 2027) ── */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-md my-2">
            {[
              { val: timeLeft.days, label: 'HARI' },
              { val: String(timeLeft.hours).padStart(2, '0'), label: 'JAM' },
              { val: String(timeLeft.minutes).padStart(2, '0'), label: 'MENIT' },
              { val: String(timeLeft.seconds).padStart(2, '0'), label: 'DETIK' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col items-center justify-center py-3 sm:py-3.5 px-1.5 sm:px-2 rounded-2xl border border-[#ebdcc8] shadow-xs hover:shadow-md transition-all duration-300"
                style={{
                  background: 'rgba(255, 253, 248, 0.94)',
                }}
              >
                <div className="absolute inset-1 rounded-xl border border-dashed border-[#caa152]/30 pointer-events-none group-hover:border-[#caa152]/70 transition-colors" />
                <span className="font-cormorant text-2xl sm:text-3xl text-[#2a170b] font-normal leading-none mb-1">
                  {item.val}
                </span>
                <span className="font-cinzel text-[9px] sm:text-[10px] text-[#8a5e38] tracking-[0.2em] font-normal">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── ACTION CTA BUTTONS ── */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mt-7">
            <button
              onClick={onExplore}
              className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] hover:from-[#c9954a] hover:via-[#d8b060] hover:to-[#c69342] text-white font-cinzel text-xs font-semibold tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <span>JELAJAHI ACARA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onViewCompetitions}
              className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-white/80 hover:bg-white text-[#2a170b] font-cinzel text-xs font-medium tracking-[0.18em] border border-[#d8be99] shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              LIHAT KOMPETISI
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
