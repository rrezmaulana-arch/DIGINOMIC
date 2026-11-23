import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Animasi transisi antar halaman: menampilkan logo Digiconomic di atas tirai
 * espresso hangat sejenak (~600ms) lalu membuka halaman tujuan dengan mulus.
 */
export const PageTransitionOverlay: React.FC = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const [phase, setPhase] = useState<'idle' | 'enter' | 'exit'>('idle');

  useEffect(() => {
    // Jangan blokir render pertama kali saat baru membuka situs
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setPhase('enter');
    // Gulir ke atas di balik tirai agar tidak terasa melompat
    const scrollTimer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, 180);

    const exitTimer = window.setTimeout(() => {
      setPhase('exit');
    }, 420);

    const doneTimer = window.setTimeout(() => {
      setPhase('idle');
    }, 760);

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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #3a2415 0%, #24140a 70%, #190d06 100%)',
      }}
    >
      {/* Ring ornamen tipis berputar pelan */}
      <div className="relative flex items-center justify-center">
        <div
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-[#caa152]/40 flex items-center justify-center transition-transform duration-500 ${
            phase === 'enter' ? 'scale-100' : 'scale-110'
          }`}
          style={{
            boxShadow: '0 0 40px rgba(202, 161, 82, 0.22)',
          }}
        >
          <div className="absolute inset-2 rounded-full border border-dashed border-[#caa152]/35 spin-slow" />
          <img
            src="/Logo/00-logo-gabungan.svg"
            alt="Digiconomic Fest 2027"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_14px_rgba(202,161,82,0.35)] animate-pulse"
          />
        </div>
      </div>

      <p className="mt-4 font-cinzel text-[10px] sm:text-xs tracking-[0.35em] text-[#ebdcc8] uppercase opacity-90">
        Digiconomic Fest 2027
      </p>
    </div>
  );
};
