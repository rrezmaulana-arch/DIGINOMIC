import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  BookOpen,
  ArrowRight,
  Check,
} from 'lucide-react';
import { COMPETITIONS_DATA } from '../../data/competitions';
import { useTimeline } from '../../hooks/useTimeline';
import {
  BatikKawungPattern,
  SectionWaveTransition,
} from '../../components/Ornaments';

export const CompetitionsPage: React.FC = () => {
  const navigate = useNavigate();

  const { stages, effectiveDeadlineLabel } = useTimeline();

  const compactDetails: Record<string, { summary: string; audience: string; points: string[] }> = {
    'esai-nasional': {
      summary:
        'Kompetisi penulisan esai ilmiah beregu mengenai gagasan dan solusi ekonomi digital untuk mendorong daya saing UMKM lokal.',
      audience: 'Pelajar SMA/SMK & Mahasiswa',
      points: [
        'Tim 2–3 orang (1 akun ketua, 1 lomba aktif)',
        'Naskah orisinal 1.500–2.500 kata (PDF maks. 10 MB)',
        'Kompetisi final online (21 Mar) & Awarding offline di Universitas Brawijaya (22 Mar 2027)',
      ],
    },
    'mini-case-competition': {
      summary:
        'Kompetisi pemecahan studi kasus bisnis nyata UMKM di emerging market, mulai dari diagnosis masalah hingga strategi pertumbuhan.',
      audience: 'Mahasiswa D3/D4/S1',
      points: [
        'Tim 2–3 mahasiswa aktif se-Indonesia',
        'Proposal/deck solusi bisnis (PDF maks. 15 halaman)',
        'Presentasi final online (21 Mar) & penganugerahan offline di Universitas Brawijaya (22 Mar 2027)',
      ],
    },
  };

  return (
    <div className="w-full overflow-x-clip">
      {/* ── HERO HEADER RINGKAS & BERSIH ── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2f1d10] via-[#26160c] to-[#1e1108] text-[#faf4e8] overflow-hidden">
        <BatikKawungPattern color="#caa152" opacity={0.06} id="kawung-comp-page-hero" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.26em] uppercase text-[#e3c47f] mb-3">
            Kompetisi Tim Nasional · Digiconomic Fest 2027
          </p>

          <h1 className="font-cormorant text-3xl sm:text-5xl lg:text-6xl text-[#fffdf9] font-normal tracking-tight">
            Cabang <span className="shimmer-text">Kompetisi Resmi</span>
          </h1>

          <p className="mt-4 max-w-xl mx-auto font-sans text-xs sm:text-sm md:text-base text-[#dec9ad] leading-relaxed">
            Dua cabang kompetisi kategori tim (maks. 3 orang) dengan total dana pembinaan{' '}
            <strong className="text-[#fffdf9]">Rp 26.000.000+</strong>, trofi, dan e-sertifikat nasional Bank Indonesia.
          </p>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#f3e6d3" accentColor="#caa152" variant="cloud" />

      {/* ── COMPETITION CARDS (RINGKAS, PADAT, CEPAT DIBACA) ── */}
      <section
        aria-labelledby="daftar-cabang-lomba"
        className="relative py-12 sm:py-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#ebdcc5]"
      >
        <BatikKawungPattern color="#7a5530" opacity={0.04} id="kawung-comp-page-grid" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-12">
          <h2 id="daftar-cabang-lomba" className="sr-only">
            Daftar Cabang Kompetisi Digiconomic Fest 2027
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPETITIONS_DATA.map((comp, index) => {
              const IconComp = comp.iconName === 'Briefcase' ? Briefcase : FileText;
              const info = compactDetails[comp.slug] || compactDetails['esai-nasional'];

              return (
                <article
                  key={comp.id}
                  className="card-modern-hover p-6 sm:p-7 rounded-2xl bg-[#fffdf9] border border-[#dec7a6] shadow-xs flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    {/* Baris Atas */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-[#8a5e38] font-semibold">
                          0{index + 1} · Tim Maks. {comp.maxTeamSize} Orang
                        </p>
                        <h3 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-semibold leading-tight mt-0.5">
                          {comp.title}
                        </h3>
                      </div>
                      <IconComp className="w-5 h-5 text-[#9a6c30] shrink-0 mt-1" />
                    </div>

                    {/* Penjelasan Singkat (2 baris) */}
                    <p className="font-sans text-xs sm:text-[13.5px] text-[#4a2e18] leading-relaxed">
                      {info.summary}
                    </p>

                    {/* Meta Ringkas 1 Baris (SEO <dl>) */}
                    <dl className="grid grid-cols-3 gap-2 py-3 border-y border-[#ecdec9] text-xs font-sans">
                      <div>
                        <dt className="text-[10px] text-[#8a5e38] uppercase tracking-wider">Biaya</dt>
                        <dd className="font-semibold text-[#241308] mt-0.5">{comp.feeFormatted}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-[#8a5e38] uppercase tracking-wider">Tutup</dt>
                        <dd className="font-semibold text-[#241308] mt-0.5">{effectiveDeadlineLabel}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-[#8a5e38] uppercase tracking-wider">Peserta</dt>
                        <dd className="font-semibold text-[#241308] mt-0.5 truncate" title={info.audience}>
                          {info.audience}
                        </dd>
                      </div>
                    </dl>

                    {/* 3 Poin Utama Singkat */}
                    <ul className="space-y-1.5">
                      {info.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2 text-xs text-[#5c3e28] font-sans">
                          <Check className="w-3.5 h-3.5 text-[#ba883a] mt-0.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      onClick={() => navigate(`/daftar?lomba=${comp.slug}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#2f1d10] hover:bg-[#462b18] text-[#faf4e8] font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-colors cursor-pointer"
                    >
                      <span>Daftar Tim</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#caa152]" />
                    </button>
                    <button
                      onClick={() => navigate(`/kompetisi/${comp.slug}`)}
                      className="px-4 py-2.5 rounded-full border border-[#cfb48e] hover:bg-[#f4ead9] text-[#2f1e10] font-cinzel text-[11px] tracking-[0.14em] uppercase font-medium transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Alur Tahapan Ringkas (Tanpa Box Berat) */}
          <div className="pt-8 border-t border-[#d8c3a3]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="font-cinzel text-[10px] tracking-[0.22em] uppercase text-[#7a5530] font-semibold">
                  Linimasa Kompetisi
                </p>
                <h3 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-normal mt-0.5">
                  Dari Pendaftaran Hingga Awarding Night
                </h3>
              </div>
              <button
                onClick={() => navigate('/juklak-juknis')}
                className="inline-flex items-center gap-1.5 text-xs font-cinzel tracking-[0.14em] uppercase font-semibold text-[#6b4725] hover:text-[#241308] underline decoration-[#caa152] underline-offset-4 self-start sm:self-auto cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#ba883a]" />
                <span>Buka Juklak &amp; Juknis</span>
              </button>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {stages.map((st, idx) => {
                const isCurrent = st.status === 'current';
                const isNext = st.status === 'upcoming_next';
                const isDone = st.status === 'completed';
                return (
                  <li
                    key={st.id}
                    className={`card-modern-hover rounded-xl p-3 border border-transparent border-t-2 hover:bg-[#fffdf9]/75 ${
                      isCurrent
                        ? 'border-t-emerald-600'
                        : isNext
                          ? 'border-t-[#b88636]'
                          : isDone
                            ? 'border-t-[#8a5e38]/70 opacity-80'
                            : 'border-t-[#caa152]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-cinzel text-[10px] text-[#8a5e38] font-semibold tracking-widest">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {st.isExtended && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-poppins font-semibold uppercase tracking-wider">
                            Extended
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-poppins font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Berlangsung
                          </span>
                        )}
                        {isNext && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3b2412] text-[#f3d48c] text-[9px] font-poppins font-semibold uppercase tracking-wider">
                            Berikutnya
                          </span>
                        )}
                        {isDone && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e6d5bc] text-[#6b4725] text-[9px] font-poppins font-semibold uppercase tracking-wider">
                            Selesai
                          </span>
                        )}
                      </div>
                    </div>
                    <h4 className="font-poppins text-sm font-semibold text-[#241308] mt-1">{st.title}</h4>
                    <p className="font-sans text-xs text-[#6b4725] mt-0.5">{st.shortDate}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#382012" accentColor="#caa152" variant="wave" />
    </div>
  );
};