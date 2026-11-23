import React, { useState } from 'react';
import { Sparkles, Calendar, CheckCircle2, Trophy } from 'lucide-react';
import { MagicMotionLines } from './MagicMotionLines';

interface TimelineEvent {
  phaseNumber: number;
  title: string;
  date: string;
  desc: string;
  badge: string;
}

const PUBLIC_TIMELINE_PHASES: {
  id: string;
  label: string;
  subtitle: string;
  events: TimelineEvent[];
}[] = [
  {
    id: 't1',
    label: 'TAHAP I: PENDAFTARAN & SELEKSI',
    subtitle: 'Pendaftaran peserta dan pengumpulan berkas karya lomba',
    events: [
      {
        phaseNumber: 1,
        title: 'Pendaftaran Resmi & Verifikasi QRIS',
        date: '14 Des 2026 - 30 Jan 2027',
        desc: 'Pembukaan registrasi portal untuk cabang Esai Nasional (Individu) & Mini Case Competition (Tim) dengan verifikasi WhatsApp instan.',
        badge: 'TERBUKA',
      },
      {
        phaseNumber: 2,
        title: 'Batas Pengumpulan Karya (Deadline)',
        date: '31 Jan 2027 • 23:59 WIB',
        desc: 'Batas akhir unggah naskah esai dan berkas solusi studi kasus UMKM melalui form pengumpulan resmi.',
        badge: 'SUBMISSION',
      },
      {
        phaseNumber: 3,
        title: 'Penjurian & Kurasi Ahli',
        date: '1 - 19 Feb 2027',
        desc: 'Penilaian komprehensif karya peserta oleh dewan juri akademisi, praktisi ekonomi digital, dan representasi Bank Indonesia.',
        badge: 'EVALUASI',
      },
      {
        phaseNumber: 4,
        title: 'Pengumuman Finalis Nasional',
        date: '20 Feb 2027',
        desc: 'Rilis resmi pengumuman peserta & tim terbaik yang berhak melaju dan memperebutkan gelar di panggung Grand Final.',
        badge: 'PENGUMUMAN',
      },
    ],
  },
  {
    id: 't2',
    label: 'TAHAP II: FINAL & PENGANUGERAHAN',
    subtitle: 'Babak penentuan juara nasional dan seminar Bank Indonesia',
    events: [
      {
        phaseNumber: 5,
        title: 'Technical Meeting Finalis',
        date: '25 Feb 2027',
        desc: 'Sesi pembekalan daring teknis presentasi, panduan pitching final, serta pengundian urutan tampil kompetisi.',
        badge: 'BRIEFING',
      },
      {
        phaseNumber: 6,
        title: 'Grand Final & Pitching Session',
        date: '21 Mar 2027',
        desc: 'Presentasi langsung karya esai dan pitching solusi bisnis UMKM di hadapan panel juri kehormatan di Malang.',
        badge: 'GRAND FINAL',
      },
      {
        phaseNumber: 7,
        title: 'Seminar Nasional & Awarding Ceremony',
        date: '22 Mar 2027',
        desc: 'Puncak penganugerahan piala juara, penyerahan total hadiah Rp 26.000.000, pameran UMKM, dan seminar ekonomi masa depan.',
        badge: 'PUNCAK ACARA',
      },
    ],
  },
];

export const TimelineSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'t1' | 't2'>('t1');
  const currentPhase = PUBLIC_TIMELINE_PHASES.find((p) => p.id === activeTab) || PUBLIC_TIMELINE_PHASES[0];

  return (
    <section
      id="linimasa"
      className="relative w-full py-10 sm:py-16 md:py-20 px-3.5 sm:px-8 lg:px-16 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fdf8ef 0%, #faf4e8 50%, #f7efe0 100%)',
      }}
    >
      <MagicMotionLines variant="ambient" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-12">
          <p className="font-cinzel text-[10px] sm:text-xs text-[#7a5530] font-medium tracking-widest mb-1 sm:mb-1.5">
            Agenda Resmi Peserta
          </p>
          <h2 className="font-cormorant font-normal text-2xl sm:text-4xl lg:text-[2.65rem] text-[#241308] tracking-tight">
            Linimasa & <span className="shimmer-text">Tahapan Kompetisi</span>
          </h2>
          <p className="font-sans text-[11px] sm:text-sm text-[#5c3e28] mt-1 sm:mt-1.5 leading-relaxed font-normal">
            Tahapan resmi untuk peserta Digiconomic Fest 2027, mulai dari pendaftaran hingga penganugerahan juara nasional.
          </p>

          {/* Phase Switcher Tabs */}
          <div className="mt-4 sm:mt-6 inline-flex flex-wrap items-center justify-center p-1 rounded-full bg-[#f0e3cc] border border-[#ebdcc8] gap-1">
            {PUBLIC_TIMELINE_PHASES.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActiveTab(phase.id as 't1' | 't2')}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-cinzel text-[9px] sm:text-[11px] uppercase tracking-wider transition-all duration-300 ${
                  activeTab === phase.id
                    ? 'bg-gradient-to-r from-[#ba883a] to-[#7d4f2b] text-white shadow-xs font-medium'
                    : 'text-[#6e4822] hover:text-[#2a170b] font-normal'
                }`}
              >
                {phase.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Cards Container */}
        <div className="relative pt-2 sm:pt-6 pb-4 sm:pb-8">
          
          {/* Mobile Swipe Hint */}
          <div className="flex sm:hidden items-center justify-end mb-2 pr-1">
            <span className="text-[9px] font-cinzel text-[#8a5e38] tracking-wider uppercase bg-[#f5ede0] px-2.5 py-0.5 rounded-full border border-[#ebdcc8]">
              Geser Tahapan ➔
            </span>
          </div>

          {/* Central Connecting Spine Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 z-0 bg-gradient-to-r from-[#ebdcc8] via-[#caa152] to-[#ebdcc8]" />

          {/* Milestone Cards Grid: Horizontal Snap Carousel on Mobile, Grid on Desktop */}
          <div
            className={`flex sm:grid ${
              currentPhase.events.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
            } overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar gap-3 pb-2 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 relative z-10`}
          >
            {currentPhase.events.map((ev, idx) => {
              const isUp = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`w-[78vw] sm:w-auto shrink-0 snap-center flex flex-col ${
                    isUp ? 'lg:flex-col lg:justify-start' : 'lg:flex-col lg:justify-end lg:pt-16'
                  }`}
                >
                  <div
                    className={`p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#ebdcc8] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between ${
                      isUp ? 'lg:mb-8' : 'lg:mt-8'
                    }`}
                    style={{
                      background: 'rgba(255, 253, 248, 0.95)',
                    }}
                  >
                    {/* Inner Dashed Border */}
                    <div className="absolute inset-1 sm:inset-1.5 rounded-lg sm:rounded-xl border border-dashed border-[#caa152]/20 pointer-events-none group-hover:border-[#caa152]/60 transition-colors" />

                    {/* Golden connector stem to spine (Desktop) */}
                    <div
                      className={`hidden lg:block absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#caa152]/70 ${
                        isUp ? '-bottom-8 h-8' : '-top-8 h-8'
                      }`}
                    />

                    {/* Node Dot on spine */}
                    <div
                      className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border border-[#ba883a] shadow-xs items-center justify-center text-[7px] text-[#ba883a] z-20 ${
                        isUp ? '-bottom-10' : '-top-10'
                      }`}
                    >
                      ✦
                    </div>

                    <div className="relative z-10">
                      {/* Top Row: Phase number and Badge */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3.5">
                        <span className="w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-cinzel text-[10px] sm:text-xs text-white bg-gradient-to-r from-[#ba883a] to-[#7d4f2b] shadow-2xs font-semibold">
                          0{ev.phaseNumber}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-cinzel tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#f3e7d3] text-[#7d4f2b] font-medium border border-[#ebdcc8]">
                          {ev.badge}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="mb-1.5 sm:mb-2.5">
                        <span className="text-[9px] sm:text-[10px] font-cinzel text-[#8a5e38] flex items-center gap-1.5 bg-[#f5ede0]/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full w-fit">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#caa152]" />
                          <span>{ev.date}</span>
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="font-cormorant font-normal text-base sm:text-xl text-[#2a170b] group-hover:text-[#ba883a] transition-colors mb-1 sm:mb-2 leading-snug">
                        {ev.title}
                      </h3>

                      {/* Event Description */}
                      <p className="font-sans text-[11px] sm:text-xs text-[#5c3e28] leading-relaxed font-normal">
                        {ev.desc}
                      </p>
                    </div>

                    {/* Bottom Status strip */}
                    <div className="relative z-10 mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#ede0ce] text-[8px] sm:text-[9px] font-cinzel text-[#8a5e38] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#caa152]" />
                        <span>Tahap Peserta</span>
                      </span>
                      {ev.phaseNumber === 7 ? (
                        <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#caa152]" />
                      ) : (
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#caa152] opacity-80" />
                      )}
                    </div>
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
