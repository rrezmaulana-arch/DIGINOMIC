import React, { useEffect, useRef, useState } from 'react';

export interface AnimatedDigiconomicLogoProps {
  /** Ukuran container (harus square agar seluruh 8 layer viewBox 1640x1640 terkunci presisi) */
  className?: string;
  /**
   * - 'showcase': merakit logo saat masuk viewport (IntersectionObserver) + interaktif highlight filosofi
   * - 'transition': langsung merakit cepat & sinematik untuk overlay pindah halaman / preloader
   * - 'static': langsung tampil penuh tanpa animasi masuk (masih mendukung highlight)
   */
  mode?: 'showcase' | 'transition' | 'static';
  /** ID kartu filosofi aktif (1..4) dari LogoMeaning.tsx untuk menyorot bagian logo terkait */
  activePhilosophy?: number | null;
  /** Menampilkan sapuan kilau emas metalik setelah logo selesai dirakit */
  showSheen?: boolean;
  /** Klik logo untuk memutar ulang animasi rakitan (berguna di mode showcase) */
  replayOnClick?: boolean;
}

interface LogoLayerDef {
  id: string;
  src: string;
  label: string;
  /** Offset awal sebelum meluncur ke posisi final (persen relatif terhadap box 1:1) */
  fromX: string;
  fromY: string;
  fromScale: number;
  /** Delay ms untuk mode showcase vs mode transition */
  delayShowcase: number;
  delayTransition: number;
  durationMs: number;
  /** Filosofi ID (1..4) yang terhubung dengan layer ini */
  philosophies: number[];
}

const LOGO_LAYERS: LogoLayerDef[] = [
  {
    id: '04',
    src: '/Logo/04-pita-vertikal-kiri.svg',
    label: 'Pita Vertikal Kiri',
    fromX: '-10%',
    fromY: '8%',
    fromScale: 0.94,
    delayShowcase: 40,
    delayTransition: 20,
    durationMs: 560,
    philosophies: [1],
  },
  {
    id: '03',
    src: '/Logo/03-pita-atas-kanan.svg',
    label: 'Pita Atas Kanan',
    fromX: '10%',
    fromY: '-8%',
    fromScale: 0.94,
    delayShowcase: 110,
    delayTransition: 60,
    durationMs: 580,
    philosophies: [1, 4],
  },
  {
    id: '05',
    src: '/Logo/05-sapuan-bawah.svg',
    label: 'Sapuan Bawah',
    fromX: '-8%',
    fromY: '12%',
    fromScale: 0.94,
    delayShowcase: 170,
    delayTransition: 95,
    durationMs: 580,
    philosophies: [1, 4],
  },
  {
    id: '07',
    src: '/Logo/07-baji-krem.svg',
    label: 'Bidang Baji Krem',
    fromX: '0%',
    fromY: '5%',
    fromScale: 0.9,
    delayShowcase: 260,
    delayTransition: 145,
    durationMs: 520,
    philosophies: [1],
  },
  {
    id: '02',
    src: '/Logo/02-daun-kiri-atas.svg',
    label: 'Daun Kiri Atas',
    fromX: '-9%',
    fromY: '-9%',
    fromScale: 0.88,
    delayShowcase: 330,
    delayTransition: 185,
    durationMs: 520,
    philosophies: [1],
  },
  {
    id: '06',
    src: '/Logo/06-tiga-batang-grafik.svg',
    label: 'Tiga Batang Grafik UMKM',
    fromX: '0%',
    fromY: '16%',
    fromScale: 0.9,
    delayShowcase: 430,
    delayTransition: 235,
    durationMs: 560,
    philosophies: [2],
  },
  {
    id: '08',
    src: '/Logo/08-panah-melengkung.svg',
    label: 'Panah Pertumbuhan',
    fromX: '-12%',
    fromY: '12%',
    fromScale: 0.88,
    delayShowcase: 530,
    delayTransition: 290,
    durationMs: 580,
    philosophies: [2, 4],
  },
  {
    id: '01',
    src: '/Logo/01-kluster-piksel.svg',
    label: 'Kluster Piksel Digital',
    fromX: '-6%',
    fromY: '-12%',
    fromScale: 0.78,
    delayShowcase: 640,
    delayTransition: 345,
    durationMs: 520,
    philosophies: [3],
  },
];

// Cache preload di level modul agar SVG langsung siap tanpa kedipan saat pindah halaman
let preloadStarted = false;
const preloadLogoLayers = () => {
  if (preloadStarted || typeof window === 'undefined') return;
  preloadStarted = true;
  LOGO_LAYERS.forEach((layer) => {
    const img = new Image();
    img.src = layer.src;
  });
};

export const AnimatedDigiconomicLogo: React.FC<AnimatedDigiconomicLogoProps> = ({
  className = 'w-36 h-36',
  mode = 'showcase',
  activePhilosophy = null,
  showSheen = true,
  replayOnClick = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasEntered, setHasEntered] = useState(mode !== 'showcase');
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    preloadLogoLayers();
  }, []);

  useEffect(() => {
    if (mode !== 'showcase') {
      setHasEntered(true);
      return;
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  const handleReplay = () => {
    if (!replayOnClick || mode === 'static') return;
    setPlayKey((prev) => prev + 1);
  };

  const isAnimating = mode !== 'static' && hasEntered;
  const sheenDelay = mode === 'transition' ? 480 : 880;

  return (
    <div
      ref={containerRef}
      onClick={handleReplay}
      role={replayOnClick ? 'button' : undefined}
      tabIndex={replayOnClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (replayOnClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleReplay();
        }
      }}
      title={replayOnClick ? 'Klik untuk putar ulang animasi rakitan logo' : undefined}
      className={`relative aspect-square select-none overflow-visible ${
        replayOnClick ? 'cursor-pointer' : ''
      } ${className}`}
      aria-label="Logo Resmi Digiconomic Fest 2027"
    >
      {/* Wrapper kunci 1:1 — semua 8 SVG berbagi viewBox 1640x1640 sehingga 100% presisi */}
      <div key={playKey} className="relative w-full h-full">
        {LOGO_LAYERS.map((layer) => {
          const isHighlighted =
            activePhilosophy !== null && layer.philosophies.includes(activePhilosophy);
          const isDimmed =
            activePhilosophy !== null && !layer.philosophies.includes(activePhilosophy);

          const delay =
            mode === 'transition' ? layer.delayTransition : layer.delayShowcase;

          return (
            <div
              key={layer.id}
              className="absolute inset-0 w-full h-full pointer-events-none transition-[opacity,transform,filter] duration-300 ease-out"
              style={{
                opacity: isDimmed ? 0.22 : 1,
                transform: isHighlighted ? 'scale(1.035)' : 'scale(1)',
                filter: isHighlighted
                  ? 'drop-shadow(0 0 12px rgba(202, 161, 82, 0.85)) brightness(1.08)'
                  : isDimmed
                  ? 'grayscale(35%)'
                  : 'drop-shadow(0 4px 10px rgba(70, 36, 10, 0.16))',
                zIndex: isHighlighted ? 20 : 10,
              }}
            >
              <img
                src={layer.src}
                alt=""
                aria-hidden="true"
                draggable={false}
                className={`block w-full h-full object-contain transform-gpu ${
                  isAnimating ? 'digiconomic-logo-layer-enter' : ''
                }`}
                style={
                  isAnimating
                    ? ({
                        '--logo-from-x': layer.fromX,
                        '--logo-from-y': layer.fromY,
                        '--logo-from-scale': layer.fromScale,
                        animationDelay: `${delay}ms`,
                        animationDuration: `${layer.durationMs}ms`,
                      } as React.CSSProperties)
                    : { opacity: mode === 'showcase' && !hasEntered ? 0 : 1 }
                }
              />
            </div>
          );
        })}

        {/* Sapuan kilau emas metalik satu kali setelah rakitan selesai */}
        {showSheen && isAnimating && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-30"
          >
            <div
              className="digiconomic-logo-sheen absolute inset-y-0 w-1/2"
              style={{ animationDelay: `${sheenDelay}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};