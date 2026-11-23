import React, { useState } from 'react';
import { Registration, RegistrationStatus } from '../types';
import { 
  ShieldCheck, Search, Filter, Download, CheckCircle, XCircle, 
  MessageSquare, User, Eye, Check, ExternalLink, ArrowUpDown, 
  Layers, Settings, RefreshCw, KeyRound
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: Registration[];
  onUpdateRegistrationStatus: (regId: string, newStatus: RegistrationStatus, reason?: string) => void;
  currentUserRole?: 'PESERTA' | 'ADMIN' | 'SUPERADMIN';
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  registrations,
  onUpdateRegistrationStatus,
  currentUserRole = 'SUPERADMIN',
}) => {
  const [activeTab, setActiveTab] = useState<'VERIFIKASI' | 'SUPERADMIN'>('VERIFIKASI');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [batchActionMsg, setBatchActionMsg] = useState('');

  if (!isOpen) return null;

  const filteredList = registrations.filter((reg) => {
    const matchesSearch = 
      reg.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.registrationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.competitionTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countPending = registrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const countVerified = registrations.filter((r) => r.status === 'TERVERIFIKASI').length;
  const countRejected = registrations.filter((r) => r.status === 'DITOLAK').length;

  const handleExportCSV = () => {
    const headers = ['ID Registrasi', 'Nama Peserta', 'Institusi', 'Nomor WA', 'Email', 'Lomba', 'Status', 'Tanggal Daftar'];
    const rows = filteredList.map(r => [
      r.registrationCode,
      `"${r.participantName}"`,
      `"${r.institution}"`,
      r.phoneWa,
      r.email,
      `"${r.competitionTitle}"`,
      r.status,
      r.registeredAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Pendaftar_Digiconomic_Fest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenChatPeserta = (reg: Registration) => {
    let phone = reg.phoneWa.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
    if (!phone.startsWith('62')) phone = '62' + phone;

    const message = 
`Halo Kak ${reg.participantName},
Kami dari Panitia Pendaftaran Digiconomic Fest 2027 mengenai pendaftaran Anda (#${reg.registrationCode}) untuk cabang ${reg.competitionTitle}.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSuperadminApproveAll = () => {
    registrations.forEach((r) => {
      if (r.status === 'MENUNGGU_VERIFIKASI') {
        onUpdateRegistrationStatus(r.id, 'TERVERIFIKASI');
      }
    });
    setBatchActionMsg('Seluruh pendaftar menunggu verifikasi berhasil disetujui serentak!');
    setTimeout(() => setBatchActionMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#fffdf9] rounded-3xl max-w-5xl w-full p-6 sm:p-8 border-2 border-[#caa152] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#ebdcc8] gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2f1e10] text-[#f5eee2] flex items-center justify-center shadow-xs border border-[#caa152]/40">
              <ShieldCheck className="w-6 h-6 text-[#caa152]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-[10px] font-semibold uppercase tracking-wider text-[#7a5530]">
                  PANEL KENDALI INTERNAL
                </span>
                <span className="font-cinzel text-[9px] bg-[#f0e3cc] text-[#2f1e10] px-2 py-0.5 rounded-full font-semibold border border-[#caa152]">
                  {currentUserRole === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN PANITIA'}
                </span>
              </div>
              <h2 className="font-cormorant text-2xl sm:text-3xl font-normal text-[#2f1e10]">
                Verifikasi & Manajemen Pendaftar
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-full bg-[#faf4e8] hover:bg-[#f5ede0] text-[#2f1e10] font-cinzel text-xs font-semibold flex items-center gap-1.5 border border-[#caa152] transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#7a5530]" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#faf4e8] text-[#7a5530] hover:bg-[#2f1e10] hover:text-[#f5eee2] flex items-center justify-center font-bold text-xs border border-[#ebdcc8] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher: Admin Verifikasi vs Superadmin Controls */}
        <div className="flex items-center gap-2 my-4 relative z-10">
          <button
            onClick={() => setActiveTab('VERIFIKASI')}
            className={`px-4 py-1.5 rounded-full font-cinzel text-xs font-semibold tracking-wider transition-all ${
              activeTab === 'VERIFIKASI'
                ? 'bg-[#2f1e10] text-[#f5eee2] shadow-xs'
                : 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8] hover:bg-[#f5ede0]'
            }`}
          >
            Daftar Verifikasi ({filteredList.length})
          </button>
          <button
            onClick={() => setActiveTab('SUPERADMIN')}
            className={`px-4 py-1.5 rounded-full font-cinzel text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'SUPERADMIN'
                ? 'bg-[#2f1e10] text-[#caa152] shadow-xs border border-[#caa152]'
                : 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8] hover:bg-[#f5ede0]'
            }`}
          >
            <KeyRound className="w-3 h-3 text-[#caa152]" />
            <span>Otoritas Superadmin</span>
          </button>
        </div>

        {/* Stats Badges (Strictly Official Palette) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8]">
            <p className="font-cinzel text-[10px] uppercase font-semibold text-[#7a5530] tracking-wider">Total Pendaftar</p>
            <p className="font-cormorant text-2xl font-bold text-[#2f1e10] mt-0.5">{registrations.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#faf4e8] border border-[#caa152]">
            <p className="font-cinzel text-[10px] uppercase font-semibold text-[#7a5530] tracking-wider">Menunggu Verifikasi</p>
            <p className="font-cormorant text-2xl font-bold text-[#caa152] mt-0.5">{countPending}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f5ede0] border border-[#7a5530]">
            <p className="font-cinzel text-[10px] uppercase font-semibold text-[#7a5530] tracking-wider">Terverifikasi</p>
            <p className="font-cormorant text-2xl font-bold text-[#2f1e10] mt-0.5">{countVerified}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#fbf7f0] border border-[#d8be99]">
            <p className="font-cinzel text-[10px] uppercase font-semibold text-[#7a5530] tracking-wider">Ditolak / Revisi</p>
            <p className="font-cormorant text-2xl font-bold text-[#7a5530] mt-0.5">{countRejected}</p>
          </div>
        </div>

        {/* TAB 1: VERIFIKASI TABEL */}
        {activeTab === 'VERIFIKASI' && (
          <div className="space-y-4 relative z-10">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#7a5530]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama peserta, ID registrasi, kampus, atau cabang lomba..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#ebdcc8] text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#7a5530] shrink-0" />
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
                  <option value="DITOLAK">Ditolak</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="border border-[#ebdcc8] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf4e8] border-b border-[#ebdcc8] text-[#7a5530] font-cinzel font-semibold text-[10px] tracking-wider uppercase">
                      <th className="py-3 px-4">ID & Nama</th>
                      <th className="py-3 px-4">Cabang Lomba</th>
                      <th className="py-3 px-4">Institusi & Kontak</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5ede0]">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#7a5530]">
                          Tidak ada data pendaftar yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((reg) => (
                        <tr key={reg.id} className="hover:bg-[#faf4e8]/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#7a5530] text-[10px] block">
                              #{reg.registrationCode}
                            </span>
                            <span className="font-medium text-sm text-[#2f1e10]">{reg.participantName}</span>
                            <span className="text-[10px] text-[#7a5530] block">{reg.registeredAt}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-[#2f1e10] block">{reg.competitionTitle}</span>
                            <span className="text-[10px] text-[#7a5530] font-cinzel uppercase tracking-wider">
                              {reg.isTeam ? `Tim: ${reg.teamName || 'Tim'}` : 'Individu'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="block text-[#2f1e10]">{reg.institution}</span>
                            <button
                              onClick={() => handleOpenChatPeserta(reg)}
                              className="text-[10px] text-[#7a5530] font-semibold hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <MessageSquare className="w-3 h-3 text-[#caa152]" />
                              <span>{reg.phoneWa} (Chat WA)</span>
                            </button>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-semibold tracking-wider ${
                                reg.status === 'TERVERIFIKASI'
                                  ? 'bg-[#f0e3cc] text-[#2f1e10] border border-[#caa152]'
                                  : reg.status === 'MENUNGGU_VERIFIKASI'
                                  ? 'bg-[#faf4e8] text-[#7a5530] border border-[#ebdcc8]'
                                  : reg.status === 'DITOLAK'
                                  ? 'bg-[#f5ede0] text-[#7a5530] border border-[#d8be99]'
                                  : 'bg-[#2f1e10] text-[#caa152] border border-[#caa152]'
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {reg.status === 'MENUNGGU_VERIFIKASI' ? (
                                <>
                                  <button
                                    onClick={() => onUpdateRegistrationStatus(reg.id, 'TERVERIFIKASI')}
                                    className="px-3 py-1 rounded-lg bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-[10px] font-semibold border border-[#caa152] shadow flex items-center gap-1 transition-all"
                                    title="Verifikasi & Buka Akses Grup"
                                  >
                                    <Check className="w-3.5 h-3.5 text-[#caa152]" />
                                    <span>Setujui</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedReg(reg);
                                      setShowRejectBox(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#faf4e8] border border-[#7a5530] hover:bg-[#f5ede0] text-[#7a5530] font-cinzel text-[10px] font-semibold transition-all"
                                    title="Tolak / Minta Revisi"
                                  >
                                    Tolak
                                  </button>
                                </>
                              ) : (
                                <select
                                  value={reg.status}
                                  onChange={(e) => onUpdateRegistrationStatus(reg.id, e.target.value as RegistrationStatus)}
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

        {/* TAB 2: OTORITAS SUPERADMIN */}
        {activeTab === 'SUPERADMIN' && (
          <div className="space-y-5 relative z-10 animate-in fade-in">
            {batchActionMsg && (
              <div className="p-3.5 rounded-2xl bg-[#f0e3cc] border border-[#7a5530] text-xs text-[#2f1e10] font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-[#7a5530]" />
                <span>{batchActionMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Otoritas 1: Verifikasi Massal */}
              <div className="p-5 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8] space-y-3">
                <h4 className="font-cormorant text-xl font-normal text-[#2f1e10]">
                  Verifikasi Massal Sekali Klik
                </h4>
                <p className="text-xs text-[#5c3820] leading-relaxed">
                  Menyetujui serentak seluruh berkas pendaftaran dengan status <em>MENUNGGU_VERIFIKASI</em> dan otomatis membuka akses grup peserta.
                </p>
                <button
                  onClick={handleSuperadminApproveAll}
                  disabled={countPending === 0}
                  className="px-5 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold tracking-wider disabled:opacity-40 disabled:cursor-not-allowed border border-[#caa152] transition-all"
                >
                  SETUJUI SEMUA BERKAS ({countPending})
                </button>
              </div>

              {/* Otoritas 2: Kuota Cabang Lomba */}
              <div className="p-5 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8] space-y-3">
                <h4 className="font-cormorant text-xl font-normal text-[#2f1e10]">
                  Rekap Kuota Pendaftaran
                </h4>
                <div className="space-y-2 text-xs text-[#5c3820]">
                  <div className="flex justify-between items-center py-1 border-b border-[#ebdcc8]">
                    <span>Esai Nasional (Individu)</span>
                    <span className="font-bold text-[#2f1e10]">
                      {registrations.filter(r => r.competitionId === 'comp-1').length} Peserta
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#ebdcc8]">
                    <span>Mini Case Competition (Tim)</span>
                    <span className="font-bold text-[#2f1e10]">
                      {registrations.filter(r => r.competitionId === 'comp-2').length} Tim
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Prompt Tolak dengan Alasan (Pure Palette) */}
        {showRejectBox && selectedReg && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-[#fffdf9] rounded-2xl p-6 max-w-md w-full border-2 border-[#caa152] shadow-2xl space-y-3 relative">
              <h4 className="font-cormorant text-2xl font-normal text-[#2f1e10]">
                Alasan Penolakan Pendaftaran
              </h4>
              <p className="text-xs text-[#7a5530]">
                Peserta: <strong>{selectedReg.participantName}</strong> (#{selectedReg.registrationCode})
              </p>
              <textarea
                rows={3}
                required
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="Tuliskan alasan penolakan atau instruksi revisi bukti transfer..."
                className="w-full p-3 rounded-xl border border-[#ebdcc8] text-xs bg-[#faf4e8] text-[#2f1e10] focus:outline-none focus:border-[#caa152]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowRejectBox(false)}
                  className="px-4 py-2 rounded-full border border-[#ebdcc8] text-xs font-cinzel font-semibold text-[#7a5530] hover:bg-[#faf4e8]"
                >
                  BATAL
                </button>
                <button
                  onClick={() => {
                    if (!rejectReasonInput) {
                      alert('Alasan penolakan wajib diisi!');
                      return;
                    }
                    onUpdateRegistrationStatus(selectedReg.id, 'DITOLAK', rejectReasonInput);
                    setShowRejectBox(false);
                    setRejectReasonInput('');
                  }}
                  className="px-5 py-2 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-cinzel font-semibold border border-[#caa152]"
                >
                  KIRIM REVISI
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
