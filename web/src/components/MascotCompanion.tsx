import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Sparkles, Trophy, Calendar, MessageCircle, Compass } from 'lucide-react';
import { MASCOT_ASSETS, MASCOT_CHEERS, MASCOT_NAME } from '../data/mascot';

interface MascotCompanionProps {
  onNavigate: (target: string) => void;
}

const WHATSAPP_HELPDESK_URL = `https://wa.me/6282182324797?text=${encodeURIComponent(
  'Halo Panitia Digiconomic Fest 2027, saya membutuhkan informasi mengenai pendaftaran lomba.'
)}`;

function getRouteGreeting(pathname: string): string {
  if (pathname.startsWith('/kompetisi')) {
    return `Lagi cek cabang lomba ya? Kamu bisa ikut Esai atau Mini Case Competition bareng timmu!`;
  }
  if (pathname.startsWith('/event')) {
    return `Jangan lewatkan Technical Meeting & Awarding Night di Universitas Brawijaya ya!`;
  }
  if (pathname.startsWith('/juklak-juknis')) {
    return `Lagi baca panduan lomba? Kalau ada yang bikin bingung, langsung tanya panitia lewat tombol di bawah ya!`;
  }
  if (pathname.startsWith('/news')) {
    return `Pantau terus pengumuman resmi terbaru biar nggak kelewatan tanggal penting ya!`;
  }
  return `Halo! Aku ${MASCOT_NAME} 👋 Mau langsung cek cabang lomba, linimasa, atau kenalan sama filosofiku?`;
}

export const MascotCompanion: React.FC<MascotCompanionProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hopKey, setHopKey] = useState(0);
  const [customCheer, setCustomCheer] = useState<string | null>(null);

  useEffect(() => {
    setCustomCheer(null);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleSummon = () => {
    setIsOpen(true);
    setCustomCheer(null);
    setHopKey((k) => k + 1);
  };

  const handleTapMascot = () => {
    setHopKey((k) => k + 1);
    setCustomCheer((prev) => {
      const idx = prev ? MASCOT_CHEERS.indexOf(prev) : -1;
      return MASCOT_CHEERS[(idx + 1) % MASCOT_CHEERS.length];
    });
  };

  const handleAction = (target: string) => {
    setIsOpen(false);
    onNavigate(target);
  };

  const greetingText = customCheer || getRouteGreeting(pathname);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Summoned Companion Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={`Asisten Maskot ${MASCOT_NAME}`}
          className="pointer-events-auto mb-3 w-[calc(100vw-2rem)] max-w-[330px] relative"
        >
          {/* Flying DigiBee popping out from top-right of card */}
          <div className="flex items-end justify-end pr-2 -mb-5 relative z-20 pointer-events-none">
            <div className="mascot-fly-in pointer-events-auto relative">
              {/* Sparkle burst on summon / tap */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span
                  key={`sp1-${hopKey}`}
                  className="mascot-sparkle absolute text-[#caa152] text-sm"
                  style={{ '--sx': '-26px', '--sy': '-24px' } as React.CSSProperties}
                >
                  ✦
                </span>
                <span
                  key={`sp2-${hopKey}`}
                  className="mascot-sparkle absolute text-[#f3d48c] text-xs"
                  style={{ '--sx': '26px', '--sy': '-22px', animationDelay: '60ms' } as React.CSSProperties}
                >
                  ✦
                </span>
              </div>

              <button
                type="button"
                onClick={handleTapMascot}
                aria-label={`Sapa ${MASCOT_NAME}`}
                title={`Klik ${MASCOT_NAME}!`}
                className="block w-20 sm:w-22 cursor-pointer focus:outline-none"
              >
                <div key={hopKey} className={hopKey > 1 ? 'mascot-hop' : ''}>
                  <img
                    src={MASCOT_ASSETS.mini}
                    alt={MASCOT_NAME}
                    width={360}
                    height={528}
                    decoding="async"
                    className="mascot-float w-full h-auto object-contain select-none drop-shadow-[0_10px_14px_rgba(36,19,8,0.28)]"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Speech Card */}
          <div className="mascot-bubble-in relative rounded-3xl bg-[#fffdf9] border-2 border-[#caa152]/75 shadow-[0_20px_50px_-14px_rgba(36,19,8,0.34)] p-4 pt-5 text-[#2a1a0e]">
            <div className="flex items-center justify-between gap-2 mb-2 pr-16">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3b2412] text-[#fcedb8] font-cinzel text-[9.5px] tracking-[0.16em] uppercase font-semibold">
                <Sparkles className="w-3 h-3 text-[#caa152]" />
                <span>{MASCOT_NAME}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={`Tutup ${MASCOT_NAME}`}
              className="absolute top-3 left-auto right-3 z-30 w-7 h-7 rounded-full bg-[#f5ebda] hover:bg-[#3b2412] text-[#5c3e28] hover:text-[#fcedb8] border border-[#dfd0ba] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <p
              key={greetingText}
              className="mascot-bubble-in text-xs sm:text-[13px] text-[#3b2412] leading-relaxed font-sans mb-3.5"
            >
              {greetingText}
            </p>

            {/* Quick Navigation Shortcuts */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAction('filosofi-maskot')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf4e8] hover:bg-[#3b2412] text-[#3b2412] hover:text-[#faf4e8] border border-[#e3d1b7] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#caa152] shrink-0" />
                <span className="truncate">Filosofi {MASCOT_NAME}</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('/kompetisi')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf4e8] hover:bg-[#3b2412] text-[#3b2412] hover:text-[#faf4e8] border border-[#e3d1b7] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-[#caa152] shrink-0" />
                <span className="truncate">Cabang Lomba</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('linimasa')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf4e8] hover:bg-[#3b2412] text-[#3b2412] hover:text-[#faf4e8] border border-[#e3d1b7] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#caa152] shrink-0" />
                <span className="truncate">Jadwal Lomba</span>
              </button>

              <a
                href={WHATSAPP_HELPDESK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3b2412] hover:bg-[#52331b] text-[#fcedb8] border border-[#caa152]/70 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#f3d48c] shrink-0" />
                <span className="truncate">Tanya Panitia</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Summon Button ("Panggil DigiBee") */}
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : handleSummon())}
        aria-expanded={isOpen}
        aria-label={isOpen ? `Sembunyikan ${MASCOT_NAME}` : `Panggil Maskot ${MASCOT_NAME}`}
        className="pointer-events-auto group relative flex items-center gap-2 rounded-full p-1.5 sm:pr-4 bg-[#3b2412] hover:bg-[#2a170b] border-2 border-[#caa152] shadow-[0_12px_28px_-8px_rgba(36,19,8,0.45)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
      >
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#fffdf9] to-[#f0e0c4] border border-[#f3d48c] flex items-center justify-center p-1 overflow-hidden shrink-0">
          <img
            src={MASCOT_ASSETS.head}
            alt={MASCOT_NAME}
            width={442}
            height={400}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
          />
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="font-cinzel text-[9px] tracking-[0.18em] uppercase text-[#f3d48c] font-semibold">
            {isOpen ? 'Tutup' : 'Panggil'}
          </span>
          <span className="font-sans text-xs font-semibold text-[#fffdf9]">
            {MASCOT_NAME}
          </span>
        </div>
        {!isOpen && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#f3d48c] border-2 border-[#3b2412]"
          />
        )}
      </button>
    </div>
  );
};
