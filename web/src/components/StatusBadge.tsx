import React from 'react';
import { CheckCircle2, Clock, Award, Trophy, XCircle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const pad = size === 'md' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]';

  switch (status) {
    case 'TERVERIFIKASI':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-semibold border bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.18)] ${pad}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Terverifikasi</span>
        </span>
      );
    case 'MENUNGGU_VERIFIKASI':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-semibold border bg-amber-50 text-amber-800 border-amber-300 ${pad}`}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Menunggu Verifikasi</span>
        </span>
      );
    case 'LOLOS_TAHAP_1':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-semibold border bg-sky-50 text-sky-800 border-sky-300 ${pad}`}>
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Lolos Tahap 1</span>
        </span>
      );
    case 'FINALIS':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-semibold border bg-purple-50 text-purple-800 border-purple-300 ${pad}`}>
          <Award className="w-3.5 h-3.5 text-purple-600" />
          <span>Finalis</span>
        </span>
      );
    case 'JUARA':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-bold border bg-gradient-to-r from-[#f9e5b4] to-[#eed082] text-[#2f1e10] border-[#caa152] shadow-xs ${pad}`}>
          <Trophy className="w-3.5 h-3.5 text-[#8c5a18]" />
          <span>Juara</span>
        </span>
      );
    case 'DITOLAK':
    case 'GUGUR':
    case 'DIBATALKAN':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-semibold border bg-rose-50 text-rose-800 border-rose-300 ${pad}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>{status.replace(/_/g, ' ')}</span>
        </span>
      );
  }
};
