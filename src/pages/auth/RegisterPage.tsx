import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { COMPETITIONS_DATA } from '../../data/competitions';
import { Competition, Registration, TeamMember, UserProfile } from '../../types';
import { RegistrationService } from '../../services/registrationService';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  QrCode,
  Upload,
  FileText,
  Users,
  User,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: (newReg: Registration, user: UserProfile) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCompId = searchParams.get('lomba') || 'comp-1';

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCompId, setSelectedCompId] = useState<string>(initialCompId);

  // Form Fields
  const [participantName, setParticipantName] = useState('');
  const [institution, setInstitution] = useState('');
  const [phoneWa, setPhoneWa] = useState('');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { fullName: '', institution: '', phoneWa: '' }
  ]);
  const [studentCardFile, setStudentCardFile] = useState<string>('KTM_Dokumen_Simulasi.pdf');
  const [formError, setFormError] = useState<string | null>(null);

  // Created registration data for step 2
  const [createdReg, setCreatedReg] = useState<Registration | null>(null);

  // Data Quota & Settings
  const settings = RegistrationService.getSettings();
  const allRegistrations = RegistrationService.getAll();
  const esaiCount = allRegistrations.filter((r) => r.competitionId === 'comp-1').length;
  const caseCount = allRegistrations.filter((r) => r.competitionId === 'comp-2').length;

  const isEsaiFull = esaiCount >= settings.maxQuotaEsai;
  const isCaseFull = caseCount >= settings.maxQuotaCase;
  const isRegistrationClosed = !settings.isRegistrationOpen;

  const selectedCompetition = COMPETITIONS_DATA.find((c: Competition) => c.id === selectedCompId) || COMPETITIONS_DATA[0];

  useEffect(() => {
    if (searchParams.get('lomba')) {
      setSelectedCompId(searchParams.get('lomba')!);
    }
  }, [searchParams]);

  const handleAddMember = () => {
    if (teamMembers.length < 2) {
      setTeamMembers([...teamMembers, { fullName: '', institution: '', phoneWa: '' }]);
    }
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleUpdateMember = (index: number, field: keyof TeamMember, val: string) => {
    const updated = [...teamMembers];
    updated[index][field] = val;
    setTeamMembers(updated);
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Cek status penutupan pendaftaran
    if (isRegistrationClosed) {
      setFormError('Pendaftaran saat ini sedang ditutup oleh panitia.');
      return;
    }

    // 2. Cek kuota cabang lomba
    if (selectedCompetition.id === 'comp-1' && isEsaiFull) {
      setFormError('Mohon maaf, kuota peserta Esai Nasional telah penuh.');
      return;
    }
    if (selectedCompetition.id === 'comp-2' && isCaseFull) {
      setFormError('Mohon maaf, kuota peserta Mini Case Competition telah penuh.');
      return;
    }

    // 3. Validasi identitas wajib
    if (!participantName.trim() || !institution.trim() || !phoneWa.trim() || !email.trim()) {
      setFormError('Mohon lengkapi seluruh kolom formulir identitas.');
      return;
    }

    // 4. Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError('Format email tidak valid. Masukkan alamat email yang benar.');
      return;
    }

    // 5. Cek duplikasi email pada data pendaftar demo
    const cleanEmail = email.trim().toLowerCase();
    const isEmailTaken = allRegistrations.some((r) => r.email.toLowerCase() === cleanEmail);
    if (isEmailTaken) {
      setFormError('Email ini sudah terdaftar di sistem. Silakan login ke akun Anda atau gunakan email lain.');
      return;
    }

    if (selectedCompetition.isTeam && !teamName.trim()) {
      setFormError('Mohon isi nama tim Anda.');
      return;
    }

    // 6. Generate kode pendaftaran unik tanpa kemungkinan bentrok (Collision-free)
    const existingCodes = new Set(allRegistrations.map((r) => r.registrationCode));
    let regCode = '';
    let attempts = 0;
    do {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      regCode = `DIGI-2027-${suffix}`;
      attempts++;
    } while (existingCodes.has(regCode) && attempts < 50);

    const newReg: Registration = {
      id: 'reg-' + Date.now(),
      registrationCode: regCode,
      userId: 'usr-' + Date.now(),
      competitionId: selectedCompetition.id,
      competitionTitle: selectedCompetition.title,
      participantName: participantName.trim(),
      institution: institution.trim(),
      phoneWa: phoneWa.trim(),
      email: cleanEmail,
      isTeam: selectedCompetition.isTeam,
      teamName: selectedCompetition.isTeam ? teamName.trim() : undefined,
      teamMembers: selectedCompetition.isTeam ? teamMembers.filter((m) => m.fullName.trim() !== '') : undefined,
      studentCardName: studentCardFile,
      fee: selectedCompetition.fee,
      status: 'MENUNGGU_VERIFIKASI',
      registeredAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    };

    const userProfile: UserProfile = {
      id: newReg.userId,
      name: participantName.trim(),
      email: cleanEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      role: 'PESERTA'
    };

    // Simpan ke service lokal browser
    RegistrationService.create(newReg);
    RegistrationService.setCurrentUser(userProfile);
    setCreatedReg(newReg);
    onRegisterSuccess(newReg, userProfile);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWhatsAppConfirm = () => {
    if (!createdReg) return;
    const url = RegistrationService.buildWhatsAppPaymentUrl(createdReg, selectedCompetition.feeFormatted);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fdf8ef] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#caa152]/30 selection:text-[#2f1e10] relative">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(202, 161, 82, 0.35) 0%, rgba(235, 220, 200, 0.15) 60%, transparent 80%)'
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">

        {/* Top Back & Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-cinzel text-[#7a5530] hover:text-[#2f1e10] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#caa152]" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-cinzel font-semibold tracking-wider border ${step === 1 ? 'bg-[#2f1e10] text-[#f5eee2] border-[#caa152]' : 'bg-[#faf4e8] text-[#7a5530] border-[#ebdcc8]'
              }`}>
              1. Formulir Data Diri
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-cinzel font-semibold tracking-wider border ${step === 2 ? 'bg-[#2f1e10] text-[#f5eee2] border-[#caa152]' : 'bg-[#faf4e8] text-[#7a5530] border-[#ebdcc8]'
              }`}>
              2. Simulasi QRIS & Pembayaran
            </span>
          </div>
        </div>

        {/* Closed Banner Warning */}
        {isRegistrationClosed && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-semibold">Pendaftaran Resmi Sedang Ditutup</p>
              <p className="text-[11px] text-amber-800">
                Pendaftaran untuk seluruh kompetisi saat ini sedang ditutup di pengaturan sistem (Mode Demo).
              </p>
            </div>
          </div>
        )}

        {/* Main Card Container */}
        <div className="bg-[#fffdf9] rounded-3xl border-2 border-[#caa152] shadow-2xl p-6 sm:p-8 relative">
          <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

          {/* Form Error Notice */}
          {formError && (
            <div className="relative z-10 mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* ================= STEP 1: FORM PENDAFTARAN ================= */}
          {step === 1 && (
            <form onSubmit={handleSubmitStep1} className="space-y-6 relative z-10">

              {/* Card Title */}
              <div className="text-center max-w-xl mx-auto border-b border-[#ebdcc8] pb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf4e8] border border-[#ebdcc8] text-[10px] font-cinzel text-[#7a5530] mb-2 uppercase tracking-widest font-semibold">
                  <Sparkles className="w-3 h-3 text-[#caa152]" />
                  <span>Portal Pendaftaran Resmi (Mode Demo)</span>
                </div>
                <h1 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#2f1e10]">
                  Registrasi Peserta Kompetisi
                </h1>
                <p className="font-sans text-xs text-[#7a5530] mt-1 font-normal">
                  Data yang Anda masukkan tersimpan di browser ini (localStorage) untuk simulasi alur kompetisi.
                </p>
              </div>

              {/* 1. Pilih Cabang Lomba */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-2">
                  Pilih Cabang Kompetisi *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COMPETITIONS_DATA.map((comp: Competition) => {
                    const isSelected = selectedCompId === comp.id;
                    const isCompFull = comp.id === 'comp-1' ? isEsaiFull : isCaseFull;
                    const currentCount = comp.id === 'comp-1' ? esaiCount : caseCount;
                    const maxQuota = comp.id === 'comp-1' ? settings.maxQuotaEsai : settings.maxQuotaCase;

                    return (
                      <div
                        key={comp.id}
                        onClick={() => !isCompFull && setSelectedCompId(comp.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${isCompFull
                            ? 'opacity-60 bg-gray-100 border-gray-300 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#faf4e8] border-[#caa152] shadow-sm'
                              : 'bg-white border-[#ebdcc8] hover:border-[#caa152]/50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-cinzel text-xs font-bold text-[#2f1e10]">
                            {comp.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0e3cc] text-[#7a5530] font-sans font-semibold">
                            {comp.isTeam ? 'Tim (2-3 Org)' : 'Individu'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7a5530] line-clamp-2 mb-2 font-sans font-normal">
                          {comp.description}
                        </p>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#ebdcc8]/60">
                          <span className="font-cormorant font-bold text-base text-[#ba883a]">
                            {comp.feeFormatted}
                          </span>
                          <span className="text-[10px] text-[#7a5530]">
                            {isCompFull ? (
                              <strong className="text-red-700">Kuota Penuh ({currentCount}/{maxQuota})</strong>
                            ) : (
                              `Sisa Kuota: ${maxQuota - currentCount} Slot`
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Informasi Utama Pendaftar */}
              <div className="space-y-4 pt-2">
                <h3 className="font-cinzel text-xs font-bold tracking-wider text-[#7a5530] uppercase border-b border-[#ebdcc8] pb-1">
                  Identitas {selectedCompetition.isTeam ? 'Ketua Tim' : 'Peserta'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcc8] bg-white text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
                      Asal Perguruan Tinggi / Sekolah *
                    </label>
                    <input
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Contoh: Universitas Indonesia"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcc8] bg-white text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneWa}
                      onChange={(e) => setPhoneWa(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcc8] bg-white text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
                      Alamat Email Aktif *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Contoh: budi.santoso@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcc8] bg-white text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Anggota Tim (Jika Cabang Tim) */}
              {selectedCompetition.isTeam && (
                <div className="space-y-3 pt-2 bg-[#faf4e8] p-4 rounded-2xl border border-[#ebdcc8]">
                  <h3 className="font-cinzel text-xs font-bold tracking-wider text-[#7a5530] uppercase">
                    Detail Anggota Tim
                  </h3>

                  <div>
                    <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
                      Nama Tim / Kontingen *
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Contoh: FinNova Consulting"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcc8] bg-white text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152]"
                    />
                  </div>

                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-[#ebdcc8] space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-[10px] font-semibold text-[#7a5530]">
                          Anggota {idx + 1}
                        </span>
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="text-[#7a5530] hover:text-[#2f1e10] p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          value={member.fullName}
                          onChange={(e) => handleUpdateMember(idx, 'fullName', e.target.value)}
                          placeholder="Nama Anggota"
                          className="p-2 text-xs rounded-lg border border-[#ebdcc8]"
                        />
                        <input
                          type="text"
                          required
                          value={member.institution}
                          onChange={(e) => handleUpdateMember(idx, 'institution', e.target.value)}
                          placeholder="Asal Kampus"
                          className="p-2 text-xs rounded-lg border border-[#ebdcc8]"
                        />
                        <input
                          type="tel"
                          required
                          value={member.phoneWa}
                          onChange={(e) => handleUpdateMember(idx, 'phoneWa', e.target.value)}
                          placeholder="Nomor WA"
                          className="p-2 text-xs rounded-lg border border-[#ebdcc8]"
                        />
                      </div>
                    </div>
                  ))}

                  {teamMembers.length < 2 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-1.5 rounded-lg border border-[#caa152] bg-white text-xs font-cinzel font-semibold text-[#7a5530] hover:bg-[#f0e3cc]/40 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#caa152]" />
                      <span>Tambah Anggota Tim (Maks 2)</span>
                    </button>
                  )}
                </div>
              )}

              {/* 4. Upload KTM (Simulasi) */}
              <div>
                <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
                  Upload Kartu Tanda Mahasiswa / Pelajar (KTM) *
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-[#caa152]/40 bg-[#faf4e8]/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f0e3cc] flex items-center justify-center text-[#7a5530]">
                      <FileText className="w-5 h-5 text-[#caa152]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#2f1e10]">{studentCardFile}</p>
                      <p className="text-[10px] text-[#7a5530]">
                        <span className="font-medium text-[#ba883a]">(Simulasi Demo: File tidak diunggah ke server fisik)</span>
                      </p>
                    </div>
                  </div>
                  <label className="px-4 py-2 rounded-xl bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold cursor-pointer border border-[#caa152] transition-all">
                    PILIH FILE
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setStudentCardFile(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#ebdcc8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  to="/login"
                  className="text-xs text-[#7a5530] hover:text-[#2f1e10] font-sans underline"
                >
                  Sudah pernah mendaftar? Masuk ke akun Anda
                </Link>

                <button
                  type="submit"
                  disabled={isRegistrationClosed}
                  className={`w-full sm:w-auto px-8 py-3 rounded-full text-white font-cinzel text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] ${isRegistrationClosed
                      ? 'bg-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] border border-[#caa152]'
                    }`}
                >
                  <span>LANJUT KE PEMBAYARAN QRIS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* ================= STEP 2: SIMULASI PEMBAYARAN QRIS ================= */}
          {step === 2 && createdReg && (
            <div className="space-y-6 relative z-10 animate-in fade-in">
              <div className="text-center max-w-xl mx-auto border-b border-[#ebdcc8] pb-5">
                <div className="w-12 h-12 rounded-full bg-[#f0e3cc] border-2 border-[#caa152] text-[#2f1e10] flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-[#caa152]" />
                </div>
                <h2 className="font-cormorant text-3xl font-normal text-[#2f1e10]">
                  Formulir Berhasil Disimpan (Mode Demo)
                </h2>
                <p className="font-sans text-xs text-[#7a5530] mt-1 font-normal">
                  Pendaftaran Anda tersimpan di browser ini. Selesaikan simulasi pembayaran di bawah ini.
                </p>
              </div>

              {/* Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                {/* QRIS Display (Simulasi Jelas) */}
                <div className="md:col-span-5 bg-white p-5 rounded-2xl border-2 border-[#caa152] text-center shadow-xs">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[9px] font-sans font-semibold text-amber-900 mb-2 uppercase">
                    Simulasi QRIS (Bukan Transaksi Nyata)
                  </div>
                  <div className="w-44 h-44 mx-auto bg-[#faf4e8] p-2 rounded-xl border border-[#ebdcc8] flex flex-col items-center justify-center relative">
                    <QrCode className="w-36 h-36 text-[#2f1e10] opacity-80" />
                    <span className="text-[9px] font-mono text-[#7a5530] mt-1 font-bold">NMID: SIMULASI-DEMO-2027</span>
                  </div>
                  <p className="text-[10px] text-[#7a5530] mt-2 font-sans leading-relaxed">
                    Tampilan di atas adalah ikon demonstrasi simulasi antarmuka. Tidak memproses penarikan uang nyata.
                  </p>
                </div>

                {/* Registration Details */}
                <div className="md:col-span-7 space-y-3.5 bg-[#faf4e8] p-5 sm:p-6 rounded-2xl border border-[#ebdcc8]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8]">
                    <span className="text-xs text-[#7a5530] font-cinzel">Nomor Registrasi:</span>
                    <span className="font-mono font-bold text-sm text-[#2f1e10] bg-white px-2.5 py-0.5 rounded border border-[#caa152]">
                      #{createdReg.registrationCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8]">
                    <span className="text-xs text-[#7a5530] font-cinzel">Cabang Lomba:</span>
                    <span className="font-medium text-xs text-[#2f1e10] text-right">
                      {createdReg.competitionTitle}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8]">
                    <span className="text-xs text-[#7a5530] font-cinzel">Nama Peserta / Tim:</span>
                    <span className="font-medium text-xs text-[#2f1e10] text-right">
                      {createdReg.participantName} {createdReg.teamName ? `(${createdReg.teamName})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8]">
                    <span className="text-xs text-[#7a5530] font-cinzel">Total Pembayaran:</span>
                    <span className="font-cormorant font-bold text-2xl text-[#ba883a]">
                      {selectedCompetition.feeFormatted}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#ebdcc8] text-xs text-[#5c3e28] space-y-1">
                    <p className="font-semibold text-[#2f1e10]">Petunjuk Alur Verifikasi Demo:</p>
                    <p className="text-[11px] leading-relaxed">
                      Klik <strong>"Simulasi Konfirmasi WhatsApp"</strong> untuk melihat format pesan panitia, atau langsung klik <strong>"Buka Dashboard Peserta"</strong> untuk melihat status berkas Anda.
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#ebdcc8] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppConfirm}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2f1e10] hover:bg-[#7a5530] text-[#f5eee2] font-cinzel text-xs font-semibold tracking-wider flex items-center justify-center gap-2 border border-[#caa152] transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-[#caa152]" />
                  <span>SIMULASI KONFIRMASI WHATSAPP</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-white font-cinzel text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] border border-[#caa152]"
                >
                  <span>BUKA DASHBOARD PESERTA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
