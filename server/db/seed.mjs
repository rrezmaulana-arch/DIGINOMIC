import { loadConfig } from '../src/config/env.mjs';
import { createRepository } from '../src/repositories/index.mjs';
import { hashPassword } from '../src/utils/crypto.mjs';

export async function seedDatabase(repo, options = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  const superEmail = (options.superAdminEmail || process.env.SUPERADMIN_EMAIL || 'superadmin@diginomic.id').toLowerCase();
  const explicitPass = options.superAdminPassword || process.env.SUPERADMIN_PASSWORD || '';
  const superPass = explicitPass || (isProd ? '' : 'SuperAdmin2027!');

  let superAdmin = await repo.findUserByEmail(superEmail);
  if (!superAdmin) {
    if (!superPass) {
      console.warn('[SEED WARNING] SUPERADMIN_PASSWORD wajib diset pada NODE_ENV=production. Akun SuperAdmin default tidak dibuat.');
    } else {
      superAdmin = await repo.createUser({
        email: superEmail,
        password_hash: hashPassword(superPass),
        name: 'Ketua Steering Committee',
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        division: 'Steering Committee',
        privacy_accepted_at: new Date().toISOString(),
      });
    }
  }

  const existingComps = await repo.listCompetitions({ includeInactive: true });
  const existingEsai = existingComps.find((c) => c.slug === 'esai-nasional');
  const existingCase = existingComps.find((c) => c.slug === 'mini-case-competition');

  const now = Date.now();
  const defaultOpen = options.regOpenAt || new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const defaultClose = options.regCloseAt || '2027-01-30T16:59:59.000Z';
  const defaultSubDeadline = options.submissionDeadline || '2027-02-15T16:59:59.000Z';

  if (!existingEsai) {
    await repo.createCompetition({
      slug: 'esai-nasional',
      name: 'Esai Nasional',
      fee: 35000,
      is_team: true,
      max_team_size: 3,
      max_quota: 100,
      reg_open_at: defaultOpen,
      reg_close_at: defaultClose,
      submission_deadline: defaultSubDeadline,
      group_url: 'https://chat.whatsapp.com/digiconomic2027-esai',
      guidebook_url: 'https://drive.google.com/file/d/digiconomic2027-guidebook/view',
      is_active: true,
    });
  } else if (!existingEsai.is_team || Number(existingEsai.max_team_size) < 3) {
    await repo.updateCompetition(existingEsai.id, { is_team: true, max_team_size: 3 });
  }

  if (!existingCase) {
    await repo.createCompetition({
      slug: 'mini-case-competition',
      name: 'Mini Case Competition',
      fee: 50000,
      is_team: true,
      max_team_size: 3,
      max_quota: 50,
      reg_open_at: defaultOpen,
      reg_close_at: defaultClose,
      submission_deadline: defaultSubDeadline,
      group_url: 'https://chat.whatsapp.com/digiconomic2027-case',
      guidebook_url: 'https://drive.google.com/file/d/digiconomic2027-guidebook/view',
      is_active: true,
    });
  } else if (!existingCase.is_team || Number(existingCase.max_team_size) < 3) {
    await repo.updateCompetition(existingCase.id, { is_team: true, max_team_size: 3 });
  }

  if (superAdmin && typeof repo.listNewsArticles === 'function' && typeof repo.createNewsArticle === 'function') {
    const existingNews = await repo.listNewsArticles({ publishedOnly: false });
    if (existingNews.length === 0) {
      const initialNews = [
        {
          slug: 'pembukaan-pendaftaran-digiconomic-fest-2027',
          category: 'Pengumuman',
          title: 'Pendaftaran Digiconomic Fest 2027 Resmi Dibuka: Target 450+ Peserta Nasional',
          excerpt:
            'GenBI Komisariat Universitas Brawijaya & KPw Bank Indonesia Malang resmi membuka pendaftaran Digiconomic Fest 2027 (14 Des 2026 – 30 Jan 2027) dengan dua cabang kompetisi tim nasional: Esai Nasional dan Mini Case Competition.',
          content: [
            'GenBI Komisariat Universitas Brawijaya bersama Kantor Perwakilan Bank Indonesia Malang resmi membuka pendaftaran Digiconomic Fest 2027 mulai 14 Desember 2026 hingga 30 Januari 2027.',
            'Tahun ini tersedia dua cabang kompetisi tim tingkat nasional yaitu Esai Nasional (kategori tim 2–3 orang) dan Mini Case Competition (kategori tim 2–3 orang). Setiap akun ketua tim hanya diperbolehkan mengikuti satu cabang lomba aktif agar kompetisi berjalan adil dan fokus.',
            'Seluruh berkas pendaftaran dapat diunggah melalui portal resmi, dan status verifikasi serta akses grup peserta akan diperbarui langsung melalui Dashboard Peserta.',
          ].join('\n\n'),
          cover_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&fm=webp&q=75',
          show_on_home: true,
          is_featured: true,
          is_published: true,
        },
        {
          slug: 'jadwal-seleksi-hingga-main-event-2027',
          category: 'Technical Meeting',
          title: 'Catat Tanggal Penting: Penjurian Februari, Final 21 Maret & Main Event 22 Maret 2027',
          excerpt:
            'Simak linimasa resmi mulai dari evaluasi karya (1–19 Feb 2027), pengumuman finalis (20 Feb 2027), babak final (21 Mar 2027), hingga Acara Puncak pada 22 Maret 2027.',
          content: [
            'Setelah pendaftaran ditutup pada 30 Januari 2027, seluruh karya Esai Nasional dan Mini Case Competition akan memasuki tahap Judging & Evaluation pada 1–19 Februari 2027.',
            'Pengumuman finalis dijadwalkan pada 20 Februari 2027, diikuti Technical Meeting khusus finalis sebelum melaju ke Competition Final pada 21 Maret 2027 di Universitas Brawijaya.',
            'Rangkaian kegiatan akan ditutup dengan Digiconomic Fest Main Event pada 22 Maret 2027 yang menghadirkan Seminar bersama Bank Indonesia dan praktisi UMKM, Pameran UMKM binaan BI, serta Awarding Night.',
          ].join('\n\n'),
          cover_image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&fm=webp&q=75',
          show_on_home: true,
          is_featured: false,
          is_published: true,
        },
        {
          slug: 'tips-lolos-seleksi-esai-dan-mini-case',
          category: 'Kompetisi',
          title: '5 Hal yang Paling Dinilai Juri di Esai Nasional & Mini Case Competition',
          excerpt:
            'Ketajaman riset masalah UMKM di emerging market, kelayakan implementasi, serta orisinalitas gagasan menjadi indikator utama dewan juri.',
          content: [
            'Baik pada Esai Nasional maupun Mini Case Competition, karya yang menonjol selalu berangkat dari tantangan nyata pelaku UMKM lokal di tengah dinamika emerging market.',
            'Lima aspek utama yang diperhatikan juri meliputi kesesuaian tema, kekuatan data pendukung, orisinalitas solusi digital/bisnis, kelayakan penerapan, serta kerapian sistematika penulisan sesuai Juklak & Juknis.',
            'Pastikan format PDF dan batas halaman sudah sesuai panduan resmi sebelum mengunggah karya melalui Dashboard Peserta.',
          ].join('\n\n'),
          cover_image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&fm=webp&q=75',
          show_on_home: true,
          is_featured: false,
          is_published: true,
        },
        {
          slug: 'pameran-umkm-binaan-bank-indonesia-malang',
          category: 'UMKM & Edukasi',
          title: 'Pameran UMKM Binaan Bank Indonesia Hadir di Acara Puncak Digiconomic Fest 2027',
          excerpt:
            'Selain seminar nasional bertarget 375+ peserta, Main Event 22 Maret 2027 juga menampilkan pameran produk unggulan UMKM binaan Bank Indonesia.',
          content: [
            'Acara puncak Digiconomic Fest 2027 pada 22 Maret 2027 tidak hanya menjadi panggung apresiasi para finalis kompetisi, tetapi juga ruang temu langsung antara mahasiswa, praktisi, dan pelaku UMKM binaan Bank Indonesia.',
            'Melalui sesi seminar, diskusi interaktif, dan Pameran UMKM binaan BI, pengunjung dapat melihat langsung bagaimana digitalisasi pembayaran dan inovasi bisnis membantu UMKM lokal naik kelas dan berdaya saing global.',
          ].join('\n\n'),
          cover_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&fm=webp&q=75',
          show_on_home: false,
          is_featured: false,
          is_published: true,
        },
      ];
      for (const item of initialNews) {
        await repo.createNewsArticle({ ...item, created_by: superAdmin.id });
      }
    }
  }

  return { superAdmin, competitions: await repo.listCompetitions({ includeInactive: true }) };
}

// Jalankan langsung bila dipanggil via CLI: node db/seed.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const repo = await createRepository(config);
  const res = await seedDatabase(repo);
  console.log(`Seed selesai. SuperAdmin: ${res.superAdmin.email}, Lomba: ${res.competitions.length}`);
  await repo.close();
}
