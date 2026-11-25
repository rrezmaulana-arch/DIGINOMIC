import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout, SidebarNavItem } from '../../layouts/DashboardLayout';
import { FileDropCard } from '../../components/FileDropCard';
import { ParticipantApi, PublicApi } from '../../services/apiService';
import { PENDING_COMPETITION_KEY } from '../auth/LoginPage';
import type { AnnouncementItem, UserProfile } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  Upload,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Users,
  Pin,
  Loader2,
  ShieldAlert,
  QrCode,
  Link2,
  RefreshCw,
} from 'lucide-react';

interface ParticipantDashboardPageProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN') => void;
}

interface RegistrationDraft {
  fullName: string;
  nim: string;
  institution: string;
  phoneWa: string;
  selectedSlug: string;
  teamName: string;
  teamMembers: Array<{ full_name: string; nim: string; institution: string; phone_wa: string }>;
}

function readRegistrationDraft(key: string): RegistrationDraft | null {
  try {
    const draft = JSON.parse(sessionStorage.getItem(key) || 'null');
    const fields = ['fullName', 'nim', 'institution', 'phoneWa', 'selectedSlug', 'teamName'];
    if (!draft || !fields.every((field) => typeof draft[field] === 'string')) return null;
    if (
      !Array.isArray(draft.teamMembers) ||
      !draft.teamMembers.every(
        (member: any) =>
          member && ['full_name', 'nim', 'institution', 'phone_wa'].every((field) => typeof member[field] === 'string')
      )
    ) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function resolveCompetitionSlugParam(raw?: string | null): string {
  if (!raw) return '';
  if (raw === 'comp-1' || raw === 'esai-nasional') return 'esai-nasional';
  if (raw === 'comp-2' || raw === 'mini-case-competition') return 'mini-case-competition';
  return raw;
}

const STATUS_META: Record<string, { label: string; color: string; desc: string }> = {
  MENUNGGU_VERIFIKASI: {
    label: 'Menunggu Verifikasi Panitia',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    desc: 'Pastikan biodata, KTM, dan bukti pembayaran QRIS sudah diunggah. Panitia memverifikasi berkas maksimal 1×24 jam.',
  },
  TERVERIFIKASI: {
    label: 'Terverifikasi Resmi',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    desc: 'Selamat! Pendaftaran Anda telah terverifikasi. Silakan gabung ke grup koordinasi WhatsApp & unggah karya sebelum tenggat.',
  },
  DITOLAK: {
    label: 'Perlu Revisi Berkas',
    color: 'bg-red-100 text-red-900 border-red-300',
    desc: 'Terdapat berkas atau bukti bayar yang perlu diperbaiki. Periksa catatan panitia di bawah lalu kirim ulang revisi Anda.',
  },
  LOLOS_TAHAP_1: {
    label: 'Lolos Seleksi Tahap 1',
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    desc: 'Selamat! Karya Anda lolos seleksi tahap pertama. Pantau menu Pengumuman untuk agenda berikutnya.',
  },
  FINALIS: {
    label: 'Finalis Nasional',
    color: 'bg-purple-100 text-purple-900 border-purple-300',
    desc: 'Selamat! Anda terpilih sebagai Finalis Nasional Digiconomic Fest 2027.',
  },
  JUARA: {
    label: 'Juara Resmi Digiconomic 2027',
    color: 'bg-yellow-100 text-yellow-900 border-yellow-400',
    desc: 'Selamat atas prestasi gemilang Anda pada Digiconomic Fest 2027!',
  },
  GUGUR: {
    label: 'Belum Lolos Seleksi',
    color: 'bg-stone-200 text-stone-800 border-stone-300',
    desc: 'Terima kasih atas partisipasi dan karya terbaik Anda di Digiconomic Fest 2027.',
  },
  DIBATALKAN: {
    label: 'Kepesertaan Dibatalkan',
    color: 'bg-gray-200 text-gray-800 border-gray-400',
    desc: 'Pendaftaran lomba ini telah dibatalkan.',
  },
};

export const ParticipantDashboardPage: React.FC<ParticipantDashboardPageProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
}) => {
  const [searchParams] = useSearchParams();
  const draftKey = `diginomic-registration-draft:${currentUser.id}`;
  const [initialDraft] = useState(() => readRegistrationDraft(draftKey));
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Form Biodata
  const [fullName, setFullName] = useState(initialDraft?.fullName ?? currentUser.name ?? '');
  const [nim, setNim] = useState(initialDraft?.nim || '');
  const [institution, setInstitution] = useState(initialDraft?.institution || '');
  const [phoneWa, setPhoneWa] = useState(initialDraft?.phoneWa || '');
  const [ktmFile, setKtmFile] = useState<File | null>(null);

  // Form Pilih Lomba
  const [selectedSlug, setSelectedSlug] = useState(() => {
    const fromUrl = resolveCompetitionSlugParam(searchParams.get('lomba'));
    if (fromUrl) return fromUrl;
    try {
      const pending = resolveCompetitionSlugParam(sessionStorage.getItem(PENDING_COMPETITION_KEY));
      if (pending) {
        sessionStorage.removeItem(PENDING_COMPETITION_KEY);
        return pending;
      }
    } catch {
      // Abaikan jika sessionStorage tidak tersedia
    }
    return initialDraft?.selectedSlug || '';
  });

  const [teamName, setTeamName] = useState(initialDraft?.teamName || '');
  const [teamMembers, setTeamMembers] = useState(
    initialDraft?.teamMembers || [
      { full_name: '', nim: '', institution: '', phone_wa: '' },
      { full_name: '', nim: '', institution: '', phone_wa: '' },
    ]
  );

  // Form Pembayaran QRIS
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [senderName, setSenderName] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // Form Unggah Karya
  const [subMode, setSubMode] = useState<'file' | 'link'>('file');
  const [subTitle, setSubTitle] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subFile, setSubFile] = useState<File | null>(null);
  const [subLinkUrl, setSubLinkUrl] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, regRes, compRes, annRes] = await Promise.all([
        ParticipantApi.getProfile(),
        ParticipantApi.getMyRegistration(),
        PublicApi.getCompetitions(),
        ParticipantApi.getAnnouncements(),
      ]);
      setProfile(profRes.profile);
      const isProfComplete = Boolean(
        profRes.profile?.full_name &&
          profRes.profile?.institution &&
          profRes.profile?.phone_wa &&
          profRes.profile?.has_student_card
      );
      if (
        searchParams.get('lengkapi_profil') === '1' ||
        Boolean(searchParams.get('lomba')) ||
        !isProfComplete
      ) {
        setActiveTab('registration');
      } else {
        setActiveTab('overview');
      }
      if (profRes.profile && (!initialDraft || regRes.registration)) {
        setFullName(profRes.profile.full_name || currentUser.name);
        setNim(profRes.profile.nim || '');
        setInstitution(profRes.profile.institution || '');
        setPhoneWa(profRes.profile.phone_wa || '');
      }
      if (regRes.registration) {
        setSenderName(regRes.registration.payment_sender_name || '');
        setPaymentDate(regRes.registration.payment_date || '');
        if (regRes.registration.team_name) setTeamName(regRes.registration.team_name);
        if (regRes.registration.team_members?.length) setTeamMembers(regRes.registration.team_members);
      }
      setRegistration(regRes.registration);
      setCompetitions(compRes.competitions || []);
      setAnnouncements(annRes.announcements || []);
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal memuat data dashboard peserta.' });
    } finally {
      setLoading(false);
    }
  }, [currentUser.name, initialDraft, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (loading) return;
    try {
      if (registration) {
        sessionStorage.removeItem(draftKey);
        return;
      }
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({
          fullName,
          nim,
          institution,
          phoneWa,
          selectedSlug,
          teamName,
          teamMembers,
        })
      );
    } catch {
      // Abaikan bila penyimpanan browser dibatasi
    }
  }, [loading, registration, draftKey, fullName, nim, institution, phoneWa, selectedSlug, teamName, teamMembers]);

  const isVerified =
    registration && ['TERVERIFIKASI', 'LOLOS_TAHAP_1', 'FINALIS', 'JUARA'].includes(registration.status);

  const navItems: SidebarNavItem[] = [
    { id: 'overview', label: 'Ringkasan & Linimasa', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'registration', label: 'Pendaftaran & Berkas', icon: <FileText className="w-4 h-4" /> },
    {
      id: 'announcements',
      label: 'Pengumuman Resmi',
      icon: <Megaphone className="w-4 h-4" />,
      badge: announcements.length > 0 ? announcements.length : undefined,
    },
    {
      id: 'submission',
      label: isVerified ? 'Unggah Karya' : 'Unggah Karya (Terkunci)',
      icon: isVerified ? <Upload className="w-4 h-4" /> : <Lock className="w-4 h-4 text-gray-400" />,
    },
  ];

  const saveProfileAndKtm = async () => {
    const saved = await ParticipantApi.updateProfile({
      full_name: fullName,
      nim,
      institution,
      phone_wa: phoneWa,
    });
    if (ktmFile) {
      await ParticipantApi.uploadStudentCard(ktmFile);
      setKtmFile(null);
    }
    setProfile({ ...saved.profile, has_student_card: Boolean(profile?.has_student_card || ktmFile) });
  };

  const handleSaveProfileAndKtm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      await saveProfileAndKtm();
      if (registration?.status === 'DITOLAK') {
        await ParticipantApi.reviseRegistration(
          registration.is_team
            ? {
                team_name: teamName,
                team_members: teamMembers.filter((m) => m.full_name.trim().length > 0),
              }
            : {}
        );
        setFeedback({ type: 'success', msg: 'Revisi data & berkas berhasil dikirim kembali ke panitia!' });
      } else {
        setFeedback({ type: 'success', msg: 'Biodata & berkas KTM berhasil diperbarui.' });
      }
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal menyimpan biodata.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!selectedSlug) {
      setFeedback({ type: 'error', msg: 'Pilih cabang lomba terlebih dahulu.' });
      return;
    }
    const comp = competitions.find((c) => c.slug === selectedSlug);
    if (!profile?.has_student_card && !ktmFile) {
      setFeedback({ type: 'error', msg: 'Unggah Kartu Pelajar / KTM terlebih dahulu sebelum mendaftar.' });
      return;
    }
    setSaving(true);
    try {
      await saveProfileAndKtm();
      const created = await ParticipantApi.createRegistration({
        competition_slug: selectedSlug,
        ...(comp?.is_team
          ? {
              team_name: teamName,
              team_members: teamMembers.filter((m) => m.full_name.trim().length > 0),
            }
          : {}),
      });
      setRegistration(created.registration);
      setFeedback({
        type: 'success',
        msg: 'Pendaftaran berhasil dibuat! Silakan unggah bukti pembayaran QRIS pada kartu di bawah ini.',
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal membuat pendaftaran lomba.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile) return;
    setFeedback(null);
    setSaving(true);
    try {
      await ParticipantApi.uploadPaymentProof(paymentFile, senderName, paymentDate);
      setPaymentFile(null);
      if (registration?.status === 'DITOLAK') {
        await ParticipantApi.reviseRegistration({});
      }
      setFeedback({
        type: 'success',
        msg: 'Bukti pembayaran QRIS berhasil diunggah! Mohon tunggu verifikasi panitia.',
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal mengunggah bukti pembayaran.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      if (subMode === 'file') {
        if (!subFile) {
          setFeedback({ type: 'error', msg: 'Pilih berkas PDF karya terlebih dahulu.' });
          setSaving(false);
          return;
        }
        await ParticipantApi.uploadSubmissionFile(subFile, subTitle, subDesc);
        setSubFile(null);
      } else {
        await ParticipantApi.submitSubmissionLink({
          title: subTitle,
          link_url: subLinkUrl,
          description: subDesc,
        });
        setSubLinkUrl('');
      }
      setSubTitle('');
      setSubDesc('');
      setFeedback({ type: 'success', msg: 'Karya berhasil diunggah! Anda dapat mengunci versi final di bawah.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal mengunggah karya.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeSubmission = async (subId: string) => {
    if (!window.confirm('Kunci karya ini sebagai versi FINAL? Setelah dikunci, Anda tidak dapat mengunggah revisi lagi.')) {
      return;
    }
    setSaving(true);
    try {
      await ParticipantApi.finalizeSubmission(subId);
      setFeedback({ type: 'success', msg: 'Karya berhasil dikunci sebagai versi FINAL!' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal mengunci karya.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (
      !window.confirm(
        'Batalkan pendaftaran cabang lomba saat ini? Setelah dibatalkan, Anda dapat memilih dan mendaftar cabang lomba lain.'
      )
    ) {
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await ParticipantApi.cancelRegistration();
      setRegistration(null);
      setSelectedSlug('');
      setFeedback({ type: 'success', msg: 'Pendaftaran dibatalkan. Silakan pilih cabang lomba baru Anda.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.message || 'Gagal membatalkan pendaftaran.' });
    } finally {
      setSaving(false);
    }
  };

  const statusInfo = registration ? STATUS_META[registration.status] || STATUS_META.MENUNGGU_VERIFIKASI : null;
  const selectedComp = competitions.find((c) => c.slug === selectedSlug);
  const hasFinalSub = Boolean(registration?.submissions?.some((s: any) => s.is_final));

  return (
    <DashboardLayout
      currentUser={currentUser}
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={(tab) => {
        if (tab === 'submission' && !isVerified) {
          setFeedback({
            type: 'error',
            msg: 'Menu Unggah Karya akan terbuka otomatis setelah pendaftaran Anda diverifikasi oleh Panitia.',
          });
          return;
        }
        setFeedback(null);
        setActiveTab(tab);
      }}
    >
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3 bg-white/95 rounded-2xl p-4 sm:p-5 border border-[#ebdcc8] shadow-2xs">
          <div>
            <p className="text-[10px] font-cinzel uppercase tracking-[0.2em] text-[#ba883a] font-semibold">
              Portal Peserta Resmi • Digiconomic Fest 2027
            </p>
            <h1 className="font-cormorant text-2xl sm:text-3xl text-[#2f1e10] font-semibold">
              {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard Peserta'}
            </h1>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#faf4e8] hover:bg-[#f0e3cc] border border-[#caa152]/60 text-xs font-semibold text-[#2f1e10] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ba883a] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Segarkan</span>
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
          <div className="bg-white/80 rounded-2xl p-12 border border-[#ebdcc8] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#caa152]" />
            <p className="text-xs text-[#7a5530]">Memuat portal kepesertaan Anda...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: RINGKASAN & LINIMASA */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-cinzel uppercase tracking-widest text-[#ba883a] font-semibold">
                        Halo Peserta
                      </p>
                      <h2 className="font-cormorant text-2xl sm:text-3xl text-[#2f1e10] font-semibold mt-0.5">
                        {profile?.full_name || currentUser.name}
                      </h2>
                      <p className="text-xs text-[#7a5530] mt-1">
                        {profile?.institution || 'Lengkapi biodata & pilih cabang lomba resmi Anda.'}
                        {registration ? ` • Kode Registrasi: ${registration.registration_code}` : ''}
                      </p>
                    </div>
                    {statusInfo ? (
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border self-start sm:self-center ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('registration')}
                        className="px-4 py-2 rounded-full bg-[#ba883a] text-white text-xs font-semibold hover:bg-[#a6762d] transition-colors cursor-pointer self-start"
                      >
                        Mulai Pendaftaran Lomba →
                      </button>
                    )}
                  </div>

                  {statusInfo && (
                    <div className="mt-4 p-3.5 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] text-xs text-[#5c3e28]">
                      <p>{statusInfo.desc}</p>
                      {registration?.reject_reason && registration.status === 'DITOLAK' && (
                        <p className="mt-2 font-semibold text-red-700">
                          Catatan Revisi Panitia: &ldquo;{registration.reject_reason}&rdquo;
                        </p>
                      )}
                      {registration?.cancel_reason && registration.status === 'DIBATALKAN' && (
                        <p className="mt-2 font-semibold text-red-700">
                          Alasan Pembatalan: &ldquo;{registration.cancel_reason}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {registration?.group_url && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-emerald-900">
                          Grup Koordinasi Peserta ({registration.competition_name})
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Wajib bergabung untuk informasi Technical Meeting &amp; pengarahan pengumpulan karya.
                        </p>
                      </div>
                      <a
                        href={registration.group_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shrink-0"
                      >
                        <span>Gabung Grup WA</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Linimasa Step-by-Step */}
                <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-xs">
                  <h3 className="font-cormorant text-xl font-semibold text-[#2f1e10] mb-4">Progres Kepesertaan Anda</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        step: '1. Biodata & KTM',
                        done: Boolean(profile?.has_student_card),
                        desc: 'Isi data diri, NIM/NISN, dan unggah KTM',
                      },
                      {
                        step: '2. Pilih Lomba & Bayar',
                        done: Boolean(registration && registration.has_payment_proof),
                        desc: 'Pilih cabang lomba & unggah bukti QRIS',
                      },
                      {
                        step: '3. Verifikasi Panitia',
                        done: Boolean(isVerified),
                        desc: 'Validasi berkas & pembayaran resmi',
                      },
                      {
                        step: '4. Unggah Karya',
                        done: Boolean(registration?.submissions?.length > 0),
                        desc: 'Maks. 2 versi & kunci karya final',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border ${
                          item.done ? 'bg-emerald-50/60 border-emerald-300' : 'bg-[#faf4e8]/70 border-[#ebdcc8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2f1e10]">{item.step}</span>
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#7a5530]">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PENDAFTARAN & BERKAS */}
            {activeTab === 'registration' && (
              <div className="space-y-6">
                <form
                  onSubmit={registration || !selectedComp ? handleSaveProfileAndKtm : handleCreateRegistration}
                  className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-5"
                >
                  <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
                    {!registration ? (
                      <div className="space-y-3">
                        <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">1. Pilih Cabang Kompetisi</h3>
                        <p className="text-xs text-[#7a5530]">
                          Satu akun peserta hanya dapat mendaftar pada satu cabang lomba aktif.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {competitions.map((comp) => (
                            <label
                              key={comp.id}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedSlug === comp.slug
                                  ? 'border-[#ba883a] bg-[#faf4e8]'
                                  : 'border-[#ebdcc8] hover:border-[#caa152]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="competition_slug"
                                    value={comp.slug}
                                    checked={selectedSlug === comp.slug}
                                    onChange={() => {
                                      setSelectedSlug(comp.slug);
                                      setTeamMembers((members) =>
                                        Array.from({ length: Math.max(0, comp.max_team_size - 1) }, (_, index) =>
                                          members[index] || { full_name: '', nim: '', institution: '', phone_wa: '' }
                                        )
                                      );
                                    }}
                                    className="accent-[#ba883a]"
                                  />
                                  <span className="font-semibold text-sm text-[#2f1e10]">{comp.name}</span>
                                </div>
                                <span className="text-xs font-bold text-[#ba883a]">
                                  Rp {Number(comp.fee).toLocaleString('id-ID')}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#7a5530] mt-1.5 pl-6">
                                {comp.is_team ? `Tim (2–${comp.max_team_size} orang)` : 'Individu (Perorangan)'} • Sisa kuota:{' '}
                                <strong>{Math.max(0, comp.max_quota - comp.registered_count)}</strong>
                              </p>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#faf4e8] border border-[#caa152]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-cinzel uppercase tracking-wider text-[#ba883a] font-bold">
                            Cabang Lomba Terdaftar
                          </p>
                          <p className="text-sm font-bold text-[#2f1e10]">
                            {registration.competition_name} ({registration.registration_code})
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold text-[#2f1e10]">
                            Biaya: Rp {Number(registration.fee || 0).toLocaleString('id-ID')}
                          </span>
                          {['MENUNGGU_VERIFIKASI', 'DITOLAK'].includes(registration.status) && (
                            <button
                              type="button"
                              onClick={handleCancelRegistration}
                              disabled={saving}
                              className="px-3 py-1.5 rounded-full border border-red-300 bg-red-50 text-red-700 text-[11px] font-semibold hover:bg-red-100 cursor-pointer"
                            >
                              Batalkan &amp; Ganti Lomba
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 border-t border-[#ebdcc8] pt-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">
                            {registration
                              ? 'Biodata Peserta & Kartu Identitas (KTM)'
                              : selectedComp?.is_team
                                ? '2. Data Ketua Tim & KTM'
                                : 'Biodata Peserta & Kartu Identitas (KTM)'}
                          </h3>
                          {profile?.has_student_card && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              KTM Tersimpan
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Nama Lengkap *</label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 text-xs focus:outline-none focus:border-[#caa152]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">NIM / NISN *</label>
                            <input
                              type="text"
                              required
                              value={nim}
                              onChange={(e) => setNim(e.target.value)}
                              placeholder="Contoh: 215020100111001"
                              className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 text-xs focus:outline-none focus:border-[#caa152]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Asal Perguruan Tinggi / Sekolah *</label>
                            <input
                              type="text"
                              required
                              value={institution}
                              onChange={(e) => setInstitution(e.target.value)}
                              placeholder="Contoh: Universitas Brawijaya"
                              className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 text-xs focus:outline-none focus:border-[#caa152]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">No. WhatsApp Aktif *</label>
                            <input
                              type="tel"
                              required
                              value={phoneWa}
                              onChange={(e) => setPhoneWa(e.target.value)}
                              placeholder="081234567890"
                              className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 text-xs focus:outline-none focus:border-[#caa152]"
                            />
                          </div>
                        </div>

                        <FileDropCard
                          label="Unggah Kartu Tanda Mahasiswa / Kartu Pelajar (JPG, PNG, PDF maks. 2 MB) *"
                          selectedFile={ktmFile}
                          uploaded={Boolean(profile?.has_student_card)}
                          uploadedLabel="KTM sudah tersimpan di server"
                          onFileSelect={setKtmFile}
                        />

                        {(!registration && selectedComp?.is_team) || (registration?.is_team && registration.status === 'DITOLAK') ? (
                          <div className="space-y-4 pt-2 border-t border-[#ebdcc8]">
                            <div>
                              <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Nama Tim *</label>
                              <input
                                type="text"
                                required
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Contoh: Garuda Digital"
                                className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] bg-[#faf4e8]/40 text-xs focus:outline-none focus:border-[#caa152]"
                              />
                            </div>
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-[#2f1e10] flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-[#ba883a]" /> Data Anggota Tim (Selain Ketua)
                              </p>
                              {teamMembers.slice(0, (selectedComp?.max_team_size || 3) - 1).map((m, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-xl bg-[#faf4e8]/70 border border-[#ebdcc8] grid grid-cols-1 sm:grid-cols-2 gap-3"
                                >
                                  <input
                                    type="text"
                                    required={idx === 0 || Object.values(m).some((value) => value.trim().length > 0)}
                                    placeholder={`Nama Anggota ${idx + 2}${idx === 0 ? ' *' : ' (opsional)'}`}
                                    value={m.full_name}
                                    onChange={(e) => {
                                      const next = [...teamMembers];
                                      next[idx] = { ...next[idx], full_name: e.target.value };
                                      setTeamMembers(next);
                                    }}
                                    className="px-3 py-2 rounded-lg border border-[#d8be99] bg-white text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="NIM / NPM"
                                    value={m.nim || ''}
                                    onChange={(e) => {
                                      const next = [...teamMembers];
                                      next[idx] = { ...next[idx], nim: e.target.value };
                                      setTeamMembers(next);
                                    }}
                                    className="px-3 py-2 rounded-lg border border-[#d8be99] bg-white text-xs"
                                  />
                                  <input
                                    type="text"
                                    required={idx === 0 || Object.values(m).some((value) => value.trim().length > 0)}
                                    placeholder="Asal Perguruan Tinggi"
                                    value={m.institution}
                                    onChange={(e) => {
                                      const next = [...teamMembers];
                                      next[idx] = { ...next[idx], institution: e.target.value };
                                      setTeamMembers(next);
                                    }}
                                    className="px-3 py-2 rounded-lg border border-[#d8be99] bg-white text-xs"
                                  />
                                  <input
                                    type="tel"
                                    required={idx === 0 || Object.values(m).some((value) => value.trim().length > 0)}
                                    placeholder="No. WhatsApp (08...)"
                                    value={m.phone_wa}
                                    onChange={(e) => {
                                      const next = [...teamMembers];
                                      next[idx] = { ...next[idx], phone_wa: e.target.value };
                                      setTeamMembers(next);
                                    }}
                                    className="px-3 py-2 rounded-lg border border-[#d8be99] bg-white text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {!registration && selectedComp && (
                          <div className="rounded-xl border border-[#ebdcc8] bg-[#faf4e8] p-4 text-xs text-[#5c3e28] space-y-1">
                            <p className="font-semibold text-[#2f1e10]">Ringkasan Pendaftaran</p>
                            <p>
                              {selectedComp.name} •{' '}
                              {selectedComp.is_team
                                ? `Tim ${1 + teamMembers.filter((member) => member.full_name.trim()).length} orang`
                                : 'Peserta Individu'}
                            </p>
                            <p>Biaya Pendaftaran: Rp {Number(selectedComp.fee || 0).toLocaleString('id-ID')}</p>
                            <p>Setelah klik tombol di bawah, Anda akan diarahkan mengunggah bukti pembayaran QRIS.</p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 rounded-full bg-[#2f1e10] text-[#faf4e8] text-xs font-semibold hover:bg-[#462d18] transition-colors cursor-pointer"
                        >
                          {saving
                            ? 'Memproses...'
                            : registration
                              ? registration.status === 'DITOLAK'
                                ? 'Kirim Ulang Revisi Pendaftaran'
                                : 'Simpan Perubahan Biodata'
                              : selectedComp
                                ? 'Simpan Profil & Daftar Lomba Sekarang'
                                : 'Simpan Profil & KTM'}
                        </button>
                      </div>
                  </fieldset>
                </form>

                {/* Kartu Pembayaran QRIS */}
                {registration && ['MENUNGGU_VERIFIKASI', 'DITOLAK'].includes(registration.status) && (
                  <form
                    onSubmit={handleUploadPayment}
                    className="bg-white/95 rounded-2xl p-5 sm:p-6 border-2 border-[#caa152]/70 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#2f1e10] text-[#f3d48c] flex items-center justify-center shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">
                            Pembayaran Registrasi via QRIS Resmi
                          </h3>
                          <p className="text-xs text-[#7a5530]">
                            Nominal wajib transfer:{' '}
                            <strong className="text-[#2f1e10]">
                              Rp {Number(registration.fee || 0).toLocaleString('id-ID')}
                            </strong>
                          </p>
                        </div>
                      </div>
                      {registration.has_payment_proof && (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
                          Bukti Bayar Terunggah
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Nama Pengirim / E-Wallet / Bank *</label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Contoh: Budi Santoso (BCA / GoPay)"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Tanggal Pembayaran *</label>
                        <input
                          type="date"
                          required
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                        />
                      </div>
                    </div>

                    <FileDropCard
                      label="Unggah Bukti Transaksi QRIS (JPG, PNG, PDF maks. 2 MB) *"
                      selectedFile={paymentFile}
                      uploaded={Boolean(registration.has_payment_proof)}
                      uploadedLabel="Bukti pembayaran sudah diterima server"
                      onFileSelect={setPaymentFile}
                    />

                    <button
                      type="submit"
                      disabled={saving || !paymentFile}
                      className="px-6 py-2.5 rounded-full bg-[#ba883a] text-white text-xs font-semibold hover:bg-[#a6762d] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {saving ? 'Mengunggah...' : 'Kirim Bukti Pembayaran QRIS'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: PENGUMUMAN */}
            {activeTab === 'announcements' && (
              <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Papan Pengumuman Resmi Panitia</h3>
                {announcements.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#faf4e8]/60 border border-dashed border-[#d8be99] text-center text-xs text-[#7a5530]">
                    Belum ada pengumuman baru dari panitia untuk saat ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className={`p-4 rounded-xl border ${
                          ann.is_pinned ? 'bg-amber-50/70 border-[#caa152]' : 'bg-[#faf4e8]/60 border-[#ebdcc8]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="font-semibold text-sm text-[#2f1e10] flex items-center gap-1.5">
                            {ann.is_pinned && <Pin className="w-3.5 h-3.5 text-[#ba883a]" />}
                            {ann.title}
                          </h4>
                          <span className="text-[10px] text-[#7a5530]">
                            {ann.published_at ? new Date(ann.published_at).toLocaleDateString('id-ID') : ''}
                          </span>
                        </div>
                        <p className="text-xs text-[#5c3e28] whitespace-pre-line leading-relaxed">{ann.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: UNGGAH KARYA */}
            {activeTab === 'submission' && (
              <div className="space-y-5">
                {!isVerified ? (
                  <div className="bg-white/95 rounded-2xl p-8 border border-[#ebdcc8] text-center space-y-2">
                    <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
                    <h3 className="font-cormorant text-2xl text-[#2f1e10]">Fitur Unggah Karya Terkunci</h3>
                    <p className="text-xs text-[#7a5530]">
                      Fitur ini terbuka otomatis begitu pendaftaran dan pembayaran Anda berstatus Terverifikasi Resmi.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">Pengumpulan Karya Kompetisi</h3>
                          <p className="text-xs text-[#7a5530]">Anda dapat mengirim maksimal 2 versi sebelum mengunci karya final.</p>
                        </div>
                        <span className="text-xs font-semibold text-[#ba883a]">
                          Versi Terunggah: {registration?.submissions?.length || 0} / 2
                        </span>
                      </div>

                      {hasFinalSub ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                          Karya Anda telah dikunci sebagai versi FINAL dan siap dinilai oleh Dewan Juri.
                        </div>
                      ) : (registration?.submissions?.length || 0) >= 2 ? (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                          Anda telah mencapai batas maksimal 2 versi unggahan. Silakan kunci karya final pada daftar di bawah.
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitWork} className="space-y-4">
                          <div className="inline-flex p-1 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] gap-1">
                            <button
                              type="button"
                              onClick={() => setSubMode('file')}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                                subMode === 'file' ? 'bg-[#2f1e10] text-[#faf4e8]' : 'text-[#7a5530]'
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" /> Unggah PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => setSubMode('link')}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                                subMode === 'link' ? 'bg-[#2f1e10] text-[#faf4e8]' : 'text-[#7a5530]'
                              }`}
                            >
                              <Link2 className="w-3.5 h-3.5" /> Tautan Drive / Deck
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Judul Lengkap Karya *</label>
                            <input
                              type="text"
                              required
                              value={subTitle}
                              onChange={(e) => setSubTitle(e.target.value)}
                              placeholder="Masukkan judul karya naskah esai atau pitch deck..."
                              className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Abstrak / Ringkasan Eksekutif</label>
                            <textarea
                              rows={3}
                              value={subDesc}
                              onChange={(e) => setSubDesc(e.target.value)}
                              placeholder="Ringkasan gagasan utama karya Anda..."
                              className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                            />
                          </div>

                          {subMode === 'file' ? (
                            <FileDropCard
                              label="Unggah Dokumen Karya (PDF maks. 10 MB) *"
                              accept=".pdf"
                              maxSizeMb={10}
                              helperText="Format PDF resmi sesuai ketentuan Juklak & Juknis (maks. 10 MB)"
                              selectedFile={subFile}
                              onFileSelect={setSubFile}
                            />
                          ) : (
                            <div>
                              <label className="block text-xs font-semibold text-[#2f1e10] mb-1">
                                Tautan Berkas Karya (Google Drive / Pitch Deck) *
                              </label>
                              <input
                                type="url"
                                required
                                value={subLinkUrl}
                                onChange={(e) => setSubLinkUrl(e.target.value)}
                                placeholder="https://drive.google.com/file/d/..."
                                className="w-full px-3.5 py-2 rounded-xl border border-[#d8be99] text-xs"
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={saving || (subMode === 'file' ? !subFile : !subLinkUrl)}
                            className="px-6 py-2.5 rounded-full bg-[#ba883a] text-white text-xs font-semibold hover:bg-[#a6762d] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {saving ? 'Mengirim Karya...' : 'Kirim Versi Karya'}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Riwayat Unggahan */}
                    {registration?.submissions?.length > 0 && (
                      <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-3">
                        <h4 className="font-cormorant text-xl font-semibold text-[#2f1e10]">Riwayat Versi Karya</h4>
                        {registration.submissions.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="p-4 rounded-xl bg-[#faf4e8]/70 border border-[#ebdcc8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#2f1e10]">
                                  Versi {sub.version}: {sub.title}
                                </span>
                                {sub.is_final && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    TERKUNCI (FINAL)
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#7a5530] mt-0.5">
                                Diunggah: {new Date(sub.submitted_at).toLocaleString('id-ID')}
                              </p>
                            </div>
                            {!sub.is_final && !hasFinalSub && (
                              <button
                                type="button"
                                onClick={() => handleFinalizeSubmission(sub.id)}
                                disabled={saving}
                                className="px-4 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer self-start sm:self-center"
                              >
                                Kunci sebagai Final
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
