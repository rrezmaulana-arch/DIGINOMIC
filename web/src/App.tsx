import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { RegistrationService } from './services/registrationService';
import { UserProfile, Registration } from './types';

export const App: React.FC = () => {
  // Sesi pengguna: Bawaan bernilai null (Guest/Tamu).
  // Pengguna harus secara eksplisit login atau mendaftar untuk membuat sesi demo.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('digi_current_user_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.id !== 'guest') return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca sesi pengguna dari localStorage:', e);
    }
    return null; // Guest secara default
  });

  useEffect(() => {
    if (currentUser) {
      RegistrationService.setCurrentUser(currentUser);
    } else {
      localStorage.removeItem('digi_current_user_v2');
    }
  }, [currentUser]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    RegistrationService.setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('digi_current_user_v2');
  };

  const handleSwitchRole = (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => {
    // Mode switcher simulasi demo
    let name = 'Budi Santoso (Demo Peserta)';
    let email = 'demo.peserta@diginomic.id';
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

    if (role === 'ADMIN') {
      name = 'Andi Pratama (Demo Admin)';
      email = 'admin.lomba@diginomic.id';
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256';
    } else if (role === 'SUPERADMIN') {
      name = 'Ketua Steering Committee (Demo Superadmin)';
      email = 'superadmin@diginomic.id';
      avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256';
    }

    const updated: UserProfile = {
      id: role === 'PESERTA' ? 'usr-demo-peserta' : role === 'ADMIN' ? 'adm-1' : 'adm-super',
      name,
      email,
      avatar,
      role,
    };

    setCurrentUser(updated);
    RegistrationService.setCurrentUser(updated);
  };

  const handleRegisterSuccess = (newReg: Registration, user: UserProfile) => {
    setCurrentUser(user);
    RegistrationService.setCurrentUser(user);
  };

  return (
    <BrowserRouter>
      <AppRoutes
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </BrowserRouter>
  );
};

export default App;
