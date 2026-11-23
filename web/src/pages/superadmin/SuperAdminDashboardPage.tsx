import React, { useState } from 'react';
import { DashboardLayout, SidebarNavItem } from '../../layouts/DashboardLayout';
import { AdminAccount, Registration, SystemSettings, UserProfile } from '../../types';
import { RegistrationService } from '../../services/registrationService';
import {
  KeyRound,
  Settings,
  Users,
  History,
  Check,
  ShieldCheck,
  Save,
  Plus,
  Download,
  UserCheck,
  UserX,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface SuperAdminDashboardPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => void;
}

export const SuperAdminDashboardPage: React.FC<SuperAdminDashboardPageProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<'BATCH' | 'SETTINGS' | 'ADMINS' | 'LOGS'>('BATCH');
  const [registrations, setRegistrations] = useState<Registration[]>(() => RegistrationService.getAll());
  const [settings, setSettings] = useState<SystemSettings>(() => RegistrationService.getSettings());
  const [admins, setAdmins] = useState<AdminAccount[]>(() => RegistrationService.getAdmins());
  const [logs, setLogs] = useState(() => RegistrationService.getLogs());

  // Batch message
  const [batchMsg, setBatchMsg] = useState('');
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // New Admin Form State
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDivision, setNewAdminDivision] = useState('Divisi Acara & Verifikasi');
  const [newAdminRole, setNewAdminRole] = useState<'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  const pendingCount = registrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;

  const handleBatchApprove = () => {
    const result = RegistrationService.batchApprove(currentUser.name);
    setRegistrations(result.data);
    setLogs(RegistrationService.getLogs());
    setBatchMsg(`Berhasil menyetujui ${result.count} berkas pendaftaran pendaftar serentak!`);
    setTimeout(() => setBatchMsg(''), 5000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = RegistrationService.saveSettings(settings, currentUser.name);
    setSettings(updated);
    setLogs(RegistrationService.getLogs());
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 4000);
  };

  const handleToggleAdminStatus = (id: string) => {
    const updated = RegistrationService.toggleAdminStatus(id, currentUser.name);
    setAdmins(updated);
    setLogs(RegistrationService.getLogs());
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;

    const newAdmin: AdminAccount = {
      id: 'adm-' + Date.now(),
      name: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      division: newAdminDivision,
      status: 'ACTIVE',
      lastActive: 'Baru dibuat'
    };

    const updated = RegistrationService.addAdmin(newAdmin, currentUser.name);
    setAdmins(updated);
    setLogs(RegistrationService.getLogs());
    setShowAddAdminModal(false);
    setNewAdminName('');
    setNewAdminEmail('');
  };

  const superAdminNavItems: SidebarNavItem[] = [
    { id: 'BATCH', label: 'Batch Verifikasi', icon: <Check className="w-4 h-4" />, badge: pendingCount },
    { id: 'SETTINGS', label: 'Pengaturan Sistem', icon: <Settings className="w-4 h-4" /> },
    { id: 'ADMINS', label: 'Manajemen Panitia', icon: <Users className="w-4 h-4" />, badge: admins.length },
    { id: 'LOGS', label: 'Audit Aktivitas', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout
      currentUser={currentUser}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
      navItems={superAdminNavItems}
      activeTab={activeTab}
      onSelectTab={(tabId) => setActiveTab(tabId as any)}
    >
      <div className="space-y-6 animate-in fade-in">

        {/* ================= 1. HEADER BANNER ================= */}
        <div
          className="p-6 sm:p-8 rounded-3xl border-2 border-[#caa152] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{
            background: 'radial-gradient(circle at 10% 20%, #2f1e10 0%, #3e2715 60%, #1a1008 100%)'
          }}
        >
          <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

          <div className="space-y-2 relative z-10 text-white">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold font-sans uppercase tracking-widest text-[#caa152]">
                Otoritas Tertinggi Komite Penyelenggara
              </span>
              <span className="text-[10px] text-[#caa152]">✦</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f5eee2] font-sans">
              Panel Superadmin & Steering Committee
            </h1>
            <p className="text-xs text-[#cfbc9f] font-sans">
              Manajemen hak akses panitia, pengaturan kuota & tenggat waktu kompetisi, verifikasi massal, dan audit log jejak aktivitas sistem.
            </p>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={() => RegistrationService.exportToCSV(registrations)}
              className="px-4 py-2 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] text-xs font-semibold font-sans tracking-wider flex items-center gap-1.5 border border-[#caa152] shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#7a5530]" />
              <span>Ekspor Rekap CSV</span>
            </button>
          </div>
        </div>



        {/* ================= TAB 1: VERIFIKASI MASSAL ================= */}
        {activeTab === 'BATCH' && (
          <div className="space-y-4">
            {batchMsg && (
              <div className="p-4 rounded-2xl bg-[#f0e3cc] border border-[#7a5530] text-xs font-semibold text-[#2f1e10] flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-[#7a5530]" />
                <span>{batchMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Batch Card */}
              <div className="p-6 rounded-3xl bg-[#fffdf9] border-2 border-[#caa152] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2f1e10] flex items-center justify-center text-[#caa152]">
                    <ShieldCheck className="w-5 h-5 text-[#caa152]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                      Verifikasi Massal Sekali Klik
                    </h3>
                    <p className="text-xs text-[#7a5530]">
                      Menyetujui serentak seluruh berkas pendaftaran dengan status <em>MENUNGGU_VERIFIKASI</em>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7a5530]">Jumlah Berkas Menunggu:</span>
                    <span className="font-bold font-mono text-base text-[#ba883a]">
                      {pendingCount} Pendaftar
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5c3e28] leading-relaxed">
                    Setelah disetujui, sistem otomatis mengaktifkan status <strong>TERVERIFIKASI</strong> pada akun peserta dan membuka tautan grup WhatsApp resmi secara instan.
                  </p>
                </div>

                <button
                  onClick={handleBatchApprove}
                  disabled={pendingCount === 0}
                  className="w-full py-3 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold font-sans tracking-wider border border-[#caa152] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#caa152]" />
                  <span>SETUJUI SEMUA BERKAS MENUNGGU ({pendingCount})</span>
                </button>
              </div>

              {/* Status Overview Card */}
              <div className="p-6 rounded-3xl bg-[#fffdf9]/96 backdrop-blur-xs border border-[#dfd0ba] shadow-sm shadow-xs space-y-4">
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Distribusi Status Pendaftar
                </h3>
                <div className="space-y-2.5 text-xs text-[#5c3e28]">
                  <div className="flex justify-between py-1.5 border-b border-[#ebdcc8]">
                    <span>Menunggu Verifikasi:</span>
                    <span className="font-mono font-bold text-[#ba883a]">{pendingCount}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#ebdcc8]">
                    <span>Terverifikasi:</span>
                    <span className="font-mono font-bold text-[#2f1e10]">
                      {registrations.filter((r) => r.status === 'TERVERIFIKASI').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#ebdcc8]">
                    <span>Lolos Tahap 1:</span>
                    <span className="font-mono font-bold text-[#2f1e10]">
                      {registrations.filter((r) => r.status === 'LOLOS_TAHAP_1').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#ebdcc8]">
                    <span>Finalis:</span>
                    <span className="font-mono font-bold text-[#2f1e10]">
                      {registrations.filter((r) => r.status === 'FINALIS').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#ebdcc8]">
                    <span>Ditolak / Perlu Revisi:</span>
                    <span className="font-mono font-bold text-[#7a5530]">
                      {registrations.filter((r) => r.status === 'DITOLAK').length}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 2: PENGATURAN SISTEM & KUOTA ================= */}
        {activeTab === 'SETTINGS' && (
          <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-[#fffdf9] border-2 border-[#caa152] shadow-xs space-y-6">
            <div className="border-b border-[#ebdcc8] pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold font-sans text-[#2f1e10]">
                  Konfigurasi Jadwal & Kuota Resmi
                </h3>
                <p className="text-xs text-[#5c3e28]">
                  Perubahan pengaturan di bawah ini langsung berlaku secara global pada seluruh portal pendaftar.
                </p>
              </div>

              {saveSettingsSuccess && (
                <div className="px-3.5 py-1.5 rounded-full bg-[#f0e3cc] border border-[#7a5530] text-xs font-semibold text-[#2f1e10] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#7a5530]" />
                  <span>Pengaturan Disimpan!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Toggle Status Pendaftaran */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8] flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold font-sans text-[#2f1e10]">
                    Status Pendaftaran Publik
                  </h4>
                  <p className="text-xs text-[#7a5530]">
                    Jika ditutup, calon peserta baru tidak dapat mengakses formulir pendaftaran.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isRegistrationOpen: !settings.isRegistrationOpen })}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#caa152] bg-white text-xs font-cinzel font-semibold text-[#2f1e10]"
                >
                  {settings.isRegistrationOpen ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-[#caa152]" />
                      <span>PENDAFTARAN DIBUKA</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-[#7a5530]" />
                      <span>PENDAFTARAN DITUTUP</span>
                    </>
                  )}
                </button>
              </div>

              {/* Deadline Registrasi */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Batas Waktu Pendaftaran:
                </label>
                <input
                  type="text"
                  value={settings.registrationDeadline}
                  onChange={(e) => setSettings({ ...settings, registrationDeadline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              {/* Deadline Submission Karya */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Batas Pengumpulan Karya:
                </label>
                <input
                  type="text"
                  value={settings.submissionDeadline}
                  onChange={(e) => setSettings({ ...settings, submissionDeadline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              {/* Kuota Esai */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Batas Kuota Esai Nasional (Peserta):
                </label>
                <input
                  type="number"
                  value={settings.maxQuotaEsai}
                  onChange={(e) => setSettings({ ...settings, maxQuotaEsai: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              {/* Kuota Mini Case */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Batas Kuota Mini Case (Tim):
                </label>
                <input
                  type="number"
                  value={settings.maxQuotaCase}
                  onChange={(e) => setSettings({ ...settings, maxQuotaCase: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              {/* Link WA Esai */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Tautan Grup WhatsApp Esai:
                </label>
                <input
                  type="url"
                  value={settings.whatsappGroupEsai}
                  onChange={(e) => setSettings({ ...settings, whatsappGroupEsai: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10] font-mono text-[11px]"
                />
              </div>

              {/* Link WA Case */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Tautan Grup WhatsApp Mini Case:
                </label>
                <input
                  type="url"
                  value={settings.whatsappGroupCase}
                  onChange={(e) => setSettings({ ...settings, whatsappGroupCase: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10] font-mono text-[11px]"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-[#ebdcc8] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold font-sans tracking-wider flex items-center gap-2 border border-[#caa152] transition-all"
              >
                <Save className="w-4 h-4 text-[#caa152]" />
                <span>SIMPAN PERUBAHAN PENGATURAN</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 3: MANAJEMEN AKUN PANITIA ================= */}
        {activeTab === 'ADMINS' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Daftar Panitia & Pengelola Akses
                </h3>
                <p className="text-xs text-[#5c3e28]">
                  Kelola staf panitia yang memiliki wewenang untuk memeriksa data, verifikasi berkas, dan menilai karya peserta.
                </p>
              </div>

              <button
                onClick={() => setShowAddAdminModal(true)}
                className="px-4 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold font-sans tracking-wider flex items-center gap-1.5 border border-[#caa152]"
              >
                <Plus className="w-3.5 h-3.5 text-[#caa152]" />
                <span>Tambah Akun Panitia</span>
              </button>
            </div>

            <div className="bg-[#fffdf9] rounded-2xl border border-[#ebdcc8] overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf4e8] border-b border-[#ebdcc8] text-[#7a5530] font-cinzel font-semibold text-[10px] tracking-wider uppercase">
                    <th className="py-3 px-4">Nama Panitia</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Divisi Kerja</th>
                    <th className="py-3 px-4 text-center">Status Akses</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5ede0]">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-[#faf4e8]/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#2f1e10]">
                        {admin.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#7a5530] font-mono text-[11px]">
                        {admin.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-semibold tracking-wider border ${admin.role === 'SUPERADMIN'
                          ? 'bg-[#2f1e10] text-[#caa152] border-[#caa152]'
                          : 'bg-[#faf4e8] text-[#7a5530] border-[#ebdcc8]'
                          }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5c3e28]">
                        {admin.division}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-semibold ${admin.status === 'ACTIVE'
                          ? 'bg-[#f0e3cc] text-[#2f1e10] border border-[#caa152]'
                          : 'bg-[#f5ede0] text-[#7a5530] border border-[#d8be99]'
                          }`}>
                          {admin.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {admin.role !== 'SUPERADMIN' && (
                          <button
                            onClick={() => handleToggleAdminStatus(admin.id)}
                            className="text-[10px] font-cinzel font-semibold underline text-[#7a5530] hover:text-[#2f1e10]"
                          >
                            {admin.status === 'ACTIVE' ? 'Tangguhkan' : 'Aktifkan'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: AUDIT ACTIVITY LOG ================= */}
        {activeTab === 'LOGS' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Audit Trail & Jejak Aktivitas Panitia
                </h3>
                <p className="text-xs text-[#5c3e28]">
                  Rekaman seluruh aksi verifikasi, penilaian juri, perubahan pengaturan, dan pendaftaran secara kronologis.
                </p>
              </div>
              <span className="text-xs font-semibold font-sans text-[#7a5530] bg-[#faf4e8] px-3 py-1 rounded-full border border-[#ebdcc8]">
                {logs.length} Log Tersimpan
              </span>
            </div>

            <div className="bg-[#fffdf9] rounded-2xl border border-[#ebdcc8] divide-y divide-[#f5ede0] overflow-hidden shadow-2xs">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#faf4e8]/60 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-[9px] font-semibold text-[#caa152] bg-[#2f1e10] px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-[#2f1e10]">
                        {log.actor}
                      </span>
                    </div>
                    <p className="text-xs text-[#5c3e28] font-sans">
                      {log.detail}
                    </p>
                  </div>

                  <span className="text-[11px] font-mono text-[#7a5530] shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Tambah Admin */}
        {showAddAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <form onSubmit={handleCreateAdmin} className="bg-[#fffdf9] rounded-3xl p-6 sm:p-7 max-w-md w-full border-2 border-[#caa152] shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8]">
                <h3 className="text-xl font-bold font-sans text-[#2f1e10]">
                  Tambah Akun Panitia Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="w-7 h-7 rounded-full bg-[#faf4e8] text-[#7a5530] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Nama Lengkap Panitia:
                </label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Contoh: Rian Anggara"
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Email Akun:
                </label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="rian@diginomic.id"
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Divisi Kerja:
                </label>
                <input
                  type="text"
                  required
                  value={newAdminDivision}
                  onChange={(e) => setNewAdminDivision(e.target.value)}
                  placeholder="Contoh: Divisi Verifikasi & Helpdesk"
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                />
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] uppercase mb-1">
                  Hak Akses Peran:
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#ebdcc8] text-xs bg-white text-[#2f1e10]"
                >
                  <option value="ADMIN">Admin Panitia Pelaksana</option>
                  <option value="SUPERADMIN">Superadmin (Steering Committee)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#ebdcc8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 rounded-full border border-[#ebdcc8] text-xs font-cinzel font-semibold text-[#7a5530]"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-cinzel font-semibold border border-[#caa152]"
                >
                  SIMPAN AKUN PANITIA
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
