import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronDown } from 'lucide-react';
import {
  BatikKawungPattern,
} from './Ornaments';

const steps = [
  { date: '14 Des 2026 – 30 Jan 2027', title: 'Pendaftaran & Verifikasi', detail: 'Daftarkan peserta atau tim, lalu lengkapi data untuk verifikasi panitia.' },
  { date: '1 – 19 Feb 2027', title: 'Seleksi & Penjurian Karya', detail: 'Karya peserta masuk ke tahap seleksi dan penilaian juri.' },
  { date: '20 Februari 2027', title: 'Pengumuman Finalis', detail: 'Peserta dapat melihat hasil seleksi dan daftar tim yang maju ke final.' },
  { date: '21 Maret 2027', title: 'Final Kompetisi', detail: 'Finalis mengikuti babak akhir kompetisi.' },
  { date: '22 Maret 2027 — Acara Puncak', title: 'Main Event, Pameran UMKM & Awarding Night', detail: 'Rangkaian festival ditutup dengan pameran UMKM dan malam penghargaan.' },
];

export const TimelineSection: React.FC = () => {
  const navigate = useNavigate();

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
          <h2 className="font-cormorant font-normal text-4xl sm:text-5xl lg:text-[3.5rem] text-[#fffdf9] tracking-tight leading-[1.06] mb-5">
            Alur &amp; Jadwal{' '}
            <span className="shimmer-text block">Kompetisi</span>
          </h2>
          <button type="button" onClick={() => navigate('/juklak-juknis')} className="agenda-guide">
            <BookOpen size={16} /> Juklak &amp; Juknis <ArrowRight size={16} />
          </button>
        </header>
        <ol className="agenda-list md:col-span-7">
          {steps.map((step, index) => (
            <li key={step.title}>
              <details className="agenda-card">
                <summary>
                  <span className="agenda-node" aria-hidden="true">0{index + 1}</span>
                  <span><span className="stage-date">{step.date}</span><strong>{step.title}</strong></span>
                  <ChevronDown className="agenda-chevron" size={18} aria-hidden="true" />
                </summary>
                <p>{step.detail}</p>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
