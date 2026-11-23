# Digiconomic Fest 2027 — Web Portal

Portal Web Resmi Kompetisi & Festival Bank Indonesia 2027.

> **PANDUAN SISTEM & AKSES:**  
> Aplikasi ini adalah platform frontend interaktif untuk kompetisi dan festival Digiconomic Fest 2027.  
> Untuk mengakses modul panitia dan sistem administrasi, silakan hubungi tim IT / Administrator resmi untuk mendapatkan izin akses.

---

## 🗺️ Struktur Rute Halaman Aktif

- `/` — Beranda Publik (Hero, About, Jadwal, Cabang Lomba, FAQ, Sponsor)
- `/login` — Portal Masuk Akun
- `/daftar` — Formulir Pendaftaran Peserta (Data Diri & Verifikasi Pembayaran)
- `/dashboard` — Dashboard Peserta (Progress Bar Alur, Unggah Karya, Akses Grup WA & Panduan)
- `/admin` — Portal Panitia (Verifikasi Berkas, Penjurian Karya, Rekap Data & Ekspor CSV, Broadcast WA)
- `/superadmin` — Portal Steering Committee (Batch Approval, Pengaturan Kuota & Sistem, Manajemen Admin, Audit Log)

---

## 🎨 Palet Warna Resmi (Strikte 5 Warna)

- `#2F1E10` (Dark Royal Espresso)
- `#7A5530` (Warm Bronze Brown)
- `#CAA152` (Classic Bank Indonesia Gold)
- `#EBDCC8` (Parchment Cream Accent)
- `#FAF4E8` / `#FDF8EF` (Soft Paper Background)

---

## 🛠️ Menjalankan Proyek Secara Lokal

```bash
# Instal dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Periksa build produksi
npm run build
```
