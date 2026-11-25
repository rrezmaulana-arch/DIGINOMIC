import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BatikKawungPattern } from './Ornaments';

interface AboutProps {
  onExploreComps: () => void;
}

export const About: React.FC<AboutProps> = ({ onExploreComps }) => {
  const [frontCard, setFrontCard] = useState<'kolaborasi' | 'seminar'>('seminar');

  return (
    <section
      id="tentang"
      className="relative w-full py-8 sm:py-14 md:py-20 px-3.5 sm:px-8 md:px-12 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #faf4e8 0%, #f5ebd9 25%, #efe1cc 60%, #ebdcc5 100%)',
      }}
    >
      <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-about" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── TOP SECTION: APA ITU DIGICONOMIC FEST? ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-10 lg:gap-14 items-center mb-6 sm:mb-12 md:mb-16">

          {/* Left: Title + Narrative */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-5">
            <div>
              <p className="font-cinzel text-[10px] sm:text-xs tracking-widest text-[#7a5530] font-medium mb-1 sm:mb-2">
                Tentang Acara
              </p>
              <h2 className="font-cormorant font-normal text-2xl sm:text-3xl md:text-4xl lg:text-[2.85rem] text-[#241308] tracking-tight leading-[1.15]">
                Mengenal <br />
                <span className="shimmer-text font-normal">
                  Digiconomic Fest
                </span>
              </h2>
            </div>

            <p className="font-sans text-[11.5px] sm:text-sm text-[#4a2e18] leading-[1.7] sm:leading-[1.85] font-normal">
              <strong className="text-[#241308] font-semibold">Digiconomic Fest 2027</strong> merupakan program kerja kolaboratif <strong className="text-[#241308] font-semibold">GenBI (Generasi Baru Indonesia) &amp; Bank Indonesia</strong> yang menjadi wadah edukasi, <strong className="text-[#7a5530] font-semibold underline decoration-[#caa152]/60 underline-offset-4">kompetisi ekonomi digital nasional</strong>, dan kolaborasi bagi mahasiswa untuk mengembangkan potensi UMKM di tengah dinamika <em>emerging market</em>.
            </p>

            <p className="font-sans text-[11.5px] sm:text-sm text-[#4a2e18] leading-[1.7] sm:leading-[1.85] font-normal">
              Melalui cabang <strong className="text-[#241308] font-semibold">Esai Nasional</strong>, <strong className="text-[#241308] font-semibold">Mini Case Competition</strong>, serta seminar nasional di <strong className="text-[#241308] font-semibold">Malang, Jawa Timur</strong>, festival ini mendorong inovasi nyata agar <strong className="text-[#7a5530] font-semibold">UMKM lokal</strong> semakin adaptif, berdaya saing global, dan berkelanjutan.
            </p>

            <div className="pt-1 sm:pt-2">
              <button
                onClick={onExploreComps}
                className="inline-flex items-center gap-2 px-4.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] to-[#d8a85a] hover:from-[#c9954a] hover:to-[#e0b56b] text-white font-cinzel text-[10px] sm:text-xs font-medium tracking-[0.16em] sm:tracking-[0.18em] shadow-xs hover:shadow transition-all duration-300 ease-out active:scale-95"
              >
                <span>LIHAT CABANG LOMBA</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Interactive Hover Card-Deck Polaroids */}
          <div
            onMouseLeave={() => setFrontCard('seminar')}
            className="lg:col-span-5 relative flex items-center justify-center min-h-[230px] sm:min-h-[320px] md:min-h-[360px] py-4"
          >
            {/* Kartu 1: Kolaborasi Mahasiswa */}
            <div
              onMouseEnter={() => setFrontCard('kolaborasi')}
              onClick={() => setFrontCard('kolaborasi')}
              className={`w-44 sm:w-56 md:w-64 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#fffdf9] border border-[#ebdcc8]/90 cursor-pointer absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                frontCard === 'kolaborasi'
                  ? 'z-30 -translate-x-4 sm:-translate-x-6 -translate-y-4 rotate-0 scale-105 shadow-[0_22px_45px_-12px_rgba(47,30,16,0.32)] ring-1 ring-[#caa152]/60'
                  : 'z-10 -translate-x-10 sm:-translate-x-14 -translate-y-6 -rotate-6 scale-95 shadow-md opacity-95'
              }`}
            >
              <div className="w-full h-28 sm:h-36 md:h-40 rounded-lg sm:rounded-xl overflow-hidden bg-[#e0ceb6]">
                <img loading="lazy" decoding="async"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
                  alt="Kolaborasi Mahasiswa"
                  className="w-full h-full object-cover filter sepia-[0.18]"
                />
              </div>
              <p className="font-sans-body text-center text-sm sm:text-base font-medium text-[#5c3e28] mt-2">
                Kolaborasi Mahasiswa
              </p>
            </div>

            {/* Kartu 2: Seminar Bank Indonesia */}
            <div
              onMouseEnter={() => setFrontCard('seminar')}
              onClick={() => setFrontCard('seminar')}
              className={`w-44 sm:w-56 md:w-64 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#fffdf9] border border-[#ebdcc8]/90 cursor-pointer absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                frontCard === 'seminar'
                  ? 'z-30 translate-x-6 sm:translate-x-10 translate-y-6 rotate-2 scale-105 shadow-[0_22px_45px_-12px_rgba(47,30,16,0.32)] ring-1 ring-[#caa152]/60'
                  : 'z-10 translate-x-12 sm:translate-x-16 translate-y-10 rotate-8 scale-95 shadow-md opacity-90'
              }`}
            >
              <div className="w-full h-28 sm:h-36 md:h-40 rounded-lg sm:rounded-xl overflow-hidden bg-[#e0ceb6]">
                <img loading="lazy" decoding="async"
                  src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80"
                  alt="Seminar Edukatif"
                  className="w-full h-full object-cover filter sepia-[0.15]"
                />
              </div>
              <p className="font-sans-body text-center text-sm sm:text-base font-medium text-[#5c3e28] mt-2">
                Seminar Bank Indonesia
              </p>
            </div>
          </div>

        </div>

        {/* ── MIDDLE: TEMA RESMI (Compact & Balanced on mobile) ── */}
        <div className="my-5 sm:my-10 md:my-14 text-center">
          <div
            className="p-3.5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-[#ebdcc8] shadow-xs max-w-4xl mx-auto relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #faf4e8 70%, #f4e8d2 100%)',
            }}
          >
            <div className="absolute inset-1.5 sm:inset-2 rounded-xl sm:rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />
            <span className="inline-block px-3 py-0.5 sm:px-5 sm:py-1 rounded-full bg-[#f0e3cc] text-[#7d4f2b] font-cinzel text-[8.5px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-medium mb-1.5 sm:mb-3">
              TEMA UTAMA ACARA
            </span>

            <blockquote className="font-cormorant font-normal italic text-xs sm:text-xl lg:text-2xl text-[#2a170b] leading-snug sm:leading-snug max-w-3xl mx-auto px-2">
              “Ekosistem UMKM di Negara Emerging Market: Mengakselerasi Potensi Lokal yang Berdaya Saing Global untuk Mewujudkan Pertumbuhan Berkelanjutan”
            </blockquote>

            <div className="mt-2.5 sm:mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 text-[8.5px] sm:text-[10px] font-cinzel text-[#8a5e38] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium">
              <span>✦ Divisi Pendidikan</span>
              <span>✦ Bank Indonesia</span>
              <span>✦ Divisi Kewirausahaan</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: LATAR BELAKANG & URGENSI (Horizontal Snap Carousel on mobile, Grid on desktop) ── */}
        <div className="mt-5 sm:mt-10 md:mt-14">
          <div className="flex items-center justify-between mb-3 sm:mb-8 md:mb-10 px-1">
            <div className="text-left sm:text-center sm:mx-auto">
              <p className="font-cinzel text-[10px] sm:text-xs text-[#7a5530] font-medium tracking-widest mb-0.5 sm:mb-1">
                Latar Belakang Acara
              </p>
              <h3 className="font-cormorant font-normal text-xl sm:text-2xl md:text-3xl text-[#241308]">
                Latar Belakang & Urgensi
              </h3>
            </div>
            {/* Mobile swipe hint */}
            <span className="sm:hidden text-[9px] font-cinzel text-[#8a5e38] tracking-wider uppercase bg-[#f5ede0] px-2 py-0.5 rounded-full border border-[#ebdcc8] shrink-0">
              Geser ➔
            </span>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar gap-3 pb-2 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            {[
              {
                no: '01',
                title: 'Potensi UMKM Lokal',
                desc: 'UMKM memiliki potensi besar sebagai penggerak perekonomian, tetapi masih menghadapi berbagai tantangan dalam pengembangan usaha dan perluasan pasar.',
              },
              {
                no: '02',
                title: 'Tantangan Transformasi',
                desc: 'Perubahan ekonomi dan perkembangan teknologi menuntut UMKM untuk terus beradaptasi, berinovasi, dan meningkatkan daya saing global.',
              },
              {
                no: '03',
                title: 'Peran Generasi Muda',
                desc: 'Generasi muda memiliki kreativitas, pengetahuan, dan potensi inovasi yang dapat menjadi bagian dari solusi untuk mendukung perkembangan UMKM.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="w-[80vw] sm:w-auto shrink-0 snap-center group p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-[#ebdcc8] shadow-xs hover:shadow-lg transition-all duration-300 relative flex flex-col justify-start"
                style={{ background: 'rgba(255, 253, 248, 0.94)' }}
              >
                <div className="absolute inset-1.5 sm:inset-2 rounded-lg sm:rounded-xl md:rounded-2xl border border-dashed border-[#caa152]/20 pointer-events-none group-hover:border-[#caa152]/60 transition-colors duration-300" />
                <div className="flex items-center gap-2 mb-1.5 sm:mb-3 relative z-10">
                  <div className="w-6.5 h-6.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-cinzel text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r from-[#ba883a] to-[#caa152] shadow-2xs shrink-0">
                    {item.no}
                  </div>
                  <h4 className="font-cormorant font-normal text-base sm:text-xl text-[#2a170b] group-hover:text-[#ba883a] transition-colors leading-tight">
                    {item.title}
                  </h4>
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-[#5c3e28] leading-relaxed font-normal relative z-10">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
