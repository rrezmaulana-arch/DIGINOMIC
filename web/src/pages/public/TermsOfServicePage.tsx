import React from 'react';
import { Link } from 'react-router-dom';

export const TermsOfServicePage: React.FC = () => {
  const lastUpdated = '26 November 2026';
  const appName = 'Digiconomic Fest 2027';
  const appUrl = 'https://diginomic.vercel.app';
  const contactEmail = 'archedevstudio@gmail.com';

  return (
    <div className="min-h-screen bg-[#fdf8ef] py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="text-sm text-[#7a5530] hover:underline">← Kembali ke Beranda</Link>
          <h1 className="mt-6 text-3xl font-bold text-[#2f1e10] font-serif">Syarat &amp; Ketentuan Penggunaan</h1>
          <p className="mt-2 text-sm text-[#7a5530]">Terakhir diperbarui: {lastUpdated}</p>
        </div>

        <div className="prose prose-stone max-w-none text-[#3a2518] space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses dan menggunakan Platform <strong>{appName}</strong> di <a href={appUrl} className="text-[#7a5530] underline">{appUrl}</a>,
              Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui syarat dan ketentuan ini.
              Jika Anda tidak setuju, harap hentikan penggunaan Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">2. Deskripsi Layanan</h2>
            <p>
              {appName} adalah platform digital yang diselenggarakan oleh GenBI (Generasi Baru Indonesia) Malang
              bekerja sama dengan Bank Indonesia untuk memfasilitasi pendaftaran, pengelolaan, dan penilaian
              kompetisi akademik nasional, termasuk Esai Nasional dan Mini Case Competition.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">3. Kelayakan Peserta</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Peserta adalah mahasiswa aktif perguruan tinggi di Indonesia yang dibuktikan dengan Kartu Tanda Mahasiswa (KTM) yang valid</li>
              <li>Setiap peserta hanya dapat mendaftar satu kompetisi dengan satu tim</li>
              <li>Data yang diberikan harus akurat dan dapat dipertanggungjawabkan</li>
              <li>Peserta yang terbukti memberikan data palsu dapat didiskualifikasi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">4. Akun Pengguna</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Anda bertanggung jawab menjaga kerahasiaan kata sandi akun Anda</li>
              <li>Satu alamat email hanya dapat digunakan untuk satu akun</li>
              <li>Anda bertanggung jawab atas semua aktivitas yang dilakukan melalui akun Anda</li>
              <li>Segera laporkan akses tidak sah ke akun Anda melalui kontak panitia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">5. Hak Kekayaan Intelektual Karya</h2>
            <p>
              Karya yang Anda unggah (esai, presentasi, atau dokumen lomba lainnya) tetap menjadi
              hak milik Anda sebagai peserta. Dengan mengunggah karya, Anda memberikan lisensi
              non-eksklusif kepada penyelenggara untuk:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Menampilkan karya kepada Dewan Juri untuk keperluan penilaian</li>
              <li>Mengarsipkan karya sebagai dokumentasi penyelenggaraan lomba</li>
              <li>Mempublikasikan karya pemenang di media resmi penyelenggara dengan menyebut nama penulis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">6. Pembayaran dan Pengembalian Dana</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Biaya pendaftaran bersifat non-refundable kecuali ditentukan lain oleh panitia</li>
              <li>Bukti pembayaran yang diunggah harus asli dan dapat diverifikasi</li>
              <li>Ketidaksesuaian data pembayaran dapat menyebabkan penundaan atau penolakan verifikasi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">7. Larangan Penggunaan</h2>
            <p>Anda dilarang untuk:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Mendaftar dengan identitas palsu atau memalsukan dokumen akademik</li>
              <li>Mengunggah karya yang melanggar hak cipta pihak lain (plagiarisme)</li>
              <li>Mengakses atau mencoba mengakses akun pengguna lain</li>
              <li>Melakukan tindakan yang mengganggu integritas sistem atau keamanan Platform</li>
              <li>Menggunakan Platform untuk tujuan komersial tanpa izin tertulis dari penyelenggara</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">8. Pembatasan Tanggung Jawab</h2>
            <p>
              Platform disediakan "sebagaimana adanya". Penyelenggara tidak bertanggung jawab atas:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gangguan layanan akibat pemeliharaan teknis atau force majeure</li>
              <li>Kehilangan data akibat kegagalan teknis yang tidak terduga</li>
              <li>Kerugian tidak langsung yang timbul dari penggunaan Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">9. Penghentian Layanan</h2>
            <p>
              Penyelenggara berhak menangguhkan atau menghapus akun yang melanggar syarat dan ketentuan ini
              tanpa pemberitahuan sebelumnya. Peserta yang didiskualifikasi tidak berhak atas pengembalian
              biaya pendaftaran.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">10. Perubahan Syarat</h2>
            <p>
              Penyelenggara berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan material
              akan diumumkan di Platform. Penggunaan Platform yang berkelanjutan setelah perubahan
              dianggap sebagai penerimaan syarat yang diperbarui.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">11. Hukum yang Berlaku</h2>
            <p>
              Syarat dan ketentuan ini tunduk pada dan ditafsirkan sesuai dengan hukum yang berlaku
              di Republik Indonesia. Setiap sengketa diselesaikan melalui musyawarah mufakat atau,
              jika tidak tercapai kesepakatan, melalui pengadilan yang berwenang di Malang, Jawa Timur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2f1e10]">12. Hubungi Kami</h2>
            <p>
              Pertanyaan mengenai Syarat &amp; Ketentuan ini dapat disampaikan ke:{' '}
              <a href={`mailto:${contactEmail}`} className="text-[#7a5530] underline">{contactEmail}</a>
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-[#caa152]/20 flex flex-wrap gap-4 text-sm text-[#7a5530]">
          <Link to="/" className="hover:underline">Beranda</Link>
          <Link to="/kebijakan-privasi" className="hover:underline">Kebijakan Privasi</Link>
          <Link to="/kompetisi" className="hover:underline">Kompetisi</Link>
        </div>
      </div>
    </div>
  );
};
