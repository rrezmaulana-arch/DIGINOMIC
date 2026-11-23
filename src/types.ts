export interface Competition {
  id: string;
  slug: string;
  title: string;
  category: string;
  fee: number;
  feeFormatted: string;
  isTeam: boolean;
  maxTeamSize: number;
  description: string;
  briefRules: string[];
  prizes: string;
  deadline: string;
  iconName: string;
}

export type RegistrationStatus =
  | 'MENUNGGU_VERIFIKASI'
  | 'TERVERIFIKASI'
  | 'DITOLAK'
  | 'LOLOS_TAHAP_1'
  | 'FINALIS'
  | 'JUARA'
  | 'DIBATALKAN';

export interface TeamMember {
  fullName: string;
  institution: string;
  phoneWa: string;
}

export interface SubmissionData {
  title: string;
  driveLink: string;
  description?: string;
  submittedAt: string;
  score?: number;
  juryFeedback?: string;
  round?: 'TAHAP_1' | 'FINAL';
}

export interface Registration {
  id: string;
  registrationCode: string;
  userId: string;
  competitionId: string;
  competitionTitle: string;
  participantName: string;
  institution: string;
  phoneWa: string;
  email: string;
  isTeam: boolean;
  teamName?: string;
  teamMembers?: TeamMember[];
  studentCardName?: string;
  fee: number;
  status: RegistrationStatus;
  paymentProofUrl?: string;
  rejectReason?: string;
  submission?: SubmissionData;
  registeredAt: string;
  verifiedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'PESERTA' | 'ADMIN' | 'SUPERADMIN';
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface SystemSettings {
  isRegistrationOpen: boolean;
  registrationDeadline: string;
  submissionDeadline: string;
  maxQuotaEsai: number;
  maxQuotaCase: number;
  whatsappGroupEsai: string;
  whatsappGroupCase: string;
  guidebookUrl: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERADMIN';
  division: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastActive: string;
}
