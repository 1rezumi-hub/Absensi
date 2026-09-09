export type TingkatKelas = 'X' | 'XI' | 'XII';

export type Jurusan = 
  | 'RPL (Rekayasa Perangkat Lunak)'
  | 'TKJ (Teknik Komputer & Jaringan)'
  | 'DKV (Desain Komunikasi Visual)'
  | 'AKL (Akuntansi & Keuangan Lembaga)'
  | 'OTKP (Otomatisasi & Tata Kelola Perkantoran)'
  | 'TKR (Teknik Kendaraan Ringan)'
  | 'Lainnya';

export type StatusKehadiran = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA';

export type MetodeAbsen = 'SCAN_QR' | 'MANUAL_CARD' | 'MANUAL_FORM';

export interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelas: string; // e.g. "XII RPL 1"
  tingkat: TingkatKelas;
  jurusan: string;
  jenisKelamin: 'L' | 'P';
  fotoUrl: string;
  noHpOrtu: string;
  namaOrtu: string;
  qrCodeData: string;
}

export interface CatatanPresensi {
  id: string;
  siswaId: string;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  waktu: string; // ISO string
  jam: string;   // e.g. "06:45:12"
  tanggal: string; // e.g. "2026-09-08"
  status: StatusKehadiran;
  metode: MetodeAbsen;
  alasanManual?: string;
  petugas: string; // Nama OSIS / Satpam yang bertugas
  waTerkirim: boolean;
  waTerkirimPada?: string;
}

export interface PetugasJaga {
  id: string;
  nama: string;
  peran: 'OSIS' | 'Satpam' | 'Guru Piket' | 'Admin';
  jabatan: string;
  shift: string;
  avatarUrl?: string;
}

export interface NotifikasiWA {
  id: string;
  presensiId: string;
  namaSiswa: string;
  namaOrtu: string;
  noHp: string;
  pesan: string;
  waktuKirim: string;
  status: 'TERKIRIM' | 'PENDING' | 'GAGAL';
}

export interface PengaturanSekolah {
  namaSekolah: string;
  alamatSekolah: string;
  jamMasuk: string; // e.g. "07:00"
  toleransiTerlambat: string; // e.g. "07:15"
  aktifkanSuara: boolean;
  aktifkanWaOtomatis: boolean;
  geofenceAktif: boolean;
  radiusMeter: number;
  temaGelap?: boolean;
}
