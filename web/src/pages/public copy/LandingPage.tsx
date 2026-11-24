import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../../components/Hero';
import { About } from '../../components/About';
import { LogoMeaning } from '../../components/LogoMeaning';
import { Competitions } from '../../components/Competitions';
import { PrizeBenefitsSection } from '../../components/PrizeBenefitsSection';
import { TimelineSection } from '../../components/TimelineSection';
import { GallerySection } from '../../components/GallerySection';
import { FAQSection } from '../../components/FAQSection';
import { SectionWaveTransition } from '../../components/Ornaments';
import { Competition } from '../../types';
import { RegistrationService } from '../../services/registrationService';

interface LandingPageProps {
  onSelectCompetition?: (comp: Competition) => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const navigate = useNavigate();

  const handleSelectCompetition = (comp: Competition) => {
    navigate(`/daftar?lomba=${comp.id}`);
  };

  const handleExploreDetail = (comp: Competition) => {
    navigate(`/kompetisi/${comp.slug}`);
  };

  const handleOpenWhatsAppHelp = () => {
    window.open(RegistrationService.buildWhatsAppHelpdeskUrl(), '_blank');
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

      <SectionWaveTransition fromColor="#fdf8ef" toColor="#f3e6d3" variant="mist" />

      {/* 2. ABOUT & THEME SECTION (Warm Linen Parchment) */}
      <About
        onExploreComps={() => {
          const el = document.getElementById('kompetisi');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#2f1d10" accentColor="#caa152" variant="ridge" />

      {/* 3. LOGO MEANING & VISUAL IDENTITY (Deep Royal Espresso) */}
      <LogoMeaning />

      <SectionWaveTransition fromColor="#1f1209" toColor="#efe2ce" accentColor="#caa152" variant="cloud" />

      {/* 4. COMPETITIONS SHOWCASE (Warm Sand + Royal Pavilion) */}
      <Competitions
        onSelectCompetition={handleSelectCompetition}
        onExploreDetail={handleExploreDetail}
      />

      <SectionWaveTransition fromColor="#ebdcc5" toColor="#f3e6d3" variant="mist" />

      {/* 5. PRIZES & BENEFITS (Warm Parchment + Dark Espresso Banner) */}
      <PrizeBenefitsSection />

      <SectionWaveTransition fromColor="#efe1cc" toColor="#2b1a0e" accentColor="#caa152" variant="ridge" />

      {/* 6. TIMELINE S-CURVE (Deep Royal Espresso) */}
      <TimelineSection />

      <SectionWaveTransition fromColor="#1e1108" toColor="#faf4e8" accentColor="#caa152" variant="cloud" />

      {/* 7. KILAS BALIK & GALERI 2025 (Soft Paper) */}
      <GallerySection />

      <SectionWaveTransition fromColor="#efe3d0" toColor="#efe3d0" variant="mist" />

      {/* 8. FAQ (Warm Parchment -> Espresso Footer) */}
      <FAQSection onOpenWhatsAppHelp={handleOpenWhatsAppHelp} />

      <SectionWaveTransition fromColor="#e4d2b7" toColor="#382012" accentColor="#caa152" variant="wave" />
    </div>
  );
};
