export const MASCOT_NAME = 'Bizzy';

export const MASCOT_ASSETS = {
  main: '/maskot/digibee-main.webp',
  mini: '/maskot/digibee-mini.webp',
  head: '/maskot/robot.webp',
  lebah: '/maskot/lebah (2).webp',
  sayap: '/maskot/sayap.webp',
  logo: '/maskot/Logo Digiconomic.webp',
  robot: '/maskot/robot.webp',
  colors: '/maskot/colors.webp',
} as const;

export type MascotAspectId = 'lebah' | 'sayap' | 'logo' | 'robot' | 'colors';

export interface MascotAspect {
  id: MascotAspectId;
  code: string;
  title: string;
  tagline: string;
  desc: string;
  bubble: string;
  image: string;
  imageAlt: string;
  hotspot: {
    x: string;
    y: string;
  };
  animKind: 'float' | 'flutter' | 'sheen' | 'glow' | 'tilt';
}

export const MASCOT_ASPECTS: MascotAspect[] = [
  {
    id: 'lebah',
    code: 'Aspek 01',
    title: 'Bentuk Lebah',
    tagline: 'Kolaborasi & Produktivitas',
    desc: 'Simbol kolaborasi, produktivitas, dan semangat berkarya bersama.',
    bubble: 'Seperti koloni lebah, kolaborasi tim yang solid selalu melahirkan karya terbaik!',
    image: MASCOT_ASSETS.lebah,
    imageAlt: 'Aspek Bentuk Lebah DigiBee',
    hotspot: { x: '49%', y: '70%' },
    animKind: 'float',
  },
  {
    id: 'sayap',
    code: 'Aspek 02',
    title: 'Sayap',
    tagline: 'Inovasi & Keberanian',
    desc: 'Melambangkan kebebasan berinovasi dan keberanian berkembang.',
    bubble: 'Sayap ini mengajak kita berani terbang tinggi mengeksplorasi inovasi tanpa batas!',
    image: MASCOT_ASSETS.sayap,
    imageAlt: 'Aspek Sayap DigiBee',
    hotspot: { x: '17%', y: '56%' },
    animKind: 'flutter',
  },
  {
    id: 'logo',
    code: 'Aspek 03',
    title: 'Logo Digiconomic',
    tagline: 'Identitas & Pertumbuhan',
    desc: 'Merepresentasikan identitas acara dan semangat pertumbuhan ekonomi.',
    bubble: 'Logo Digiconomic di dadaku jadi simbol semangat pertumbuhan ekonomi digital & UMKM!',
    image: MASCOT_ASSETS.logo,
    imageAlt: 'Aspek Logo Digiconomic di dada DigiBee',
    hotspot: { x: '57%', y: '58%' },
    animKind: 'sheen',
  },
  {
    id: 'robot',
    code: 'Aspek 04',
    title: 'Elemen Robot',
    tagline: 'Teknologi & Adaptasi',
    desc: 'Mencerminkan kemajuan teknologi, transformasi digital, dan kemampuan beradaptasi.',
    bubble: 'Visor pintar & antenaku melambangkan kesiapan beradaptasi di era transformasi digital!',
    image: MASCOT_ASSETS.robot,
    imageAlt: 'Aspek Elemen Robot DigiBee',
    hotspot: { x: '52%', y: '29%' },
    animKind: 'glow',
  },
  {
    id: 'colors',
    code: 'Aspek 05',
    title: 'Warna dan Bentuk',
    tagline: 'Hangat, Ramah & Dinamis',
    desc: 'Menghadirkan kehangatan, profesionalisme, serta karakter yang ramah dan dinamis.',
    bubble: 'Perpaduan krem hangat, emas, dan espresso bikin aku ramah namun tetap profesional!',
    image: MASCOT_ASSETS.colors,
    imageAlt: 'Aspek Palet Warna dan Bentuk DigiBee',
    hotspot: { x: '77%', y: '80%' },
    animKind: 'tilt',
  },
];

export const MASCOT_CHEERS: string[] = [
  `Hai! Aku ${MASCOT_NAME} 👋 Yuk jelajahi tiap bagian tubuhku untuk tahu filosofinya!`,
  'Bzzzt~ ✨ Semangat berkarya! Ide digitalmu bisa jadi solusi nyata buat UMKM lokal!',
  'Siap ikut Esai atau Mini Case Competition? Ajak tim terbaikmu sekarang ya! 🏆',
  'Tahukah kamu? Total apresiasi Digiconomic Fest 2027 mencapai Rp 26.000.000+!',
  'Klik titik emas di tubuhku untuk lihat detail tiap aspek 3D-ku ya! 🐝',
];
