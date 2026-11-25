export const REGISTRATION_STATUSES = [
  'MENUNGGU_VERIFIKASI',
  'DITOLAK',
  'TERVERIFIKASI',
  'LOLOS_TAHAP_1',
  'FINALIS',
  'JUARA',
  'GUGUR',
  'DIBATALKAN',
];

// Status yang berhak mendapatkan link grup peserta (BR-03)
export const GROUP_LINK_ELIGIBLE_STATUSES = new Set([
  'TERVERIFIKASI',
  'LOLOS_TAHAP_1',
  'FINALIS',
  'JUARA',
]);

// Matriks perpindahan status sesuai PRD Bagian 8.2
const ALLOWED_TRANSITIONS = {
  MENUNGGU_VERIFIKASI: {
    TERVERIFIKASI: ['ADMIN', 'SUPERADMIN'],
    DITOLAK: ['ADMIN', 'SUPERADMIN'],
    DIBATALKAN: ['PESERTA'],
  },
  DITOLAK: {
    MENUNGGU_VERIFIKASI: ['PESERTA'],
    DIBATALKAN: ['PESERTA'],
  },
  TERVERIFIKASI: {
    LOLOS_TAHAP_1: ['ADMIN', 'SUPERADMIN'],
    FINALIS: ['ADMIN', 'SUPERADMIN'],
    GUGUR: ['ADMIN', 'SUPERADMIN'],
  },
  LOLOS_TAHAP_1: {
    FINALIS: ['ADMIN', 'SUPERADMIN'],
    GUGUR: ['ADMIN', 'SUPERADMIN'],
  },
  FINALIS: {
    JUARA: ['ADMIN', 'SUPERADMIN'],
    GUGUR: ['ADMIN', 'SUPERADMIN'],
  },
  JUARA: {},
  GUGUR: {},
  DIBATALKAN: {},
};

export function canTransitionStatus(fromStatus, toStatus, actorRole) {
  const allowedTargets = ALLOWED_TRANSITIONS[fromStatus];
  if (!allowedTargets) return false;
  const roles = allowedTargets[toStatus];
  if (!roles) return false;
  return roles.includes(actorRole);
}

export function isGroupLinkEligible(status) {
  return GROUP_LINK_ELIGIBLE_STATUSES.has(status);
}
