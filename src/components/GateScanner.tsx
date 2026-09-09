import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  UserCheck, 
  Clock, 
  Send, 
  Search, 
  RefreshCw,
  Zap,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Siswa, CatatanPresensi, PetugasJaga, PengaturanSekolah, StatusKehadiran } from '../types';
import { soundManager } from '../utils/audio';
import { calculateAttendanceStatus, formatTimeNow, createWaMessage } from '../utils/storage';

interface GateScannerProps {
  students: Siswa[];
  todayAttendance: CatatanPresensi[];
  onRecordAttendance: (record: CatatanPresensi, waMessage?: string) => void;
  activeGuard: PetugasJaga;
  settings: PengaturanSekolah;
  onNavigateToManual: () => void;
}

export const GateScanner: React.FC<GateScannerProps> = ({
  students,
  todayAttendance,
  onRecordAttendance,
  activeGuard,
  settings,
  onNavigateToManual,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  
  // Last scanned student verification feedback
  const [lastScannedResult, setLastScannedResult] = useState<{
    student: Siswa;
    record: CatatanPresensi;
    status: StatusKehadiran;
    isDuplicate: boolean;
  } | null>(null);

  const [scanNotice, setScanNotice] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isStartingRef = useRef<boolean>(false);
  const scannerContainerId = 'qr-gate-reader-view';

  // Process a decoded QR string or manual student ID
  const handleProcessScan = useCallback((decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const cleanCode = decodedText.trim();
    // Search student by qrCodeData, nisn, or id
    const foundStudent = students.find(
      (s) => s.qrCodeData.toLowerCase() === cleanCode.toLowerCase() ||
             s.nisn === cleanCode ||
             s.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (!foundStudent) {
      soundManager.playErrorBuzz();
      setScanNotice({
        type: 'error',
        message: `Kartu QR "${cleanCode}" tidak terdaftar dalam database siswa sekolah.`,
      });
      setTimeout(() => {
        setIsProcessing(false);
        setScanNotice(null);
      }, 3000);
      return;
    }

    // Check if already scanned today
    const alreadyAttended = todayAttendance.find(
      (r) => r.siswaId === foundStudent.id
    );

    const timeStr = formatTimeNow();
    const status = calculateAttendanceStatus(timeStr, settings);

    if (alreadyAttended) {
      soundManager.playErrorBuzz();
      setLastScannedResult({
        student: foundStudent,
        record: alreadyAttended,
        status: alreadyAttended.status,
        isDuplicate: true,
      });
      setScanNotice({
        type: 'warn',
        message: `${foundStudent.nama} sudah tercatat presensi hari ini pada ${alreadyAttended.jam} WIB!`,
      });
      setTimeout(() => {
        setIsProcessing(false);
      }, 3500);
      return;
    }

    // New attendance record
    const now = new Date();
    const newRecord: CatatanPresensi = {
      id: `pres-${Date.now()}`,
      siswaId: foundStudent.id,
      nisn: foundStudent.nisn,
      nama: foundStudent.nama,
      kelas: foundStudent.kelas,
      jurusan: foundStudent.jurusan,
      waktu: now.toISOString(),
      jam: timeStr,
      tanggal: now.toISOString().split('T')[0],
      status: status,
      metode: 'SCAN_QR',
      petugas: `${activeGuard.nama} (${activeGuard.peran})`,
      waTerkirim: settings.aktifkanWaOtomatis,
      waTerkirimPada: settings.aktifkanWaOtomatis ? timeStr : undefined,
    };

    // Sound feedback
    if (status === 'HADIR') {
      soundManager.playSuccessBeep();
    } else {
      soundManager.playLateTone();
    }

    const waMsg = settings.aktifkanWaOtomatis
      ? createWaMessage(foundStudent, status, timeStr, settings.namaSekolah)
      : undefined;

    onRecordAttendance(newRecord, waMsg);

    setLastScannedResult({
      student: foundStudent,
      record: newRecord,
      status: status,
      isDuplicate: false,
    });

    setScanNotice({
      type: status === 'HADIR' ? 'success' : 'warn',
      message: `Presensi ${foundStudent.nama} berhasil dicatat (${status === 'HADIR' ? 'Tepat Waktu' : 'Terlambat'}).`,
    });

    // Reset processing lock after short cooldown
    setTimeout(() => {
      setIsProcessing(false);
    }, 2500);
  }, [students, todayAttendance, settings, isProcessing, activeGuard, onRecordAttendance]);

  // Safely stop all active video tracks and pause video element
  const releaseMediaTracks = useCallback(() => {
    try {
      const container = document.getElementById(scannerContainerId);
      const videoEl = container?.querySelector('video');
      if (videoEl) {
        // Explicitly neutralize onabort and onerror to prevent html5-qrcode from throwing
        videoEl.onabort = null;
        videoEl.onerror = null;
        try {
          videoEl.pause();
        } catch {
          // ignore
        }
        if (videoEl.srcObject) {
          const stream = videoEl.srcObject as MediaStream;
          if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach((track) => {
              try {
                track.stop();
              } catch {
                // ignore
              }
            });
          }
          videoEl.srcObject = null;
        }
      }
    } catch {
      // ignore
    }
  }, [scannerContainerId]);

  // Start HTML5 camera scanner
  const startScanner = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraError(null);

    try {
      if (html5QrCodeRef.current) {
        releaseMediaTracks();
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          html5QrCodeRef.current.clear();
        } catch {
          // ignore
        }
        html5QrCodeRef.current = null;
      }

      const qrScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleProcessScan(decodedText);
        },
        () => {
          // Frame scan error (normal during searching)
        }
      );

      // Neutralize any throwing onabort on the active video element
      const activeVideo = document.getElementById(scannerContainerId)?.querySelector('video');
      if (activeVideo) {
        activeVideo.onabort = null;
      }

      // If component unmounted while waiting for camera permission/start
      if (!isMountedRef.current) {
        releaseMediaTracks();
        try {
          if (qrScanner.isScanning) {
            await qrScanner.stop();
          }
          qrScanner.clear();
        } catch {
          // ignore
        }
        html5QrCodeRef.current = null;
        isStartingRef.current = false;
        return;
      }

      setCameraActive(true);
    } catch (err: unknown) {
      releaseMediaTracks();
      console.warn('Camera start issue:', err);
      const errMsg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses';
      if (isMountedRef.current) {
        setCameraError(
          errMsg.includes('Permission') 
            ? 'Izin kamera belum diberikan. Harap aktifkan izin kamera pada browser Anda.' 
            : 'Kamera fisik tidak terdeteksi atau sedang digunakan aplikasi lain. Anda dapat menggunakan simulator scan cepat atau input kode di bawah.'
        );
        setCameraActive(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [handleProcessScan, releaseMediaTracks, scannerContainerId]);

  const stopScanner = useCallback(async () => {
    isStartingRef.current = false;
    const container = document.getElementById(scannerContainerId);
    const videoEl = container?.querySelector('video');
    if (videoEl) {
      videoEl.onabort = null;
      videoEl.onerror = null;
    }
    releaseMediaTracks();

    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  }, [releaseMediaTracks, scannerContainerId]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    // Observe scanner container to neutralize html5-qrcode's throwing video.onabort
    const container = document.getElementById(scannerContainerId);
    let observer: MutationObserver | null = null;
    if (container) {
      observer = new MutationObserver(() => {
        const video = container.querySelector('video');
        if (video && video.onabort) {
          video.onabort = null;
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      isMountedRef.current = false;
      isStartingRef.current = false;
      if (observer) {
        observer.disconnect();
      }
      const cont = document.getElementById(scannerContainerId);
      const video = cont?.querySelector('video');
      if (video) {
        video.onabort = null;
        video.onerror = null;
      }
      releaseMediaTracks();
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          html5QrCodeRef.current.clear();
        } catch {
          // ignore
        }
        html5QrCodeRef.current = null;
      }
    };
  }, [releaseMediaTracks, scannerContainerId]);

  // Quick test scan with a specific student
  const handleQuickTestScan = (student: Siswa) => {
    handleProcessScan(student.qrCodeData);
  };

  // Handle manual code input form (supports USB barcode gun)
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleProcessScan(manualCodeInput.trim());
    setManualCodeInput('');
  };

  // Recent attendance list today
  const recentAttendances = [...todayAttendance].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner: Gate Status & Info */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Gerbang Kedatangan Siswa (Tablet Scanner)
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Online
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Arahkan kartu QR siswa ke kamera. Sistem memverifikasi foto, kelas, jam tiba, dan mengirim pesan WhatsApp ke orang tua.
            </p>
          </div>
        </div>

        {/* Quick action button for fallback */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="btn-quick-manual-fallback"
            onClick={onNavigateToManual}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
            <span>Form Absen Manual</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Scanner, Right Instant Verification Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
            {/* Header in Camera card */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cameraActive ? 'bg-emerald-400 opacity-75' : 'bg-slate-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${cameraActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {cameraActive ? 'Kamera Gerbang Aktif' : 'Kamera Nonaktif'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {cameraActive ? (
                  <button
                    id="btn-stop-camera"
                    onClick={stopScanner}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Matikan Kamera</span>
                  </button>
                ) : (
                  <button
                    id="btn-start-camera"
                    onClick={startScanner}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Aktifkan Kamera Tablet</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport Container */}
            <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl bg-black/60 overflow-hidden flex items-center justify-center border border-slate-700/50">
              {/* html5-qrcode target div */}
              <div 
                id={scannerContainerId} 
                className={`w-full h-full flex items-center justify-center ${!cameraActive ? 'hidden' : ''}`} 
              />

              {/* Laser Scanning Animation Overlay when active */}
              {cameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-64 h-64 border-2 border-dashed border-indigo-400/60 rounded-2xl relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-md"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-md"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-md"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-md"></div>
                    
                    {/* Glowing scanning laser bar */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scan-laser"></div>
                  </div>
                </div>
              )}

              {/* Placeholder state when camera is inactive */}
              {!cameraActive && (
                <div className="text-center p-6 max-w-sm">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Kamera Tablet Belum Dijalankan
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Tekan tombol di bawah untuk membuka kamera tablet dan memindai QR code kartu siswa.
                  </p>
                  <button
                    id="btn-start-camera-center"
                    onClick={startScanner}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Mulai Pindai QR</span>
                  </button>
                </div>
              )}

              {/* Error message banner if camera permission denied */}
              {cameraError && (
                <div className="absolute bottom-4 inset-x-4 p-3 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2 backdrop-blur-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-300">Catatan Akses Kamera:</p>
                    <p>{cameraError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Manual input / Barcode gun listener */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <form onSubmit={handleManualCodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    id="input-manual-barcode"
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Scan via Barcode Scanner USB atau ketik NISN/ID (contoh: SISWA-0061234501)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  id="btn-submit-barcode"
                  type="submit"
                  disabled={!manualCodeInput.trim() || isProcessing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Proses</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Simulator Bar: Click any student card for 1-click preview & testing */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Uji Coba Scan Cepat (Simulasi Kartu Siswa)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Klik nama untuk uji coba</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {students.slice(0, 4).map((st) => {
                const isAlreadyPresent = todayAttendance.some((a) => a.siswaId === st.id);
                return (
                  <button
                    key={st.id}
                    id={`btn-quick-test-${st.id}`}
                    onClick={() => handleQuickTestScan(st)}
                    disabled={isProcessing}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isAlreadyPresent 
                        ? 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100' 
                        : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <img 
                        src={st.fotoUrl} 
                        alt={st.nama}
                        className="w-7 h-7 rounded-full object-cover border border-indigo-200 shrink-0" 
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">{st.nama.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-500 truncate">{st.kelas}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-500">{st.nisn.slice(-4)}</span>
                      {isAlreadyPresent ? (
                        <span className="text-emerald-600 font-bold">Sudah</span>
                      ) : (
                        <span className="text-indigo-600 font-semibold">+ Scan</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Instant Scanned Verification Card & Live Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Notification Feedback Toast */}
          {scanNotice && (
            <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-3 transition-all ${
              scanNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : scanNotice.type === 'warn'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {scanNotice.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {scanNotice.type === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
              {scanNotice.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              <span className="flex-1">{scanNotice.message}</span>
            </div>
          )}

          {/* Student Verification Profile Box (Pop-up Card) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hasil Verifikasi Siswa di Gerbang
              </span>
              {lastScannedResult && (
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lastScannedResult.record.jam} WIB</span>
                </span>
              )}
            </div>

            {lastScannedResult ? (
              <div className="space-y-4">
                {/* Photo and Status header */}
                <div className="flex items-start gap-4">
                  <img
                    src={lastScannedResult.student.fotoUrl}
                    alt={lastScannedResult.student.nama}
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      {lastScannedResult.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Sudah Absen Hari Ini
                        </span>
                      ) : lastScannedResult.status === 'HADIR' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Hadir Tepat Waktu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Terlambat Masuk
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                      {lastScannedResult.student.nama}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      {lastScannedResult.student.kelas}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastScannedResult.student.jurusan}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      NISN: {lastScannedResult.student.nisn}
                    </p>
                  </div>
                </div>

                {/* Verification details grid */}
                <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-2 border border-slate-100">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Petugas Pemeriksa:</span>
                    <span className="font-semibold text-slate-800">{lastScannedResult.record.petugas}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Metode:</span>
                    <span className="font-semibold text-slate-800">
                      {lastScannedResult.record.metode === 'SCAN_QR' ? 'Scan Kartu QR Gerbang' : 'Absensi Manual'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Notifikasi Orang Tua:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      <span>{settings.aktifkanWaOtomatis ? 'Terkirim WhatsApp' : 'Nonaktif'}</span>
                    </span>
                  </div>
                </div>

                {/* WhatsApp notification summary preview */}
                {settings.aktifkanWaOtomatis && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900">
                    <p className="font-bold flex items-center gap-1 mb-1 text-emerald-800">
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      Status Notifikasi WhatsApp Terkirim ke:
                    </p>
                    <p className="text-slate-700">
                      <strong>{lastScannedResult.student.namaOrtu}</strong> ({lastScannedResult.student.noHpOrtu})
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <UserCheck className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  Menunggu Kartu Siswa...
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Tempelkan kartu QR siswa pada kamera atau gunakan tombol simulasi kartu untuk melihat verifikasi instan.
                </p>
              </div>
            )}
          </div>

          {/* Today's Real-time Gate Log */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>Aktivitas Masuk Hari Ini</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
                  {todayAttendance.length}
                </span>
              </h3>
            </div>

            {recentAttendances.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Belum ada siswa yang masuk gerbang hari ini.
              </p>
            ) : (
              <div className="space-y-2">
                {recentAttendances.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        rec.status === 'HADIR' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">{rec.nama}</p>
                        <p className="text-[10px] text-slate-500 truncate">{rec.kelas} &bull; {rec.jam} WIB</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      rec.status === 'HADIR'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rec.status === 'HADIR' ? 'Tepat Waktu' : 'Terlambat'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
