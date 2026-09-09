import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Check, X, UserPlus, Users } from 'lucide-react';
import { PetugasJaga } from '../types';
import { INITIAL_PETUGAS } from '../data/mockData';

interface GuardOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGuard: PetugasJaga;
  onSelectGuard: (guard: PetugasJaga) => void;
}

export const GuardOfficerModal: React.FC<GuardOfficerModalProps> = ({
  isOpen,
  onClose,
  activeGuard,
  onSelectGuard,
}) => {
  const [officers, setOfficers] = useState<PetugasJaga[]>(INITIAL_PETUGAS);
  const [customNama, setCustomNama] = useState('');
  const [customPeran, setCustomPeran] = useState<'OSIS' | 'Satpam' | 'Guru Piket' | 'Admin'>('OSIS');
  const [customJabatan, setCustomJabatan] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (g: PetugasJaga) => {
    onSelectGuard(g);
    onClose();
  };

  const handleAddCustomOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNama.trim()) return;

    const newGuard: PetugasJaga = {
      id: `ptg-${Date.now()}`,
      nama: customNama.trim(),
      peran: customPeran,
      jabatan: customJabatan.trim() || `Petugas ${customPeran} Jaga Gerbang`,
      shift: 'Pagi (06:00 - 08:00 WIB)',
    };

    setOfficers([newGuard, ...officers]);
    onSelectGuard(newGuard);
    setShowAddForm(false);
    setCustomNama('');
    setCustomJabatan('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Petugas Jaga Gerbang Hari Ini
              </h3>
              <p className="text-[11px] text-slate-400">Pilih anggota OSIS / Satpam yang bertugas memegang tablet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Guard List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {officers.map((g) => {
            const isSelected = activeGuard.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleSelect(g)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                    g.peran === 'OSIS'
                      ? 'bg-blue-100 text-blue-700'
                      : g.peran === 'Satpam'
                      ? 'bg-slate-800 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {g.peran.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                      {g.nama}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {g.jabatan} &bull; {g.shift}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Pilih</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add custom guard toggle */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ganti / Masukkan Nama Petugas Lain</span>
          </button>
        ) : (
          <form onSubmit={handleAddCustomOfficer} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Petugas Baru</h4>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nama Petugas *</label>
              <input
                type="text"
                value={customNama}
                onChange={(e) => setCustomNama(e.target.value)}
                placeholder="Contoh: Bima Perkasa (OSIS)"
                required
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Peran *</label>
                <select
                  value={customPeran}
                  onChange={(e) => setCustomPeran(e.target.value as 'OSIS' | 'Satpam' | 'Guru Piket' | 'Admin')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="OSIS">OSIS</option>
                  <option value="Satpam">Satpam</option>
                  <option value="Guru Piket">Guru Piket</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Jabatan / Bagian</label>
                <input
                  type="text"
                  value={customJabatan}
                  onChange={(e) => setCustomJabatan(e.target.value)}
                  placeholder="e.g. Divisi Ketertiban"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
              >
                Simpan & Aktifkan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
