import { apiRequest, API_BASE_URL } from './apiClient';
import type {
  AnnouncementItem,
  DemographicsData,
  LeaderboardEntry,
  NewsArticle,
  RegistrationStatus,
  UserProfile,
} from '../types';

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: 'PESERTA' | 'ADMIN' | 'JURI' | 'SUPERADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  division?: string | null;
  assigned_competition_id?: string | null;
  nim?: string | null;
  avatar_url?: string | null;
}

export function mapBackendUser(u: BackendUser): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0F2A44&color=C8A24B`,
    role: u.role,
    assignedCompetitionId: u.assigned_competition_id || null,
    nim: u.nim || null,
  };
}

export const AuthApi = {
  async me() {
    return apiRequest<{ user: BackendUser | null; profile_complete?: boolean }>('/api/auth/me');
  },
  async login(email: string, password: string) {
    return apiRequest<{ user: BackendUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async loginGoogle(credential: string) {
    return apiRequest<{ user: BackendUser; is_new_user?: boolean; profile_complete?: boolean }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },
  async logout() {
    return apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  },
};

export interface TimelineStageRecord {
  id: string;
  stage_key: string;
  sort_order: number;
  date_label: string;
  short_date: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  is_visible: boolean;
  visible_from: string | null;
  is_extended: boolean;
}

export const PublicApi = {
  async getCompetitions() {
    return apiRequest<{ competitions: any[] }>('/api/competitions');
  },
  async getTimeline() {
    return apiRequest<{
      stages: TimelineStageRecord[];
      server_time: string;
      extended_active: boolean;
      extended_end_at: string | null;
    }>('/api/timeline');
  },
  async getNews(homeOnly = false) {
    const qs = homeOnly ? '?home=true' : '';
    return apiRequest<{ articles: NewsArticle[] }>(`/api/news${qs}`);
  },
  async getNewsBySlug(slug: string) {
    return apiRequest<{ article: NewsArticle }>(`/api/news/${encodeURIComponent(slug)}`);
  },
};

export const ParticipantApi = {
  async getProfile() {
    return apiRequest<{ profile: { full_name: string; institution: string; phone_wa: string; nim?: string | null; has_student_card: boolean } | null }>('/api/profile');
  },
  async updateProfile(payload: { full_name: string; institution: string; phone_wa: string; nim?: string }) {
    return apiRequest<{ profile: any }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async uploadStudentCard(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return apiRequest<{ ok: boolean }>('/api/profile/student-card', { method: 'POST', body: fd });
  },
  async getMyRegistration() {
    return apiRequest<{ registration: any | null }>('/api/registrations/me');
  },
  async createRegistration(payload: { competition_slug: string; team_name?: string; team_members?: Array<{ full_name: string; institution: string; phone_wa: string; nim?: string }> }) {
    return apiRequest<{ registration: any }>('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async reviseRegistration(payload: { team_name?: string; team_members?: any[] }) {
    return apiRequest<{ registration: any }>('/api/registrations/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async cancelRegistration() {
    return apiRequest<{ ok: boolean; status: string }>('/api/registrations/me', {
      method: 'DELETE',
    });
  },
  async uploadPaymentProof(file: File, senderName?: string, paymentDate?: string) {
    const fd = new FormData();
    fd.append('file', file);
    if (senderName) fd.append('sender_name', senderName);
    if (paymentDate) fd.append('payment_date', paymentDate);
    return apiRequest<{ ok: boolean }>('/api/registrations/me/payment-proof', { method: 'POST', body: fd });
  },
  async uploadSubmissionFile(file: File, title: string, description?: string) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    if (description) fd.append('description', description);
    return apiRequest<{ submission: any }>('/api/registrations/me/submissions', { method: 'POST', body: fd });
  },
  async submitSubmissionLink(payload: { title: string; link_url: string; description?: string }) {
    return apiRequest<{ submission: any }>('/api/registrations/me/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async finalizeSubmission(submissionId: string) {
    return apiRequest<{ submission: any }>(`/api/registrations/me/submissions/${submissionId}/finalize`, {
      method: 'POST',
    });
  },
  async getAnnouncements() {
    return apiRequest<{ announcements: AnnouncementItem[] }>('/api/announcements');
  },
};

export const AdminApi = {
  getRegFileUrl(regId: string, kind: 'student-card' | 'payment-proof') {
    return `${API_BASE_URL}/api/admin/registrations/${regId}/files/${kind}`;
  },
  getSubmissionFileUrl(subId: string) {
    return `${API_BASE_URL}/api/admin/submissions/${subId}/file`;
  },
  getExportCsvUrl(competitionId?: string) {
    const qs = competitionId ? `?competition=${encodeURIComponent(competitionId)}` : '';
    return `${API_BASE_URL}/api/admin/export${qs}`;
  },
  async getSummary() {
    return apiRequest<{ total: number; by_status: Record<string, number>; by_competition: Record<string, number> }>('/api/admin/summary');
  },
  async listRegistrations(params: { competition?: string; status?: string; q?: string; page?: number; page_size?: number } = {}) {
    const sp = new URLSearchParams();
    if (params.competition) sp.set('competition', params.competition);
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page) sp.set('page', String(params.page));
    if (params.page_size) sp.set('page_size', String(params.page_size));
    return apiRequest<{ items: any[]; total: number }>(`/api/admin/registrations?${sp.toString()}`);
  },
  async updateRegistrationStatus(regId: string, status: RegistrationStatus, reason?: string) {
    return apiRequest<{ registration: any }>(`/api/admin/registrations/${regId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },
  async listSubmissions(competitionId?: string) {
    const qs = competitionId ? `?competition=${encodeURIComponent(competitionId)}` : '';
    return apiRequest<{ submissions: any[] }>(`/api/admin/submissions${qs}`);
  },
  async getLeaderboard(competitionId?: string, round: 'TAHAP_1' | 'FINAL' = 'TAHAP_1') {
    const sp = new URLSearchParams({ round });
    if (competitionId) sp.set('competition', competitionId);
    return apiRequest<{ leaderboard: LeaderboardEntry[] }>(`/api/admin/leaderboard?${sp.toString()}`);
  },
  async submitScore(payload: {
    submission_id: string;
    round: 'TAHAP_1' | 'FINAL';
    score_orisinalitas: number;
    score_analisis: number;
    score_inovasi: number;
    score_sistematika: number;
    feedback?: string;
  }) {
    return apiRequest<{ score: any }>('/api/admin/scores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async getSubmissionScores(subId: string) {
    return apiRequest<{ scores: any[] }>(`/api/admin/submissions/${subId}/scores`);
  },
  async listAnnouncements() {
    return apiRequest<{ announcements: AnnouncementItem[] }>('/api/admin/announcements');
  },
  async createAnnouncement(payload: { competition_id: string | null; title: string; body: string; is_pinned?: boolean }) {
    return apiRequest<{ announcement: AnnouncementItem }>('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async deleteAnnouncement(id: string) {
    return apiRequest<{ ok: boolean }>(`/api/admin/announcements/${id}`, { method: 'DELETE' });
  },
  async listCompetitions() {
    return apiRequest<{ competitions: any[] }>('/api/admin/competitions');
  },
  async updateCompetition(id: string, patch: any) {
    return apiRequest<{ competition: any }>(`/api/admin/competitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  },
};

export const SuperAdminApi = {
  async getDemographics() {
    return apiRequest<DemographicsData>('/api/superadmin/demographics');
  },
  async listUsers(role?: string, q?: string) {
    const sp = new URLSearchParams();
    if (role) sp.set('role', role);
    if (q) sp.set('q', q);
    return apiRequest<{ users: BackendUser[] }>(`/api/superadmin/users?${sp.toString()}`);
  },
  async listAdmins() {
    return apiRequest<{ admins: BackendUser[] }>('/api/superadmin/admins');
  },
  async createStaff(payload: { email: string; name: string; role: 'ADMIN' | 'JURI' | 'SUPERADMIN'; division: string; assigned_competition_id?: string | null; password: string }) {
    return apiRequest<{ admin: BackendUser }>('/api/superadmin/admins', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async toggleStaffStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    return apiRequest<{ admin: BackendUser }>(`/api/superadmin/admins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  async resetStaffPassword(id: string, newPassword: string) {
    return apiRequest<{ ok: boolean }>(`/api/superadmin/admins/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ new_password: newPassword }),
    });
  },
  async removeStaff(id: string) {
    return apiRequest<{ ok: boolean }>(`/api/superadmin/admins/${id}`, { method: 'DELETE' });
  },
  async cancelParticipant(regId: string, reason: string) {
    return apiRequest<{ registration: any }>(`/api/superadmin/registrations/${regId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  async listNews() {
    return apiRequest<{ articles: NewsArticle[] }>('/api/superadmin/news');
  },
  async createNews(payload: Partial<NewsArticle>) {
    return apiRequest<{ article: NewsArticle }>('/api/superadmin/news', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateNews(id: string, patch: Partial<NewsArticle>) {
    return apiRequest<{ article: NewsArticle }>(`/api/superadmin/news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
  async deleteNews(id: string) {
    return apiRequest<{ ok: boolean }>(`/api/superadmin/news/${id}`, { method: 'DELETE' });
  },
  async listTimeline() {
    return apiRequest<{ stages: TimelineStageRecord[]; server_time: string }>('/api/superadmin/timeline');
  },
  async createTimelineStage(payload: Partial<TimelineStageRecord>) {
    return apiRequest<{ stage: TimelineStageRecord }>('/api/superadmin/timeline', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateTimelineStage(id: string, patch: Partial<TimelineStageRecord>) {
    return apiRequest<{ stage: TimelineStageRecord }>(`/api/superadmin/timeline/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
  async deleteTimelineStage(id: string) {
    return apiRequest<{ ok: boolean }>(`/api/superadmin/timeline/${id}`, { method: 'DELETE' });
  },
  async getAuditLogs(limit = 100) {
    return apiRequest<{ audit_logs: any[] }>(`/api/superadmin/audit-logs?limit=${limit}`);
  },
};
