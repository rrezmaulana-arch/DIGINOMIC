import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { DEFAULT_TIMELINE_STAGES } from '../src/data/defaultTimeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL tidak ditemukan di environment atau server/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '003_timeline_stages.sql'), 'utf8');
  console.log('▶ Menjalankan migrasi aditif 003_timeline_stages.sql...');
  await pool.query(sql);
  console.log('✅ Tabel timeline_stages siap.');

  let inserted = 0;
  for (const s of DEFAULT_TIMELINE_STAGES) {
    const res = await pool.query(
      `INSERT INTO timeline_stages
         (stage_key, sort_order, date_label, short_date, title, description, start_at, end_at, is_visible, visible_from, is_extended)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (stage_key) DO NOTHING`,
      [
        s.stage_key,
        s.sort_order,
        s.date_label,
        s.short_date,
        s.title,
        s.description,
        s.start_at,
        s.end_at,
        s.is_visible,
        s.visible_from,
        s.is_extended,
      ]
    );
    inserted += res.rowCount || 0;
  }

  const totalRes = await pool.query('SELECT COUNT(*)::int AS total FROM timeline_stages');
  console.log(`✅ Seed timeline_stages selesai (baru ditambahkan: ${inserted}, total baris: ${totalRes.rows[0].total}).`);

  const compRes = await pool.query(
    'SELECT slug, name, reg_open_at, reg_close_at, submission_deadline, is_active FROM competitions ORDER BY created_at ASC'
  );
  console.log('📋 Jadwal competitions saat ini di Supabase:');
  for (const c of compRes.rows) {
    console.log(`  - ${c.slug} (${c.name}): open=${c.reg_open_at?.toISOString?.() || c.reg_open_at}, close=${c.reg_close_at?.toISOString?.() || c.reg_close_at}, submit=${c.submission_deadline?.toISOString?.() || c.submission_deadline}, active=${c.is_active}`);
  }
} catch (err) {
  console.error('❌ Migrasi gagal:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
