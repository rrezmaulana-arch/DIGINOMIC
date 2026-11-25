import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Video,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Mic,
  Store,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import {
  BatikKawungPattern,
  SectionWaveTransition,
} from '../../components/Ornaments';

export const EventPage: React.FC = () => {
  const navigate = useNavigate();

  const grandConcepts = [
    {
      no: '01',
      title: 'Persiapan & Penyelenggaraan Kompetisi',
      desc: 'Membuka ruang partisipasi bagi mahasiswa dan pelajar melalui rangkaian pendaftaran (14 Des 2026 – 30 Jan 2027), pengumpulan karya, seleksi penjurian, hingga penentuan finalis.',
    },
    {
      no: '02',
      title: 'Kompetisi & Inovasi',
      desc: 'Mendorong generasi muda menuangkan kreativitas, ide, dan solusi inovatif dalam menjawab tantangan serta mengembangkan potensi UMKM lokal di negara emerging market.',
    },
    {
      no: '03',
      title: 'Seminar & Awarding',
      desc: 'Menghadirkan sesi edukatif bersama Bank Indonesia dan praktisi UMKM untuk memperluas wawasan peserta (target 375+ peserta), sekaligus apresiasi bagi para finalis dan pemenang.',
    },
  ];

  const mainEvents = [
    {
      badge: 'Hari 1 • 21 Maret 2027',
      title: 'Competition Final (Babak Final)',
      schedule: 'Minggu, 21 Maret 2027',
      location: 'Kota Malang, Jawa Timur',
      icon: <Trophy className="w-5 h-5 text-[#caa152]" />,
      desc: 'Presentasi langsung finalis terbaik cabang Esai Nasional dan Mini Case Competition di hadapan dewan juri praktisi dan akademisi.',
      highlights: [
        'Pitching & uji gagasan langsung bersama dewan juri',
        'Sesi tanya jawab dan umpan balik strategis',
        'Penentuan juara untuk Awarding Night keesokan harinya',
      ],
    },
    {
      badge: 'Hari 2 • 22 Maret 2027',
      title: 'Seminar Bank Indonesia & Pameran UMKM Binaan BI',
      schedule: 'Senin, 22 Maret 2027 (Main Event)',
      location: 'Kota Malang, Jawa Timur',
      icon: <Mic className="w-5 h-5 text-[#caa152]" />,
      desc: 'Acara puncak Digiconomic Fest 2027 yang memadukan seminar nasional bersama Bank Indonesia & praktisi UMKM serta Pameran UMKM binaan BI.',
      highlights: [
        'Seminar bersama Bank Indonesia & praktisi UMKM (target 375+ hadirin)',
        'Sesi diskusi dan tanya jawab interaktif',
        'Pameran UMKM binaan Bank Indonesia',
      ],
    },
    {
      badge: 'Penutupan • 22 Maret 2027',
      title: 'Awarding & Pengumuman Pemenang',
      schedule: 'Senin, 22 Maret 2027 (Penutupan)',
      location: 'Panggung Utama Digiconomic Fest, Malang',
      icon: <Award className="w-5 h-5 text-[#caa152]" />,
      desc: 'Momen apresiasi tertinggi berupa penyerahan piala, piagam penghargaan, dan total hadiah pembinaan Rp 26.000.000 bagi para pemenang kompetisi.',
      highlights: [
        'Pengumuman resmi pemenang Esai Nasional & Mini Case Competition',
        'Dokumentasi bersama jajaran Bank Indonesia & GenBI Malang',
        'Penutupan rangkaian Digiconomic Fest 2027',
      ],
    },
  ];

  const tmChecklist = [
    'Perwakilan setiap tim (minimal ketua tim) atau peserta individu wajib hadir 15 menit sebelum sesi dimulai.',
    'Menggunakan format penamaan Zoom: [Cabang Lomba]_[Nama Tim/Peserta]_[Asal Instansi].',
    'Membaca buku panduan (Juklak & Juknis) masing-masing cabang lomba sebelum sesi tanya jawab.',
    'Menyiapkan pertanyaan teknis terkait format berkas karya, rubrik penilaian, dan jadwal pengumpulan.',
    'Tautan Zoom Meeting dan notulensi resmi dibagikan melalui Dashboard Peserta serta grup WhatsApp resmi.',
  ];

  return (
    <div className="w-full overflow-x-clip">
      {/* ── HERO HEADER (Deep Royal Espresso) ── */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2f1d10] via-[#26160c] to-[#1e1108] text-[#faf4e8] overflow-hidden">
        <BatikKawungPattern color="#caa152" opacity={0.07} id="kawung-event-hero" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3f2818] border border-[#caa152]/50 text-[#f3d48c] font-cinzel text-[10px] sm:text-xs tracking-[0.22em] uppercase font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Rangkaian Acara & Technical Meeting</span>
          </div>

          <h1 className="font-cormorant text-3xl sm:text-5xl lg:text-6xl text-[#fffdf9] font-normal tracking-tight leading-tight">
            Rangkaian <span className="shimmer-text">Digiconomic Fest 2027</span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto font-sans text-xs sm:text-sm md:text-base text-[#dec9ad] leading-relaxed">
            Program kerja kolaboratif Divisi Pendidikan &amp; Divisi Kewirausahaan GenBI Malang—menghadirkan Babak Final Kompetisi (21 Maret 2027), Seminar bersama Bank Indonesia, Pameran UMKM binaan BI, hingga Awarding Night (22 Maret 2027).
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#f3d48c] font-sans">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#382315]/90 border border-[#caa152]/35">
              <Calendar className="w-4 h-4 text-[#caa152]" />
              21–22 Maret 2027 (Final &amp; Main Event)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#382315]/90 border border-[#caa152]/35">
              <Store className="w-4 h-4 text-[#caa152]" />
              Pameran UMKM Binaan BI
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#382315]/90 border border-[#caa152]/35">
              <MapPin className="w-4 h-4 text-[#caa152]" />
              Malang, Jawa Timur
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/kompetisi')}
              className="btn-modern-shine inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs tracking-[0.18em] uppercase font-semibold shadow-md active:scale-95 transition-all"
            >
              <span>Lihat Cabang Kompetisi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/juklak-juknis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#382315]/90 hover:bg-[#462c1b] text-[#faf4e8] border border-[#caa152]/50 font-cinzel text-xs tracking-[0.16em] uppercase transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
              <span>Baca Juklak &amp; Juknis</span>
            </button>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#f3e6d3" accentColor="#caa152" variant="cloud" />

      {/* ── KONSEP BESAR & RANGKAIAN ACARA (Warm Parchment) ── */}
      <section className="relative py-12 sm:py-18 lg:py-22 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#ebdcc5]">
        <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-event-list" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-14 sm:space-y-20">
          {/* Konsep Besar 3 Pilar */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] text-[#7a5530] uppercase font-semibold mb-1.5">
                Grand Design 2027
              </p>
              <h2 className="font-cormorant text-2xl sm:text-4xl text-[#241308] font-normal">
                Konsep Besar Digiconomic Fest
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {grandConcepts.map((item) => (
                <div
                  key={item.no}
                  className="p-5 sm:p-6 rounded-2xl bg-[#fffdf9]/95 border border-[#ebdcc8] shadow-xs relative"
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ba883a] to-[#caa152] text-white font-cinzel text-xs font-semibold flex items-center justify-center shrink-0">
                      {item.no}
                    </span>
                    <h3 className="font-cormorant text-lg sm:text-xl text-[#241308] font-normal leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Final & Acara Puncak */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] text-[#7a5530] uppercase font-semibold mb-1.5">
                Agenda Final &amp; Acara Puncak
              </p>
              <h2 className="font-cormorant text-2xl sm:text-4xl text-[#241308] font-normal">
                Jadwal Kegiatan Utama
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {mainEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="card-modern-hover p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#fffdf9]/95 border border-[#ebdcc8] shadow-xs flex flex-col justify-between relative"
                >
                  <div className="absolute inset-2 rounded-xl sm:rounded-2xl border border-dashed border-[#caa152]/25 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-cinzel text-[10px] tracking-[0.16em] uppercase text-[#8a5e38] font-semibold bg-[#f5ede0] px-2.5 py-1 rounded-full border border-[#ebdcc8]">
                        {ev.badge}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] flex items-center justify-center shrink-0">
                        {ev.icon}
                      </div>
                    </div>

                    <h3 className="font-cormorant text-xl sm:text-2xl text-[#241308] font-normal leading-snug mb-2">
                      {ev.title}
                    </h3>

                    <div className="space-y-1 text-xs text-[#7a5530] font-sans mb-3">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#caa152] shrink-0" />
                        <span>{ev.schedule}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#caa152] shrink-0" />
                        <span>{ev.location}</span>
                      </p>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed mb-4">
                      {ev.desc}
                    </p>

                    <ul className="space-y-2 border-t border-[#ebdcc8] pt-3">
                      {ev.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#5c3e28] font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#ba883a] mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#2b1a0e" accentColor="#caa152" variant="ridge" />

      {/* ── INFORMASI TECHNICAL MEETING (Tugas #9 — Deep Royal Espresso) ── */}
      <section
        id="technical-meeting"
        className="relative py-12 sm:py-18 lg:py-22 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2b1a0e] via-[#24140a] to-[#1e1108] text-[#faf4e8] overflow-hidden"
      >
        <BatikKawungPattern color="#caa152" opacity={0.06} id="kawung-tm" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3f2818] border border-[#caa152]/45 text-[#f3d48c] font-cinzel text-[10px] tracking-[0.2em] uppercase font-semibold mb-2.5">
              <Video className="w-3.5 h-3.5 text-[#caa152]" />
              <span>Wajib Diikuti Peserta Terdaftar</span>
            </div>
            <h2 className="font-cormorant text-2xl sm:text-4xl text-[#fffdf9] font-normal">
              Informasi <span className="shimmer-text">Technical Meeting</span>
            </h2>
            <p className="mt-2 font-sans text-xs sm:text-sm text-[#dec9ad]">
              Pengarahan teknis untuk menyamakan pemahaman aturan, format karya, dan mekanisme penilaian bagi peserta Esai Nasional dan Mini Case Competition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#382315]/90 border border-[#caa152]/40 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-cormorant text-xl sm:text-2xl text-[#fffdf9] font-normal">
                  Tahapan Technical Meeting
                </h3>

                <div className="space-y-3 text-xs sm:text-sm font-sans text-[#e6d3b9]">
                  <div className="p-3 rounded-xl bg-[#2a180d] border border-[#caa152]/25">
                    <p className="text-[10px] font-cinzel uppercase tracking-wider text-[#caa152] mb-0.5">
                      TM Babak Penyisihan
                    </p>
                    <p className="font-semibold text-[#fffdf9]">Setelah Penutupan Registrasi (Awal Feb 2027)</p>
                    <p className="text-xs text-[#dec9ad] mt-0.5">Daring via Zoom Meeting — jadwal pasti diumumkan di Dashboard Peserta</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#2a180d] border border-[#caa152]/25">
                    <p className="text-[10px] font-cinzel uppercase tracking-wider text-[#caa152] mb-0.5">
                      TM Finalis (Menuju Final 21 Maret 2027)
                    </p>
                    <p className="font-semibold text-[#fffdf9]">Setelah Pengumuman Finalis (20 Feb 2027)</p>
                    <p className="text-xs text-[#dec9ad] mt-0.5">Daring via Zoom Meeting — khusus finalis lolos seleksi</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#caa152]/25 flex items-start gap-2 text-xs text-[#f3d48c]">
                <AlertCircle className="w-4 h-4 text-[#caa152] shrink-0 mt-0.5" />
                <span>Peserta yang berhalangan hadir dianggap menyetujui seluruh hasil keputusan Technical Meeting.</span>
              </div>
            </div>

            <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#382315]/90 border border-[#caa152]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-[#caa152]" />
                  <h3 className="font-cormorant text-xl sm:text-2xl text-[#fffdf9] font-normal">
                    Ketentuan &amp; Persiapan Peserta
                  </h3>
                </div>

                <ul className="space-y-3">
                  {tmChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#e6d3b9] font-sans leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[#caa152]/20 border border-[#caa152]/60 text-[#f3d48c] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/news')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#caa152] hover:bg-[#d8b163] text-[#241308] font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-all"
                >
                  <span>Cek Pengumuman &amp; Berita</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent hover:bg-[#452b1a] text-[#faf4e8] border border-[#caa152]/50 font-cinzel text-[11px] tracking-[0.14em] uppercase transition-all"
                >
                  <span>Buka Dashboard Peserta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#382012" accentColor="#caa152" variant="wave" />
    </div>
  );
};