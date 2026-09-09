import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Send, 
  QrCode, 
  UserCheck, 
  Users,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Siswa, CatatanPresensi, PengaturanSekolah } from '../types';
import { exportAttendanceToCSV } from '../utils/export';

interface AttendanceRecapViewProps {
  students: Siswa[];
  attendanceRecords: CatatanPresensi[];
  settings: PengaturanSekolah;
}

export const AttendanceRecapView: React.FC<AttendanceRecapViewProps> = ({
  students,
  attendanceRecords,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterJurusan, setFilterJurusan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMetode, setFilterMetode] = useState('ALL');

  // Filter records based on selected date & criteria
  const dateRecords = attendanceRecords.filter((r) => r.tanggal === selectedDate);

  const filteredRecords = dateRecords.filter((r) => {
    const matchesSearch = 
      r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nisn.includes(searchTerm) ||
      r.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.jurusan.toLowerCase().includes(searchTerm.toLowerCase());

    const studentObj = students.find((s) => s.id === r.siswaId);
    const matchesKelas = filterKelas === 'ALL' || (studentObj ? studentObj.tingkat === filterKelas : r.kelas.startsWith(filterKelas));
    const matchesJurusan = filterJurusan === 'ALL' || r.jurusan.toLowerCase().includes(filterJurusan.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesMetode = filterMetode === 'ALL' || r.metode === filterMetode;

    return matchesSearch && matchesKelas && matchesJurusan && matchesStatus && matchesMetode;
  });

  // Calculate statistics for the selected date
  const totalStudents = students.length;
  const totalRecorded = dateRecords.length;
  const countTepatWaktu = dateRecords.filter((r) => r.status === 'HADIR').length;
  const countTerlambat = dateRecords.filter((r) => r.status === 'TERLAMBAT').length;
  const countIzinSakit = dateRecords.filter((r) => r.status === 'IZIN' || r.status === 'SAKIT').length;
  const countBelumHadir = Math.max(0, totalStudents - totalRecorded);

  const percentageHadir = totalStudents > 0 ? Math.round((totalRecorded / totalStudents) * 100) : 0;

  const handleExportCSV = () => {
    exportAttendanceToCSV(filteredRecords, `Presensi_${selectedDate}_${settings.namaSekolah.replace(/\s+/g, '_')}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner (Hidden on Print) */}
      <div className="no-print bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Rekapitulasi Kehadiran & Laporan Gerbang
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring waktu tiba siswa secara real-time, rekapitulasi harian/bulanan untuk wali kelas dan guru kesiswaan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel / CSV</span>
          </button>

          <button
            id="btn-print-recap"
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap (Print)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Hadir Masuk
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalRecorded}</span>
            <span className="text-xs font-semibold text-slate-500">/ {totalStudents} Siswa ({percentageHadir}%)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Tepat Waktu (&le; {settings.jamMasuk})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{countTepatWaktu}</span>
            <span className="text-xs font-semibold text-slate-400">Siswa</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Terlambat (&gt; {settings.jamMasuk})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{countTerlambat}</span>
            <span className="text-xs font-semibold text-slate-400">Siswa</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Izin / Sakit
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{countIzinSakit}</span>
            <span className="text-xs font-semibold text-slate-400">Siswa</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Belum Hadir di Gerbang
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-500">{countBelumHadir}</span>
            <span className="text-xs font-semibold text-slate-400">Siswa</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar (Hidden on Print) */}
      <div className="no-print bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-recap"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, NISN, atau kelas..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                id="input-date-recap"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none"
              />
            </div>

            {/* Filter Tingkat */}
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>

            {/* Filter Jurusan */}
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Jurusan</option>
              <option value="RPL">RPL</option>
              <option value="TKJ">TKJ</option>
              <option value="DKV">DKV</option>
              <option value="AKL">AKL</option>
              <option value="OTKP">OTKP</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
            </select>

            {/* Filter Metode */}
            <select
              value={filterMetode}
              onChange={(e) => setFilterMetode(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Metode</option>
              <option value="SCAN_QR">Scan Kartu QR</option>
              <option value="MANUAL_FORM">Absen Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Print Header Visible ONLY on Print */}
      <div className="hidden print-only text-center mb-6">
        <h2 className="text-xl font-black uppercase text-black">{settings.namaSekolah}</h2>
        <p className="text-xs text-gray-700">{settings.alamatSekolah}</p>
        <h3 className="text-sm font-bold uppercase mt-2 border-b-2 border-black pb-1">
          DAFTAR REKAPITULASI PRESENSI GERBANG TANGGAL: {selectedDate}
        </h3>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3.5">Waktu</th>
                <th className="px-4 py-3.5">Siswa</th>
                <th className="px-4 py-3.5">Kelas & Jurusan</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Metode</th>
                <th className="px-4 py-3.5">Petugas Jaga</th>
                <th className="px-4 py-3.5">Keterangan</th>
                <th className="px-4 py-3.5 text-center no-print">WA Ortu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => {
                const student = students.find((s) => s.id === rec.siswaId);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                      {rec.jam} <span className="text-[10px] text-slate-400">WIB</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {student?.fotoUrl ? (
                          <img
                            src={student.fotoUrl}
                            alt={rec.nama}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {rec.nama.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{rec.nama}</p>
                          <p className="text-[11px] font-mono text-slate-400">NISN: {rec.nisn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-indigo-600 text-xs">{rec.kelas}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{rec.jurusan}</p>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        rec.status === 'HADIR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'TERLAMBAT'
                          ? 'bg-amber-100 text-amber-800'
                          : rec.status === 'IZIN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.status === 'HADIR' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{rec.status === 'HADIR' ? 'Tepat Waktu' : rec.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        {rec.metode === 'SCAN_QR' ? (
                          <>
                            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Scan QR</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Manual</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs whitespace-nowrap">
                      {rec.petugas}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px]">
                      {rec.alasanManual || '-'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap no-print">
                      {rec.waTerkirim ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <Send className="w-3 h-3" />
                          <span>Terkirim</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada data kehadiran pada kriteria ini</p>
            <p className="text-xs text-slate-400">Pilih tanggal lain atau sesuaikan filter pencarian.</p>
          </div>
        )}
      </div>
    </div>
  );
};
