import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Save, 
  Download, 
  Upload, 
  X, 
  FolderOpen, 
  CalendarDays, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  History,
  FileCheck
} from 'lucide-react';
import { 
  decomposeDate, 
  composeIsoDate, 
  getDaysInMonth, 
  NAMA_HARI, 
  NAMA_BULAN, 
  getTodayIso, 
  isToday,
  getRiwayatHari,
  RingkasanHari
} from '../utils/dateUtils';
import { CatatanPresensi } from '../types';

interface DateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (newDate: string) => void;
  attendanceRecords: CatatanPresensi[];
  totalStudents: number;
  onManualSave: () => void;
  lastSavedTime: Date | null;
  onExportAllData: () => void;
  onImportData: (records: CatatanPresensi[]) => void;
}

export const DateSessionModal: React.FC<DateSessionModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  attendanceRecords,
  totalStudents,
  onManualSave,
  lastSavedTime,
  onExportAllData,
  onImportData,
}) => {
  const [tempDate, setTempDate] = useState<string>(selectedDate);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'picker' | 'history'>('picker');

  // Decompose temporary date into Day, Date, Month, Year
  const dateDetail = decomposeDate(tempDate);
  const daysInSelectedMonth = getDaysInMonth(dateDetail.tahun, dateDetail.bulan);

  useEffect(() => {
    if (isOpen) {
      setTempDate(selectedDate);
      setSaveSuccessMsg(null);
      setImportError(null);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  // Handle individual component changes
  const handleYearChange = (newYear: number) => {
    const updated = composeIsoDate(newYear, dateDetail.bulan, dateDetail.tanggal);
    setTempDate(updated);
  };

  const handleMonthChange = (newMonth: number) => {
    const updated = composeIsoDate(dateDetail.tahun, newMonth, dateDetail.tanggal);
    setTempDate(updated);
  };

  const handleDayChange = (newDay: number) => {
    const updated = composeIsoDate(dateDetail.tahun, dateDetail.bulan, newDay);
    setTempDate(updated);
  };

  const handleSetToday = () => {
    const todayStr = getTodayIso();
    setTempDate(todayStr);
  };

  const handleApplyAndClose = () => {
    onSelectDate(tempDate);
    onClose();
  };

  const handleTriggerSave = () => {
    onManualSave();
    setSaveSuccessMsg('Data presensi semua hari telah berhasil disimpan ke database lokal!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Import JSON file handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].siswaId && parsed[0].tanggal) {
          onImportData(parsed);
          setSaveSuccessMsg(`Berhasil memulihkan ${parsed.length} catatan presensi!`);
          setImportError(null);
        } else {
          setImportError('Format file backup tidak valid. Pastikan file JSON berisi catatan presensi.');
        }
      } catch {
        setImportError('Gagal membaca file JSON. Pastikan file tidak rusak.');
      }
    };
    reader.readAsText(file);
  };

  const historyList: RingkasanHari[] = getRiwayatHari(attendanceRecords, [selectedDate, tempDate, getTodayIso()]);

  // Current temp date records
  const recordsForTempDate = attendanceRecords.filter((r) => r.tanggal === tempDate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                Kelola Hari & Sesi Presensi
              </h2>
              <p className="text-xs text-indigo-200">
                Pilih tanggal kerja, simpan aman, & buka riwayat hari sebelumnya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 sm:px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('picker')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'picker'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Pilih Hari & Tanggal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Hari Tersimpan ({historyList.filter(h => h.totalHadir > 0).length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Notification Messages */}
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {activeSubTab === 'picker' ? (
            <div className="space-y-5">
              {/* Selected Date Preview Card */}
              <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-800/40 dark:to-indigo-950/20 rounded-3xl p-4 sm:p-5 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Hari & Tanggal Sesi Yang Dipilih
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                      {dateDetail.formatLengkap}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isToday(tempDate)
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {isToday(tempDate) ? 'Hari Ini (Kalender Real-time)' : 'Arsip / Tanggal Lampau/Khusus'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        • {recordsForTempDate.length} siswa sudah diabsen
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSetToday}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Set Hari Ini</span>
                  </button>
                </div>
              </div>

              {/* INPUT FIELDS: HARI, TANGGAL, BULAN, TAHUN */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Atur Hari, Tanggal, Bulan, & Tahun</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Hari otomatis menyesuaikan tanggal
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* HARI (Tampilan Hari) */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Hari
                    </label>
                    <div className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 font-black text-indigo-700 text-sm flex items-center justify-between">
                      <span>{dateDetail.hari}</span>
                      <span className="text-[10px] text-indigo-500 font-bold">Auto</span>
                    </div>
                  </div>

                  {/* TANGGAL (1 - 31) */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Tanggal (1-{daysInSelectedMonth})
                    </label>
                    <select
                      id="select-session-day"
                      value={dateDetail.tanggal}
                      onChange={(e) => handleDayChange(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    >
                      {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BULAN (Januari - Desember) */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Bulan
                    </label>
                    <select
                      id="select-session-month"
                      value={dateDetail.bulan}
                      onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    >
                      {NAMA_BULAN.map((bulan, idx) => (
                        <option key={bulan} value={idx + 1}>
                          {bulan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TAHUN */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Tahun
                    </label>
                    <select
                      id="select-session-year"
                      value={dateDetail.tahun}
                      onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    >
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Direct Native Date Picker Alternative */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 font-medium">
                    Atau gunakan kalender sistem:
                  </span>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => {
                      if (e.target.value) setTempDate(e.target.value);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SAVE AND ARCHIVAL SAFETY SECTION */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Jaminan Keamanan Data (Anti-Hilang)
                    </span>
                  </div>
                  {lastSavedTime && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      Tersimpan: {lastSavedTime.toLocaleTimeString('id-ID')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ketika Anda mengganti hari, data presensi pada hari sebelumnya <strong>tetap tersimpan aman di sistem</strong> dan dapat dibuka kembali kapan saja tanpa akan terhapus.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTriggerSave}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Permanen Sekarang</span>
                  </button>

                  <button
                    type="button"
                    onClick={onExportAllData}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Unduh backup semua hari dalam bentuk JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup Semua Data (JSON)</span>
                  </button>

                  <label className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pulihkan Data</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* RIWAYAT HARI TERSIMPAN (OPEN PREVIOUS DAYS) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Daftar Hari & Arsip Presensi Sebelumnya
                  </h4>
                  <p className="text-xs text-slate-500">
                    Klik hari yang ingin Anda buka kembali untuk melihat data, menambah siswa, atau mencetak rekap.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onExportAllData}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-indigo-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {historyList.map((item) => {
                  const isCurrentActive = item.tanggal === selectedDate;
                  const isTemp = item.tanggal === tempDate;

                  return (
                    <div
                      key={item.tanggal}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrentActive
                          ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                          : isTemp
                          ? 'bg-slate-100/90 border-slate-300'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.formatLengkap}
                          </span>
                          {item.isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              Hari Ini
                            </span>
                          )}
                          {isCurrentActive && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                              Sesi Aktif
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                          <span className="font-bold text-slate-700">
                            {item.totalHadir} / {totalStudents} Hadir
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">
                            Tepat: {item.tepatWaktu}
                          </span>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">
                            Terlambat: {item.terlambat}
                          </span>
                          {item.izinSakit > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-semibold">
                                Izin/Sakit: {item.izinSakit}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTempDate(item.tanggal);
                          onSelectDate(item.tanggal);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                          isCurrentActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>{isCurrentActive ? 'Sedang Dibuka' : 'Buka Kembali Hari Ini'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Sesi aktif akan langsung digunakan pada modul scanner & rekap.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              id="btn-apply-date-session"
              type="button"
              onClick={handleApplyAndClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gunakan Hari Ini ({dateDetail.hari}, {dateDetail.tanggal}/{dateDetail.bulan}/{dateDetail.tahun})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
