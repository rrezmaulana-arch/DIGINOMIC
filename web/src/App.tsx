import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { AuthApi, mapBackendUser } from './services/apiService';
import { UserProfile } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    AuthApi.me()
      .then((res) => {
        if (!active) return;
        setCurrentUser(res.user ? mapBackendUser(res.user) : null);
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('diginomic:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('diginomic:unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      // Abaikan gangguan jaringan saat logout
    }
    setCurrentUser(null);
  };

  const handleSwitchRole = () => {
    // Dinonaktifkan pada mode produksi
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#26160c] flex flex-col items-center justify-center">
        <img src="/Logo/00-logo-gabungan.svg" alt="Digiconomic" className="w-14 h-14 animate-pulse" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />
    </BrowserRouter>
  );
};

export default App;
