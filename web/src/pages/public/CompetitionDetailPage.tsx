import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Download, FileText, Trophy } from 'lucide-react';
import { COMPETITIONS_DATA } from '../../data/competitions';
import {
  BatikKawungPattern,
  CornerFiligree,
  SectionWaveTransition,
} from '../../components/Ornaments';

interface StageItem {
  num: string;
  tag: string;
  title: string;
  desc: string;
  highlight?: boolean;
}

const STAGE_DETAILS: Record<
  string,
  {
    badge: string;
    eligibility: string;
    teamTypeLabel: string;
    periodLabel: string;
    finalDateLabel: string;
    finalistDateLabel: string;
    flowHeading: string;
    stages: StageItem[];
    leftRulesTitle: string;
    leftRules: string[];
    rightRulesTitle: string;
    rightRules: string[];
    guidebookSubtitle: string;
  }
> = {
  'mini-case-competition': {
    badge: 'Cabang 02 · Kompetisi Tim Mahasiswa',
    eligibility: 'Mahasiswa D3/D4/S1',
    teamTypeLabel: 'Tim Maks. 3 Mahasiswa',
    periodLabel: '14 Des – 30 Jan 2027',
    finalDateLabel: '21 Maret 2027',
    finalistDateLabel: '20 Feb 2027',
    flowHeading: 'Alur Penyelesaian Studi Kasus',
    stages: [
      { num: '01', tag: 'Case Brief', title: 'Pemahaman Masalah', desc: 'Mempelajari profil UMKM dan tantangan operasional utama.' },
      { num: '02', tag: 'Analysis', title: 'Audit & Riset Data', desc: 'Analisis pasar, keuangan, dan akar persoalan bisnis.' },
      { num: '03', tag: 'Proposed Solution', title: 'Rancangan Strategi', desc: 'Penyusunan model solusi dan peta jalan eksekusi.' },
      { num: '04', tag: 'Submission', title: 'Pengumpulan Deck', desc: 'Unggah proposal/deck solusi via Portal Peserta.' },
      { num: '05', tag: 'Evaluation', title: 'Penjurian Awal', desc: 'Seleksi karya terbaik oleh dewan juri pada 1–19 Feb.' },
      { num: '06', tag: 'Final Presentation', title: 'Pitching Finalis', desc: 'Presentasi & tanya jawab langsung pada 21 Mar 2027.', highlight: true },
    ],
    leftRulesTitle: 'Ketentuan Tim',
    leftRules: [
      'Setiap tim beranggotakan 2 hingga 3 mahasiswa aktif (1 Ketua + hingga 2 Anggota).',
      'Anggota tim dapat berasal dari program studi yang sama maupun lintas kampus sesuai guidebook resmi.',
      'Seluruh anggota wajib melampirkan identitas KTM aktif saat proses verifikasi.',
    ],
    rightRulesTitle: 'Aturan & Penjurian',
    rightRules: [
      'Solusi harus relevan dengan konteks UMKM di negara emerging market.',
      'Aspek penilaian meliputi ketajaman diagnosis, inovasi strategi, kelayakan finansial, dan kualitas presentasi.',
      'Format submission Proposal Solusi PDF maksimal 15 halaman sesuai pedoman guidebook resmi.',
    ],
    guidebookSubtitle: 'Dokumen PDF resmi disiapkan oleh Divisi Kewirausahaan & Pendidikan GenBI.',
  },
  'esai-nasional': {
    badge: 'Cabang 01 · Kompetisi Tim Nasional',
    eligibility: 'Pelajar SMA/SMK & Mahasiswa',
    teamTypeLabel: 'Tim Maks. 3 Orang',
    periodLabel: '14 Des – 30 Jan 2027',
    finalDateLabel: '22 Maret 2027',
    finalistDateLabel: '20 Feb 2027',
    flowHeading: 'Alur Kompetisi Esai Nasional',
    stages: [
      { num: '01', tag: 'Registration', title: 'Pendaftaran Tim & KTM', desc: 'Lengkapi biodata ketua & anggota tim (2–3 orang), unggah KTM, dan verifikasi QRIS.' },
      { num: '02', tag: 'Research', title: 'Eksplorasi Gagasan', desc: 'Riset isu aktual ekonomi digital dan daya saing UMKM lokal.' },
      { num: '03', tag: 'Writing', title: 'Penulisan Naskah', desc: 'Susun esai orisinal 1.500 – 2.500 kata sesuai template resmi.' },
      { num: '04', tag: 'Submission', title: 'Unggah Naskah PDF', desc: 'Kirim file PDF (maks. 10 MB) melalui Portal Peserta sebelum deadline.' },
      { num: '05', tag: 'Evaluation', title: 'Kurasi & Penjurian', desc: 'Penilaian substansi, orisinalitas, dan struktur argumen pada 1–19 Feb.' },
      { num: '06', tag: 'Grand Final', title: 'Presentasi & Awarding', desc: 'Pemaparan finalis terpilih dan penganugerahan juara pada 22 Mar 2027.', highlight: true },
    ],
    leftRulesTitle: 'Ketentuan Tim',
    leftRules: [
      'Setiap tim beranggotakan 2 hingga 3 orang (Pelajar SMA/SMK sederajat atau Mahasiswa aktif se-Indonesia).',
      'Karya bersifat orisinal, belum pernah dipublikasikan maupun diikutsertakan pada lomba lain.',
      'Satu akun ketua tim hanya dapat memiliki satu pendaftaran lomba aktif di sistem.',
    ],
    rightRulesTitle: 'Aturan & Penjurian',
    rightRules: [
      'Panjang naskah 1.500 – 2.500 kata mengikuti format template resmi Digiconomic Fest 2027.',
      'Aspek penilaian mencakup orisinalitas gagasan, kedalaman analisis ekonomi, dan kebermanfaatan bagi UMKM.',
      'Keputusan dewan juri bersifat mutlak dan diumumkan melalui Portal Peserta.',
    ],
    guidebookSubtitle: 'Dokumen PDF pedoman penulisan dan template resmi oleh GenBI Komisariat Universitas Brawijaya.',
  },
};

export const CompetitionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const comp = COMPETITIONS_DATA.find((c) => c.slug === slug) || COMPETITIONS_DATA[0];
  const detail = STAGE_DETAILS[comp.slug] || STAGE_DETAILS['mini-case-competition'];

  return (
    <div className="min-h-screen bg-[#faf4e8] relative overflow-hidden">
      {/* ── HERO HEADER KHUSUS DETAIL KOMPETISI ── */}
      <section
        className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-8 lg:px-12 overflow-hidden text-[#faf4e8]"
        style={{
          background: 'linear-gradient(155deg, #3b2414 0%, #29180c 58%, #1e1108 100%)',
        }}
      >
        <BatikKawungPattern color="#caa152" opacity={0.07} id="kawung-detail-hero" />

        <div className="max-w-6xl mx-auto relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-cinzel tracking-widest uppercase text-[#e3c47f] hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4a2f1b] border border-[#caa152]/60 text-[#fcedb8] font-cinzel text-[10px] sm:text-xs tracking-[0.2em] uppercase">
                <Trophy className="w-3.5 h-3.5 text-[#caa152]" />
                <span>{detail.badge}</span>
              </span>

              <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-medium text-[#fffdf9] tracking-tight leading-[1.08]">
                {comp.title}
              </h1>

              <p className="font-sans text-xs sm:text-sm md:text-base text-[#e3d0b5] leading-relaxed max-w-2xl">
                {comp.description}
              </p>
            </div>

            <div className="relative rounded-2xl border border-[#caa152]/50 bg-[#3a2415]/85 backdrop-blur-xs px-5 py-4 shrink-0">
              <CornerFiligree color="#caa152" className="w-5 h-5 opacity-55" />
              <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-[#caa152]">Total Hadiah Keseluruhan</p>
              <p className="font-cormorant text-2xl sm:text-3xl text-[#fffdf9] font-medium mt-0.5">
                Rp 26.000.000+
              </p>
              <p className="font-sans text-[11px] text-[#dec9ad] mt-0.5">Seluruh Cabang · Trofi &amp; E-Sertifikat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transisi awan mulus dari Hero Gelap ke Konten Kertas */}
      <SectionWaveTransition fromColor="#1e1108" toColor="#faf4e8" accentColor="#caa152" variant="cloud" />

      {/* ── KONTEN DETAIL KOMPETISI ── */}
      <div className="relative py-10 sm:py-14 px-4 sm:px-8 lg:px-12 overflow-hidden">
        <BatikKawungPattern color="#7a5530" opacity={0.035} id="kawung-detail-body" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-start">
            {/* LEFT 8 COLUMNS */}
            <div className="lg:col-span-8 space-y-8">
              {/* Top 6 Metadata Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                {[
                  { label: 'Kategori', value: comp.title },
                  { label: 'Tipe Tim', value: detail.teamTypeLabel },
                  { label: 'Kelayakan', value: detail.eligibility },
                  { label: 'Periode Daftar', value: detail.periodLabel },
                  { label: 'Biaya Daftar', value: comp.feeFormatted },
                  { label: 'Final Pitching', value: detail.finalDateLabel },
                ].map((meta) => (
                  <div
                    key={meta.label}
                    className="card-modern-hover rounded-2xl bg-[#fffdf9]/95 border border-[#d9c5a7] px-4 py-3.5 shadow-[0_2px_10px_rgba(47,30,16,0.04)]"
                  >
                    <p className="font-sans text-[11px] text-[#7a5530] mb-0.5">{meta.label}</p>
                    <p className="font-sans text-xs sm:text-sm font-semibold text-[#2f1e10] leading-snug">
                      {meta.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Section: Alur Tahapan */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h2 className="font-cormorant text-2xl sm:text-3xl text-[#2f1e10] font-medium tracking-tight">
                    {detail.flowHeading}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-[#efe2ce] border border-[#d6be9b] font-sans text-[11px] text-[#7a5530] font-medium">
                    Struktur Tahapan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {detail.stages.map((st) => (
                    <div
                      key={st.num}
                      className={`card-modern-hover rounded-2xl p-4 sm:p-5 border ${st.highlight
                        ? 'bg-[#3b2412] border-[#caa152]/80 text-[#faf4e8] shadow-md'
                        : 'bg-[#fffdf9]/95 border-[#d9c5a7] text-[#2f1e10]'
                        }`}
                    >
                      <p className={`font-sans text-[11px] mb-1.5 ${st.highlight ? 'text-[#e3c47f]' : 'text-[#8c643b]'}`}>
                        {st.num} · {st.tag}
                      </p>
                      <h3 className={`font-sans text-sm sm:text-[15px] font-semibold mb-1.5 ${st.highlight ? 'text-[#fffdf9]' : 'text-[#2f1e10]'}`}>
                        {st.title}
                      </h3>
                      <p className={`font-sans text-xs leading-relaxed ${st.highlight ? 'text-[#e6d5bd]' : 'text-[#614229]'}`}>
                        {st.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Column Rules Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="card-modern-hover relative rounded-2xl bg-[#f5ebda]/90 border border-[#d9c5a7] p-5 sm:p-6 overflow-hidden">
                  <h3 className="font-poppins text-base sm:text-lg font-semibold text-[#2f1e10] font-medium mb-3 relative z-10">
                    {detail.leftRulesTitle}
                  </h3>
                  <ul className="space-y-2.5 font-sans text-xs sm:text-[13px] text-[#4d321c] leading-relaxed list-disc pl-4 relative z-10">
                    {detail.leftRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>

                <div className="card-modern-hover relative rounded-2xl bg-[#f5ebda]/90 border border-[#d9c5a7] p-5 sm:p-6 overflow-hidden">
                  <h3 className="font-poppins text-base sm:text-lg font-semibold text-[#2f1e10] font-medium mb-3 relative z-10">
                    {detail.rightRulesTitle}
                  </h3>
                  <ul className="space-y-2.5 font-sans text-xs sm:text-[13px] text-[#4d321c] leading-relaxed list-disc pl-4 relative z-10">
                    {detail.rightRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Wide Guidebook Callout Banner */}
              <div
                className="card-modern-hover rounded-2xl border border-[#caa152]/75 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                style={{ background: 'linear-gradient(135deg, #efe1cb 0%, #e4d0b2 100%)' }}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#faf4e8] border border-[#caa152] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#7a5530]" />
                  </div>
                  <div>
                    <p className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-[#7a5530] font-semibold">
                      Dokumen Resmi Kompetisi
                    </p>
                    <h4 className="font-sans text-sm sm:text-base font-semibold text-[#2f1e10] mt-0.5">
                      Guidebook {comp.title} 2027
                    </h4>
                    <p className="font-sans text-xs text-[#5c3e28] mt-0.5">{detail.guidebookSubtitle}</p>
                  </div>
                </div>
                <Link
                  to="/juklak-juknis"
                  className="btn-modern-shine inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#3b2412] hover:bg-[#241308] text-[#faf4e8] font-sans text-xs font-semibold transition-all shrink-0"
                >
                  <Clock className="w-3.5 h-3.5 text-[#caa152]" />
                  <span>Buka Juklak &amp; Juknis</span>
                </Link>
              </div>
            </div>

            {/* RIGHT 4 COLUMNS: STICKY SUMMARY SIDEBAR */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div
                className="relative rounded-3xl border-2 border-[#caa152]/80 p-6 sm:p-7 shadow-[0_14px_34px_rgba(47,30,16,0.09)] overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #fffdf9 0%, #f5ebda 100%)' }}
              >

                <div className="relative z-10">
                  <p className="font-cinzel text-[10px] tracking-[0.22em] uppercase text-[#8a6037] font-semibold">
                    Ringkasan Pendaftaran
                  </p>
                  <h2 className="font-poppins text-lg sm:text-xl font-semibold text-[#2f1e10] font-medium mt-1 pb-4 border-b border-[#e2cfb5]">
                    {comp.title}
                  </h2>

                  <div className="space-y-3 py-5 font-sans text-xs sm:text-[13px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7a5530]">Periode Daftar</span>
                      <span className="font-semibold text-[#2f1e10] text-right">{detail.periodLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7a5530]">Kepesertaan</span>
                      <span className="font-semibold text-[#2f1e10] text-right">{detail.teamTypeLabel}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7a5530]">Biaya Daftar</span>
                      <span className="font-semibold text-[#2f1e10] text-right">{comp.feeFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#7a5530]">Finalis Diumumkan</span>
                      <span className="font-semibold text-[#2f1e10] text-right">{detail.finalistDateLabel}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={() => navigate(`/daftar?lomba=${comp.slug}`)}
                      className="btn-modern-shine group w-full py-3 px-5 rounded-full bg-[#3b2412] hover:bg-[#241308] text-[#faf4e8] font-sans text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <span>{comp.isTeam ? 'Daftar Tim Sekarang' : 'Daftar Sekarang'}</span>
                      <ArrowRight className="w-4 h-4 text-[#caa152] transition-transform group-hover:translate-x-1" />
                    </button>

                    <Link
                      to="/juklak-juknis"
                      className="w-full py-2.5 px-5 rounded-full bg-[#fffdf9] hover:bg-[#efe2ce] border border-[#bda07a] text-[#2f1e10] font-sans text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#7a5530]" />
                      <span>Baca Juklak &amp; Juknis</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
