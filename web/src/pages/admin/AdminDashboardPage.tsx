import React, { useState } from 'react';
import { DashboardLayout, SidebarNavItem } from '../../layouts/DashboardLayout';
import { Registration, RegistrationStatus, UserProfile } from '../../types';
import { RegistrationService } from '../../services/registrationService';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Check,
  X,
  MessageSquare,
  ExternalLink,
  FileText,
  Award,
  PieChart,
  Send,
  Users,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface AdminDashboardPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>(() => RegistrationService.getAll());
  const [activeTab, setActiveTab] = useState<'VERIFIKASI' | 'PENJURIAN' | 'REKAP' | 'BROADCAST'>('VERIFIKASI');

  // Filters for Verifikasi tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [competitionFilter, setCompetitionFilter] = useState<string>('ALL');

  // Modals
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Scoring Modal
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreTargetReg, setScoreTargetReg] = useState<Registration | null>(null);
  const [inputScore, setInputScore] = useState<number>(85);
  const [inputRound, setInputRound] = useState<'TAHAP_1' | 'FINAL'>('TAHAP_1');
  const [inputFeedback, setInputFeedback] = useState('');

  // Broadcast WA State
  const [broadcastTargetId, setBroadcastTargetId] = useState<string>('');
  const [broadcastType, setBroadcastType] = useState<'REMINDER_SUBMIT' | 'LOLOS_TAHAP_1' | 'PANGGILAN_FINAL'>('REMINDER_SUBMIT');

  const settings = RegistrationService.getSettings();

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.registrationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesComp = competitionFilter === 'ALL' || r.competitionId === competitionFilter;

    return matchesSearch && matchesStatus && matchesComp;
  });

  // Submitted works list
  const submittedWorks = registrations.filter((r) => r.submission && r.submission.driveLink);

  // Statistics
  const totalCount = registrations.length;
  const pendingCount = registrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const verifiedCount = registrations.filter((r) => r.status === 'TERVERIFIKASI').length;
  const rejectedCount = registrations.filter((r) => r.status === 'DITOLAK').length;
  const submittedCount = submittedWorks.length;

  const esaiCount = registrations.filter((r) => r.competitionId === 'comp-1').length;
  const caseCount = registrations.filter((r) => r.competitionId === 'comp-2').length;

  // Actions
  const handleApprove = (regId: string) => {
    const updated = RegistrationService.updateStatus(regId, 'TERVERIFIKASI', undefined, currentUser.name);
    setRegistrations(updated);
  };

  const handleRejectSubmit = () => {
    if (!selectedReg || !rejectReason.trim()) {
      alert('Mohon tuliskan alasan penolakan atau instruksi perbaikan.');
      return;
    }
    const updated = RegistrationService.updateStatus(selectedReg.id, 'DITOLAK', rejectReason, currentUser.name);
    setRegistrations(updated);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreTargetReg) return;
    const updated = RegistrationService.scoreSubmission(
      scoreTargetReg.id,
      inputScore,
      inputRound,
      inputFeedback,
      currentUser.name
    );
    setRegistrations(updated);
    setShowScoreModal(false);
  };

  const handleExportCSV = () => {
    RegistrationService.exportToCSV(registrations);
  };

  const handleChatWA = (reg: Registration, customMsg?: string) => {
    const defaultMsg = `Halo Kak ${reg.participantName}, kami dari Panitia Digiconomic Fest 2027 terkait pendaftaran Anda (#${reg.registrationCode}) untuk cabang ${reg.competitionTitle}.`;
    const url = RegistrationService.buildWhatsAppChatUrl(reg.phoneWa, customMsg || defaultMsg);
    window.open(url, '_blank');
  };

  const adminNavItems: SidebarNavItem[] = [
    { id: 'VERIFIKASI', label: 'Verifikasi Berkas', icon: <ShieldCheck className="w-4 h-4" />, badge: pendingCount },
    { id: 'PENJURIAN', label: 'Penjurian Karya', icon: <Award className="w-4 h-4" />, badge: submittedCount },
    { id: 'REKAP', label: 'Rekap & Kuota', icon: <PieChart className="w-4 h-4" /> },
    { id: 'BROADCAST', label: 'Broadcast WhatsApp', icon: <Send className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout
      currentUser={currentUser}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
      navItems={adminNavItems}
      activeTab={activeTab}
      onSelectTab={(tabId) => setActiveTab(tabId as any)}
    >
      <div className="space-y-6 animate-in fade-in">

        {/* ================= 1. HEADER & METRICS SUMMARY ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#ebdcc8] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-[10px] font-semibold uppercase tracking-widest text-[#7a5530]">
                Internal Panitia Pelaksana
              </span>
              <span className="text-[10px] text-[#caa152]">✦</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2f1e10] font-sans">
              Dashboard Administrasi & Verifikasi Lomba
            </h1>
            <p className="text-xs text-[#5c3e28]">
              Kendali terpusat verifikasi pendaftar, penilaian naskah kompetisi, monitoring kuota, dan korespondensi WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] text-xs font-semibold font-sans tracking-wider flex items-center gap-2 border border-[#caa152] shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#7a5530]" />
              <span>Ekspor CSV Rekap</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] shadow-2xs">
            <p className="text-[11px] uppercase font-semibold text-[#7a5530] font-sans tracking-wider">Total Pendaftar</p>
            <p className="text-2xl font-bold font-sans text-[#2f1e10] mt-1">{totalCount}</p>
            <span className="text-[10px] text-[#7a5530]">Esai: {esaiCount} • Case: {caseCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf4e8] border-2 border-[#caa152] shadow-2xs">
            <p className="text-[11px] uppercase font-semibold text-[#7a5530] font-sans tracking-wider">Menunggu Verifikasi</p>
            <p className="text-2xl font-bold font-sans text-[#ba883a] mt-1">{pendingCount}</p>
            <span className="text-[10px] text-[#ba883a] font-medium">Perlu review berkas</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] shadow-2xs">
            <p className="text-[11px] uppercase font-semibold text-[#7a5530] font-sans tracking-wider">Terverifikasi</p>
            <p className="text-2xl font-bold font-sans text-[#2f1e10] mt-1">{verifiedCount}</p>
            <span className="text-[10px] text-[#7a5530]">Siap kumpul karya</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] shadow-2xs">
            <p className="text-[11px] uppercase font-semibold text-[#7a5530] font-sans tracking-wider">Karya Terkumpul</p>
            <p className="text-2xl font-bold font-sans text-[#7a5530] mt-1">{submittedCount}</p>
            <span className="text-[10px] text-[#7a5530]">Menunggu / sudah dinilai</span>
          </div>
        </div>



        {/* ================= TAB 1: VERIFIKASI BERKAS & PEMBAYARAN ================= */}
        {activeTab === 'VERIFIKASI' && (
          <div className="space-y-4">

            {/* Search & Filters */}
            <div className="bg-[#fffdf9] p-4 rounded-2xl border border-[#ebdcc8] flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7a5530]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama peserta, ID registrasi, kampus, atau nama tim..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#faf4e8]/60 border border-[#ebdcc8] text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-white border border-[#ebdcc8] text-xs font-cinzel font-semibold text-[#2f1e10] focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                  <option value="TERVERIFIKASI">Terverifikasi</option>
                  <option value="LOLOS_TAHAP_1">Lolos Tahap 1</option>
                  <option value="FINALIS">Finalis</option>
                  <option value="JUARA">Juara</option>
                  <option value="DITOLAK">Ditolak / Revisi</option>
                </select>

                <select
                  value={competitionFilter}
                  onChange={(e) => setCompetitionFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-white border border-[#ebdcc8] text-xs font-cinzel font-semibold text-[#2f1e10] focus:outline-none"
                >
                  <option value="ALL">Semua Cabang</option>
                  <option value="comp-1">Esai Nasional</option>
                  <option value="comp-2">Mini Case Competition</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#fffdf9] rounded-2xl border border-[#ebdcc8] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf4e8] border-b border-[#ebdcc8] text-[#7a5530] font-cinzel font-semibold text-[10px] tracking-wider uppercase">
                      <th className="py-3 px-4">ID & Tanggal</th>
                      <th className="py-3 px-4">Nama Peserta / Tim</th>
                      <th className="py-3 px-4">Cabang Lomba</th>
                      <th className="py-3 px-4">Institusi & Kontak</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5ede0]">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#7a5530] font-sans">
                          Tidak ditemukan data pendaftar yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-[#faf4e8]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-[#7a5530] text-[11px] block">
                              #{reg.registrationCode}
                            </span>
                            <span className="text-[10px] text-[#7a5530] block">{reg.registeredAt}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-sm text-[#2f1e10] block">{reg.participantName}</span>
                            {reg.isTeam && (
                              <span className="text-[10px] text-[#ba883a] font-cinzel uppercase tracking-wider block">
                                Tim: {reg.teamName || 'Tim'} ({reg.teamMembers?.length ? reg.teamMembers.length + 1 : 1} orang)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-[#2f1e10] block">{reg.competitionTitle}</span>
                            <span className="text-[10px] font-mono text-[#7a5530]">
                              Rp {reg.fee.toLocaleString('id-ID')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="block text-[#2f1e10]">{reg.institution}</span>
                            <button
                              onClick={() => handleChatWA(reg)}
                              className="text-[10px] text-[#7a5530] font-semibold hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <MessageSquare className="w-3 h-3 text-[#caa152]" />
                              <span>{reg.phoneWa} (Chat WA)</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-semibold tracking-wider ${reg.status === 'TERVERIFIKASI'
                              ? 'bg-[#f0e3cc] text-[#2f1e10] border border-[#caa152]'
                              : reg.status === 'MENUNGGU_VERIFIKASI'
                                ? 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8]'
                                : reg.status === 'DITOLAK'
                                  ? 'bg-[#f5ede0] text-[#7a5530] border border-[#d8be99]'
                                  : 'bg-[#2f1e10] text-[#caa152] border border-[#caa152]'
                              }`}>
                              {reg.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Detail Button */}
                              <button
                                onClick={() => {
                                  setSelectedReg(reg);
                                  setShowDetailModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-[#faf4e8] text-[#7a5530] hover:text-[#2f1e10] hover:bg-[#f0e3cc] transition-colors border border-[#ebdcc8]"
                                title="Lihat Berkas & Detail"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {reg.status === 'MENUNGGU_VERIFIKASI' ? (
                                <>
                                  <button
                                    onClick={() => handleApprove(reg.id)}
                                    className="px-3 py-1 rounded-lg bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-[10px] font-semibold tracking-wider border border-[#caa152] shadow-2xs flex items-center gap-1"
                                    title="Setujui Pendaftaran"
                                  >
                                    <Check className="w-3 h-3 text-[#caa152]" />
                                    <span>Setujui</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedReg(reg);
                                      setShowRejectModal(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#faf4e8] hover:bg-[#f5ede0] text-[#7a5530] font-cinzel text-[10px] font-semibold tracking-wider border border-[#7a5530]"
                                    title="Tolak / Minta Revisi"
                                  >
                                    Tolak
                                  </button>
                                </>
                              ) : (
                                <select
                                  value={reg.status}
                                  onChange={(e) => {
                                    const updated = RegistrationService.updateStatus(reg.id, e.target.value as RegistrationStatus, undefined, currentUser.name);
                                    setRegistrations(updated);
                                  }}
                                  className="bg-[#faf4e8] text-[10px] font-cinzel font-semibold px-2 py-1 rounded-lg border border-[#caa152] text-[#2f1e10] focus:outline-none"
                                >
                                  <option value="TERVERIFIKASI">Terverifikasi</option>
                                  <option value="LOLOS_TAHAP_1">Lolos Tahap 1</option>
                                  <option value="FINALIS">Finalis</option>
                                  <option value="JUARA">Juara</option>
                                  <option value="DITOLAK">Ditolak</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: MANAJEMEN KARYA & PENJURIAN ================= */}
        {activeTab === 'PENJURIAN' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Daftar Naskah & Pengumpulan Karya
                </h3>
                <p className="text-xs text-[#5c3e28]">
                  Dewan juri dapat membuka tautan Google Drive peserta dan memberikan skor penilaian serta umpan balik ilmiah.
                </p>
              </div>
              <span className="text-xs font-semibold font-sans text-[#7a5530] bg-[#faf4e8] px-3 py-1 rounded-full border border-[#ebdcc8]">
                {submittedWorks.length} Naskah Terkumpul
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submittedWorks.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-[#7a5530] bg-[#fffdf9] rounded-2xl border border-[#ebdcc8]">
                  Belum ada peserta yang mengumpulkan naskah karya.
                </div>
              ) : (
                submittedWorks.map((reg) => (
                  <div key={reg.id} className="p-5 rounded-2xl bg-[#fffdf9] border-2 border-[#caa152] shadow-xs space-y-3 relative">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-cinzel text-[10px] font-semibold text-[#7a5530] uppercase">
                          {reg.competitionTitle} • #{reg.registrationCode}
                        </span>
                        <h4 className="text-xl font-bold font-sans text-[#2f1e10] leading-snug">
                          "{reg.submission?.title}"
                        </h4>
                        <p className="text-xs text-[#7a5530]">
                          Oleh: <strong>{reg.participantName}</strong> ({reg.institution})
                        </p>
                      </div>

                      {reg.submission?.score ? (
                        <div className="text-center bg-[#faf4e8] p-2 rounded-xl border border-[#caa152] shrink-0">
                          <span className="font-cinzel text-[8px] uppercase tracking-wider text-[#7a5530] block">Skor Juri</span>
                          <span className="font-cormorant text-2xl font-bold text-[#ba883a] block leading-none">
                            {reg.submission.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-cinzel text-[#7a5530] bg-[#faf4e8] px-2 py-1 rounded border border-[#ebdcc8] shrink-0">
                          Belum Dinilai
                        </span>
                      )}
                    </div>

                    {reg.submission?.description && (
                      <p className="text-xs text-[#5c3e28] bg-[#faf4e8]/60 p-3 rounded-xl border border-[#ebdcc8] font-sans">
                        "{reg.submission.description}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#ebdcc8] flex items-center justify-between gap-2">
                      <a
                        href={reg.submission?.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-cinzel text-[#7a5530] hover:text-[#2f1e10] flex items-center gap-1.5 underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>Buka Naskah (Drive)</span>
                      </a>

                      <button
                        onClick={() => {
                          setScoreTargetReg(reg);
                          setInputScore(reg.submission?.score || 85);
                          setInputRound(reg.submission?.round || 'TAHAP_1');
                          setInputFeedback(reg.submission?.juryFeedback || '');
                          setShowScoreModal(true);
                        }}
                        className="px-4 py-1.5 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold font-sans tracking-wider border border-[#caa152] transition-all flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5 text-[#caa152]" />
                        <span>{reg.submission?.score ? 'Ubah Nilai' : 'Beri Nilai & Seleksi'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: REKAPITULASI & KUOTA LOMBA ================= */}
        {activeTab === 'REKAP' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Kuota Esai Nasional */}
              <div className="p-6 rounded-3xl bg-[#fffdf9] border-2 border-[#caa152] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-[10px] font-semibold text-[#7a5530] uppercase">
                    Monitoring Kuota 01
                  </span>
                  <span className="font-mono text-xs font-bold text-[#ba883a]">
                    {esaiCount} / {settings.maxQuotaEsai} Peserta
                  </span>
                </div>
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Esai Nasional (Individu)
                </h3>

                {/* Progress bar */}
                <div className="w-full bg-[#faf4e8] h-3 rounded-full border border-[#ebdcc8] overflow-hidden">
                  <div
                    className="btn-modern-shine bg-gradient-to-r from-[#ba883a] to-[#caa152] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (esaiCount / settings.maxQuotaEsai) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-[#7a5530]">
                  <span>Sisa Kuota: <strong>{Math.max(0, settings.maxQuotaEsai - esaiCount)} kursi</strong></span>
                  <span>Biaya: Rp 35.000 / orang</span>
                </div>
              </div>

              {/* Kuota Mini Case Competition */}
              <div className="p-6 rounded-3xl bg-[#fffdf9] border-2 border-[#caa152] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-[10px] font-semibold text-[#7a5530] uppercase">
                    Monitoring Kuota 02
                  </span>
                  <span className="font-mono text-xs font-bold text-[#ba883a]">
                    {caseCount} / {settings.maxQuotaCase} Tim
                  </span>
                </div>
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Mini Case Competition (Tim)
                </h3>

                {/* Progress bar */}
                <div className="w-full bg-[#faf4e8] h-3 rounded-full border border-[#ebdcc8] overflow-hidden">
                  <div
                    className="btn-modern-shine bg-gradient-to-r from-[#ba883a] to-[#caa152] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (caseCount / settings.maxQuotaCase) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-[#7a5530]">
                  <span>Sisa Kuota: <strong>{Math.max(0, settings.maxQuotaCase - caseCount)} tim</strong></span>
                  <span>Biaya: Rp 50.000 / tim</span>
                </div>
              </div>

            </div>

            {/* Financial Overview Banner */}
            <div className="p-6 rounded-3xl bg-[#faf4e8] border border-[#ebdcc8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Unduh Dokumen Rekapitulasi Lengkap
                </h4>
                <p className="text-xs text-[#5c3e28]">
                  File CSV memuat seluruh data pendaftar, kontak WhatsApp, nomor registrasi, link karya, dan status verifikasi.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-6 py-3 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold font-sans tracking-wider flex items-center gap-2 border border-[#caa152] transition-all shrink-0"
              >
                <Download className="w-4 h-4 text-[#caa152]" />
                <span>DOWNLOAD FILE REKAP CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: KOMUNIKASI & BROADCAST WA ================= */}
        {activeTab === 'BROADCAST' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-[#fffdf9] border-2 border-[#caa152] shadow-xs space-y-4">
              <div className="border-b border-[#ebdcc8] pb-3">
                <span className="font-cinzel text-[10px] font-semibold text-[#7a5530] uppercase">
                  Korespondensi Cepat
                </span>
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Template Siap Kirim WhatsApp Peserta
                </h3>
                <p className="text-xs text-[#5c3e28]">
                  Pilih peserta dan jenis pengumuman untuk langsung membuka pesan terformat di WhatsApp Web.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                    Pilih Target Peserta:
                  </label>
                  <select
                    value={broadcastTargetId}
                    onChange={(e) => setBroadcastTargetId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#ebdcc8] bg-white text-xs text-[#2f1e10]"
                  >
                    <option value="">-- Pilih Peserta --</option>
                    {registrations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.participantName} (#{r.registrationCode}) - {r.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                    Pilih Jenis Notifikasi:
                  </label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#ebdcc8] bg-white text-xs text-[#2f1e10]"
                  >
                    <option value="REMINDER_SUBMIT">Pengingat Pengumpulan Karya</option>
                    <option value="LOLOS_TAHAP_1">Pemberitahuan Lolos Seleksi Tahap 1</option>
                    <option value="PANGGILAN_FINAL">Undangan Babak Final & Presentasi</option>
                  </select>
                </div>
              </div>

              {/* Message Preview */}
              {broadcastTargetId && (
                <div className="p-4 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8] space-y-2">
                  <span className="font-cinzel text-[10px] font-semibold text-[#7a5530] uppercase">
                    Preview Teks Pesan:
                  </span>
                  <div className="p-3 bg-white rounded-xl border border-[#ebdcc8] font-mono text-xs text-[#2f1e10] whitespace-pre-wrap">
                    {(() => {
                      const target = registrations.find((r) => r.id === broadcastTargetId);
                      if (!target) return '';
                      if (broadcastType === 'REMINDER_SUBMIT') {
                        return `Halo Kak ${target.participantName},\nKami dari Panitia Digiconomic Fest 2027 mengingatkan bahwa batas akhir pengumpulan karya ${target.competitionTitle} adalah ${settings.submissionDeadline}.\nMohon segera unggah tautan karya Anda di portal peserta. Terima kasih!`;
                      } else if (broadcastType === 'LOLOS_TAHAP_1') {
                        return `Selamat Kak ${target.participantName}!\nNaskah Anda untuk cabang ${target.competitionTitle} dinyatakan LOLOS TAHAP 1 Seleksi Ilmiah Digiconomic Fest 2027. Silakan cek portal peserta untuk detail berikutnya.`;
                      } else {
                        return `Kabar Gembira Kak ${target.participantName}!\nAnda resmi terpilih sebagai FINALIS Digiconomic Fest 2027. Jadwal presentasi babak final dan gladi resik akan diinfokan di grup WhatsApp peserta.`;
                      }
                    })()}
                  </div>

                  <button
                    onClick={() => {
                      const target = registrations.find((r) => r.id === broadcastTargetId);
                      if (!target) return;
                      let msg = '';
                      if (broadcastType === 'REMINDER_SUBMIT') {
                        msg = `Halo Kak ${target.participantName},\nKami dari Panitia Digiconomic Fest 2027 mengingatkan bahwa batas akhir pengumpulan karya ${target.competitionTitle} adalah ${settings.submissionDeadline}.\nMohon segera unggah tautan karya Anda di portal peserta. Terima kasih!`;
                      } else if (broadcastType === 'LOLOS_TAHAP_1') {
                        msg = `Selamat Kak ${target.participantName}!\nNaskah Anda untuk cabang ${target.competitionTitle} dinyatakan LOLOS TAHAP 1 Seleksi Ilmiah Digiconomic Fest 2027. Silakan cek portal peserta untuk detail berikutnya.`;
                      } else {
                        msg = `Kabar Gembira Kak ${target.participantName}!\nAnda resmi terpilih sebagai FINALIS Digiconomic Fest 2027. Jadwal presentasi babak final dan gladi resik akan diinfokan di grup WhatsApp peserta.`;
                      }
                      handleChatWA(target, msg);
                    }}
                    className="mt-2 px-5 py-2.5 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold font-sans tracking-wider flex items-center gap-2 border border-[#caa152] transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-[#caa152]" />
                    <span>KIRIM SEKARANG VIA WHATSAPP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL DETAIL BERKAS & KTM ================= */}
        {showDetailModal && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-[#caa152] shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]">
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Detail Berkas Pendaftar
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-7 h-7 rounded-full bg-[#faf4e8] text-[#7a5530] hover:bg-[#2f1e10] hover:text-[#f5eee2] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs text-[#5c3e28]">
                <div className="flex justify-between py-1 border-b border-[#ebdcc8]">
                  <span>ID Registrasi:</span>
                  <span className="font-mono font-bold text-[#2f1e10]">#{selectedReg.registrationCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ebdcc8]">
                  <span>Nama Lengkap:</span>
                  <span className="font-bold text-[#2f1e10]">{selectedReg.participantName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ebdcc8]">
                  <span>Asal Kampus / Sekolah:</span>
                  <span className="text-[#2f1e10]">{selectedReg.institution}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ebdcc8]">
                  <span>Nomor WhatsApp:</span>
                  <span className="font-mono text-[#2f1e10]">{selectedReg.phoneWa}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ebdcc8]">
                  <span>Email:</span>
                  <span className="text-[#2f1e10]">{selectedReg.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ebdcc8]">
                  <span>Cabang Kompetisi:</span>
                  <span className="font-semibold text-[#2f1e10]">{selectedReg.competitionTitle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ebdcc8]">
                  <span>Dokumen KTM / Pelajar:</span>
                  <span className="font-mono text-[#caa152] font-semibold">{selectedReg.studentCardName || 'KTM_Peserta.pdf'}</span>
                </div>

                {selectedReg.isTeam && selectedReg.teamMembers && (
                  <div className="pt-2">
                    <p className="font-cinzel text-[10px] font-semibold text-[#7a5530] uppercase mb-1">
                      Anggota Tim ({selectedReg.teamName}):
                    </p>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                      {selectedReg.teamMembers.map((m, i) => (
                        <li key={i}>
                          {m.fullName} - {m.institution} ({m.phoneWa})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#ebdcc8] flex justify-end gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-full border border-[#ebdcc8] text-xs font-cinzel font-semibold text-[#7a5530] hover:bg-[#faf4e8]"
                >
                  TUTUP
                </button>
                {selectedReg.status === 'MENUNGGU_VERIFIKASI' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedReg.id);
                      setShowDetailModal(false);
                    }}
                    className="px-5 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-cinzel font-semibold border border-[#caa152]"
                  >
                    SETUJUI SEKARANG
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL TOLAK / REVISI ================= */}
        {showRejectModal && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-[#fffdf9] rounded-3xl p-6 max-w-md w-full border-2 border-[#caa152] shadow-2xl space-y-3 relative">
              <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                Tolak / Minta Revisi Berkas
              </h3>
              <p className="text-xs text-[#7a5530]">
                Peserta: <strong>{selectedReg.participantName}</strong> (#{selectedReg.registrationCode})
              </p>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tuliskan alasan spesifik (misal: Bukti transfer terpotong, KTM tidak terbaca jelas)..."
                className="w-full p-3 rounded-xl border border-[#ebdcc8] text-xs bg-[#faf4e8] text-[#2f1e10] focus:outline-none focus:border-[#caa152]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-full border border-[#ebdcc8] text-xs font-cinzel font-semibold text-[#7a5530] hover:bg-[#faf4e8]"
                >
                  BATAL
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-5 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-cinzel font-semibold border border-[#caa152]"
                >
                  KIRIM REVISI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL PENILAIAN JURI ================= */}
        {showScoreModal && scoreTargetReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <form onSubmit={handleScoreSubmit} className="bg-[#fffdf9] rounded-3xl p-6 sm:p-7 max-w-md w-full border-2 border-[#caa152] shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8]">
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Formulir Penilaian Karya Juri
                </h3>
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="w-7 h-7 rounded-full bg-[#faf4e8] text-[#7a5530] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-xs text-[#7a5530]">
                  Peserta: <strong>{scoreTargetReg.participantName}</strong>
                </p>
                <p className="text-xs text-[#2f1e10] font-medium mt-0.5">
                  "{scoreTargetReg.submission?.title}"
                </p>
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Skor Penilaian (Skala 0 - 100):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={inputScore}
                  onChange={(e) => setInputScore(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] bg-white text-base font-bold text-[#ba883a]"
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Tentukan Kelulusan Babak:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputRound('TAHAP_1')}
                    className={`py-2 text-xs font-cinzel font-semibold rounded-xl border ${inputRound === 'TAHAP_1'
                      ? 'bg-[#2f1e10] text-[#f5eee2] border-[#caa152]'
                      : 'bg-white text-[#7a5530] border-[#ebdcc8]'
                      }`}
                  >
                    Lolos Tahap 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputRound('FINAL')}
                    className={`py-2 text-xs font-cinzel font-semibold rounded-xl border ${inputRound === 'FINAL'
                      ? 'bg-[#2f1e10] text-[#caa152] border-[#caa152]'
                      : 'bg-white text-[#7a5530] border-[#ebdcc8]'
                      }`}
                  >
                    Finalis Juara
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Catatan / Feedback Evaluasi Dewan Juri:
                </label>
                <textarea
                  rows={2}
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  placeholder="Catatan mengenai orisinalitas, kedalaman analisis, atau kelayakan implementasi..."
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              <div className="pt-2 border-t border-[#ebdcc8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="px-4 py-2 rounded-full border border-[#ebdcc8] text-xs font-cinzel font-semibold text-[#7a5530]"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-cinzel font-semibold border border-[#caa152]"
                >
                  SIMPAN PENILAIAN
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
