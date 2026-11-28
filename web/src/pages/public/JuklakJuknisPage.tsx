import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, CheckCircle2, Download, FileText } from 'lucide-react';
import { COMPETITIONS_DATA } from '../../data/competitions';
import { useTimeline } from '../../hooks/useTimeline';
import {
  BatikKawungPattern,
  CornerFiligree,
  SectionWaveTransition,
} from '../../components/Ornaments';

export const JuklakJuknisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState<string>('esai-nasional');
  const { stages: timelineStages } = useTimeline();

  const activeComp =
    COMPETITIONS_DATA.find((c) => c.slug === selectedSlug) || COMPETITIONS_DATA[0];

  return (
    <div className="min-h-screen bg-[#faf4e8] relative overflow-hidden">
      {/* Hero Header Gelap */}
      <section
        className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-8 lg:px-12 overflow-hidden text-[#faf4e8]"
        style={{
          background: 'linear-gradient(155deg, #3b2414 0%, #29180c 58%, #1e1108 100%)',
        }}
      >
        <BatikKawungPattern color="#caa152" opacity={0.07} id="kawung-juklak-hero" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-poppins tracking-widest uppercase text-[#e3c47f] hover:text-white transition-colors mb-5 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4a2f1b] border border-[#caa152]/60 text-[#fcedb8] font-poppins text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Dokumen Teknis Resmi</span>
          </div>

          <h1 className="font-abang text-4xl sm:text-5xl lg:text-6xl font-normal text-[#fffdf9] leading-tight">
            Juklak &amp; Juknis <span className="shimmer-text">Digiconomic 2027</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm md:text-base text-[#e3d0b5] mt-3 max-w-2xl leading-relaxed">
            Petunjuk pelaksanaan, jadwal rinci, ketentuan berkas, dan mekanisme penilaian resmi untuk seluruh cabang lomba Digiconomic Fest 2027.
          </p>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#faf4e8" accentColor="#caa152" variant="cloud" />

      {/* Konten Utama */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-12 relative z-10">
        {/* 1. Jadwal Lengkap */}
        <div>
          <h2 className="font-poppins text-xl sm:text-2xl font-semibold text-[#241308] mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#a87226]" />
            <span>Rincian Jadwal Pelaksanaan</span>
          </h2>
          <div className="space-y-3">
            {timelineStages.map((item, idx) => {
              const isCurrent = item.status === 'current';
              const isNext = item.status === 'upcoming_next';
              const isDone = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  className={`card-modern-hover rounded-2xl bg-[#fffdf9] border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 ${
                    isCurrent
                      ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                      : isNext
                        ? 'border-[#caa152]'
                        : 'border-[#dfd0ba]'
                  }`}
                >
                  <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-[#3b2412] text-[#f3d48c] font-poppins text-xs font-semibold shrink-0 w-fit">
                    {String(idx + 1).padStart(2, '0')} · {item.shortDate}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-poppins text-sm sm:text-base font-semibold text-[#241308]">
                        {item.title}
                      </h3>
                      {item.isExtended && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-poppins font-semibold uppercase tracking-wider">
                          Diperpanjang
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-poppins font-semibold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Sedang Berlangsung
                        </span>
                      )}
                      {isNext && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f3e6d3] text-[#6b4725] border border-[#caa152]/70 text-[10px] font-poppins font-semibold uppercase tracking-wider">
                          {item.daysUntilStart > 0 ? `Tahap Berikutnya · H-${item.daysUntilStart}` : 'Segera Dimulai'}
                        </span>
                      )}
                      {isDone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#efe3d0] text-[#7a5530] text-[10px] font-poppins font-semibold uppercase tracking-wider">
                          Selesai
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-[#5c3e28] mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Tab Ketentuan per Cabang Lomba */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="font-poppins text-xl sm:text-2xl font-semibold text-[#241308] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#a87226]" />
              <span>Ketentuan Teknis Cabang Lomba</span>
            </h2>
            <div className="inline-flex rounded-full bg-[#efe1cb] p-1 border border-[#d8be99]">
              {COMPETITIONS_DATA.map((c) => {
                const active = c.slug === selectedSlug;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedSlug(c.slug)}
                    className={`px-4 py-1.5 rounded-full font-poppins text-xs font-semibold transition-all ${
                      active ? 'bg-[#3b2412] text-[#faf4e8]' : 'text-[#5c3e28] hover:text-[#241308]'
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-modern-hover relative rounded-3xl bg-[#fffdf9] border border-[#caa152]/65 p-6 sm:p-8 shadow-sm overflow-hidden">
            <CornerFiligree color="#b88c52" className="w-6 h-6 opacity-50" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#e5d4bc]">
                <div>
                  <span className="font-poppins text-[11px] font-semibold uppercase tracking-widest text-[#8c6239]">
                    Kategori {activeComp.category} · Biaya {activeComp.feeFormatted}
                  </span>
                  <h3 className="font-poppins text-xl sm:text-2xl font-semibold text-[#241308] mt-0.5">
                    {activeComp.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/daftar?lomba=${activeComp.id}`)}
                  className="btn-modern-shine inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3b2412] text-[#faf4e8] font-poppins text-xs font-semibold"
                >
                  <span>Daftar Cabang Ini</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#caa152]" />
                </button>
              </div>

              <ul className="space-y-3 font-sans text-xs sm:text-sm text-[#4a2e18]">
                {activeComp.briefRules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#a87226] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-[#e5d4bc] flex flex-wrap items-center justify-between gap-3">
                <a
                  href="https://diginomicfest.id/guidebook-2027.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#efe1cb] hover:bg-[#e5d1b1] border border-[#caa152]/60 text-[#241308] font-poppins text-xs font-semibold transition-colors"
                >
                  <Download className="w-4 h-4 text-[#7a5530]" />
                  <span>Unduh PDF Juklak &amp; Juknis Resmi</span>
                </a>
                <Link
                  to={`/kompetisi/${activeComp.slug}`}
                  className="font-poppins text-xs font-semibold text-[#7a5530] hover:text-[#241308] inline-flex items-center gap-1"
                >
                  <span>Buka Halaman Detail {activeComp.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
