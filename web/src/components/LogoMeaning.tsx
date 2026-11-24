import React, { useState } from 'react';
import { Compass, TrendingUp, Cpu, RefreshCw, Sparkles } from 'lucide-react';
import { CompassWatermark, BatikKawungPattern, MegaMendungClouds } from './Ornaments';
import { AnimatedDigiconomicLogo } from './AnimatedDigiconomicLogo';

interface LogoElement {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
}

export const LogoMeaning: React.FC = () => {
  const [activeElement, setActiveElement] = useState<number | null>(null);

  const elements: LogoElement[] = [
    {
      id: 1,
      code: 'Filosofi 01',
      title: 'Bentuk Huruf D',
      subtitle: 'Identitas & Progresivitas',
      desc: 'Melambangkan Digiconomic Fest, jati diri entitas, serta tekad generasi muda untuk terus melangkah maju mengakselerasi perekonomian bangsa.',
      icon: <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#caa152]" />,
    },
    {
      id: 2,
      code: 'Filosofi 02',
      title: 'Grafik Pertumbuhan',
      subtitle: 'Eskalasi Skala Usaha UMKM',
      desc: 'Bentuk bar dinamis melambangkan kurva kenaikan omset, ekspansi digital, serta daya ungkit UMKM lokal menuju panggung pasar internasional.',
      icon: <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#caa152]" />,
    },
    {
      id: 3,
      code: 'Filosofi 03',
      title: 'Elemen Digital & Teknologi',
      subtitle: 'Transformasi Finansial Modern',
      desc: 'Representasi modernisasi teknologi, pembayaran nirsentuh (QRIS), kecerdasan digital, dan otomasi manajemen usaha kekinian.',
      icon: <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#caa152]" />,
    },
    {
      id: 4,
      code: 'Filosofi 04',
      title: 'Garis Melengkung Sinergis',
      subtitle: 'Kolaborasi Multi-Pihak',
      desc: 'Garis kurva harmonis melambangkan keterhubungan erat antara Bank Indonesia, akademisi, mahasiswa, dan para pelaku UMKM.',
      icon: <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#caa152]" />,
    },
  ];

  const logoColorPalette = [
    {
      title: 'Emas Mulia',
      code: '#CAA152',
      meaning: 'Melambangkan kejayaan, kemakmuran ekonomi UMKM, dan supremasi prestasi juara.',
      previewBg: 'bg-[#caa152]',
      borderAccent: 'border-[#caa152]/70',
    },
    {
      title: 'Espresso Gelap',
      code: '#2F1E10',
      meaning: 'Melambangkan ketegasan fondasi, integritas ilmiah, serta stabilitas perekonomian bangsa.',
      previewBg: 'bg-[#2f1e10]',
      borderAccent: 'border-[#7a5530]/50',
    },
    {
      title: 'Linen & Gading',
      code: '#FAF4E8',
      meaning: 'Melambangkan kanvas keterbukaan ide kreatif dan sinergi inklusif tanpa batas.',
      previewBg: 'bg-[#faf4e8]',
      borderAccent: 'border-[#ebdcc8]',
    },
  ];

  const toggleMobileElement = (id: number) => {
    setActiveElement((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="makna-logo"
      className="relative w-full py-8 sm:py-16 lg:py-24 px-3.5 sm:px-8 lg:px-16 overflow-hidden bg-gradient-to-b from-[#2f1d10] via-[#26160c] to-[#1f1209] text-[#faf4e8]"
    >
      <CompassWatermark color="#caa152" className="absolute -bottom-24 -left-24 w-80 h-80 opacity-[0.06]" />
      <BatikKawungPattern color="#caa152" opacity={0.06} id="kawung-logo" />
      <MegaMendungClouds color="#caa152" className="absolute top-6 -right-14 w-64 sm:w-80 opacity-50" />
      <MegaMendungClouds color="#caa152" flip className="absolute bottom-6 -left-14 w-64 sm:w-80 opacity-45" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-12 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[#3f2818] border border-[#caa152]/50 text-[#f3d48c] font-cinzel text-[8.5px] sm:text-[11px] tracking-widest uppercase font-semibold mb-1.5 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#caa152]" />
            <span>Identitas & Filosofi Visual</span>
          </div>

          <h2 className="font-cormorant font-normal text-2xl sm:text-4xl lg:text-[2.75rem] text-[#fffdf9] tracking-tight leading-snug">
            Makna di Balik <span className="shimmer-text">Simbol & Rona Logo</span>
          </h2>

          <div className="flex items-center justify-center gap-2.5 my-1.5 sm:my-3 text-[#caa152] opacity-80">
            <span className="w-8 sm:w-14 h-px bg-gradient-to-r from-transparent to-[#caa152]" />
            <span className="text-[8px] sm:text-[9px]">✦</span>
            <span className="text-xs">✦</span>
            <span className="text-[8px] sm:text-[9px]">✦</span>
            <span className="w-8 sm:w-14 h-px bg-gradient-to-l from-transparent to-[#caa152]" />
          </div>

          <p className="font-sans text-[11px] sm:text-sm text-[#dec9ad] leading-relaxed font-normal">
            Setiap lengkungan kurva, pilar grafis, dan rona emas diciptakan dengan filosofi mendalam sebagai representasi kebangkitan ekonomi kreatif dan digitalisasi UMKM.
          </p>
        </div>

        {/* ── MEDALLION MOBILE (<lg): Terkunci 1:1 & Interaktif ── */}
        <div className="flex flex-col items-center justify-center py-3 sm:py-5 lg:hidden">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full blur-xl opacity-45 pointer-events-none bg-[radial-gradient(circle,rgba(202,161,82,0.5)_0%,transparent_70%)]" />
            <div className="absolute w-36 h-36 rounded-full border border-[#caa152]/35 border-dashed spin-slow pointer-events-none" />
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center p-4 border-2 border-[#caa152] shadow-[0_8px_24px_rgba(202,161,82,0.25)] bg-gradient-to-b from-[#ffffff] via-[#faf4e8] to-[#ebdcc8]">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-[#caa152]/50 pointer-events-none" />
              <AnimatedDigiconomicLogo
                mode="showcase"
                activePhilosophy={activeElement}
                className="w-20 h-20"
                showSheen
                replayOnClick
              />
            </div>
          </div>
          <p className="mt-2.5 text-[10px] text-[#dec9ad]/80 font-sans">
            Ketuk kartu filosofi di bawah untuk menyorot elemen logo
          </p>
        </div>

        {/* ── RESPONSIVE SHOWCASE: 3-Column on Desktop (>=lg) ── */}
        <div className="hidden lg:grid grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Cards: Filosofi 01 & 02 */}
          <div className="lg:col-span-4 space-y-4">
            {elements.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setActiveElement(item.id)}
                onMouseLeave={() => setActiveElement(null)}
                className={`p-5 rounded-2xl border transition-all duration-300 relative cursor-pointer group ${
                  activeElement === item.id
                    ? 'bg-[#452b1a] border-[#caa152] shadow-md -translate-y-0.5 ring-1 ring-[#caa152]/60'
                    : 'bg-[#382315]/90 border-[#caa152]/30 shadow-2xs hover:shadow-xs hover:border-[#caa152]/60'
                }`}
              >
                <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#caa152]/20 pointer-events-none group-hover:border-[#caa152]/50 transition-colors" />
                <div className="flex items-center justify-between gap-2 mb-1 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="font-cinzel text-[11px] font-semibold text-[#e3c47f]">{item.code}</span>
                    <span className="text-[#caa152] text-[10px]">•</span>
                    <span className="text-[10px] text-[#e3c47f] font-medium font-sans">{item.subtitle}</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-[#faf4e8] border border-[#ebdcc8] flex items-center justify-center shadow-2xs shrink-0">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-cormorant text-xl font-normal text-[#fffdf9] group-hover:text-[#f3d48c] transition-colors relative z-10 leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-[#dec9ad] leading-relaxed font-normal relative z-10">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Center Medallion — Terkunci 1:1 dengan 8-Layer Assembly & Interactive Highlight */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-76 h-76 rounded-full blur-xl opacity-60 pointer-events-none bg-[radial-gradient(circle,rgba(202,161,82,0.45)_0%,rgba(202,161,82,0.15)_50%,transparent_75%)]" />
              <div className="absolute w-84 h-84 rounded-full border border-[#caa152]/25 spin-reverse-slow pointer-events-none" />
              <div className="absolute w-76 h-76 rounded-full border border-[#caa152]/40 border-dashed spin-slow pointer-events-none" />
              <div className="w-64 h-64 rounded-full flex items-center justify-center p-7 border-2 border-[#caa152] shadow-[0_12px_40px_rgba(202,161,82,0.25)] relative group bg-gradient-to-b from-[#ffffff] via-[#faf4e8] to-[#ebdcc8]">
                <div className="absolute inset-2.5 rounded-full border border-dashed border-[#caa152]/50 pointer-events-none" />
                <AnimatedDigiconomicLogo
                  mode="showcase"
                  activePhilosophy={activeElement}
                  className="w-40 h-40 relative z-10"
                  showSheen
                  replayOnClick
                />
              </div>
            </div>
            <p className="mt-5 text-[11px] text-[#dec9ad]/75 font-sans tracking-wide">
              Arahkan ke kartu filosofi untuk menyorot elemen • Klik logo untuk putar ulang
            </p>
          </div>

          {/* Right Cards: Filosofi 03 & 04 */}
          <div className="lg:col-span-4 space-y-4">
            {elements.slice(2, 4).map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setActiveElement(item.id)}
                onMouseLeave={() => setActiveElement(null)}
                className={`p-5 rounded-2xl border transition-all duration-300 relative cursor-pointer group ${
                  activeElement === item.id
                    ? 'bg-[#452b1a] border-[#caa152] shadow-md -translate-y-0.5 ring-1 ring-[#caa152]/60'
                    : 'bg-[#382315]/90 border-[#caa152]/30 shadow-2xs hover:shadow-xs hover:border-[#caa152]/60'
                }`}
              >
                <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#caa152]/20 pointer-events-none group-hover:border-[#caa152]/50 transition-colors" />
                <div className="flex items-center justify-between gap-2 mb-1 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="font-cinzel text-[11px] font-semibold text-[#e3c47f]">{item.code}</span>
                    <span className="text-[#caa152] text-[10px]">•</span>
                    <span className="text-[10px] text-[#e3c47f] font-medium font-sans">{item.subtitle}</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-[#faf4e8] border border-[#ebdcc8] flex items-center justify-center shadow-2xs shrink-0">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-cormorant text-xl font-normal text-[#fffdf9] group-hover:text-[#f3d48c] transition-colors relative z-10 leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-[#dec9ad] leading-relaxed font-normal relative z-10">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE CARD LAYOUT: 2-Column Grid Interaktif ── */}
        <div className="grid grid-cols-2 lg:hidden gap-2 sm:gap-3 mt-2 sm:mt-4">
          {elements.map((item) => {
            const isSelected = activeElement === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleMobileElement(item.id)}
                className={`text-left p-2.5 sm:p-4 rounded-xl border shadow-xs relative flex flex-col justify-start transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#452b1a] border-[#caa152] ring-1 ring-[#caa152]/60'
                    : 'bg-[#382315]/90 border-[#caa152]/35'
                }`}
              >
                <div className="absolute inset-1 rounded-lg border border-dashed border-[#caa152]/20 pointer-events-none" />
                <div className="flex items-center justify-between gap-1 mb-1 relative z-10 w-full">
                  <span className="font-cinzel text-[9px] font-semibold text-[#e3c47f]">{item.code}</span>
                  <div className="w-5 h-5 rounded-md bg-[#24140a] border border-[#caa152]/40 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-cormorant text-sm sm:text-base font-medium text-[#fffdf9] leading-tight mb-0.5 relative z-10">
                  {item.title}
                </h3>
                <p className="font-sans text-[10px] sm:text-[11px] text-[#dec9ad] leading-snug font-normal relative z-10 line-clamp-3">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── FILOSOFI RONA & WARNA LOGO: 3 Kolom Berdampingan ── */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#caa152]/30 relative z-10">
          <div className="text-center mb-2.5 sm:mb-5">
            <span className="font-cinzel text-[10px] sm:text-xs text-[#e3c47f] font-semibold tracking-wider">
              Filosofi Rona & Gradasi Logo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {logoColorPalette.map((color, idx) => (
              <div
                key={idx}
                className="card-modern-hover p-4 sm:p-5 rounded-2xl bg-[#382315]/90 border border-[#caa152]/35 hover:border-[#caa152]/75 shadow-md flex flex-col items-center text-center"
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${color.previewBg} border ${color.borderAccent} shadow-2xs flex items-center justify-center mb-1`}
                >
                  <span className="text-[7px] sm:text-[9px] text-[#caa152] select-none">✦</span>
                </div>

                <h4 className="font-cormorant font-normal text-xs sm:text-sm text-[#fffdf9] leading-tight">
                  {color.title}
                </h4>
                <span className="text-[10px] font-mono text-[#f3d48c] font-semibold bg-[#24140a] px-2.5 py-0.5 rounded-full border border-[#caa152]/40 mt-1.5">
                  {color.code}
                </span>
                <p className="text-xs text-[#e3d0b5] leading-relaxed mt-2 font-sans">
                  {color.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};