import { Competition } from '../types';

export const COMPETITIONS_DATA: Competition[] = [
  {
    id: 'comp-1',
    slug: 'esai-nasional',
    title: 'Esai',
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
    deadline: '16 Januari 2027',
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
    deadline: '16 Januari 2027',
    iconName: 'Briefcase'
  }
];

export interface TimelineStage {
  id: string;
  stageKey?: string;
  date: string;
  shortDate: string;
  title: string;
  desc: string;
  startAt: string; // ISO WIB (+07:00)
  endAt: string;   // ISO WIB (+07:00)
  visibleFrom?: string | null;
  isExtended?: boolean;
}

export const TIMELINE_DATA: TimelineStage[] = [
  {
    id: 'pendaftaran',
    stageKey: 'pendaftaran',
    date: '26 Des 2026 – 16 Jan 2027',
    shortDate: '26 Des – 16 Jan 2027',
    title: 'Pendaftaran Lomba (Open Registration)',
    desc: 'Pendaftaran resmi tim peserta Esai dan Mini Case Competition (maks. 3 orang). Lengkapi biodata, unggah KTM, lakukan pembayaran QRIS, dan unggah bukti bayar di Dashboard Peserta untuk verifikasi panitia.',
    startAt: '2026-12-26T00:00:00+07:00',
    endAt: '2027-01-16T23:59:59+07:00',
    visibleFrom: null,
    isExtended: false,
  },
  {
    id: 'extended-registration',
    stageKey: 'extended-registration',
    date: '17 – 23 Jan 2027',
    shortDate: '17 – 23 Jan 2027',
    title: 'Perpanjangan Pendaftaran (Extended Registration)',
    desc: 'Kesempatan tambahan bagi tim yang belum sempat mendaftar pada periode reguler. Segera lengkapi berkas pendaftaran dan konfirmasi pembayaran QRIS melalui Dashboard Peserta sebelum masa perpanjangan ditutup.',
    startAt: '2027-01-17T08:00:00+07:00',
    endAt: '2027-01-23T23:59:59+07:00',
    visibleFrom: '2027-01-17T08:00:00+07:00',
    isExtended: true,
  },
  {
    id: 'submit-karya',
    stageKey: 'submit-karya',
    date: '24 Januari 2027',
    shortDate: '24 Jan 2027',
    title: 'Batas Akhir Pengumpulan Karya',
    desc: 'Batas akhir unggah naskah Esai maupun proposal/deck solusi Mini Case Competition oleh seluruh tim terverifikasi melalui menu Unggah Karya di Dashboard Peserta.',
    startAt: '2027-01-24T00:00:00+07:00',
    endAt: '2027-01-24T23:59:59+07:00',
  },
  {
    id: 'seleksi-administrasi',
    stageKey: 'seleksi-administrasi',
    date: '25 Januari 2027',
    shortDate: '25 Jan 2027',
    title: 'Seleksi Administrasi Internal',
    desc: 'Pemeriksaan kelengkapan berkas, kesesuaian format naskah, dan validasi persyaratan administrasi seluruh peserta oleh Divisi Kompetisi.',
    startAt: '2027-01-25T00:00:00+07:00',
    endAt: '2027-01-25T23:59:59+07:00',
  },
  {
    id: 'seleksi-eksternal',
    stageKey: 'seleksi-eksternal',
    date: '29 Jan – 6 Feb 2027',
    shortDate: '29 Jan – 6 Feb 2027',
    title: 'Seleksi Eksternal Tahap Pertama',
    desc: 'Pelaksanaan seleksi eksternal tahap pertama terhadap karya Esai dan Mini Case Competition yang lolos tahap administrasi.',
    startAt: '2027-01-29T00:00:00+07:00',
    endAt: '2027-02-06T23:59:59+07:00',
  },
  {
    id: 'penjurian',
    stageKey: 'penjurian',
    date: '7 – 19 Februari 2027',
    shortDate: '7 – 19 Feb 2027',
    title: 'Penjurian & Evaluasi Karya',
    desc: 'Proses penjurian dan evaluasi mendalam oleh dewan juri profesional, praktisi, dan akademisi untuk menentukan tim terbaik yang berhak melaju sebagai finalis.',
    startAt: '2027-02-07T00:00:00+07:00',
    endAt: '2027-02-19T23:59:59+07:00',
  },
  {
    id: 'pengumuman-finalis',
    stageKey: 'pengumuman-finalis',
    date: '20 Februari 2027',
    shortDate: '20 Feb 2027',
    title: 'Pengumuman Finalis Kompetisi',
    desc: 'Pengumuman resmi daftar tim finalis terbaik yang berhak melaju ke babak penentuan melalui Dashboard Peserta dan halaman Berita Resmi.',
    startAt: '2027-02-20T00:00:00+07:00',
    endAt: '2027-02-20T23:59:59+07:00',
  },
  {
    id: 'technical-meeting',
    stageKey: 'technical-meeting',
    date: '22 Februari 2027',
    shortDate: '22 Feb 2027',
    title: 'Technical Meeting (TM) Finalis',
    desc: 'Pengarahan teknis daring (Zoom Meeting) bersama panitia dan perwakilan seluruh tim finalis mengenai tata tertib, mekanisme pitching, dan penilaian babak final.',
    startAt: '2027-02-22T00:00:00+07:00',
    endAt: '2027-02-22T23:59:59+07:00',
  },
  {
    id: 'pengumpulan-ppt',
    stageKey: 'pengumpulan-ppt',
    date: '5 Maret 2027',
    shortDate: '5 Mar 2027',
    title: 'Batas Akhir Pengumpulan PPT Final',
    desc: 'Batas akhir pengumpulan salindia presentasi (PPT) oleh seluruh tim finalis sebagai bahan pemaparan pada sesi kompetisi final.',
    startAt: '2027-03-05T00:00:00+07:00',
    endAt: '2027-03-05T23:59:59+07:00',
  },
  {
    id: 'grand-final',
    stageKey: 'grand-final',
    date: '21 Maret 2027 (Online)',
    shortDate: '21 Mar 2027',
    title: 'Kompetisi Final (Online)',
    desc: 'Pelaksanaan babak final kompetisi secara daring (online), di mana tim finalis mempresentasikan gagasan serta strategi solusi UMKM secara langsung di hadapan dewan juri.',
    startAt: '2027-03-21T00:00:00+07:00',
    endAt: '2027-03-21T23:59:59+07:00',
  },
  {
    id: 'main-event',
    stageKey: 'main-event',
    date: '22 Maret 2027 (Offline UB)',
    shortDate: '22 Mar 2027',
    title: 'Seminar Nasional, Pameran UMKM & Awarding',
    desc: 'Rangkaian Digiconomic Fest ditutup secara luring (offline) di Universitas Brawijaya dengan Seminar Bank Indonesia, Pameran UMKM binaan BI Malang, serta malam penganugerahan pemenang Rp 26.000.000+.',
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

  const visibleStages = stages.filter((stage) => {
    if (stage.visibleFrom) {
      const vfMs = new Date(stage.visibleFrom).getTime();
      if (Number.isFinite(vfMs) && nowMs < vfMs) return false;
    }
    return true;
  });

  const base = visibleStages.map((stage) => {
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
    a: 'Alurnya sangat mudah: 1) Masuk dengan akun Google Anda, 2) Lengkapi biodata ketua tim & unggah KTM, 3) Pilih cabang lomba (Esai atau Mini Case Competition) dan isi data anggota tim (maks. 3 orang termasuk ketua), 4) Lakukan pembayaran QRIS resmi & unggah bukti bayar di Dashboard Peserta.'
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
