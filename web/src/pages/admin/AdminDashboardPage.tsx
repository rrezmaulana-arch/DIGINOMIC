import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout, SidebarNavItem } from '../../layouts/DashboardLayout';
import { AdminApi } from '../../services/apiService';
import type { AnnouncementItem, LeaderboardEntry, RegistrationStatus, UserProfile } from '../../types';
import {
  FileCheck,
  Users,
  Award,
  Megaphone,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BarChart3,
  Pin,
  Trash2,
  Loader2,
  AlertCircle,
  Trophy,
  ArrowUpRight,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface AdminDashboardPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN') => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
}) => {
  const isJuri = currentUser.role === 'JURI';
  const [activeTab, setActiveTab] = useState(isJuri ? 'penjurian' : 'verif-esai');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [competitions, setCompetitions] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ total: number; by_status: Record<string, number> } | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Filter & Search
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Penjurian state
  const [selectedJuryCompId, setSelectedJuryCompId] = useState<string>(
    currentUser.assignedCompetitionId || ''
  );
  const [juryRound, setJuryRound] = useState<'TAHAP_1' | 'FINAL'>('TAHAP_1');
  const [scoringEntry, setScoringEntry] = useState<LeaderboardEntry | null>(null);
  const [scoreOrisinalitas, setScoreOrisinalitas] = useState(80);
  const [scoreAnalisis, setScoreAnalisis] = useState(80);
  const [scoreInovasi, setScoreInovasi] = useState(80);
  const [scoreSistematika, setScoreSistematika] = useState(80);
  const [scoreFeedback, setScoreFeedback] = useState('');

  // Broadcast state
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annCompId, setAnnCompId] = useState<string>('');
  const [annPinned, setAnnPinned] = useState(false);

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const compRes = await AdminApi.listCompetitions();
      const comps = compRes.competitions || [];
      setCompetitions(comps);

      if (isJuri) {
        const compId = currentUser.assignedCompetitionId || comps[0]?.id || '';
        setSelectedJuryCompId(compId);
        if (compId) {
          const lbRes = await AdminApi.getLeaderboard(compId, juryRound);
          setLeaderboard(lbRes.leaderboard || []);
        }
      } else {
        const defaultCompId = selectedJuryCompId || comps[0]?.id || '';
        if (!selectedJuryCompId && defaultCompId) {
          setSelectedJuryCompId(defaultCompId);
        }
        const [sumRes, regRes, annRes, lbRes] = await Promise.all([
          AdminApi.getSummary(),
          AdminApi.listRegistrations({ page: 1, page_size: 100 }),
          AdminApi.listAnnouncements(),
          defaultCompId ? AdminApi.getLeaderboard(defaultCompId, juryRound) : Promise.resolve({ leaderboard: [] }),
        ]);
        setSummary(sumRes);
        setRegistrations(regRes.items || []);
        setAnnouncements(annRes.announcements || []);
        setLeaderboard(lbRes.leaderboard || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal memuat data panel.' });
    } finally {
      setLoading(false);
    }
  }, [isJuri, currentUser.assignedCompetitionId, juryRound, selectedJuryCompId]);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  const esaiComp = competitions.find((c) => c.slug?.includes('esai') || c.name?.toLowerCase().includes('esai'));
  const caseComp = competitions.find((c) => !c.slug?.includes('esai') && !c.name?.toLowerCase().includes('esai'));

  const navItems: SidebarNavItem[] = isJuri
    ? [{ id: 'penjurian', label: 'Penjurian & Peringkat', icon: <Award className="w-4 h-4" /> }]
    : [
        {
          id: 'verif-esai',
          label: 'Verifikasi Esai',
          icon: <FileCheck className="w-4 h-4" />,
          badge:
            registrations.filter((r) => r.competition_id === esaiComp?.id && r.status === 'MENUNGGU_VERIFIKASI').length ||
            undefined,
        },
        {
          id: 'verif-case',
          label: 'Verifikasi Mini Case',
          icon: <Users className="w-4 h-4" />,
          badge:
            registrations.filter((r) => r.competition_id === caseComp?.id && r.status === 'MENUNGGU_VERIFIKASI').length ||
            undefined,
        },
        { id: 'penjurian', label: 'Penjurian & Peringkat', icon: <Award className="w-4 h-4" /> },
        {
          id: 'broadcast',
          label: 'Broadcast Pengumuman',
          icon: <Megaphone className="w-4 h-4" />,
          badge: announcements.length || undefined,
        },
        { id: 'export', label: 'Rekap Data CSV', icon: <Download className="w-4 h-4" /> },
      ];

  const handleStatusChange = async (regId: string, status: RegistrationStatus, reason?: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await AdminApi.updateRegistrationStatus(regId, status, reason);
      setRejectTarget(null);
      setRejectReason('');
      setFeedback({ type: 'success', msg: `Status pendaftaran berhasil diperbarui menjadi ${status}.` });
      await loadBaseData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal mengubah status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      await AdminApi.createAnnouncement({
        competition_id: annCompId || null,
        title: annTitle,
        body: annBody,
        is_pinned: annPinned,
      });
      setAnnTitle('');
      setAnnBody('');
      setAnnPinned(false);
      setFeedback({ type: 'success', msg: 'Broadcast pengumuman berhasil dikirim ke portal peserta!' });
      await loadBaseData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal mengirim broadcast.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringEntry) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await AdminApi.submitScore({
        submission_id: scoringEntry.submission_id,
        round: juryRound,
        score_orisinalitas: scoreOrisinalitas,
        score_analisis: scoreAnalisis,
        score_inovasi: scoreInovasi,
        score_sistematika: scoreSistematika,
        feedback: scoreFeedback,
      });
      setScoringEntry(null);
      setScoreFeedback('');
      setFeedback({
        type: 'success',
        msg: `Nilai rubrik untuk ${scoringEntry.team_name || scoringEntry.leader_name} berhasil disimpan.`,
      });
      const lbRes = await AdminApi.getLeaderboard(selectedJuryCompId, juryRound);
      setLeaderboard(lbRes.leaderboard || []);
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal menyimpan nilai juri.' });
    } finally {
      setActionLoading(false);
    }
  };

  const renderVerificationList = (compId?: string, title?: string) => {
    const filtered = registrations.filter((r) => {
      if (compId && r.competition_id !== compId) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        const match =
          r.registration_code?.toLowerCase().includes(q) ||
          r.user?.name?.toLowerCase().includes(q) ||
          r.team_name?.toLowerCase().includes(q) ||
          r.profile?.institution?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    return (
      <div className="space-y-4">
        <div className="bg-white/95 rounded-2xl p-5 border border-[#ebdcc8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">{title}</h2>
            <p className="text-xs text-[#7a5530]">Periksa keaslian KTM dan bukti pembayaran QRIS sebelum menyetujui peserta.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a5530]" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Cari kode / nama / kampus..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#d8be99] text-xs bg-[#faf4e8]/50 focus:bg-white focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#d8be99] text-xs bg-white"
            >
              <option value="">Semua Status</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="TERVERIFIKASI">Terverifikasi</option>
              <option value="DITOLAK">Ditolak (Perlu Revisi)</option>
              <option value="LOLOS_TAHAP_1">Lolos Tahap 1</option>
              <option value="FINALIS">Finalis</option>
              <option value="JUARA">Juara</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white/95 rounded-2xl p-10 border border-[#ebdcc8] text-center space-y-1">
            <p className="font-cormorant text-xl text-[#2f1e10]">Belum Ada Data Pendaftar</p>
            <p className="text-xs text-[#7a5530]">Tidak ada pendaftaran yang sesuai dengan filter pada cabang lomba ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((reg) => (
              <div key={reg.id} className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-[#ebdcc8] shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#ba883a]">{reg.registration_code}</span>
                      <span className="font-semibold text-sm text-[#2f1e10]">
                        {reg.team_name ? `${reg.team_name} (${reg.user?.name})` : reg.user?.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#faf4e8] border border-[#ebdcc8]">
                        {reg.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#7a5530]">
                      {reg.profile?.institution || '-'} • NIM: {reg.profile?.nim || '-'} • WA: {reg.profile?.phone_wa || '-'}
                    </p>
                    {reg.payment_sender_name && (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Pengirim QRIS: {reg.payment_sender_name} {reg.payment_date ? `(${reg.payment_date})` : ''}
                      </p>
                    )}
                    {reg.team_members?.length > 0 && (
                      <p className="text-[11px] text-[#5c3e28]">
                        Anggota Tim: {reg.team_members.map((m: any) => `${m.full_name} (${m.nim || '-'})`).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={AdminApi.getRegFileUrl(reg.id, 'student-card')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ebdcc8] text-xs hover:bg-[#faf4e8]"
                    >
                      <span>Lihat KTM</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {(reg.payment_proof_drive_id || reg.payment_proof_path) ? (
                      <a
                        href={AdminApi.getRegFileUrl(reg.id, 'payment-proof')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/50 text-emerald-900 text-xs hover:bg-emerald-50"
                      >
                        <span>Bukti QRIS</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                        <Clock className="w-3 h-3" /> Belum unggah bayar
                      </span>
                    )}

                    {reg.status === 'MENUNGGU_VERIFIKASI' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleStatusChange(reg.id, 'TERVERIFIKASI')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => setRejectTarget(reg)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
        {/* Header Bar + Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 rounded-2xl p-5 border border-[#ebdcc8] shadow-2xs">
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-[0.2em] text-[#ba883a] font-semibold">
              {isJuri ? 'Portal Evaluasi Karya Resmi' : 'Portal Operasional Panitia'}
            </p>
            <h1 className="font-cormorant text-2xl sm:text-3xl text-[#2f1e10] font-semibold mt-0.5">
              {navItems.find((n) => n.id === activeTab)?.label || 'Panel Panitia'}
            </h1>
          </div>
          <button
            type="button"
            onClick={loadBaseData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] border border-[#caa152]/60 text-xs font-semibold text-[#2f1e10] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ba883a] ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Ringkasan Cepat khusus Admin */}
        {!isJuri && summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white/95 rounded-2xl p-4 border border-[#ebdcc8]">
              <p className="text-[11px] text-[#7a5530] font-medium">Total Pendaftaran</p>
              <p className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#2f1e10] mt-0.5">{summary.total}</p>
            </div>
            <div className="bg-white/95 rounded-2xl p-4 border border-amber-200">
              <p className="text-[11px] text-amber-800 font-medium">Menunggu Verifikasi</p>
              <p className="font-cormorant text-2xl sm:text-3xl font-semibold text-amber-900 mt-0.5">
                {summary.by_status?.MENUNGGU_VERIFIKASI || 0}
              </p>
            </div>
            <div className="bg-white/95 rounded-2xl p-4 border border-emerald-200">
              <p className="text-[11px] text-emerald-800 font-medium">Terverifikasi Resmi</p>
              <p className="font-cormorant text-2xl sm:text-3xl font-semibold text-emerald-900 mt-0.5">
                {summary.by_status?.TERVERIFIKASI || 0}
              </p>
            </div>
            <div className="bg-white/95 rounded-2xl p-4 border border-indigo-200">
              <p className="text-[11px] text-indigo-800 font-medium">Lolos / Finalis</p>
              <p className="font-cormorant text-2xl sm:text-3xl font-semibold text-indigo-900 mt-0.5">
                {(summary.by_status?.LOLOS_TAHAP_1 || 0) + (summary.by_status?.FINALIS || 0) + (summary.by_status?.JUARA || 0)}
              </p>
            </div>
          </div>
        )}

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
          <div className="bg-white/80 rounded-2xl p-12 border border-[#ebdcc8] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#caa152]" />
            <p className="text-xs text-[#7a5530]">Memuat data...</p>
          </div>
        ) : (
          <>
            {!isJuri && activeTab === 'verif-esai' && renderVerificationList(esaiComp?.id, 'Verifikasi Pendaftar: Esai')}
            {!isJuri && activeTab === 'verif-case' && renderVerificationList(caseComp?.id, 'Verifikasi Pendaftar: Mini Case Competition')}

            {/* PENJURIAN & PERINGKAT */}
            {activeTab === 'penjurian' && (
              <div className="space-y-5">
                {!isJuri && competitions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {competitions.map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setSelectedJuryCompId(comp.id)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          selectedJuryCompId === comp.id
                            ? 'bg-[#2f1e10] text-[#faf4e8] border-[#caa152]'
                            : 'bg-white/95 text-[#2f1e10] border-[#ebdcc8] hover:border-[#caa152]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-cormorant text-xl font-semibold">{comp.name}</span>
                          <BarChart3 className="w-5 h-5 text-[#caa152]" />
                        </div>
                        <p className={`text-xs mt-1 ${selectedJuryCompId === comp.id ? 'text-[#ebdcc8]' : 'text-[#7a5530]'}`}>
                          Klik untuk membuka papan peringkat &amp; penilaian juri
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedJuryCompId && (
                  <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10] flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-[#caa152]" />
                          Peringkat &amp; Penjurian ({competitions.find((c) => c.id === selectedJuryCompId)?.name || 'Cabang Lomba'})
                        </h3>
                        <p className="text-xs text-[#7a5530]">
                          Nilai otomatis dirata-ratakan dari seluruh akun dewan juri yang menilai karya.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {(['TAHAP_1', 'FINAL'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setJuryRound(r)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                              juryRound === r
                                ? 'bg-[#ba883a] text-white'
                                : 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8]'
                            }`}
                          >
                            {r === 'TAHAP_1' ? 'Penyisihan (Tahap 1)' : 'Babak Final'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {leaderboard.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#faf4e8]/70 border border-[#ebdcc8] space-y-2.5">
                        <p className="text-xs font-semibold text-[#2f1e10]">Grafik Peringkat Sementara (Top 10)</p>
                        {leaderboard.slice(0, 10).map((entry, idx) => {
                          const score = Number(entry.avg_score || 0);
                          return (
                            <div key={entry.submission_id} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-semibold text-[#2f1e10]">
                                  #{idx + 1} {entry.team_name || entry.leader_name} ({entry.institution || '-'})
                                </span>
                                <span className="font-bold text-[#ba883a]">
                                  {score > 0 ? `${score} (${entry.jury_count} juri)` : 'Belum dinilai'}
                                </span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-white border border-[#ebdcc8] overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#ba883a] to-[#caa152] transition-all"
                                  style={{ width: `${Math.min(100, score)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {leaderboard.length === 0 ? (
                      <div className="p-8 rounded-xl bg-[#faf4e8]/50 border border-dashed border-[#d8be99] text-center text-xs text-[#7a5530]">
                        Belum ada karya peserta yang diunggah pada cabang lomba ini.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leaderboard.map((entry, idx) => (
                          <div
                            key={entry.submission_id}
                            className="p-4 rounded-xl border border-[#ebdcc8] flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-[#2f1e10] text-[#caa152] text-[10px] font-bold">
                                  #{idx + 1}
                                </span>
                                <span className="font-semibold text-sm text-[#2f1e10]">
                                  {entry.submission_title || 'Tanpa Judul'}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#faf4e8] border border-[#ebdcc8]">
                                  {entry.registration_status}
                                </span>
                              </div>
                              <p className="text-xs text-[#7a5530] mt-1">
                                {entry.registration_code} • {entry.team_name || entry.leader_name} ({entry.institution || '-'}) • Rata-rata:{' '}
                                <strong>{entry.avg_score || '-'}</strong>
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {entry.link_url ? (
                                <a
                                  href={entry.link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ebdcc8] text-xs hover:bg-[#faf4e8]"
                                >
                                  <span>Tautan Karya</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : null}
                              <a
                                href={AdminApi.getSubmissionFileUrl(entry.submission_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ebdcc8] text-xs hover:bg-[#faf4e8]"
                              >
                                <span>Berkas PDF</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => setScoringEntry(entry)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#ba883a] text-white text-xs font-semibold hover:bg-[#a6762d] cursor-pointer"
                              >
                                Nilai Karya
                              </button>
                              {!isJuri && entry.registration_status === 'TERVERIFIKASI' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(entry.registration_id, 'LOLOS_TAHAP_1')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-semibold hover:bg-indigo-800 cursor-pointer"
                                >
                                  Loloskan <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                              {!isJuri && entry.registration_status === 'LOLOS_TAHAP_1' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(entry.registration_id, 'FINALIS')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 cursor-pointer"
                                >
                                  Finalis <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BROADCAST PENGUMUMAN */}
            {!isJuri && activeTab === 'broadcast' && (
              <div className="space-y-5">
                <form onSubmit={handleCreateBroadcast} className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                  <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Kirim Broadcast Pengumuman Peserta</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Judul Pengumuman *</label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="Contoh: Tautan Zoom Technical Meeting"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Target Cabang Lomba</label>
                      <select
                        value={annCompId}
                        onChange={(e) => setAnnCompId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs bg-white"
                      >
                        <option value="">Semua Cabang Lomba</option>
                        {competitions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Isi Pengumuman (Teks Murni) *</label>
                    <textarea
                      rows={4}
                      required
                      value={annBody}
                      onChange={(e) => setAnnBody(e.target.value)}
                      placeholder="Tulis pengumuman yang akan muncul langsung di Dashboard Peserta..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-[#2f1e10] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annPinned}
                      onChange={(e) => setAnnPinned(e.target.checked)}
                      className="accent-[#ba883a]"
                    />
                    <span>Sematkan (Pin) sebagai pengumuman prioritas</span>
                  </label>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-full bg-[#ba883a] text-white text-xs font-semibold hover:bg-[#a6762d] cursor-pointer"
                  >
                    {actionLoading ? 'Mengirim...' : 'Kirim Broadcast Sekarang'}
                  </button>
                </form>

                <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-3">
                  <h4 className="font-cormorant text-xl font-semibold text-[#2f1e10]">Riwayat Broadcast ({announcements.length})</h4>
                  {announcements.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#faf4e8]/60 border border-dashed border-[#d8be99] text-center text-xs text-[#7a5530]">
                      Belum ada pengumuman yang dikirim ke peserta.
                    </div>
                  ) : (
                    announcements.map((a) => (
                      <div
                        key={a.id}
                        className="p-3.5 rounded-xl bg-[#faf4e8]/60 border border-[#ebdcc8] flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#2f1e10] flex items-center gap-1.5">
                            {a.is_pinned && <Pin className="w-3 h-3 text-[#ba883a]" />}
                            {a.title}
                          </p>
                          <p className="text-xs text-[#5c3e28] mt-1 whitespace-pre-line">{a.body}</p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            await AdminApi.deleteAnnouncement(a.id);
                            await loadBaseData();
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* REKAP CSV */}
            {!isJuri && activeTab === 'export' && (
              <div className="bg-white/95 rounded-2xl p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Ekspor Rekap Data Peserta (CSV)</h3>
                <p className="text-xs text-[#7a5530]">
                  Unduh rekapitulasi peserta lengkap beserta asal perguruan tinggi, kontak WhatsApp, status verifikasi, dan skor juri.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={AdminApi.getExportCsvUrl()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2f1e10] text-[#faf4e8] text-xs font-semibold hover:bg-[#462d18]"
                  >
                    <Download className="w-4 h-4" /> Unduh Semua Lomba (CSV)
                  </a>
                  {competitions.map((c) => (
                    <a
                      key={c.id}
                      href={AdminApi.getExportCsvUrl(c.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#caa152] text-[#2f1e10] text-xs font-semibold hover:bg-[#faf4e8]"
                    >
                      <Download className="w-4 h-4" /> Rekap {c.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Tolak Pendaftaran */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#caa152] shadow-2xl">
            <h4 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Tolak / Minta Revisi Berkas</h4>
            <p className="text-xs text-[#7a5530]">
              Peserta: <strong>{rejectTarget.team_name || rejectTarget.user?.name}</strong> ({rejectTarget.registration_code})
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tuliskan alasan penolakan (contoh: Nominal bukti QRIS tidak sesuai / KTM buram)..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-lg text-xs text-[#7a5530] hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading || rejectReason.trim().length < 3}
                onClick={() => handleStatusChange(rejectTarget.id, 'DITOLAK', rejectReason.trim())}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                Kirim Catatan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Nilai Rubrik Juri */}
      {scoringEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitScore} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#caa152] shadow-2xl">
            <h4 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Lembar Penilaian Juri ({juryRound})</h4>
            <p className="text-xs text-[#7a5530]">
              {scoringEntry.submission_title} · <strong>{scoringEntry.team_name || scoringEntry.leader_name}</strong>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Orisinalitas (0–100)', val: scoreOrisinalitas, set: setScoreOrisinalitas },
                { label: 'Ketajaman Analisis (0–100)', val: scoreAnalisis, set: setScoreAnalisis },
                { label: 'Inovasi & Kelayakan (0–100)', val: scoreInovasi, set: setScoreInovasi },
                { label: 'Sistematika Penulisan (0–100)', val: scoreSistematika, set: setScoreSistematika },
              ].map((item, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-[#2f1e10] mb-1">{item.label}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={item.val}
                    onChange={(e) => item.set(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Catatan / Evaluasi Juri</label>
              <textarea
                rows={3}
                value={scoreFeedback}
                onChange={(e) => setScoreFeedback(e.target.value)}
                placeholder="Masukkan evaluasi konstruktif untuk peserta..."
                className="w-full px-3 py-2 rounded-xl border border-[#d8be99] text-xs"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-[#ba883a]">
                Rata-rata: {((scoreOrisinalitas + scoreAnalisis + scoreInovasi + scoreSistematika) / 4).toFixed(2)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScoringEntry(null)}
                  className="px-4 py-2 rounded-lg text-xs text-[#7a5530] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-[#ba883a] text-white text-xs font-semibold hover:bg-[#a6762d] cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};
