/**
 * Lindungi sel CSV dari Formula Injection (Excel/Sheets: =, +, -, @, tab, CR).
 */
export function escapeCsvCell(value) {
  let str = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildRegistrationsCsv(rows) {
  const headers = [
    'Kode Registrasi',
    'Tanggal Daftar (UTC)',
    'Nama Peserta',
    'Email',
    'Institusi',
    'Nomor WA',
    'Cabang Lomba',
    'Tipe',
    'Nama Tim',
    'Biaya',
    'Status',
    'Judul Karya Terakhir',
    'Link Karya',
    'Skor Juri',
  ];

  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.registration_code,
        r.created_at,
        r.full_name || r.user_name,
        r.email,
        r.institution || '-',
        r.phone_wa || '-',
        r.competition_name,
        r.is_team ? 'Tim' : 'Individu',
        r.team_name || '-',
        r.fee,
        r.status,
        r.latest_submission_title || '-',
        r.latest_submission_link || '-',
        r.latest_submission_score ?? '-',
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  }
  return '\uFEFF' + lines.join('\n');
}
