import React from 'react';
import { BatikCursorTrail } from '../components/BatikCursorTrail';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MagicMotionLines } from '../components/MagicMotionLines';
import { UserProfile } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

interface PublicLayoutProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN') => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
  children,
}) => {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  React.useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [pathname, hash]);

  const handleNavigate = (target: string) => {
    if (target.startsWith('/')) {
      navigate(target);
      window.scrollTo({ top: 0 });
      return;
    }

    if (window.location.pathname !== '/') {
      navigate('/#' + target);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8ef] text-[#2a1a0e] relative overflow-x-clip selection:bg-[#caa152]/30 selection:text-[#2f1e10]">
      <MagicMotionLines />
      <BatikCursorTrail />

      <Navbar
        currentUser={currentUser}
        onOpenRegister={() => navigate('/login')}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenAdmin={() => navigate(currentUser?.role === 'SUPERADMIN' ? '/superadmin' : '/admin')}
        onLogout={onLogout}
        onNavigate={handleNavigate}
        onSwitchRole={onSwitchRole}
      />

      <main className="relative z-10">{children}</main>

      <Footer
        onNavigate={handleNavigate}
        onOpenPrivacy={() => {
          navigate('/kebijakan-privasi');
          window.scrollTo({ top: 0 });
        }}
        onOpenTerms={() => {
          navigate('/syarat-ketentuan');
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
};
