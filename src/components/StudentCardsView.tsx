import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Search, 
  CreditCard, 
  QrCode, 
  Download, 
  UserPlus, 
  X, 
  School,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
  List,
  Eye,
  MessageCircle,
  GraduationCap,
  Building2,
  CheckCircle2,
  ChevronRight,
  Phone
} from 'lucide-react';
import { Siswa, PengaturanSekolah, TingkatKelas } from '../types';

interface StudentCardsViewProps {
  students: Siswa[];
  onAddStudent: (student: Siswa) => void;
  settings: PengaturanSekolah;
}

// Single ID Card component with QR code rendering
const StudentIdCard: React.FC<{ 
  student: Siswa; 
  settings: PengaturanSekolah;
  onPreviewQr: (student: Siswa) => void;
}> = ({ student, settings, onPreviewQr }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(student.qrCodeData, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error(err));
  }, [student.qrCodeData]);

  const downloadQrOnly = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR_${student.nisn}_${student.nama.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="print-break-inside-avoid bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between max-w-sm w-full mx-auto">
      {/* School Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-3.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
          <School className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200 truncate">
            {settings.namaSekolah}
          </h4>
          <p className="text-[9px] text-slate-300 uppercase tracking-widest font-semibold">
            KARTU TANDA PELAJAR &bull; GATE PASS
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex gap-3.5 items-start bg-white dark:bg-slate-900 transition-colors">
        {/* Photo & NISN */}
        <div className="shrink-0 flex flex-col items-center">
          <img
            src={student.fotoUrl}
            alt={student.nama}
            className="w-20 h-24 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800"
          />
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1.5">
            {student.nisn}
          </span>
        </div>

        {/* Student Info & QR Code */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2">
              {student.nama}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                {student.kelas}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                {student.tingkat}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate leading-tight mt-1 font-medium">
              {student.jurusan}
            </p>
          </div>

          <div className="flex items-end justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Tahun Ajaran</span>
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">2026/2027</span>
            </div>

            {/* QR Code thumbnail */}
            <button
              onClick={() => onPreviewQr(student)}
              className="w-14 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-2xs shrink-0 hover:border-indigo-400 transition-colors cursor-pointer group"
              title="Klik untuk memperbesar QR Code"
            >
              {qrUrl ? (
                <img src={qrUrl} alt={`QR ${student.nama}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 animate-pulse rounded" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer (Hidden on print) */}
      <div className="no-print bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 p-2.5 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
          {student.qrCodeData}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreviewQr(student)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat</span>
          </button>
          <button
            onClick={downloadQrOnly}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            title="Download gambar QR code"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const StudentCardsView: React.FC<StudentCardsViewProps> = ({
  students,
  onAddStudent,
  settings,
}) => {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [filterTingkat, setFilterTingkat] = useState<'ALL' | TingkatKelas>('ALL');
  const [filterRombel, setFilterRombel] = useState<string>('ALL');
  const [filterJurusan, setFilterJurusan] = useState<string>('ALL');
  const [filterGender, setFilterGender] = useState<'ALL' | 'L' | 'P'>('ALL');
  
  // View mode state (e-wallet style: card grid or list table)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Siswa | null>(null);
  const [modalQrUrl, setModalQrUrl] = useState<string>('');

  // Extract distinct departments and classes for dynamic dropdowns
  const availableRombelList = Array.from(new Set(students.map((s) => s.kelas))).sort();
  
  // Standard list of departments
  const DEPARTMENT_OPTIONS = [
    { code: 'ALL', label: 'Semua Jurusan' },
    { code: 'RPL', label: 'RPL (Rekayasa Perangkat Lunak)' },
    { code: 'TKJ', label: 'TKJ (Teknik Komputer & Jaringan)' },
    { code: 'DKV', label: 'DKV (Desain Komunikasi Visual)' },
    { code: 'AKL', label: 'AKL (Akuntansi & Keuangan Lembaga)' },
    { code: 'OTKP', label: 'OTKP (Otomatisasi Tata Kelola Perkantoran)' },
  ];

  // Helper for department badge styling
  const getDepartmentBadge = (jurusan: string) => {
    if (jurusan.includes('RPL')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (jurusan.includes('TKJ')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (jurusan.includes('DKV')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (jurusan.includes('AKL')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (jurusan.includes('OTKP')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Generate QR code for modal preview
  useEffect(() => {
    if (selectedStudentForQr) {
      QRCode.toDataURL(selectedStudentForQr.qrCodeData, {
        width: 320,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      }).then(setModalQrUrl).catch(console.error);
    } else {
      setModalQrUrl('');
    }
  }, [selectedStudentForQr]);

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      q === '' ||
      s.nama.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.kelas.toLowerCase().includes(q) ||
      s.jurusan.toLowerCase().includes(q) ||
      s.namaOrtu.toLowerCase().includes(q);

    const matchesTingkat = filterTingkat === 'ALL' || s.tingkat === filterTingkat;
    const matchesRombel = filterRombel === 'ALL' || s.kelas === filterRombel;
    const matchesJurusan = 
      filterJurusan === 'ALL' || 
      s.jurusan.toLowerCase().includes(filterJurusan.toLowerCase());
    const matchesGender = filterGender === 'ALL' || s.jenisKelamin === filterGender;

    return matchesSearch && matchesTingkat && matchesRombel && matchesJurusan && matchesGender;
  });

  const isAnyFilterActive = 
    searchTerm.trim() !== '' || 
    filterTingkat !== 'ALL' || 
    filterRombel !== 'ALL' || 
    filterJurusan !== 'ALL' || 
    filterGender !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterTingkat('ALL');
    setFilterRombel('ALL');
    setFilterJurusan('ALL');
    setFilterGender('ALL');
  };

  // Form State for Add New Student
  const [newNama, setNewNama] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newKelas, setNewKelas] = useState('');
  const [newTingkat, setNewTingkat] = useState<TingkatKelas>('X');
  const [newJurusan, setNewJurusan] = useState('RPL (Rekayasa Perangkat Lunak)');
  const [newJenisKelamin, setNewJenisKelamin] = useState<'L' | 'P'>('L');
  const [newNamaOrtu, setNewNamaOrtu] = useState('');
  const [newNoHpOrtu, setNewNoHpOrtu] = useState('');

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newNisn.trim() || !newKelas.trim()) return;

    const newStudent: Siswa = {
      id: `sis-${Date.now()}`,
      nisn: newNisn.trim(),
      nama: newNama.trim(),
      kelas: newKelas.trim(),
      tingkat: newTingkat,
      jurusan: newJurusan.trim(),
      jenisKelamin: newJenisKelamin,
      fotoUrl: newJenisKelamin === 'L'
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      noHpOrtu: newNoHpOrtu.trim() || '08123456789',
      namaOrtu: newNamaOrtu.trim() || 'Orang Tua Siswa',
      qrCodeData: `SISWA-${newNisn.trim()}`,
    };

    onAddStudent(newStudent);
    setIsAddModalOpen(false);

    // Reset Form
    setNewNama('');
    setNewNisn('');
    setNewKelas('');
    setNewNamaOrtu('');
    setNewNoHpOrtu('');
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner (Hidden in Print) */}
      <div className="no-print bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Data Siswa & Generator Kartu Pelajar QR
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pencarian cepat siswa, filter jurusan & kelas, cetak kartu ID pelajar, serta ekspor QR code gerbang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            id="btn-open-add-student"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          <button
            id="btn-print-all-cards"
            type="button"
            onClick={handlePrintAll}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu ({filteredStudents.length})</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR & COMPREHENSIVE FILTER CONTROLS (E-WALLET STYLE) */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        {/* Main Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            id="input-search-student-records"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan Nama Siswa, NISN, Kelas (misal: XII RPL 1), atau Jurusan..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="space-y-3 pt-1">
          {/* Department / Jurusan Filter Chips & Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Jurusan:</span>
            </span>

            {/* Quick Department Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
              {DEPARTMENT_OPTIONS.map((dept) => (
                <button
                  key={dept.code}
                  type="button"
                  onClick={() => setFilterJurusan(dept.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filterJurusan === dept.code
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {dept.code === 'ALL' ? 'Semua Jurusan' : dept.code}
                </button>
              ))}
            </div>
          </div>

          {/* Class (Tingkat & Rombel) + Gender Filters */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            {/* Tingkat Kelas Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Tingkat:</span>
              </span>
              <div className="flex gap-1">
                {(['ALL', 'X', 'XI', 'XII'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFilterTingkat(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      filterTingkat === lvl
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Semua' : `Kelas ${lvl}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Class / Rombel Select */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="select-rombel-filter" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Rombel:
              </label>
              <select
                id="select-rombel-filter"
                value={filterRombel}
                onChange={(e) => setFilterRombel(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Rombel</option>
                {availableRombelList.map((rombel) => (
                  <option key={rombel} value={rombel}>
                    {rombel}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="select-gender-filter" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Gender:
              </label>
              <select
                id="select-gender-filter"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as 'ALL' | 'L' | 'P')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua</option>
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* Reset Button if filter is active */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors ml-auto cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Bar & View Mode Toggle (Card Grid vs Table List) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Menampilkan <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredStudents.length}</span> dari {students.length} siswa
            </span>
            {isAnyFilterActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Filter Aktif
              </span>
            )}
          </div>

          {/* View Mode Switcher (Card vs Table) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tampilan Kartu Pelajar"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tampilan Tabel / Daftar Ringkas"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daftar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Header Visible ONLY on Print */}
      <div className="hidden print-only text-center mb-6">
        <h2 className="text-xl font-black uppercase text-black">{settings.namaSekolah}</h2>
        <p className="text-xs text-gray-700">{settings.alamatSekolah}</p>
        <h3 className="text-sm font-bold uppercase mt-2 border-b-2 border-black pb-1">
          LEMBAR CETAK KARTU PELAJAR QR PRESENSI GERBANG
        </h3>
      </div>

      {/* CONTENT: VIEW MODE 1 - CARD GRID */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((st) => (
            <StudentIdCard 
              key={st.id} 
              student={st} 
              settings={settings}
              onPreviewQr={setSelectedStudentForQr} 
            />
          ))}
        </div>
      )}

      {/* CONTENT: VIEW MODE 2 - COMPACT TABLE / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">NISN</th>
                  <th className="py-3.5 px-4">Kelas & Tingkat</th>
                  <th className="py-3.5 px-4">Jurusan</th>
                  <th className="py-3.5 px-4">Kontak Orang Tua / WA</th>
                  <th className="py-3.5 px-4 text-center">Aksi QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Siswa Photo & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.fotoUrl}
                          alt={s.nama}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {s.nama}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* NISN */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-600 text-xs">
                      {s.nisn}
                    </td>

                    {/* Kelas */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                        {s.kelas}
                      </span>
                    </td>

                    {/* Jurusan */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getDepartmentBadge(s.jurusan)}`}>
                        {s.jurusan}
                      </span>
                    </td>

                    {/* Ortu & No WA */}
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800">{s.namaOrtu}</p>
                        <a 
                          href={`https://wa.me/62${s.noHpOrtu.replace(/^0/, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{s.noHpOrtu}</span>
                        </a>
                      </div>
                    </td>

                    {/* Aksi QR */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedStudentForQr(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Lihat QR</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Tidak ada siswa yang sesuai</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ditemukan data siswa dengan kriteria pencarian nama, kelas, atau jurusan tersebut.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* MODAL: PRATINJAU QR CODE SISWA */}
      {selectedStudentForQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pratinjau QR Code Siswa
              </span>
              <button
                onClick={() => setSelectedStudentForQr(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <img
                src={selectedStudentForQr.fotoUrl}
                alt={selectedStudentForQr.nama}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
              />
              <h3 className="font-bold text-slate-900 text-sm mt-2">
                {selectedStudentForQr.nama}
              </h3>
              <p className="text-xs font-semibold text-indigo-600">
                {selectedStudentForQr.kelas} &bull; {selectedStudentForQr.jurusan}
              </p>
              <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                NISN: {selectedStudentForQr.nisn}
              </span>
            </div>

            {/* QR Code */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-inner">
              {modalQrUrl ? (
                <img src={modalQrUrl} alt="QR Code Siswa" className="w-48 h-48 object-contain mx-auto" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600">
              Payload: {selectedStudentForQr.qrCodeData}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!modalQrUrl) return;
                  const a = document.createElement('a');
                  a.href = modalQrUrl;
                  a.download = `QR_${selectedStudentForQr.nisn}_${selectedStudentForQr.nama.replace(/\s+/g, '_')}.png`;
                  a.click();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar QR</span>
              </button>
              <button
                onClick={() => setSelectedStudentForQr(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH SISWA BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    Pendaftaran Siswa Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Otomatis men-generate kode QR unik presensi gerbang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Raden Satria Wicaksono"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    placeholder="Contoh: 0071234599"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={newJenisKelamin}
                    onChange={(e) => setNewJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tingkat Kelas *
                  </label>
                  <select
                    value={newTingkat}
                    onChange={(e) => setNewTingkat(e.target.value as TingkatKelas)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nama Rombel / Kelas *
                  </label>
                  <input
                    type="text"
                    value={newKelas}
                    onChange={(e) => setNewKelas(e.target.value)}
                    placeholder="Contoh: X RPL 2"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Kompetensi Keahlian (Jurusan) *
                </label>
                <select
                  value={newJurusan}
                  onChange={(e) => setNewJurusan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="RPL (Rekayasa Perangkat Lunak)">RPL (Rekayasa Perangkat Lunak)</option>
                  <option value="TKJ (Teknik Komputer & Jaringan)">TKJ (Teknik Komputer & Jaringan)</option>
                  <option value="DKV (Desain Komunikasi Visual)">DKV (Desain Komunikasi Visual)</option>
                  <option value="AKL (Akuntansi & Keuangan Lembaga)">AKL (Akuntansi & Keuangan Lembaga)</option>
                  <option value="OTKP (Otomatisasi & Tata Kelola Perkantoran)">OTKP (Otomatisasi & Tata Kelola Perkantoran)</option>
                  <option value="TKR (Teknik Kendaraan Ringan)">TKR (Teknik Kendaraan Ringan)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={newNamaOrtu}
                    onChange={(e) => setNewNamaOrtu(e.target.value)}
                    placeholder="Contoh: Bpk. Gunawan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    No. WhatsApp Wali (Notifikasi)
                  </label>
                  <input
                    type="text"
                    value={newNoHpOrtu}
                    onChange={(e) => setNewNoHpOrtu(e.target.value)}
                    placeholder="0812XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Simpan & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
