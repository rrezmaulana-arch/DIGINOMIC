import fs from 'fs';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = path.join(__dirname, '..', '.env');
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration(filename) {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', filename), 'utf8');
  console.log(`\n▶ Menjalankan ${filename}...`);
  await pool.query(sql);
  console.log(`✅ ${filename} selesai.`);
}

try {
  await runMigration('001_init.sql');
  await runMigration('002_system_upgrade.sql');

  const res = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log('\n📋 Tabel di Supabase:', res.rows.map((r) => r.table_name).join(', '));
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
