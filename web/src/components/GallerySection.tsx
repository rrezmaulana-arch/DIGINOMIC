import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Search, X, ZoomIn } from 'lucide-react';
import {
  BatikKawungPattern,
  CornerFiligree,
  SectionDivider,
} from './Ornaments';

interface GalleryItem {
  id: number;
  title: string;
  category: 'Kompetisi' | 'Seminar' | 'Awarding';
  year: string;
  caption: string;
  imageUrl: string;
  span?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: 'Grand Final Pitching Mini Case',
    category: 'Kompetisi',
    year: '2026',
    caption: 'Tim finalis memaparkan strategi transformasi digital UMKM di hadapan dewan juri.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 2,
    title: 'Seminar Nasional Bank Indonesia',
    category: 'Seminar',
    year: '2026',
    caption: 'Diskusi panel kebijakan ekonomi digital dan perluasan QRIS untuk pelaku usaha lokal.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Kolaborasi & Mentoring Bisnis',
    category: 'Kompetisi',
    year: '2026',
    caption: 'Sesi pendampingan intensif bersama praktisi industri dan alumni GenBI UB.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    title: 'Malam Penganugerahan Juara',
    category: 'Awarding',
    year: '2026',
    caption: 'Penyerahan trofi dan dana pembinaan bagi para pemenang Esai & Mini Case.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    title: 'Expo Inovasi UMKM Lokal',
    category: 'Seminar',
    year: '2026',
    caption: 'Pameran produk kreatif UMKM binaan KPw Bank Indonesia Malang yang berkolaborasi dengan peserta Digiconomic Fest.',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80',
  },
];

const CATEGORIES = ['Semua', 'Kompetisi', 'Seminar', 'Awarding'] as const;
const LOUPE_SIZE = 156;

interface LoupeState {
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const GallerySection: React.FC = () => {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('Semua');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<2.4 | 3.2>(2.4);
  const [loupe, setLoupe] = useState<LoupeState>({
    active: false,
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });
  const imgBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lightbox) {
      setLoupe((prev) => (prev.active ? { ...prev, active: false } : prev));
      setZoomLevel(2.4);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox]);

  const handleLoupeMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = imgBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setLoupe({
      active: true,
      x,
      y,
      width: rect.width,
      height: rect.height,
    });
  };

  const handleLoupeLeave = () => {
    setLoupe((prev) => ({ ...prev, active: false }));
  };

  const toggleZoomLevel = () => {
    setZoomLevel((prev) => (prev === 2.4 ? 3.2 : 2.4));
  };

  const visibleItems =
    filter === 'Semua' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.category === filter);

  const lightboxModal =
    lightbox &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lightbox.title}
        className="fixed inset-0 z-[95] bg-[#160b04]/88 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setLightbox(null)}
      >
        <div
          className="relative max-w-3xl w-full rounded-3xl overflow-hidden border-2 border-[#caa152] bg-[#29170b] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-[#1a0e06]/85 border border-[#caa152]/70 text-[#faf4e8] flex items-center justify-center hover:bg-[#3b2412] hover:scale-105 transition-all"
            aria-label="Tutup pratinjau"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Interactive Magnifier Photo Stage */}
          <div
            ref={imgBoxRef}
            onMouseMove={handleLoupeMove}
            onMouseLeave={handleLoupeLeave}
            onClick={toggleZoomLevel}
            className="relative w-full overflow-hidden bg-[#1a0e06] select-none cursor-zoom-in"
            title="Arahkan kursor untuk kaca pembesar · Klik untuk ganti tingkat zoom"
          >
            <img
              src={lightbox.imageUrl}
              alt={lightbox.title}
              draggable={false}
              className={`w-full max-h-[66vh] object-cover transition-transform duration-500 ease-out ${
                loupe.active ? 'scale-[1.03]' : 'scale-100'
              }`}
            />

            {/* Hint pill (desktop) */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 absolute top-3.5 left-3.5 z-20 px-3 py-1 rounded-full bg-[#1a0e06]/78 border border-[#caa152]/55 text-[#f7e1b5] text-[11px] font-sans backdrop-blur-xs pointer-events-none transition-opacity duration-200 ${
                loupe.active ? 'opacity-90' : 'opacity-85'
              }`}
            >
              <Search className="w-3 h-3 text-[#e8c47a]" />
              <span>
                {loupe.active
                  ? `Magnifier ${zoomLevel}× · Klik untuk ${zoomLevel === 2.4 ? '3.2×' : '2.4×'}`
                  : 'Arahkan kursor untuk efek magnifier'}
              </span>
            </div>

            {/* Circular Vintage Gold Magnifier Loupe (Desktop Hover Only) */}
            {loupe.active && (
              <div
                aria-hidden="true"
                className="hidden sm:block pointer-events-none absolute z-20 rounded-full border-2 border-[#f3d48c] ring-2 ring-[#29170b]/75 shadow-[0_14px_34px_rgba(0,0,0,0.6),inset_0_0_24px_rgba(255,244,210,0.22)]"
                style={{
                  width: LOUPE_SIZE,
                  height: LOUPE_SIZE,
                  left: 0,
                  top: 0,
                  transform: `translate3d(${loupe.x - LOUPE_SIZE / 2}px, ${loupe.y - LOUPE_SIZE / 2}px, 0)`,
                  backgroundImage: `url("${lightbox.imageUrl}")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${loupe.width * zoomLevel}px ${loupe.height * zoomLevel}px`,
                  backgroundPosition: `${-(loupe.x * zoomLevel - LOUPE_SIZE / 2)}px ${-(loupe.y * zoomLevel - LOUPE_SIZE / 2)}px`,
                }}
              >
                {/* Glass highlight reflection */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, rgba(255, 250, 232, 0.28) 0%, rgba(255, 250, 232, 0.04) 45%, transparent 70%)',
                  }}
                />
                {/* Fine center crosshair */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-[#f3d48c]/70" />
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 bg-[#29170b] text-[#faf4e8]">
            <span className="font-poppins text-[10px] tracking-[0.2em] uppercase text-[#caa152] font-semibold">
              {lightbox.category} · {lightbox.year}
            </span>
            <h4 className="font-poppins text-lg sm:text-xl font-semibold text-[#fffdf9] mt-1">
              {lightbox.title}
            </h4>
            <p className="font-sans text-xs sm:text-sm text-[#e3d0b5] mt-1.5 leading-relaxed">
              {lightbox.caption}
            </p>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <section
      id="galeri"
      className="relative w-full py-10 sm:py-14 md:py-16 px-4 sm:px-8 lg:px-12 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #faf4e8 0%, #f4ead8 55%, #efe3d0 100%)',
      }}
    >
      <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-gallery" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3b2412] border border-[#caa152]/60 text-[#fcedb8] font-poppins text-[10px] sm:text-xs tracking-widest uppercase font-semibold mb-3">
            <Camera className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Kilas Balik Digiconomic Fest 2026</span>
          </div>

          <h2 className="font-abang font-normal text-2xl sm:text-4xl lg:text-[2.75rem] text-[#241308] tracking-tight leading-snug">
            Galeri <span className="text-[#9a6522]">Digiconomic Fest</span>
          </h2>
          <SectionDivider variant="light" />
          <p className="font-sans text-xs sm:text-sm text-[#5c3e28] leading-relaxed">
            Jejak perjalanan dan momen terbaik Digiconomic Fest 2026, dari panggung kompetisi, seminar ekonomi digital Bank Indonesia, hingga malam penganugerahan juara menuju edisi 2027.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CATEGORIES.map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full font-poppins text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#3b2412] text-[#faf4e8] shadow-xs'
                      : 'bg-[#fffdf9]/85 text-[#5c3e28] border border-[#d8be99] hover:border-[#caa152] hover:text-[#241308]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 auto-rows-[210px] sm:auto-rows-[220px]">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              className={`card-modern-hover group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#caa152]/55 cursor-pointer bg-[#2b1a0e] shadow-md ${
                filter === 'Semua' && item.span ? item.span : ''
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter sepia-[0.14] group-hover:sepia-0"
              />

              {/* Warm vignette gradient */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(36,19,8,0.08) 0%, rgba(36,19,8,0.28) 48%, rgba(28,15,6,0.92) 100%)',
                }}
              />

              <CornerFiligree color="#caa152" className="w-5 h-5 opacity-0 group-hover:opacity-75 transition-opacity duration-300" />

              {/* Zoom icon */}
              <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#241308]/75 border border-[#caa152]/50 text-[#fcedb8] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-left">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#caa152]/25 border border-[#caa152]/50 text-[#fcedb8] font-poppins text-[10px] font-semibold tracking-wider uppercase mb-1.5">
                  {item.category} · {item.year}
                </span>
                <h3 className="font-poppins font-semibold text-sm sm:text-base text-[#fffdf9] leading-snug">
                  {item.title}
                </h3>
                <p className="font-sans text-[11px] text-[#e3d0b5] mt-1 line-clamp-2 opacity-90">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxModal}
    </section>
  );
};
