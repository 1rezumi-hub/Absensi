// Utility for Indonesian date operations, decomposition, and historical recap helpers

export const NAMA_HARI = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export interface TanggalDetail {
  hari: string;
  tanggal: number;
  bulan: number; // 1 - 12
  namaBulan: string;
  tahun: number;
  isoDate: string; // YYYY-MM-DD
  formatLengkap: string; // e.g. "Rabu, 9 September 2026"
}

/**
 * Converts a YYYY-MM-DD string into detailed Indonesian date components
 */
export function decomposeDate(isoDateStr: string): TanggalDetail {
  // Parse date components safely
  const parts = isoDateStr.split('-');
  const y = parseInt(parts[0], 10) || new Date().getFullYear();
  const m = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
  const d = parseInt(parts[2], 10) || new Date().getDate();

  // Construct local date at midday to avoid timezone offset shifts
  const dateObj = new Date(y, m - 1, d, 12, 0, 0);
  const dayIndex = dateObj.getDay();
  const hari = NAMA_HARI[dayIndex];
  const namaBulan = NAMA_BULAN[m - 1] || 'Januari';
  const formatLengkap = `${hari}, ${d} ${namaBulan} ${y}`;

  const formattedIso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return {
    hari,
    tanggal: d,
    bulan: m,
    namaBulan,
    tahun: y,
    isoDate: formattedIso,
    formatLengkap,
  };
}

/**
 * Creates an ISO string (YYYY-MM-DD) from year, month (1-12), and day (1-31)
 */
export function composeIsoDate(year: number, month: number, day: number): string {
  const safeYear = Math.max(2020, Math.min(2035, year));
  const safeMonth = Math.max(1, Math.min(12, month));
  const daysInMonth = new Date(safeYear, safeMonth, 0).getDate();
  const safeDay = Math.max(1, Math.min(daysInMonth, day));

  return `${safeYear}-${String(safeMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

/**
 * Gets days count for given year and month (1-12)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Formats YYYY-MM-DD to Indonesian human-readable string
 */
export function formatTanggalLengkap(isoDateStr: string): string {
  try {
    const detail = decomposeDate(isoDateStr);
    return detail.formatLengkap;
  } catch {
    return isoDateStr;
  }
}

/**
 * Checks if an iso date string matches today's date
 */
export function isToday(isoDateStr: string): boolean {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return isoDateStr === `${y}-${m}-${d}`;
}

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayIso(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface RingkasanHari {
  tanggal: string; // YYYY-MM-DD
  formatLengkap: string;
  hari: string;
  isToday: boolean;
  totalHadir: number;
  tepatWaktu: number;
  terlambat: number;
  izinSakit: number;
  metodeScan: number;
  metodeManual: number;
}

/**
 * Aggregates all recorded dates from attendance list with summary stats, sorted descending by date
 */
export function getRiwayatHari(
  records: Array<{ tanggal: string; status: string; metode: string }>,
  includeDates: string[] = []
): RingkasanHari[] {
  const dateMap = new Map<string, {
    totalHadir: number;
    tepatWaktu: number;
    terlambat: number;
    izinSakit: number;
    metodeScan: number;
    metodeManual: number;
  }>();

  // Initialize dates that must be included (e.g. current selected date, today)
  for (const dateStr of includeDates) {
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, {
        totalHadir: 0,
        tepatWaktu: 0,
        terlambat: 0,
        izinSakit: 0,
        metodeScan: 0,
        metodeManual: 0,
      });
    }
  }

  // Count occurrences
  for (const record of records) {
    const dateStr = record.tanggal;
    if (!dateStr) continue;

    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, {
        totalHadir: 0,
        tepatWaktu: 0,
        terlambat: 0,
        izinSakit: 0,
        metodeScan: 0,
        metodeManual: 0,
      });
    }

    const stat = dateMap.get(dateStr)!;
    stat.totalHadir += 1;
    if (record.status === 'HADIR') stat.tepatWaktu += 1;
    else if (record.status === 'TERLAMBAT') stat.terlambat += 1;
    else if (record.status === 'IZIN' || record.status === 'SAKIT') stat.izinSakit += 1;

    if (record.metode === 'SCAN_QR') stat.metodeScan += 1;
    else stat.metodeManual += 1;
  }

  // Convert to array and sort descending by date
  const result: RingkasanHari[] = [];
  dateMap.forEach((stats, tanggal) => {
    const detail = decomposeDate(tanggal);
    result.push({
      tanggal,
      formatLengkap: detail.formatLengkap,
      hari: detail.hari,
      isToday: isToday(tanggal),
      ...stats,
    });
  });

  return result.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}
