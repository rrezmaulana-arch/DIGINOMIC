import React, { useState } from 'react';
import { Competition } from '../types';
import { COMPETITIONS_DATA } from '../data/competitions';
import { ArrowRight, BookOpen, Trophy, Sparkles, Award } from 'lucide-react';

interface CompetitionsProps {
  onSelectCompetition: (comp: Competition) => void;
}

export const Competitions: React.FC<CompetitionsProps> = ({ onSelectCompetition }) => {
  const [modal, setModal] = useState<Competition | null>(null);

  return (
    <section
      id="kompetisi"
      className="relative w-full py-8 sm:py-14 md:py-20 px-3 sm:px-6 md:px-8 lg:px-12 overflow-hidden bg-[#fdf8ef]"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ── ROYAL PAVILION CARD ── */}
        <div
          className="relative rounded-2xl sm:rounded-[36px] md:rounded-[48px] lg:rounded-[56px] border-2 border-[#caa152]/70 shadow-[0_12px_40px_-10px_rgba(47,30,16,0.32)] p-3.5 sm:p-7 md:p-10 lg:p-14 overflow-hidden transition-all duration-300"
          style={{
            background: 'radial-gradient(ellipse 90% 80% at 50% 30%, #3a2415 0%, #2b1a0e 65%, #20130a 100%)',
          }}
        >
          {/* Inner Dashed Border */}
          <div className="absolute inset-1 sm:inset-3 rounded-xl sm:rounded-[28px] md:rounded-[40px] lg:rounded-[48px] border border-dashed border-[#caa152]/35 pointer-events-none" />

          {/* Ambient Warm Golden Stardust inside pavilion */}
          <div
            className="absolute inset-0 pointer-events-none select-none z-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(202, 161, 82, 0.28) 0%, transparent 65%)',
            }}
          />

          {/* Decorative Corner Stars */}
          <span className="absolute top-2.5 left-3.5 text-[#caa152]/40 text-xs sm:text-sm select-none pointer-events-none">✦</span>
          <span className="absolute top-2.5 right-3.5 text-[#caa152]/40 text-xs sm:text-sm select-none pointer-events-none">✦</span>
          <span className="absolute bottom-2.5 left-3.5 text-[#caa152]/40 text-xs sm:text-sm select-none pointer-events-none">✦</span>
          <span className="absolute bottom-2.5 right-3.5 text-[#caa152]/40 text-xs sm:text-sm select-none pointer-events-none">✦</span>

          {/* ── SECTION HEADER ── */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-8 md:mb-12 gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-[#caa152]/30">
            <div className="space-y-1.5 sm:space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#462d1a] border border-[#caa152]/60 text-[#fcedb8] font-cinzel text-[9px] sm:text-xs tracking-wider font-semibold shadow-xs">
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#caa152]" />
                <span>Kompetisi Nasional 2027</span>
              </div>

              <h2 className="font-cormorant font-normal text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem] text-[#fffdfa] tracking-tight leading-[1.14]">
                Cabang <span className="shimmer-text">Kompetisi Resmi</span>
              </h2>

              <p className="font-sans text-[11px] sm:text-xs md:text-sm text-[#e4ceaa] leading-relaxed font-normal">
                Wadah unjuk inovasi bagi UMKM Indonesia. Rebut total hadiah pembinaan <strong>Rp 26.000.000</strong> serta sertifikat nasional Bank Indonesia.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <span className="md:hidden text-[9px] font-cinzel text-[#e4ceaa] tracking-wider uppercase bg-[#462d1a] px-2.5 py-1 rounded-full border border-[#caa152]/60 shrink-0">
                Geser ➔
              </span>
              <button
                onClick={() => setModal(COMPETITIONS_DATA[0])}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#462d1a] hover:bg-[#583921] border border-[#caa152] text-[#fcedb8] font-cinzel text-[10px] sm:text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
                <span>BUKU PANDUAN</span>
              </button>
            </div>
          </div>

          {/* ── 2 CARDS: HORIZONTAL SNAP CAROUSEL ON MOBILE, 2-COL ON DESKTOP ── */}
          <div className="flex md:grid md:grid-cols-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar gap-3 pb-2 -mx-3.5 px-3.5 md:mx-0 md:px-0 relative z-10">
            {COMPETITIONS_DATA.map((comp, idx) => (
              <div
                key={comp.id}
                onClick={() => onSelectCompetition(comp)}
                className="w-[84vw] md:w-auto shrink-0 snap-center group cursor-pointer rounded-xl sm:rounded-[22px] md:rounded-[28px] border-2 border-[#caa152]/70 shadow-[0_6px_20px_rgba(0,0,0,0.22)] hover:shadow-[0_16px_36px_rgba(202,161,82,0.22)] hover:-translate-y-1 transition-all duration-300 relative p-3 sm:p-6 md:p-8 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(180deg, #fffdfa 0%, #faf4e8 100%)',
                }}
              >
                {/* Inner Dashed Gold Border */}
                <div className="absolute inset-1 sm:inset-2.5 rounded-lg sm:rounded-[18px] md:rounded-[22px] border border-dashed border-[#caa152]/40 pointer-events-none group-hover:border-[#caa152] transition-colors" />

                <div className="relative z-10 space-y-1.5 sm:space-y-3.5">
                  {/* Top Row: Category tag and Star */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f3e7d3] text-[#7a5530] font-cinzel text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] uppercase font-semibold border border-[#d8be99]">
                      <span>CABANG 0{idx + 1}</span>
                      <span>•</span>
                      <span>{comp.category}</span>
                    </span>
                    <span className="text-[#caa152] text-xs sm:text-sm select-none">
                      ✦
                    </span>
                  </div>

                  {/* Title in Cormorant Garamond */}
                  <h3 className="font-cormorant font-normal text-lg sm:text-2xl md:text-[1.8rem] text-[#241308] group-hover:text-[#ba883a] transition-colors leading-snug pt-0.5">
                    {comp.title}
                  </h3>

                  {/* Subtitle description */}
                  <p className="font-sans text-[11px] sm:text-xs md:text-[13px] text-[#5c3e28] leading-snug sm:leading-relaxed font-normal">
                    {comp.id === 'comp-1'
                      ? 'Tuliskan mantra gagasanmu untuk mengakselerasi ekosistem UMKM Indonesia.'
                      : 'Pecahkan teka-teki studi kasus bisnis riil UMKM bersama tim hebatmu.'}
                  </p>

                  {/* Fee & Prize strip - Compact row on mobile */}
                  <div className="pt-2 sm:pt-3 flex items-center justify-between text-xs text-[#7d4f2b] border-t border-[#ebdcc8]">
                    <span className="font-semibold text-[#2f1e10] bg-[#f0e3cc] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[#caa152]/50 font-cinzel text-[10px] sm:text-[11px]">
                      {comp.feeFormatted}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-cinzel font-semibold text-[#8a5e38] flex items-center gap-1">
                      <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#caa152]" />
                      <span>{comp.prizes.split('+')[0]}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Action: Compact bar on mobile */}
                <div className="relative z-10 pt-2.5 sm:pt-4 mt-2 sm:mt-5 border-t border-[#ede0ce] flex items-center justify-between">
                  <span className="font-cinzel text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] font-semibold text-[#7a5530] group-hover:text-[#2f1e10] transition-colors flex items-center gap-1 sm:gap-1.5">
                    <span>DETAIL LOMBA</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-cinzel text-white bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#7a5530] tracking-wider uppercase font-semibold px-3 sm:px-5 py-1 sm:py-2 rounded-full shadow-xs group-hover:shadow transition-all">
                    Daftar
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Guidebook Modal */}
      {modal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div 
            className="bg-[#fffdfa] rounded-2xl sm:rounded-3xl border-2 border-[#caa152] p-6 max-w-lg w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-cormorant text-2xl font-bold text-[#241308] mb-2">
              Panduan Resmi Kompetisi
            </h3>
            <p className="font-sans text-xs text-[#5c3e28] mb-4">
              Silakan unduh dokumen pedoman teknis lengkap di bawah ini:
            </p>
            <div className="space-y-2 mb-6">
              <a
                href="https://diginomicfest.id/guidebook-2027.pdf"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] hover:border-[#caa152] flex items-center justify-between text-xs font-semibold text-[#2f1e10]"
              >
                <span>Guidebook Esai & Mini Case (PDF)</span>
                <ArrowRight className="w-4 h-4 text-[#caa152]" />
              </a>
            </div>
            <button
              onClick={() => setModal(null)}
              className="w-full py-2.5 rounded-full bg-[#2f1e10] text-[#f5eee2] font-cinzel text-xs font-semibold"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
