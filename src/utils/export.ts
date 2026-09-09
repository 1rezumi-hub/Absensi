import { CatatanPresensi } from '../types';

export const exportAttendanceToCSV = (records: CatatanPresensi[], filename = 'Rekap_Presensi_Siswa.csv') => {
  const headers = [
    'No',
    'Tanggal',
    'Jam Masuk',
    'NISN',
    'Nama Siswa',
    'Kelas',
    'Jurusan',
    'Status Kehadiran',
    'Metode Absensi',
    'Petugas Jaga',
    'Keterangan / Alasan Manual',
    'Status Notifikasi WA'
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    `"${r.tanggal}"`,
    `"${r.jam}"`,
    `"${r.nisn}"`,
    `"${r.nama.replace(/"/g, '""')}"`,
    `"${r.kelas}"`,
    `"${r.jurusan}"`,
    `"${r.status}"`,
    `"${r.metode === 'SCAN_QR' ? 'Scan Kartu QR' : r.metode === 'MANUAL_FORM' ? 'Form Manual' : 'Input Petugas'}"`,
    `"${r.petugas}"`,
    `"${(r.alasanManual || '-').replace(/"/g, '""')}"`,
    `"${r.waTerkirim ? 'Terkirim (' + (r.waTerkirimPada || '') + ')' : 'Belum/Nonaktif'}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
