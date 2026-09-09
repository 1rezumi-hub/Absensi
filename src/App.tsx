import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GateScanner } from './components/GateScanner';
import { ManualAttendanceView } from './components/ManualAttendanceView';
import { StudentCardsView } from './components/StudentCardsView';
import { AttendanceRecapView } from './components/AttendanceRecapView';
import { WhatsAppLogsView } from './components/WhatsAppLogsView';
import { SettingsView } from './components/SettingsView';
import { GuardOfficerModal } from './components/GuardOfficerModal';
import { BottomNavBar } from './components/BottomNavBar';
import { 
  Siswa, 
  CatatanPresensi, 
  PetugasJaga, 
  PengaturanSekolah, 
  NotifikasiWA 
} from './types';
import { 
  getStoredStudents, 
  saveStudents, 
  getStoredAttendance, 
  saveAttendance, 
  getStoredActiveGuard, 
  saveActiveGuard, 
  getStoredSettings, 
  saveSettings, 
  getStoredWaLogs, 
  saveWaLogs,
  getTodayDateString
} from './utils/storage';
import { soundManager } from './utils/audio';
import { getStoredTheme, saveTheme, applyThemeToDocument, ThemeMode } from './utils/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'cards' | 'recap' | 'wa' | 'settings'>('scan');
  const [students, setStudents] = useState<Siswa[]>(getStoredStudents);
  const [attendance, setAttendance] = useState<CatatanPresensi[]>(getStoredAttendance);
  const [activeGuard, setActiveGuard] = useState<PetugasJaga>(getStoredActiveGuard);
  const [settings, setSettings] = useState<PengaturanSekolah>(getStoredSettings);
  const [waLogs, setWaLogs] = useState<NotifikasiWA[]>(getStoredWaLogs);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGuardModalOpen, setIsGuardModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  // Apply theme to document on mount and whenever theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Sync sound settings
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleToggleDarkMode = (isDark: boolean) => {
    const newTheme: ThemeMode = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
    const updatedSettings = { ...settings, temaGelap: isDark };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  // Persist state updates
  const handleRecordAttendance = (record: CatatanPresensi, waMessage?: string) => {
    const updatedAttendance = [record, ...attendance];
    setAttendance(updatedAttendance);
    saveAttendance(updatedAttendance);

    // If WhatsApp notification message is generated
    if (waMessage) {
      const targetStudent = students.find((s) => s.id === record.siswaId);
      const newWaLog: NotifikasiWA = {
        id: `wa-${Date.now()}`,
        presensiId: record.id,
        namaSiswa: record.nama,
        namaOrtu: targetStudent?.namaOrtu || 'Wali Murid',
        noHp: targetStudent?.noHpOrtu || '0812XXXXXXXX',
        pesan: waMessage,
        waktuKirim: record.jam,
        status: 'TERKIRIM',
      };
      const updatedWaLogs = [newWaLog, ...waLogs];
      setWaLogs(updatedWaLogs);
      saveWaLogs(updatedWaLogs);
    }
  };

  const handleAddStudent = (newStudent: Siswa) => {
    const updated = [newStudent, ...students];
    setStudents(updated);
    saveStudents(updated);
  };

  const handleSaveSettings = (newSettings: PengaturanSekolah) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setSoundEnabled(newSettings.aktifkanSuara);
    if (newSettings.temaGelap !== undefined) {
      const newTheme: ThemeMode = newSettings.temaGelap ? 'dark' : 'light';
      setTheme(newTheme);
      saveTheme(newTheme);
    }
  };

  const handleSelectGuard = (guard: PetugasJaga) => {
    setActiveGuard(guard);
    saveActiveGuard(guard);
  };

  const todayStr = getTodayDateString();
  const todayRecords = attendance.filter((a) => a.tanggal === todayStr);
  const onTimeCount = todayRecords.filter((r) => r.status === 'HADIR').length;
  const lateCount = todayRecords.filter((r) => r.status === 'TERLAMBAT').length;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Navigation / E-Wallet Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeGuard={activeGuard}
        onOpenGuardModal={() => setIsGuardModalOpen(true)}
        settings={settings}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        todayCount={todayRecords.length}
        totalStudents={students.length}
        onTimeCount={onTimeCount}
        lateCount={lateCount}
      />

      {/* Main View Area with generous bottom padding for E-Wallet Bottom Bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-28 sm:pb-32">
        {activeTab === 'scan' && (
          <GateScanner
            students={students}
            todayAttendance={todayRecords}
            onRecordAttendance={handleRecordAttendance}
            activeGuard={activeGuard}
            settings={settings}
            onNavigateToManual={() => setActiveTab('manual')}
          />
        )}

        {activeTab === 'manual' && (
          <ManualAttendanceView
            students={students}
            todayAttendance={todayRecords}
            onRecordAttendance={handleRecordAttendance}
            activeGuard={activeGuard}
            settings={settings}
            onNavigateToScan={() => setActiveTab('scan')}
          />
        )}

        {activeTab === 'cards' && (
          <StudentCardsView
            students={students}
            onAddStudent={handleAddStudent}
            settings={settings}
          />
        )}

        {activeTab === 'recap' && (
          <AttendanceRecapView
            students={students}
            attendanceRecords={attendance}
            settings={settings}
          />
        )}

        {activeTab === 'wa' && (
          <WhatsAppLogsView logs={waLogs} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            darkMode={theme === 'dark'}
            onToggleDarkMode={handleToggleDarkMode}
          />
        )}
      </main>

      {/* E-Wallet Fixed Bottom Navigation Bar ("Tombol di Bawah") */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        waLogsCount={waLogs.length}
        todayCount={todayRecords.length}
      />

      {/* Modal Petugas Jaga */}
      <GuardOfficerModal
        isOpen={isGuardModalOpen}
        onClose={() => setIsGuardModalOpen(false)}
        activeGuard={activeGuard}
        onSelectGuard={handleSelectGuard}
      />
    </div>
  );
}
