-- Digiconomic Fest 2027 — Migration 003: Dynamic Timeline Stages (SuperAdmin Managed)
-- Aman & aditif: hanya membuat tabel baru timeline_stages tanpa menyentuh tabel existing.

CREATE TABLE IF NOT EXISTS timeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_key VARCHAR(80) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 1,
  date_label VARCHAR(120) NOT NULL,
  short_date VARCHAR(80) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  visible_from TIMESTAMPTZ,
  is_extended BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_stages_order ON timeline_stages (sort_order ASC, start_at ASC);
CREATE INDEX IF NOT EXISTS idx_timeline_stages_visible ON timeline_stages (is_visible, visible_from);
