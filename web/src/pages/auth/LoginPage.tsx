import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types';
import { RegistrationService } from '../../services/registrationService';
import { BatikKawungPattern, CornerFiligree, MegaMendungClouds } from '../../components/Ornaments';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  Info 
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Otentikasi demo sebenarnya via RegistrationService
    const result = RegistrationService.authenticate(email, password);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Autentikasi gagal. Periksa kembali email dan kata sandi Anda.');
      return;
    }

    onLogin(result.user);

    if (result.user.role === 'PESERTA') {
      navigate('/dashboard');
    } else if (result.user.role === 'ADMIN') {
      navigate('/admin');
    } else if (result.user.role === 'SUPERADMIN') {
      navigate('/superadmin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf4e8] via-[#f5ebda] to-[#efe1cc] overflow-hidden flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-[#caa152]/30 selection:text-[#2f1e10]">
      {/* Background radial glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(202, 161, 82, 0.4) 0%, rgba(235, 220, 200, 0.2) 60%, transparent 80%)'
        }}
      />

      <BatikKawungPattern color="#7a5530" opacity={0.05} id="kawung-login" />
      <MegaMendungClouds color="#8c6239" className="absolute top-6 -right-16 w-80 opacity-45" />
      <MegaMendungClouds color="#8c6239" flip className="absolute bottom-6 -left-16 w-80 opacity-40" />
      {/* Top back button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-cinzel text-[#7a5530] hover:text-[#2f1e10] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#caa152]" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-[10px] font-cinzel tracking-widest text-[#caa152] uppercase font-semibold">
          ✦ Portal Akses Resmi ✦
        </span>
      </div>

      {/* Login Card */}
      <div className="bg-[#fffdf9]/96 backdrop-blur-sm rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-[#caa152]/80 shadow-[0_24px_60px_-16px_rgba(47,30,16,0.22)] relative z-10 overflow-hidden">
        <CornerFiligree color="#caa152" />
        <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

        {/* Card Header */}
        <div className="text-center relative z-10 mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f0e3cc] to-[#faf4e8] border border-[#caa152] mb-3 shadow-2xs">
            <img 
              src="/Logo/00-logo-gabungan.svg" 
              alt="Logo Digiconomic" 
              className="w-10 h-10 object-contain drop-shadow-2xs" 
            />
          </div>
          <h2 className="font-cormorant text-3xl font-normal text-[#2f1e10] tracking-tight">
            Masuk Portal Akun
          </h2>
          <p className="font-sans text-xs text-[#7a5530] mt-1 font-normal">
            Masukkan kredensial akun peserta atau panitia terdaftar untuk melanjutkan.
          </p>
        </div>

        {/* Notice Demo Mode */}
        <div className="relative z-10 mb-5 p-3 rounded-xl bg-[#faf4e8] border border-[#ebdcc8] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#ba883a] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#5c3e28] leading-relaxed">
            <strong className="font-semibold text-[#2f1e10]">Mode Demo Prototipe:</strong>
            <p>Aplikasi ini belum terhubung ke database atau backend nyata. Data tersimpan di browser ini.</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="relative z-10 mb-4 p-3 rounded-xl bg-red-50/80 border border-red-200 text-red-900 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Inputs (No Tab Selector - Validates Real Credentials) */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
              Email Akun Terdaftar
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#7a5530]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@anda.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#ebdcc8] bg-[#faf4e8]/60 text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] focus:ring-2 focus:ring-[#caa152]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#7a5530]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#ebdcc8] bg-[#faf4e8]/60 text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] focus:ring-2 focus:ring-[#caa152]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full text-white font-cinzel text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] border border-[#caa152]"
          >
            <span>MASUK KE SISTEM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Bottom register link */}
        <div className="text-center mt-5 pt-4 border-t border-[#ebdcc8] relative z-10">
          <p className="text-xs text-[#7a5530]">
            Belum mendaftarkan karya peserta lomba?{' '}
            <Link to="/daftar" className="font-semibold text-[#2f1e10] underline decoration-[#caa152] hover:text-[#ba883a]">
              Daftar Sekarang
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
