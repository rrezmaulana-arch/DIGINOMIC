import React from 'react';
import { Award, BadgeCheck, Lightbulb, Medal, Trophy, Users } from 'lucide-react';
import {
  BatikKawungPattern,
  SectionDivider,
} from './Ornaments';

const PODIUM_ITEMS = [
  {
    rank: 'Juara 1',
    title: 'Uang Pembinaan',
    sub: 'Trofi + E-Sertifikat',
    icon: <Trophy className="w-5 h-5 text-[#f3d48c]" />,
    featured: true,
  },
  {
    rank: 'Juara 2',
    title: 'Uang Pembinaan',
    sub: 'Trofi + E-Sertifikat',
    icon: <Medal className="w-5 h-5 text-[#e3c47f]" />,
    featured: false,
  },
  {
    rank: 'Juara 3',
    title: 'Uang Pembinaan',
    sub: 'Trofi + E-Sertifikat',
    icon: <Award className="w-5 h-5 text-[#d6b269]" />,
    featured: false,
  },
];

const BENEFITS = [
  {
    title: 'E-Sertifikat Nasional',
    desc: 'Sertifikat resmi tingkat nasional bagi seluruh peserta terverifikasi, finalis, dan juara.',
    icon: <BadgeCheck className="w-5 h-5 text-[#7a5530]" />,
  },
  {
    title: 'Jejaring Komunitas GenBI',
    desc: 'Bangun kolaborasi bersama mahasiswa dan inovator muda dari berbagai perguruan tinggi.',
    icon: <Users className="w-5 h-5 text-[#7a5530]" />,
  },
  {
    title: 'Umpan Balik Praktisi Ahli',
    desc: 'Evaluasi langsung dari akademisi, praktisi UMKM, dan perwakilan Bank Indonesia.',
    icon: <Lightbulb className="w-5 h-5 text-[#7a5530]" />,
  },
];

export const PrizeBenefitsSection: React.FC = () => {
  return (
    <section
      id="hadiah"
      aria-label="Prizes and Benefits Digiconomic Fest 2027"
      className="relative w-full pt-8 pb-10 sm:pt-10 sm:pb-14 md:pt-12 md:pb-16 px-4 sm:px-8 lg:px-12 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #f3e6d3 0%, #f1e3ce 55%, #efe1cc 100%)',
      }}
    >
      <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-prize-light" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="font-sans-body text-base sm:text-lg font-medium text-[#6b4725] leading-relaxed">
            Apresiasi &amp; Pengalaman
          </p>
          <h2 className="font-abang font-normal text-3xl sm:text-5xl text-[#2f1e10] tracking-tight mt-1">
            Prizes &amp; <span className="text-[#9a6522]">Benefits</span>
          </h2>
          <SectionDivider variant="light" />
        </div>

        {/* Main Dark Espresso Glassmorphic Prize Banner */}
        <div
          className="relative rounded-3xl border border-[#caa152]/60 p-6 sm:p-8 lg:p-10 shadow-[0_24px_56px_-18px_rgba(35,20,10,0.45)] overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse 85% 90% at 22% 50%, #4a2e1a 0%, #331e10 55%, #24140a 100%)',
          }}
        >
          <BatikKawungPattern color="#caa152" opacity={0.06} id="kawung-prize-banner" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-center">
            {/* Left Hook: Total Hadiah */}
            <div className="lg:col-span-5 space-y-2.5 text-left">
              <p className="font-poppins text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase text-[#e3c47f]">
                Total Apresiasi Kompetisi
              </p>
              <h3 className="font-abang font-normal text-4xl sm:text-5xl text-[#fffdf9] leading-[1.08] tracking-tight">
                <span className="shimmer-text">Rp 26.000.000+</span>
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#e3d0b5] leading-relaxed max-w-sm pt-1">
                Uang pembinaan resmi, trofi penghargaan, dan e-sertifikat nasional untuk setiap kategori pemenang.
              </p>
            </div>

            {/* Right: 3 Modern Podium Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {PODIUM_ITEMS.map((item) => (
                <div
                  key={item.rank}
                  className={`card-modern-hover rounded-2xl p-5 text-center backdrop-blur-sm border flex flex-col items-center justify-center ${
                    item.featured
                      ? 'bg-[#4f321c]/75 border-[#caa152]/80 shadow-[0_12px_30px_-10px_rgba(202,161,82,0.28)]'
                      : 'bg-[#3c2414]/65 border-[#caa152]/35 hover:border-[#caa152]/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#24140a]/75 border border-[#caa152]/40 flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <p className="font-poppins text-[11px] font-semibold tracking-wider uppercase text-[#e3c47f]">
                    {item.rank}
                  </p>
                  <p className="font-poppins text-sm sm:text-base font-semibold text-[#fffdf9] mt-1 leading-snug">
                    {item.title}
                  </p>
                  <p className="font-sans text-[11px] text-[#d6bfa0] mt-1">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: 3 Modern Benefit Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-12">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group card-modern-hover flex flex-col items-center text-center px-5 py-6 rounded-2xl bg-[#fffdf9]/40 border border-[#caa152]/25 hover:bg-[#fffdf9]/80 hover:border-[#caa152]/65"
            >
              <div className="w-12 h-12 rounded-full bg-[#fffdf9] border-2 border-[#caa152]/70 flex items-center justify-center shadow-xs mb-3.5 transition-all duration-300 group-hover:scale-105 group-hover:border-[#a87226] group-hover:shadow-[0_8px_20px_-6px_rgba(202,161,82,0.45)]">
                {b.icon}
              </div>
              <h4 className="font-poppins text-sm sm:text-base font-semibold text-[#241308]">
                {b.title}
              </h4>
              <p className="font-sans text-xs text-[#5c3e28] leading-relaxed mt-1.5 max-w-xs">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
