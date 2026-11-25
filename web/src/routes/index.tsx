import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { PageTransitionOverlay } from '../components/PageTransitionOverlay';
import { UserProfile } from '../types';

// Lazy load pages for code splitting
const LandingPage = React.lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const EventPage = React.lazy(() => import('../pages/public/EventPage').then(m => ({ default: m.EventPage })));
const CompetitionsPage = React.lazy(() => import('../pages/public/CompetitionsPage').then(m => ({ default: m.CompetitionsPage })));
const NewsPage = React.lazy(() => import('../pages/public/NewsPage').then(m => ({ default: m.NewsPage })));
const CompetitionDetailPage = React.lazy(() => import('../pages/public/CompetitionDetailPage').then(m => ({ default: m.CompetitionDetailPage })));
const JuklakJuknisPage = React.lazy(() => import('../pages/public/JuklakJuknisPage').then(m => ({ default: m.JuklakJuknisPage })));
const PrivacyPolicyPage = React.lazy(() => import('../pages/public/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = React.lazy(() => import('../pages/public/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const ParticipantDashboardPage = React.lazy(() => import('../pages/participant/ParticipantDashboardPage').then(m => ({ default: m.ParticipantDashboardPage })));
const AdminDashboardPage = React.lazy(() => import('../pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const SuperAdminDashboardPage = React.lazy(() => import('../pages/superadmin/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage })));

interface AppRoutesProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onSwitchRole: (role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN') => void;
}

const DaftarRedirect: React.FC = () => {
  const { search } = useLocation();
  return <Navigate to={`/login${search}`} replace />;
};

import { pageMetadata } from '../pageMetadata';

export const AppRoutes: React.FC<AppRoutesProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onSwitchRole,
}) => {
  const isGuest = !currentUser || currentUser.id === 'guest';
  const role = currentUser?.role;
  const { pathname } = useLocation();
  React.useEffect(() => {
    const page = pageMetadata[pathname.replace(/\/$/, '') || '/'];
    const title = page && page[0] !== 'Digiconomic Fest 2027'
      ? page[0] + ' | Digiconomic Fest 2027' : 'Digiconomic Fest 2027';
    document.title = title;
    const description = page?.[1] || 'Portal Digiconomic Fest 2027.';
    for (const [selector, value] of [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description],
      ['meta[name="robots"]', page ? 'index,follow' : 'noindex,follow'],
    ]) document.querySelector(selector)?.setAttribute('content', value);
  }, [pathname]);

  return (
    <>
      {/* Animasi logo transisi setiap kali berpindah halaman */}
      <PageTransitionOverlay />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#26160c] flex flex-col items-center justify-center">
            <img src="/Logo/00-logo-gabungan.svg" alt="Digiconomic" className="w-14 h-14 animate-pulse" />
          </div>
        }
      >
        <Routes>
          {/* 1. PUBLIC LANDING PAGE */}
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

          {/* 1A. EVENT & TECHNICAL MEETING PAGE */}
          <Route
            path="/event"
            element={
              <PublicLayout
                currentUser={currentUser}
                onLogout={onLogout}
                onSwitchRole={onSwitchRole}
              >
                <EventPage />
              </PublicLayout>
            }
          />

          {/* 1B. COMPETITIONS INDEX PAGE */}
          <Route
            path="/kompetisi"
            element={
              <PublicLayout
                currentUser={currentUser}
                onLogout={onLogout}
                onSwitchRole={onSwitchRole}
              >
                <CompetitionsPage />
              </PublicLayout>
            }
          />

          {/* 1C. NEWS & ANNOUNCEMENTS PAGE */}
          <Route
            path="/news"
            element={
              <PublicLayout
                currentUser={currentUser}
                onLogout={onLogout}
                onSwitchRole={onSwitchRole}
              >
                <NewsPage />
              </PublicLayout>
            }
          />

          {/* 1D. COMPETITION DETAIL PAGE */}
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

          {/* 1E. JUKLAK & JUKNIS PAGE */}
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
            element={
              !isGuest ? (
                <Navigate to={role === 'PESERTA' ? '/dashboard' : role === 'SUPERADMIN' ? '/superadmin' : '/admin'} replace />
              ) : (
                <LoginPage key="participant" onLogin={onLogin} />
              )
            }
          />

          <Route
            path="/daftar"
            element={<DaftarRedirect />}
          />

          <Route
            path="/panitia/login"
            element={
              !isGuest && role !== 'PESERTA' ? (
                <Navigate to={role === 'SUPERADMIN' ? '/superadmin' : '/admin'} replace />
              ) : (
                <LoginPage key="staff" staff onLogin={onLogin} />
              )
            }
          />

          {/* 3. PARTICIPANT DASHBOARD */}
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

          {/* 4. PANITIA ADMIN DASHBOARD */}
          <Route
            path="/admin"
            element={
              isGuest ? (
                <Navigate to="/panitia/login" replace />
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

          {/* 5. SUPERADMIN CONTROL PORTAL */}
          <Route
            path="/superadmin"
            element={
              isGuest ? (
                <Navigate to="/panitia/login" replace />
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

          {/* 7. LEGAL PAGES */}
          <Route path="/kebijakan-privasi" element={<PrivacyPolicyPage />} />
          <Route path="/syarat-ketentuan" element={<TermsOfServicePage />} />
        </Routes>
      </Suspense>
    </>
  );
};
