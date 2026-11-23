import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { PageTransitionOverlay } from '../components/PageTransitionOverlay';
import { BatikCursorTrail } from '../components/BatikCursorTrail';
import { UserProfile, Registration } from '../types';

// Lazy load pages for code splitting
const LandingPage = React.lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const CompetitionDetailPage = React.lazy(() => import('../pages/public/CompetitionDetailPage').then(m => ({ default: m.CompetitionDetailPage })));
const JuklakJuknisPage = React.lazy(() => import('../pages/public/JuklakJuknisPage').then(m => ({ default: m.JuklakJuknisPage })));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ParticipantDashboardPage = React.lazy(() => import('../pages/participant/ParticipantDashboardPage').then(m => ({ default: m.ParticipantDashboardPage })));
const AdminDashboardPage = React.lazy(() => import('../pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const SuperAdminDashboardPage = React.lazy(() => import('../pages/superadmin/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage })));

interface AppRoutesProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onSwitchRole: (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => void;
  onRegisterSuccess: (reg: Registration, user: UserProfile) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onSwitchRole,
  onRegisterSuccess,
}) => {
  const isGuest = !currentUser || currentUser.id === 'guest';
  const role = currentUser?.role;

  return (
    <>
      {/* Animasi logo transisi setiap kali berpindah halaman */}
      <PageTransitionOverlay />
      <BatikCursorTrail />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#26160c] flex flex-col items-center justify-center">
            <img src="/Logo/00-logo-gabungan.svg" alt="Digiconomic" className="w-14 h-14 animate-pulse" />
          </div>
        }
      >
        <Routes>
          {/* 1. PUBLIC LANDING PAGE (With Navbar & Footer) */}
          <Route
            path="/"
            element={
              <PublicLayout
                currentUser={currentUser}
                onLogout={onLogout}
                onSwitchRole={onSwitchRole}
              >
                <LandingPage />
              </PublicLayout>
            }
          />

          {/* 1B. DEDICATED COMPETITION DETAIL PAGE */}
          <Route
            path="/kompetisi/:slug"
            element={
              <PublicLayout
                currentUser={currentUser}
                onLogout={onLogout}
                onSwitchRole={onSwitchRole}
              >
                <CompetitionDetailPage />
              </PublicLayout>
            }
          />

          {/* 1C. DEDICATED JUKLAK & JUKNIS PAGE */}
          <Route
            path="/juklak-juknis"
            element={
              <PublicLayout
                currentUser={currentUser}
                onLogout={onLogout}
                onSwitchRole={onSwitchRole}
              >
                <JuklakJuknisPage />
              </PublicLayout>
            }
          />

          {/* 2. AUTHENTICATION */}
          <Route
            path="/login"
            element={<LoginPage onLogin={onLogin} />}
          />

          <Route
            path="/daftar"
            element={<RegisterPage onRegisterSuccess={onRegisterSuccess} />}
          />

          {/* 3. DEDICATED PARTICIPANT DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              isGuest ? (
                <Navigate to="/login" replace />
              ) : (
                <ParticipantDashboardPage
                  currentUser={currentUser!}
                  onLogout={onLogout}
                  onSwitchRole={onSwitchRole}
                />
              )
            }
          />

          {/* 4. DEDICATED PANITIA ADMIN DASHBOARD */}
          <Route
            path="/admin"
            element={
              isGuest ? (
                <Navigate to="/login" replace />
              ) : role === 'PESERTA' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AdminDashboardPage
                  currentUser={currentUser!}
                  onLogout={onLogout}
                  onSwitchRole={onSwitchRole}
                />
              )
            }
          />

          {/* 5. DEDICATED SUPERADMIN CONTROL PORTAL */}
          <Route
            path="/superadmin"
            element={
              isGuest ? (
                <Navigate to="/login" replace />
              ) : role !== 'SUPERADMIN' ? (
                <Navigate to="/admin" replace />
              ) : (
                <SuperAdminDashboardPage
                  currentUser={currentUser!}
                  onLogout={onLogout}
                  onSwitchRole={onSwitchRole}
                />
              )
            }
          />

          {/* 6. WILDCARD FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};
