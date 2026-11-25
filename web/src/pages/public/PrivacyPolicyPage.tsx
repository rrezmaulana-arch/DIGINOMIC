import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = '26 November 2026';
  const orgName = 'GenBI (Generasi Baru Indonesia) Malang bekerja sama dengan Bank Indonesia';
  const contactEmail = 'archedevstudio@gmail.com';
  const appName = 'Digiconomic Fest 2027';
  const appUrl = 'https://diginomic.vercel.app';

  return (
    <div className="min-h-screen bg-[#fdf8ef] py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="text-sm text-[#7a5530] hover:underline">← Kembali ke Beranda</Link>
          <h1 className="mt-6 text-3xl font-bold text-[#2f1e10] font-serif">Kebijakan Privasi</h1>
          <p className="mt-2 text-sm text-[#7a5530]">Terakhir diperbarui: {lastUpdated}</p>
        </div>

        <div className="prose prose-stone max-w-none text-[#3a2518] space-y-8">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">1. Pendahuluan</h2>
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana <strong>{orgName}</strong> ("kami", "penyelenggara")
              mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan
              platform <strong>{appName}</strong> yang dapat diakses di <a href={appUrl} className="text-[#7a5530] underline">{appUrl}</a> ("Platform").
            </p>
            <p>
              Dengan mendaftar dan menggunakan Platform, Anda menyetujui pengumpulan dan penggunaan
              informasi sebagaimana diuraikan dalam kebijakan ini. Jika Anda tidak setuju, harap jangan
              menggunakan Platform.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">2. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi berikut saat Anda menggunakan Platform:</p>
            <h3 className="text-base font-semibold mt-4 text-[#2f1e10]">a. Informasi yang Anda Berikan Langsung</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nama lengkap dan email saat mendaftar akun</li>
              <li>Nomor Induk Mahasiswa (NIM) dan nama institusi/perguruan tinggi</li>
              <li>Foto Kartu Tanda Mahasiswa (KTM) yang diunggah sebagai syarat verifikasi</li>
              <li>Data anggota tim lomba (nama, email, NIM)</li>
              <li>Bukti pembayaran biaya pendaftaran</li>
              <li>Karya lomba (esai, dokumen presentasi, atau file lain yang diunggah)</li>
            </ul>
            <h3 className="text-base font-semibold mt-4 text-[#2f1e10]">b. Informasi dari Pihak Ketiga</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Jika Anda mendaftar menggunakan Google OAuth, kami menerima nama, alamat email, dan foto profil dari akun Google Anda sesuai izin yang Anda berikan</li>
            </ul>
            <h3 className="text-base font-semibold mt-4 text-[#2f1e10]">c. Informasi yang Dikumpulkan Otomatis</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Data log akses (waktu login, alamat IP, jenis perangkat/browser)</li>
              <li>Cookie sesi untuk menjaga status login Anda</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">3. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p>Informasi yang kami kumpulkan digunakan untuk tujuan berikut:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Memverifikasi identitas dan kelayakan peserta lomba</li>
              <li>Memproses pendaftaran dan pembayaran biaya lomba</li>
              <li>Mengirimkan pemberitahuan terkait lomba (konfirmasi, pengumuman pemenang, jadwal)</li>
              <li>Memfasilitasi proses penilaian karya oleh Dewan Juri</li>
              <li>Menyusun statistik dan laporan penyelenggaraan (data digunakan secara agregat/anonim)</li>
              <li>Mematuhi kewajiban hukum yang berlaku di Indonesia</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">4. Penyimpanan dan Keamanan Data</h2>
            <p>
              Data Anda disimpan di server basis data PostgreSQL yang dikelola oleh <strong>Supabase</strong>
              dan file yang Anda unggah disimpan di <strong>Google Drive</strong> yang hanya dapat diakses oleh
              panitia dan juri yang berwenang. Kami menerapkan langkah-langkah keamanan teknis dan
              organisasional yang wajar, termasuk:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Enkripsi data saat transmisi menggunakan HTTPS/TLS</li>
              <li>Autentikasi berbasis sesi dengan cookie HttpOnly yang aman</li>
              <li>Akses data dibatasi hanya untuk panitia yang membutuhkan (prinsip least-privilege)</li>
              <li>File karya dan dokumen identitas tidak dapat diakses publik secara langsung</li>
            </ul>
            <p>
              Data Anda disimpan selama penyelenggaraan {appName} dan paling lama <strong>12 bulan</strong>
              setelah acara berakhir, kecuali diwajibkan untuk disimpan lebih lama oleh peraturan perundangan.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">5. Berbagi Informasi dengan Pihak Ketiga</h2>
            <p>Kami <strong>tidak menjual</strong> informasi pribadi Anda. Kami dapat berbagi informasi dengan:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dewan Juri:</strong> nama tim, institusi, dan karya lomba (tanpa informasi kontak pribadi)</li>
              <li><strong>Bank Indonesia:</strong> data statistik peserta secara agregat untuk keperluan pelaporan program</li>
              <li><strong>Penyedia layanan teknis:</strong> Supabase (basis data), Google (OAuth & Drive, penyimpanan file), Vercel (hosting frontend), Railway (hosting backend) — sesuai kebijakan privasi masing-masing</li>
              <li><strong>Otoritas hukum:</strong> jika diwajibkan oleh peraturan perundangan yang berlaku</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">6. Hak-Hak Anda</h2>
            <p>Sebagai pengguna Platform, Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Akses:</strong> meminta salinan data pribadi yang kami miliki tentang Anda</li>
              <li><strong>Koreksi:</strong> meminta pembaruan data yang tidak akurat melalui pengaturan profil atau kontak kami</li>
              <li><strong>Penarikan persetujuan:</strong> membatalkan pendaftaran dan meminta penghapusan data sebelum lomba berakhir</li>
              <li><strong>Portabilitas:</strong> meminta ekspor data Anda dalam format yang dapat dibaca mesin</li>
            </ul>
            <p>
              Untuk menggunakan hak-hak di atas, hubungi kami melalui email di{' '}
              <a href={`mailto:${contactEmail}`} className="text-[#7a5530] underline">{contactEmail}</a>.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">7. Cookie dan Teknologi Pelacakan</h2>
            <p>
              Platform menggunakan <strong>cookie sesi HTTP-only</strong> untuk mempertahankan status login Anda.
              Cookie ini tidak digunakan untuk iklan atau pelacakan lintas situs. Cookie dihapus otomatis
              saat Anda keluar (logout) atau menutup sesi browser.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">8. Layanan Pihak Ketiga</h2>
            <p>Platform mengintegrasikan layanan pihak ketiga berikut, masing-masing dengan kebijakan privasi sendiri:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Google OAuth 2.0</strong> — untuk autentikasi login via akun Google (<a href="https://policies.google.com/privacy" className="text-[#7a5530] underline" target="_blank" rel="noopener noreferrer">Kebijakan Privasi Google</a>)</li>
              <li><strong>Google Drive API</strong> — untuk penyimpanan berkas unggahan peserta</li>
              <li><strong>Supabase</strong> — basis data cloud (<a href="https://supabase.com/privacy" className="text-[#7a5530] underline" target="_blank" rel="noopener noreferrer">Kebijakan Privasi Supabase</a>)</li>
              <li><strong>Vercel & Railway</strong> — platform hosting aplikasi web dan API</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">9. Privasi Anak-Anak</h2>
            <p>
              Platform ini ditujukan untuk mahasiswa perguruan tinggi (usia 17 tahun ke atas).
              Kami tidak secara sengaja mengumpulkan data pribadi dari individu di bawah usia 17 tahun.
              Jika Anda mengetahui bahwa anak di bawah usia tersebut telah memberikan data pribadi kepada kami,
              harap hubungi kami segera.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">10. Perubahan Kebijakan Privasi</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material akan
              diberitahukan melalui pengumuman di Platform atau email. Tanggal "Terakhir diperbarui" di
              bagian atas halaman ini mencerminkan versi terbaru.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">11. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan, permintaan, atau kekhawatiran terkait privasi data Anda,
              silakan hubungi kami:
            </p>
            <div className="mt-3 p-4 bg-[#f0e3cc] rounded-lg border border-[#caa152]/30">
              <p className="font-semibold text-[#2f1e10]">{orgName}</p>
              <p>Email: <a href={`mailto:${contactEmail}`} className="text-[#7a5530] underline">{contactEmail}</a></p>
              <p>Website: <a href={appUrl} className="text-[#7a5530] underline">{appUrl}</a></p>
              <p>Malang, Jawa Timur, Indonesia</p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-[#caa152]/20 flex flex-wrap gap-4 text-sm text-[#7a5530]">
          <Link to="/" className="hover:underline">Beranda</Link>
          <Link to="/syarat-ketentuan" className="hover:underline">Syarat &amp; Ketentuan</Link>
          <Link to="/kompetisi" className="hover:underline">Kompetisi</Link>
        </div>
      </div>
    </div>
  );
};
