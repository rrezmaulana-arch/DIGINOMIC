import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <footer className="bg-[#382012] text-[#e8dac6] border-t-2 border-[#8a6540]/50 pt-16 pb-12 font-sans-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#5a3821]">

          {/* Col 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cfaa7b] to-[#8a6540] p-1 flex items-center justify-center shadow">
                <img
                  src="/Logo/00-logo-gabungan.svg"
                  alt="Digiconomic Fest Logo"
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <span className="font-cinzel text-xl font-bold tracking-wider text-[#f5ebd9] block leading-none">
                  DIGICONOMIC
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#c29a6b] font-bold uppercase">
                  Fest 2027
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-3.5 px-3.5 py-2 rounded-xl bg-[#faf4e8]/95 border border-[#caa152]/40">
              <img src="/Logo/logo-bi.webp" alt="Bank Indonesia" loading="lazy" className="h-3.5 sm:h-4 w-auto object-contain" />
              <span className="w-px h-4 bg-[#b8925a]/45" aria-hidden="true" />
              <img src="/Logo/logo-genbi.webp" alt="GenBI Komisariat UB" loading="lazy" className="h-4 sm:h-5 w-auto object-contain" />
              <span className="w-px h-4 bg-[#b8925a]/45" aria-hidden="true" />
              <img src="/Logo/logo-ub.webp" alt="Universitas Brawijaya" loading="lazy" className="h-5 sm:h-6 w-auto object-contain" />
            </div>

            <p className="text-xs text-[#cfbc9f] leading-relaxed max-w-sm">
              Digiconomic Fest 2027: Perjalanan Menuju Ekonomi Digital Masa Depan. Panggung kompetisi nasional,
              literasi keuangan digital, dan kreasi inovasi UMKM bagi mahasiswa dan pelajar nusantara.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com/digiconomicfest"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#4e3220] hover:bg-[#68432b] border border-[#8a6540] flex items-center justify-center text-[#d2b183] transition-colors"
                title="Instagram Resmi @digiconomicfest"
                aria-label="Instagram Resmi Digiconomic Fest"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="mailto:digiconomicfestival@gmail.com"
                className="w-8 h-8 rounded-full bg-[#4e3220] hover:bg-[#68432b] border border-[#8a6540] flex items-center justify-center text-[#d2b183] transition-colors"
                title="Email Resmi Digiconomic Fest"
                aria-label="Email Resmi Digiconomic Fest"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://diginomic.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#4e3220] hover:bg-[#68432b] border border-[#8a6540] flex items-center justify-center text-[#d2b183] transition-colors"
                title="Portal Resmi Digiconomic Fest 2027"
                aria-label="Portal Resmi Digiconomic Fest 2027"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat (NO MERCHANDISE) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif-title font-bold text-sm tracking-wider text-[#d2b183] uppercase">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs text-[#cfbc9f]">
              <li>
                <button onClick={() => onNavigate('hero')} className="hover:text-[#fbf7f0] transition-colors">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tentang')} className="hover:text-[#fbf7f0] transition-colors">
                  Tentang Acara
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('kompetisi')} className="hover:text-[#fbf7f0] transition-colors">
                  Daftar Kompetisi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('linimasa')} className="hover:text-[#fbf7f0] transition-colors">
                  Linimasa Jadwal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#fbf7f0] transition-colors">
                  Tanya Jawab (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Sekretariat & Layanan Panitia */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif-title font-bold text-sm tracking-wider text-[#d2b183] uppercase">
              Sekretariat &amp; Akun Resmi
            </h4>
            <div className="space-y-2.5 text-xs text-[#cfbc9f]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d2b183] shrink-0 mt-0.5" />
                <span>Universitas Brawijaya, Malang, Jawa Timur</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#d2b183] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    <a
                      href="https://wa.me/6282182324797"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#fbf7f0] underline decoration-[#8a6540] underline-offset-2 transition-colors"
                    >
                      +62 821-8232-4797
                    </a>{' '}
                    <span className="text-[#a89278]">(Admin 1)</span>
                  </p>
                  <p>
                    <a
                      href="https://wa.me/6289652831260"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#fbf7f0] underline decoration-[#8a6540] underline-offset-2 transition-colors"
                    >
                      +62 896-5283-1260
                    </a>{' '}
                    <span className="text-[#a89278]">(Admin 2)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d2b183] shrink-0" />
                <a
                  href="mailto:digiconomicfestival@gmail.com"
                  className="hover:text-[#fbf7f0] underline decoration-[#8a6540] underline-offset-2 transition-colors"
                >
                  digiconomicfestival@gmail.com
                </a>
              </div>
            </div>
            <p className="text-[11px] text-[#9c8468] pt-1 italic">
              Operasional Layanan Verifikasi: Setiap Hari, 08.00 – 21.00 WIB
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a89278]">
          <p>© 2027 Panitia Digiconomic Fest · GenBI Komisariat Universitas Brawijaya. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <button onClick={onOpenPrivacy} className="hover:text-[#f5ebd9] transition-colors">
              Kebijakan Privasi
            </button>
            <span>•</span>
            <button onClick={onOpenTerms} className="hover:text-[#f5ebd9] transition-colors">
              Syarat & Ketentuan
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
