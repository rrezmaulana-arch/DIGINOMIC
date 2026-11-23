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
      className="relative w-full py-14 sm:py-20 px-4 sm:px-8 lg:px-12 overflow-hidden bg-[#fdf8ef]"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ── ROYAL PAVILION CARD (Non-Boxy: Curved & Scalloped Royal Stage) ── */}
        <div
          className="relative rounded-[32px] sm:rounded-[48px] lg:rounded-[56px] border-2 border-[#caa152]/70 shadow-[0_20px_60px_-15px_rgba(47,30,16,0.32)] p-7 sm:p-11 lg:p-14 overflow-hidden transition-all duration-300"
          style={{
            background: 'radial-gradient(ellipse 90% 80% at 50% 30%, #3a2415 0%, #2b1a0e 65%, #20130a 100%)',
          }}
        >
          {/* Inner Dashed Border matching the official royal certificate motif */}
          <div className="absolute inset-2 sm:inset-3.5 rounded-[24px] sm:rounded-[40px] lg:rounded-[48px] border border-dashed border-[#caa152]/35 pointer-events-none" />

          {/* Ambient Warm Golden Stardust inside the pavilion */}
          <div
            className="absolute inset-0 pointer-events-none select-none z-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(202, 161, 82, 0.28) 0%, transparent 65%)',
            }}
          />

          {/* Decorative Corner Stars */}
          <span className="absolute top-4 left-5 text-[#caa152]/40 text-sm select-none pointer-events-none">✦</span>
          <span className="absolute top-4 right-5 text-[#caa152]/40 text-sm select-none pointer-events-none">✦</span>
          <span className="absolute bottom-4 left-5 text-[#caa152]/40 text-sm select-none pointer-events-none">✦</span>
          <span className="absolute bottom-4 right-5 text-[#caa152]/40 text-sm select-none pointer-events-none">✦</span>

          {/* ── SECTION HEADER ── */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6 pb-6 border-b border-[#caa152]/30">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#462d1a] border border-[#caa152]/60 text-[#fcedb8] font-cinzel text-xs tracking-wider font-semibold shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-[#caa152]" />
                <span>Kompetisi Tingkat Nasional 2027</span>
              </div>

              <h2 className="font-cormorant font-normal text-3xl sm:text-4xl lg:text-[2.75rem] text-[#fffdfa] tracking-tight leading-[1.12]">
                Cabang <span className="shimmer-text">Kompetisi Resmi</span>
              </h2>

              <p className="font-sans text-xs sm:text-sm text-[#e4ceaa] leading-relaxed font-normal">
                Wadah unjuk inovasi dan gagasan nyata bagi pemulihan serta kemajuan UMKM Indonesia. Rebut total hadiah pembinaan <strong>Rp 26.000.000</strong> serta sertifikat nasional Bank Indonesia.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setModal(COMPETITIONS_DATA[0])}
                className="px-6 py-2.5 rounded-full bg-[#462d1a] hover:bg-[#583921] border border-[#caa152] text-[#fcedb8] font-cinzel text-xs font-semibold tracking-wider transition-all flex items-center gap-2 shadow-xs hover:shadow active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
                <span>BUKU PANDUAN LOMBA</span>
              </button>
            </div>
          </div>

          {/* ── 2 CARDS (Harmonious Warm Ivory Certificates) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
            {COMPETITIONS_DATA.map((comp, idx) => (
              <div
                key={comp.id}
                onClick={() => onSelectCompetition(comp)}
                className="group cursor-pointer rounded-[24px] sm:rounded-[28px] border-2 border-[#caa152]/70 shadow-[0_8px_25px_rgba(0,0,0,0.28)] hover:shadow-[0_16px_36px_rgba(202,161,82,0.22)] hover:-translate-y-1.5 transition-all duration-300 relative p-6 sm:p-8 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(180deg, #fffdfa 0%, #faf4e8 100%)',
                }}
              >
                {/* Inner Dashed Gold Border */}
                <div className="absolute inset-2 sm:inset-2.5 rounded-[18px] sm:rounded-[22px] border border-dashed border-[#caa152]/40 pointer-events-none group-hover:border-[#caa152] transition-colors" />

                <div className="relative z-10 space-y-3.5">
                  {/* Top Row: Category tag and Star */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3e7d3] text-[#7a5530] font-cinzel text-[10px] tracking-[0.25em] uppercase font-semibold border border-[#d8be99]">
                      <span>CABANG 0{idx + 1}</span>
                      <span>•</span>
                      <span>{comp.category}</span>
                    </span>
                    <span className="text-[#caa152] text-sm select-none">
                      ✦
                    </span>
                  </div>

                  {/* Title in Cormorant Garamond */}
                  <h3 className="font-cormorant font-normal text-2xl sm:text-[1.85rem] text-[#241308] group-hover:text-[#ba883a] transition-colors leading-snug pt-0.5">
                    {comp.title}
                  </h3>

                  {/* Subtitle description */}
                  <p className="font-sans text-xs sm:text-[13px] text-[#5c3e28] leading-relaxed font-normal">
                    {comp.id === 'comp-1'
                      ? 'Tuliskan mantra gagasanmu untuk mengakselerasi ekosistem UMKM Indonesia.'
                      : 'Pecahkan teka-teki studi kasus bisnis riil UMKM bersama tim hebatmu.'}
                  </p>

                  {/* Fee & Prize strip */}
                  <div className="pt-3 flex items-center justify-between text-xs text-[#7d4f2b] border-t border-[#ebdcc8]">
                    <span className="font-semibold text-[#2f1e10] bg-[#f0e3cc] px-3 py-1 rounded-full border border-[#caa152]/50 font-cinzel text-[11px]">
                      Biaya: {comp.feeFormatted}
                    </span>
                    <span className="text-[11px] font-cinzel font-semibold text-[#8a5e38] flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-[#caa152]" />
                      <span>{comp.prizes.split('+')[0]}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Action: LIHAT DETAIL & DAFTAR */}
                <div className="relative z-10 pt-4 mt-5 border-t border-[#ede0ce] flex items-center justify-between">
                  <span className="font-cinzel text-[11px] tracking-[0.2em] font-semibold text-[#7a5530] group-hover:text-[#2f1e10] transition-colors flex items-center gap-1.5">
                    <span>LIHAT DETAIL & PANDUAN</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[11px] font-cinzel text-white bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#7a5530] tracking-wider uppercase font-semibold px-4 sm:px-5 py-2 rounded-full shadow-xs group-hover:shadow transition-all">
                    Daftar
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Guide Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#fffdf9] rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-[#caa152] shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

            <div className="flex justify-between items-start pb-3 border-b border-[#ebdcc8] relative z-10">
              <div>
                <span className="text-[9px] font-cinzel uppercase tracking-wider text-[#7a5530] font-semibold">
                  Buku Panduan Teknis 2027
                </span>
                <h3 className="font-cormorant font-normal text-2xl sm:text-3xl text-[#241308]">
                  {modal.title}
                </h3>
                <p className="text-xs text-[#7a5530] mt-0.5">
                  {modal.category} • {modal.feeFormatted}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-7 h-7 rounded-full bg-[#faf4e8] text-[#7a5530] hover:bg-[#2f1e10] hover:text-[#f5eee2] flex items-center justify-center text-xs transition-colors border border-[#ebdcc8]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-[#5c3e28] leading-relaxed relative z-10">
              <div>
                <h4 className="font-cinzel text-[11px] text-[#241308] uppercase tracking-wider mb-1 font-semibold">
                  Deskripsi Lomba
                </h4>
                <p>{modal.description}</p>
              </div>

              <div>
                <h4 className="font-cinzel text-[11px] text-[#241308] uppercase tracking-wider mb-1 font-semibold">
                  Ketentuan Partisipasi
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Format: {modal.isTeam ? `Tim / Kelompok (Maksimal ${modal.maxTeamSize} orang)` : 'Individu'}</li>
                  <li>Terbuka untuk pelajar SMA/SMK dan Mahasiswa aktif se-Indonesia.</li>
                  <li>Karya harus orisinal dan belum pernah memenangkan kompetisi sejenis.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-cinzel text-[11px] text-[#241308] uppercase tracking-wider mb-1 font-semibold">
                  Total Hadiah
                </h4>
                <div className="p-2.5 bg-[#faf4e8] rounded-xl border border-[#ebdcc8] text-[#7d4f2b] font-medium flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#caa152]" />
                  <span>{modal.prizes}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#ebdcc8] flex justify-end gap-2.5 relative z-10">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-full border border-[#ebdcc8] text-[#7a5530] font-cinzel text-xs font-semibold hover:bg-[#faf4e8]"
              >
                TUTUP
              </button>
              <button
                onClick={() => {
                  const target = modal;
                  setModal(null);
                  onSelectCompetition(target);
                }}
                className="px-5 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold flex items-center gap-1.5 shadow-xs border border-[#caa152]"
              >
                <span>DAFTAR {modal.title.split(' ')[0]}</span>
                <ArrowRight className="w-3 h-3 text-[#caa152]" />
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
