import React, { useState } from 'react';
import { Compass, TrendingUp, Cpu, RefreshCw, Sparkles } from 'lucide-react';

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
      icon: <Compass className="w-4 h-4 text-[#caa152]" />,
    },
    {
      id: 2,
      code: 'Filosofi 02',
      title: 'Grafik Pertumbuhan',
      subtitle: 'Eskalasi Skala Usaha UMKM',
      desc: 'Bentuk bar dinamis melambangkan kurva kenaikan omset, ekspansi digital, serta daya ungkit UMKM lokal menuju panggung pasar internasional.',
      icon: <TrendingUp className="w-4 h-4 text-[#caa152]" />,
    },
    {
      id: 3,
      code: 'Filosofi 03',
      title: 'Elemen Digital & Teknologi',
      subtitle: 'Transformasi Finansial Modern',
      desc: 'Representasi modernisasi teknologi, pembayaran nirsentuh (QRIS), kecerdasan digital, dan otomasi manajemen usaha kekinian.',
      icon: <Cpu className="w-4 h-4 text-[#caa152]" />,
    },
    {
      id: 4,
      code: 'Filosofi 04',
      title: 'Garis Melengkung Sinergis',
      subtitle: 'Kolaborasi Multi-Pihak',
      desc: 'Garis kurva harmonis melambangkan keterhubungan erat antara Bank Indonesia, akademisi, mahasiswa, dan para pelaku UMKM.',
      icon: <RefreshCw className="w-4 h-4 text-[#caa152]" />,
    },
  ];

  const logoColorPalette = [
    {
      title: 'Emas Mulia',
      code: '#CAA152',
      meaning: 'Melambangkan kejayaan, kemakmuran ekonomi UMKM, serta prestise pencapaian juara pada kompetisi tingkat nasional.',
      previewBg: 'bg-[#caa152]',
      borderAccent: 'border-[#caa152]/70',
    },
    {
      title: 'Espresso Gelap',
      code: '#2F1E10',
      meaning: 'Melambangkan ketegasan fondasi, kedalaman riset analitis, integritas ilmiah, serta stabilitas perekonomian bangsa.',
      previewBg: 'bg-[#2f1e10]',
      borderAccent: 'border-[#7a5530]/50',
    },
    {
      title: 'Linen & Gading',
      code: '#FAF4E8',
      meaning: 'Melambangkan kanvas keterbukaan ide kreatif, ketulusan pengabdian mahasiswa, dan sinergi inklusif tanpa batas.',
      previewBg: 'bg-[#faf4e8]',
      borderAccent: 'border-[#ebdcc8]',
    },
  ];

  return (
    <section
      id="makna-logo"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden bg-gradient-to-b from-[#f7efe0] via-[#faf4e8] to-[#fdf8ef]"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f0e3cc] border border-[#d8be99] text-[#7a5530] font-cinzel text-[10px] sm:text-[11px] tracking-widest uppercase font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Identitas & Filosofi Visual</span>
          </div>

          <h2 className="font-cormorant font-normal text-3xl sm:text-4xl lg:text-[2.75rem] text-[#241308] tracking-tight leading-snug">
            Makna di Balik <span className="shimmer-text">Simbol & Rona Logo</span>
          </h2>

          <div className="flex items-center justify-center gap-3 my-3 text-[#caa152] opacity-80">
            <span className="w-10 sm:w-14 h-px bg-gradient-to-r from-transparent to-[#caa152]" />
            <span className="text-[10px]">✦</span>
            <span className="text-xs">✦</span>
            <span className="text-[10px]">✦</span>
            <span className="w-10 sm:w-14 h-px bg-gradient-to-l from-transparent to-[#caa152]" />
          </div>

          <p className="font-sans text-xs sm:text-sm text-[#5c3e28] leading-relaxed font-normal">
            Setiap lengkungan kurva, pilar grafis, dan rona emas diciptakan dengan filosofi mendalam sebagai representasi kebangkitan ekonomi kreatif dan digitalisasi UMKM.
          </p>
        </div>

        {/* ── RESPONSIVE 3-COLUMN SHOWCASE (Mobile: Stacked cleanly, Desktop: 3-Col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          
          {/* Left Cards: Filosofi 01 & 02 */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-2 lg:order-1">
            {elements.slice(0, 2).map((item) => {
              const isActive = activeElement === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveElement(item.id)}
                  onMouseLeave={() => setActiveElement(null)}
                  className={`p-5 sm:p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300 relative cursor-pointer group ${
                    isActive
                      ? 'bg-[#fffdf9] border-[#caa152] shadow-md -translate-y-0.5 ring-1 ring-[#caa152]/60'
                      : 'bg-white/85 border-[#ebdcc8] shadow-2xs hover:shadow-xs hover:border-[#caa152]/60'
                  }`}
                >
                  <div className="absolute inset-1.5 sm:inset-2 rounded-xl border border-dashed border-[#caa152]/20 pointer-events-none group-hover:border-[#caa152]/50 transition-colors" />

                  <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
                    <span className="font-cinzel text-[11px] font-semibold text-[#7a5530]">
                      {item.code}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-[#faf4e8] border border-[#ebdcc8] flex items-center justify-center shadow-2xs">
                      {item.icon}
                    </div>
                  </div>

                  <h3 className="font-cormorant text-xl font-normal text-[#241308] group-hover:text-[#ba883a] transition-colors relative z-10">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-[#7a5530] font-medium mb-1.5 relative z-10 font-sans">
                    {item.subtitle}
                  </p>

                  <p className="font-sans text-xs text-[#5c3e28] leading-relaxed font-normal relative z-10">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Center Medallion with Surround Lighting & Orbit Effects */}
          <div className="lg:col-span-4 flex items-center justify-center py-6 lg:py-0 order-1 lg:order-2">
            <div className="relative flex items-center justify-center">
              
              {/* Outer Golden Ambient Halo / Radiant Breathing Backlight */}
              <div
                className="absolute w-56 h-56 sm:w-68 sm:h-68 lg:w-76 lg:h-76 rounded-full pointer-events-none blur-2xl opacity-60 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle, rgba(202, 161, 82, 0.45) 0%, rgba(202, 161, 82, 0.15) 50%, transparent 75%)',
                }}
              />

              {/* Slow-Rotating Outer Dashed Celestial Ring */}
              <div className="absolute w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full border border-[#caa152]/40 border-dashed spin-slow pointer-events-none" />

              {/* Second Pulsing Ring */}
              <div className="absolute w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full border border-[#caa152]/25 pointer-events-none animate-pulse" />

              {/* Cardinal Compass Stars */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#caa152] text-xs select-none">✦</div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[#caa152] text-xs select-none">✦</div>
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-[#caa152] text-xs select-none">✦</div>
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-[#caa152] text-xs select-none">✦</div>

              {/* Central Medallion Base (Responsive Size with Glowing Dropshadow) */}
              <div
                className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full flex items-center justify-center p-4 sm:p-5 border-2 border-[#caa152] shadow-[0_12px_40px_rgba(202,161,82,0.25)] relative group transition-all duration-300"
                style={{
                  background: 'radial-gradient(circle, #ffffff 40%, #faf4e8 75%, #ebdcc8 100%)',
                }}
              >
                <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-dashed border-[#caa152]/50 pointer-events-none" />
                
                <img
                  src="/Logo/00-logo-gabungan.svg"
                  alt="Logo Resmi Digiconomic Fest 2027"
                  className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 object-contain filter drop-shadow(0 6px 14px rgba(70,36,10,0.22)) group-hover:scale-105 transition-transform duration-300 relative z-10"
                />
              </div>
            </div>
          </div>

          {/* Right Cards: Filosofi 03 & 04 */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-5 order-3">
            {elements.slice(2, 4).map((item) => {
              const isActive = activeElement === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveElement(item.id)}
                  onMouseLeave={() => setActiveElement(null)}
                  className={`p-5 sm:p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300 relative cursor-pointer group ${
                    isActive
                      ? 'bg-[#fffdf9] border-[#caa152] shadow-md -translate-y-0.5 ring-1 ring-[#caa152]/60'
                      : 'bg-white/85 border-[#ebdcc8] shadow-2xs hover:shadow-xs hover:border-[#caa152]/60'
                  }`}
                >
                  <div className="absolute inset-1.5 sm:inset-2 rounded-xl border border-dashed border-[#caa152]/20 pointer-events-none group-hover:border-[#caa152]/50 transition-colors" />

                  <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
                    <span className="font-cinzel text-[11px] font-semibold text-[#7a5530]">
                      {item.code}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-[#faf4e8] border border-[#ebdcc8] flex items-center justify-center shadow-2xs">
                      {item.icon}
                    </div>
                  </div>

                  <h3 className="font-cormorant text-xl font-normal text-[#241308] group-hover:text-[#ba883a] transition-colors relative z-10">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-[#7a5530] font-medium mb-1.5 relative z-10 font-sans">
                    {item.subtitle}
                  </p>

                  <p className="font-sans text-xs text-[#5c3e28] leading-relaxed font-normal relative z-10">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* ── FILOSOFI RONA & WARNA LOGO (Responsive Grid: 1 col on mobile, 3 cols on md+) ── */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#ebdcc8]/80 relative z-10">
          <div className="text-center mb-6">
            <span className="font-cinzel text-xs text-[#7a5530] font-semibold tracking-wider">
              Filosofi Rona & Gradasi Logo
            </span>
            <p className="text-xs text-[#5c3e28] mt-1 font-sans">
              Tiga warna inti yang menyusun identitas visual resmi Digiconomic Fest 2027
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {logoColorPalette.map((color, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/80 border border-[#ebdcc8] shadow-2xs hover:shadow-xs transition-all flex items-start gap-3.5"
              >
                {/* Color Swatch Dot */}
                <div
                  className={`w-9 h-9 rounded-xl ${color.previewBg} border ${color.borderAccent} shadow-xs shrink-0 flex items-center justify-center mt-0.5`}
                >
                  <span className="text-[10px] text-[#caa152] select-none">✦</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-cormorant font-normal text-base text-[#241308]">
                      {color.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[#7a5530] font-semibold bg-[#faf4e8] px-2 py-0.5 rounded border border-[#ebdcc8]">
                      {color.code}
                    </span>
                  </div>
                  <p className="text-xs text-[#5c3e28] leading-relaxed mt-1 font-sans font-normal">
                    {color.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
