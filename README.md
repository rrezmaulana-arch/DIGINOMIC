# Digiconomic Fest 2027 — Web Portal (Prototype / Demo Mode)

Portal Web Resmi Kompetisi & Festival Bank Indonesia 2027.

> **PENTING / PERHATIAN KEAMANAN & LINGKUP DEMO:**  
> Aplikasi ini saat ini beroperasi dalam **Mode Demo (Prototipe Frontend)** menggunakan data tiruan (*dummy seed*) dan penyimpanan lokal browser (`localStorage`).  
> - **Tidak ada backend, database, atau layanan eksternal nyata.**
> - **Tidak ada transaksi uang nyata** pada simulasi QRIS.
> - **Tidak ada berkas yang diunggah secara fisik** ke server pada form KTM.
> - **Kredensial login adalah akun demo simulasi** yang divalidasi di sisi frontend.

---

## 🔑 Kredensial Akun Demo

Untuk menguji seluruh alur peran, gunakan akun simulasi berikut:

| Peran | Email | Kata Sandi | Halaman Akses |
|---|---|---|---|
| **Peserta Demo** | `demo.peserta@diginomic.id` | `Peserta2027` | `/dashboard` |
| **Admin Panitia** | `admin.lomba@diginomic.id` | `Admin2027` | `/admin` |
| **Superadmin** | `superadmin@diginomic.id` | `Super2027` | `/superadmin` |

*Catatan: Pendaftar baru yang mendaftar melalui `/daftar` dapat login menggunakan email yang didaftarkan dengan kata sandi bebas (minimal 6 karakter).*

---

## 🗺️ Struktur Rute Halaman Aktif

- `/` — Beranda Publik (Hero, About, Jadwal, Cabang Lomba, FAQ, Sponsor)
- `/login` — Portal Masuk Akun dengan validasi kredensial per akun demo
- `/daftar` — Formulir Pendaftaran Peserta (2 langkah: Data Diri & Simulasi QRIS)
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
