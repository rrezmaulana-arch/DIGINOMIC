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
  studentCardName?: string;
  fullName: string;
  institution: string;
  phoneWa: string;
  nim?: string;
}

export interface SubmissionData {
  id?: string;
  title: string;
  driveLink?: string;
  linkUrl?: string;
  hasFile?: boolean;
  isFinal?: boolean;
  finalizedAt?: string;
  version?: number;
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
  role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN';
  assignedCompetitionId?: string | null;
  nim?: string | null;
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
  role: 'ADMIN' | 'JURI' | 'SUPERADMIN';
  division: string;
  assigned_competition_id?: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  lastActive: string;
}

export interface AnnouncementItem {
  id: string;
  competition_id: string | null;
  title: string;
  body: string;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: 'Pengumuman' | 'Kompetisi' | 'Technical Meeting' | 'UMKM & Edukasi';
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  show_on_home: boolean;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  author_name?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  submission_id: string;
  submission_title: string | null;
  version: number;
  is_final: boolean;
  drive_file_id: string | null;
  link_url: string | null;
  submitted_at: string;
  registration_id: string;
  registration_code: string;
  team_name: string | null;
  registration_status: RegistrationStatus;
  leader_name: string;
  institution: string | null;
  competition_id: string;
  competition_name: string;
  competition_slug: string;
  jury_count: number;
  avg_score: string | number | null;
  avg_orisinalitas: string | number | null;
  avg_analisis: string | number | null;
  avg_inovasi: string | number | null;
  avg_sistematika: string | number | null;
}

export interface DemographicsData {
  by_institution: { institution: string; total: number }[];
  by_competition: { id: string; slug: string; name: string; max_quota: number; registered: number; verified: number }[];
  users_by_role: { role: string; total: number }[];
}
