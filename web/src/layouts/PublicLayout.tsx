import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MagicMotionLines } from '../components/MagicMotionLines';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface PublicLayoutProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
  children,
}) => {
  const navigate = useNavigate();

  const handleNavigate = (target: string) => {
    // Jika target diawali '/' (misalnya '/event' atau '/news'), pindah halaman penuh
    if (target.startsWith('/')) {
      navigate(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Jika target berupa section ID di Landing Page ('hero', 'kompetisi', 'linimasa', dll.)
    if (window.location.pathname !== '/') {
      navigate('/#' + target);
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8ef] text-[#2a1a0e] relative overflow-x-hidden selection:bg-[#caa152]/30 selection:text-[#2f1e10]">
      {/* Dynamic Background Motion Lines */}
      <MagicMotionLines />

      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenRegister={() => navigate('/login')}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenAdmin={() => navigate('/admin')}
        onLogout={onLogout}
        onNavigate={handleNavigate}
        onSwitchRole={onSwitchRole}
      />

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPrivacy={() => alert('Kebijakan Privasi Digiconomic Fest 2027: Data peserta hanya digunakan untuk keperluan verifikasi dan korespondensi kompetisi resmi.')}
        onOpenTerms={() => alert('Syarat & Ketentuan: Setiap peserta wajib mahasiswa/siswa aktif, menjunjung tinggi integritas ilmiah, serta orisinalitas karya tanpa plagiarisme.')}
      />
    </div>
  );
};