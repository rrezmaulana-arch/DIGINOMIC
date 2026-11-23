import React, { useState } from 'react';
import { Competition, Registration, UserProfile } from '../types';
import { COMPETITIONS_DATA } from '../data/competitions';
import { 
  Check, ArrowRight, ArrowLeft, MessageSquare, 
  Upload, AlertCircle, ShieldCheck, User, Building, Phone, Mail, CheckCircle2, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSimulate: (user: UserProfile) => void;
  initialCompetition?: Competition | null;
  onCompleteRegistration: (reg: Registration) => void;
  existingRegistration?: Registration | null;
}

export const RegistrationFlowModal: React.FC<RegistrationFlowProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSimulate,
  initialCompetition,
  onCompleteRegistration,
  existingRegistration,
}) => {
  // Alur yang diminta: 1. Isi Data Diri & Login -> 2. Payment Tampilkan QRIS & WhatsApp
  const [step, setStep] = useState<number>(1);

  const [selectedCompId, setSelectedCompId] = useState<string>(
    initialCompetition ? initialCompetition.id : COMPETITIONS_DATA[0].id
  );

  // Form Data Diri
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [institution, setInstitution] = useState('');
  const [phoneWa, setPhoneWa] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [teamName, setTeamName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [studentCardFile, setStudentCardFile] = useState<string | null>(null);

  // Generated Registration for payment step
  const [currentReg, setCurrentReg] = useState<Registration | null>(null);
  const [waClicked, setWaClicked] = useState(false);

  if (!isOpen) return null;

  const selectedComp = COMPETITIONS_DATA.find((c) => c.id === selectedCompId) || COMPETITIONS_DATA[0];

  // Helper Google One-Click Login
  const handleQuickGoogleAuth = () => {
    const mockUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 8),
      name: fullName || 'Muhammad Reza',
      email: email || 'reza.moetia@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'PESERTA',
    };
    onLoginSimulate(mockUser);
    setFullName(mockUser.name);
    setEmail(mockUser.email);
  };

  // Submit Data Diri -> Lanjut ke Halaman Payment QRIS
  const handleSubmitDataDiri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !institution || !phoneWa) {
      alert('Mohon lengkapi Nama Lengkap, Institusi, dan Nomor WhatsApp!');
      return;
    }

    const regCode = `DIGI-2027-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg: Registration = {
      id: 'reg-' + Date.now(),
      registrationCode: regCode,
      userId: currentUser?.id || 'usr-temp',
      competitionId: selectedComp.id,
      competitionTitle: selectedComp.title,
      participantName: fullName,
      institution: institution,
      phoneWa: phoneWa,
      email: email || currentUser?.email || 'peserta@gmail.com',
      isTeam: selectedComp.isTeam,
      teamName: selectedComp.isTeam ? teamName : undefined,
      teamMembers: selectedComp.isTeam
        ? [
            { fullName: member1 || 'Anggota 1', institution: institution, phoneWa: '-' },
            ...(member2 ? [{ fullName: member2, institution: institution, phoneWa: '-' }] : []),
          ]
        : undefined,
      studentCardName: studentCardFile || 'KTM-Tervalidasi.jpg',
      fee: selectedComp.fee,
      status: 'MENUNGGU_VERIFIKASI',
      registeredAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    setCurrentReg(newReg);
    setStep(2); // Masuk ke Halaman Payment (QRIS & Chat WA)
  };

  // WhatsApp Message Generator (Sesuai Permintaan User: Nama Peserta + Mohon Masukkan Gambar di WA)
  const getWhatsAppPaymentUrl = () => {
    if (!currentReg) return '#';
    const adminPhone = '6281234567890';
    const message = 
`Halo Panitia Digiconomic Fest 2027,
Saya ingin konfirmasi pembayaran pendaftaran:

*ID Registrasi*: #${currentReg.registrationCode}
*Nama Peserta*: ${currentReg.participantName}
*Institusi*: ${currentReg.institution}
*Lomba*: ${currentReg.competitionTitle}
*Kategori*: ${currentReg.isTeam ? `Tim (${currentReg.teamName || 'Tim'})` : 'Individu'}
*Total Pembayaran*: ${selectedComp.feeFormatted}

Mohon lampirkan gambar bukti transfer/pembayaran di chat ini untuk proses verifikasi. Terima kasih!`;

    return `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleOpenWhatsApp = () => {
    setWaClicked(true);
    const url = getWhatsAppPaymentUrl();
    window.open(url, '_blank');
  };

  const handleFinishAndGoToDashboard = () => {
    if (currentReg) {
      onCompleteRegistration(currentReg);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#fffdf9] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-[#caa152] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />
        
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#dfc9a5] text-[#5c3820] hover:bg-[#cfb58b] flex items-center justify-center font-bold text-xs transition-colors"
        >
          ✕
        </button>

        {/* Step Indicator Header */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between max-w-xs mx-auto mb-2 text-xs font-cinzel">
            <span className={step === 1 ? 'text-[#2f1e10] font-semibold tracking-wider' : 'text-[#7a5530]'}>
              1. Identitas Peserta
            </span>
            <span className="text-[#caa152]">✦ ✦ ✦</span>
            <span className={step === 2 ? 'text-[#2f1e10] font-semibold tracking-wider' : 'text-[#7a5530]'}>
              2. Pembayaran QRIS
            </span>
          </div>
          <div className="w-full bg-[#ebdcc8] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#caa152] to-[#7a5530] h-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* ================= TAHAP 1: ISI DATA DIRI & PILIH LOMBA ================= */}
        {step === 1 && (
          <form onSubmit={handleSubmitDataDiri} className="space-y-5 relative z-10">
            <div>
              <span className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-[#7a5530] font-normal">
                Tahap 1 dari 2 • Pendaftaran Peserta
              </span>
              <h3 className="font-cormorant text-2xl sm:text-3xl font-normal text-[#2f1e10]">
                Formulir Identitas Peserta
              </h3>
              <p className="font-sans text-xs text-[#5c3820] mt-1">
                Lengkapi identitas diri Anda. Pembayaran resmi diproses via QRIS Bank Indonesia pada langkah berikutnya.
              </p>
            </div>

            {/* Quick Fill Profile */}
            {!currentUser && (
              <div className="p-3 bg-[#faf4e8] rounded-xl border border-[#ebdcc8] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#7a5530]">
                  <ShieldCheck className="w-4 h-4 text-[#caa152] shrink-0" />
                  <span>Daftar langsung atau gunakan simulasi akun:</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickGoogleAuth}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#caa152] font-cinzel text-[11px] font-semibold text-[#2f1e10] hover:bg-[#faf4e8] shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <span className="text-[#caa152]">✦</span>
                  <span>Isi Data Cepat</span>
                </button>
              </div>
            )}

            {/* Pilih Lomba */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2a1a0e] uppercase tracking-wider block">
                Pilih Cabang Lomba:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COMPETITIONS_DATA.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedCompId === comp.id
                        ? 'bg-[#dfc9a5] border-[#7a5530] shadow-sm ring-1 ring-[#7a5530]'
                        : 'bg-[#faf5ec] border-[#c8a870]/60 hover:bg-[#f0e4cf]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1f1208]">{comp.title}</p>
                      <p className="text-[10px] text-[#7a5530] font-semibold">{comp.feeFormatted}</p>
                    </div>
                    {selectedCompId === comp.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#7a5530]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Biodata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2a1a0e] mb-1">
                  Nama Lengkap Peserta / Ketua *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Reza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c8a870] text-xs sm:text-sm text-[#1f1208] focus:outline-none focus:ring-2 focus:ring-[#7a5530]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a1a0e] mb-1">
                  Asal Sekolah / Universitas *
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: Universitas Indonesia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c8a870] text-xs sm:text-sm text-[#1f1208] focus:outline-none focus:ring-2 focus:ring-[#7a5530]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a1a0e] mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneWa}
                  onChange={(e) => setPhoneWa(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c8a870] text-xs sm:text-sm text-[#1f1208] focus:outline-none focus:ring-2 focus:ring-[#7a5530]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2a1a0e] mb-1">
                  Email Akun *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="peserta@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf5ec] border border-[#c8a870] text-xs sm:text-sm text-[#1f1208] focus:outline-none focus:ring-2 focus:ring-[#7a5530]"
                />
              </div>
            </div>

            {/* Data Tim (Jika Lomba Tim) */}
            {selectedComp.isTeam && (
              <div className="p-4 rounded-xl bg-[#e8dac7]/70 border border-[#b8955a] space-y-3">
                <p className="text-[11px] font-bold text-[#7a5530] uppercase tracking-wider">
                  Data Tim ({selectedComp.title})
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[#2a1a0e] mb-1">Nama Tim *</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Nama tim Anda"
                    className="w-full px-3 py-2 rounded-lg bg-[#faf5ec] border border-[#c8a870] text-xs text-[#1f1208]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2a1a0e] mb-1">Nama Anggota 1</label>
                    <input
                      type="text"
                      value={member1}
                      onChange={(e) => setMember1(e.target.value)}
                      placeholder="Nama rekan"
                      className="w-full px-3 py-2 rounded-lg bg-[#faf5ec] border border-[#c8a870] text-xs text-[#1f1208]"
                    />
                  </div>
                  {selectedComp.maxTeamSize > 2 && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2a1a0e] mb-1">Nama Anggota 2</label>
                      <input
                        type="text"
                        value={member2}
                        onChange={(e) => setMember2(e.target.value)}
                        placeholder="Nama rekan"
                        className="w-full px-3 py-2 rounded-lg bg-[#faf5ec] border border-[#c8a870] text-xs text-[#1f1208]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload KTM */}
            <div className="p-3.5 rounded-xl bg-[#e8dac7]/50 border border-[#b8955a]">
              <label className="block text-xs font-bold text-[#2a1a0e] mb-1">
                Upload KTM / Kartu Pelajar (JPG/PNG/PDF, Maks 2MB) *
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setStudentCardFile(e.target.files[0].name);
                  }
                }}
                className="text-xs text-[#5c3820] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#2a1a0e] file:text-white hover:file:bg-[#3e2615] cursor-pointer"
              />
              {studentCardFile && (
                <p className="text-[11px] text-[#7a5530] font-semibold mt-1.5 flex items-center gap-1 font-cinzel">
                  <Check className="w-3.5 h-3.5 text-[#caa152]" /> Berkas terpilih: {studentCardFile}
                </p>
              )}
            </div>

            {/* Tombol Lanjut ke Payment */}
            <div className="flex items-center justify-between pt-3 border-t border-[#dfceb5]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#b8955a] text-xs font-bold text-[#2a1a0e] hover:bg-[#dfc9a5]"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#9b6e38] hover:from-[#c9954a] hover:to-[#a8783e] text-white text-xs font-cinzel font-semibold tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Lanjut ke Pembayaran QRIS</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        )}

        {/* ================= TAHAP 2: PAYMENT (TAMPILKAN QRIS & CHAT WA LANGSUNG) ================= */}
        {step === 2 && currentReg && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a5530]">
                Tahap 2 dari 2 • Pembayaran QRIS
              </span>
              <h3 className="font-serif-disp text-2xl font-bold text-[#1f1208]">
                Scan QRIS & Kirim Bukti ke WhatsApp
              </h3>
              <p className="text-xs text-[#5c3820] mt-1 max-w-md mx-auto">
                Scan kode QRIS di bawah ini, lalu klik tombol konfirmasi untuk membuka chat WhatsApp resmi panitia beserta bukti pembayaran.
              </p>
            </div>

            {/* Ringkasan Registrasi */}
            <div className="bg-[#f0e4cf] p-4 rounded-2xl border border-[#b8955a] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold text-[#7a5530] uppercase">
                  ID Pendaftaran: #{currentReg.registrationCode}
                </span>
                <h4 className="font-serif-disp font-bold text-base text-[#1f1208]">
                  {currentReg.competitionTitle}
                </h4>
                <p className="text-xs text-[#5c3820]">
                  Peserta: <strong>{currentReg.participantName}</strong> ({currentReg.institution})
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0 bg-[#dfc9a5] px-4 py-2 rounded-xl border border-[#b8955a]">
                <span className="text-[10px] font-semibold text-[#7a5530] block">Total Pembayaran</span>
                <span className="font-cinzel text-xl font-black text-[#1f1208]">
                  {selectedComp.feeFormatted}
                </span>
              </div>
            </div>

            {/* QRIS Code Card */}
            <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border-2 border-[#b8955a] shadow-md max-w-xs mx-auto text-center relative overflow-hidden">
              {/* QRIS Header */}
              <div className="w-full pb-2 border-b border-dashed border-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs tracking-wider text-[#2f1e10]">QRIS</span>
                  <span className="text-[8px] text-[#7a5530] font-semibold">Standar Pembayaran Nasional</span>
                </div>
                <span className="text-[8px] bg-[#f0e3cc] text-[#2f1e10] font-bold px-1.5 py-0.5 rounded border border-[#caa152]">GPN</span>
              </div>

              {/* Merchant Title */}
              <div className="my-2">
                <p className="font-bold text-xs text-[#1f1208]">DIGICONOMIC FEST 2027</p>
                <p className="text-[9px] text-gray-500 font-mono">NMID : ID102027DIGI01</p>
              </div>

              {/* QR Image Graphic with Logo in Center */}
              <div className="relative p-2.5 bg-neutral-50 rounded-xl border border-gray-200 shadow-inner">
                <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200" fill="none">
                  <rect x="10" y="10" width="45" height="45" rx="4" fill="#2a1a0e" />
                  <rect x="18" y="18" width="29" height="29" rx="2" fill="#ffffff" />
                  <rect x="25" y="25" width="15" height="15" rx="1" fill="#2a1a0e" />

                  <rect x="145" y="10" width="45" height="45" rx="4" fill="#2a1a0e" />
                  <rect x="153" y="18" width="29" height="29" rx="2" fill="#ffffff" />
                  <rect x="160" y="25" width="15" height="15" rx="1" fill="#2a1a0e" />

                  <rect x="10" y="145" width="45" height="45" rx="4" fill="#2a1a0e" />
                  <rect x="18" y="153" width="29" height="29" rx="2" fill="#ffffff" />
                  <rect x="25" y="160" width="15" height="15" rx="1" fill="#2a1a0e" />

                  <g fill="#3d2614">
                    <rect x="65" y="15" width="8" height="8" />
                    <rect x="80" y="15" width="8" height="8" />
                    <rect x="95" y="15" width="8" height="8" />
                    <rect x="110" y="15" width="8" height="8" />
                    <rect x="125" y="15" width="8" height="8" />
                    <rect x="65" y="30" width="8" height="8" />
                    <rect x="95" y="30" width="8" height="8" />
                    <rect x="125" y="30" width="8" height="8" />
                    <rect x="65" y="45" width="8" height="8" />
                    <rect x="80" y="45" width="8" height="8" />
                    <rect x="110" y="45" width="8" height="8" />
                    <rect x="15" y="65" width="8" height="8" />
                    <rect x="30" y="65" width="8" height="8" />
                    <rect x="45" y="65" width="8" height="8" />
                    <rect x="145" y="65" width="8" height="8" />
                    <rect x="160" y="65" width="8" height="8" />
                    <rect x="175" y="65" width="8" height="8" />
                    <rect x="15" y="80" width="8" height="8" />
                    <rect x="45" y="80" width="8" height="8" />
                    <rect x="145" y="80" width="8" height="8" />
                    <rect x="175" y="80" width="8" height="8" />
                    <rect x="65" y="145" width="8" height="8" />
                    <rect x="80" y="145" width="8" height="8" />
                    <rect x="95" y="145" width="8" height="8" />
                    <rect x="125" y="145" width="8" height="8" />
                    <rect x="65" y="160" width="8" height="8" />
                    <rect x="110" y="160" width="8" height="8" />
                    <rect x="125" y="160" width="8" height="8" />
                    <rect x="65" y="175" width="8" height="8" />
                    <rect x="80" y="175" width="8" height="8" />
                    <rect x="140" y="175" width="8" height="8" />
                  </g>

                  <rect x="76" y="76" width="48" height="48" rx="8" fill="#ffffff" stroke="#c8a870" strokeWidth="2" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 p-0.5 rounded-md bg-white flex items-center justify-center shadow-sm">
                    <img src="/Logo/00-logo-gabungan.svg" alt="Digi" className="w-7 h-7 object-contain" />
                  </div>
                </div>
              </div>

              <div className="w-full pt-2 mt-2 border-t border-gray-200">
                <p className="text-[9px] text-gray-500 font-semibold">
                  Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana
                </p>
              </div>
            </div>

            {/* Instruksi Chat WhatsApp */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-[#523722]">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1f1208]">
                    Konfirmasi WhatsApp Wajib Melampirkan Bukti:
                  </p>
                  <p className="text-[11px] text-[#614631] mt-0.5">
                    Klik tombol di bawah untuk membuka chat WhatsApp panitia. Pesan akan terisi otomatis dengan nama dan ID Anda. <strong>Mohon lampirkan gambar/screenshot bukti bayar di chat tersebut.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi Utama WhatsApp */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#9b6e38] hover:from-[#c9954a] hover:to-[#a8783e] text-white font-cinzel font-semibold text-xs sm:text-sm tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 active:scale-95 border border-[#caa152]"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Kirim Konfirmasi ke WhatsApp Panitia 💬</span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-[#b8955a] text-xs font-bold text-[#2a1a0e] hover:bg-[#dfc9a5]"
                >
                  Edit Data Diri
                </button>
                <button
                  type="button"
                  onClick={handleFinishAndGoToDashboard}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#2a1a0e] hover:bg-[#3e2615] text-[#f5e9d4] text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#c9a56e]" />
                  <span>Selesai & Buka Dashboard Peserta</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
