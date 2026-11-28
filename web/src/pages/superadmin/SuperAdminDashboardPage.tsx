import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DashboardLayout, SidebarNavItem } from '../../layouts/DashboardLayout';
import { AdminApi, SuperAdminApi, type TimelineStageRecord } from '../../services/apiService';
import { SuperAdminTimelineManager } from '../../components/SuperAdminTimelineManager';
import type { DemographicsData, NewsArticle, UserProfile } from '../../types';
import {
  BarChart3,
  CalendarClock,
  Users,
  Newspaper,
  Settings,
  Activity,
  UserPlus,
  Ban,
  CheckCircle2,
  Trash2,
  Home,
  Star,
  Loader2,
  AlertCircle,
  Search,
  ShieldOff,
  RefreshCw,
  ChevronDown,
  Trophy,
  Building2,
  UserX,
  Eye,
  EyeOff,
  Pencil,
  KeyRound,
} from 'lucide-react';

interface SuperAdminDashboardPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN') => void;
}

export const SuperAdminDashboardPage: React.FC<SuperAdminDashboardPageProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [timelineList, setTimelineList] = useState<TimelineStageRecord[]>([]);
  const [timelineServerTime, setTimelineServerTime] = useState<string | undefined>(undefined);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Form Tambah Staff / Juri
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'ADMIN' | 'JURI' | 'SUPERADMIN'>('JURI');
  const [staffDivision, setStaffDivision] = useState('Dewan Juri');
  const [staffCompId, setStaffCompId] = useState('');

  // Form Pembatalan Hak Peserta
  const [cancelRegSearch, setCancelRegSearch] = useState('');
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Form Berita
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSlug, setNewsSlug] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsArticle['category']>('Pengumuman');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCover, setNewsCover] = useState('');
  const [newsShowHome, setNewsShowHome] = useState(true);
  const [newsFeatured, setNewsFeatured] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Modal Reset Password Staf
  const [resetTarget, setResetTarget] = useState<any>(null);
  const [resetNewPass, setResetNewPass] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [demoRes, usersRes, compRes, regRes, newsRes, timelineRes, logsRes] = await Promise.all([
        SuperAdminApi.getDemographics(),
        SuperAdminApi.listUsers(),
        AdminApi.listCompetitions(),
        AdminApi.listRegistrations({ page: 1, page_size: 100 }),
        SuperAdminApi.listNews(),
        SuperAdminApi.listTimeline().catch(() => ({ stages: [], server_time: undefined })),
        SuperAdminApi.getAuditLogs(100),
      ]);
      const comps = compRes.competitions || [];
      setDemographics(demoRes);
      setAllUsers(usersRes.users || []);
      setCompetitions(comps);
      setRegistrations(regRes.items || []);
      setNewsList(newsRes.articles || []);
      setTimelineList(timelineRes.stages || []);
      setTimelineServerTime(timelineRes.server_time);
      setAuditLogs(logsRes.audit_logs || []);
      setStaffCompId((prev) => prev || comps[0]?.id || '');
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal memuat data SuperAdmin.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (q && !u.name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allUsers, roleFilter, userSearch]);

  const activeRegistrations = useMemo(() => {
    const q = cancelRegSearch.trim().toLowerCase();
    return registrations
      .filter((r) => r.status !== 'DIBATALKAN')
      .filter((r) => {
        if (!q) return true;
        return (
          r.registration_code?.toLowerCase().includes(q) ||
          r.user?.name?.toLowerCase().includes(q) ||
          r.team_name?.toLowerCase().includes(q)
        );
      });
  }, [registrations, cancelRegSearch]);

  const navItems: SidebarNavItem[] = [
    { id: 'stats', label: 'Statistik & Demografi', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'Manajemen Akun & Hak', icon: <Users className="w-4 h-4" />, badge: allUsers.length || undefined },
    { id: 'news', label: 'Manajemen Berita', icon: <Newspaper className="w-4 h-4" />, badge: newsList.length || undefined },
    { id: 'timeline', label: 'Linimasa Lomba', icon: <CalendarClock className="w-4 h-4" />, badge: timelineList.length || undefined },
    { id: 'settings', label: 'Kuota & Jadwal Lomba', icon: <Settings className="w-4 h-4" /> },
    { id: 'logs', label: 'Audit Log Sistem', icon: <Activity className="w-4 h-4" /> },
  ];

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (staffRole === 'JURI' && !staffCompId) {
      setFeedback({ type: 'error', msg: 'Pilih cabang lomba penugasan untuk akun Dewan Juri.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await SuperAdminApi.createStaff({
        name: staffName.trim(),
        email: staffEmail.trim(),
        password: staffPassword,
        role: staffRole,
        division: staffDivision.trim() || (staffRole === 'JURI' ? 'Dewan Juri' : 'Panitia Inti'),
        assigned_competition_id: staffRole === 'JURI' ? staffCompId : null,
      });
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setFeedback({ type: 'success', msg: `Akun ${staffRole} berhasil dibuat dan siap digunakan login!` });
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal membuat akun staf.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelParticipant = async () => {
    if (!cancelTarget || cancelReason.trim().length < 5) return;
    setSaving(true);
    setFeedback(null);
    try {
      await SuperAdminApi.cancelParticipant(cancelTarget.id, cancelReason.trim());
      setCancelTarget(null);
      setCancelReason('');
      setFeedback({ type: 'success', msg: 'Hak kepesertaan berhasil dibatalkan dan dicatat ke Audit Log.' });
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal membatalkan peserta.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        title: newsTitle,
        slug: newsSlug || undefined,
        category: newsCategory,
        excerpt: newsExcerpt,
        content: newsContent,
        cover_image_url: newsCover || null,
        show_on_home: newsShowHome,
        is_featured: newsFeatured,
        is_published: true,
      };
      if (editingNewsId) {
        await SuperAdminApi.updateNews(editingNewsId, payload);
        setFeedback({ type: 'success', msg: 'Berita berhasil diperbarui!' });
      } else {
        await SuperAdminApi.createNews(payload);
        setFeedback({ type: 'success', msg: 'Berita resmi berhasil dipublikasikan!' });
      }
      setEditingNewsId(null);
      setNewsTitle('');
      setNewsSlug('');
      setNewsExcerpt('');
      setNewsContent('');
      setNewsCover('');
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal menyimpan berita.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetStaffPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setSaving(true);
    setFeedback(null);
    try {
      await SuperAdminApi.resetStaffPassword(resetTarget.id, resetNewPass);
      setFeedback({ type: 'success', msg: `Kata sandi untuk ${resetTarget.email} berhasil diperbarui.` });
      setResetTarget(null);
      setResetNewPass('');
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal mereset kata sandi.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCompetition = async (comp: any, patch: any) => {
    setSaving(true);
    setFeedback(null);
    try {
      await AdminApi.updateCompetition(comp.id, patch);
      setFeedback({ type: 'success', msg: `Konfigurasi cabang lomba "${comp.name}" berhasil diperbarui.` });
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal memperbarui pengaturan lomba.' });
    } finally {
      setSaving(false);
    }
  };

  const maxInstCount = Math.max(1, ...(demographics?.by_institution.map((i) => i.total) || [1]));

  return (
    <DashboardLayout
      currentUser={currentUser}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={(t) => {
        setFeedback(null);
        setActiveTab(t);
      }}
    >
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Page Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 rounded-2xl p-5 border border-[#ebdcc8] shadow-2xs">
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-[0.2em] text-[#ba883a] font-semibold">
              Pusat Kendali Tertinggi • Digiconomic Fest 2027
            </p>
            <h1 className="font-cormorant text-2xl sm:text-3xl text-[#2f1e10] font-semibold mt-0.5">
              {navItems.find((n) => n.id === activeTab)?.label || 'Superadmin Console'}
            </h1>
          </div>
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] border border-[#caa152]/60 text-xs font-semibold text-[#2f1e10] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ba883a] ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white/90 rounded-2xl p-12 border border-[#ebdcc8] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#caa152]" />
            <p className="text-xs text-[#7a5530]">Memuat seluruh data sistem secara real-time...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: STATISTIK & DEMOGRAFI */}
            {activeTab === 'stats' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(demographics?.by_competition || []).map((c) => {
                    const pct = Math.min(100, Math.round((c.registered / Math.max(1, c.max_quota)) * 100));
                    return (
                      <div key={c.id} className="bg-white/95 rounded-2xl p-5 border border-[#ebdcc8] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#7a5530]">{c.name}</p>
                          <Trophy className="w-4 h-4 text-[#caa152]" />
                        </div>
                        <p className="font-cormorant text-3xl font-semibold text-[#2f1e10]">
                          {c.registered} <span className="text-sm font-sans font-normal text-[#7a5530]">/ {c.max_quota} kuota</span>
                        </p>
                        <div className="w-full h-2 rounded-full bg-[#faf4e8] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#ba883a] to-[#caa152]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Terverifikasi Resmi: <strong>{c.verified}</strong> ({pct}% kuota terisi)
                        </p>
                      </div>
                    );
                  })}

                  {(demographics?.users_by_role || []).map((u) => (
                    <div key={u.role} className="bg-white/95 rounded-2xl p-5 border border-[#ebdcc8] shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#7a5530]">Akun {u.role}</p>
                        <Users className="w-4 h-4 text-[#ba883a]" />
                      </div>
                      <p className="font-cormorant text-3xl font-semibold text-[#2f1e10]">{u.total}</p>
                      <p className="text-[11px] text-[#ba883a]">Pengguna terdaftar di database</p>
                    </div>
                  ))}
                </div>

                {/* Grafik Sebaran Kampus */}
                <div className="bg-white/95 rounded-2xl p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10] flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#caa152]" />
                        Sebaran Asal Perguruan Tinggi &amp; Sekolah (Top 20)
                      </h3>
                      <p className="text-xs text-[#7a5530]">Data dihimpun otomatis dari profil peserta yang mendaftar lomba.</p>
                    </div>
                  </div>

                  {!demographics || demographics.by_institution.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#faf4e8]/60 border border-dashed border-[#d8be99] text-center space-y-1">
                      <p className="text-sm font-semibold text-[#2f1e10]">Belum Ada Data Sebaran Kampus</p>
                      <p className="text-xs text-[#7a5530]">
                        Grafik akan terisi otomatis begitu peserta pertama melengkapi biodata dan mendaftar lomba.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {demographics.by_institution.map((inst) => (
                        <div key={inst.institution} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-[#2f1e10]">{inst.institution}</span>
                            <span className="font-bold text-[#ba883a]">{inst.total} tim/peserta</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[#faf4e8] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#2f1e10] to-[#caa152]"
                              style={{ width: `${Math.round((inst.total / maxInstCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MANAJEMEN AKUN & PEMBATALAN HAK */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Tambah Juri / Admin / Superadmin */}
                <form
                  onSubmit={handleCreateStaff}
                  autoComplete="off"
                  className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4"
                >
                  <div>
                    <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10] flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-[#caa152]" /> Tambah Akun Panitia / Dewan Juri
                    </h3>
                    <p className="text-xs text-[#7a5530] mt-0.5">
                      Akun panitia dan juri masuk melalui halaman khusus <code>/panitia/login</code> menggunakan email &amp; kata sandi di bawah ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        name="new_staff_name"
                        placeholder="Contoh: Dr. Budi Raharjo"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 focus:bg-white focus:outline-none focus:border-[#ba883a] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Email Resmi Staf *</label>
                      <input
                        type="email"
                        required
                        autoComplete="new-password"
                        name="new_staff_email"
                        placeholder="juri.esai@diginomic.id"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 focus:bg-white focus:outline-none focus:border-[#ba883a] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Kata Sandi Awal *</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        name="new_staff_password"
                        placeholder="Min. 8 karakter (huruf + angka)"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 focus:bg-white focus:outline-none focus:border-[#ba883a] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Peran Akses *</label>
                      <div className="relative">
                        <select
                          value={staffRole}
                          onChange={(e) => {
                            const nextRole = e.target.value as 'ADMIN' | 'JURI' | 'SUPERADMIN';
                            setStaffRole(nextRole);
                            if (nextRole === 'JURI') setStaffDivision('Dewan Juri');
                            else if (nextRole === 'ADMIN') setStaffDivision('Divisi Verifikasi');
                            else setStaffDivision('Steering Committee');
                          }}
                          className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-[#d8be99] bg-white focus:outline-none focus:border-[#ba883a] text-xs font-medium text-[#2f1e10]"
                        >
                          <option value="JURI">DEWAN JURI (Khusus Cabang Lomba)</option>
                          <option value="ADMIN">PANITIA ADMIN (Verifikasi &amp; Broadcast)</option>
                          <option value="SUPERADMIN">SUPERADMIN (Akses Penuh)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#7a5530] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Divisi / Jabatan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Dewan Juri Akademisi"
                        value={staffDivision}
                        onChange={(e) => setStaffDivision(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 focus:bg-white focus:outline-none focus:border-[#ba883a] text-xs"
                      />
                    </div>

                    {staffRole === 'JURI' && (
                      <div>
                        <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Penugasan Cabang Lomba *</label>
                        <div className="relative">
                          <select
                            value={staffCompId}
                            onChange={(e) => setStaffCompId(e.target.value)}
                            required
                            className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-[#caa152] bg-[#faf4e8] focus:outline-none focus:border-[#ba883a] text-xs font-semibold text-[#2f1e10]"
                          >
                            {competitions.length === 0 ? (
                              <option value="">Belum ada cabang lomba</option>
                            ) : (
                              competitions.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))
                            )}
                          </select>
                          <ChevronDown className="w-4 h-4 text-[#7a5530] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-full bg-[#2f1e10] text-[#faf4e8] text-xs font-semibold hover:bg-[#462d18] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {saving ? 'Menyimpan Akun...' : 'Buat Akun Staf Sekarang'}
                    </button>
                  </div>
                </form>

                {/* Daftar Semua Akun */}
                <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Daftar Seluruh Akun Sistem</h4>
                      <p className="text-xs text-[#7a5530]">Total {filteredUsers.length} akun ditampilkan.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['', 'PESERTA', 'JURI', 'ADMIN', 'SUPERADMIN'].map((r) => (
                        <button
                          key={r || 'ALL'}
                          type="button"
                          onClick={() => setRoleFilter(r)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            roleFilter === r
                              ? 'bg-[#ba883a] text-white'
                              : 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8] hover:border-[#caa152]'
                          }`}
                        >
                          {r || 'Semua'}
                        </button>
                      ))}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a5530]" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Cari nama / email..."
                          className="pl-8 pr-3 py-1.5 rounded-full border border-[#d8be99] text-xs focus:outline-none focus:border-[#ba883a]"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#faf4e8]/60 border border-dashed border-[#d8be99] text-center text-xs text-[#7a5530]">
                      Tidak ada akun yang cocok dengan filter pencarian.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#ebdcc8]">
                      {filteredUsers.map((u) => (
                        <div key={u.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs sm:text-sm text-[#2f1e10]">{u.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  u.role === 'SUPERADMIN'
                                    ? 'bg-[#2f1e10] text-[#f3d48c] border-[#caa152]'
                                    : u.role === 'ADMIN'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : u.role === 'JURI'
                                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                        : 'bg-[#faf4e8] text-[#7a5530] border-[#ebdcc8]'
                                }`}
                              >
                                {u.role}
                              </span>
                              {u.status === 'SUSPENDED' && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                                  DITANGGUHKAN
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#7a5530]">
                              {u.email}
                              {u.division ? ` • ${u.division}` : ''}
                              {u.assigned_competition_id
                                ? ` • Tugas Lomba: ${competitions.find((c) => c.id === u.assigned_competition_id)?.name || '-'}`
                                : ''}
                            </p>
                          </div>

                          {u.role !== 'PESERTA' && u.id !== currentUser.id && (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  await SuperAdminApi.toggleStaffStatus(
                                    u.id,
                                    u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
                                  );
                                  await loadAll();
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ebdcc8] text-xs hover:bg-[#faf4e8] cursor-pointer"
                              >
                                {u.status === 'SUSPENDED' ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aktifkan
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3.5 h-3.5 text-amber-600" /> Tangguhkan
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setResetTarget(u);
                                  setResetNewPass('');
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ebdcc8] text-xs hover:bg-[#faf4e8] cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-[#ba883a]" /> Reset Sandi
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm(`Cabut hak akses staf untuk ${u.name} (${u.email})?`)) return;
                                  await SuperAdminApi.removeStaff(u.id);
                                  await loadAll();
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs hover:bg-red-50 cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5" /> Cabut Staf
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pembatalan Hak Kepesertaan */}
                <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-red-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-cormorant text-2xl font-semibold text-red-900 flex items-center gap-2">
                        <ShieldOff className="w-5 h-5 text-red-600" /> Pembatalan Hak Peserta (Diskualifikasi Pelanggaran)
                      </h4>
                      <p className="text-xs text-red-700 mt-0.5">
                        Gunakan fitur ini untuk mendiskualifikasi peserta apabila ditemukan bukti bayar atau dokumen KTM palsu.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={cancelRegSearch}
                      onChange={(e) => setCancelRegSearch(e.target.value)}
                      placeholder="Cari kode reg / nama..."
                      className="px-3.5 py-2 rounded-xl border border-red-200 text-xs focus:outline-none focus:border-red-400"
                    />
                  </div>

                  {activeRegistrations.length === 0 ? (
                    <div className="p-6 rounded-xl bg-red-50/40 border border-dashed border-red-200 text-center text-xs text-red-800/80">
                      Belum ada pendaftaran peserta aktif yang dapat ditampilkan saat ini.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {activeRegistrations.slice(0, 20).map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 rounded-xl bg-red-50/40 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#2f1e10]">
                              {r.registration_code} · {r.team_name || r.user?.name} ({r.competition?.name})
                            </p>
                            <p className="text-[11px] text-[#7a5530]">Status saat ini: {r.status}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCancelTarget(r)}
                            className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer self-start sm:self-auto"
                          >
                            Batalkan Hak
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MANAJEMEN BERITA (NEWS) */}
            {activeTab === 'news' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateNews} className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Publikasikan Berita &amp; Pengumuman Resmi</h3>
                    <p className="text-xs text-[#7a5530]">Gunakan gambar berformat WebP agar halaman berita tetap ringan dan cepat dimuat.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Judul Berita *</label>
                      <input
                        type="text"
                        required
                        value={newsTitle}
                        onChange={(e) => {
                          setNewsTitle(e.target.value);
                          setNewsSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, '')
                          );
                        }}
                        placeholder="Contoh: Pengumuman Finalis Digiconomic Fest 2027"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Slug URL *</label>
                      <input
                        type="text"
                        required
                        value={newsSlug}
                        onChange={(e) => setNewsSlug(e.target.value)}
                        placeholder="pengumuman-finalis-2027"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Kategori</label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs bg-white"
                      >
                        <option value="Pengumuman">Pengumuman</option>
                        <option value="Kompetisi">Kompetisi</option>
                        <option value="Technical Meeting">Technical Meeting</option>
                        <option value="UMKM & Edukasi">UMKM &amp; Edukasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">URL Gambar Cover WebP (opsional)</label>
                      <input
                        type="url"
                        value={newsCover}
                        onChange={(e) => setNewsCover(e.target.value)}
                        placeholder="https://.../foto.webp"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Ringkasan Singkat</label>
                    <input
                      type="text"
                      value={newsExcerpt}
                      onChange={(e) => setNewsExcerpt(e.target.value)}
                      placeholder="1–2 kalimat ringkasan untuk kartu berita..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Isi Artikel Lengkap *</label>
                    <textarea
                      rows={5}
                      required
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      placeholder="Tulis isi berita lengkap (pisahkan paragraf dengan baris baru)..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                    />
                  </div>
                  <div className="flex flex-wrap gap-5">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsShowHome}
                        onChange={(e) => setNewsShowHome(e.target.checked)}
                        className="accent-[#ba883a]"
                      />
                      <span>Tampilkan di Halaman Utama (Beranda)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsFeatured}
                        onChange={(e) => setNewsFeatured(e.target.checked)}
                        className="accent-[#ba883a]"
                      />
                      <span>Jadikan Sorotan Utama (Featured)</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-full bg-[#ba883a] text-white text-xs font-semibold hover:bg-[#a6762d] cursor-pointer"
                    >
                      {saving ? 'Menyimpan...' : editingNewsId ? 'Simpan Perubahan Berita' : 'Publikasikan Berita'}
                    </button>
                    {editingNewsId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNewsId(null);
                          setNewsTitle('');
                          setNewsSlug('');
                          setNewsExcerpt('');
                          setNewsContent('');
                          setNewsCover('');
                        }}
                        className="px-4 py-2.5 rounded-full border border-[#ebdcc8] text-xs text-[#7a5530] hover:bg-[#faf4e8] cursor-pointer"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>
                </form>

                <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-3">
                  <h4 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Daftar Berita Tersimpan ({newsList.length})</h4>
                  {newsList.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#faf4e8]/60 border border-dashed border-[#d8be99] text-center text-xs text-[#7a5530]">
                      Belum ada artikel berita di database.
                    </div>
                  ) : (
                    newsList.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 rounded-xl bg-[#faf4e8]/60 border border-[#ebdcc8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={n.cover_image_url || '/gambar/hero-view-dekstop.webp'}
                            alt=""
                            loading="lazy"
                            className="w-16 h-12 rounded-lg object-cover border border-[#ebdcc8] shrink-0 bg-[#ebdcc8]"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#2f1e10]">{n.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#ebdcc8] font-mono">
                                /{n.slug}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#7a5530] mt-0.5">
                              Kategori: {n.category} • Status: <strong>{n.is_published ? 'Published' : 'Draft'}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              await SuperAdminApi.updateNews(n.id, { is_published: !n.is_published });
                              await loadAll();
                            }}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs cursor-pointer border ${
                              n.is_published
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            }`}
                          >
                            {n.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {n.is_published ? 'Tayang' : 'Draft'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await SuperAdminApi.updateNews(n.id, { show_on_home: !n.show_on_home });
                              await loadAll();
                            }}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs cursor-pointer ${
                              n.show_on_home
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-white text-gray-500 border border-[#ebdcc8]'
                            }`}
                          >
                            <Home className="w-3 h-3" /> {n.show_on_home ? 'Di Beranda' : 'Arsip'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await SuperAdminApi.updateNews(n.id, { is_featured: !n.is_featured });
                              await loadAll();
                            }}
                            className={`p-1.5 rounded-lg border cursor-pointer ${
                              n.is_featured
                                ? 'bg-amber-100 border-amber-300 text-amber-700'
                                : 'bg-white border-[#ebdcc8] text-gray-400'
                            }`}
                            title="Sorotan Utama"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNewsId(n.id);
                              setNewsTitle(n.title);
                              setNewsSlug(n.slug);
                              setNewsCategory(n.category);
                              setNewsExcerpt(n.excerpt || '');
                              setNewsContent(n.content || '');
                              setNewsCover(n.cover_image_url || '');
                              setNewsShowHome(Boolean(n.show_on_home));
                              setNewsFeatured(Boolean(n.is_featured));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-1.5 rounded-lg border border-[#ebdcc8] bg-white text-[#7a5530] hover:text-[#2f1e10] cursor-pointer"
                            title="Edit Berita"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm(`Hapus berita "${n.title}"?`)) return;
                              await SuperAdminApi.deleteNews(n.id);
                              await loadAll();
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                            title="Hapus Berita"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: LINIMASA LOMBA (DINAMIS SUPERADMIN) */}
            {activeTab === 'timeline' && (
              <SuperAdminTimelineManager
                stages={timelineList}
                serverTime={timelineServerTime}
                onRefresh={loadAll}
                onFeedback={setFeedback}
              />
            )}

            {/* TAB 5: KUOTA & JADWAL LOMBA */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                {competitions.length === 0 ? (
                  <div className="bg-white/95 rounded-2xl p-10 border border-[#ebdcc8] text-center space-y-2">
                    <p className="font-cormorant text-2xl text-[#2f1e10]">Belum Ada Cabang Lomba Terdaftar</p>
                    <p className="text-xs text-[#7a5530]">Pastikan seed database telah dijalankan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {competitions.map((comp) => (
                      <QuotaCard key={comp.id} comp={comp} onSave={handleUpdateCompetition} saving={saving} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: AUDIT LOG */}
            {activeTab === 'logs' && (
              <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                <div>
                  <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Audit Log Aktivitas Sensitif</h3>
                  <p className="text-xs text-[#7a5530]">
                    Seluruh pembuatan staf, unduhan dokumen privat, ekspor CSV, perubahan kuota, dan pembatalan peserta terekam otomatis.
                  </p>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#faf4e8]/60 border border-dashed border-[#d8be99] text-center space-y-1">
                    <Activity className="w-6 h-6 text-[#caa152] mx-auto mb-1" />
                    <p className="text-sm font-semibold text-[#2f1e10]">Belum Ada Aktivitas Tercatat</p>
                    <p className="text-xs text-[#7a5530]">
                      Riwayat audit akan muncul otomatis setelah terjadi aksi administratif di sistem.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#ebdcc8] max-h-[520px] overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#2f1e10] text-[#f3d48c] font-mono text-[10px] font-bold">
                              {log.action}
                            </span>
                            <span className="text-[#5c3e28] font-semibold">Target: {log.target_type}</span>
                          </div>
                          {log.meta && Object.keys(log.meta).length > 0 && (
                            <p className="text-[#7a5530] font-mono text-[11px] break-all">
                              {JSON.stringify(log.meta)}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] text-[#7a5530] shrink-0">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Reset Password Staf */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleResetStaffPassword} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#caa152] shadow-2xl">
            <h4 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Reset Kata Sandi Staf</h4>
            <p className="text-xs text-[#7a5530]">
              Akun: <strong>{resetTarget.name}</strong> ({resetTarget.email})
            </p>
            <input
              type="password"
              required
              minLength={8}
              value={resetNewPass}
              onChange={(e) => setResetNewPass(e.target.value)}
              placeholder="Kata sandi baru (min. 8 karakter huruf+angka)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="px-4 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || resetNewPass.length < 8}
                className="px-4 py-2 rounded-lg bg-[#2f1e10] text-[#faf4e8] text-xs font-semibold hover:bg-[#462d18] disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Menyimpan...' : 'Simpan Sandi Baru'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pembatalan Hak */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-red-300 shadow-2xl">
            <h4 className="font-cormorant text-2xl font-semibold text-red-900">Konfirmasi Pembatalan Hak Peserta</h4>
            <p className="text-xs text-[#5c3e28]">
              Peserta: <strong>{cancelTarget.team_name || cancelTarget.user?.name}</strong> ({cancelTarget.registration_code})
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Wajib tulis alasan pembatalan resmi (min. 5 karakter)..."
              className="w-full px-3.5 py-2 rounded-xl border border-red-200 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving || cancelReason.trim().length < 5}
                onClick={handleCancelParticipant}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                Batalkan Hak Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const QuotaCard: React.FC<{ comp: any; onSave: (c: any, patch: any) => void; saving: boolean }> = ({
  comp,
  onSave,
  saving,
}) => {
  const [quota, setQuota] = useState(Number(comp.max_quota || 100));
  const [fee, setFee] = useState(Number(comp.fee || 0));
  const [isTeam, setIsTeam] = useState(comp.is_team !== undefined ? Boolean(comp.is_team) : true);
  const [maxTeamSize, setMaxTeamSize] = useState(Number(comp.max_team_size || 3));
  const [regOpen, setRegOpen] = useState(toDatetimeLocal(comp.reg_open_at));
  const [regClose, setRegClose] = useState(toDatetimeLocal(comp.reg_close_at));
  const [subDeadline, setSubDeadline] = useState(toDatetimeLocal(comp.submission_deadline));
  const [groupUrl, setGroupUrl] = useState(comp.group_url || '');
  const [guidebookUrl, setGuidebookUrl] = useState(comp.guidebook_url || '');
  const [active, setActive] = useState(Boolean(comp.is_active));

  return (
    <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#ebdcc8]">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#ba883a] font-bold">
            /{comp.slug} • {isTeam ? `TIM (Maks. ${maxTeamSize} Orang)` : 'INDIVIDU'}
          </span>
          <h4 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">{comp.name}</h4>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
            active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {active ? 'AKTIF' : 'NONAKTIF'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Kuota Maksimal</label>
          <input
            type="number"
            min={1}
            value={quota}
            onChange={(e) => setQuota(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Biaya Pendaftaran (Rp)</label>
          <input
            type="number"
            min={0}
            step={1000}
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Kategori Kepesertaan</label>
          <select
            value={isTeam ? 'TIM' : 'INDIVIDU'}
            onChange={(e) => {
              const nextTeam = e.target.value === 'TIM';
              setIsTeam(nextTeam);
              if (nextTeam && maxTeamSize < 2) setMaxTeamSize(3);
              if (!nextTeam) setMaxTeamSize(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs bg-white"
          >
            <option value="TIM">Tim / Kelompok</option>
            <option value="INDIVIDU">Individu</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Maksimal Anggota Tim (Termasuk Ketua)</label>
          <input
            type="number"
            min={isTeam ? 2 : 1}
            max={10}
            disabled={!isTeam}
            value={maxTeamSize}
            onChange={(e) => setMaxTeamSize(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Pendaftaran Dibuka</label>
          <input
            type="datetime-local"
            value={regOpen}
            onChange={(e) => setRegOpen(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Pendaftaran Ditutup</label>
          <input
            type="datetime-local"
            value={regClose}
            onChange={(e) => setRegClose(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Tenggat Pengumpulan Karya</label>
          <input
            type="datetime-local"
            value={subDeadline}
            onChange={(e) => setSubDeadline(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Tautan Grup WhatsApp Koordinasi (Khusus Terverifikasi)</label>
          <input
            type="url"
            value={groupUrl}
            onChange={(e) => setGroupUrl(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Tautan Guidebook Resmi (PDF/Drive)</label>
          <input
            type="url"
            value={guidebookUrl}
            onChange={(e) => setGuidebookUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-[#2f1e10] cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="accent-[#ba883a]"
        />
        <span>Tampilkan &amp; aktifkan cabang lomba di halaman publik</span>
      </label>

      <button
        type="button"
        disabled={saving}
        onClick={() =>
          onSave(comp, {
            max_quota: quota,
            fee,
            is_team: isTeam,
            max_team_size: isTeam ? Math.max(2, maxTeamSize) : 1,
            reg_open_at: regOpen ? new Date(regOpen).toISOString() : undefined,
            reg_close_at: regClose ? new Date(regClose).toISOString() : undefined,
            submission_deadline: subDeadline ? new Date(subDeadline).toISOString() : undefined,
            group_url: groupUrl.trim(),
            guidebook_url: guidebookUrl.trim(),
            is_active: active,
          })
        }
        className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#2f1e10] text-[#faf4e8] text-xs font-semibold hover:bg-[#462d18] transition-colors cursor-pointer"
      >
        Simpan Konfigurasi Lomba
      </button>
    </div>
  );
};
