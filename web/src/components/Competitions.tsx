import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Competition } from '../types';
import { COMPETITIONS_DATA } from '../data/competitions';
import { ArrowRight, BookOpen, Briefcase, FileText, Trophy } from 'lucide-react';
import {
  BatikKawungPattern,
  CornerFiligree,
} from './Ornaments';

interface CompetitionsProps {
  onSelectCompetition: (comp: Competition) => void;
  onExploreDetail?: (comp: Competition) => void;
}

export const Competitions: React.FC<CompetitionsProps> = ({
  onSelectCompetition,
  onExploreDetail,
}) => {
  const navigate = useNavigate();

  return (
    <section
      id="kompetisi"
      className="relative w-full pt-14 pb-12 sm:pt-20 sm:pb-16 md:pt-24 md:pb-16 px-3.5 sm:px-6 md:px-10 lg:px-12 overflow-x-clip"
      style={{
        background: 'linear-gradient(180deg, #efe2ce 0%, #f5ead9 52%, #f3e6d3 100%)',
      }}
    >
      <BatikKawungPattern color="#7a5530" opacity={0.055} id="kawung-comp-outer" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── ROYAL PAVILION CARD (MODERNIZED) ── */}
        <div
          className="relative rounded-3xl sm:rounded-[40px] border border-[#caa152]/65 shadow-[0_24px_60px_-16px_rgba(32,19,10,0.45)] p-5 sm:p-8 md:p-12 overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse 90% 80% at 50% 20%, #3d2616 0%, #2b1a0e 65%, #1e1108 100%)',
          }}
        >
          <BatikKawungPattern color="#caa152" opacity={0.05} id="kawung-pavilion" />
          <CornerFiligree color="#caa152" />

          {/* Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-7 sm:mb-10 gap-4 pb-6 border-b border-[#caa152]/25">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#462d1a]/90 border border-[#caa152]/55 text-[#fcedb8] font-poppins text-[10px] sm:text-xs tracking-wider font-semibold">
                <Trophy className="w-3.5 h-3.5 text-[#caa152]" />
                <span>Kompetisi Nasional 2027</span>
              </div>

              <h2 className="font-abang font-normal text-2xl sm:text-4xl lg:text-[2.85rem] text-[#fffdfa] tracking-tight leading-[1.12]">
                Cabang <span className="shimmer-text">Kompetisi Resmi</span>
              </h2>

              <p className="font-sans text-xs sm:text-sm text-[#e4ceaa] leading-relaxed">
                Wadah unjuk inovasi bagi UMKM Indonesia. Rebut total hadiah pembinaan{' '}
                <strong className="text-[#fffdf9]">Rp 26.000.000</strong> serta sertifikat nasional Bank Indonesia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/juklak-juknis')}
              className="btn-modern-shine w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#462d1a] hover:bg-[#583921] border border-[#caa152]/80 text-[#fcedb8] font-poppins text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
              <span>JUKLAK &amp; JUKNIS</span>
            </button>
          </div>

          {/* 2-Column Modern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 relative z-10">
            {COMPETITIONS_DATA.map((comp, idx) => {
              const isEsai = comp.id === 'comp-1';
              return (
                <div
                  key={comp.id}
                  onClick={() => (onExploreDetail ? onExploreDetail(comp) : onSelectCompetition(comp))}
                  className="card-modern-hover group cursor-pointer rounded-2xl sm:rounded-3xl border border-[#caa152]/60 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(165deg, #fffdfa 0%, #f8efe0 100%)',
                  }}
                >
                  <CornerFiligree color="#b88c52" className="w-6 h-6 opacity-45" />

                  <div className="relative z-10 space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efe1cb] text-[#6b4725] font-poppins text-[10px] tracking-[0.16em] uppercase font-semibold border border-[#d8be99]">
                        <span>Cabang 0{idx + 1}</span>
                        <span>·</span>
                        <span>{comp.category}</span>
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-[#3b2412] text-[#caa152] flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105">
                        {isEsai ? <FileText className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                      </div>
                    </div>

                    <h3 className="font-poppins font-semibold text-xl sm:text-2xl text-[#241308] group-hover:text-[#8c5a24] transition-colors leading-snug">
                      {comp.title}
                    </h3>

                    <p className="font-sans text-xs sm:text-sm text-[#5c3e28] leading-relaxed">
                      {isEsai
                        ? 'Tuliskan gagasan kritis dan solusi digital untuk mengakselerasi ekosistem UMKM Indonesia.'
                        : 'Pecahkan studi kasus bisnis riil UMKM bersama tim terbaikmu hingga panggung final pitching.'}
                    </p>

                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#e5d4bc]">
                      <span className="font-poppins font-semibold text-xs text-[#2f1e10] bg-[#efe1cb] px-3 py-1 rounded-full border border-[#caa152]/50">
                        {comp.feeFormatted}
                      </span>
                      <span className="font-poppins text-xs font-semibold text-[#7a5530] flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>{comp.prizes.split('+')[0]}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="relative z-10 pt-4 mt-5 border-t border-[#e5d4bc] flex items-center justify-between gap-3">
                    <span className="font-poppins text-xs tracking-wider uppercase font-semibold text-[#6b4725] group-hover:text-[#241308] transition-colors flex items-center gap-1.5">
                      <span>Detail Lomba</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#caa152] transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCompetition(comp);
                      }}
                      className="btn-modern-shine font-poppins text-xs text-[#faf4e8] bg-[#3b2412] hover:bg-[#241308] tracking-wider uppercase font-semibold px-5 py-2 rounded-full shadow-xs transition-all"
                    >
                      Daftar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
