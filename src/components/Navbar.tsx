import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  UserCheck, 
  FileSpreadsheet, 
  CreditCard, 
  MessageSquareText, 
  Settings, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Clock, 
  School,
  Sparkles,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { PetugasJaga, PengaturanSekolah } from '../types';

interface NavbarProps {
  activeTab: 'scan' | 'manual' | 'cards' | 'recap' | 'wa' | 'settings';
  setActiveTab: (tab: 'scan' | 'manual' | 'cards' | 'recap' | 'wa' | 'settings') => void;
  activeGuard: PetugasJaga;
  onOpenGuardModal: () => void;
  settings: PengaturanSekolah;
  soundEnabled: boolean;
  onToggleSound: () => void;
  todayCount?: number;
  totalStudents?: number;
  onTimeCount?: number;
  lateCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeGuard,
  onOpenGuardModal,
  settings,
  soundEnabled,
  onToggleSound,
  todayCount = 0,
  totalStudents = 12,
  onTimeCount = 0,
  lateCount = 0,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Calculate greeting
  const hour = time.getHours();
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

  return (
    <header className="no-print bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top App Bar (E-Wallet Style Header) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black shrink-0 border border-indigo-400/30">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-indigo-300">
                  {greeting}, Petugas
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-medium">
                  Online
                </span>
              </div>
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight line-clamp-1">
                {settings.namaSekolah}
              </h1>
            </div>
          </div>

          {/* Right Controls: Clock, Guard Officer, Sound Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div className="hidden md:flex flex-col items-end px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formattedTime} WIB</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {formattedDate}
              </span>
            </div>

            {/* Active Guard Officer Button */}
            <button
              id="btn-guard-officer"
              type="button"
              onClick={onOpenGuardModal}
              className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer group"
              title="Ganti Petugas Jaga Gerbang"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  {activeGuard.peran}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                  {activeGuard.nama.split(' ')[0]}
                </div>
              </div>
            </button>

            {/* Audio Toggle */}
            <button
              id="btn-toggle-sound"
              type="button"
              onClick={onToggleSound}
              className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
              title={soundEnabled ? 'Suara Scanner Aktif' : 'Suara Scanner Mute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* E-WALLET "DOMPET PRESENSI GERBANG" CARD */}
        <div className="mt-3.5 bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-700/80 shadow-lg relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-indigo-300">
                  Status Presensi Hari Ini
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Gerbang Dibuka
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {todayCount}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">
                  / {totalStudents} Siswa Tiba
                </span>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <div className="text-[9px] uppercase font-bold text-emerald-400">Tepat Waktu</div>
                <div className="text-sm font-black">{onTimeCount} Siswa</div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <div className="text-[9px] uppercase font-bold text-amber-400">Terlambat</div>
                <div className="text-sm font-black">{lateCount} Siswa</div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Like E-Wallet Pay, Transfer, History buttons) */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-slate-700/60 text-center">
            {/* Action 1: Scan QR */}
            <button
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`flex flex-col items-center group cursor-pointer ${
                activeTab === 'scan' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'scan'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400'
                  : 'bg-slate-800/90 text-indigo-300 group-hover:bg-slate-700'
              }`}>
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold mt-1 truncate max-w-full">
                Scan QR
              </span>
            </button>

            {/* Action 2: Manual */}
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex flex-col items-center group cursor-pointer ${
                activeTab === 'manual' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'manual'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400'
                  : 'bg-slate-800/90 text-indigo-300 group-hover:bg-slate-700'
              }`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold mt-1 truncate max-w-full">
                Manual
              </span>
            </button>

            {/* Action 3: Cari Siswa */}
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`flex flex-col items-center group cursor-pointer ${
                activeTab === 'cards' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'cards'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400'
                  : 'bg-slate-800/90 text-indigo-300 group-hover:bg-slate-700'
              }`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold mt-1 truncate max-w-full">
                Cari Siswa
              </span>
            </button>

            {/* Action 4: Rekap */}
            <button
              type="button"
              onClick={() => setActiveTab('recap')}
              className={`flex flex-col items-center group cursor-pointer ${
                activeTab === 'recap' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'recap'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400'
                  : 'bg-slate-800/90 text-indigo-300 group-hover:bg-slate-700'
              }`}>
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold mt-1 truncate max-w-full">
                Rekap
              </span>
            </button>

            {/* Action 5: WA / Settings */}
            <button
              type="button"
              onClick={() => setActiveTab('wa')}
              className={`flex flex-col items-center group cursor-pointer ${
                activeTab === 'wa' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'wa'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400'
                  : 'bg-slate-800/90 text-indigo-300 group-hover:bg-slate-700'
              }`}>
                <MessageSquareText className="w-5 h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold mt-1 truncate max-w-full">
                Log WA
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
