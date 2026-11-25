-- Diginomic Fest 2027 — Migration 002: Upgrade Sistem
-- Tambah JURI role, Google OAuth, Drive IDs, rubrik penjurian, news_articles

-- ============================================================
-- 1. Tambah role JURI ke enum user_role
-- ============================================================
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'JURI';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. Upgrade tabel users (Google OAuth + penugasan lomba)
-- ============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS assigned_competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nim VARCHAR(50);

-- password_hash boleh NULL untuk peserta yang login via Google OAuth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- ============================================================
-- 3. Upgrade tabel participant_profiles (NIM + Drive ID)
-- ============================================================
ALTER TABLE participant_profiles
  ADD COLUMN IF NOT EXISTS nim VARCHAR(50),
  ADD COLUMN IF NOT EXISTS student_card_drive_id TEXT;

-- ============================================================
-- 4. Upgrade tabel team_members (NIM + Drive ID per anggota)
-- ============================================================
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS nim VARCHAR(50),
  ADD COLUMN IF NOT EXISTS student_card_drive_id TEXT,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sequence_no INTEGER DEFAULT 1;

-- ============================================================
-- 5. Upgrade tabel registrations (Drive folder + privacy)
-- ============================================================
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_drive_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_sender_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_date VARCHAR(50),
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Ubah payment_proof_path -> hanya simpan referensi lokal sebagai fallback
-- (utamanya pakai payment_proof_drive_id)

-- ============================================================
-- 6. Upgrade tabel submissions (Drive ID + finalisasi)
-- ============================================================
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS drive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS drive_view_url TEXT,
  ADD COLUMN IF NOT EXISTS is_final BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

-- Max 2 versi upload (versioning sudah ada di uq_submission_reg_version)
-- is_final = TRUE berarti peserta sudah mengunci karya, tidak bisa upload lagi

-- ============================================================
-- 7. Tabel submission_scores (penjurian multi-juri, multi-rubrik)
-- ============================================================
CREATE TABLE IF NOT EXISTS submission_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  jury_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  round VARCHAR(30) NOT NULL DEFAULT 'TAHAP_1',
  -- Skor per kategori rubrik (0-100 masing-masing)
  score_orisinalitas NUMERIC(5,2) CHECK (score_orisinalitas BETWEEN 0 AND 100),
  score_analisis NUMERIC(5,2) CHECK (score_analisis BETWEEN 0 AND 100),
  score_inovasi NUMERIC(5,2) CHECK (score_inovasi BETWEEN 0 AND 100),
  score_sistematika NUMERIC(5,2) CHECK (score_sistematika BETWEEN 0 AND 100),
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (
    (COALESCE(score_orisinalitas,0) + COALESCE(score_analisis,0) + COALESCE(score_inovasi,0) + COALESCE(score_sistematika,0)) / 4.0
  ) STORED,
  feedback TEXT,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_score_jury_submission_round UNIQUE (submission_id, jury_id, round)
);

CREATE INDEX IF NOT EXISTS idx_submission_scores_sub ON submission_scores (submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_scores_jury ON submission_scores (jury_id);

-- ============================================================
-- 8. Tabel news_articles (dikelola Superadmin)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE news_category AS ENUM ('Pengumuman', 'Kompetisi', 'Technical Meeting', 'UMKM & Edukasi');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  category news_category NOT NULL DEFAULT 'Pengumuman',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  show_on_home BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_home ON news_articles (show_on_home, is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles (slug);

-- ============================================================
-- 9. Tambah kolom penting ke announcements (target lomba)
-- ============================================================
-- competition_id sudah ada (NULL = semua, isi = lomba tertentu)
-- Tambah kolom is_pinned untuk broadcast penting
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
