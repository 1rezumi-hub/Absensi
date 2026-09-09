import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Send, 
  Search, 
  CheckCheck, 
  ExternalLink, 
  Clock, 
  Smartphone,
  Info
} from 'lucide-react';
import { NotifikasiWA } from '../types';

interface WhatsAppLogsViewProps {
  logs: NotifikasiWA[];
}

export const WhatsAppLogsView: React.FC<WhatsAppLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.namaOrtu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.noHp.includes(searchTerm)
  );

  const openWhatsAppDirect = (noHp: string, text: string) => {
    // Format Indonesian number 08... to 628...
    let cleanNumber = noHp.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.slice(1);
    }
    const encoded = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquareText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Log Notifikasi WhatsApp Wali Murid
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Riwayat pengiriman notifikasi otomatis kehadiran siswa ke nomor WhatsApp orang tua/wali murid saat tiba di gerbang.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Gateway WhatsApp API: Aktif</span>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          Setiap kali kartu QR siswa berhasil di-scan atau dicatat secara manual di gerbang, sistem secara otomatis mengantrikan pesan konfirmasi tiba di sekolah. Anda dapat menekan tombol <strong>Kirim Ulang / Buka WA Web</strong> jika orang tua meminta pengiriman ulang langsung dari perangkat ini.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-wa"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa, nama orang tua, atau nomor HP..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Total Pesan: {logs.length}
        </span>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  {log.status === 'TERKIRIM' ? 'Terkirim Sukses' : log.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {log.waktuKirim} WIB
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Siswa: {log.namaSiswa}
                </h4>
                <p className="text-xs text-slate-600">
                  Tujuan: <strong>{log.namaOrtu}</strong> &bull;{' '}
                  <span className="font-mono text-indigo-600">{log.noHp}</span>
                </p>
              </div>

              {/* Message text bubble */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-line border border-slate-100 font-sans max-w-2xl">
                {log.pesan}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                onClick={() => openWhatsAppDirect(log.noHp, log.pesan)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka WhatsApp Web</span>
              </button>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
            <MessageSquareText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum ada riwayat pesan WhatsApp</p>
            <p className="text-xs text-slate-400">
              Pesan akan otomatis tercatat saat siswa melakukan scan presensi di gerbang.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
