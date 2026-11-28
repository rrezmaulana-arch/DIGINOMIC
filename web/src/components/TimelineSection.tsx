import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Sparkles,
} from 'lucide-react';
import type { TimelineStageStatus } from '../data/competitions';
import { useTimeline } from '../hooks/useTimeline';
import { BatikKawungPattern, CornerFiligree } from './Ornaments';

function getStageBadge(status: TimelineStageStatus, daysUntilStart: number) {
  if (status === 'current') {
    return {
      label: 'Sedang Berlangsung',
      shortLabel: 'Aktif',
      className: 'agenda-badge agenda-badge--current',
      dot: true,
    };
  }
  if (status === 'upcoming_next') {
    return {
      label: daysUntilStart > 0 ? `Tahap Berikutnya · H-${daysUntilStart}` : 'Segera Dimulai',
      shortLabel: daysUntilStart > 0 ? `H-${daysUntilStart}` : 'Segera',
      className: 'agenda-badge agenda-badge--next',
      dot: true,
    };
  }
  if (status === 'completed') {
    return {
      label: 'Selesai',
      shortLabel: 'Selesai',
      className: 'agenda-badge agenda-badge--done',
      dot: false,
    };
  }
  return null;
}

export const TimelineSection: React.FC = () => {
  const navigate = useNavigate();
  const { stages } = useTimeline();
  const trackRef = useRef<HTMLDivElement>(null);

  const initialIndex = useMemo(() => {
    const activeIdx = stages.findIndex(
      (s) => s.status === 'current' || s.status === 'upcoming_next'
    );
    return activeIdx >= 0 ? activeIdx : 0;
  }, [stages]);

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);

  useEffect(() => {
    setSelectedIndex((prev) => (prev >= stages.length ? initialIndex : prev));
  }, [initialIndex, stages.length]);

  const activeStage = useMemo(
    () => stages.find((s) => s.status === 'current' || s.status === 'upcoming_next') || null,
    [stages]
  );

  const selectedStage = stages[selectedIndex] || stages[0];
  const selectedBadge = selectedStage
    ? getStageBadge(selectedStage.status, selectedStage.daysUntilStart)
    : null;

  const selectStage = (idx: number) => {
    if (idx < 0 || idx >= stages.length) return;
    setSelectedIndex(idx);
    // Pada mobile horizontal track, gulir lembut ke kartu terpilih
    const container = trackRef.current;
    const child = container?.children[idx] as HTMLElement | undefined;
    if (container && child && window.innerWidth < 640) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  if (!selectedStage) return null;

  const progressPercent = Math.round(((selectedIndex + 1) / stages.length) * 100);

  // Pilih jumlah kolom desktop agar selalu simetris (tidak ada 1 kartu yatim di baris baru)
  const desktopCols = stages.length <= 8 ? 4 : stages.length <= 10 ? 5 : 6;
  const desktopGridClass =
    desktopCols === 4
      ? 'lg:grid-cols-4'
      : desktopCols === 5
        ? 'lg:grid-cols-5'
        : 'lg:grid-cols-6';

  // Jika jumlah tahap kurang 1 dari kelipatan kolom (mis. 11 tahap di grid 6 kolom saat Extended aktif),
  // lebarkan kartu Extended (atau kartu puncak terakhir) menjadi 2 kolom agar 2 baris tetap penuh simetris!
  const needsWideFeature = stages.length > desktopCols && stages.length % desktopCols === desktopCols - 1;
  const wideCardIndex = needsWideFeature
    ? (() => {
        const extIdx = stages.findIndex((s) => s.isExtended);
        return extIdx >= 0 ? extIdx : stages.length - 1;
      })()
    : -1;

  return (
    <section
      id="linimasa"
      className="relative w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-12 overflow-hidden text-[#faf4e8]"
      style={{
        background: 'linear-gradient(180deg, #2b1a0e 0%, #24150b 55%, #1e1108 100%)',
      }}
    >
      <BatikKawungPattern color="#caa152" opacity={0.035} id="kawung-timeline-dark" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-7">
        {/* ── HEADER BAR RINGKAS (1 BARIS SEIMBANG) ── */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="text-center lg:text-left">
            <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.22em] uppercase text-[#ead19d] font-medium mb-1.5">
              LINIMASA RESMI 2026 &ndash; 2027
            </p>
            <h2 className="font-cormorant font-normal text-3xl sm:text-4xl lg:text-[3rem] text-[#fffdf9] tracking-tight leading-[1.08]">
              Alur &amp; Jadwal{' '}
              <span className="text-[#e8c47a]">Kompetisi</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 sm:gap-3">
            {activeStage && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3a2516]/90 border border-[#caa152]/55 text-[#f7e1b5] text-xs max-w-full">
                <span className="agenda-pulse-dot shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[240px] sm:max-w-xs">
                  <strong className="font-semibold text-[#fff3cf]">
                    {activeStage.status === 'current' ? 'Berlangsung:' : 'Berikutnya:'}
                  </strong>{' '}
                  {activeStage.title}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/juklak-juknis')}
              className="agenda-guide"
            >
              <BookOpen size={15} />
              <span>Juklak &amp; Juknis</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </header>

        {/* ── INTERACTIVE JOURNEY GRID (5x2 DESKTOP, 2-COL TABLET, HORIZONTAL SWIPE MOBILE) ── */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#d8be99]/80 mb-2.5 px-0.5">
            <span>Pilih tahap untuk melihat detail pelaksanaan ({stages.length} agenda)</span>
            <span className="sm:hidden text-[#e8c47a] font-medium">Geser &rarr;</span>
          </div>

          <div
            ref={trackRef}
            role="tablist"
            aria-label="Tahapan linimasa kompetisi"
            className={`flex sm:grid sm:grid-cols-2 md:grid-cols-3 ${desktopGridClass} gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 sm:pb-0 no-scrollbar`}
          >
            {stages.map((step, index) => {
              const isSelected = index === selectedIndex;
              const isCurrent = step.status === 'current';
              const isNext = step.status === 'upcoming_next';
              const isDone = step.status === 'completed';
              const isWide = index === wideCardIndex;
              const badge = getStageBadge(step.status, step.daysUntilStart);
              const numLabel = String(index + 1).padStart(2, '0');

              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="timeline-spotlight-panel"
                  onClick={() => selectStage(index)}
                  className={`snap-center shrink-0 w-[72vw] max-w-[230px] sm:w-auto sm:max-w-none text-left relative rounded-2xl p-3.5 border transition-all duration-250 flex flex-col justify-between gap-2.5 cursor-pointer group ${
                    isWide ? 'lg:col-span-2' : ''
                  } ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#4d321d] via-[#402817] to-[#321e10] border-[#f3d48c] ring-1 ring-[#caa152]/65 shadow-[0_14px_30px_-12px_rgba(202,161,82,0.42)] sm:-translate-y-0.5'
                      : step.isExtended
                        ? 'bg-gradient-to-br from-[#462c18] to-[#352012] border-[#dfba68]/80 hover:border-[#f3d48c]'
                        : isCurrent
                          ? 'bg-[#3d2616] border-[#caa152]/80 hover:border-[#f3d48c]'
                          : isDone
                            ? 'bg-[#2c1b10]/85 border-[#5f442c]/65 opacity-80 hover:opacity-100 hover:border-[#caa152]/60'
                            : 'bg-[#332013]/90 border-[#6b4d32]/75 hover:bg-[#3f2818] hover:border-[#caa152]/80'
                  }`}
                >
                  {/* Top gold highlight indicator when selected */}
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 inset-x-4 h-[2px] rounded-b-full bg-gradient-to-r from-transparent via-[#f3d48c] to-transparent"
                    />
                  )}

                  {/* Row 1: Step Number + Status Mini Tag */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold tabular-nums border transition-colors ${
                        isSelected
                          ? 'bg-[#f3d48c] text-[#241308] border-[#fff3cf]'
                          : isCurrent
                            ? 'bg-[#dfba68] text-[#241308] border-[#fff0c2]'
                            : isNext
                              ? 'bg-[#4a3019] text-[#ffe4a3] border-[#e6c278]'
                              : isDone
                                ? 'bg-[#5a3d24] text-[#f3d48c] border-[#d8b26a]'
                                : 'bg-[#26160c] text-[#e8c882] border-[#977641]/80 group-hover:border-[#e8c47a]'
                      }`}
                    >
                      {isDone ? <Check size={13} strokeWidth={2.5} /> : numLabel}
                    </span>

                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {step.isExtended && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#caa152]/30 border border-[#f3d48c]/70 text-[#fff0c2] text-[9px] font-semibold uppercase tracking-wider">
                          Extended
                        </span>
                      )}
                      {badge && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50'
                              : isNext
                                ? 'bg-[#caa152]/25 text-[#fcedb8] border border-[#e6c278]/55'
                                : 'bg-white/10 text-[#d8c3a3] border border-[#d8b26a]/30'
                          }`}
                        >
                          {badge.dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                          <span>{badge.shortLabel}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Short Date & Title */}
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#e8c882] font-medium tracking-wide truncate">
                      {step.shortDate}
                    </p>
                    <h3
                      className={`font-sans text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2 ${
                        isSelected ? 'text-[#fffdf9]' : 'text-[#f2e6d2] group-hover:text-[#fffdf9]'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ACTIVE STAGE SPOTLIGHT DETAIL CARD ── */}
        <div
          id="timeline-spotlight-panel"
          role="tabpanel"
          className="relative rounded-3xl bg-gradient-to-br from-[#3c2617] via-[#311e11] to-[#26160b] border border-[#caa152]/65 p-5 sm:p-7 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          <CornerFiligree color="#caa152" className="opacity-45" />
          <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/20 pointer-events-none" />

          <div
            key={selectedStage.id}
            className="mascot-bubble-in relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            {/* Detail Content */}
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#24140a] border border-[#caa152]/55 text-[#f3d48c] font-cinzel text-[10px] tracking-[0.16em] uppercase font-semibold">
                  <span>Tahap {String(selectedIndex + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs text-[#ead19d] font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#caa152]" />
                  <span>{selectedStage.date}</span>
                </span>

                {selectedStage.isExtended && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#caa152]/25 border border-[#f3d48c]/70 text-[#fff0c2] text-[10px] font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#f3d48c]" />
                    <span>Diperpanjang</span>
                  </span>
                )}

                {selectedBadge && (
                  <span className={selectedBadge.className}>
                    {selectedBadge.dot && <span className="agenda-pulse-dot" aria-hidden="true" />}
                    <span>{selectedBadge.label}</span>
                  </span>
                )}
              </div>

              <h3 className="font-cormorant text-2xl sm:text-3xl text-[#fffdf9] font-normal leading-tight">
                {selectedStage.title}
              </h3>

              <p className="font-sans text-xs sm:text-sm text-[#e8d7be] leading-relaxed">
                {selectedStage.desc}
              </p>
            </div>

            {/* Stepper Controls + Progress */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#caa152]/20">
              <div className="w-28 sm:w-36 lg:w-40">
                <div className="flex items-center justify-between text-[10px] text-[#d8be99] mb-1">
                  <span>Progres Alur</span>
                  <span className="tabular-nums font-semibold text-[#f3d48c]">{progressPercent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#24140a] overflow-hidden border border-[#caa152]/25">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#b88636] via-[#dfba68] to-[#f3d48c] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedIndex === 0}
                  onClick={() => selectStage(selectedIndex - 1)}
                  aria-label="Tahap sebelumnya"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#26160b] hover:bg-[#492e1b] border border-[#caa152]/50 text-[#f3d48c] text-xs font-medium transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>
                <button
                  type="button"
                  disabled={selectedIndex === stages.length - 1}
                  onClick={() => selectStage(selectedIndex + 1)}
                  aria-label="Tahap berikutnya"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#caa152] hover:bg-[#dfba68] text-[#241308] text-xs font-semibold transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
