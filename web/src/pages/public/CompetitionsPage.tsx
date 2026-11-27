import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  FileText,
  Briefcase,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { COMPETITIONS_DATA } from '../../data/competitions';
import {
  BatikKawungPattern,
  SectionWaveTransition,
} from '../../components/Ornaments';

export const CompetitionsPage: React.FC = () => {
  const navigate = useNavigate();

  const stages = [
    { step: '01', title: 'Pendaftaran & Unggah Berkas', date: '14 Des 2026 – 30 Jan 2027' },
    { step: '02', title: 'Evaluasi & Penjurian Karya', date: '1 – 19 Februari 2027' },
    { step: '03', title: 'Pengumuman Finalis', date: '20 Februari 2027' },
    { step: '04', title: 'Competition Final', date: '21 Maret 2027' },
    { step: '05', title: 'Awarding Night (Main Event)', date: '22 Maret 2027' },
  ];

  return (
    <div className="w-full overflow-x-clip">
      {/* ── HERO HEADER ── */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-22 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2f1d10] via-[#26160c] to-[#1e1108] text-[#faf4e8] overflow-hidden">
        <BatikKawungPattern color="#caa152" opacity={0.07} id="kawung-comp-page-hero" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3f2818] border border-[#caa152]/50 text-[#f3d48c] font-cinzel text-[10px] sm:text-xs tracking-[0.22em] uppercase font-semibold mb-4">
            <Trophy className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Kompetisi Nasional 2027</span>
          </div>

          <h1 className="font-cormorant text-3xl sm:text-5xl lg:text-6xl text-[#fffdf9] font-normal tracking-tight">
            Cabang <span className="shimmer-text">Kompetisi Resmi</span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto font-sans text-xs sm:text-sm md:text-base text-[#dec9ad] leading-relaxed">
            Pilih satu cabang kompetisi strategis untuk menguji gagasan dan solusi terbaikmu bagi UMKM Indonesia—dengan target <strong>450+ pendaftar nasional</strong> dan total hadiah pembinaan <strong>Rp 26.000.000</strong>.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#f3d48c] font-sans">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#382315]/90 border border-[#caa152]/35">
              <Trophy className="w-4 h-4 text-[#caa152]" />
              Total Hadiah Keseluruhan Rp 26.000.000+
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#382315]/90 border border-[#caa152]/35">
              <Users className="w-4 h-4 text-[#caa152]" />
              Seluruh Cabang Kategori Tim (Maks. 3 Orang)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#382315]/90 border border-[#caa152]/35">
              <ShieldCheck className="w-4 h-4 text-[#caa152]" />
              Aturan 1 Akun 1 Lomba Aktif
            </span>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#f3e6d3" accentColor="#caa152" variant="cloud" />

      {/* ── COMPETITION CARDS GRID ── */}
      <section aria-labelledby="daftar-cabang-lomba" className="relative py-12 sm:py-18 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#ebdcc5]">
        <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-comp-page-grid" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#7a5530] font-semibold mb-1.5">
              Penjelasan &amp; Ketentuan Cabang Lomba
            </p>
            <h2 id="daftar-cabang-lomba" className="font-cormorant text-2xl sm:text-4xl text-[#241308] font-normal">
              Pilih Cabang Kompetisi Tim Terbaikmu
            </h2>
            <p className="mt-2 font-sans text-xs sm:text-sm text-[#5c3e28] leading-relaxed">
              Kedua cabang dilaksanakan secara beregu (maksimal 3 orang per tim) untuk memperebutkan total dana pembinaan <strong>Rp 26.000.000+</strong>, trofi, dan e-sertifikat nasional Bank Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {COMPETITIONS_DATA.map((comp, index) => {
              const IconComp = comp.iconName === 'Briefcase' ? Briefcase : FileText;
              const isEsai = comp.slug === 'esai-nasional';
              const focusSummary = isEsai
                ? 'Fokus pada kajian analitis, kebijakan ekonomi digital, literasi QRIS, dan gagasan inovatif penguatan daya saing UMKM lokal dalam bentuk naskah esai ilmiah (1.500–2.500 kata).'
                : 'Fokus pada pemecahan studi kasus bisnis nyata UMKM di emerging market secara strategis, mencakup audit masalah, model bisnis, serta proyeksi dampak dalam bentuk deck solusi (maks. 15 halaman).';
              const targetAudience = isEsai
                ? 'Pelajar SMA/SMK sederajat & Mahasiswa aktif se-Indonesia'
                : 'Mahasiswa aktif D3/D4/S1 perguruan tinggi se-Indonesia';

              return (
                <article
                  key={comp.id}
                  className="card-modern-hover p-6 sm:p-8 rounded-3xl bg-[#fffdf9] border border-[#dfc9ab] shadow-sm flex flex-col justify-between relative"
                >
                  <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/25 pointer-events-none" />
                  <div className="relative z-10 space-y-5">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#2f1d10] text-[#f3d48c] font-cinzel text-[10px] tracking-[0.16em] uppercase font-semibold">
                            Cabang 0{index + 1}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#f5ede0] border border-[#d8be99] text-[#6b4725] font-cinzel text-[10px] tracking-[0.14em] uppercase font-semibold">
                            Kategori Tim (2–{comp.maxTeamSize} Orang)
                          </span>
                        </div>
                        <h3 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-semibold leading-tight">
                          {comp.title}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#2f1d10] border border-[#caa152]/60 flex items-center justify-center shrink-0 shadow-xs">
                        <IconComp className="w-5 h-5 text-[#f3d48c]" />
                      </div>
                    </div>

                    {/* Deskripsi Utama */}
                    <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed">
                      {comp.description}
                    </p>

                    {/* Penjelasan Fokus Lomba (Pengganti Hadiah Per Lomba) */}
                    <div className="p-4 rounded-2xl bg-[#faf4e8] border border-[#e6d5bc] space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a5e38] font-cinzel font-semibold">
                        Penjelasan &amp; Ruang Lingkup Lomba
                      </p>
                      <p className="font-sans text-xs sm:text-[13px] text-[#3a2414] leading-relaxed">
                        {focusSummary}
                      </p>
                    </div>

                    {/* Metadata Terstruktur (SEO-Friendly <dl>) */}
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-sans">
                      <div className="p-3 rounded-xl bg-[#f7efe0] border border-[#e6d5bc]">
                        <dt className="text-[10px] uppercase tracking-wider text-[#8a5e38] font-cinzel">Biaya Daftar</dt>
                        <dd className="text-sm font-semibold text-[#241308] mt-0.5">{comp.feeFormatted} / Tim</dd>
                      </div>
                      <div className="p-3 rounded-xl bg-[#f7efe0] border border-[#e6d5bc]">
                        <dt className="text-[10px] uppercase tracking-wider text-[#8a5e38] font-cinzel">Batas Daftar</dt>
                        <dd className="text-sm font-semibold text-[#241308] mt-0.5">{comp.deadline}</dd>
                      </div>
                      <div className="p-3 rounded-xl bg-[#f7efe0] border border-[#e6d5bc]">
                        <dt className="text-[10px] uppercase tracking-wider text-[#8a5e38] font-cinzel">Komposisi</dt>
                        <dd className="text-sm font-semibold text-[#241308] mt-0.5">Tim 2–{comp.maxTeamSize} Orang</dd>
                      </div>
                    </dl>

                    {/* Ketentuan Singkat */}
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-cinzel uppercase tracking-[0.16em] text-[#7a5530] font-semibold">
                        Sasaran: <span className="font-sans normal-case tracking-normal text-[#4a2e18] font-medium">{targetAudience}</span>
                      </p>
                      <ul className="space-y-2">
                        {comp.briefRules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-[#4d321c] font-sans leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-[#ba883a] mt-0.5 shrink-0" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="relative z-10 flex flex-wrap items-center gap-3 pt-5 mt-6 border-t border-[#e6d5bc]">
                    <button
                      onClick={() => navigate(`/daftar?lomba=${comp.slug}`)}
                      className="btn-modern-shine flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs tracking-[0.16em] uppercase font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Daftar Tim Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/kompetisi/${comp.slug}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] border border-[#caa152]/60 font-cinzel text-xs tracking-[0.14em] uppercase font-semibold transition-all cursor-pointer"
                    >
                      <span>Detail &amp; Alur</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Mekanisme & Alur Singkat */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#2b1a0e] text-[#faf4e8] border border-[#caa152]/50 relative overflow-hidden">
            <BatikKawungPattern color="#caa152" opacity={0.05} id="kawung-comp-stages" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-[#caa152] mb-1">
                    Alur Kompetisi Resmi
                  </p>
                  <h3 className="font-cormorant text-2xl sm:text-3xl text-[#fffdf9] font-normal">
                    Dari Pendaftaran Hingga Awarding Night
                  </h3>
                </div>
                <button
                  onClick={() => navigate('/juklak-juknis')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3f2818] hover:bg-[#4e321e] text-[#f3d48c] border border-[#caa152]/50 font-cinzel text-[11px] tracking-[0.14em] uppercase transition-all self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
                  <span>Buka Juklak &amp; Juknis Lengkap</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {stages.map((st) => (
                  <div
                    key={st.step}
                    className="p-4 rounded-2xl bg-[#382315]/90 border border-[#caa152]/30"
                  >
                    <span className="font-cinzel text-[10px] text-[#caa152] font-semibold tracking-widest">
                      TAHAP {st.step}
                    </span>
                    <h4 className="font-cormorant text-base sm:text-lg text-[#fffdf9] mt-1 leading-snug">
                      {st.title}
                    </h4>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#dec9ad] font-sans">
                      <Calendar className="w-3 h-3 text-[#caa152] shrink-0" />
                      <span>{st.date}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#382012" accentColor="#caa152" variant="wave" />
    </div>
  );
};