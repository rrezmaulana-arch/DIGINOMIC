import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AboutProps {
  onExploreComps: () => void;
}

export const About: React.FC<AboutProps> = ({ onExploreComps }) => {
  return (
    <section
      id="tentang"
      className="relative w-full py-16 sm:py-20 px-6 sm:px-10 lg:px-16 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fdf8ef 0%, #faf3e5 50%, #f7efe0 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ── TOP SECTION: APA ITU DIGICONOMIC FEST? ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
          
          {/* Left: Title + Narrative */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <p className="font-cinzel text-xs tracking-widest text-[#7a5530] font-medium mb-2">
                Tentang Acara
              </p>
              <h2 className="font-cormorant font-normal text-3xl sm:text-4xl lg:text-[2.85rem] text-[#241308] tracking-tight leading-[1.15]">
                Mengenal <br />
                <span className="shimmer-text font-normal">
                  Digiconomic Fest
                </span>
              </h2>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-[1.85] font-normal">
              <strong className="text-[#2a170b] font-medium">Digiconomic Fest 2027</strong> merupakan program kerja kolaboratif Divisi Pendidikan dan Divisi Kewirausahaan GenBI yang menjadi wadah edukasi, kompetisi, dan kolaborasi bagi generasi muda untuk memahami serta mengembangkan potensi UMKM di tengah dinamika <em>emerging market</em>.
            </p>

            <p className="font-sans text-xs sm:text-sm text-[#4a2e18] leading-[1.85] font-normal">
              Melalui rangkaian kegiatan kompetisi dan seminar, Digiconomic Fest diharapkan mampu mendorong lahirnya ide, inovasi, dan kontribusi nyata dalam menciptakan UMKM lokal yang adaptif, berdaya saing global, dan berkelanjutan.
            </p>

            <div className="pt-2">
              <button
                onClick={onExploreComps}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] to-[#d8a85a] hover:from-[#c9954a] hover:to-[#e0b56b] text-white font-cinzel text-xs font-medium tracking-[0.18em] shadow-xs hover:shadow transition-all active:scale-95"
              >
                <span>LIHAT CABANG LOMBA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Clean Polaroid Photo Pair */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-4">
            {/* Polaroid 1 */}
            <div className="w-52 sm:w-60 p-2.5 rounded-2xl shadow-md -rotate-2 bg-[#fffdf9] border border-[#ebdcc8]/80 transition-all hover:rotate-0 hover:shadow-xl duration-300 relative z-10">
              <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-[#e0ceb6]">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
                  alt="Kolaborasi Mahasiswa"
                  className="w-full h-full object-cover filter sepia-[0.2]"
                />
              </div>
              <p className="font-cormorant italic text-center text-sm text-[#5c3e28] mt-2">
                Kolaborasi Mahasiswa
              </p>
            </div>

            {/* Polaroid 2 */}
            <div className="w-48 sm:w-56 p-2.5 rounded-2xl shadow-lg rotate-4 bg-[#fffdf9] border border-[#ebdcc8]/80 transition-all hover:rotate-1 hover:shadow-xl duration-300 absolute -bottom-4 -right-1 sm:right-2 z-20">
              <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-[#e0ceb6]">
                <img
                  src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80"
                  alt="Seminar Edukatif"
                  className="w-full h-full object-cover filter sepia-[0.15]"
                />
              </div>
              <p className="font-cormorant italic text-center text-sm text-[#5c3e28] mt-2">
                Seminar Bank Indonesia
              </p>
            </div>
          </div>

        </div>

        {/* ── MIDDLE: TEMA RESMI ── */}
        <div className="my-14 text-center">
          <div
            className="p-8 sm:p-10 rounded-3xl border border-[#ebdcc8] shadow-xs max-w-4xl mx-auto relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #faf4e8 70%, #f4e8d2 100%)',
            }}
          >
            <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />
            <span className="inline-block px-5 py-1 rounded-full bg-[#f0e3cc] text-[#7d4f2b] font-cinzel text-[10px] tracking-[0.25em] uppercase font-medium mb-3">
              TEMA UTAMA ACARA
            </span>

            <blockquote className="font-cormorant font-normal italic text-lg sm:text-xl lg:text-2xl text-[#2a170b] leading-snug max-w-3xl mx-auto">
              “Ekosistem UMKM di Negara Emerging Market: Mengakselerasi Potensi Lokal yang Berdaya Saing Global untuk Mewujudkan Pertumbuhan Berkelanjutan”
            </blockquote>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-[10px] font-cinzel text-[#8a5e38] tracking-[0.2em] uppercase font-medium">
              <span>✦ Divisi Pendidikan</span>
              <span>✦ Bank Indonesia</span>
              <span>✦ Divisi Kewirausahaan</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: LATAR BELAKANG & URGENSI ── */}
        <div className="mt-14">
          <div className="text-center max-w-lg mx-auto mb-10">
            <p className="font-cinzel text-xs text-[#7a5530] font-medium tracking-widest mb-1.5">
              Latar Belakang Acara
            </p>
            <h3 className="font-cormorant font-normal text-2xl sm:text-3xl text-[#241308]">
              Latar Belakang & Urgensi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                no: '01',
                title: 'Potensi UMKM Lokal',
                desc: 'UMKM memiliki potensi besar sebagai penggerak perekonomian, tetapi masih menghadapi berbagai tantangan dalam pengembangan usaha dan perluasan pasar.',
              },
              {
                no: '02',
                title: 'Tantangan Transformasi',
                desc: 'Perubahan ekonomi dan perkembangan teknologi menuntut UMKM untuk terus beradaptasi, berinovasi, dan meningkatkan daya saing global.',
              },
              {
                no: '03',
                title: 'Peran Generasi Muda',
                desc: 'Generasi muda memiliki kreativitas, pengetahuan, dan potensi inovasi yang dapat menjadi bagian dari solusi untuk mendukung perkembangan UMKM.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-3xl border border-[#ebdcc8] shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative"
                style={{ background: 'rgba(255, 253, 248, 0.92)' }}
              >
                <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/20 pointer-events-none group-hover:border-[#caa152]/60 transition-colors" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-cinzel text-xs font-semibold text-white mb-4 bg-gradient-to-r from-[#ba883a] to-[#caa152] shadow-2xs">
                  {item.no}
                </div>
                <h4 className="font-cormorant font-normal text-xl text-[#2a170b] group-hover:text-[#ba883a] transition-colors mb-2">
                  {item.title}
                </h4>
                <p className="font-sans text-xs text-[#5c3e28] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
