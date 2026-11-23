import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, LogOut, Menu, X, ShieldCheck, KeyRound } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenRegister: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onNavigate: (id: string) => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenRegister,
  onOpenDashboard,
  onOpenAdmin,
  onLogout,
  onNavigate,
}) => {
  const [drop, setDrop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { id: 'hero', label: 'HOME' },
    { id: 'tentang', label: 'EVENT' },
    { id: 'kompetisi', label: 'KOMPETISI' },
    { id: 'linimasa', label: 'LINIMASA' },
    { id: 'faq', label: 'FAQ' },
  ];

  const go = (id: string) => {
    setActiveTab(id);
    onNavigate(id);
    setDrop(false);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fcf9f2]/92 backdrop-blur-md border-b border-[#ebdcc8]/60 shadow-2xs py-2.5 px-6 sm:px-10 lg:px-16'
          : 'bg-transparent py-3 sm:py-4 px-6 sm:px-10 lg:px-16'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO & BRAND LOCKUP */}
        <button
          onClick={() => go('hero')}
          className="flex items-center gap-2.5 select-none text-left group"
        >
          <img
            src="/Logo/00-logo-gabungan.svg"
            alt="Logo"
            className="h-7 sm:h-8 w-auto object-contain filter drop-shadow-2xs"
          />
          <div className="flex flex-col">
            <span className="font-serif-disp text-base sm:text-lg text-[#2a170b] tracking-tight leading-none font-normal">
              Digiconomic
            </span>
            <span className="font-cinzel text-[8px] sm:text-[9px] text-[#9b6e38] tracking-[0.28em] uppercase mt-0.5 font-normal">
              FEST 2027
            </span>
          </div>
        </button>

        {/* MIDDLE NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {links.map((l) => {
            const isActive = activeTab === l.id;
            return (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={`relative py-1 font-cinzel text-[10px] sm:text-[11px] tracking-[0.22em] transition-colors ${
                  isActive
                    ? 'text-[#2a170b] font-medium'
                    : 'text-[#6e4e32] hover:text-[#2a170b] font-normal'
                }`}
              >
                <span>{l.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] text-[#caa152] leading-none">
                    ✦
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDrop(!drop)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-[#ebdcc8] text-xs font-sans text-[#2a170b] hover:bg-white transition-all shadow-2xs"
              >
                <img
                  src={currentUser.avatar}
                  className="w-5 h-5 rounded-full border border-[#caa152] object-cover"
                  alt=""
                />
                <span className="max-w-[100px] truncate font-medium">{currentUser.name}</span>
                <span className="text-[#9b6e38] text-[9px]">▾</span>
              </button>

              {drop && (
                <div className="absolute right-0 mt-2 w-56 bg-[#fffdf9] border-2 border-[#caa152] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in font-sans">
                  <div className="px-4 py-2 border-b border-[#ebdcc8] mb-1">
                    <p className="text-[10px] text-[#7a5530] font-sans uppercase tracking-wider font-semibold">
                      Akun {currentUser.role === 'SUPERADMIN' ? 'Superadmin' : currentUser.role === 'ADMIN' ? 'Panitia' : 'Peserta'}
                    </p>
                    <p className="text-xs font-semibold text-[#2f1e10] truncate">
                      {currentUser.name}
                    </p>
                  </div>

                  {/* PESERTA PORTAL LINK */}
                  {currentUser.role === 'PESERTA' && (
                    <button
                      onClick={() => {
                        setDrop(false);
                        onOpenDashboard();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#caa152]" />
                      <span>Dashboard Saya</span>
                    </button>
                  )}

                  {/* ADMIN PANITIA LINK */}
                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setDrop(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />
                      <span>Panel Admin Panitia</span>
                    </button>
                  )}

                  {/* SUPERADMIN LINKS */}
                  {currentUser.role === 'SUPERADMIN' && (
                    <>
                      <button
                        onClick={() => {
                          setDrop(false);
                          window.location.href = '/superadmin';
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>Portal Superadmin</span>
                      </button>
                      <button
                        onClick={() => {
                          setDrop(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>Panel Verifikasi Admin</span>
                      </button>
                    </>
                  )}

                  <div className="border-t border-[#ebdcc8] my-1" />
                  <button
                    onClick={() => {
                      setDrop(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#7a5530] hover:bg-[#faf4e8] flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#7a5530]" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRegister}
                className="px-4 py-1.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] font-sans text-xs font-semibold tracking-wide border border-[#caa152] transition-all"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  window.location.href = '/daftar';
                }}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-sans text-xs font-semibold tracking-wide shadow-xs active:scale-95"
              >
                Daftar Lomba
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#6e4e32] hover:bg-[#f0e3cc]/50"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-white/95 border border-[#ebdcc8] shadow-lg flex flex-col gap-2.5 animate-in fade-in">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`text-left px-3 py-2 rounded-lg font-cinzel text-xs tracking-widest ${
                activeTab === l.id
                  ? 'bg-[#f7efe0] text-[#2a170b] font-medium'
                  : 'text-[#6e4e32] font-normal hover:bg-[#faf5ec]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
