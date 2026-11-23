# Digiconomic Fest 2027 — Monorepo

Satu repositori untuk seluruh sistem **Digiconomic Fest 2027** sesuai struktur Lampiran A PRD:

```text
digiconomic-monorepo/
├── package.json        # Root npm workspaces & skrip bersama
├── web/                # Frontend React 19 + Vite + Tailwind v4 (UI upgrade + /kompetisi/:slug + animasi logo)
├── api/                # Backend Node.js + 44 endpoint + 12 tabel PostgreSQL + 28 uji otomatis
└── deploy/             # Docker Compose (dev & prod: Nginx + API + PostgreSQL 16) + skrip backup/restore
```

## Menjalankan Secara Lokal

```bash
# 1. Instal dependensi seluruh workspace (web & api)
npm install

# 2. Jalankan 28 uji otomatis backend (E2E, edge case, & security)
npm run test:api

# 3. Jalankan backend + PostgreSQL 16 via Docker (terminal 1)
npm run docker:dev

# 4. Jalankan frontend Vite (terminal 2)
npm run dev:web
```

Frontend berjalan di `http://localhost:5173` dan API di `http://localhost:4000` (`GET /health`).

## Deploy Produksi (VPS + Cloudflare Pages)
- **Frontend (`web/`):** Hubungkan ke Cloudflare Pages / Vercel dengan root directory `web`, build command `npm run build`, output directory `dist`.
- **Backend (`api/` + `deploy/`):** Salin `deploy/.env.example` menjadi `deploy/.env`, pasang sertifikat Origin di `deploy/nginx/certs/`, lalu jalankan `npm run docker:prod`.
