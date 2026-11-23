import { loadConfig } from '../src/config/env.mjs';
import { createRepository } from '../src/repositories/index.mjs';
import { hashPassword } from '../src/utils/crypto.mjs';

export async function seedDatabase(repo, options = {}) {
  const superEmail = (options.superAdminEmail || process.env.SUPERADMIN_EMAIL || 'superadmin@diginomic.id').toLowerCase();
  const superPass = options.superAdminPassword || process.env.SUPERADMIN_PASSWORD || 'SuperAdmin2027!';

  let superAdmin = await repo.findUserByEmail(superEmail);
  if (!superAdmin) {
    superAdmin = await repo.createUser({
      email: superEmail,
      password_hash: hashPassword(superPass),
      name: 'Ketua Steering Committee',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      division: 'Steering Committee',
      privacy_accepted_at: new Date().toISOString(),
    });
  }

  const existingComps = await repo.listCompetitions({ includeInactive: true });
  const hasEsai = existingComps.some((c) => c.slug === 'esai-nasional');
  const hasCase = existingComps.some((c) => c.slug === 'mini-case-competition');

  const now = Date.now();
  const defaultOpen = options.regOpenAt || new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const defaultClose = options.regCloseAt || '2027-01-30T16:59:59.000Z';
  const defaultSubDeadline = options.submissionDeadline || '2027-02-15T16:59:59.000Z';

  if (!hasEsai) {
    await repo.createCompetition({
      slug: 'esai-nasional',
      name: 'Esai Nasional',
      fee: 35000,
      is_team: false,
      max_team_size: 1,
      max_quota: 100,
      reg_open_at: defaultOpen,
      reg_close_at: defaultClose,
      submission_deadline: defaultSubDeadline,
      group_url: 'https://chat.whatsapp.com/digiconomic2027-esai',
      guidebook_url: 'https://drive.google.com/file/d/digiconomic2027-guidebook/view',
      is_active: true,
    });
  }

  if (!hasCase) {
    await repo.createCompetition({
      slug: 'mini-case-competition',
      name: 'Mini Case Competition',
      fee: 50000,
      is_team: true,
      max_team_size: 3,
      max_quota: 50,
      reg_open_at: defaultOpen,
      reg_close_at: defaultClose,
      submission_deadline: defaultSubDeadline,
      group_url: 'https://chat.whatsapp.com/digiconomic2027-case',
      guidebook_url: 'https://drive.google.com/file/d/digiconomic2027-guidebook/view',
      is_active: true,
    });
  }

  return { superAdmin, competitions: await repo.listCompetitions({ includeInactive: true }) };
}

// Jalankan langsung bila dipanggil via CLI: node db/seed.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const repo = await createRepository(config);
  const res = await seedDatabase(repo);
  console.log(`Seed selesai. SuperAdmin: ${res.superAdmin.email}, Lomba: ${res.competitions.length}`);
  await repo.close();
}
