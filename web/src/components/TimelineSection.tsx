import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronDown } from 'lucide-react';
import {
  TIMELINE_DATA,
  resolveTimelineStatuses,
  type TimelineStageStatus,
} from '../data/competitions';
import { BatikKawungPattern } from './Ornaments';

function getStageBadge(status: TimelineStageStatus, daysUntilStart: number) {
  if (status === 'current') {
    return {
      label: 'Sedang Berlangsung',
      className: 'agenda-badge agenda-badge--current',
      dot: true,
    };
  }
  if (status === 'upcoming_next') {
    return {
      label: daysUntilStart > 0 ? `Tahap Berikutnya · H-${daysUntilStart}` : 'Segera Dimulai',
      className: 'agenda-badge agenda-badge--next',
      dot: true,
    };
  }
  if (status === 'completed') {
    return {
      label: 'Selesai',
      className: 'agenda-badge agenda-badge--done',
      dot: false,
    };
  }
  return null;
}

export const TimelineSection: React.FC = () => {
  const navigate = useNavigate();
  const stages = useMemo(() => resolveTimelineStatuses(TIMELINE_DATA), []);

  const initialOpenIndex = useMemo(() => {
    const activeIdx = stages.findIndex(
      (s) => s.status === 'current' || s.status === 'upcoming_next'
    );
    return activeIdx >= 0 ? activeIdx : 0;
  }, [stages]);

  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);

  const activeStage = useMemo(
    () => stages.find((s) => s.status === 'current' || s.status === 'upcoming_next') || null,
    [stages]
  );

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="linimasa"
      className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-8 lg:px-12 overflow-hidden text-[#faf4e8]"
      style={{
        background: 'linear-gradient(180deg, #2b1a0e 0%, #24150b 55%, #1e1108 100%)',
      }}
    >
      <BatikKawungPattern color="#caa152" opacity={0.035} id="kawung-timeline-dark" />
      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        <header className="md:col-span-5 text-center md:text-left">
          <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.22em] uppercase text-[#ead19d] font-medium mb-2.5">
            LINIMASA RESMI 2026 &ndash; 2027
          </p>
          <h2 className="font-cormorant font-normal text-4xl sm:text-5xl lg:text-[3.5rem] text-[#fffdf9] tracking-tight leading-[1.06] mb-4">
            Alur &amp; Jadwal{' '}
            <span className="text-[#e8c47a] block">Kompetisi</span>
          </h2>

          {activeStage && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3a2516]/90 border border-[#caa152]/55 text-[#f7e1b5] text-xs mb-5 max-w-full">
              <span className="agenda-pulse-dot shrink-0" aria-hidden="true" />
              <span className="truncate">
                <strong className="font-semibold text-[#fff3cf]">
                  {activeStage.status === 'current' ? 'Sedang Berlangsung:' : 'Tahap Berikutnya:'}
                </strong>{' '}
                {activeStage.title}
              </span>
            </div>
          )}

          <div className="block">
            <button type="button" onClick={() => navigate('/juklak-juknis')} className="agenda-guide">
              <BookOpen size={16} /> Juklak &amp; Juknis <ArrowRight size={16} />
            </button>
          </div>
        </header>

        <ol className="agenda-list md:col-span-7">
          {stages.map((step, index) => {
            const isOpen = openIndex === index;
            const isCurrent = step.status === 'current';
            const isNext = step.status === 'upcoming_next';
            const isDone = step.status === 'completed';
            const badge = getStageBadge(step.status, step.daysUntilStart);
            const panelId = `agenda-panel-${step.id}`;

            return (
              <li
                key={step.id}
                className={
                  isCurrent
                    ? 'agenda-item agenda-item--current'
                    : isNext
                      ? 'agenda-item agenda-item--next'
                      : isDone
                        ? 'agenda-item agenda-item--done'
                        : 'agenda-item'
                }
              >
                <span
                  className={`agenda-node ${
                    isCurrent
                      ? 'agenda-node--current'
                      : isNext
                        ? 'agenda-node--next'
                        : isDone
                          ? 'agenda-node--done'
                          : ''
                  } ${isOpen ? 'agenda-node--open' : ''}`}
                  aria-hidden="true"
                >
                  {isDone ? <Check size={14} strokeWidth={2.5} /> : `0${index + 1}`}
                </span>

                <div
                  className={`agenda-card ${isOpen ? 'agenda-card--open' : ''} ${
                    isCurrent
                      ? 'agenda-card--current'
                      : isNext
                        ? 'agenda-card--next'
                        : isDone
                          ? 'agenda-card--done'
                          : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="agenda-trigger"
                  >
                    <span className="min-w-0 text-left">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="stage-date">{step.date}</span>
                        {badge && (
                          <span className={badge.className}>
                            {badge.dot && <span className="agenda-pulse-dot" aria-hidden="true" />}
                            <span>{badge.label}</span>
                          </span>
                        )}
                      </span>
                      <strong>{step.title}</strong>
                    </span>
                    <ChevronDown
                      className={`agenda-chevron ${isOpen ? 'agenda-chevron--open' : ''}`}
                      size={18}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-hidden={!isOpen}
                    className={`agenda-panel ${isOpen ? 'agenda-panel--open' : ''}`}
                  >
                    <div className="agenda-panel-inner">
                      <p>{step.desc}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
