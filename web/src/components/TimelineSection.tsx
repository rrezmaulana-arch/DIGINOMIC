import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Sparkles } from 'lucide-react';
import {
  BatikKawungPattern,
  CompassWatermark,
  MegaMendungClouds,
} from './Ornaments';

const SERPENTINE_STEPS = {
  row1: [
    { num: '01', date: '14 Des 2026 – 30 Jan 2027', title: 'Pendaftaran & Verifikasi' },
    { num: '02', date: '1 – 19 Feb 2027', title: 'Seleksi & Penjurian Karya' },
  ],
  row2: [
    // Ditampilkan kiri -> kanan di grid, namun alur S-curve mengalir dari kanan (03) ke kiri (04)
    { num: '04', date: '21 Maret 2027', title: 'Final Kompetisi' },
    { num: '03', date: '20 Februari 2027', title: 'Pengumuman Finalis' },
  ],
  finalStep: {
    num: '05',
    date: '22 Maret 2027 — Acara Puncak',
    title: 'Main Event, Pameran UMKM & Awarding Night',
  },
};

const MOBILE_STEPS = [
  SERPENTINE_STEPS.row1[0],
  SERPENTINE_STEPS.row1[1],
  SERPENTINE_STEPS.row2[1],
  SERPENTINE_STEPS.row2[0],
  SERPENTINE_STEPS.finalStep,
];

export const TimelineSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="linimasa"
      className="relative w-full py-14 sm:py-20 md:py-24 px-4 sm:px-8 lg:px-12 overflow-hidden text-[#faf4e8]"
      style={{
        background: 'linear-gradient(180deg, #2b1a0e 0%, #24150b 55%, #1e1108 100%)',
      }}
    >
      <BatikKawungPattern color="#caa152" opacity={0.055} id="kawung-timeline-dark" />
      <MegaMendungClouds color="#caa152" className="absolute top-6 -right-14 w-72 sm:w-96 opacity-40" />
      <CompassWatermark color="#caa152" className="absolute -bottom-24 -left-24 w-80 h-80 opacity-[0.06]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3d2515] border border-[#caa152]/50 text-[#f3d48c] font-poppins text-[10px] sm:text-xs tracking-widest uppercase font-semibold mb-2.5">
            <Calendar className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Linimasa Resmi 2026–2027</span>
          </div>
          <h2 className="font-abang font-normal text-3xl sm:text-5xl text-[#fffdf9] tracking-tight">
            Alur &amp; Jadwal <span className="shimmer-text">Kompetisi</span>
          </h2>
        </div>

        {/* ── DESKTOP: MODERN S-CURVE SERPENTINE TIMELINE (terinspirasi referensi) ── */}
        <div className="hidden md:block relative">
          {/* Row 1: Step 01 (kiri) & Step 02 (kanan) */}
          <div className="grid grid-cols-2 gap-12 px-6">
            {SERPENTINE_STEPS.row1.map((step) => (
              <div key={step.num} className="flex flex-col items-center">
                <div className="card-modern-hover w-full max-w-[340px] rounded-full px-7 py-5 bg-[#3c2414]/85 backdrop-blur-sm border border-[#caa152]/55 hover:border-[#f3d48c] text-center shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)]">
                  <p className="font-poppins text-[11px] font-semibold tracking-wider text-[#e3c47f]">
                    {step.date}
                  </p>
                  <h3 className="font-poppins text-sm lg:text-base font-semibold text-[#fffdf9] mt-1">
                    {step.title}
                  </h3>
                </div>
                {/* Glowing connector node */}
                <div className="mt-3.5 flex flex-col items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#f3d48c] shadow-[0_0_16px_4px_rgba(243,212,140,0.55)] ring-4 ring-[#caa152]/25" />
                  <span className="w-0.5 h-5 bg-[#caa152]/70" />
                </div>
              </div>
            ))}
          </div>

          {/* Connecting Line Row 1 -> Right U-Turn -> Row 2 */}
          <div className="relative h-14 mx-6">
            <svg viewBox="0 0 900 56" fill="none" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d="M 225 0 H 830 C 865 0 880 18 880 56"
                stroke="#caa152"
                strokeWidth="2"
                strokeOpacity="0.75"
              />
            </svg>
          </div>

          {/* Row 2: Step 04 (kiri) & Step 03 (kanan) */}
          <div className="relative">
            {/* Right vertical curve segment joining Row 1 to Row 2 rail */}
            <div className="hidden md:block absolute right-6 -top-1 bottom-0 w-10 pointer-events-none">
              <svg viewBox="0 0 40 160" fill="none" className="w-full h-full" preserveAspectRatio="none">
                <path d="M 20 0 V 125 C 20 148 8 158 -10 158" stroke="#caa152" strokeWidth="2" strokeOpacity="0.75" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-12 px-6">
              {SERPENTINE_STEPS.row2.map((step) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div className="card-modern-hover w-full max-w-[340px] rounded-full px-7 py-5 bg-[#3c2414]/85 backdrop-blur-sm border border-[#caa152]/55 hover:border-[#f3d48c] text-center shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)]">
                    <p className="font-poppins text-[11px] font-semibold tracking-wider text-[#e3c47f]">
                      {step.date}
                    </p>
                    <h3 className="font-poppins text-sm lg:text-base font-semibold text-[#fffdf9] mt-1">
                      {step.title}
                    </h3>
                  </div>
                  <div className="mt-3.5 flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f3d48c] shadow-[0_0_16px_4px_rgba(243,212,140,0.55)] ring-4 ring-[#caa152]/25" />
                    <span className="w-0.5 h-5 bg-[#caa152]/70" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connecting Line Row 2 -> Left U-Turn -> Final Card */}
          <div className="relative h-16 mx-6">
            <svg viewBox="0 0 900 64" fill="none" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d="M 880 0 H 70 C 30 0 18 20 18 42 C 18 62 35 64 70 64 H 260"
                stroke="#caa152"
                strokeWidth="2"
                strokeOpacity="0.75"
              />
            </svg>
          </div>

          {/* Row 3: Acara Puncak (Centered Highlight Pill) */}
          <div className="flex flex-col items-center -mt-9">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#f3d48c] to-[#caa152] text-[#241308] flex items-center justify-center shadow-[0_0_24px_6px_rgba(202,161,82,0.5)] z-10 -mb-5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="card-modern-hover w-full max-w-xl rounded-full px-10 pt-8 pb-6 bg-gradient-to-r from-[#3f2614] via-[#4f311b] to-[#3f2614] border-2 border-[#e3c47f]/80 text-center shadow-[0_18px_44px_-12px_rgba(0,0,0,0.55)]">
              <p className="font-poppins text-xs font-semibold tracking-wider text-[#f3d48c]">
                {SERPENTINE_STEPS.finalStep.date}
              </p>
              <h3 className="font-poppins text-base lg:text-lg font-bold text-[#fffdf9] mt-1">
                {SERPENTINE_STEPS.finalStep.title}
              </h3>
            </div>
          </div>
        </div>

        {/* ── MOBILE: CLEAN VERTICAL GLOWING RAIL ── */}
        <div className="md:hidden relative pl-7 space-y-4">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#caa152]/40 via-[#caa152] to-[#f3d48c]" />
          {MOBILE_STEPS.map((step, idx) => {
            const isLast = idx === MOBILE_STEPS.length - 1;
            return (
              <div key={step.num} className="relative">
                <span
                  className={`absolute -left-[25px] top-4 w-3.5 h-3.5 rounded-full ${
                    isLast
                      ? 'bg-[#f3d48c] shadow-[0_0_14px_4px_rgba(243,212,140,0.6)]'
                      : 'bg-[#caa152] ring-4 ring-[#caa152]/20'
                  }`}
                />
                <div
                  className={`rounded-2xl px-4 py-3.5 border ${
                    isLast
                      ? 'bg-[#4b2e19] border-[#e3c47f]/80'
                      : 'bg-[#382214]/85 border-[#caa152]/40'
                  }`}
                >
                  <p className="font-poppins text-[10px] font-semibold tracking-wider text-[#e3c47f]">
                    {step.date}
                  </p>
                  <h3 className="font-poppins text-sm font-semibold text-[#fffdf9] mt-0.5">
                    {step.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tombol ke Halaman Juklak & Juknis */}
        <div className="text-center mt-11 sm:mt-14">
          <button
            type="button"
            onClick={() => navigate('/juklak-juknis')}
            className="btn-modern-shine group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-gradient-to-r from-[#caa152] to-[#b88636] hover:from-[#d9b366] hover:to-[#c99543] text-[#241308] font-poppins text-xs sm:text-sm font-bold tracking-wide shadow-lg transition-all active:scale-[0.99]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lihat Juklak &amp; Juknis Lengkap</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
