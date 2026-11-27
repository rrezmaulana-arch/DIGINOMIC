import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { UserProfile } from '../../types';
import { AuthApi, mapBackendUser } from '../../services/apiService';
import { BatikKawungPattern, CornerFiligree } from '../../components/Ornaments';
import {
  ArrowRight,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  staff?: boolean;
}

export const PENDING_COMPETITION_KEY = 'diginomic:pending-competition-slug';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, staff = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasGoogleClientId = Boolean((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID);

  useEffect(() => {
    const preselectedLomba = searchParams.get('lomba');
    if (preselectedLomba) {
      try {
        sessionStorage.setItem(PENDING_COMPETITION_KEY, preselectedLomba);
      } catch {
        // Abaikan bila sessionStorage dibatasi
      }
    }
  }, [searchParams]);

  const redirectByRole = (role: UserProfile['role']) => {
    if (role === 'PESERTA') navigate('/dashboard');
    else if (role === 'SUPERADMIN') navigate('/superadmin');
    else navigate('/admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await AuthApi.login(email, password);
      const user = mapBackendUser(res.user);
      onLogin(user);
      redirectByRole(user.role);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Autentikasi gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await AuthApi.loginGoogle(credential);
      const user = mapBackendUser(res.user);
      onLogin(user);
      if (res.is_new_user || !res.profile_complete) {
        navigate('/dashboard?lengkapi_profil=1');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf4e8] via-[#f5ebda] to-[#efe1cc] overflow-x-clip flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-[#caa152]/30 selection:text-[#2f1e10]">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(202, 161, 82, 0.4) 0%, rgba(235, 220, 200, 0.2) 60%, transparent 80%)',
        }}
      />

      <BatikKawungPattern color="#7a5530" opacity={0.05} id="kawung-login" />

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

      <div className="bg-[#fffdf9]/96 backdrop-blur-sm rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-[#caa152]/80 shadow-[0_24px_60px_-16px_rgba(47,30,16,0.22)] relative z-10 overflow-hidden">
        <CornerFiligree color="#caa152" />
        <div className="absolute inset-2 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

        <div className="text-center relative z-10 mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f0e3cc] to-[#faf4e8] border border-[#caa152] mb-3 shadow-2xs">
            <img
              src="/Logo/00-logo-gabungan.svg"
              alt="Logo Digiconomic"
              className="w-10 h-10 object-contain drop-shadow-2xs"
            />
          </div>
          <h1 className="font-cormorant text-3xl font-normal text-[#2f1e10] tracking-tight">
            {staff ? 'Portal Panitia & Dewan Juri' : 'Masuk Peserta'}
          </h1>
          <p className="font-sans text-xs text-[#7a5530] mt-1">
            {staff
              ? 'Masuk menggunakan email dan kata sandi resmi yang diberikan SuperAdmin.'
              : 'Daftar baru atau masuk instan menggunakan akun Google terverifikasi.'}
          </p>
        </div>

        {errorMessage && (
          <div className="relative z-10 mb-4 p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {staff ? (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-cinzel font-semibold text-[#2f1e10] tracking-wider uppercase mb-1">
                Email Akun Staf
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#7a5530]" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@diginomic.id"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#ebdcc8] bg-[#faf4e8]/60 text-xs text-[#2f1e10] focus:outline-none focus:border-[#caa152] focus:ring-2 focus:ring-[#caa152]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-white font-cinzel text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] bg-gradient-to-r from-[#ba883a] via-[#caa152] to-[#b88636] border border-[#caa152] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>MASUK PANEL STAF</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="relative z-10 space-y-5">
            <div className="p-4 rounded-2xl bg-[#faf4e8]/80 border border-[#ebdcc8] flex flex-col items-center gap-3">
              <p className="text-xs text-[#5c3e28] text-center leading-relaxed">
                Gunakan akun Google aktif Anda untuk mendaftar cabang lomba <strong>Esai</strong> atau{' '}
                <strong>Mini Case Competition</strong>.
              </p>
              <div className="flex justify-center py-1">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#ba883a]" aria-label="Sedang masuk" />
                ) : hasGoogleClientId ? (
                  <GoogleLogin
                    onSuccess={(res) => handleGoogleSuccess(res.credential)}
                    onError={() => setErrorMessage('Gagal terhubung ke layanan Google Sign-In.')}
                    shape="pill"
                    size="large"
                    text="continue_with"
                  />
                ) : (
                  <p className="text-[11px] text-[#7a5530] italic text-center py-2">
                    Konfigurasi Google Client ID belum tersedia pada lingkungan ini.
                  </p>
                )}
              </div>
            </div>

            <div className="text-center pt-3 border-t border-[#ebdcc8]">
              <p className="text-[11px] text-[#7a5530] leading-relaxed">
                Akun peserta otomatis dibuat saat pertama kali masuk. Dengan melanjutkan, Anda menyetujui{' '}
                <Link to="/kebijakan-privasi" className="text-[#8a5e38] font-semibold underline">
                  Kebijakan Privasi
                </Link>{' '}
                dan{' '}
                <Link to="/syarat-ketentuan" className="text-[#8a5e38] font-semibold underline">
                  Syarat &amp; Ketentuan
                </Link>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
