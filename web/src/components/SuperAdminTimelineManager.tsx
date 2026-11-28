import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SuperAdminApi, type TimelineStageRecord } from '../services/apiService';
import { invalidateTimelineCache } from '../hooks/useTimeline';

interface SuperAdminTimelineManagerProps {
  stages: TimelineStageRecord[];
  serverTime?: string;
  onRefresh: () => Promise<void>;
  onFeedback: (fb: { type: 'success' | 'error'; msg: string } | null) => void;
}

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatWibDateTime(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const SuperAdminTimelineManager: React.FC<SuperAdminTimelineManagerProps> = ({
  stages,
  serverTime,
  onRefresh,
  onFeedback,
}) => {
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stageKey, setStageKey] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(stages.length + 1);
  const [title, setTitle] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [shortDate, setShortDate] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [visibleFrom, setVisibleFrom] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isExtended, setIsExtended] = useState(false);

  const nowMs = useMemo(
    () => (serverTime ? new Date(serverTime).getTime() : Date.now()),
    [serverTime]
  );

  const resetForm = (nextOrder = stages.length + 1) => {
    setEditingId(null);
    setStageKey('');
    setSortOrder(nextOrder);
    setTitle('');
    setDateLabel('');
    setShortDate('');
    setDescription('');
    setStartAt('');
    setEndAt('');
    setVisibleFrom('');
    setIsVisible(true);
    setIsExtended(false);
  };

  const startEdit = (s: TimelineStageRecord) => {
    setEditingId(s.id);
    setStageKey(s.stage_key);
    setSortOrder(s.sort_order);
    setTitle(s.title);
    setDateLabel(s.date_label);
    setShortDate(s.short_date);
    setDescription(s.description || '');
    setStartAt(toDatetimeLocalValue(s.start_at));
    setEndAt(toDatetimeLocalValue(s.end_at));
    setVisibleFrom(toDatetimeLocalValue(s.visible_from));
    setIsVisible(Boolean(s.is_visible));
    setIsExtended(Boolean(s.is_extended));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startAt || !endAt) {
      onFeedback({ type: 'error', msg: 'Tanggal mulai dan selesai tahap wajib diisi.' });
      return;
    }
    setBusy(true);
    onFeedback(null);
    try {
      const payload: Partial<TimelineStageRecord> = {
        stage_key: stageKey.trim() || undefined,
        sort_order: Number(sortOrder) || 1,
        title: title.trim(),
        date_label: dateLabel.trim(),
        short_date: shortDate.trim() || dateLabel.trim(),
        description: description.trim(),
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        visible_from: visibleFrom ? new Date(visibleFrom).toISOString() : null,
        is_visible: isVisible,
        is_extended: isExtended,
      };
      if (editingId) {
        await SuperAdminApi.updateTimelineStage(editingId, payload);
        onFeedback({ type: 'success', msg: `Tahap "${payload.title}" berhasil diperbarui.` });
      } else {
        await SuperAdminApi.createTimelineStage(payload);
        onFeedback({ type: 'success', msg: `Tahap baru "${payload.title}" berhasil ditambahkan.` });
      }
      invalidateTimelineCache();
      await onRefresh();
      resetForm(stages.length + (editingId ? 1 : 2));
    } catch (err: any) {
      onFeedback({ type: 'error', msg: err?.message || 'Gagal menyimpan tahap linimasa.' });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVisible = async (s: TimelineStageRecord) => {
    setBusy(true);
    onFeedback(null);
    try {
      await SuperAdminApi.updateTimelineStage(s.id, { is_visible: !s.is_visible });
      invalidateTimelineCache();
      await onRefresh();
      onFeedback({
        type: 'success',
        msg: `Tahap "${s.title}" kini ${!s.is_visible ? 'ditampilkan' : 'disembunyikan'} dari halaman publik.`,
      });
    } catch (err: any) {
      onFeedback({ type: 'error', msg: err?.message || 'Gagal mengubah visibilitas tahap.' });
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    const current = stages[index];
    const neighbor = stages[targetIdx];
    const currentOrder = current.sort_order;
    const neighborOrder =
      neighbor.sort_order === currentOrder ? currentOrder + direction : neighbor.sort_order;

    setBusy(true);
    onFeedback(null);
    try {
      await Promise.all([
        SuperAdminApi.updateTimelineStage(current.id, { sort_order: neighborOrder }),
        SuperAdminApi.updateTimelineStage(neighbor.id, { sort_order: currentOrder }),
      ]);
      invalidateTimelineCache();
      await onRefresh();
    } catch (err: any) {
      onFeedback({ type: 'error', msg: err?.message || 'Gagal mengubah urutan tahap.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (s: TimelineStageRecord) => {
    if (!window.confirm(`Hapus tahap linimasa "${s.title}" secara permanen?`)) return;
    setBusy(true);
    onFeedback(null);
    try {
      await SuperAdminApi.deleteTimelineStage(s.id);
      if (editingId === s.id) resetForm();
      invalidateTimelineCache();
      await onRefresh();
      onFeedback({ type: 'success', msg: `Tahap "${s.title}" berhasil dihapus.` });
    } catch (err: any) {
      onFeedback({ type: 'error', msg: err?.message || 'Gagal menghapus tahap linimasa.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Info Panduan Singkat */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2f1d10] via-[#3a2415] to-[#26160c] text-[#faf4e8] p-5 border border-[#caa152]/55 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#f3d48c]">
          <CalendarClock className="w-4 h-4 text-[#caa152]" />
          <span className="font-cinzel text-[11px] tracking-[0.18em] uppercase font-semibold">
            Pengaturan Linimasa Dinamis (Tanpa Edit Kode)
          </span>
        </div>
        <p className="text-xs text-[#e8d7be] leading-relaxed">
          Perubahan di sini langsung tampil di <strong>Beranda</strong>, <strong>Halaman Kompetisi</strong>, dan <strong>Juklak &amp; Juknis</strong>.
          Gunakan kolom <strong>Jadwal Mulai Tampil</strong> untuk memunculkan kartu otomatis di jam tertentu (contoh: <em>Extended Registration</em> mulai 17 Jan 2027 pukul 08.00 WIB).
          Tahap berstatus <strong>Mode Extended</strong> otomatis memperpanjang pintu pendaftaran peserta di server selama periode aktif.
        </p>
      </div>

      {/* Form Tambah / Edit Tahap */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">
              {editingId ? 'Edit Tahap Linimasa' : 'Tambah Tahap Linimasa Baru'}
            </h3>
            <p className="text-xs text-[#7a5530]">
              Agenda internal seperti gladi tidak perlu ditambahkan atau cukup nonaktifkan visibilitasnya.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => resetForm()}
              className="px-3.5 py-1.5 rounded-full border border-[#d8be99] text-xs font-semibold text-[#5c3e28] hover:bg-[#faf4e8] cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Judul Tahap *</label>
            <input
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Perpanjangan Pendaftaran (Extended Registration)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Label Tanggal Lengkap *</label>
            <input
              type="text"
              required
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="Contoh: 17 – 23 Jan 2027"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Label Tanggal Singkat (Badge)</label>
            <input
              type="text"
              value={shortDate}
              onChange={(e) => setShortDate(e.target.value)}
              placeholder="Contoh: 17 – 23 Jan 2027"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Waktu Mulai Tahap (WIB) *</label>
            <input
              type="datetime-local"
              required
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Waktu Selesai Tahap (WIB) *</label>
            <input
              type="datetime-local"
              required
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">
              Jadwal Mulai Tampil Otomatis (Opsional)
            </label>
            <input
              type="datetime-local"
              value={visibleFrom}
              onChange={(e) => setVisibleFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
            <p className="text-[11px] text-[#7a5530] mt-1">
              Kosongkan agar langsung tayang. Isi jam tertentu agar kartu baru muncul otomatis saat waktu tiba.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Urutan Tampil</label>
              <input
                type="number"
                min={1}
                max={999}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Kode Tahap (Opsional)</label>
              <input
                type="text"
                value={stageKey}
                onChange={(e) => setStageKey(e.target.value)}
                placeholder="extended-registration"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#2f1e10] mb-1">Deskripsi Tahap</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan hal yang perlu disiapkan atau dilakukan peserta pada tahap ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d8be99] text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#2f1e10] cursor-pointer">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="accent-[#ba883a]"
            />
            <span>Tampilkan di halaman publik</span>
          </label>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#2f1e10] cursor-pointer">
            <input
              type="checkbox"
              checked={isExtended}
              onChange={(e) => setIsExtended(e.target.checked)}
              className="accent-[#ba883a]"
            />
            <span>Mode Extended Registration (otomatis buka pendaftaran saat aktif)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2f1e10] text-[#faf4e8] text-xs font-semibold hover:bg-[#462d18] disabled:opacity-50 cursor-pointer"
        >
          {editingId ? <CheckCircle2 className="w-3.5 h-3.5 text-[#caa152]" /> : <Plus className="w-3.5 h-3.5 text-[#caa152]" />}
          <span>{busy ? 'Menyimpan...' : editingId ? 'Simpan Perubahan Tahap' : 'Tambahkan ke Linimasa'}</span>
        </button>
      </form>

      {/* Daftar Seluruh Tahap Linimasa */}
      <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebdcc8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-cormorant text-2xl font-semibold text-[#2f1e10]">
            Daftar Tahap Linimasa ({stages.length})
          </h3>
          <span className="text-[11px] text-[#7a5530]">
            Urutan tampil dari atas ke bawah
          </span>
        </div>

        {stages.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#faf4e8]/60 border border-dashed border-[#d8be99] text-center text-xs text-[#7a5530]">
            Belum ada tahap linimasa tersimpan di database.
          </div>
        ) : (
          <div className="space-y-2.5">
            {stages.map((s, idx) => {
              const vfMs = s.visible_from ? new Date(s.visible_from).getTime() : null;
              const isScheduledFuture = Boolean(s.is_visible && vfMs !== null && vfMs > nowMs);
              const isLiveVisible = Boolean(s.is_visible && !isScheduledFuture);

              return (
                <div
                  key={s.id}
                  className={`rounded-2xl p-4 border flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                    !s.is_visible
                      ? 'bg-gray-50 border-gray-200 opacity-80'
                      : isScheduledFuture
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-[#faf4e8]/55 border-[#ebdcc8]'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2f1e10] text-[#f3d48c] font-mono text-[10px] font-bold shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-semibold text-[#8a5e38]">{s.date_label}</span>

                      {isLiveVisible && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                          <Eye className="w-3 h-3" /> Tayang Publik
                        </span>
                      )}
                      {isScheduledFuture && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-semibold">
                          <Clock className="w-3 h-3" /> Terjadwal · Tampil {formatWibDateTime(s.visible_from)}
                        </span>
                      )}
                      {!s.is_visible && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold">
                          <EyeOff className="w-3 h-3" /> Disembunyikan
                        </span>
                      )}
                      {s.is_extended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3b2412] text-[#fcedb8] border border-[#caa152]/70 text-[10px] font-semibold">
                          <Sparkles className="w-3 h-3 text-[#caa152]" /> Extended Auto-Open
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-[#2f1e10]">{s.title}</p>
                    {s.description && (
                      <p className="text-xs text-[#5c3e28] line-clamp-2">{s.description}</p>
                    )}
                    <p className="text-[11px] text-[#7a5530]">
                      Rentang sistem: {formatWibDateTime(s.start_at)} s.d. {formatWibDateTime(s.end_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      disabled={busy || idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      title="Naikkan urutan"
                      className="p-1.5 rounded-lg border border-[#ebdcc8] bg-white text-[#5c3e28] hover:text-[#2f1e10] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={busy || idx === stages.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      title="Turunkan urutan"
                      className="p-1.5 rounded-lg border border-[#ebdcc8] bg-white text-[#5c3e28] hover:text-[#2f1e10] disabled:opacity-35 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggleVisible(s)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                        s.is_visible
                          ? 'bg-white border-[#d8be99] text-[#5c3e28] hover:bg-[#faf4e8]'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {s.is_visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{s.is_visible ? 'Sembunyikan' : 'Tampilkan'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => startEdit(s)}
                      title="Edit tahap"
                      className="p-1.5 rounded-lg border border-[#ebdcc8] bg-white text-[#7a5530] hover:text-[#2f1e10] cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(s)}
                      title="Hapus tahap"
                      className="p-1.5 rounded-lg border border-[#ebdcc8] bg-white text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
