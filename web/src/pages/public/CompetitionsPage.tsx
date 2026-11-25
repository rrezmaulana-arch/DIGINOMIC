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
              <Users className="w-4 h-4 text-[#caa152]" />
              350+ Target Esai • 100+ Target Mini Case
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
      <section className="relative py-12 sm:py-18 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#ebdcc5]">
        <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-comp-page-grid" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {COMPETITIONS_DATA.map((comp) => {
              const IconComp = comp.iconName === 'Briefcase' ? Briefcase : FileText;
              return (
                <div
                  key={comp.id}
                  className="card-modern-hover p-6 sm:p-8 rounded-3xl bg-[#fffdf9] border border-[#ebdcc8] shadow-sm flex flex-col justify-between relative"
                >
                  <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/25 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full bg-[#f5ede0] border border-[#ebdcc8] text-[#7a5530] font-cinzel text-[10px] tracking-[0.18em] uppercase font-semibold">
                        Kategori {comp.category} {comp.isTeam ? `(2–${comp.maxTeamSize} Orang)` : '(Perorangan)'}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-[#2f1d10] border border-[#caa152]/60 flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5 text-[#f3d48c]" />
                      </div>
                    </div>

                    <h2 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-normal mb-2">
                      {comp.title}
                    </h2>

                    <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed mb-5">
                      {comp.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8] mb-5 text-xs font-sans">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#8a5e38] font-cinzel">Biaya Daftar</p>
                        <p className="text-sm sm:text-base font-semibold text-[#241308] mt-0.5">{comp.feeFormatted}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#8a5e38] font-cinzel">Batas Daftar</p>
                        <p className="text-sm sm:text-base font-semibold text-[#241308] mt-0.5">{comp.deadline}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-[#ebdcc8]">
                        <p className="text-[10px] uppercase tracking-wider text-[#8a5e38] font-cinzel">Apresiasi &amp; Hadiah</p>
                        <p className="text-xs sm:text-sm font-medium text-[#7a5530] mt-0.5">{comp.prizes}</p>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {comp.briefRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#5c3e28] font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#ba883a] mt-0.5 shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 border-t border-[#ebdcc8]">
                    <button
                      onClick={() => navigate(`/daftar?lomba=${comp.slug}`)}
                      className="btn-modern-shine flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs tracking-[0.16em] uppercase font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Daftar Lomba</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/kompetisi/${comp.slug}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] border border-[#caa152]/60 font-cinzel text-xs tracking-[0.14em] uppercase font-medium transition-all"
                    >
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
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