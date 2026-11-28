import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { BatikKawungPattern } from '../components/Ornaments';
import {
  LogOut,
  ShieldCheck,
  User,
  KeyRound,
  ArrowLeft,
  Menu,
  X,
  Award,
} from 'lucide-react';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface DashboardLayoutProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN') => void;
  children: React.ReactNode;
  navItems?: SidebarNavItem[];
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  onLogout,
  children,
  navItems,
  activeTab,
  onSelectTab,
}) => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isDarkHeader = currentUser.role === 'SUPERADMIN';

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'SUPERADMIN':
        return {
          label: 'SUPERADMIN',
          panelTitle: 'Superadmin Console',
          bg: 'bg-[#3b2412]',
          text: 'text-[#f3d48c]',
          border: 'border-[#caa152]',
          icon: <KeyRound className="w-3.5 h-3.5 text-[#caa152]" />,
        };
      case 'ADMIN':
        return {
          label: 'PANITIA ADMIN',
          panelTitle: 'Portal Panitia Admin',
          bg: 'bg-emerald-900',
          text: 'text-emerald-100',
          border: 'border-emerald-400/60',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />,
        };
      case 'JURI':
        return {
          label: 'DEWAN JURI',
          panelTitle: 'Panel Dewan Juri',
          bg: 'bg-indigo-900',
          text: 'text-indigo-100',
          border: 'border-indigo-400/60',
          icon: <Award className="w-3.5 h-3.5 text-[#caa152]" />,
        };
      default:
        return {
          label: 'PESERTA RESMI',
          panelTitle: 'Dashboard Peserta',
          bg: 'bg-[#f0e3cc]',
          text: 'text-[#2f1e10]',
          border: 'border-[#caa152]',
          icon: <User className="w-3.5 h-3.5 text-[#7a5530]" />,
        };
    }
  };

  const badge = getRoleBadge();

  return (
    <div
      className={`min-h-screen relative overflow-x-clip text-[#2f1e10] flex flex-col font-sans selection:bg-[#caa152]/30 selection:text-[#2f1e10] ${currentUser.role === 'SUPERADMIN'
        ? 'bg-[#f5ecde]'
        : currentUser.role === 'ADMIN' || currentUser.role === 'JURI'
          ? 'bg-[#f7f1e6]'
          : 'bg-[#fdf8ef]'
        }`}
    >
      <BatikKawungPattern color="#7a5530" opacity={0.04} id="kawung-dashboard" />

      {/* Top Navbar Header */}
      <header
        className={`sticky top-0 z-40 md:backdrop-blur-md border-b shadow-xs transition-colors ${isDarkHeader
          ? 'bg-[#24140a]/96 text-[#faf4e8] border-[#caa152]/40 border-t-2 border-t-[#caa152]'
          : currentUser.role === 'ADMIN'
            ? 'bg-[#fffdf9]/96 border-emerald-700/20 border-t-4 border-t-emerald-700'
            : currentUser.role === 'JURI'
              ? 'bg-[#fffdf9]/96 border-indigo-700/20 border-t-4 border-t-indigo-700'
              : 'bg-[#fffdf9]/96 border-[#caa152]/35 border-t-4 border-t-[#caa152]'
          }`}
      >
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {navItems && navItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className={`lg:hidden p-2 rounded-xl border transition-colors cursor-pointer ${isDarkHeader
                  ? 'text-[#f3d48c] border-[#caa152]/40 hover:bg-[#3b2412]'
                  : 'text-[#7a5530] border-[#ebdcc8] hover:bg-[#faf4e8] hover:text-[#2f1e10]'
                  }`}
                aria-label="Toggle Sidebar Menu"
              >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link
              to="/"
              className={`flex items-center gap-1.5 text-xs font-cinzel transition-colors px-2.5 py-1.5 rounded-lg shrink-0 ${isDarkHeader
                ? 'text-[#dec9ad] hover:text-[#fffdf9] hover:bg-[#3b2412]'
                : 'text-[#7a5530] hover:text-[#2f1e10] hover:bg-[#faf4e8]'
                }`}
              title="Kembali ke Beranda Publik"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#caa152]" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>

            <div className={`h-5 w-px shrink-0 ${isDarkHeader ? 'bg-[#caa152]/30' : 'bg-[#ebdcc8]'}`} />

            <Link to="/" className="flex items-center gap-2.5 select-none min-w-0">
              <img
                src="/Logo/00-logo-gabungan.svg"
                alt="Digiconomic Logo"
                className="h-8 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-poppins font-semibold text-base sm:text-lg leading-tight truncate ${isDarkHeader ? 'text-[#fffdf9]' : 'text-[#2f1e10]'
                    }`}
                >
                  Digiconomic
                </span>
                <span
                  className={`font-cinzel text-[8px] tracking-[0.22em] uppercase truncate ${isDarkHeader ? 'text-[#e3c47f]' : 'text-[#7a5530]'
                    }`}
                >
                  Portal Resmi 2027
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Role Badge & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-sans font-semibold tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </div>

            <div
              className={`flex items-center gap-2 pl-2 sm:border-l ${isDarkHeader ? 'sm:border-[#caa152]/30' : 'sm:border-[#ebdcc8]'
                }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border-2 border-[#caa152] object-cover shrink-0"
              />
              <div className="hidden md:flex flex-col text-left">
                <span
                  className={`text-xs font-semibold leading-tight truncate max-w-[140px] ${isDarkHeader ? 'text-[#fffdf9]' : 'text-[#2f1e10]'
                    }`}
                >
                  {currentUser.name}
                </span>
                <span
                  className={`text-[10px] truncate max-w-[140px] ${isDarkHeader ? 'text-[#dec9ad]' : 'text-[#7a5530]'
                    }`}
                >
                  {currentUser.email}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onLogout();
                navigate(currentUser.role === 'PESERTA' ? '/login' : '/panitia/login');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border flex items-center gap-1.5 cursor-pointer ${isDarkHeader
                ? 'text-[#f3d48c] border-[#caa152]/45 hover:bg-[#3b2412] hover:text-[#fffdf9]'
                : 'text-[#7a5530] border-[#ebdcc8] hover:text-[#2f1e10] hover:bg-[#faf4e8]'
                }`}
              title="Keluar dari Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar Layout */}
      <div className="flex-1 flex w-full relative">
        {navItems && navItems.length > 0 && (
          <>
            {isMobileSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}

            <aside
              className={`fixed lg:sticky top-16 z-35 h-[calc(100vh-4rem)] w-64 bg-[#fffdf9] border-r border-[#ebdcc8] flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out shrink-0 ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
                }`}
            >
              <div className="space-y-5">
                <div className="p-3.5 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-cinzel font-semibold tracking-wider text-[#7a5530] uppercase">
                      Panel Navigasi
                    </span>
                    <span className="text-[10px] text-[#caa152]">✦</span>
                  </div>
                  <p className="text-xs font-bold text-[#2f1e10] truncate">{badge.panelTitle}</p>
                  <p className="text-[11px] text-[#7a5530] truncate mt-0.5">{currentUser.name}</p>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (onSelectTab) onSelectTab(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${isActive
                          ? 'bg-[#2f1e10] text-[#f5eee2] shadow-xs font-semibold'
                          : 'text-[#7a5530] hover:bg-[#faf4e8] hover:text-[#2f1e10]'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isActive ? 'text-[#caa152]' : 'text-[#7a5530] group-hover:text-[#caa152]'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive
                              ? 'bg-[#caa152] text-[#2f1e10]'
                              : 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8]'
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#ebdcc8] text-center">
                <span className="text-[10px] font-cinzel text-[#caa152] tracking-wider uppercase block font-semibold mb-1">
                  Digiconomic Fest 2027
                </span>
                <p className="text-[9px] text-[#7a5530]">Portal Resmi GenBI × Bank Indonesia</p>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <footer className="border-t border-[#ebdcc8] bg-[#fffdf9]/80 py-4 text-center text-xs text-[#7a5530] font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2027 Digiconomic Fest · Portal Resmi Kompetisi GenBI × Bank Indonesia.</p>
          <div className="flex items-center gap-3 text-[11px]">
            <Link to="/kebijakan-privasi" className="hover:text-[#2f1e10] underline-offset-2 hover:underline">
              Kebijakan Privasi
            </Link>
            <span>•</span>
            <Link to="/syarat-ketentuan" className="hover:text-[#2f1e10] underline-offset-2 hover:underline">
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
