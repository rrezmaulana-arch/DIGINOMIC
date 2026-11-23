import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config/env.mjs';
import { createRepository } from './repositories/index.mjs';
import { createApp } from './app.mjs';
import { seedDatabase } from '../db/seed.mjs';
import { processEmailOutbox, cleanupExpiredSessions, runFileRetentionJob } from './jobs/workers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrationsIfPostgres(repo) {
  if (repo.type !== 'postgres') return;
  const sqlPath = path.resolve(__dirname, '../db/migrations/001_init.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  await repo.pool.query(sql);
  console.log('[DB] Migrasi 001_init.sql berhasil diterapkan.');
}

async function main() {
  const config = loadConfig();
  const repo = await createRepository(config);
  await runMigrationsIfPostgres(repo);
  await seedDatabase(repo);

  const { server } = createApp({ repo, config });
  // Proteksi anti-Slowloris & optimasi keep-alive di belakang Nginx
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  server.requestTimeout = 30_000;

  // Background worker setiap 30 detik (email outbox) & tiap jam (session + file retention)
  const emailInterval = setInterval(() => {
    processEmailOutbox(repo, async (job) => {
      // Integrasi penyedia email transaksional (Resend/Brevo/SMTP) dipasang di sini
      if (config.nodeEnv !== 'test') {
        console.log(`[MAILER] Mengirim template=${job.template} ke=${job.to_email}`);
      }
    }).catch((e) => console.error('[MAILER ERROR]', e.message));
  }, 30_000);

  const cleanupInterval = setInterval(() => {
    cleanupExpiredSessions(repo).catch(() => {});
    runFileRetentionJob(config).catch(() => {});
  }, 60 * 60 * 1000);

  server.listen(config.port, () => {
    console.log(`[API] Digiconomic Fest 2027 API berjalan di port ${config.port} (storage=${repo.type})`);
  });

  const shutdown = async () => {
    clearInterval(emailInterval);
    clearInterval(cleanupInterval);
    server.close(async () => {
      await repo.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
