-- Digiconomic Fest 2027 — PostgreSQL 16 Schema (12 Tabel + Partial Unique Index BR-01)
-- Disesuaikan dari PRD Bagian 10 (tanpa Google OAuth -> Email + Password scrypt)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum peran pengguna & status pendaftaran
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('PESERTA', 'ADMIN', 'SUPERADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM (
    'MENUNGGU_VERIFIKASI',
    'DITOLAK',
    'TERVERIFIKASI',
    'LOLOS_TAHAP_1',
    'FINALIS',
    'JUARA',
    'GUGUR',
    'DIBATALKAN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE email_status AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Tabel users (email + password_hash, tanpa Google OAuth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(150) NOT NULL,
  role user_role NOT NULL DEFAULT 'PESERTA',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  division VARCHAR(120),
  privacy_accepted_at TIMESTAMPTZ,
  reset_token_hash VARCHAR(64),
  reset_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 2. Tabel participant_profiles (1-to-0..1 dengan users)
CREATE TABLE IF NOT EXISTS participant_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  institution VARCHAR(180) NOT NULL,
  phone_wa VARCHAR(32) NOT NULL,
  student_card_path TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel competitions
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  fee INTEGER NOT NULL DEFAULT 0 CHECK (fee >= 0),
  is_team BOOLEAN NOT NULL DEFAULT FALSE,
  max_team_size INTEGER NOT NULL DEFAULT 1 CHECK (max_team_size >= 1),
  max_quota INTEGER NOT NULL DEFAULT 100 CHECK (max_quota >= 1),
  reg_open_at TIMESTAMPTZ NOT NULL,
  reg_close_at TIMESTAMPTZ NOT NULL,
  submission_deadline TIMESTAMPTZ NOT NULL,
  group_url TEXT,
  guidebook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_code VARCHAR(32) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
  team_name VARCHAR(120),
  status registration_status NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
  payment_proof_path TEXT,
  reject_reason TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BR-01: Aturan 1 akun hanya boleh memiliki 1 pendaftaran aktif (selain DIBATALKAN)
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_active_user
  ON registrations (user_id)
  WHERE status <> 'DIBATALKAN';

CREATE INDEX IF NOT EXISTS idx_registrations_comp_status
  ON registrations (competition_id, status);

-- 5. Tabel team_members (anggota tim tanpa akun)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  institution VARCHAR(180) NOT NULL,
  phone_wa VARCHAR(32) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_members_reg ON team_members (registration_id);

-- 6. Tabel submissions (karya berversi + dukungan skor penjurian)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  title VARCHAR(200),
  file_path TEXT,
  link_url TEXT,
  description TEXT,
  version INTEGER NOT NULL CHECK (version >= 1),
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  jury_feedback TEXT,
  round VARCHAR(30),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_submission_payload CHECK (file_path IS NOT NULL OR link_url IS NOT NULL),
  CONSTRAINT uq_submission_reg_version UNIQUE (registration_id, version)
);

-- 7. Tabel announcements (Information Board)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_comp_pub
  ON announcements (competition_id, published_at DESC);

-- 8. Tabel status_logs
CREATE TABLE IF NOT EXISTS status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  from_status registration_status,
  to_status registration_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_logs_reg_created
  ON status_logs (registration_id, created_at DESC);

-- 9. Tabel sessions (hash SHA-256 cookie token)
CREATE TABLE IF NOT EXISTS sessions (
  token_hash VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip VARCHAR(64),
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

-- 10. Tabel admin_invites (catatan penunjukan/undangan admin)
CREATE TABLE IF NOT EXISTS admin_invites (
  email VARCHAR(255) PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'ADMIN',
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

-- 11. Tabel email_outbox (antrean email transaksional)
CREATE TABLE IF NOT EXISTS email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  template VARCHAR(80) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status email_status NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  send_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_pending
  ON email_outbox (status, send_after);

-- 12. Tabel audit_logs (jejak aksi sensitif)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(60) NOT NULL,
  target_id VARCHAR(100),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);
