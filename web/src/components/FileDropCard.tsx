import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck2, X, AlertCircle } from 'lucide-react';

interface FileDropCardProps {
  label: string;
  helperText?: string;
  accept?: string;
  maxSizeMb?: number;
  selectedFile: File | null;
  uploaded?: boolean;
  uploadedLabel?: string;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const FileDropCard: React.FC<FileDropCardProps> = ({
  label,
  helperText = 'Format PDF, JPG, atau PNG (maks. 2 MB)',
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 2,
  selectedFile,
  uploaded = false,
  uploadedLabel = 'Berkas sudah tersimpan di server',
  onFileSelect,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = (file: File | undefined) => {
    if (!file || disabled) return;
    setError(null);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Ukuran file melebihi batas maksimal ${maxSizeMb} MB.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    validateAndSet(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#0F2A44]">{label}</label>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-4 sm:p-5 transition-all select-none ${
          disabled
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
            : isDragging
              ? 'bg-[#C8A24B]/10 border-[#C8A24B] cursor-pointer scale-[1.01]'
              : selectedFile || uploaded
                ? 'bg-emerald-50/70 border-emerald-400 cursor-pointer hover:bg-emerald-50'
                : 'bg-[#FAF8F4] border-[#0F2A44]/20 cursor-pointer hover:border-[#C8A24B] hover:bg-white'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => validateAndSet(e.target.files?.[0])}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0F2A44] truncate">{selectedFile.name}</p>
                <p className="text-xs text-emerald-700">
                  {(selectedFile.size / 1024).toFixed(0)} KB • Siap diunggah
                </p>
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Hapus file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : uploaded ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">{uploadedLabel}</p>
              <p className="text-xs text-emerald-600">Klik atau seret file baru untuk mengganti</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-10 h-10 rounded-full bg-[#0F2A44]/5 text-[#0F2A44] flex items-center justify-center mb-2">
              <UploadCloud className="w-5 h-5 text-[#C8A24B]" />
            </div>
            <p className="text-sm font-medium text-[#0F2A44]">
              Seret & lepas berkas di sini, atau <span className="text-[#991B1B] underline">pilih file</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};
