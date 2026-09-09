import React from 'react';
import { 
  QrCode, 
  UserCheck, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  MessageSquareText 
} from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'scan' | 'manual' | 'cards' | 'recap' | 'wa' | 'settings';
  setActiveTab: (tab: 'scan' | 'manual' | 'cards' | 'recap' | 'wa' | 'settings') => void;
  waLogsCount?: number;
  todayCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  waLogsCount = 0,
  todayCount = 0,
}) => {
  return (
    <nav 
      aria-label="Navigasi Bawah E-Wallet"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.45)] no-print pb-safe transition-colors"
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Tab 1: Absen Manual */}
          <button
            id="bottom-tab-manual"
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
              activeTab === 'manual'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all ${
              activeTab === 'manual' ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 scale-105' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
            }`}>
              <UserCheck className="w-5 h-5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">
              Manual
            </span>
          </button>

          {/* Tab 2: Data Siswa (Cari & Filter) */}
          <button
            id="bottom-tab-cards"
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
              activeTab === 'cards'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all ${
              activeTab === 'cards' ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 scale-105' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
            }`}>
              <Users className="w-5 h-5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">
              Data Siswa
            </span>
          </button>

          {/* Tab 3 (CENTER HIGHLIGHT): Scan QR Gerbang (E-Wallet Pay Style) */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-5">
            <button
              id="bottom-tab-scan"
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 text-white ring-4 ring-indigo-200/80 dark:ring-indigo-900/60 shadow-indigo-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-slate-900/30 ring-4 ring-white dark:ring-slate-900'
              }`}
              title="Buka Scanner QR Gerbang"
            >
              <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <span className={`text-[10px] sm:text-[11px] mt-1 font-bold ${
              activeTab === 'scan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
            }`}>
              Scan QR
            </span>
          </div>

          {/* Tab 4: Rekap Kehadiran */}
          <button
            id="bottom-tab-recap"
            type="button"
            onClick={() => setActiveTab('recap')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
              activeTab === 'recap'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all ${
              activeTab === 'recap' ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 scale-105' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
            }`}>
              <FileSpreadsheet className="w-5 h-5 sm:w-5 sm:h-5" />
              {todayCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[9px] font-extrabold rounded-full">
                  {todayCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">
              Rekap
            </span>
          </button>

          {/* Tab 5: Pengaturan / WA */}
          <button
            id="bottom-tab-settings"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
              activeTab === 'settings' || activeTab === 'wa'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all ${
              activeTab === 'settings' || activeTab === 'wa' ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 scale-105' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
            }`}>
              <Settings className="w-5 h-5 sm:w-5 sm:h-5" />
              {waLogsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">
              Pengaturan
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
