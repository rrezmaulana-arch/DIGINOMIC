import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';
import {
  LogOut,
  Home,
  ShieldCheck,
  User,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Menu,
  X,
  FileText,
  Award,
  BarChart3,
  Radio,
  Settings,
  Users,
  Activity,
  Layers,
  ChevronRight
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
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => void;
  children: React.ReactNode;
  navItems?: SidebarNavItem[];
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
  children,
  navItems,
  activeTab,
  onSelectTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'SUPERADMIN':
        return {
          label: 'SUPERADMIN',
          bg: 'bg-[#2f1e10]',
          text: 'text-[#caa152]',
          border: 'border-[#caa152]',
          icon: <KeyRound className="w-3.5 h-3.5 text-[#caa152]" />
        };
      case 'ADMIN':
        return {
          label: 'PANITIA ADMIN',
          bg: 'bg-[#7a5530]',
          text: 'text-[#f5eee2]',
          border: 'border-[#caa152]/60',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#caa152]" />
        };
      default:
        return {
          label: 'PESERTA RESMI',
          bg: 'bg-[#f0e3cc]',
          text: 'text-[#2f1e10]',
          border: 'border-[#caa152]',
          icon: <User className="w-3.5 h-3.5 text-[#7a5530]" />
        };
    }
  };

  const badge = getRoleBadge();

  return (
    <div className="min-h-screen bg-[#fdf8ef] text-[#2f1e10] flex flex-col font-sans selection:bg-[#caa152]/30 selection:text-[#2f1e10]">
      
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#fffdf9]/95 backdrop-blur-md border-b border-[#ebdcc8] shadow-2xs">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-3">
            {navItems && navItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-[#7a5530] hover:bg-[#faf4e8] hover:text-[#2f1e10] border border-[#ebdcc8]"
                aria-label="Toggle Sidebar Menu"
              >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-cinzel text-[#7a5530] hover:text-[#2f1e10] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#faf4e8]"
              title="Kembali ke Beranda Publik"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#caa152]" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>

            <div className="h-5 w-px bg-[#ebdcc8]" />

            <Link to="/" className="flex items-center gap-2.5 select-none">
              <img
                src="/Logo/00-logo-gabungan.svg"
                alt="Digiconomic Logo"
                className="h-8 w-auto object-contain filter drop-shadow-2xs"
              />
              <div className="flex flex-col">
                <span className="font-cormorant text-lg font-normal text-[#2f1e10] leading-none">
                  Digiconomic
                </span>
                <span className="font-cinzel text-[8px] text-[#7a5530] tracking-[0.22em] uppercase">
                  Portal Resmi 2027
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Role Badge & Profile */}
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-sans font-semibold tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>

            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-[#ebdcc8]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border-2 border-[#caa152] object-cover"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#2f1e10] leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#7a5530] truncate max-w-[130px]">
                  {currentUser.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                navigate('/login');
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#7a5530] hover:text-[#2f1e10] hover:bg-[#faf4e8] transition-colors border border-[#ebdcc8] flex items-center gap-1.5"
              title="Keluar dari Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Demo Notice Banner */}
      <div className="bg-[#faf4e8] border-b border-[#ebdcc8] py-1.5 px-4 text-center text-xs text-[#7a5530] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#caa152] shrink-0" />
        <span className="text-[11px] sm:text-xs">
          <strong className="font-semibold text-[#2f1e10]">Mode Demo Prototipe:</strong> Data tersimpan secara lokal pada browser ini.
        </span>
      </div>

      {/* Main Body with Sidebar Layout */}
      <div className="flex-1 flex w-full relative">

        {/* SIDEBAR NAVIGATION (Desktop & Mobile) */}
        {navItems && navItems.length > 0 && (
          <>
            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}

            <aside className={`
              fixed lg:sticky top-16 z-35 h-[calc(100vh-4rem)] w-64 bg-[#fffdf9] border-r border-[#ebdcc8] flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out shrink-0
              ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            `}>
              <div className="space-y-6">
                
                {/* User Section Info */}
                <div className="p-3.5 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-cinzel font-semibold tracking-wider text-[#7a5530] uppercase">
                      Panel Navigasi
                    </span>
                    <span className="text-[10px] text-[#caa152]">✦</span>
                  </div>
                  <p className="text-xs font-bold text-[#2f1e10] truncate">
                    {currentUser.role === 'PESERTA' ? 'Dashboard Peserta' : currentUser.role === 'ADMIN' ? 'Portal Panitia Admin' : 'Superadmin Console'}
                  </p>
                  <p className="text-[10px] text-[#7a5530] truncate mt-0.5">
                    {currentUser.name}
                  </p>
                </div>

                {/* Navigation Links */}
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
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-[#2f1e10] text-[#f5eee2] shadow-xs font-semibold'
                            : 'text-[#7a5530] hover:bg-[#faf4e8] hover:text-[#2f1e10]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`${isActive ? 'text-[#caa152]' : 'text-[#7a5530] group-hover:text-[#caa152]'}`}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-[#caa152] text-[#2f1e10]'
                              : 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

              </div>

              {/* Sidebar Footer Info */}
              <div className="pt-4 border-t border-[#ebdcc8] text-center">
                <span className="text-[10px] font-cinzel text-[#caa152] tracking-wider uppercase block font-semibold mb-1">
                  Digiconomic Fest 2027
                </span>
                <p className="text-[9px] text-[#7a5530]">
                  Versi Prototipe 2.0 (Simulasi)
                </p>
              </div>

            </aside>
          </>
        )}

        {/* Content Area */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

      {/* Footer */}
      <footer className="border-t border-[#ebdcc8] bg-[#fffdf9]/70 py-4 text-center text-xs text-[#7a5530] font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2027 Digiconomic Fest — Portal Resmi Kompetisi Bank Indonesia.</p>
          <p className="text-[11px] text-[#7a5530]">Departemen Ekonomi & Keuangan Digital</p>
        </div>
      </footer>
    </div>
  );
};
