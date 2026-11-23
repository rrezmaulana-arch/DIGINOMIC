import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout, SidebarNavItem } from '../../layouts/DashboardLayout';
import { Registration, RegistrationStatus, SubmissionData, UserProfile } from '../../types';
import { RegistrationService, subscribeToStorageChanges } from '../../services/registrationService';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  ExternalLink,
  Upload,
  FileText,
  AlertCircle,
  MessageSquare,
  Users,
  Check,
  Download
} from 'lucide-react';

interface ParticipantDashboardPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN') => void;
}

export const ParticipantDashboardPage: React.FC<ParticipantDashboardPageProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>(() => RegistrationService.getAll());
  const settings = RegistrationService.getSettings();

// Subscribe to localStorage changes for multi-tab sync
  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setRegistrations(RegistrationService.getAll());
    });
    return unsubscribe;
  }, []);

  // Cari data registrasi pengguna demo berdasarkan ID atau email
  const userRegistration = registrations.find((r) => r.userId === currentUser.id || r.email.toLowerCase() === currentUser.email.toLowerCase()) || null;

  // Submission Form State
  const [submissionTitle, setSubmissionTitle] = useState(userRegistration?.submission?.title || '');
  const [submissionLink, setSubmissionLink] = useState(userRegistration?.submission?.driveLink || '');
  const [submissionDesc, setSubmissionDesc] = useState(userRegistration?.submission?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (userRegistration?.submission) {
      setSubmissionTitle(userRegistration.submission.title);
      setSubmissionLink(userRegistration.submission.driveLink);
      setSubmissionDesc(userRegistration.submission.description || '');
    }
  }, [userRegistration]);

  if (!userRegistration) {
    return (
      <DashboardLayout currentUser={currentUser} onLogout={onLogout} onSwitchRole={onSwitchRole}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#fffdf9] rounded-3xl border border-[#ebdcc8] shadow-sm relative">
          <div className="w-16 h-16 rounded-2xl bg-[#faf4e8] border border-[#caa152] flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#caa152]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2f1e10]">
            Belum Ada Pendaftaran Aktif
          </h2>
          <p className="text-sm text-[#7a5530] max-w-md mt-1 mb-6">
            Akun Anda belum terdaftar di cabang lomba Digiconomic Fest 2027. Silakan pilih kompetisi dan selesaikan formulir pendaftaran Anda.
          </p>
          <Link
            to="/daftar"
            className="px-6 py-2.5 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold tracking-wide border border-[#caa152] shadow-sm transition-all"
          >
            Daftar Kompetisi Sekarang
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const steps: { label: string; status: RegistrationStatus }[] = [
    { label: 'Pendaftaran', status: 'MENUNGGU_VERIFIKASI' },
    { label: 'Verifikasi Berkas', status: 'TERVERIFIKASI' },
    { label: 'Pengumpulan Karya', status: 'LOLOS_TAHAP_1' },
    { label: 'Seleksi Tahap 1', status: 'FINALIS' },
    { label: 'Babak Final & Juara', status: 'JUARA' },
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

  const currentIndex = getStepIndex(userRegistration.status);
  const isVerified = currentIndex >= 1 && userRegistration.status !== 'DITOLAK';

  // Calculate percentage for progress bar
  const progressPercent = Math.max(10, Math.min(100, (currentIndex / (steps.length - 1)) * 100));

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionTitle || !submissionLink) {
      alert('Mohon isi Judul Karya dan Tautan Google Drive.');
      return;
    }

    // Validate Google Drive link format
    const driveLinkRegex = /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    if (!driveLinkRegex.test(submissionLink)) {
      alert('Tautan tidak valid. Harap gunakan format Google Drive yang benar (contoh: https://drive.google.com/file/d/FILE_ID/view).');
      return;
    }

    setIsSubmitting(true);
    const submissionData: SubmissionData = {
      title: submissionTitle,
      driveLink: submissionLink,
      description: submissionDesc,
      submittedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      score: userRegistration.submission?.score,
      round: userRegistration.submission?.round || 'TAHAP_1'
    };

    const updated = RegistrationService.submitWork(userRegistration.id, submissionData);
    setRegistrations(updated);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    confetti({ particleCount: 70, spread: 70 });
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const handleOpenWhatsAppConfirm = () => {
    const url = RegistrationService.buildWhatsAppPaymentUrl(userRegistration, `Rp ${userRegistration.fee.toLocaleString('id-ID')}`);
    window.open(url, '_blank');
  };

  const handleOpenHelpdesk = () => {
    window.open(RegistrationService.buildWhatsAppHelpdeskUrl(), '_blank');
  };

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUBMISSION' | 'RESOURCES'>('OVERVIEW');

  const participantNavItems: SidebarNavItem[] = [
    { id: 'OVERVIEW', label: 'Status & Linimasa', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'SUBMISSION', label: 'Unggah Karya', icon: <Upload className="w-4 h-4" />, badge: userRegistration?.submission ? 'Terkirim' : undefined },
    { id: 'RESOURCES', label: 'Grup WA & Panduan', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout 
      currentUser={currentUser} 
      onLogout={onLogout} 
      onSwitchRole={onSwitchRole}
      navItems={participantNavItems}
      activeTab={activeTab}
      onSelectTab={(tabId) => setActiveTab(tabId as any)}
    >
      <div className="space-y-6 font-sans">

        {/* ================= 1. HEADER RINGKAS PESERTA ================= */}
        <div className="bg-[#fffdf9] p-6 rounded-2xl border border-[#ebdcc8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7a5530]">
              Portal Peserta Resmi Digiconomic Fest 2027
            </span>
            <h1 className="text-2xl font-bold text-[#2f1e10]">
              Halo, {userRegistration.participantName}
            </h1>
            <p className="text-xs text-[#5c3e28]">
              Cabang Lomba: <strong className="text-[#2f1e10]">{userRegistration.competitionTitle}</strong> ({userRegistration.isTeam ? `Tim: ${userRegistration.teamName || 'Tim'}` : 'Individu'}) • Kampus: <strong>{userRegistration.institution}</strong>
            </p>
          </div>

          {/* Registration Code Badge */}
          <div className="bg-[#faf4e8] px-4 py-3 rounded-xl border border-[#ebdcc8] text-center shrink-0 w-full md:w-auto">
            <span className="text-[10px] uppercase tracking-wider text-[#7a5530] block font-semibold">
              ID Registrasi Anda
            </span>
            <span className="font-mono font-bold text-base text-[#2f1e10] block my-0.5">
              #{userRegistration.registrationCode}
            </span>
            <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${userRegistration.status === 'TERVERIFIKASI'
                ? 'bg-[#f0e3cc] text-[#2f1e10] border border-[#caa152]'
                : userRegistration.status === 'DITOLAK'
                  ? 'bg-[#f5ede0] text-[#7a5530] border border-[#d8be99]'
                  : userRegistration.status === 'LOLOS_TAHAP_1' || userRegistration.status === 'FINALIS'
                    ? 'bg-[#2f1e10] text-[#caa152] border border-[#caa152]'
                    : 'bg-white text-[#7a5530] border border-[#ebdcc8]'
              }`}>
              {userRegistration.status}
            </span>
          </div>
        </div>

        {/* ================= 2. LINIMASA PROGRES (SLEEK PROGRESS BAR) ================= */}
        {activeTab === 'OVERVIEW' && (
        <div className="bg-[#fffdf9] p-6 rounded-2xl border border-[#ebdcc8] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#2f1e10]">
                Progres Tahapan Kompetisi
              </h2>
              <p className="text-xs text-[#7a5530]">
                Linimasa langkah resmi pendaftaran hingga babak penentuan juara.
              </p>
            </div>
            <button
              onClick={handleOpenHelpdesk}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ebdcc8] bg-[#faf4e8] hover:bg-[#f0e3cc] text-xs font-medium text-[#7a5530] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#caa152]" />
              <span>Bantuan Panitia</span>
            </button>
          </div>

          {/* Connected Horizontal Progress Bar */}
          <div className="relative pt-6 pb-4 px-2 sm:px-6">

            {/* Background Track Line */}
            <div className="absolute top-10 left-6 right-6 h-1.5 bg-[#ebdcc8] rounded-full z-0 hidden sm:block" />

            {/* Active Filled Progress Bar */}
            <div
              className="absolute top-10 left-6 h-1.5 btn-modern-shine bg-gradient-to-r from-[#ba883a] to-[#caa152] rounded-full z-0 transition-all duration-500 hidden sm:block"
              style={{ width: `calc(${progressPercent}% - 48px)` }}
            />

            {/* Stepper Nodes */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
              {steps.map((st, idx) => {
                const isPassed = currentIndex > idx;
                const isCurrent = currentIndex === idx && userRegistration.status !== 'DITOLAK';
                const isRejected = userRegistration.status === 'DITOLAK' && idx === 0;

                return (
                  <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-1.5">

                    {/* Milestone Dot/Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${isCurrent
                        ? 'bg-[#2f1e10] text-[#caa152] ring-4 ring-[#caa152]/30 shadow-md scale-110'
                        : isPassed
                          ? 'bg-[#caa152] text-white shadow-xs'
                          : isRejected
                            ? 'bg-[#7a5530] text-white'
                            : 'bg-[#faf4e8] text-[#7a5530] border-2 border-[#ebdcc8]'
                      }`}>
                      {isPassed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isRejected ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="text-left sm:text-center">
                      <span className="text-[10px] uppercase tracking-wider text-[#7a5530] block font-semibold">
                        Tahap {idx + 1}
                      </span>
                      <span className={`text-xs block leading-tight font-medium ${isCurrent ? 'text-[#2f1e10] font-bold' : isPassed ? 'text-[#2f1e10]' : 'text-[#7a5530]'
                        }`}>
                        {st.label}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Verification Notice */}
          {userRegistration.status === 'MENUNGGU_VERIFIKASI' && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#faf4e8] border border-[#caa152] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#caa152] shrink-0" />
                <p className="text-xs text-[#5c3e28]">
                  Pembayaran sedang dalam proses verifikasi panitia. Kirimkan bukti transfer ke WhatsApp agar status segera aktif.
                </p>
              </div>
              <button
                onClick={handleOpenWhatsAppConfirm}
                className="px-4 py-1.5 rounded-lg bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold shrink-0 border border-[#caa152] transition-colors"
              >
                Kirim Bukti Pembayaran
              </button>
            </div>
          )}

          {/* Rejected Notice */}
          {userRegistration.status === 'DITOLAK' && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#f5ede0] border border-[#7a5530] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#7a5530] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#2f1e10]">Pendaftaran Memerlukan Revisi</p>
                  <p className="text-xs text-[#7a5530] mt-0.5">
                    Catatan Panitia: {userRegistration.rejectReason || 'Bukti transfer atau KTM kurang jelas. Silakan kirim revisi.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenHelpdesk}
                className="px-4 py-1.5 rounded-lg bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold shrink-0"
              >
                Hubungi Panitia Revisi
              </button>
            </div>
          )}
        </div>
        )}

        {/* ================= 3. AKSES RESMI & FORM SUBMISSION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* KOLOM KIRI: AKSES RESMI & SUMBER DAYA (Jika tab OVERVIEW atau RESOURCES) */}
          {(activeTab === 'OVERVIEW' || activeTab === 'RESOURCES') && (
          <div className={`${activeTab === 'RESOURCES' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-4`}>

            {/* WhatsApp Group Box */}
            <div className="p-5 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a5530]">
                  Grup Komunikasi Resmi
                </span>
                {isVerified ? (
                  <span className="text-[10px] font-semibold text-[#2f1e10] bg-[#f0e3cc] px-2 py-0.5 rounded-md border border-[#caa152]">
                    Terbuka
                  </span>
                ) : (
                  <span className="text-[10px] text-[#7a5530] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Terkunci
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-[#2f1e10]">
                Grup WhatsApp Peserta
              </h3>
              <p className="text-xs text-[#5c3e28] leading-relaxed">
                Wadah koordinasi resmi dengan panitia untuk technical meeting dan pengumuman lomba.
              </p>

              {isVerified ? (
                <a
                  href={userRegistration.competitionId === 'comp-1' ? settings.whatsappGroupEsai : settings.whatsappGroupCase}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] text-xs font-semibold flex items-center justify-center gap-2 border border-[#caa152] transition-colors"
                >
                  <Users className="w-4 h-4 text-[#caa152]" />
                  <span>Gabung Grup WhatsApp</span>
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] text-xs text-[#7a5530] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#7a5530] shrink-0" />
                  <span>Akses terbuka otomatis setelah berkas terverifikasi panitia.</span>
                </div>
              )}
            </div>

            {/* Guidebook Download Box */}
            <div className="p-5 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] shadow-sm space-y-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a5530]">
                Buku Panduan Perlombaan
              </span>
              <h3 className="text-lg font-bold text-[#2f1e10]">
                Guidebook & Ketentuan Teknis
              </h3>
              <p className="text-xs text-[#5c3e28] leading-relaxed">
                Pelajari format penulisan naskah esai dan rubrik penilaian dewan juri.
              </p>
              <a
                href={settings.guidebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#faf4e8] hover:bg-[#f0e3cc] text-[#2f1e10] text-xs font-semibold flex items-center justify-center gap-2 border border-[#caa152] transition-colors"
              >
                <Download className="w-4 h-4 text-[#7a5530]" />
                <span>Unduh Guidebook (PDF)</span>
              </a>
            </div>

            {/* Deadline info */}
            <div className="p-3.5 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] text-xs text-[#5c3e28] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#2f1e10]">
                <Clock className="w-4 h-4 text-[#caa152]" />
                <span>Batas Akhir Pengumpulan Karya:</span>
              </div>
              <p className="font-mono text-xs text-[#7a5530] pl-6">
                {settings.submissionDeadline}
              </p>
            </div>

          </div>
          )}

          {/* KOLOM KANAN: FORM SUBMISSION (Jika tab OVERVIEW atau SUBMISSION) */}
          {(activeTab === 'OVERVIEW' || activeTab === 'SUBMISSION') && (
          <div className={`${activeTab === 'SUBMISSION' ? 'lg:col-span-12' : 'lg:col-span-7'}`}>
            <div className="p-6 rounded-2xl bg-[#fffdf9] border border-[#ebdcc8] shadow-sm space-y-4">

              <div className="border-b border-[#ebdcc8] pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a5530]">
                  Tahap 2: Pengumpulan Naskah Lomba
                </span>
                <h3 className="text-xl font-bold text-[#2f1e10]">
                  Formulir Pengumpulan Karya
                </h3>
                <p className="text-xs text-[#5c3e28] mt-0.5 leading-relaxed">
                  Kumpulkan dokumen naskah esai atau proposal solusi kasus Anda melalui link Google Drive (akses: view only).
                </p>
              </div>

              {/* Alert submit success */}
              {submitSuccess && (
                <div className="p-3 rounded-xl bg-[#f0e3cc] border border-[#7a5530] text-xs text-[#2f1e10] font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-[#7a5530]" />
                  <span>Karya berhasil disimpan dan diteruskan ke dewan juri untuk dinilai!</span>
                </div>
              )}

              {/* Status Submission Banner if already submitted */}
              {userRegistration.submission && (
                <div className="p-4 rounded-xl bg-[#faf4e8] border border-[#caa152] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#7a5530] uppercase">
                      Karya Terakhir Dikumpulkan
                    </span>
                    <span className="text-[10px] text-[#7a5530] font-mono">
                      {userRegistration.submission.submittedAt}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#2f1e10]">
                    "{userRegistration.submission.title}"
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={userRegistration.submission.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#7a5530] hover:text-[#2f1e10] underline flex items-center gap-1 font-sans"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#caa152]" />
                      <span>Buka File di Google Drive</span>
                    </a>

                    {userRegistration.submission.score ? (
                      <span className="text-xs font-bold text-[#ba883a] bg-white px-2.5 py-0.5 rounded border border-[#caa152]">
                        Skor Penilaian: {userRegistration.submission.score}/100
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#7a5530] bg-white px-2 py-0.5 rounded border border-[#ebdcc8]">
                        Status: Menunggu Penilaian Juri
                      </span>
                    )}
                  </div>

                  {userRegistration.submission.juryFeedback && (
                    <div className="pt-2 border-t border-[#ebdcc8] text-xs text-[#5c3e28]">
                      <strong>Catatan Tim Penilai:</strong> {userRegistration.submission.juryFeedback}
                    </div>
                  )}
                </div>
              )}

              {/* The Submission Input Form */}
              <form onSubmit={handleSubmitWork} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#2f1e10] uppercase mb-1">
                    Judul Karya / Naskah Lomba *
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionTitle}
                    onChange={(e) => setSubmissionTitle(e.target.value)}
                    placeholder="Contoh: Akselerasi QRIS Cross-Border bagi UMKM Pesisir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcc8] bg-[#faf4e8]/60 text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2f1e10] uppercase mb-1">
                    Tautan Google Drive Dokumen Karya *
                  </label>
                  <input
                    type="url"
                    required
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcc8] bg-[#faf4e8]/60 text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] focus:bg-white font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-[#7a5530] mt-1">
                    Pastikan izin akses tautan: <strong>"Anyone with the link can view"</strong> agar dewan juri dapat membuka dokumen.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2f1e10] uppercase mb-1">
                    Abstrak / Deskripsi Singkat Karya
                  </label>
                  <textarea
                    rows={3}
                    value={submissionDesc}
                    onChange={(e) => setSubmissionDesc(e.target.value)}
                    placeholder="Tuliskan intisari gagasan inovatif atau metodologi karya Anda..."
                    className="w-full p-3 rounded-xl border border-[#ebdcc8] bg-[#faf4e8]/60 text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all bg-[#2f1e10] hover:bg-[#7a5530] border border-[#caa152] disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-[#caa152]" />
                  <span>{userRegistration.submission ? 'Perbarui Pengumpulan Karya' : 'Kumpulkan Karya Sekarang'}</span>
                </button>
              </form>

            </div>
          </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};
