import { Siswa, CatatanPresensi, PetugasJaga, PengaturanSekolah, NotifikasiWA, StatusKehadiran, MetodeAbsen } from '../types';
import { INITIAL_SISWA, INITIAL_PRESENSI, INITIAL_PETUGAS, INITIAL_SETTINGS, getTodayDateString } from '../data/mockData';

export { getTodayDateString };

const STORAGE_KEYS = {
  SISWA: 'absensi_siswa_v1',
  PRESENSI: 'absensi_records_v1',
  PETUGAS_AKTIF: 'absensi_active_guard_v1',
  SETTINGS: 'absensi_settings_v1',
  WA_LOGS: 'absensi_wa_logs_v1',
};

export const getStoredStudents = (): Siswa[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SISWA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
      return INITIAL_SISWA;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SISWA;
  }
};

export const saveStudents = (students: Siswa[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(students));
  } catch {
    // ignore
  }
};

export const getStoredAttendance = (): CatatanPresensi[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESENSI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRESENSI, JSON.stringify(INITIAL_PRESENSI));
      return INITIAL_PRESENSI;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRESENSI;
  }
};

export const saveAttendance = (records: CatatanPresensi[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESENSI, JSON.stringify(records));
  } catch {
    // ignore
  }
};

export const getStoredSettings = (): PengaturanSekolah => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings: PengaturanSekolah): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
};

export const getStoredActiveGuard = (): PetugasJaga => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PETUGAS_AKTIF);
    if (!raw) {
      const defaultGuard = INITIAL_PETUGAS[0];
      localStorage.setItem(STORAGE_KEYS.PETUGAS_AKTIF, JSON.stringify(defaultGuard));
      return defaultGuard;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PETUGAS[0];
  }
};

export const saveActiveGuard = (guard: PetugasJaga): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PETUGAS_AKTIF, JSON.stringify(guard));
  } catch {
    // ignore
  }
};

export const getStoredWaLogs = (): NotifikasiWA[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WA_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveWaLogs = (logs: NotifikasiWA[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(logs));
  } catch {
    // ignore
  }
};

// Helper to determine status based on current time and school threshold
export const calculateAttendanceStatus = (timeStr: string, settings: PengaturanSekolah): StatusKehadiran => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const [limitHours, limitMinutes] = settings.jamMasuk.split(':').map(Number);

  const currentTotal = hours * 60 + minutes;
  const limitTotal = limitHours * 60 + limitMinutes;

  if (currentTotal <= limitTotal) {
    return 'HADIR';
  } else {
    return 'TERLAMBAT';
  }
};

export const formatTimeNow = (d = new Date()): string => {
  return d.toTimeString().split(' ')[0]; // "06:45:30"
};

export const createWaMessage = (
  student: Siswa,
  status: StatusKehadiran,
  jam: string,
  schoolName: string
): string => {
  const greeting = `Yth. Bpk/Ibu ${student.namaOrtu || 'Wali Murid'},`;
  const info = `Pemberitahuan resmi: Ananda *${student.nama}* (${student.kelas} - ${student.jurusan}) telah melakukan presensi gerbang sekolah.`;
  const detail = `🕒 Waktu: *${jam} WIB*\n📍 Status Kehadiran: *${status === 'HADIR' ? 'Tepat Waktu' : status}*`;
  const closing = `Terima kasih atas kerja samanya demi ketertiban putra-putri kita di sekolah.\n\n— *Sistem Gerbang ${schoolName}*`;
  return `${greeting}\n\n${info}\n${detail}\n\n${closing}`;
};
