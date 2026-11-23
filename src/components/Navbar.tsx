import React, { useState, useEffect, useRef } from 'react';
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
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${
          isScrolled
            ? 'bg-[#fcf9f2]/94 backdrop-blur-md border-b border-[#ebdcc8]/60 shadow-xs py-2 px-4 sm:px-8 lg:px-16'
            : 'bg-transparent py-3 sm:py-4 px-4 sm:px-8 lg:px-16'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

          {/* LOGO & BRAND LOCKUP */}
          <button
            onClick={() => go('hero')}
            className="flex items-center gap-2 select-none text-left group shrink-0"
          >
            <img
              src="/Logo/00-logo-gabungan.svg"
              alt="Logo"
              className="h-6.5 sm:h-8 w-auto object-contain filter drop-shadow-2xs"
            />
            <div className="flex flex-col">
              <span className="font-serif-disp text-sm sm:text-lg text-[#2a170b] tracking-tight leading-none font-normal">
                Digiconomic
              </span>
              <span className="font-cinzel text-[7px] sm:text-[9px] text-[#9b6e38] tracking-[0.26em] uppercase mt-0.5 font-normal">
                FEST 2027
              </span>
            </div>
          </button>

          {/* MIDDLE NAVIGATION LINKS — Desktop only */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-9">
            {links.map((l) => {
              const isActive = activeTab === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className={`relative py-1 font-cinzel text-[10px] sm:text-[11px] tracking-[0.22em] transition-colors duration-200 ${
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
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDrop(!drop)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/85 border border-[#ebdcc8] text-xs font-sans text-[#2a170b] hover:bg-white transition-all shadow-2xs"
                >
                  <img
                    src={currentUser.avatar}
                    className="w-5 h-5 rounded-full border border-[#caa152] object-cover"
                    alt=""
                  />
                  <span className="hidden sm:inline max-w-[80px] truncate font-medium">{currentUser.name}</span>
                  <span className="text-[#9b6e38] text-[9px]">▾</span>
                </button>

                {drop && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#fffdf9] border-2 border-[#caa152] rounded-2xl shadow-xl py-2 z-50 font-sans">
                    <div className="px-4 py-2 border-b border-[#ebdcc8] mb-1">
                      <p className="text-[10px] text-[#7a5530] uppercase tracking-wider font-semibold">
                        Akun {currentUser.role === 'SUPERADMIN' ? 'Superadmin' : currentUser.role === 'ADMIN' ? 'Panitia' : 'Peserta'}
                      </p>
                      <p className="text-xs font-semibold text-[#2f1e10] truncate">{currentUser.name}</p>
                    </div>

                    {currentUser.role === 'PESERTA' && (
                      <button
                        onClick={() => { setDrop(false); onOpenDashboard(); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>Dashboard Saya</span>
                      </button>
                    )}

                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => { setDrop(false); onOpenAdmin(); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>Panel Admin Panitia</span>
                      </button>
                    )}

                    {currentUser.role === 'SUPERADMIN' && (
                      <>
                        <button
                          onClick={() => { setDrop(false); window.location.href = '/superadmin'; }}
                          className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#caa152]" />
                          <span>Portal Superadmin</span>
                        </button>
                        <button
                          onClick={() => { setDrop(false); onOpenAdmin(); }}
                          className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />
                          <span>Panel Verifikasi Admin</span>
                        </button>
                      </>
                    )}

                    <div className="border-t border-[#ebdcc8] my-1" />
                    <button
                      onClick={() => { setDrop(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 text-xs text-[#7a5530] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#7a5530]" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons — compact on mobile */
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] font-sans text-xs font-semibold tracking-wide border border-[#caa152] transition-all duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => { window.location.href = '/daftar'; }}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-sans text-xs font-semibold tracking-wide shadow-xs hover:shadow transition-all duration-200 active:scale-95"
                >
                  Daftar Lomba
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#6e4e32] hover:bg-[#f0e3cc]/60 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />
              }
            </button>
          </div>

        </div>
      </header>

      {/* ── MOBILE FULLSCREEN DRAWER ── */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-[#fffdf9] border-l border-[#ebdcc8] shadow-2xl flex flex-col md:hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ebdcc8]">
              <div className="flex items-center gap-2">
                <img src="/Logo/00-logo-gabungan.svg" alt="Logo" className="h-7 w-auto" />
                <div>
                  <span className="font-serif-disp text-sm text-[#2a170b] leading-none block">Digiconomic</span>
                  <span className="font-cinzel text-[7px] text-[#9b6e38] tracking-[0.24em] uppercase">FEST 2027</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#6e4e32] hover:bg-[#f0e3cc]/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-cinzel text-xs tracking-widest transition-all duration-200 flex items-center gap-3 ${
                    activeTab === l.id
                      ? 'bg-gradient-to-r from-[#f7ede0] to-[#faf5ec] text-[#2a170b] font-semibold border-l-2 border-[#caa152]'
                      : 'text-[#6e4e32] font-normal hover:bg-[#faf5ec]'
                  }`}
                >
                  {activeTab === l.id && <span className="text-[#caa152] text-[8px]">✦</span>}
                  {l.label}
                </button>
              ))}
            </nav>

            {/* Mobile CTA Buttons (shown when guest) */}
            {!currentUser && (
              <div className="px-4 py-4 border-t border-[#ebdcc8] space-y-2.5">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
                  className="w-full py-2.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] font-cinzel text-xs font-semibold tracking-wider border border-[#caa152] transition-all"
                >
                  Masuk
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); window.location.href = '/daftar'; }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs font-semibold tracking-wider shadow-xs active:scale-95 transition-all"
                >
                  Daftar Lomba
                </button>
              </div>
            )}

            {/* Mobile user action (shown when logged in) */}
            {currentUser && (
              <div className="px-4 py-4 border-t border-[#ebdcc8]">
                <div className="flex items-center gap-2.5 mb-3">
                  <img src={currentUser.avatar} className="w-8 h-8 rounded-full border-2 border-[#caa152] object-cover" alt="" />
                  <div>
                    <p className="font-sans font-semibold text-xs text-[#2f1e10] truncate max-w-[160px]">{currentUser.name}</p>
                    <p className="font-cinzel text-[9px] text-[#7a5530] tracking-wider uppercase">{currentUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full py-2 rounded-full border border-[#ebdcc8] text-[#7a5530] font-cinzel text-xs tracking-wider hover:bg-[#faf4e8] transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar Akun
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
