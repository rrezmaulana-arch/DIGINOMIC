import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, MapPin } from 'lucide-react';
import {
  BatikKawungPattern,
  SectionWaveTransition,
} from '../../components/Ornaments';

export const EventPage: React.FC = () => {
  const navigate = useNavigate();

  const programSchedule = [
    {
      day: 'Hari 1',
      date: 'Minggu, 21 Maret 2027',
      session: 'Babak Final Kompetisi',
      location: 'Kota Malang, Jawa Timur',
      title: 'Grand Final Pitching Esai & Mini Case',
      desc: 'Presentasi langsung dan sesi tanya jawab tim finalis di hadapan dewan juri praktisi dan akademisi.',
    },
    {
      day: 'Hari 2',
      date: 'Senin, 22 Maret 2027',
      session: 'Main Event · Pagi – Siang',
      location: 'Kota Malang, Jawa Timur',
      title: 'Seminar Nasional & Pameran UMKM Binaan BI',
      desc: 'Diskusi ekonomi digital bersama Kantor Perwakilan Bank Indonesia Malang, praktisi UMKM, dan pameran produk UMKM binaan BI (target 375+ peserta).',
    },
    {
      day: 'Hari 2',
      date: 'Senin, 22 Maret 2027',
      session: 'Penutupan · Sore',
      location: 'Panggung Utama Digiconomic Fest',
      title: 'Awarding Night & Pengumuman Juara',
      desc: 'Penyerahan trofi, piagam penghargaan, dan total dana pembinaan Rp 26.000.000+ bagi para pemenang kompetisi.',
    },
  ];

  const tmRules = [
    'Perwakilan setiap tim (minimal ketua tim) wajib bergabung 15 menit sebelum sesi dimulai.',
    'Gunakan format nama Zoom: [Cabang Lomba]_[Nama Tim]_[Asal Instansi].',
    'Pelajari Juklak & Juknis terlebih dahulu sebelum sesi tanya jawab.',
    'Tautan Zoom dan notulensi resmi dibagikan melalui Dashboard Peserta & grup WhatsApp resmi.',
  ];

  return (
    <div className="w-full overflow-x-clip">
      {/* ── HERO EDITORIAL BERSIH ── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2f1d10] via-[#26160c] to-[#1e1108] text-[#faf4e8] overflow-hidden">
        <BatikKawungPattern color="#caa152" opacity={0.06} id="kawung-event-hero" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center gap-3.5 px-4 py-2 rounded-xl bg-[#faf4e8]/95 border border-[#caa152]/40 mb-5">
            <img src="/Logo/logo-bi.webp" alt="Bank Indonesia" className="h-3.5 sm:h-4 w-auto object-contain" />
            <span className="w-px h-4 bg-[#b8925a]/45" aria-hidden="true" />
            <img src="/Logo/logo-ub.webp" alt="Universitas Brawijaya" className="h-5 sm:h-6 w-auto object-contain" />
            <span className="w-px h-4 bg-[#b8925a]/45" aria-hidden="true" />
            <img src="/Logo/logo-genbi.webp" alt="GenBI UB" className="h-4 sm:h-5 w-auto object-contain" />
          </div>

          <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.26em] uppercase text-[#e3c47f] mb-2.5">
            21 – 22 Maret 2027 · Malang, Jawa Timur
          </p>

          <h1 className="font-cormorant text-3xl sm:text-5xl lg:text-6xl text-[#fffdf9] font-normal tracking-tight leading-tight">
            Rangkaian <span className="shimmer-text">Digiconomic Fest 2027</span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto font-sans text-xs sm:text-sm md:text-base text-[#dec9ad] leading-relaxed">
            Program kolaboratif GenBI Komisariat Universitas Brawijaya bersama Kantor Perwakilan Bank Indonesia Malang—memadukan final kompetisi nasional, seminar, pameran UMKM binaan BI, hingga Awarding Night.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/kompetisi')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs tracking-[0.16em] uppercase font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>Lihat Kompetisi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/juklak-juknis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-transparent hover:bg-[#382315] text-[#faf4e8] border border-[#caa152]/50 font-cinzel text-xs tracking-[0.16em] uppercase transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
              <span>Juklak &amp; Juknis</span>
            </button>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#f3e6d3" accentColor="#caa152" variant="cloud" />

      {/* ── PROGRAM BUKU ACARA (BERSIH, TANPA STOCK PHOTO / CLUTTER) ── */}
      <section className="relative py-12 sm:py-18 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#ebdcc5]">
        <BatikKawungPattern color="#7a5530" opacity={0.04} id="kawung-event-list" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-14">
          {/* 3 Pilar Singkat (Horizontal Editorial Index) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-10 border-b border-[#d6be9b]">
            {[
              {
                no: '01',
                title: 'Seleksi & Kompetisi',
                desc: 'Pendaftaran tim, pengumpulan karya, dan penjurian Esai Nasional serta Mini Case Competition (Des 2026 – Feb 2027).',
              },
              {
                no: '02',
                title: 'Seminar & Pameran UMKM',
                desc: 'Edukasi ekonomi digital bersama KPw Bank Indonesia Malang sekaligus pameran produk unggulan UMKM binaan BI.',
              },
              {
                no: '03',
                title: 'Grand Final & Awarding',
                desc: 'Presentasi finalis terbaik di Kota Malang dan malam penganugerahan total dana pembinaan Rp 26.000.000+.',
              },
            ].map((item) => (
              <div key={item.no} className="space-y-1.5">
                <span className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#9a6c30]">
                  {item.no}
                </span>
                <h2 className="font-cormorant text-2xl text-[#241308] font-semibold leading-snug">
                  {item.title}
                </h2>
                <p className="font-sans text-xs sm:text-[13.5px] text-[#4a2e18] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Jadwal Puncak 21–22 Maret 2027 (Format Editorial Agenda Rows) */}
          <div>
            <div className="mb-7">
              <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#7a5530] font-semibold">
                Agenda Puncak di Malang
              </p>
              <h2 className="font-cormorant text-2xl sm:text-4xl text-[#241308] font-normal mt-1">
                Jadwal Kegiatan Utama
              </h2>
            </div>

            <div className="divide-y divide-[#d8c3a3] border-y border-[#d8c3a3]">
              {programSchedule.map((ev) => (
                <div
                  key={ev.title}
                  className="py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-start"
                >
                  <div className="md:col-span-4 space-y-1">
                    <p className="font-cinzel text-[11px] tracking-[0.18em] uppercase text-[#8a5e38] font-semibold">
                      {ev.day} · {ev.session}
                    </p>
                    <p className="font-poppins text-sm sm:text-base font-semibold text-[#241308]">
                      {ev.date}
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-[#6b4725] font-sans">
                      <MapPin className="w-3.5 h-3.5 text-[#ba883a] shrink-0" />
                      <span>{ev.location}</span>
                    </p>
                  </div>

                  <div className="md:col-span-8 space-y-1.5">
                    <h3 className="font-cormorant text-2xl sm:text-[1.7rem] text-[#241308] font-semibold leading-snug">
                      {ev.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed">
                      {ev.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#2b1a0e" accentColor="#caa152" variant="ridge" />

      {/* ── TECHNICAL MEETING (EDITORIAL 2 KOLOM BERSIH) ── */}
      <section
        id="technical-meeting"
        className="relative py-12 sm:py-18 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2b1a0e] via-[#24140a] to-[#1e1108] text-[#faf4e8] overflow-hidden"
      >
        <BatikKawungPattern color="#caa152" opacity={0.05} id="kawung-tm" />

        <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Kolom Kiri: Jadwal 2 Sesi TM */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#caa152] font-semibold">
                Pengarahan Daring via Zoom
              </p>
              <h2 className="font-cormorant text-3xl sm:text-4xl text-[#fffdf9] font-normal mt-1">
                Technical Meeting
              </h2>
            </div>

            <div className="divide-y divide-[#caa152]/25 border-y border-[#caa152]/25">
              <div className="py-4">
                <p className="font-cinzel text-[10px] tracking-[0.18em] uppercase text-[#e3c47f]">
                  Sesi 01 · Babak Penyisihan
                </p>
                <p className="font-poppins text-sm font-semibold text-[#fffdf9] mt-1">
                  Awal Februari 2027
                </p>
                <p className="font-sans text-xs text-[#dec9ad] mt-1">
                  Setelah penutupan pendaftaran 30 Januari 2027. Jadwal pasti diumumkan di Dashboard Peserta.
                </p>
              </div>
              <div className="py-4">
                <p className="font-cinzel text-[10px] tracking-[0.18em] uppercase text-[#e3c47f]">
                  Sesi 02 · Khusus Finalis
                </p>
                <p className="font-poppins text-sm font-semibold text-[#fffdf9] mt-1">
                  Setelah 20 Februari 2027
                </p>
                <p className="font-sans text-xs text-[#dec9ad] mt-1">
                  Pengarahan teknis presentasi menuju Grand Final 21 Maret 2027 di Malang.
                </p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ketentuan Singkat */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="font-cormorant text-2xl sm:text-3xl text-[#fffdf9] font-normal">
                Ketentuan Kehadiran Tim
              </h3>
              <p className="font-sans text-xs text-[#dec9ad] mt-1">
                Tim yang berhalangan hadir dianggap menyetujui seluruh hasil keputusan Technical Meeting.
              </p>
            </div>

            <ol className="space-y-3.5">
              {tmRules.map((rule, idx) => (
                <li
                  key={rule}
                  className="flex items-start gap-3.5 text-xs sm:text-sm text-[#e8d6bc] font-sans leading-relaxed"
                >
                  <span className="font-cinzel text-xs font-semibold text-[#caa152] pt-0.5 shrink-0">
                    0{idx + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/news')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#caa152] hover:bg-[#d8b163] text-[#241308] font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-colors cursor-pointer"
              >
                <span>Cek Pengumuman</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#caa152]/50 hover:bg-[#382315] text-[#faf4e8] font-cinzel text-[11px] tracking-[0.14em] uppercase transition-colors cursor-pointer"
              >
                <span>Dashboard Peserta</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#382012" accentColor="#caa152" variant="wave" />
    </div>
  );
};