import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UserProfile } from '../types';
import {
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  KeyRound,
  ChevronDown,
  FileText,
  Briefcase,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenRegister: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onNavigate: (target: string) => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN') => void;
}

interface NavLinkItem {
  id: string;
  label: string;
  target: string;
}

// Pola B Ringkas — 4 menu utama murni multi-page (konsisten di semua halaman)
const NAV_LINKS: NavLinkItem[] = [
  { id: 'home', label: 'HOME', target: '/' },
  { id: 'event', label: 'EVENT', target: '/event' },
  { id: 'kompetisi', label: 'KOMPETISI', target: '/kompetisi' },
  { id: 'news', label: 'NEWS', target: '/news' },
];

const COMPETITION_SUBMENU = [
  {
    title: 'Esai',
    subtitle: 'Kategori Tim (Maks. 3 Orang) • Pelajar & Mahasiswa',
    target: '/kompetisi/esai-nasional',
    icon: FileText,
  },
  {
    title: 'Mini Case Competition',
    subtitle: 'Kategori Tim (Maks. 3 Orang) • Mahasiswa',
    target: '/kompetisi/mini-case-competition',
    icon: Briefcase,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenRegister,
  onOpenDashboard,
  onOpenAdmin,
  onLogout,
  onNavigate,
}) => {
  const location = useLocation();
  const [drop, setDrop] = useState(false);
  const [compDropdownOpen, setCompDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Tentukan tab aktif otomatis langsung dari URL aktif (100% konsisten)
  const getActiveTab = (pathname: string): string => {
    if (pathname.startsWith('/event')) return 'event';
    if (pathname.startsWith('/kompetisi') || pathname.startsWith('/juklak-juknis')) return 'kompetisi';
    if (pathname.startsWith('/news')) return 'news';
    return 'home';
  };

  const activeTab = getActiveTab(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
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

  const goTo = (target: string) => {
    onNavigate(target);
    setDrop(false);
    setCompDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-10 pt-3 sm:pt-4 pointer-events-none">
        <div
          className={`pointer-events-auto max-w-6xl mx-auto flex items-center justify-between gap-2 rounded-full transition-all duration-300 ease-out px-4 sm:px-6 ${isScrolled
            ? 'bg-[#fffdf9]/96 md:bg-[#fffdf9]/88 md:backdrop-blur-md border border-[#caa152]/45 shadow-[0_12px_36px_-12px_rgba(47,30,16,0.22)] py-2'
            : 'bg-[#fffdf9]/94 md:bg-[#fffdf9]/78 md:backdrop-blur-sm border border-[#d8be99]/50 shadow-[0_6px_24px_-10px_rgba(47,30,16,0.12)] py-2.5'
            }`}
        >

          {/* LOGO & BRAND LOCKUP */}
          <button
            onClick={() => goTo('/')}
            className="flex items-center gap-2.5 select-none text-left group shrink-0 px-1.5 py-0.5 -ml-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#f4ead9]/75 active:scale-[0.98]"
          >
            <img
              src="/Logo/00-logo-gabungan.svg"
              alt="Logo"
              className="h-6.5 sm:h-8 w-auto object-contain filter drop-shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-rotate-6 group-hover:drop-shadow-[0_4px_10px_rgba(202,161,82,0.5)]"
            />
            <div className="flex flex-col">
              <span className="font-poppins font-semibold text-sm sm:text-lg text-[#2a170b] group-hover:text-[#7a4b18] tracking-tight leading-none transition-colors duration-300">
                Digiconomic
              </span>
              <span className="relative font-cinzel text-[7px] sm:text-[9px] text-[#9b6e38] group-hover:text-[#b88636] tracking-[0.26em] group-hover:tracking-[0.31em] uppercase mt-0.5 font-normal transition-all duration-300">
                FEST 2027
                <span className="block h-[1.5px] w-0 group-hover:w-full bg-gradient-to-r from-[#caa152] via-[#e8c47a] to-transparent transition-all duration-350 ease-out mt-0.5 rounded-full" />
              </span>
            </div>
          </button>

          {/* MIDDLE NAVIGATION LINKS — Clean 4-Item Floating Pill Nav + Hover Dropdown Kompetisi */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-[#f4ead9]/75 p-1 rounded-full border border-[#e3d1b7]/80">
            {NAV_LINKS.map((l) => {
              const isActive = activeTab === l.id;

              if (l.id === 'kompetisi') {
                return (
                  <div
                    key={l.id}
                    className="relative"
                    onMouseEnter={() => setCompDropdownOpen(true)}
                    onMouseLeave={() => setCompDropdownOpen(false)}
                  >
                    <button
                      onClick={() => goTo(l.target)}
                      className={`relative inline-flex items-center gap-1 px-4 lg:px-5 py-1.5 rounded-full font-cinzel text-[10px] lg:text-[11px] tracking-[0.18em] transition-all duration-250 ${isActive
                        ? 'bg-[#3b2412] text-[#faf4e8] font-semibold shadow-xs'
                        : 'text-[#5c3e28] hover:text-[#241308] hover:bg-[#fffdf9]/85 font-medium'
                        }`}
                    >
                      <span>{l.label}</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${compDropdownOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Hover Dropdown 2 Cabang Lomba (dengan bridge pt-2 agar tidak putus saat kursor turun) */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full pt-2.5 w-72 transition-all duration-200 origin-top ${compDropdownOpen
                        ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
                        : 'opacity-0 scale-95 pointer-events-none -translate-y-1'
                        }`}
                    >
                      <div className="rounded-2xl bg-[#fffdf9]/98 md:backdrop-blur-md border border-[#caa152]/55 shadow-[0_18px_40px_-14px_rgba(47,30,16,0.28)] p-2 space-y-1">
                        <p className="px-3 pt-1 pb-1 font-cinzel text-[9px] tracking-[0.2em] uppercase text-[#8a5e38] font-semibold">
                          2 Cabang Kompetisi Resmi
                        </p>

                        {COMPETITION_SUBMENU.map((item) => {
                          const Icon = item.icon;
                          const isSubActive = location.pathname === item.target;
                          return (
                            <button
                              key={item.target}
                              onClick={() => goTo(item.target)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-all ${isSubActive
                                ? 'bg-[#f4ead9] border border-[#caa152]/50'
                                : 'hover:bg-[#faf4e8]'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#2f1d10] border border-[#caa152]/50 flex items-center justify-center shrink-0 mt-0.5">
                                <Icon className="w-4 h-4 text-[#f3d48c]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-cormorant text-base text-[#241308] font-semibold leading-tight">
                                  {item.title}
                                </p>
                                <p className="font-sans text-[10.5px] text-[#7a5530] mt-0.5 leading-snug">
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          );
                        })}

                        <div className="border-t border-[#ebdcc8] pt-1.5 mt-1 flex items-center justify-between gap-1 px-1">
                          <button
                            onClick={() => goTo('/kompetisi')}
                            className="flex-1 text-center py-1.5 rounded-lg text-[10px] font-cinzel tracking-[0.14em] uppercase text-[#5c3e28] hover:bg-[#f4ead9] font-semibold transition-colors"
                          >
                            Semua Lomba
                          </button>
                          <button
                            onClick={() => goTo('/juklak-juknis')}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-cinzel tracking-[0.14em] uppercase text-[#8a5e38] hover:bg-[#f4ead9] font-semibold transition-colors"
                          >
                            <BookOpen className="w-3 h-3 text-[#caa152]" />
                            <span>Juklak</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={l.id}
                  onClick={() => goTo(l.target)}
                  className={`relative px-4 lg:px-5 py-1.5 rounded-full font-cinzel text-[10px] lg:text-[11px] tracking-[0.18em] transition-all duration-250 ${isActive
                    ? 'bg-[#3b2412] text-[#faf4e8] font-semibold shadow-xs'
                    : 'text-[#5c3e28] hover:text-[#241308] hover:bg-[#fffdf9]/85 font-medium'
                    }`}
                >
                  <span>{l.label}</span>
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
                        Akun {currentUser.role === 'SUPERADMIN' ? 'Superadmin' : currentUser.role === 'ADMIN' ? 'Panitia' : currentUser.role === 'JURI' ? 'Dewan Juri' : 'Peserta'}
                      </p>
                      <p className="text-xs font-semibold text-[#2f1e10] truncate">{currentUser.name}</p>
                    </div>

                    {currentUser.role === 'PESERTA' && (
                      <button
                        onClick={() => { setDrop(false); onOpenDashboard(); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>Dashboard Saya</span>
                      </button>
                    )}

                    {(currentUser.role === 'ADMIN' || currentUser.role === 'JURI') && (
                      <button
                        onClick={() => { setDrop(false); onNavigate('/admin'); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>{currentUser.role === 'JURI' ? 'Panel Dewan Juri' : 'Panel Admin Panitia'}</span>
                      </button>
                    )}

                    {currentUser.role === 'SUPERADMIN' && (
                      <>
                        <button
                          onClick={() => { setDrop(false); onNavigate('/superadmin'); }}
                          className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#caa152]" />
                          <span>Portal Superadmin</span>
                        </button>
                        <button
                          onClick={() => { setDrop(false); onNavigate('/admin'); }}
                          className="w-full text-left px-4 py-2 text-xs text-[#2f1e10] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />
                          <span>Panel Verifikasi Admin</span>
                        </button>
                      </>
                    )}

                    <div className="border-t border-[#ebdcc8] my-1" />
                    <button
                      onClick={() => { setDrop(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 text-xs text-[#7a5530] hover:bg-[#faf4e8] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#7a5530]" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] font-sans text-xs font-semibold tracking-wide border border-[#caa152] transition-all duration-200 cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={() => goTo('/login')}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-sans text-xs font-semibold tracking-wide shadow-xs hover:shadow transition-all duration-200 active:scale-95 cursor-pointer"
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
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-[#fffdf9] border-l border-[#ebdcc8] shadow-2xl flex flex-col md:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ebdcc8]">
              <div className="flex items-center gap-2">
                <img src="/Logo/00-logo-gabungan.svg" alt="Logo" className="h-7 w-auto" />
                <div>
                  <span className="font-poppins font-semibold text-sm text-[#2a170b] leading-none block">Digiconomic</span>
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

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <div key={l.id}>
                  <button
                    onClick={() => goTo(l.target)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-cinzel text-xs tracking-widest transition-all duration-200 flex items-center gap-3 ${activeTab === l.id
                      ? 'bg-gradient-to-r from-[#f7ede0] to-[#faf5ec] text-[#2a170b] font-semibold border-l-2 border-[#caa152]'
                      : 'text-[#6e4e32] font-normal hover:bg-[#faf5ec]'
                      }`}
                  >
                    {activeTab === l.id && <span className="text-[#caa152] text-[8px]">✦</span>}
                    {l.label}
                  </button>

                  {/* Submenu 2 Cabang Lomba di Mobile */}
                  {l.id === 'kompetisi' && (
                    <div className="pl-5 pr-2 py-1 space-y-1">
                      {COMPETITION_SUBMENU.map((sub) => (
                        <button
                          key={sub.target}
                          onClick={() => goTo(sub.target)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-sans transition-colors flex items-center justify-between ${location.pathname === sub.target
                            ? 'bg-[#f4ead9] text-[#2a170b] font-semibold'
                            : 'text-[#7a5530] hover:bg-[#faf5ec]'
                            }`}
                        >
                          <span>{sub.title}</span>
                          <span className="text-[10px] text-[#caa152]">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {!currentUser && (
              <div className="px-4 py-4 border-t border-[#ebdcc8] space-y-2.5">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
                  className="w-full py-2.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] font-cinzel text-xs font-semibold tracking-wider border border-[#caa152] transition-all"
                >
                  Masuk
                </button>
                <button
                  onClick={() => goTo('/login')}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] text-white font-cinzel text-xs font-semibold tracking-wider shadow-xs active:scale-95 transition-all"
                >
                  Daftar Lomba
                </button>
              </div>
            )}

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