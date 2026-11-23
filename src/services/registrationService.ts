import {
  Registration,
  RegistrationStatus,
  SubmissionData,
  SystemSettings,
  AdminAccount,
  UserProfile,
  ActivityLog,
} from '../types';

export const STORAGE_KEYS = {
  REGISTRATIONS: 'digi_regs_v2',
  SETTINGS: 'digi_settings_v2',
  LOGS: 'digi_logs_v2',
  ADMINS: 'digi_admins_v2',
  CURRENT_USER: 'digi_current_user_v2',
};

// Initial mock data if storage is empty
const INITIAL_SETTINGS: SystemSettings = {
  isRegistrationOpen: true,
  registrationDeadline: '30 Januari 2027, 23:59 WIB',
  submissionDeadline: '15 Februari 2027, 23:59 WIB',
  maxQuotaEsai: 100,
  maxQuotaCase: 50,
  whatsappGroupEsai: 'https://chat.whatsapp.com/demo-esai-digiconomic2027',
  whatsappGroupCase: 'https://chat.whatsapp.com/demo-case-digiconomic2027',
  guidebookUrl: 'https://drive.google.com/file/d/demo-guidebook-digiconomic2027/view',
};

const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'adm-1',
    name: 'Andi Pratama',
    email: 'admin.lomba@diginomic.id',
    role: 'ADMIN',
    division: 'Divisi Acara & Verifikasi',
    status: 'ACTIVE',
    lastActive: '10 menit yang lalu',
  },
  {
    id: 'adm-super',
    name: 'Ketua Steering Committee',
    email: 'superadmin@diginomic.id',
    role: 'SUPERADMIN',
    division: 'Pengarah & SC',
    status: 'ACTIVE',
    lastActive: 'Sedang aktif',
  },
];

const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-demo-1',
    registrationCode: 'DIGI-2027-8821',
    userId: 'usr-demo-peserta',
    competitionId: 'comp-1',
    competitionTitle: 'Esai Nasional',
    participantName: 'Budi Santoso',
    institution: 'Universitas Indonesia',
    phoneWa: '081234567890',
    email: 'demo.peserta@diginomic.id',
    isTeam: false,
    studentCardName: 'KTM_BudiSantoso_UI.pdf',
    fee: 35000,
    status: 'TERVERIFIKASI',
    registeredAt: '15 Des 2026',
    verifiedAt: '16 Des 2026',
    submission: {
      title: 'Strategi Akselerasi Inklusi Keuangan UMKM via QRIS',
      driveLink: 'https://drive.google.com/file/d/demo-naskah-budi/view',
      description: 'Naskah esai analisis dampak QRIS Cross-Border pada UMKM pesisir.',
      submittedAt: '20 Des 2026',
      score: 88,
      juryFeedback: 'Analisis tajam, rekomendasi kebijakan sangat aplikatif.',
      round: 'TAHAP_1',
    },
  },
  {
    id: 'reg-demo-2',
    registrationCode: 'DIGI-2027-4102',
    userId: 'usr-demo-2',
    competitionId: 'comp-2',
    competitionTitle: 'Mini Case Competition',
    participantName: 'Siti Rahma',
    institution: 'Institut Teknologi Bandung',
    phoneWa: '085711223344',
    email: 'siti.rahma@itb.ac.id',
    isTeam: true,
    teamName: 'Ganesha Innovators',
    teamMembers: [
      { fullName: 'Ahmad Fauzi', institution: 'ITB', phoneWa: '085711223345' },
      { fullName: 'Dewi Lestari', institution: 'ITB', phoneWa: '085711223346' },
    ],
    studentCardName: 'KTM_Tim_Ganesha.pdf',
    fee: 50000,
    status: 'MENUNGGU_VERIFIKASI',
    registeredAt: '18 Des 2026',
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    actor: 'Andi Pratama',
    action: 'Verifikasi Berkas',
    detail: 'Menyetujui pendaftaran #DIGI-2027-8821 (Budi Santoso)',
    timestamp: '16 Des 2026, 14:20 WIB',
  },
  {
    id: 'log-2',
    actor: 'System',
    action: 'Registrasi Baru',
    detail: 'Pendaftaran baru #DIGI-2027-4102 (Siti Rahma - ITB)',
    timestamp: '18 Des 2026, 09:15 WIB',
  },
];

// Helper functions for reading/writing storage
const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

export const writeStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
};

export type StorageChangeCallback = (data: any) => void;

export const subscribeToStorageChanges = (callback: StorageChangeCallback): (() => void) => {
  const handler = (event: StorageEvent) => {
    if (event.key) {
      callback(event);
    }
  };
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('storage', handler);
  };
};

export const formatIndonesianPhone = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    return '+' + digits;
  }
  if (digits.startsWith('0')) {
    return '+62' + digits.slice(1);
  }
  return '+62' + digits;
};

// Core service implementation
export const RegistrationService = {
  getAll: (): Registration[] => {
    return readStorage<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
  },

  getSettings: (): SystemSettings => {
    return readStorage<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  getAdmins: (): AdminAccount[] => {
    return readStorage<AdminAccount[]>(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
  },

  getLogs: (): ActivityLog[] => {
    return readStorage<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  },

  getCurrentUser: (): UserProfile | null => {
    return readStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user: UserProfile | null): void => {
    if (user) {
      writeStorage(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  create: (reg: Registration): Registration[] => {
    const current = RegistrationService.getAll();
    const updated = [reg, ...current];
    writeStorage(STORAGE_KEYS.REGISTRATIONS, updated);

    // Log action
    const currentLogs = RegistrationService.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      actor: reg.participantName,
      action: 'Registrasi Baru',
      detail: `Pendaftaran baru #${reg.registrationCode} untuk cabang ${reg.competitionTitle}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    };
    writeStorage(STORAGE_KEYS.LOGS, [newLog, ...currentLogs]);

    return updated;
  },

  updateStatus: (
    id: string,
    status: RegistrationStatus,
    rejectReason?: string,
    actorName: string = 'Panitia'
  ): Registration[] => {
    const current = RegistrationService.getAll();
    let targetReg: Registration | null = null;

    const updated = current.map((r) => {
      if (r.id === id) {
        targetReg = {
          ...r,
          status,
          rejectReason: rejectReason || r.rejectReason,
          verifiedAt: status === 'TERVERIFIKASI' ? new Date().toLocaleDateString('id-ID') : r.verifiedAt,
        };
        return targetReg;
      }
      return r;
    });

    writeStorage(STORAGE_KEYS.REGISTRATIONS, updated);

    if (targetReg) {
      const currentLogs = RegistrationService.getLogs();
      const newLog: ActivityLog = {
        id: 'log-' + Date.now(),
        actor: actorName,
        action: 'Update Status',
        detail: `Status #${(targetReg as Registration).registrationCode} diubah menjadi ${status}${rejectReason ? `: "${rejectReason}"` : ''}`,
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      };
      writeStorage(STORAGE_KEYS.LOGS, [newLog, ...currentLogs]);
    }

    return updated;
  },

  scoreSubmission: (
    id: string,
    score: number,
    round: 'TAHAP_1' | 'FINAL',
    juryFeedback?: string,
    actorName: string = 'Dewan Juri'
  ): Registration[] => {
    const current = RegistrationService.getAll();
    let targetReg: Registration | null = null;

    const updated = current.map((r) => {
      if (r.id === id && r.submission) {
        targetReg = {
          ...r,
          status: round === 'FINAL' ? 'FINALIS' : 'LOLOS_TAHAP_1',
          submission: {
            ...r.submission,
            score,
            round,
            juryFeedback,
          },
        };
        return targetReg;
      }
      return r;
    });

    writeStorage(STORAGE_KEYS.REGISTRATIONS, updated);

    if (targetReg) {
      const currentLogs = RegistrationService.getLogs();
      const newLog: ActivityLog = {
        id: 'log-' + Date.now(),
        actor: actorName,
        action: 'Penilaian Juri',
        detail: `Memberikan skor ${score} pada karya #${(targetReg as Registration).registrationCode}`,
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      };
      writeStorage(STORAGE_KEYS.LOGS, [newLog, ...currentLogs]);
    }

    return updated;
  },

  batchApprove: (actorName: string = 'Superadmin'): { count: number; data: Registration[] } => {
    const current = RegistrationService.getAll();
    let count = 0;

    const updated = current.map((r) => {
      if (r.status === 'MENUNGGU_VERIFIKASI') {
        count++;
        return {
          ...r,
          status: 'TERVERIFIKASI' as RegistrationStatus,
          verifiedAt: new Date().toLocaleDateString('id-ID'),
        };
      }
      return r;
    });

    writeStorage(STORAGE_KEYS.REGISTRATIONS, updated);

    if (count > 0) {
      const currentLogs = RegistrationService.getLogs();
      const newLog: ActivityLog = {
        id: 'log-' + Date.now(),
        actor: actorName,
        action: 'Verifikasi Massal',
        detail: `Menyetujui ${count} berkas pendaftaran sekaligus`,
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      };
      writeStorage(STORAGE_KEYS.LOGS, [newLog, ...currentLogs]);
    }

    return { count, data: updated };
  },

  submitWork: (id: string, submission: SubmissionData): Registration[] => {
    const current = RegistrationService.getAll();
    const updated = current.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          submission,
        };
      }
      return r;
    });

    writeStorage(STORAGE_KEYS.REGISTRATIONS, updated);
    return updated;
  },

  saveSettings: (newSettings: SystemSettings, actorName: string = 'Superadmin'): SystemSettings => {
    writeStorage(STORAGE_KEYS.SETTINGS, newSettings);

    const currentLogs = RegistrationService.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      actor: actorName,
      action: 'Update Pengaturan',
      detail: 'Memperbarui konfigurasi sistem & kuota perlombaan',
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    };
    writeStorage(STORAGE_KEYS.LOGS, [newLog, ...currentLogs]);

    return newSettings;
  },

  toggleAdminStatus: (id: string, actorName: string = 'Superadmin'): AdminAccount[] => {
    const current = RegistrationService.getAdmins();
    const updated = current.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: (a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') as 'ACTIVE' | 'SUSPENDED',
        };
      }
      return a;
    });

    writeStorage(STORAGE_KEYS.ADMINS, updated);
    return updated;
  },

  addAdmin: (newAdmin: AdminAccount, actorName: string = 'Superadmin'): AdminAccount[] => {
    const current = RegistrationService.getAdmins();
    const updated = [newAdmin, ...current];
    writeStorage(STORAGE_KEYS.ADMINS, updated);

    const currentLogs = RegistrationService.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      actor: actorName,
      action: 'Tambah Panitia',
      detail: `Menambahkan akun panitia baru: ${newAdmin.name} (${newAdmin.role})`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    };
    writeStorage(STORAGE_KEYS.LOGS, [newLog, ...currentLogs]);

    return updated;
  },

  authenticate: (
    email: string,
    pass: string
  ): { success: boolean; user?: UserProfile; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Demo Accounts first
    if (cleanEmail === 'demo.peserta@diginomic.id') {
      return {
        success: true,
        user: {
          id: 'usr-demo-peserta',
          name: 'Budi Santoso (Demo Peserta)',
          email: cleanEmail,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
          role: 'PESERTA',
        },
      };
    }

    if (cleanEmail === 'admin.lomba@diginomic.id') {
      return {
        success: true,
        user: {
          id: 'adm-1',
          name: 'Andi Pratama (Demo Admin)',
          email: cleanEmail,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
          role: 'ADMIN',
        },
      };
    }

    if (cleanEmail === 'superadmin@diginomic.id') {
      return {
        success: true,
        user: {
          id: 'adm-super',
          name: 'Ketua Steering Committee (Demo Superadmin)',
          email: cleanEmail,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
          role: 'SUPERADMIN',
        },
      };
    }

    // 2. Check registered participant accounts in registrations list
    const regs = RegistrationService.getAll();
    const foundReg = regs.find((r) => r.email.toLowerCase() === cleanEmail);
    if (foundReg) {
      return {
        success: true,
        user: {
          id: foundReg.userId,
          name: foundReg.participantName,
          email: foundReg.email,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
          role: 'PESERTA',
        },
      };
    }

    // 3. Check registered admin accounts
    const adminsList = RegistrationService.getAdmins();
    const foundAdmin = adminsList.find((a) => a.email.toLowerCase() === cleanEmail);
    if (foundAdmin) {
      if (foundAdmin.status === 'SUSPENDED') {
        return { success: false, error: 'Akun Anda sedang ditangguhkan oleh Superadmin.' };
      }
      return {
        success: true,
        user: {
          id: foundAdmin.id,
          name: foundAdmin.name,
          email: foundAdmin.email,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
          role: foundAdmin.role,
        },
      };
    }

    return {
      success: false,
      error: 'Email tidak terdaftar di portal. Silakan daftar kompetisi terlebih dahulu.',
    };
  },

  exportToCSV: (data: Registration[]): void => {
    const headers = [
      'ID Registrasi',
      'Tanggal Daftar',
      'Nama Peserta',
      'Institusi',
      'Nomor WhatsApp',
      'Email',
      'Cabang Lomba',
      'Tipe',
      'Nama Tim',
      'Biaya',
      'Status Verifikasi',
      'Judul Karya',
      'Link Drive Karya',
      'Skor Juri',
    ];

    const rows = data.map((r) => [
      r.registrationCode,
      r.registeredAt,
      `"${r.participantName.replace(/"/g, '""')}"`,
      `"${r.institution.replace(/"/g, '""')}"`,
      `'${r.phoneWa}`,
      r.email,
      `"${r.competitionTitle}"`,
      r.isTeam ? 'Tim' : 'Individu',
      `"${(r.teamName || '-').replace(/"/g, '""')}"`,
      r.fee,
      r.status,
      `"${(r.submission?.title || '-').replace(/"/g, '""')}"`,
      `"${r.submission?.driveLink || '-'}"`,
      r.submission?.score || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_DigiconomicFest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  buildWhatsAppChatUrl: (phoneWa: string, customMsg?: string): string => {
    const formatted = formatIndonesianPhone(phoneWa).replace(/\D/g, '');
    const text = customMsg ? encodeURIComponent(customMsg) : '';
    return `https://wa.me/${formatted}?text=${text}`;
  },

  buildWhatsAppPaymentUrl: (reg: Registration, feeFormatted: string): string => {
    const msg = `Halo Panitia Digiconomic Fest 2027, saya ingin mengonfirmasi pembayaran untuk:\n- Kode Registrasi: #${reg.registrationCode}\n- Nama: ${reg.participantName}\n- Cabang: ${reg.competitionTitle}\n- Nominal: ${feeFormatted}\n\nTerlampir bukti transfer QRIS saya.`;
    return `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
  },

  buildWhatsAppHelpdeskUrl: (): string => {
    const msg = 'Halo Panitia Digiconomic Fest 2027, saya butuh bantuan mengenai pendaftaran lomba.';
    return `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
  },
};