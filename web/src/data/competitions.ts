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

export const TIMELINE_DATA = [
  {
    date: '14 Des 2026',
    title: 'Pendaftaran Dibuka',
    desc: 'Registrasi online via website dan pembayaran QRIS dibuka untuk Esai Nasional & Mini Case.'
  },
  {
    date: '30 Jan 2027',
    title: 'Penutupan Registrasi',
    desc: 'Batas akhir pengisian biodata, pembayaran pendaftaran, dan verifikasi berkas peserta.'
  },
  {
    date: '19 Feb 2027',
    title: 'Evaluasi & Penjurian',
    desc: 'Penilaian karya esai dan proposal solusi mini case oleh dewan juri praktisi industri.'
  },
  {
    date: '20 Feb 2027',
    title: 'Pengumuman Finalis',
    desc: 'Pengumuman resmi para tim finalis terbaik yang berhak melaju ke babak penentuan.'
  },
  {
    date: '22 Mar 2027',
    title: 'Grand Final & Awarding',
    desc: 'Presentasi final, seminar Bank Indonesia, dan penganugerahan pemenang Rp 26.000.000.'
  }
];

export const FAQ_DATA = [
  {
    q: 'Apa saja cabang lomba di Digiconomic Fest 2027?',
    a: 'Tersedia 2 cabang perlombaan tim tingkat nasional: 1) Esai Nasional (Kategori Tim 2–3 orang) dan 2) Mini Case Competition (Kategori Tim 2–3 orang).'
  },
  {
    q: 'Bagaimana alur pendaftaran lomba di website ini?',
    a: 'Alurnya sangat mudah: 1) Masuk dengan akun Google Anda, 2) Lengkapi biodata ketua tim & unggah KTM, 3) Pilih cabang lomba (Esai Nasional atau Mini Case Competition) dan isi data anggota tim (maks. 3 orang termasuk ketua), 4) Lakukan pembayaran QRIS resmi & unggah bukti bayar di Dashboard Peserta.'
  },
  {
    q: 'Apakah ada payment gateway otomatis?',
    a: 'Tidak. Pembayaran menggunakan QRIS resmi Digiconomic Fest dan konfirmasi langsung ke nomor WhatsApp panitia dengan template pesan otomatis. Panitia akan memverifikasi pembayaran Anda dalam 1x24 jam.'
  },
  {
    q: 'Bagaimana cara mengirim bukti transfer/pembayaran?',
    a: 'Setelah scan QRIS di layar, klik tombol "Kirim Konfirmasi via WhatsApp". WhatsApp Anda akan otomatis terbuka dengan format pesan yang sudah terisi nama, ID registrasi, dan lomba. Cukup lampirkan foto/screenshot bukti pembayaran ke chat tersebut.'
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
