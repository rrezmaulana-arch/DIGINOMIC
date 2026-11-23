import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Worker antrean email transaksional (PRD Bagian 9.11):
 * Mengirim email berstatus PENDING, retry hingga 3x lalu tandai FAILED.
 */
export async function processEmailOutbox(repo, sendFn) {
  const pending = await repo.listPendingEmails(20);
  let sent = 0;
  let failed = 0;

  for (const job of pending) {
    try {
      await sendFn(job);
      await repo.updateEmailOutbox(job.id, {
        status: 'SENT',
        attempts: job.attempts + 1,
        sent_at: new Date().toISOString(),
      });
      sent += 1;
    } catch {
      const nextAttempts = job.attempts + 1;
      const isFinalFail = nextAttempts >= 3;
      await repo.updateEmailOutbox(job.id, {
        status: isFinalFail ? 'FAILED' : 'PENDING',
        attempts: nextAttempts,
        send_after: new Date(Date.now() + nextAttempts * 60_000).toISOString(),
      });
      if (isFinalFail) failed += 1;
    }
  }
  return { processed: pending.length, sent, failed };
}

/**
 * Pembersih sesi kedaluwarsa.
 */
export async function cleanupExpiredSessions(repo) {
  return repo.deleteExpiredSessions();
}

/**
 * Penghapusan berkas pribadi (KTM & bukti bayar) 90 hari setelah acara berakhir (BR-14).
 */
export async function runFileRetentionJob(config, nowDate = new Date()) {
  const endMs = new Date(config.eventEndDate).getTime();
  const retentionMs = config.fileRetentionDays * 24 * 60 * 60 * 1000;
  if (nowDate.getTime() < endMs + retentionMs) {
    return { deletedFiles: 0, skipped: true };
  }

  let deletedFiles = 0;
  for (const sub of ['student-cards', 'payment-proofs']) {
    const dir = path.resolve(config.uploadDir, sub);
    try {
      const files = await fs.readdir(dir);
      for (const f of files) {
        await fs.unlink(path.join(dir, f));
        deletedFiles += 1;
      }
    } catch {
      // Folder belum ada -> abaikan
    }
  }
  return { deletedFiles, skipped: false };
}
