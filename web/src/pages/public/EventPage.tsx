import React, { useState } from 'react';
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
  Compass,
  Lightbulb,
  Layers,
} from 'lucide-react';
import {
  BatikKawungPattern,
  CornerFiligree,
  SectionWaveTransition,
} from '../../components/Ornaments';

export const EventPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');

  const eventStats = [
    { value: '2 Hari', label: 'Final & Main Event', sub: '21–22 Maret 2027' },
    { value: '2 Cabang', label: 'Kompetisi Tim Nasional', sub: 'Maks. 3 Orang / Tim' },
    { value: '375+', label: 'Target Hadirin Seminar', sub: 'Mahasiswa & Praktisi' },
    { value: 'Rp 26 Jt+', label: 'Total Hadiah Pembinaan', sub: 'Trofi & E-Sertifikat' },
  ];

  const grandConcepts = [
    {
      no: '01',
      tag: 'Tahap Seleksi',
      title: 'Kompetisi Tim Nasional',
      summary: 'Pendaftaran, seleksi berkas, dan penjurian karya Esai Nasional & Mini Case Competition.',
      period: '14 Des 2026 – 20 Feb 2027',
      icon: <Compass className="w-5 h-5 text-[#f3d48c]" />,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&fm=webp&q=75',
    },
    {
      no: '02',
      tag: 'Inovasi UMKM',
      title: 'Akselerasi Gagasan & Bisnis',
      summary: 'Ruang kolaborasi generasi muda merancang solusi digital & strategi nyata bagi UMKM lokal.',
      period: 'Fokus Emerging Market',
      icon: <Lightbulb className="w-5 h-5 text-[#f3d48c]" />,
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&fm=webp&q=75',
    },
    {
      no: '03',
      tag: 'Puncak Acara',
      title: 'Seminar, Expo & Awarding',
      summary: 'Seminar bersama KPw Bank Indonesia Malang, Pameran UMKM binaan BI, dan malam penganugerahan.',
      period: '21–22 Maret 2027 · Malang',
      icon: <Layers className="w-5 h-5 text-[#f3d48c]" />,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&fm=webp&q=75',
    },
  ];

  const scheduleByDay = {
    day1: {
      dateLabel: 'Minggu, 21 Maret 2027',
      headline: 'Competition Final & Uji Gagasan Dewan Juri',
      location: 'Kota Malang, Jawa Timur',
      items: [
        {
          time: 'Sesi Pagi – Siang',
          badge: 'Finalis Terpilih',
          title: 'Grand Final Pitching Esai & Mini Case',
          desc: 'Tim finalis memaparkan naskah gagasan dan deck solusi bisnis secara langsung di hadapan dewan juri praktisi & akademisi.',
          tags: ['Presentasi Langsung', 'Sesi Tanya Jawab', 'Umpan Balik Juri'],
          icon: <Trophy className="w-5 h-5 text-[#caa152]" />,
          image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&fm=webp&q=75',
        },
        {
          time: 'Sesi Sore',
          badge: 'Kurasi Akhir',
          title: 'Sidang Penentuan Juara & Networking Finalis',
          desc: 'Rekapitulasi nilai final oleh dewan juri sekaligus sesi jejaring antar-finalis dari berbagai perguruan tinggi se-Indonesia.',
          tags: ['Penjurian Independen', 'Jejaring Nasional', 'Persiapan Awarding'],
          icon: <Users className="w-5 h-5 text-[#caa152]" />,
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&fm=webp&q=75',
        },
      ],
    },
    day2: {
      dateLabel: 'Senin, 22 Maret 2027',
      headline: 'Main Event: Seminar Bank Indonesia, Expo UMKM & Awarding Night',
      location: 'Panggung Utama Digiconomic Fest, Malang',
      items: [
        {
          time: 'Sesi Pagi – Siang',
          badge: 'Terbuka 375+ Peserta',
          title: 'Seminar Nasional & Pameran UMKM Binaan BI',
          desc: 'Diskusi panel bersama Kantor Perwakilan Bank Indonesia Malang dan praktisi UMKM, didampingi pameran produk kreatif UMKM binaan BI.',
          tags: ['Seminar Nasional', 'Pameran UMKM BI', 'Diskusi Interaktif'],
          icon: <Mic className="w-5 h-5 text-[#caa152]" />,
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&fm=webp&q=75',
        },
        {
          time: 'Sesi Puncak',
          badge: 'Awarding Night',
          title: 'Pengumuman Juara & Malam Penganugerahan',
          desc: 'Penyerahan trofi, piagam penghargaan, dan total dana pembinaan Rp 26.000.000+ bersama jajaran KPw Bank Indonesia Malang & GenBI UB.',
          tags: ['Total Hadiah Rp 26 Jt+', 'Trofi & E-Sertifikat', 'Dokumentasi Resmi'],
          icon: <Award className="w-5 h-5 text-[#caa152]" />,
          image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&fm=webp&q=75',
        },
      ],
    },
  };

  const tmChecklist = [
    {
      title: 'Kehadiran Perwakilan Tim',
      detail: 'Minimal ketua tim wajib bergabung 15 menit sebelum Technical Meeting dimulai.',
    },
    {
      title: 'Format Nama Zoom',
      detail: 'Gunakan format: [Cabang Lomba]_[Nama Tim]_[Asal Instansi].',
    },
    {
      title: 'Pelajari Juklak & Juknis',
      detail: 'Baca buku panduan resmi terlebih dahulu agar sesi tanya jawab berjalan efektif.',
    },
    {
      title: 'Akses Tautan & Notulensi',
      detail: 'Link Zoom Meeting dan notulensi resmi dibagikan di Dashboard Peserta & grup WA resmi.',
    },
  ];

  const currentDay = scheduleByDay[activeDay];

  return (
    <div className="w-full overflow-x-clip">
      {/* ── HERO HEADER (Deep Royal Espresso + Stats Strip) ── */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2f1d10] via-[#26160c] to-[#1e1108] text-[#faf4e8] overflow-hidden">
        <BatikKawungPattern color="#caa152" opacity={0.07} id="kawung-event-hero" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3f2818] border border-[#caa152]/50 text-[#f3d48c] font-cinzel text-[10px] sm:text-xs tracking-[0.22em] uppercase font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#caa152]" />
              <span>Rangkaian Acara &amp; Technical Meeting</span>
            </div>

            <h1 className="font-cormorant text-3xl sm:text-5xl lg:text-6xl text-[#fffdf9] font-normal tracking-tight leading-tight">
              Rangkaian <span className="shimmer-text">Digiconomic Fest 2027</span>
            </h1>

            <p className="mt-4 font-sans text-xs sm:text-sm md:text-base text-[#dec9ad] leading-relaxed">
              Persembahan <strong className="text-[#fffdf9]">GenBI Komisariat Universitas Brawijaya</strong> bersama <strong className="text-[#fffdf9]">Kantor Perwakilan Bank Indonesia Malang</strong>—menghadirkan Final Kompetisi, Seminar Nasional, Pameran UMKM Binaan BI, dan Awarding Night.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/kompetisi')}
                className="btn-modern-shine inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs tracking-[0.18em] uppercase font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span>Lihat Cabang Kompetisi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/juklak-juknis')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#382315]/90 hover:bg-[#462c1b] text-[#faf4e8] border border-[#caa152]/50 font-cinzel text-xs tracking-[0.16em] uppercase transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#caa152]" />
                <span>Baca Juklak &amp; Juknis</span>
              </button>
            </div>
          </div>

          {/* 4 Visual Highlight Stats */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {eventStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-[#382315]/85 border border-[#caa152]/35 p-4 sm:p-5 text-center backdrop-blur-xs"
              >
                <p className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#f3d48c] leading-none">
                  {stat.value}
                </p>
                <p className="font-poppins text-xs font-semibold text-[#fffdf9] mt-2">{stat.label}</p>
                <p className="font-sans text-[11px] text-[#dec9ad] mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#f3e6d3" accentColor="#caa152" variant="cloud" />

      {/* ── 3 PILAR GRAND DESIGN (Visual Editorial Cards) ── */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#ebdcc5]">
        <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-event-list" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-16 sm:space-y-20">
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] text-[#7a5530] uppercase font-semibold mb-1.5">
                  Grand Design 2027
                </p>
                <h2 className="font-cormorant text-2xl sm:text-4xl text-[#241308] font-normal">
                  3 Pilar Rangkaian Digiconomic Fest
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#5c3e28] max-w-md leading-relaxed">
                Dirancang terpadu mulai dari seleksi ide nasional hingga implementasi pameran dan apresiasi di Kota Malang.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {grandConcepts.map((item) => (
                <article
                  key={item.no}
                  className="card-modern-hover group rounded-3xl overflow-hidden bg-[#fffdf9] border border-[#dfc9ab] shadow-xs flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-[#2b1a0e]">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter sepia-[0.14]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241308]/85 via-[#241308]/25 to-transparent" />
                    <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241308]/85 border border-[#caa152]/60 text-[#f3d48c] font-cinzel text-[10px] tracking-[0.16em] uppercase font-semibold">
                      <span>{item.no}</span>
                      <span>·</span>
                      <span>{item.tag}</span>
                    </div>
                    <div className="absolute bottom-3.5 right-3.5 w-10 h-10 rounded-xl bg-[#2f1d10]/90 border border-[#caa152]/60 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-cormorant text-xl sm:text-2xl text-[#241308] font-semibold leading-snug">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs sm:text-[13px] text-[#4a2e18] leading-relaxed mt-2">
                        {item.summary}
                      </p>
                    </div>
                    <p className="pt-3 border-t border-[#efe1cb] flex items-center gap-1.5 text-[11px] font-semibold text-[#7a5530] font-sans">
                      <Calendar className="w-3.5 h-3.5 text-[#caa152]" />
                      <span>{item.period}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* ── INTERACTIVE AGENDA 2 HARI PUNCAK (21 & 22 MARET 2027) ── */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
              <div>
                <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.24em] text-[#7a5530] uppercase font-semibold mb-1.5">
                  Agenda Final &amp; Acara Puncak
                </p>
                <h2 className="font-cormorant text-2xl sm:text-4xl text-[#241308] font-normal">
                  Jadwal Kegiatan Utama di Malang
                </h2>
              </div>

              {/* Day Switcher Tabs */}
              <div className="inline-flex p-1.5 rounded-full bg-[#fffdf9] border border-[#d8be99] shadow-2xs self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveDay('day1')}
                  className={`px-4 sm:px-5 py-2 rounded-full font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-all cursor-pointer ${
                    activeDay === 'day1'
                      ? 'bg-[#2f1d10] text-[#f3d48c] shadow-xs'
                      : 'text-[#6b4725] hover:text-[#241308]'
                  }`}
                >
                  Hari 1 · 21 Mar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDay('day2')}
                  className={`px-4 sm:px-5 py-2 rounded-full font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-all cursor-pointer ${
                    activeDay === 'day2'
                      ? 'bg-[#2f1d10] text-[#f3d48c] shadow-xs'
                      : 'text-[#6b4725] hover:text-[#241308]'
                  }`}
                >
                  Hari 2 · 22 Mar
                </button>
              </div>
            </div>

            {/* Active Day Banner */}
            <div className="rounded-3xl bg-[#fffdf9] border border-[#dfc9ab] p-5 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#efe1cb]">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a5e38] font-sans">
                    <Calendar className="w-3.5 h-3.5 text-[#caa152]" />
                    {currentDay.dateLabel}
                  </span>
                  <h3 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-semibold mt-0.5">
                    {currentDay.headline}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#faf4e8] border border-[#e3d0b5] text-xs font-medium text-[#5c3e28] self-start sm:self-center">
                  <MapPin className="w-3.5 h-3.5 text-[#caa152]" />
                  {currentDay.location}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {currentDay.items.map((ev) => (
                  <div
                    key={ev.title}
                    className="group rounded-2xl overflow-hidden border border-[#e6d5bc] bg-[#faf4e8]/65 flex flex-col"
                  >
                    <div className="relative h-44 sm:h-48 overflow-hidden bg-[#2b1a0e]">
                      <img
                        src={ev.image}
                        alt={ev.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter sepia-[0.12]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#241308]/85 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241308]/85 border border-[#caa152]/55 text-[#f3d48c] text-[10px] font-cinzel uppercase tracking-wider font-semibold">
                        <Clock className="w-3 h-3 text-[#caa152]" />
                        {ev.time}
                      </div>
                      <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-[#caa152] text-[#241308] text-[10px] font-bold uppercase tracking-wider">
                        {ev.badge}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-[#2f1d10] border border-[#caa152]/50 flex items-center justify-center shrink-0">
                            {ev.icon}
                          </div>
                          <h4 className="font-cormorant text-xl sm:text-2xl text-[#241308] font-semibold leading-snug">
                            {ev.title}
                          </h4>
                        </div>
                        <p className="font-sans text-xs sm:text-[13px] text-[#4a2e18] leading-relaxed">
                          {ev.desc}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-[#e6d5bc]">
                        {ev.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fffdf9] border border-[#dfc9ab] text-[11px] font-medium text-[#5c3e28]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#ba883a]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#2b1a0e" accentColor="#caa152" variant="ridge" />

      {/* ── INFORMASI TECHNICAL MEETING (Visual Split Panel) ── */}
      <section
        id="technical-meeting"
        className="relative py-12 sm:py-18 lg:py-22 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2b1a0e] via-[#24140a] to-[#1e1108] text-[#faf4e8] overflow-hidden"
      >
        <BatikKawungPattern color="#caa152" opacity={0.06} id="kawung-tm" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3f2818] border border-[#caa152]/45 text-[#f3d48c] font-cinzel text-[10px] tracking-[0.2em] uppercase font-semibold mb-2.5">
              <Video className="w-3.5 h-3.5 text-[#caa152]" />
              <span>Wajib Diikuti Perwakilan Tim</span>
            </div>
            <h2 className="font-cormorant text-2xl sm:text-4xl text-[#fffdf9] font-normal">
              Informasi <span className="shimmer-text">Technical Meeting</span>
            </h2>
            <p className="mt-2 font-sans text-xs sm:text-sm text-[#dec9ad]">
              Pengarahan teknis daring via Zoom Meeting untuk menyamakan pemahaman aturan, format berkas, dan rubrik penilaian kedua cabang lomba.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: 2 Sesi TM */}
            <div className="lg:col-span-5 relative p-6 rounded-3xl bg-[#382315]/90 border border-[#caa152]/45 flex flex-col justify-between overflow-hidden">
              <CornerFiligree color="#caa152" className="w-5 h-5 opacity-45" />
              <div className="space-y-4 relative z-10">
                <h3 className="font-cormorant text-2xl text-[#fffdf9] font-medium">
                  Jadwal 2 Sesi Technical Meeting
                </h3>

                <div className="space-y-3 text-xs sm:text-sm font-sans text-[#e6d3b9]">
                  <div className="p-4 rounded-2xl bg-[#26150b] border border-[#caa152]/30 space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#caa152]/20 text-[#f3d48c] text-[10px] font-cinzel uppercase tracking-wider font-semibold">
                      Sesi 01 · Penyisihan
                    </span>
                    <p className="font-semibold text-[#fffdf9] pt-1">Awal Februari 2027</p>
                    <p className="text-xs text-[#dec9ad]">Daring via Zoom — setelah penutupan registrasi 30 Jan 2027.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#26150b] border border-[#caa152]/30 space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#caa152]/20 text-[#f3d48c] text-[10px] font-cinzel uppercase tracking-wider font-semibold">
                      Sesi 02 · Finalis
                    </span>
                    <p className="font-semibold text-[#fffdf9] pt-1">Setelah 20 Februari 2027</p>
                    <p className="text-xs text-[#dec9ad]">Daring via Zoom — khusus tim finalis menuju Grand Final 21 Maret 2027.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#caa152]/25 flex items-start gap-2.5 text-xs text-[#f3d48c] relative z-10">
                <AlertCircle className="w-4 h-4 text-[#caa152] shrink-0 mt-0.5" />
                <span>Tim yang berhalangan hadir dianggap menyetujui seluruh hasil keputusan Technical Meeting.</span>
              </div>
            </div>

            {/* Right: 4 Kartu Checklist Persiapan */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-[#382315]/90 border border-[#caa152]/45 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Store className="w-4 h-4 text-[#caa152]" />
                  <h3 className="font-cormorant text-2xl text-[#fffdf9] font-medium">
                    Checklist Persiapan Tim Peserta
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {tmChecklist.map((item, idx) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-2xl bg-[#26150b]/90 border border-[#caa152]/25 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#caa152]/20 border border-[#caa152]/60 text-[#f3d48c] text-[11px] font-semibold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-poppins text-xs sm:text-sm font-semibold text-[#fffdf9]">
                          {item.title}
                        </h4>
                      </div>
                      <p className="font-sans text-xs text-[#dec9ad] leading-relaxed pl-8">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#caa152]/25 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/news')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#caa152] hover:bg-[#d8b163] text-[#241308] font-cinzel text-[11px] tracking-[0.14em] uppercase font-semibold transition-all cursor-pointer"
                >
                  <span>Cek Pengumuman &amp; Berita</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-transparent hover:bg-[#452b1a] text-[#faf4e8] border border-[#caa152]/50 font-cinzel text-[11px] tracking-[0.14em] uppercase transition-all cursor-pointer"
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