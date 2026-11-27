import { Competition } from '../types';

export const COMPETITIONS_DATA: Competition[] = [
  {
    id: 'comp-1',
    slug: 'esai-nasional',
    title: 'Esai Nasional',
    category: 'TIM',
    fee: 35000,
    feeFormatted: 'Rp 35.000',
    isTeam: true,
    maxTeamSize: 3,
    description: 'Kompetisi kepenulisan ilmiah beregu tingkat nasional untuk menuangkan gagasan kritis, analisis ekonomi, dan solusi transformasi digital yang aplikatif bagi pelaku UMKM lokal.',
    briefRules: [
      'Diikuti secara tim beranggotakan 2 hingga 3 orang (Pelajar SMA/SMK sederajat atau Mahasiswa aktif se-Indonesia).',
      'Karya orisinal, belum pernah dipublikasikan di media cetak maupun daring.',
      'Panjang naskah 1.500 – 2.500 kata sesuai format template resmi Digiconomic Fest 2027.',
      'Format pengumpulan berkas PDF maksimal 10 MB melalui Portal Peserta.'
    ],
    prizes: 'Memperebutkan Total Hadiah Pembinaan Rp 26.000.000+ · Trofi & E-Sertifikat Nasional',
    deadline: '30 Januari 2027',
    iconName: 'FileText'
  },
  {
    id: 'comp-2',
    slug: 'mini-case-competition',
    title: 'Mini Case Competition',
    category: 'TIM',
    fee: 50000,
    feeFormatted: 'Rp 50.000',
    isTeam: true,
    maxTeamSize: 3,
    description: 'Kompetisi pemecahan studi kasus bisnis nyata UMKM di negara emerging market untuk merumuskan strategi pertumbuhan adaptif, model bisnis terukur, dan proyeksi dampak berkelanjutan.',
    briefRules: [
      'Diikuti secara tim beranggotakan 2 hingga 3 orang mahasiswa aktif dari perguruan tinggi se-Indonesia.',
      'Mencakup diagnosis masalah UMKM, strategi solusi, model bisnis, dan proyeksi dampak.',
      'Finalis terpilih mempresentasikan deck solusi langsung di hadapan dewan juri & praktisi.',
      'Format pengumpulan Proposal/Deck Solusi PDF maksimal 15 halaman melalui Portal Peserta.'
    ],
    prizes: 'Memperebutkan Total Hadiah Pembinaan Rp 26.000.000+ · Mentoring Praktisi & Trofi',
    deadline: '30 Januari 2027',
    iconName: 'Briefcase'
  }
];

export interface TimelineStage {
  id: string;
  date: string;
  shortDate: string;
  title: string;
  desc: string;
  startAt: string; // ISO WIB (+07:00)
  endAt: string;   // ISO WIB (+07:00)
}

export const TIMELINE_DATA: TimelineStage[] = [
  {
    id: 'pendaftaran',
    date: '14 Des 2026 – 30 Jan 2027',
    shortDate: '14 Des 2026 – 30 Jan 2027',
    title: 'Pendaftaran & Verifikasi',
    desc: 'Daftarkan tim peserta (maks. 3 orang), lengkapi biodata & KTM, lalu lakukan pembayaran QRIS dan unggah bukti bayar di Dashboard Peserta untuk verifikasi panitia.',
    startAt: '2026-12-14T00:00:00+07:00',
    endAt: '2027-01-30T23:59:59+07:00',
  },
  {
    id: 'penjurian',
    date: '1 – 19 Feb 2027',
    shortDate: '1 – 19 Feb 2027',
    title: 'Seleksi & Penjurian Karya',
    desc: 'Karya esai dan proposal solusi mini case yang telah dikumpulkan masuk ke tahap evaluasi dan penilaian objektif oleh dewan juri praktisi & akademisi.',
    startAt: '2027-02-01T00:00:00+07:00',
    endAt: '2027-02-19T23:59:59+07:00',
  },
  {
    id: 'pengumuman-finalis',
    date: '20 Februari 2027',
    shortDate: '20 Feb 2027',
    title: 'Pengumuman Finalis',
    desc: 'Pengumuman resmi daftar tim finalis terbaik yang berhak melaju ke babak penentuan melalui Dashboard Peserta dan halaman Berita Resmi.',
    startAt: '2027-02-20T00:00:00+07:00',
    endAt: '2027-02-20T23:59:59+07:00',
  },
  {
    id: 'grand-final',
    date: '21 Maret 2027',
    shortDate: '21 Mar 2027',
    title: 'Final Kompetisi',
    desc: 'Tim finalis terpilih mempresentasikan karya dan strategi solusi UMKM secara langsung di hadapan dewan juri di Universitas Brawijaya.',
    startAt: '2027-03-21T00:00:00+07:00',
    endAt: '2027-03-21T23:59:59+07:00',
  },
  {
    id: 'main-event',
    date: '22 Maret 2027 — Acara Puncak',
    shortDate: '22 Mar 2027',
    title: 'Main Event, Pameran UMKM & Awarding Night',
    desc: 'Rangkaian Digiconomic Fest ditutup dengan Seminar Bank Indonesia, Pameran UMKM binaan BI Malang, dan malam penganugerahan pemenang Rp 26.000.000+ di Universitas Brawijaya.',
    startAt: '2027-03-22T00:00:00+07:00',
    endAt: '2027-03-22T23:59:59+07:00',
  },
];

export type TimelineStageStatus = 'completed' | 'current' | 'upcoming_next' | 'upcoming';

export interface TimelineStageWithStatus extends TimelineStage {
  status: TimelineStageStatus;
  daysUntilStart: number;
}

export function resolveTimelineStatuses(
  stages: TimelineStage[] = TIMELINE_DATA,
  nowMs: number = Date.now()
): TimelineStageWithStatus[] {
  let hasActive = false;
  let assignedNext = false;

  const base = stages.map((stage) => {
    const startMs = new Date(stage.startAt).getTime();
    const endMs = new Date(stage.endAt).getTime();
    const daysUntilStart = Math.max(0, Math.ceil((startMs - nowMs) / (1000 * 60 * 60 * 24)));

    if (nowMs >= startMs && nowMs <= endMs) {
      hasActive = true;
      return { ...stage, status: 'current' as TimelineStageStatus, daysUntilStart: 0 };
    }
    if (nowMs > endMs) {
      return { ...stage, status: 'completed' as TimelineStageStatus, daysUntilStart: 0 };
    }
    return { ...stage, status: 'upcoming' as TimelineStageStatus, daysUntilStart };
  });

  if (!hasActive) {
    return base.map((stage) => {
      if (!assignedNext && stage.status === 'upcoming') {
        assignedNext = true;
        return { ...stage, status: 'upcoming_next' as TimelineStageStatus };
      }
      return stage;
    });
  }

  return base;
}

export const FAQ_DATA = [
  {
    q: 'Apa saja cabang lomba di Digiconomic Fest 2027?',
    a: 'Tersedia 2 cabang perlombaan tim tingkat nasional: 1) Esai (Kategori Tim 2–3 orang) dan 2) Mini Case Competition (Kategori Tim 2–3 orang).'
  },
  {
    q: 'Bagaimana alur pendaftaran lomba di website ini?',
    a: 'Alurnya sangat mudah: 1) Masuk dengan akun Google Anda, 2) Lengkapi biodata ketua tim & unggah KTM, 3) Pilih cabang lomba (Esai Nasional atau Mini Case Competition) dan isi data anggota tim (maks. 3 orang termasuk ketua), 4) Lakukan pembayaran QRIS resmi & unggah bukti bayar di Dashboard Peserta.'
  },
  {
    q: 'Apakah ada payment gateway otomatis?',
    a: 'Tidak. Pembayaran dilakukan dengan memindai QRIS resmi Digiconomic Fest 2027, lalu mengunggah bukti transfer langsung di Dashboard Peserta. Panitia akan memverifikasi pembayaran Anda maksimal dalam 1×24 jam.'
  },
  {
    q: 'Bagaimana cara mengirim bukti transfer/pembayaran?',
    a: 'Setelah menyelesaikan pendaftaran cabang lomba di Dashboard Peserta, pindai kode QRIS resmi yang tersedia lalu unggah foto/screenshot bukti bayar (JPG, PNG, atau PDF maks. 2 MB) beserta nama pengirim pada menu Pembayaran di Dashboard Peserta.'
  },
  {
    q: 'Bolehkah mendaftar lebih dari satu cabang lomba?',
    a: 'Sesuai regulasi sistem, 1 akun hanya dapat memiliki 1 pendaftaran lomba aktif agar kompetisi adil dan fokus. Jika ingin mengganti lomba, Anda dapat membatalkan pendaftaran sebelumnya sebelum diverifikasi.'
  },
  {
    q: 'Kapan link grup peserta bisa saya dapatkan?',
    a: 'Tombol tautan grup WhatsApp resmi peserta akan otomatis terbuka dan aktif di Dashboard Peserta Anda setelah status pendaftaran dinyatakan "TERVERIFIKASI" oleh panitia.'
  }
];
