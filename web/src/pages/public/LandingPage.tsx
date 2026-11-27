import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicApi } from '../../services/apiService';
import type { NewsArticle } from '../../types';
import { ArrowRight, Calendar, Clock, Newspaper } from 'lucide-react';
import { Hero } from '../../components/Hero';
import { About } from '../../components/About';
import { LogoMeaning } from '../../components/LogoMeaning';
import { Competitions } from '../../components/Competitions';
import { PrizeBenefitsSection } from '../../components/PrizeBenefitsSection';
import { TimelineSection } from '../../components/TimelineSection';
import { GallerySection } from '../../components/GallerySection';
import { FAQSection } from '../../components/FAQSection';
import { BatikKawungPattern, SectionWaveTransition } from '../../components/Ornaments';
import { Competition } from '../../types';

const WHATSAPP_HELPDESK_URL = `https://wa.me/6282182324797?text=${encodeURIComponent(
  'Halo Panitia Digiconomic Fest 2027, saya membutuhkan informasi mengenai pendaftaran lomba.'
)}`;

function toWebpCover(url?: string | null): string {
  if (!url) return '/gambar/hero-view-dekstop.webp';
  if (url.includes('images.unsplash.com') && !url.includes('fm=webp')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}fm=webp&w=800&q=75`;
  }
  return url;
}

interface LandingPageProps {
  onSelectCompetition?: (comp: Competition) => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const navigate = useNavigate();
  const [homeNews, setHomeNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    PublicApi.getNews(true)
      .then((res) => setHomeNews(res.articles || []))
      .catch(() => { });
  }, []);

  const handleSelectCompetition = (comp: Competition) => {
    navigate(`/daftar?lomba=${comp.slug}`);
  };

  const handleExploreDetail = (comp: Competition) => {
    navigate(`/kompetisi/${comp.slug}`);
  };

  const handleOpenWhatsAppHelp = () => {
    window.open(WHATSAPP_HELPDESK_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-0 selection:bg-[#caa152]/30 selection:text-[#2f1e10] relative">
      {/* 1. HERO SECTION */}
      <Hero
        onExplore={() => {
          const el = document.getElementById('tentang');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onViewCompetitions={() => {
          const el = document.getElementById('kompetisi');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. ABOUT & THEME SECTION */}
      <About
        onExploreComps={() => {
          const el = document.getElementById('kompetisi');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#2f1d10" accentColor="#caa152" variant="ridge" />

      {/* 3. LOGO MEANING & VISUAL IDENTITY */}
      <LogoMeaning />

      <SectionWaveTransition fromColor="#1f1209" toColor="#efe2ce" accentColor="#caa152" variant="cloud" />

      {/* 4. COMPETITIONS SHOWCASE */}
      <Competitions onSelectCompetition={handleSelectCompetition} onExploreDetail={handleExploreDetail} />

      {/* 5. PRIZES & BENEFITS */}
      <PrizeBenefitsSection />

      <SectionWaveTransition fromColor="#efe1cc" toColor="#2b1a0e" accentColor="#caa152" variant="ridge" />

      {/* 6. TIMELINE S-CURVE */}
      <TimelineSection />

      <SectionWaveTransition fromColor="#1e1108" toColor="#faf4e8" accentColor="#caa152" variant="cloud" />

      {/* 7. KILAS BALIK & GALERI 2025 */}
      <GallerySection />

      {/* 7B. BERITA & PENGUMUMAN RESMI (Menyatu mulus dengan gradasi #efe3d0 antara Galeri & FAQ) */}
      {homeNews.length > 0 && (
        <section
          id="berita"
          className="relative w-full py-10 sm:py-14 md:py-16 px-4 sm:px-8 lg:px-12 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #efe3d0 0%, #efe3d0 100%)',
          }}
        >
          <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-home-news" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3b2412] border border-[#caa152]/60 text-[#fcedb8] font-poppins text-[10px] sm:text-xs tracking-widest uppercase font-semibold mb-3">
                  <Newspaper className="w-3.5 h-3.5 text-[#caa152]" />
                  <span>Kabar &amp; Siaran Resmi</span>
                </div>
                <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-[2.65rem] text-[#241308] leading-tight">
                  Pengumuman &amp; <span className="text-[#9a6522]">Berita Terbaru</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/news')}
                className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-[#fffdf9]/90 hover:bg-[#3b2412] text-[#2f1e10] hover:text-[#faf4e8] border border-[#caa152]/70 font-cinzel text-xs tracking-wider uppercase font-semibold transition-all self-start sm:self-auto cursor-pointer shadow-2xs"
              >
                <span>Semua Berita</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#caa152]" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {homeNews.slice(0, 3).map((item) => {
                const formattedDate = new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const readMinutes = Math.max(1, Math.ceil((item.content || '').split(/\s+/).length / 180));
                return (
                  <article
                    key={item.id}
                    onClick={() => navigate(`/news#${item.slug}`)}
                    className="card-modern-hover group bg-[#fffdf9]/95 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#dfd0ba] hover:border-[#caa152] shadow-[0_8px_24px_-12px_rgba(47,30,16,0.14)] cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] w-full overflow-hidden bg-[#e5d4bc] relative">
                        <img
                          src={toWebpCover(item.cover_image_url)}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#241308]/55 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute top-3 left-3 text-[9.5px] font-cinzel uppercase tracking-[0.16em] font-semibold px-3 py-1 rounded-full bg-[#2f1d10]/90 text-[#f3d48c] border border-[#caa152]/60">
                          {item.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-3 text-[11px] text-[#8a5e38] mb-2">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#caa152]" />
                            {formattedDate}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#caa152]" />
                            {readMinutes} mnt baca
                          </span>
                        </div>

                        <h3 className="font-cormorant text-xl sm:text-[1.35rem] font-semibold text-[#241308] group-hover:text-[#8c5a24] transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#5c3e28] mt-2 leading-relaxed line-clamp-3">{item.excerpt}</p>
                      </div>
                    </div>

                    <div className="px-5 pb-4 pt-3 border-t border-[#f0e3cc] flex items-center justify-between">
                      <span className="text-[10.5px] font-cinzel tracking-[0.16em] uppercase font-semibold text-[#9b6e38] group-hover:text-[#2f1e10] flex items-center gap-1.5 transition-colors">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#caa152] transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQ */}
      <FAQSection onOpenWhatsAppHelp={handleOpenWhatsAppHelp} />

      <SectionWaveTransition fromColor="#e4d2b7" toColor="#382012" accentColor="#caa152" variant="wave" />
    </div>
  );
};
