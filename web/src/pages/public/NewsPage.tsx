import React, { useMemo, useState } from 'react';
import {
  Newspaper,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  X,
  Tag,
  Share2,
  Check,
} from 'lucide-react';
import {
  BatikKawungPattern,
  MegaMendungClouds,
  SectionWaveTransition,
} from '../../components/Ornaments';

export interface NewsArticle {
  id: string;
  slug: string;
  category: 'Pengumuman' | 'Kompetisi' | 'Technical Meeting' | 'UMKM & Edukasi';
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  featured?: boolean;
  content: string[];
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    slug: 'pembukaan-pendaftaran-digiconomic-fest-2027',
    category: 'Pengumuman',
    title: 'Pendaftaran Digiconomic Fest 2027 Resmi Dibuka: Target 450+ Peserta Nasional',
    date: '14 Desember 2026',
    readTime: '3 mnt baca',
    featured: true,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80',
    excerpt:
      'GenBI Malang resmi membuka pendaftaran Digiconomic Fest 2027 (14 Des 2026 – 30 Jan 2027) dengan dua cabang kompetisi nasional: Esai Nasional dan Mini Case Competition.',
    content: [
      'Generasi Baru Indonesia (GenBI) melalui kolaborasi Divisi Pendidikan dan Divisi Kewirausahaan resmi membuka pendaftaran Digiconomic Fest 2027 mulai 14 Desember 2026 hingga 30 Januari 2027.',
      'Tahun ini tersedia dua cabang kompetisi utama yaitu Esai Nasional (kategori individu, target 350+ pendaftar) dan Mini Case Competition (kategori tim 2–3 orang, target 100+ pendaftar). Setiap akun hanya diperbolehkan mengikuti satu cabang lomba aktif agar kompetisi berjalan adil dan fokus.',
      'Seluruh berkas pendaftaran dapat diunggah melalui portal resmi, dan status verifikasi serta akses grup peserta akan diperbarui langsung melalui Dashboard Peserta.',
    ],
  },
  {
    id: 'news-2',
    slug: 'jadwal-seleksi-hingga-main-event-2027',
    category: 'Technical Meeting',
    title: 'Catat Tanggal Penting: Penjurian Februari, Final 21 Maret & Main Event 22 Maret 2027',
    date: '20 Januari 2027',
    readTime: '4 mnt baca',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    excerpt:
      'Simak linimasa resmi mulai dari evaluasi karya (1–19 Feb 2027), pengumuman finalis (20 Feb 2027), babak final (21 Mar 2027), hingga Acara Puncak pada 22 Maret 2027.',
    content: [
      'Setelah pendaftaran ditutup pada 30 Januari 2027, seluruh karya Esai Nasional dan Mini Case Competition akan memasuki tahap Judging & Evaluation pada 1–19 Februari 2027.',
      'Pengumuman finalis dijadwalkan pada 20 Februari 2027, diikuti Technical Meeting khusus finalis sebelum melaju ke Competition Final pada 21 Maret 2027 di Malang.',
      'Rangkaian kegiatan akan ditutup dengan Digiconomic Fest Main Event pada 22 Maret 2027 yang menghadirkan Seminar bersama Bank Indonesia dan praktisi UMKM, Pameran UMKM binaan BI, serta Awarding Night.',
    ],
  },
  {
    id: 'news-3',
    slug: 'tips-lolos-seleksi-esai-dan-mini-case',
    category: 'Kompetisi',
    title: '5 Hal yang Paling Dinilai Juri di Esai Nasional & Mini Case Competition',
    date: '25 Januari 2027',
    readTime: '5 mnt baca',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    excerpt:
      'Ketajaman riset masalah UMKM di emerging market, kelayakan implementasi, serta orisinalitas gagasan menjadi indikator utama dewan juri.',
    content: [
      'Baik pada Esai Nasional maupun Mini Case Competition, karya yang menonjol selalu berangkat dari tantangan nyata pelaku UMKM lokal di tengah dinamika emerging market.',
      'Lima aspek utama yang diperhatikan juri meliputi kesesuaian tema, kekuatan data pendukung, orisinalitas solusi digital/bisnis, kelayakan penerapan, serta kerapian sistematika penulisan sesuai Juklak & Juknis.',
      'Pastikan format PDF dan batas halaman sudah sesuai panduan resmi sebelum mengunggah karya melalui Dashboard Peserta.',
    ],
  },
  {
    id: 'news-4',
    slug: 'pameran-umkm-binaan-bank-indonesia-malang',
    category: 'UMKM & Edukasi',
    title: 'Pameran UMKM Binaan Bank Indonesia Hadir di Acara Puncak Digiconomic Fest 2027',
    date: '15 Februari 2027',
    readTime: '4 mnt baca',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80',
    excerpt:
      'Selain seminar nasional bertarget 375+ peserta, Main Event 22 Maret 2027 juga menampilkan pameran produk unggulan UMKM binaan Bank Indonesia.',
    content: [
      'Acara puncak Digiconomic Fest 2027 pada 22 Maret 2027 tidak hanya menjadi panggung apresiasi para finalis kompetisi, tetapi juga ruang temu langsung antara mahasiswa, praktisi, dan pelaku UMKM binaan Bank Indonesia.',
      'Melalui sesi seminar, diskusi interaktif, dan Pameran UMKM binaan BI, pengunjung dapat melihat langsung bagaimana digitalisasi pembayaran dan inovasi bisnis membantu UMKM lokal naik kelas dan berdaya saing global.',
    ],
  },
];

const CATEGORIES: Array<'Semua' | NewsArticle['category']> = [
  'Semua',
  'Pengumuman',
  'Kompetisi',
  'Technical Meeting',
  'UMKM & Edukasi',
];

export const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | NewsArticle['category']>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const featuredArticle = useMemo(
    () => NEWS_ARTICLES.find((a) => a.featured) || NEWS_ARTICLES[0],
    []
  );

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return NEWS_ARTICLES.filter((article) => {
      const matchCat = selectedCategory === 'Semua' || article.category === selectedCategory;
      const matchSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyShare = (article: NewsArticle) => {
    const url = `${window.location.origin}/news#${article.slug}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedId(article.id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── HERO HEADER ── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#2f1d10] via-[#26160c] to-[#1e1108] text-[#faf4e8] overflow-hidden">
        <BatikKawungPattern color="#caa152" opacity={0.07} id="kawung-news-hero" />
        <MegaMendungClouds color="#caa152" className="absolute top-12 -right-14 w-64 sm:w-80 opacity-45" />
        <MegaMendungClouds color="#caa152" flip className="absolute bottom-6 -left-14 w-64 sm:w-80 opacity-40" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3f2818] border border-[#caa152]/50 text-[#f3d48c] font-cinzel text-[10px] sm:text-xs tracking-[0.22em] uppercase font-semibold mb-4">
            <Newspaper className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Berita &amp; Pengumuman Resmi</span>
          </div>

          <h1 className="font-cormorant text-3xl sm:text-5xl lg:text-6xl text-[#fffdf9] font-normal tracking-tight">
            Kabar Terbaru <span className="shimmer-text">Digiconomic Fest</span>
          </h1>

          <p className="mt-3 max-w-2xl mx-auto font-sans text-xs sm:text-sm md:text-base text-[#dec9ad] leading-relaxed">
            Ikuti pengumuman resmi panitia, informasi <em>Technical Meeting</em>, tips Esai Nasional &amp; Mini Case Competition, serta kabar seputar UMKM binaan Bank Indonesia.
          </p>
        </div>
      </section>

      <SectionWaveTransition fromColor="#1e1108" toColor="#f3e6d3" accentColor="#caa152" variant="cloud" />

      {/* ── MAIN NEWS CONTENT ── */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#f3e6d3] via-[#efe1cc] to-[#e4d2b7]">
        <BatikKawungPattern color="#7a5530" opacity={0.04} id="kawung-news-body" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-8 sm:space-y-12">
          {/* FEATURED ARTICLE */}
          {selectedCategory === 'Semua' && !searchQuery.trim() && (
            <article
              onClick={() => setActiveArticle(featuredArticle)}
              className="card-modern-hover cursor-pointer grid grid-cols-1 lg:grid-cols-12 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#fffdf9] border border-[#ebdcc8] shadow-sm"
            >
              <div className="lg:col-span-6 h-56 sm:h-72 lg:h-auto relative overflow-hidden bg-[#e0ceb6]">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#2f1d10]/90 text-[#f3d48c] border border-[#caa152]/60 font-cinzel text-[10px] tracking-[0.18em] uppercase font-semibold">
                  Sorotan Utama
                </span>
              </div>

              <div className="lg:col-span-6 p-5 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7a5530] font-sans mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f5ede0] border border-[#ebdcc8] font-medium">
                      <Tag className="w-3 h-3 text-[#caa152]" />
                      {featuredArticle.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#caa152]" />
                      {featuredArticle.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#caa152]" />
                      {featuredArticle.readTime}
                    </span>
                  </div>

                  <h2 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-normal leading-snug mb-3">
                    {featuredArticle.title}
                  </h2>

                  <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#ebdcc8] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-cinzel text-xs tracking-[0.16em] uppercase text-[#9b6e38] font-semibold">
                    Baca Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* FILTER BAR & SEARCH */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full font-cinzel text-[10px] sm:text-xs tracking-[0.14em] uppercase transition-all ${
                      isActive
                        ? 'bg-[#3b2412] text-[#faf4e8] font-semibold shadow-xs'
                        : 'bg-[#fffdf9]/90 text-[#5c3e28] border border-[#ebdcc8] hover:border-[#caa152]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#8a5e38] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berita atau pengumuman..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#fffdf9] border border-[#d8be99] text-xs sm:text-sm text-[#2a170b] placeholder:text-[#9c7b5c] focus:outline-none focus:border-[#caa152]"
              />
            </div>
          </div>

          {/* NEWS GRID */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#fffdf9]/80 border border-[#ebdcc8]">
              <p className="font-cormorant text-xl text-[#2a170b]">Belum ada berita yang cocok</p>
              <p className="font-sans text-xs text-[#6e4e32] mt-1">
                Coba ubah kata kunci pencarian atau pilih kategori lainnya.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="card-modern-hover cursor-pointer rounded-2xl overflow-hidden bg-[#fffdf9] border border-[#ebdcc8] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 sm:h-48 overflow-hidden bg-[#e0ceb6] relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#fffdf9]/95 text-[#7a5530] border border-[#ebdcc8] font-cinzel text-[9px] tracking-[0.14em] uppercase font-semibold">
                        {article.category}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-3 text-[11px] text-[#8a5e38] font-sans mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#caa152]" />
                          {article.date}
                        </span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>

                      <h3 className="font-cormorant text-lg sm:text-xl text-[#241308] font-normal leading-snug mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="font-sans text-xs text-[#5c3e28] leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-[#f0e3cc] flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-cinzel text-[10px] tracking-[0.16em] uppercase text-[#9b6e38] font-semibold">
                      Baca Artikel
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <SectionWaveTransition fromColor="#e4d2b7" toColor="#382012" accentColor="#caa152" variant="wave" />

      {/* ── MODAL BACA ARTIKEL LENGKAP ── */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-[#fffdf9] border-2 border-[#caa152]/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52 sm:h-64 bg-[#e0ceb6]">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#241308]/85 text-[#faf4e8] hover:bg-[#3b2412] flex items-center justify-center transition-colors"
                aria-label="Tutup artikel"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-[#2f1d10]/90 text-[#f3d48c] border border-[#caa152]/50 font-cinzel text-[10px] tracking-[0.16em] uppercase font-semibold">
                {activeArticle.category}
              </span>
            </div>

            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7a5530] font-sans mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#caa152]" />
                    {activeArticle.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#caa152]" />
                    {activeArticle.readTime}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyShare(activeArticle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf4e8] border border-[#ebdcc8] hover:border-[#caa152] text-[11px] text-[#5c3e28] transition-colors"
                >
                  {copiedId === activeArticle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tautan Disalin</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#caa152]" />
                      <span>Salin Tautan</span>
                    </>
                  )}
                </button>
              </div>

              <h2 className="font-cormorant text-2xl sm:text-3xl text-[#241308] font-normal leading-snug mb-4">
                {activeArticle.title}
              </h2>

              <div className="space-y-4 font-sans text-xs sm:text-sm text-[#4a2e18] leading-relaxed">
                {activeArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};