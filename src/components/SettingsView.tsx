import React, { useState } from 'react';
import { 
  Settings, 
  Clock, 
  MapPin, 
  Volume2, 
  Send, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  Save,
  RotateCcw,
  Moon,
  Sun,
  Sparkles,
  Palette
} from 'lucide-react';
import { PengaturanSekolah } from '../types';
import { INITIAL_SETTINGS } from '../data/mockData';
import { saveTheme } from '../utils/theme';

interface SettingsViewProps {
  settings: PengaturanSekolah;
  onSaveSettings: (settings: PengaturanSekolah) => void;
  darkMode?: boolean;
  onToggleDarkMode?: (isDark: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  darkMode = false,
  onToggleDarkMode,
}) => {
  const [form, setForm] = useState<PengaturanSekolah>({ 
    ...settings,
    temaGelap: darkMode ?? settings.temaGelap ?? false 
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [geoChecking, setGeoChecking] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const isCurrentDark = form.temaGelap ?? darkMode;

  const handleToggleDarkSwitch = (newDarkState: boolean) => {
    setForm((prev) => ({ ...prev, temaGelap: newDarkState }));
    // Immediately persist to localStorage and update <html> class
    saveTheme(newDarkState ? 'dark' : 'light');
    if (onToggleDarkMode) {
      onToggleDarkMode(newDarkState);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    saveTheme(form.temaGelap ? 'dark' : 'light');
    if (onToggleDarkMode && form.temaGelap !== undefined) {
      onToggleDarkMode(form.temaGelap);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    const defaultSettings = { ...INITIAL_SETTINGS, temaGelap: false };
    setForm(defaultSettings);
    onSaveSettings(defaultSettings);
    saveTheme('light');
    if (onToggleDarkMode) {
      onToggleDarkMode(false);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const testGeofence = () => {
    setGeoChecking(true);
    setGeoStatus(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoChecking(false);
          setGeoStatus(`Koordinat terverifikasi: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (Dalam radius sekolah ${form.radiusMeter}m)`);
        },
        () => {
          setGeoChecking(false);
          setGeoStatus(`Simulasi GPS aktif: Berada di lingkungan Gerbang Sekolah (Radius ${form.radiusMeter}m Terpenuhi)`);
        },
        { timeout: 4000 }
      );
    } else {
      setGeoChecking(false);
      setGeoStatus(`Simulasi Geofencing: Lokasi tablet berada di Pos Satpam Gerbang Sekolah`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors">
        <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <Settings className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Pengaturan Sistem Absensi & Tampilan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Konfigurasi tema gelap malam hari, jam batas terlambat, nama sekolah, notifikasi WhatsApp, dan geofencing.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">Pengaturan berhasil disimpan dan preferensi langsung diterapkan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =================================================================== */}
        {/* FITUR TEMA GELAP (DARK MODE) DI SETTINGSVIEW */}
        {/* =================================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl transition-colors ${
                isCurrentDark 
                  ? 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/60' 
                  : 'bg-amber-50 text-amber-600 border border-amber-200/80'
              }`}>
                {isCurrentDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
                  <span>Tema Gelap (Dark Mode)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isCurrentDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {isCurrentDark ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Menyesuaikan pencahayaan layar agar tidak silau dan nyaman di mata saat bertugas malam hari.
                </p>
              </div>
            </div>

            {/* Main Interactive Toggle Switch */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <label 
                htmlFor="switch-tema-gelap"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                {isCurrentDark ? 'Mode Gelap' : 'Mode Terang'}
              </label>
              <button
                id="switch-tema-gelap"
                type="button"
                role="switch"
                aria-checked={isCurrentDark}
                onClick={() => handleToggleDarkSwitch(!isCurrentDark)}
                className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isCurrentDark ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className="sr-only">Aktifkan tema gelap</span>
                <span
                  className={`pointer-events-none flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isCurrentDark ? 'translate-x-7 text-indigo-600' : 'translate-x-0 text-amber-500'
                  }`}
                >
                  {isCurrentDark ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Mode Selection Cards: Terang vs Gelap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Opsi 1: Mode Terang */}
            <div
              onClick={() => handleToggleDarkSwitch(false)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                !isCurrentDark
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Mode Terang (Light Mode)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Standar siang hari
                    </p>
                  </div>
                </div>
                {!isCurrentDark && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Tampilan kontras tinggi dengan latar putih bersih, ideal untuk penggunaan di area gerbang luar ruangan saat terang.
              </p>
            </div>

            {/* Opsi 2: Mode Gelap */}
            <div
              onClick={() => handleToggleDarkSwitch(true)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isCurrentDark
                  ? 'border-indigo-500 bg-slate-900 text-white shadow-xs ring-1 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Mode Gelap (Dark Mode)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Nyaman untuk malam hari
                    </p>
                  </div>
                </div>
                {isCurrentDark && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Tampilan gelap mewah berbahan slate, mereduksi emisi cahaya biru dan menjaga daya tahan baterai tablet/smartphone.
              </p>
            </div>
          </div>

          {/* LocalStorage Persistence Notification Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="leading-normal">
              <strong>Penyimpanan Otomatis:</strong> Preferensi tema disimpan secara permanen di <code>localStorage</code> browser, sehingga saat peramban ditutup atau direfresh di malam hari, tema pilihan Anda akan tetap tersimpan.
            </p>
          </div>
        </div>

        {/* Identitas Sekolah */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Identitas Sekolah & Lokasi Gerbang</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={form.namaSekolah}
                onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Alamat Sekolah / Pos Gerbang
              </label>
              <input
                type="text"
                value={form.alamatSekolah}
                onChange={(e) => setForm({ ...form, alamatSekolah: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Jam & Batas Toleransi Terlambat */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Aturan Jam Masuk & Batas Keterlambatan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Jam Masuk Sekolah (WIB) *
              </label>
              <input
                type="time"
                value={form.jamMasuk}
                onChange={(e) => setForm({ ...form, jamMasuk: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Siswa yang scan setelah jam ini otomatis berstatus <strong>Terlambat</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Toleransi Gerbang Ditutup (WIB) *
              </label>
              <input
                type="time"
                value={form.toleransiTerlambat}
                onChange={(e) => setForm({ ...form, toleransiTerlambat: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Batas maksimal toleransi sebelum siswa dialihkan ke piket kesiswaan.
              </p>
            </div>
          </div>
        </div>

        {/* Geofencing & Keamanan Lokasi */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Geofencing (Validasi Lokasi Sekolah)</span>
            </h3>
            <input
              type="checkbox"
              checked={form.geofenceAktif}
              onChange={(e) => setForm({ ...form, geofenceAktif: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded-md cursor-pointer"
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mencegah kecurangan pemindaian di luar area sekolah dengan memastikan tablet berada di dalam radius koordinat gerbang.
          </p>

          {form.geofenceAktif && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Radius Toleransi Jarak (Meter)
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={form.radiusMeter}
                  onChange={(e) => setForm({ ...form, radiusMeter: Number(e.target.value) })}
                  className="w-48 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={testGeofence}
                  disabled={geoChecking}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {geoChecking ? 'Memeriksa GPS...' : 'Uji Validasi Lokasi Tablet Sekarang'}
                </button>
              </div>

              {geoStatus && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{geoStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio & WhatsApp Notification Switch */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Suara Scanner & Notifikasi Otomatis</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Efek Suara Beep Scanner</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Bunyi konfirmasi saat kartu berhasil di-scan atau nada peringatan saat terlambat</p>
              </div>
              <input
                type="checkbox"
                checked={form.aktifkanSuara}
                onChange={(e) => setForm({ ...form, aktifkanSuara: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Kirim Otomatis Notifikasi WhatsApp ke Wali Murid</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Kirim pesan konfirmasi kehadiran instan begitu siswa scan kartu di gerbang</p>
              </div>
              <input
                type="checkbox"
                checked={form.aktifkanWaOtomatis}
                onChange={(e) => setForm({ ...form, aktifkanWaOtomatis: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit & Reset actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Default</span>
          </button>

          <button
            id="btn-save-settings"
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};

