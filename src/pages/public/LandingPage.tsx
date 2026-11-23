import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../../components/Hero';
import { About } from '../../components/About';
import { LogoMeaning } from '../../components/LogoMeaning';
import { Competitions } from '../../components/Competitions';
import { TimelineSection } from '../../components/TimelineSection';
import { FAQSection } from '../../components/FAQSection';
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

      {/* 2. ABOUT & THEME SECTION */}
      <About 
        onExploreComps={() => {
          const el = document.getElementById('kompetisi');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      {/* 3. LOGO MEANING & VISUAL IDENTITY */}
      <LogoMeaning />

      {/* 4. COMPETITIONS SHOWCASE (ESAI & MINI CASE) */}
      <Competitions onSelectCompetition={handleSelectCompetition} />

      {/* 5. TIMELINE & JADWAL RESMI */}
      <TimelineSection />

      {/* 6. FAQ (TANYA JAWAB RESMI) */}
      <FAQSection onOpenWhatsAppHelp={handleOpenWhatsAppHelp} />
    </div>
  );
};
