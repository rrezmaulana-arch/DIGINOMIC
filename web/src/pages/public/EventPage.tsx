import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Check, MapPin, Video } from 'lucide-react';
import {
  BatikKawungPattern,
  CornerFiligree,
  SectionWaveTransition,
} from '../../components/Ornaments';

export const EventPage: React.FC = () => {
  const navigate = useNavigate();

  const tmRules = [
    'Perwakilan setiap tim (minimal ketua tim) wajib hadir 15 menit sebelum sesi dimulai.',
    'Gunakan format nama Zoom: [Cabang Lomba]_[Nama Tim]_[Asal Instansi].',
    'Pelajari Juklak & Juknis terlebih dahulu sebelum sesi tanya jawab.',
    'Tautan Zoom dan notulensi resmi dibagikan di Dashboard Peserta & grup WhatsApp resmi.',
  ];

  return (
    <div className="w-full overflow-x-clip">
      {/* ── HERO ATMOSPHERIC 2-KOLOM + KARTU UNDANGAN RESMI ── */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-16 bg-[#23140a] text-[#faf4e8] overflow-hidden">
        {/* Latar visual khas Digiconomic dengan lapisan espresso hangat */}
        <picture aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-20">
          <source media="(min-width: 1024px)" srcSet="/gambar/hero-view-dekstop.webp" />
          <img
            src="/gambar/hero-view-mobile.webp"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </picture>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(35,20,10,0.95) 0%, rgba(47,29,16,0.86) 55%, rgba(28,15,6,0.94) 100%)',
          }}
        />
        <BatikKawungPattern color="#caa152" opacity={0.06} id="kawung-event-hero" />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Kiri: Narasi & CTA */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.26em] uppercase text-[#e3c47f] font-medium">
              Rangkaian Acara · Digiconomic Fest 2027
            </p>

            <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-[3.6rem] text-[#fffdf9] font-normal tracking-tight leading-[1.08]">
              Dua Hari Puncak{' '}
              <span className="shimmer-text block sm:inline">Inovasi &amp; Apresiasi</span>
            </h1>

            <p className="font-sans text-xs sm:text-sm md:text-base text-[#dec9ad] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Diselenggarakan oleh <strong className="text-[#fffdf9]">GenBI Komisariat Universitas Brawijaya</strong> bersama <strong className="text-[#fffdf9]">Kantor Perwakilan Bank Indonesia Malang</strong>, mempertemukan finalis nasional, seminar ekonomi digital, dan pameran UMKM binaan BI.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#f3d48c] font-sans pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#caa152]" />
                21 – 22 Maret 2027
              </span>
              <span className="text-[#caa152]/50">•</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#caa152]" />
                Universitas Brawijaya
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => navigate('/kompetisi')}
                className="btn-modern-shine inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs tracking-[0.16em] uppercase font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span>Lihat Kompetisi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/juklak-juknis')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#382315]/80 hover:bg-[#492e1c] text-[#faf4e8] border border-[#caa152]/50 font-cinzel text-xs tracking-[0.16em] uppercase transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
                <span>Juklak &amp; Juknis</span>
              </button>
            </div>
          </div>

          {/* Kanan: Kartu Undangan Resmi (Logo Terintegrasi Rapi di Footer Kartu) */}
          <div className="lg:col-span-5">
            <div className="card-modern-hover relative rounded-3xl overflow-hidden border border-[#caa152]/55 bg-[#2d1b0f]/95 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)]">
              <CornerFiligree color="#caa152" className="w-6 h-6 opacity-50" />

              <div className="p-6 sm:p-7 space-y-5 relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/Logo/00-logo-gabungan.svg"
                      alt="Logo Digiconomic Fest"
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <p className="font-cinzel text-[10px] tracking-[0.22em] uppercase text-[#caa152]">
                        Main Event Pass
                      </p>
                      <p className="font-cormorant text-xl text-[#fffdf9] font-semibold leading-none mt-0.5">
                        Digiconomic Fest 2027
                      </p>
                    </div>
                  </div>
                  <span className="font-cinzel text-[9px] tracking-[0.12em] uppercase text-[#f3d48c] border border-[#caa152]/40 px-2.5 py-1 rounded-full text-center shrink-0">
                    Universitas Brawijaya
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#caa152]/25 text-left">
                  <div className="p-3.5 rounded-2xl bg-[#201209]/90 border border-[#caa152]/20 hover:border-[#caa152]/65 hover:-translate-y-0.5 transition-all duration-250">
                    <p className="font-cinzel text-[9.5px] tracking-[0.18em] uppercase text-[#caa152]">Hari 1 · Online</p>
                    <p className="font-cormorant text-2xl text-[#fffdf9] font-semibold mt-0.5">21 Mar</p>
                    <p className="font-sans text-[11px] text-[#dec9ad] mt-0.5">Competition Final</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#201209]/90 border border-[#caa152]/20 hover:border-[#caa152]/65 hover:-translate-y-0.5 transition-all duration-250">
                    <p className="font-cinzel text-[9.5px] tracking-[0.18em] uppercase text-[#caa152]">Hari 2</p>
                    <p className="font-cormorant text-2xl text-[#fffdf9] font-semibold mt-0.5">22 Mar</p>
                    <p className="font-sans text-[11px] text-[#dec9ad] mt-0.5">Seminar, Expo &amp; Awarding</p>
                  </div>
                </div>
              </div>

              {/* Strip Penyelenggara Resmi (Parchment bersih menyatu dengan kartu) */}
              <div className="bg-[#faf4e8] px-6 py-3.5 border-t border-[#caa152]/45 flex items-center justify-between gap-3">
                <span className="font-cinzel text-[9px] tracking-[0.16em] uppercase text-[#7a5530] font-semibold shrink-0">
                  Diselenggarakan
                </span>
                <div className="flex items-center gap-3">
                  <img src="/Logo/logo-bi.webp" alt="Bank Indonesia" className="h-3.5 sm:h-4 w-auto object-contain" />
                  <span className="w-px h-3.5 bg-[#b8925a]/45" aria-hidden="true" />
                  <img src="/Logo/logo-genbi.webp" alt="GenBI UB" className="h-4 sm:h-5 w-auto object-contain" />
                  <span className="w-px h-3.5 bg-[#b8925a]/45" aria-hidden="true" />
                  <img src="/Logo/logo-ub.webp" alt="Universitas Brawijaya" className="h-5 sm:h-6 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#23140a" toColor="#f3e6d3" accentColor="#caa152" variant="cloud" />

      {/* ── SHOWCASE VISUAL 2 HARI PUNCAK (ALTERNATING EDITORIAL PHOTO + TEXT) ── */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#ebdcc5]">
        <BatikKawungPattern color="#7a5530" opacity={0.04} id="kawung-event-list" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-16 sm:space-y-24">
          {/* HARI 1: Foto Kiri, Penjelasan Kanan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="card-modern-hover group relative rounded-3xl overflow-hidden border-2 border-[#d8be99] hover:border-[#caa152] bg-[#fffdf9] p-2.5 shadow-[0_20px_48px_-18px_rgba(47,30,16,0.28)]">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#2b1a0e]">
                  <img
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&fm=webp&q=80"
                    alt="Babak Final Pitching Digiconomic Fest 2027"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover filter sepia-[0.14] transition-all duration-700 ease-out group-hover:scale-105 group-hover:sepia-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241308]/65 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-80" />
                  <div className="absolute bottom-4 left-4 bg-[#fffdf9]/95 backdrop-blur-xs px-4 py-2 rounded-xl border border-[#caa152]/60 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                    <p className="font-cinzel text-[9px] tracking-[0.2em] uppercase text-[#8a5e38] font-semibold">
                      Hari Pertama
                    </p>
                    <p className="font-cormorant text-xl font-semibold text-[#241308] leading-tight">
                      21 Maret 2027
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#8a5e38] font-semibold">
                Agenda 01 · Babak Final (Online)
              </p>
              <h2 className="font-cormorant text-3xl sm:text-4xl text-[#241308] font-normal leading-tight">
                Grand Final Pitching{' '}
                <span className="text-[#9a6522]">Esai &amp; Mini Case</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed">
                Tim finalis terbaik dari seluruh Indonesia memaparkan gagasan dan solusi bisnis UMKM secara daring (online) di hadapan dewan juri praktisi dan akademisi.
              </p>
              <ul className="space-y-2.5 pt-2">
                {[
                  'Presentasi karya & studi kasus langsung di hadapan dewan juri',
                  'Sesi tanya jawab mendalam dan umpan balik strategis',
                  'Penentuan peringkat pemenang menuju malam Awarding Night',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3d2514] font-sans">
                    <span className="w-5 h-5 rounded-full bg-[#2f1d10] text-[#f3d48c] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* HARI 2: Penjelasan Kiri, Foto Kanan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 space-y-4">
              <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#8a5e38] font-semibold">
                Agenda 02 · Main Event &amp; Awarding Night
              </p>
              <h2 className="font-cormorant text-3xl sm:text-4xl text-[#241308] font-normal leading-tight">
                Seminar Bank Indonesia,{' '}
                <span className="text-[#9a6522]">Expo UMKM &amp; Awarding</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed">
                Acara puncak Digiconomic Fest 2027 yang terbuka bagi 375+ peserta, memadukan seminar ekonomi digital bersama KPw Bank Indonesia Malang, pameran produk UMKM binaan BI, hingga penganugerahan juara.
              </p>
              <ul className="space-y-2.5 pt-2">
                {[
                  'Seminar nasional bersama Kantor Perwakilan Bank Indonesia Malang & praktisi UMKM',
                  'Pameran produk kreatif dan inovasi UMKM binaan Bank Indonesia',
                  'Penyerahan trofi, e-sertifikat nasional, dan total dana pembinaan Rp 26.000.000+',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3d2514] font-sans">
                    <span className="w-5 h-5 rounded-full bg-[#2f1d10] text-[#f3d48c] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 relative">
              <div className="card-modern-hover group relative rounded-3xl overflow-hidden border-2 border-[#d8be99] hover:border-[#caa152] bg-[#fffdf9] p-2.5 shadow-[0_20px_48px_-18px_rgba(47,30,16,0.28)]">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#2b1a0e]">
                  <img
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&fm=webp&q=80"
                    alt="Seminar Nasional dan Pameran UMKM Bank Indonesia"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover filter sepia-[0.14] transition-all duration-700 ease-out group-hover:scale-105 group-hover:sepia-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241308]/65 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-80" />
                  <div className="absolute bottom-4 right-4 bg-[#fffdf9]/95 backdrop-blur-xs px-4 py-2 rounded-xl border border-[#caa152]/60 shadow-sm text-right transition-transform duration-300 group-hover:-translate-y-0.5">
                    <p className="font-cinzel text-[9px] tracking-[0.2em] uppercase text-[#8a5e38] font-semibold">
                      Acara Puncak
                    </p>
                    <p className="font-cormorant text-xl font-semibold text-[#241308] leading-tight">
                      22 Maret 2027
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#2b1a0e" accentColor="#caa152" variant="ridge" />

      {/* ── TECHNICAL MEETING (DARK ESPRESSO + KARTU PANDUAN PARCHMENT KONTRAS TINGGI) ── */}
      <section
        id="technical-meeting"
        className="relative py-14 sm:py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2b1a0e] via-[#24140a] to-[#1e1108] text-[#faf4e8] overflow-hidden"
      >
        <BatikKawungPattern color="#caa152" opacity={0.05} id="kawung-tm" />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Kiri: Info 2 Sesi TM */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="inline-flex items-center gap-1.5 font-cinzel text-[10px] sm:text-xs tracking-[0.22em] uppercase text-[#e3c47f] font-semibold mb-2">
                <Video className="w-3.5 h-3.5 text-[#caa152]" />
                <span>Pengarahan Daring · Zoom Meeting</span>
              </p>
              <h2 className="font-cormorant text-3xl sm:text-4xl text-[#fffdf9] font-normal leading-tight">
                Jadwal <span className="text-[#e8c47a]">Technical Meeting</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#dec9ad] leading-relaxed mt-2">
                Wajib diikuti perwakilan tim terdaftar untuk menyamakan aturan teknis, format berkas, dan alur penilaian.
              </p>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-[#caa152]/60">
              <div>
                <p className="font-cinzel text-[10px] tracking-[0.18em] uppercase text-[#caa152]">
                  Technical Meeting Finalis
                </p>
                <p className="font-poppins text-sm sm:text-base font-semibold text-[#fffdf9] mt-0.5">
                  22 Februari 2027
                </p>
                <p className="font-sans text-xs text-[#dec9ad] mt-0.5">
                  Dilaksanakan daring setelah Pengumuman Finalis (20 Februari 2027) untuk pengarahan teknis pitching &amp; tata tertib.
                </p>
              </div>
              <div>
                <p className="font-cinzel text-[10px] tracking-[0.18em] uppercase text-[#caa152]">
                  Batas Pengumpulan PPT Final
                </p>
                <p className="font-poppins text-sm sm:text-base font-semibold text-[#fffdf9] mt-0.5">
                  5 Maret 2027
                </p>
                <p className="font-sans text-xs text-[#dec9ad] mt-0.5">
                  Seluruh tim finalis mengumpulkan deck presentasi menuju Kompetisi Final Online pada 21 Maret 2027.
                </p>
              </div>
            </div>
          </div>

          {/* Kanan: Kartu Parchment Panduan Singkat */}
          <div className="lg:col-span-7">
            <div className="card-modern-hover relative rounded-3xl bg-[#fffdf9] text-[#241308] border border-[#caa152]/70 p-6 sm:p-8 shadow-xl">
              <CornerFiligree color="#b88c52" className="w-6 h-6 opacity-40" />

              <div className="relative z-10 space-y-5">
                <div>
                  <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-[#8a5e38] font-semibold">
                    Ketentuan Peserta
                  </p>
                  <h3 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-semibold mt-0.5">
                    Persiapan Sebelum Technical Meeting
                  </h3>
                </div>

                <ol className="space-y-3">
                  {tmRules.map((rule, idx) => (
                    <li
                      key={rule}
                      className="flex items-start gap-3 text-xs sm:text-sm text-[#4a2e18] font-sans leading-relaxed"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#f3e6d3] border border-[#caa152]/70 text-[#6b4725] font-cinzel text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>

                <p className="text-[11px] text-[#7a5530] italic pt-2 border-t border-[#ecdec9]">
                  Tim yang berhalangan hadir dianggap menyetujui seluruh hasil keputusan Technical Meeting.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => navigate('/news')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2f1d10] hover:bg-[#462b18] text-[#faf4e8] font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-colors cursor-pointer"
                  >
                    <span>Cek Pengumuman</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#caa152]" />
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#caa152] hover:bg-[#f4ead9] text-[#2f1e10] font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-colors cursor-pointer"
                  >
                    <span>Dashboard Peserta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#382012" accentColor="#caa152" variant="wave" />
    </div>
  );
};