import React, { useState } from 'react';
import { Registration, RegistrationStatus, UserProfile } from '../types';
import { 
  CheckCircle2, Clock, XCircle, Trophy, Lock, ExternalLink, 
  Upload, FileText, Send, AlertCircle, ArrowLeft, MessageSquare, 
  Sparkles, Bell, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  registration: Registration | null;
  currentUser: UserProfile | null;
  onBackToHome: () => void;
  onOpenRegister: () => void;
  onUpdateStatus?: (newStatus: RegistrationStatus) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  registration,
  currentUser,
  onBackToHome,
  onOpenRegister,
  onUpdateStatus,
}) => {
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionSaved, setSubmissionSaved] = useState(false);

  if (!registration) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#faf4e8] border border-[#ebdcc8] flex items-center justify-center mb-4 shadow-2xs">
          <FileText className="w-8 h-8 text-[#caa152]" />
        </div>
        <h2 className="font-cormorant text-3xl font-normal text-[#2f1e10] mb-2">
          Belum Ada Pendaftaran Aktif
        </h2>
        <p className="text-xs sm:text-sm text-[#7a5530] max-w-md mb-6 font-sans">
          Akun Anda belum terdaftar di cabang lomba Digiconomic Fest 2027. Silakan pilih kompetisi dan selesaikan formulir pendaftaran Anda.
        </p>
        <button
          onClick={onOpenRegister}
          className="px-7 py-3 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold tracking-wider shadow-sm transition-all flex items-center gap-2 border border-[#caa152]/40"
        >
          <span>DAFTAR LOMBA SEKARANG</span>
        </button>
      </div>
    );
  }

  const steps: { label: string; status: RegistrationStatus }[] = [
    { label: 'Menunggu Verifikasi', status: 'MENUNGGU_VERIFIKASI' },
    { label: 'Terverifikasi', status: 'TERVERIFIKASI' },
    { label: 'Lolos Tahap 1', status: 'LOLOS_TAHAP_1' },
    { label: 'Finalis', status: 'FINALIS' },
    { label: 'Juara', status: 'JUARA' },
  ];

  const getStepIndex = (status: RegistrationStatus): number => {
    switch (status) {
      case 'MENUNGGU_VERIFIKASI': return 0;
      case 'TERVERIFIKASI': return 1;
      case 'LOLOS_TAHAP_1': return 2;
      case 'FINALIS': return 3;
      case 'JUARA': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(registration.status);
  const isVerified = currentIndex >= 1 && registration.status !== 'DITOLAK' && registration.status !== 'DIBATALKAN';

  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionLink) return;
    setSubmissionSaved(true);
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setSubmissionSaved(false), 4000);
  };

  const openWhatsAppConfirmation = () => {
    const adminPhone = '6281234567890';
    const message = 
`Halo Panitia Digiconomic Fest 2027,
Saya ingin konfirmasi status pendaftaran & pembayaran saya:

*ID Registrasi*: #${registration.registrationCode}
*Nama*: ${registration.participantName}
*Lomba*: ${registration.competitionTitle}
*Status Saat Ini*: ${registration.status}

Mohon bantu verifikasi pembayaran saya. Terima kasih!`;

    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebdcc8]">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-cinzel font-semibold text-[#7a5530] hover:text-[#2f1e10] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>KEMBALI KE BERANDA</span>
          </button>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#2f1e10]">
            Dashboard Peserta
          </h1>
          <p className="text-xs text-[#7a5530] font-sans mt-0.5">
            Kelola tahapan kompetisi, pantau verifikasi QRIS resmi, dan kumpulkan berkas karya Anda.
          </p>
        </div>

        {/* Demo Status Switcher */}
        {onUpdateStatus && (
          <div className="flex items-center gap-2 p-2 bg-[#faf4e8] rounded-xl border border-[#ebdcc8] self-start sm:self-auto text-xs">
            <span className="font-cinzel text-[10px] font-semibold text-[#7a5530]">Status Simulasi:</span>
            <select
              value={registration.status}
              onChange={(e) => onUpdateStatus(e.target.value as RegistrationStatus)}
              className="bg-white text-[#2f1e10] font-cinzel text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#caa152] focus:outline-none"
            >
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="TERVERIFIKASI">Terverifikasi (Grup Terbuka)</option>
              <option value="LOLOS_TAHAP_1">Lolos Tahap 1</option>
              <option value="FINALIS">Finalis</option>
              <option value="JUARA">Juara</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        )}
      </div>

      {/* Progress Tracker Card */}
      <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-8 border border-[#ebdcc8] shadow-xs relative">
        <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10">
          <div>
            <span className="font-cinzel text-[10px] uppercase tracking-widest text-[#7a5530] font-semibold">
              PROGRESS PELACAKAN STATUS
            </span>
            <h3 className="font-cormorant text-2xl font-normal text-[#2f1e10]">
              {registration.competitionTitle}
            </h3>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-cinzel font-semibold border shadow-2xs self-start sm:self-auto bg-[#faf4e8] text-[#2f1e10] border-[#caa152]">
            {registration.status === 'MENUNGGU_VERIFIKASI' && <Clock className="w-3.5 h-3.5 text-[#caa152] animate-spin" />}
            {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#7a5530]" />}
            {registration.status === 'DITOLAK' && <XCircle className="w-3.5 h-3.5 text-[#7a5530]" />}
            <span>STATUS: {registration.status.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="relative pt-4 pb-2 z-10">
          {/* Track Line */}
          <div className="hidden sm:block absolute top-9 left-8 right-8 h-1 bg-[#ebdcc8] -z-0">
            <div
              className="h-full bg-gradient-to-r from-[#caa152] to-[#7a5530] transition-all duration-500"
              style={{
                width: `${(currentIndex / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
            {steps.map((st, i) => {
              const isPassed = i <= currentIndex && registration.status !== 'DITOLAK';
              const isCurrent = i === currentIndex;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-cinzel text-xs font-semibold transition-all shadow-xs ${
                      isPassed
                        ? 'bg-[#2f1e10] text-[#f5eee2] ring-4 ring-[#ebdcc8]'
                        : 'bg-[#faf4e8] text-[#7a5530] border border-[#d8be99]'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 text-[#caa152]" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isCurrent ? 'text-[#2f1e10] font-semibold' : 'text-[#7a5530]'
                    }`}
                  >
                    {st.label}
                  </span>
                  <span className="text-[10px] text-[#7a5530]/80">
                    {i === 0 ? 'Fase Berkas & Bayar' : i === 1 ? 'Lolos Administrasi' : 'Penjurian'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Alert Banner based on status */}
        <div className="mt-8 pt-6 border-t border-[#ebdcc8] relative z-10">
          {registration.status === 'MENUNGGU_VERIFIKASI' && (
            <div className="p-4 rounded-2xl bg-[#faf4e8] border border-[#caa152] text-xs text-[#5c3820] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-[#caa152] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2f1e10]">
                    Pembayaran & Pendaftaran Sedang Diverifikasi Panitia
                  </p>
                  <p className="text-[11px] text-[#7a5530] mt-0.5">
                    Harap pastikan Anda sudah mengirimkan screenshot bukti transfer di chat WhatsApp panitia.
                  </p>
                </div>
              </div>
              <button
                onClick={openWhatsAppConfirmation}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold flex items-center gap-1.5 shadow-xs border border-[#caa152]/40"
              >
                <MessageSquare className="w-4 h-4 text-[#caa152]" />
                <span>Konfirmasi via WhatsApp</span>
              </button>
            </div>
          )}

          {isVerified && (
            <div className="p-4 rounded-2xl bg-[#f0e3cc] border border-[#7a5530] text-xs text-[#2f1e10] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#7a5530] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2f1e10]">
                    Selamat! Pendaftaran & Pembayaran Anda Telah Terverifikasi
                  </p>
                  <p className="text-[11px] text-[#7a5530] mt-0.5">
                    Tautan grup peserta resmi telah terbuka. Bergabunglah untuk mendapatkan panduan teknis terbaru.
                  </p>
                </div>
              </div>
              <a
                href="https://chat.whatsapp.com/sample-digiconomic-group"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 px-5 py-2.5 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold flex items-center gap-2 shadow-xs border border-[#caa152]/40"
              >
                <MessageSquare className="w-4 h-4 text-[#caa152]" />
                <span>Masuk Grup WhatsApp Peserta</span>
              </a>
            </div>
          )}

          {registration.status === 'DITOLAK' && (
            <div className="p-4 rounded-2xl bg-[#faf4e8] border border-[#d8be99] text-xs text-[#7a5530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-[#7a5530] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2f1e10]">Pendaftaran Memerlukan Revisi</p>
                  <p className="text-[11px] text-[#7a5530] mt-0.5">
                    Alasan: {registration.rejectReason || 'Bukti pembayaran atau KTM belum sesuai ketentuan.'}
                  </p>
                </div>
              </div>
              <button
                onClick={openWhatsAppConfirmation}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold flex items-center gap-1.5 shadow-xs border border-[#caa152]"
              >
                <span>Konsultasikan via WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Detail Pendaftaran & Submission Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Detail Pendaftaran (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-7 border border-[#ebdcc8] shadow-xs space-y-4 relative">
            <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

            <h3 className="font-cormorant text-2xl font-normal text-[#2f1e10] pb-2 border-b border-[#ebdcc8] relative z-10">
              Informasi Registrasi Resmi
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs relative z-10">
              <div>
                <span className="text-[#7a5530] font-cinzel text-[10px] uppercase tracking-wider block">ID Registrasi</span>
                <span className="font-bold text-[#2f1e10] text-sm font-mono">#{registration.registrationCode}</span>
              </div>
              <div>
                <span className="text-[#7a5530] font-cinzel text-[10px] uppercase tracking-wider block">Tanggal Daftar</span>
                <span className="font-medium text-[#2f1e10]">{registration.registeredAt}</span>
              </div>
              <div>
                <span className="text-[#7a5530] font-cinzel text-[10px] uppercase tracking-wider block">Nama Peserta / Ketua</span>
                <span className="font-medium text-[#2f1e10]">{registration.participantName}</span>
              </div>
              <div>
                <span className="text-[#7a5530] font-cinzel text-[10px] uppercase tracking-wider block">Institusi</span>
                <span className="font-medium text-[#2f1e10]">{registration.institution}</span>
              </div>
              <div>
                <span className="text-[#7a5530] font-cinzel text-[10px] uppercase tracking-wider block">Kontak WhatsApp</span>
                <span className="font-medium text-[#2f1e10]">{registration.phoneWa}</span>
              </div>
              <div>
                <span className="text-[#7a5530] font-cinzel text-[10px] uppercase tracking-wider block">Format Kategori</span>
                <span className="font-medium text-[#2f1e10]">
                  {registration.isTeam ? `Tim (${registration.teamName || 'Tim'})` : 'Individu'}
                </span>
              </div>
            </div>

            {/* Grup Peserta */}
            <div className="pt-4 border-t border-[#ebdcc8] relative z-10">
              <span className="font-cinzel text-[10px] text-[#7a5530] uppercase tracking-wider block mb-2 font-semibold">
                Tautan Komunitas & Grup Peserta
              </span>
              {isVerified ? (
                <a
                  href="https://chat.whatsapp.com/sample-digiconomic-group"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all border border-[#caa152]/40"
                >
                  <MessageSquare className="w-4 h-4 text-[#caa152]" />
                  <span>Masuk Grup WhatsApp Peserta (Aktif)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-full bg-[#faf4e8] text-[#7a5530] font-cinzel text-[11px] font-medium flex items-center justify-center gap-2 cursor-not-allowed border border-[#ebdcc8]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Grup Terkunci (Terbuka setelah status TERVERIFIKASI)</span>
                </button>
              )}
            </div>
          </div>

          {/* Pengumpulan Karya */}
          <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-7 border border-[#ebdcc8] shadow-xs space-y-4 relative">
            <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

            <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8] relative z-10">
              <h3 className="font-cormorant text-2xl font-normal text-[#2f1e10]">
                Pengumpulan Berkas Karya
              </h3>
              <span className="font-cinzel text-[10px] bg-[#faf4e8] px-2.5 py-1 rounded-full text-[#7a5530] font-semibold border border-[#ebdcc8]">
                Batas: 31 Jan 2027
              </span>
            </div>

            <form onSubmit={handleSaveSubmission} className="space-y-3.5 relative z-10">
              <div>
                <label className="block text-xs font-medium text-[#2f1e10] mb-1">
                  Tautan Google Drive Berkas Karya (Akses Publik / Viewer) *
                </label>
                <input
                  type="url"
                  required
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2f1e10] mb-1">
                  Catatan Tambahan untuk Dewan Juri (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="Tuliskan ringkasan solusi atau informasi pendukung..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ba883a] to-[#7a5530] text-white font-cinzel text-xs font-semibold tracking-wider shadow-xs hover:shadow transition-all flex items-center gap-2 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>KIRIM BERKAS KARYA</span>
                </button>

                {submissionSaved && (
                  <span className="font-cinzel text-[11px] text-[#7a5530] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#caa152]" />
                    <span>Tersimpan!</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Informasi Bantuan & Juri (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fffdf9] rounded-3xl p-6 border border-[#ebdcc8] shadow-xs space-y-4 relative">
            <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="font-cinzel text-[10px] text-[#7a5530] uppercase tracking-wider block font-semibold">
                PANDUAN & BANTUAN PESERTA
              </span>
              <h4 className="font-cormorant text-2xl font-normal text-[#2f1e10]">
                Ketentuan Pengumpulan
              </h4>
              <ul className="text-xs text-[#5c3820] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#caa152]">✦</span>
                  <span>Pastikan format berkas esai atau case study sesuai dengan Buku Panduan Teknis 2027.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#caa152]">✦</span>
                  <span>Pengumpulan dapat diperbarui sebelum batas waktu 31 Januari 2027 pukul 23:59 WIB.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#caa152]">✦</span>
                  <span>Pengumuman tim finalis akan dirilis serentak di portal ini pada tanggal 20 Februari 2027.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-[#ebdcc8]">
                <button
                  onClick={openWhatsAppConfirmation}
                  className="w-full py-2.5 px-4 rounded-full bg-[#faf4e8] hover:bg-[#f5ede0] border border-[#caa152] text-[#2f1e10] font-cinzel text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#caa152]" />
                  <span>Bantuan Helpdesk Panitia</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
