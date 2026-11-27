import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Hand } from 'lucide-react';
import { BatikKawungPattern, CornerFiligree, SectionDivider } from './Ornaments';
import {
  MASCOT_ASPECTS,
  MASCOT_ASSETS,
  MASCOT_CHEERS,
  MASCOT_NAME,
  type MascotAspectId,
} from '../data/mascot';

const SPARKLE_BURST = [
  { sx: '-34px', sy: '-36px', delay: '0ms', size: 'text-base' },
  { sx: '38px', sy: '-32px', delay: '40ms', size: 'text-sm' },
  { sx: '-44px', sy: '6px', delay: '70ms', size: 'text-xs' },
  { sx: '44px', sy: '12px', delay: '90ms', size: 'text-base' },
];

export const MascotSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeId, setActiveId] = useState<MascotAspectId>('lebah');
  const [hopKey, setHopKey] = useState(0);
  const [cheerIndex, setCheerIndex] = useState<number | null>(null);

  const activeAspect = MASCOT_ASPECTS.find((item) => item.id === activeId) || MASCOT_ASPECTS[0];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelectAspect = (id: MascotAspectId) => {
    setActiveId(id);
    setCheerIndex(null);
    setHopKey((k) => k + 1);
  };

  const handleGreetMascot = () => {
    setHopKey((k) => k + 1);
    setCheerIndex((prev) => (prev === null ? 0 : (prev + 1) % MASCOT_CHEERS.length));
  };

  const bubbleText = cheerIndex !== null ? MASCOT_CHEERS[cheerIndex] : activeAspect.bubble;

  const getAspectAnimClass = (kind: typeof activeAspect.animKind) => {
    switch (kind) {
      case 'flutter':
        return 'mascot-wing-flutter';
      case 'glow':
        return 'mascot-aspect-glow';
      case 'tilt':
        return 'mascot-aspect-tilt';
      case 'sheen':
        return 'mascot-aspect-glow';
      default:
        return 'mascot-float';
    }
  };

  return (
    <section
      ref={sectionRef}
      id="filosofi-maskot"
      className="relative w-full pt-4 pb-14 sm:pt-8 sm:pb-20 lg:pt-10 lg:pb-24 px-4 sm:px-8 lg:px-16 overflow-hidden bg-gradient-to-b from-[#1f1209] via-[#28170c] to-[#1d1008] text-[#faf4e8]"
    >
      <BatikKawungPattern color="#caa152" opacity={0.055} id="kawung-maskot" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── SEAMLESS ORNAMENTAL BRIDGE FROM LOGO MEANING ── */}
        <div className="mb-8 sm:mb-12 flex flex-col items-center">
          <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#caa152]/40 to-transparent mb-2" />
          <SectionDivider variant="dark" className="my-1" />
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 px-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3f2818] border border-[#caa152]/55 text-[#f3d48c] font-cinzel text-[9.5px] sm:text-[11px] tracking-widest uppercase font-semibold mb-2.5 sm:mb-3 shadow-2xs">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#caa152]" />
            <span>Maskot Resmi • Identitas Visual</span>
          </div>

          <h2 className="font-cormorant font-normal text-3xl sm:text-4xl lg:text-[2.75rem] text-[#fffdf9] tracking-tight leading-snug">
            Filosofi Maskot <span className="text-[#e8c47a]">{MASCOT_NAME}</span>
          </h2>

          <div className="flex items-center justify-center gap-2.5 my-2 sm:my-3 text-[#caa152] opacity-85">
            <span className="w-8 sm:w-14 h-px bg-gradient-to-r from-transparent to-[#caa152]" />
            <span className="text-[8px] sm:text-[9px]">✦</span>
            <span className="text-xs">✦</span>
            <span className="text-[8px] sm:text-[9px]">✦</span>
            <span className="w-8 sm:w-14 h-px bg-gradient-to-l from-transparent to-[#caa152]" />
          </div>

          <p className="font-sans text-xs sm:text-sm text-[#dec9ad] leading-relaxed">
            Perpaduan kehangatan koloni lebah dan kecerdasan teknologi digital—klik tubuh{' '}
            <strong className="text-[#f3d48c] font-semibold">{MASCOT_NAME}</strong> atau pilih 5 aspek filosofi untuk mengenal maknanya lebih dekat.
          </p>
        </div>

        {/* ── INTERACTIVE 2-COLUMN SHOWCASE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
          {/* LEFT: DIGIBEE STAGE + HOTSPOTS + SPEECH BUBBLE */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Dynamic Speech Bubble */}
            <div
              key={bubbleText}
              className="mascot-bubble-in relative mb-4 sm:mb-5 max-w-sm w-full px-4 py-3 rounded-2xl bg-[#382315] border border-[#caa152]/65 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.55)] text-center"
            >
              <p className="text-xs sm:text-[13px] text-[#faf4e8] font-sans leading-relaxed">
                &ldquo;{bubbleText}&rdquo;
              </p>
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-[#382315] border-r border-b border-[#caa152]/65"
              />
            </div>

            {/* Stage Platform */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-[300px] sm:max-w-[330px] pt-2 pb-6">
              {/* Warm honey-gold spotlight aura */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-2 rounded-full opacity-90"
                style={{
                  background:
                    'radial-gradient(circle, rgba(202, 161, 82, 0.42) 0%, rgba(243, 212, 140, 0.14) 46%, transparent 72%)',
                }}
              />
              {/* Subtle double orbit rings matching LogoMeaning */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-68 h-68 sm:w-76 sm:h-76 rounded-full border border-[#caa152]/20 spin-reverse-slow"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full border border-dashed border-[#caa152]/40 spin-slow"
              />

              {/* Flying / Floating Mascot Container */}
              <div className={`relative z-10 w-56 sm:w-64 ${hasEntered ? 'mascot-fly-in' : 'opacity-0'}`}>
                <div key={hopKey} className={hopKey > 0 ? 'mascot-hop' : ''}>
                  <div className="mascot-float relative">
                    {/* Sparkle Burst on click / aspect change */}
                    {hopKey > 0 && (
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
                        {SPARKLE_BURST.map((sp, i) => (
                          <span
                            key={`${hopKey}-${i}`}
                            className={`mascot-sparkle absolute text-[#f3d48c] select-none ${sp.size}`}
                            style={
                              {
                                '--sx': sp.sx,
                                '--sy': sp.sy,
                                animationDelay: sp.delay,
                              } as React.CSSProperties
                            }
                          >
                            ✦
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleGreetMascot}
                      aria-label={`Sapa maskot ${MASCOT_NAME}`}
                      className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3d48c] rounded-3xl cursor-pointer group"
                    >
                      <img
                        src={MASCOT_ASSETS.main}
                        alt={`Maskot resmi ${MASCOT_NAME} Digiconomic Fest 2027`}
                        width={720}
                        height={1055}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-contain select-none transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </button>

                    {/* 5 Interactive Gold Hotspot Pins */}
                    {MASCOT_ASPECTS.map((item, idx) => {
                      const isActive = item.id === activeId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectAspect(item.id)}
                          aria-label={`Lihat filosofi ${item.title}`}
                          aria-pressed={isActive}
                          style={{ left: item.hotspot.x, top: item.hotspot.y }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer focus:outline-none"
                        >
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="mascot-hotspot-ping absolute inset-0 rounded-full bg-[#f3d48c]"
                            />
                          )}
                          <span
                            className={`relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] font-cinzel font-bold border-2 transition-all duration-250 shadow-sm ${
                              isActive
                                ? 'bg-[#f3d48c] text-[#241308] border-[#fffdf9] scale-115 shadow-[0_0_18px_rgba(243,212,140,0.85)]'
                                : 'bg-[#2a170b]/95 text-[#f3d48c] border-[#caa152] hover:bg-[#f3d48c] hover:text-[#241308] hover:scale-110'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="pointer-events-none hidden sm:block absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#fffdf9] text-[#241308] text-[10px] font-sans font-semibold opacity-0 group-hover/pin:opacity-100 transition-opacity shadow-md">
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Grounded Breathing Shadow */}
              <div
                aria-hidden="true"
                className="mascot-shadow w-36 sm:w-44 h-4 rounded-full bg-black/55 blur-[7px] -mt-2"
              />
            </div>

            {/* Interactive Greet Button */}
            <button
              type="button"
              onClick={handleGreetMascot}
              className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-[#382315] hover:bg-[#caa152] text-[#fcedb8] hover:text-[#241308] border border-[#caa152]/70 font-cinzel text-[11px] tracking-[0.16em] uppercase font-semibold transition-all duration-250 shadow-sm active:scale-95 cursor-pointer"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Sapa {MASCOT_NAME}</span>
            </button>
          </div>

          {/* RIGHT: SPOTLIGHT CARD + 5 ASPECT SELECTOR */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Aspect Spotlight Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#3c2515] via-[#311d10] to-[#26160b] border border-[#caa152]/65 p-5 sm:p-7 text-[#faf4e8] shadow-[0_20px_50px_-14px_rgba(0,0,0,0.6)] overflow-hidden">
              <CornerFiligree color="#caa152" className="opacity-50" />
              <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/25 pointer-events-none" />

              <div
                key={activeAspect.id}
                className="mascot-bubble-in relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
              >
                {/* Animated 3D Cutout Preview */}
                <div className="sm:col-span-5 flex items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-b from-[#ffffff] via-[#faf4e8] to-[#ebd9be] border-2 border-[#f3d48c]/85 shadow-[0_12px_32px_rgba(202,161,82,0.32)] flex items-center justify-center p-4 overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 45%, rgba(202,161,82,0.18) 0%, transparent 72%)',
                      }}
                    />
                    <img
                      src={activeAspect.image}
                      alt={activeAspect.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className={`relative z-10 max-w-full max-h-full object-contain select-none ${getAspectAnimClass(
                        activeAspect.animKind
                      )}`}
                    />
                  </div>
                </div>

                {/* Aspect Copy */}
                <div className="sm:col-span-7 text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#24140a]/90 border border-[#caa152]/55">
                    <span className="font-cinzel text-[10px] font-semibold tracking-widest uppercase text-[#f3d48c]">
                      {activeAspect.code}
                    </span>
                    <span className="text-[#caa152] text-[10px]">•</span>
                    <span className="font-sans text-[10.5px] text-[#e8d2ad]">
                      {activeAspect.tagline}
                    </span>
                  </div>

                  <h3 className="font-cormorant text-2xl sm:text-3xl font-normal text-[#fffdf9] leading-tight">
                    {activeAspect.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[#e8d7be] leading-relaxed">
                    {activeAspect.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Interactive Philosophy Aspect Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {MASCOT_ASPECTS.map((item, idx) => {
                const isSelected = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectAspect(item.id)}
                    onMouseEnter={() => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        setActiveId(item.id);
                        setCheerIndex(null);
                      }
                    }}
                    aria-pressed={isSelected}
                    className={`card-modern-hover text-left p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer ${
                      idx === 4 ? 'sm:col-span-2 lg:col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-[#4a2e1a] border-[#f3d48c] text-[#fffdf9] shadow-[0_10px_26px_-10px_rgba(202,161,82,0.4)] ring-1 ring-[#caa152]/65'
                        : 'bg-[#342013]/90 border-[#caa152]/30 hover:border-[#caa152]/70 text-[#faf4e8] shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center p-1.5 border ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#ffffff] to-[#f4e6cc] border-[#f3d48c]'
                          : 'bg-[#faf4e8] border-[#caa152]/45'
                      }`}
                    >
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`block font-cinzel text-[9px] tracking-[0.18em] uppercase font-semibold ${
                          isSelected ? 'text-[#f3d48c]' : 'text-[#d8b467]'
                        }`}
                      >
                        0{idx + 1} • {item.tagline}
                      </span>
                      <span className="block font-cormorant text-lg font-semibold leading-snug truncate text-[#fffdf9]">
                        {item.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
