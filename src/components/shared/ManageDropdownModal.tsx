import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Check, GripVertical, AlertCircle, Settings2 } from 'lucide-react';

export interface DropdownOption {
  id: string;
  label: string;
  desc?: string;
}

interface ManageDropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  options: DropdownOption[];
  onSave: (options: DropdownOption[]) => Promise<void>;
  allowDesc?: boolean;
  descPlaceholder?: string;
}

export const ManageDropdownModal: React.FC<ManageDropdownModalProps> = ({
  isOpen, onClose, title, subtitle, options: initialOptions, onSave, allowDesc = false, descPlaceholder = 'Deskripsi (opsional)',
}) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setOptions([...initialOptions]);
      setEditingId(null); setNewLabel(''); setNewDesc(''); setError(''); setDeleteConfirmId(null);
    }
  }, [isOpen, initialOptions]);

  if (!isOpen) return null;

  const generateId = (label: string) => label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now().toString(36);

  const handleAdd = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) { setError('Label tidak boleh kosong'); return; }
    if (options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase())) { setError('Label sudah ada'); return; }
    setOptions([...options, { id: generateId(trimmed), label: trimmed, desc: newDesc.trim() || undefined }]);
    setNewLabel(''); setNewDesc(''); setError('');
  };

  const handleStartEdit = (opt: DropdownOption) => { setEditingId(opt.id); setEditLabel(opt.label); setEditDesc(opt.desc || ''); setDeleteConfirmId(null); };
  const handleSaveEdit = (id: string) => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    setOptions(options.map((o) => o.id === id ? { ...o, label: trimmed, desc: editDesc.trim() || undefined } : o));
    setEditingId(null);
  };
  const handleDelete = (id: string) => { setOptions(options.filter((o) => o.id !== id)); setDeleteConfirmId(null); };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const reordered = [...options];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setOptions(reordered);
    setDragIdx(null); setDragOverIdx(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try { await onSave(options); onClose(); }
    catch (e: any) { setError(e.message || 'Gagal menyimpan'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden" style={{ animation: 'mdSlideUp 0.2s ease' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Settings2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 max-h-72">
          {options.length === 0 && <div className="text-center py-8 text-slate-400 text-xs">Belum ada opsi. Tambahkan di bawah.</div>}
          {options.map((opt, idx) => (
            <div key={opt.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)} onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${dragOverIdx === idx ? 'border-indigo-400 bg-indigo-50 shadow-md' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
              {editingId === opt.id ? (
                <div className="flex-1 flex items-center gap-1.5">
                  <input autoFocus value={editLabel} onChange={(e) => setEditLabel(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(opt.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 text-xs font-medium bg-white border border-indigo-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Nama opsi..." />
                  {allowDesc && <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-24 text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder={descPlaceholder} />}
                  <button onClick={() => handleSaveEdit(opt.id)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{opt.label}</p>
                  {opt.desc && <p className="text-[10px] text-slate-400 truncate">{opt.desc}</p>}
                </div>
              )}
              {editingId !== opt.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(opt)} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil className="w-3 h-3" /></button>
                  {deleteConfirmId === opt.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(opt.id)} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white hover:bg-red-600">Hapus?</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 hover:bg-slate-300">Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(opt.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-4 pb-3 pt-3 border-t border-slate-100">
          {error && <div className="flex items-center gap-1.5 text-[11px] text-red-600 mb-2"><AlertCircle className="w-3 h-3" />{error}</div>}
          <div className="flex gap-2">
            <input ref={newInputRef} value={newLabel} onChange={(e) => { setNewLabel(e.target.value); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Tambah opsi baru..." className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all" />
            {allowDesc && <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder={descPlaceholder} className="w-28 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all" />}
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"><Plus className="w-3.5 h-3.5" />Tambah</button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-slate-400">{options.length} opsi · Drag untuk ubah urutan</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors">Batal</button>
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes mdSlideUp { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
};
