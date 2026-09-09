import React, { useState } from 'react';
import { 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Search, 
  User, 
  Layers, 
  GraduationCap
} from 'lucide-react';
import { Siswa, CatatanPresensi, PetugasJaga, PengaturanSekolah, StatusKehadiran } from '../types';
import { soundManager } from '../utils/audio';
import { calculateAttendanceStatus, formatTimeNow, createWaMessage } from '../utils/storage';

interface ManualAttendanceViewProps {
  students: Siswa[];
  todayAttendance: CatatanPresensi[];
  onRecordAttendance: (record: CatatanPresensi, waMessage?: string) => void;
  activeGuard: PetugasJaga;
  settings: PengaturanSekolah;
  onNavigateToScan: () => void;
}

const COMMON_JURUSAN = [
  'RPL (Rekayasa Perangkat Lunak)',
  'TKJ (Teknik Komputer & Jaringan)',
  'DKV (Desain Komunikasi Visual)',
  'AKL (Akuntansi & Keuangan Lembaga)',
  'OTKP (Otomatisasi & Tata Kelola Perkantoran)',
  'TKR (Teknik Kendaraan Ringan)',
  'TPM (Teknik Permesinan)',
  'IPA / MIPA',
  'IPS / IIS',
  'Lainnya / Lain-lain'
];

const COMMON_REASONS = [
  'Kartu Pelajar Tertinggal di Rumah',
  'Kartu Pelajar Rusak / Patah / Retak',
  'QR Code Tidak Terbaca Kamera',
  'Kartu Hilang (Proses Buat Baru)',
  'Lupa Membawa Kalung Kartu Siswa',
  'Siswa Pindahan / Belum Mendapat Kartu'
];

export const ManualAttendanceView: React.FC<ManualAttendanceViewProps> = ({
  students,
  todayAttendance,
  onRecordAttendance,
  activeGuard,
  settings,
  onNavigateToScan,
}) => {
  const [nama, setNama] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [kelas, setKelas] = useState('');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('XII');
  const [jurusan, setJurusan] = useState(COMMON_JURUSAN[0]);
  const [status, setStatus] = useState<StatusKehadiran>('HADIR');
  const [alasan, setAlasan] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Student auto-suggestion list
  const [suggestions, setSuggestions] = useState<Siswa[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = (val: string) => {
    setNama(val);
    if (val.trim().length > 1) {
      const matches = students.filter(
        (s) => s.nama.toLowerCase().includes(val.toLowerCase()) || s.nisn.includes(val)
      );
      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectStudent = (s: Siswa) => {
    setSelectedStudentId(s.id);
    setNama(s.nama);
    setKelas(s.kelas);
    setTingkat(s.tingkat);
    setJurusan(s.jurusan);
    setNoHpOrtu(s.noHpOrtu);
    setNamaOrtu(s.namaOrtu);
    setShowSuggestions(false);

    // Auto calculate status based on current time
    const timeStr = formatTimeNow();
    const autoStatus = calculateAttendanceStatus(timeStr, settings);
    setStatus(autoStatus);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!nama.trim()) {
      setErrorNotice('Nama lengkap siswa wajib diisi!');
      return;
    }
    if (!kelas.trim()) {
      setErrorNotice('Kelas siswa wajib diisi!');
      return;
    }
    if (!jurusan.trim()) {
      setErrorNotice('Jurusan siswa wajib diisi!');
      return;
    }

    const matched = selectedStudentId 
      ? students.find(s => s.id === selectedStudentId) 
      : students.find(s => s.nama.toLowerCase() === nama.trim().toLowerCase());

    // Check if already checked in today
    if (matched) {
      const alreadyChecked = todayAttendance.find(a => a.siswaId === matched.id);
      if (alreadyChecked) {
        soundManager.playErrorBuzz();
        setErrorNotice(`${matched.nama} sudah tercatat presensi hari ini pada ${alreadyChecked.jam} WIB!`);
        return;
      }
    }

    const timeStr = formatTimeNow();
    const now = new Date();
    const studentId = matched ? matched.id : `sis-manual-${Date.now()}`;
    const nisn = matched ? matched.nisn : `MANUAL-${Date.now().toString().slice(-6)}`;

    const newRecord: CatatanPresensi = {
      id: `pres-${Date.now()}`,
      siswaId: studentId,
      nisn: nisn,
      nama: nama.trim(),
      kelas: kelas.trim(),
      jurusan: jurusan.trim(),
      waktu: now.toISOString(),
      jam: timeStr,
      tanggal: now.toISOString().split('T')[0],
      status: status,
      metode: 'MANUAL_FORM',
      alasanManual: alasan.trim() || 'Absensi manual oleh petugas gerbang',
      petugas: `${activeGuard.nama} (${activeGuard.peran})`,
      waTerkirim: sendWhatsApp && settings.aktifkanWaOtomatis,
      waTerkirimPada: sendWhatsApp && settings.aktifkanWaOtomatis ? timeStr : undefined,
    };

    if (status === 'HADIR') {
      soundManager.playSuccessBeep();
    } else {
      soundManager.playLateTone();
    }

    let waMessage: string | undefined;
    if (sendWhatsApp && settings.aktifkanWaOtomatis) {
      const dummyStudent: Siswa = matched || {
        id: studentId,
        nisn: nisn,
        nama: nama.trim(),
        kelas: kelas.trim(),
        tingkat: tingkat,
        jurusan: jurusan.trim(),
        jenisKelamin: 'L',
        fotoUrl: '',
        noHpOrtu: noHpOrtu || '0812XXXXXXXX',
        namaOrtu: namaOrtu || 'Wali Murid',
        qrCodeData: `SISWA-${nisn}`,
      };
      waMessage = createWaMessage(dummyStudent, status, timeStr, settings.namaSekolah);
    }

    onRecordAttendance(newRecord, waMessage);

    setSuccessNotice(`Presensi manual atas nama "${nama.trim()}" (${kelas.trim()}) berhasil disimpan!`);

    // Reset form
    setNama('');
    setSelectedStudentId(null);
    setKelas('');
    setAlasan('');
    setNoHpOrtu('');
    setNamaOrtu('');

    // Clear notice after 5 seconds
    setTimeout(() => {
      setSuccessNotice(null);
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Card Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Formulir Absensi Manual Gerbang
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gunakan formulir ini jika siswa tidak membawa kartu, kartu rusak/patah, atau kendala scan pada kamera tablet.
          </p>
        </div>

        <button
          onClick={onNavigateToScan}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-200 shrink-0"
        >
          &larr; Kembali ke Scanner
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {successNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1 font-medium">{successNotice}</div>
          </div>
        )}

        {errorNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1 font-medium">{errorNotice}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1: Nama Lengkap Siswa with Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Nama Lengkap Siswa *</span>
            </label>
            <div className="relative">
              <input
                id="input-manual-nama"
                type="text"
                value={nama}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Ketik nama siswa atau NISN (misal: Muhammad Faiz / 0061234501)..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 z-20 max-h-56 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  Pilih Siswa dari Database Sekolah:
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.fotoUrl}
                        alt={s.nama}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{s.nama}</p>
                        <p className="text-[11px] text-slate-500">{s.kelas} &bull; NISN: {s.nisn}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Field 2 & 3: Kelas & Jurusan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tingkat & Kelas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kelas / Rombel *</span>
              </label>
              <div className="flex gap-2">
                <select
                  id="select-manual-tingkat"
                  value={tingkat}
                  onChange={(e) => setTingkat(e.target.value as 'X' | 'XI' | 'XII')}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs shrink-0"
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
                <input
                  id="input-manual-kelas"
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: XII RPL 1 / X TKJ 2"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs"
                />
              </div>
            </div>

            {/* Jurusan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Program Keahlian / Jurusan *</span>
              </label>
              <select
                id="select-manual-jurusan"
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs"
              >
                {COMMON_JURUSAN.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Field 4: Status Kehadiran */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Status Presensi Hari Ini
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { val: 'HADIR', label: 'Hadir (Tepat Waktu)', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                { val: 'TERLAMBAT', label: 'Terlambat', color: 'border-amber-500 text-amber-700 bg-amber-50' },
                { val: 'IZIN', label: 'Izin Resmi', color: 'border-blue-500 text-blue-700 bg-blue-50' },
                { val: 'SAKIT', label: 'Sakit', color: 'border-rose-500 text-rose-700 bg-rose-50' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setStatus(item.val as StatusKehadiran)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    status === item.val
                      ? `${item.color} shadow-xs ring-2 ring-indigo-500/20`
                      : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field 5: Alasan Manual */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Alasan / Keterangan Absensi Manual</span>
              <span className="text-[11px] text-slate-400 font-normal">Pilih cepat atau tulis sendiri</span>
            </label>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAlasan(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer border ${
                    alasan === r
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-medium'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              id="textarea-manual-alasan"
              rows={2}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan siswa tidak dapat scan (contoh: Kartu tertinggal di rumah, diantar orang tua)..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs"
            />
          </div>

          {/* Info Card: Guard Officer & Timestamp */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-slate-400">Petugas Pemeriksa:</span>
                <p className="font-bold text-slate-800">{activeGuard.nama} ({activeGuard.peran})</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-slate-400">Waktu Pencatatan:</span>
                <p className="font-bold text-slate-800">{formatTimeNow()} WIB (Otomatis)</p>
              </div>
            </div>
          </div>

          {/* WhatsApp toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-2.5">
              <Send className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">Kirim Pemberitahuan WhatsApp ke Orang Tua</p>
                <p className="text-[11px] text-slate-500">Notifikasi status kehadiran siswa langsung terkirim ke wali murid</p>
              </div>
            </div>
            <input
              id="checkbox-send-wa"
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-manual-attendance"
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-5 h-5" />
              <span>Simpan & Kirim Absensi Manual</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
