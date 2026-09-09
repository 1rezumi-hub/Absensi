import React, { useState } from 'react';
import { 
  Calendar, 
  Save, 
  History, 
  RotateCcw, 
  CheckCircle, 
  ChevronDown, 
  ShieldCheck,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { decomposeDate, isToday, getTodayIso } from '../utils/dateUtils';

interface DateSessionBarProps {
  selectedDate: string; // YYYY-MM-DD
  onOpenDateModal: () => void;
  onResetToToday: () => void;
  onSaveData: () => void;
  attendanceCountForDate: number;
  totalStudents: number;
  lastSavedTime: Date | null;
}

export const DateSessionBar: React.FC<DateSessionBarProps> = ({
  selectedDate,
  onOpenDateModal,
  onResetToToday,
  onSaveData,
  attendanceCountForDate,
  totalStudents,
  lastSavedTime,
}) => {
  const [saveToast, setSaveToast] = useState(false);
  const detail = decomposeDate(selectedDate);
  const isRealToday = isToday(selectedDate);

  const handleSaveClick = () => {
    onSaveData();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="no-print bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-xs sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Active Day, Date, Month, Year Display */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-open-date-session"
              type="button"
              onClick={onOpenDateModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200 transition-all cursor-pointer group shadow-xs"
              title="Klik untuk memilih Hari, Tanggal, Bulan, dan Tahun"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <CalendarDays className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 leading-none">
                  Sesi Presensi Aktif
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                  <span>{detail.formatLengkap}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </div>
            </button>

            {/* Indicator badge: Real Today vs Historical Archive */}
            {isRealToday ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hari Ini
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                  Arsip Hari ({detail.hari})
                </span>
                <button
                  type="button"
                  onClick={onResetToToday}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Kembali ke Tanggal Hari Ini"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Kembali ke Hari Ini</span>
                </button>
              </div>
            )}

            {/* Attendance count for this selected date */}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline-block">
              • <strong className="text-slate-800 dark:text-slate-200 font-bold">{attendanceCountForDate}</strong> dari {totalStudents} siswa tercatat
            </span>
          </div>

          {/* Right Action Tools: Save Data Button & History */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Auto-saved badge with timestamp */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {lastSavedTime
                  ? `Tersimpan: ${lastSavedTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Data Otomatis Tersimpan'}
              </span>
            </div>

            {/* Riwayat Hari Button */}
            <button
              id="btn-view-date-history"
              type="button"
              onClick={onOpenDateModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Lihat dan buka kembali data hari-hari sebelumnya"
            >
              <History className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="hidden sm:inline">Buka Riwayat Hari</span>
              <span className="sm:hidden">Riwayat</span>
            </button>

            {/* Explicit Save Button */}
            <button
              id="btn-save-attendance-data"
              type="button"
              onClick={handleSaveClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                saveToast
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800'
              }`}
              title="Simpan data presensi hari ini secara permanen"
            >
              {saveToast ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 animate-bounce" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
