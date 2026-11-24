import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatedDigiconomicLogo } from './AnimatedDigiconomicLogo';

/**
 * Animasi transisi antar halaman: merakit 8 layer SVG logo Digiconomic
 * secara sinematik di atas tirai espresso-emas (~900ms) lalu membuka halaman tujuan.
 */
export const PageTransitionOverlay: React.FC = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const [phase, setPhase] = useState<'idle' | 'enter' | 'exit'>('idle');
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    // Jangan blokir render pertama kali saat baru membuka situs
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setTransitionKey((k) => k + 1);
    setPhase('enter');

    // Gulir ke atas di balik tirai agar tidak terasa melompat
    const scrollTimer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, 200);

    // Beri jeda cukup agar 8 layer selesai dirakit + kilau emas sempat menyapu
    const exitTimer = window.setTimeout(() => {
      setPhase('exit');
    }, 680);

    const doneTimer = window.setTimeout(() => {
      setPhase('idle');
    }, 1020);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [location.pathname]);

  if (phase === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ease-out ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 46%, #3d2616 0%, #24140a 65%, #160b04 100%)',
      }}
    >
      {/* Medallion konsentris tipis & presisi */}
      <div
        className={`relative flex items-center justify-center transition-transform duration-500 ease-out ${
          phase === 'exit' ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Halo lembut hangat */}
        <div
          className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full blur-2xl opacity-45"
          style={{
            background: 'radial-gradient(circle, rgba(202, 161, 82, 0.5) 0%, transparent 70%)',
          }}
        />

        {/* Orbit luar tipis berputar berlawanan */}
        <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-[#caa152]/25 spin-reverse-slow" />

        {/* Lingkaran utama dengan orbit putus-putus */}
        <div
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-[#caa152]/50 bg-[#2a180d]/85 backdrop-blur-xs flex items-center justify-center"
          style={{
            boxShadow: '0 12px 40px rgba(202, 161, 82, 0.22), inset 0 1px 0 rgba(255, 240, 200, 0.16)',
          }}
        >
          <div className="absolute inset-2 rounded-full border border-dashed border-[#caa152]/35 spin-slow" />
          <AnimatedDigiconomicLogo
            key={transitionKey}
            mode="transition"
            className="w-16 h-16 sm:w-20 sm:h-20"
            showSheen
          />
        </div>
      </div>

      {/* Label tipografi mewah */}
      <div className="mt-5 flex items-center gap-3 opacity-90">
        <span className="w-6 h-px bg-gradient-to-r from-transparent to-[#caa152]/70" />
        <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.34em] text-[#f3d48c] uppercase">
          Digiconomic Fest 2027
        </p>
        <span className="w-6 h-px bg-gradient-to-l from-transparent to-[#caa152]/70" />
      </div>
    </div>
  );
};