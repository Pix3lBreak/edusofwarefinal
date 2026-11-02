/**
 * Facial Profile Photo Uploader Component
 * Mandatory facial photo capture & compression for students, teachers and institutional users.
 * Centers, resizes and crops image to 320x320 JPEG to guarantee high facial clarity and compact storage.
 */

import React, { useRef, useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, RefreshCw, X, User } from 'lucide-react';

interface FacePhotoUploaderProps {
  currentPhotoUrl?: string;
  onPhotoSelected: (base64Photo: string) => void;
  label?: string;
  required?: boolean;
  helperText?: string;
}

export const FacePhotoUploader: React.FC<FacePhotoUploaderProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
  label = 'Fotografía de Rostro (Obligatoria para Identificación)',
  required = true,
  helperText = 'Sube una foto clara y de frente donde se distinga tu rostro para la credencial escolar.'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for cropping & downscaling to 320x320
        const canvas = document.createElement('canvas');
        const targetSize = 320;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsProcessing(false);
          setErrorMessage('No se pudo inicializar el procesador gráfico.');
          return;
        }

        // Calculate center square crop
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);

        // Convert to optimized JPEG (approx 25-35KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        setPreviewUrl(compressedBase64);
        onPhotoSelected(compressedBase64);
        setIsProcessing(false);
      };

      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Error al leer el archivo de imagen.');
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('No se pudo cargar el archivo.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    onPhotoSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasPhoto = Boolean(previewUrl && !previewUrl.includes('dicebear.com'));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>{label}</span>
          {required && <span className="text-red-500 font-black">*</span>}
        </label>

        {hasPhoto ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Foto Cargada
          </span>
        ) : required ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-3 w-3" /> Obligatoria
          </span>
        ) : null}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Dropzone & Preview Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          hasPhoto
            ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-500'
            : 'border-slate-300 dark:border-slate-700 hover:border-purple-500 bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-50/20'
        }`}
      >
        {/* Facial Target Viewport */}
        <div className="relative shrink-0">
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-4 ring-purple-500/10">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa de rostro"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <User className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sin Foto</span>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center text-white">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          )}

          {hasPhoto && (
            <button
              type="button"
              onClick={handleClearPhoto}
              title="Quitar foto"
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Text Instructions & Upload Trigger */}
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              {hasPhoto ? 'Fotografía de rostro cargada' : 'Haz clic o arrastra tu foto aquí'}
            </span>
            <span className="inline-block text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
              JPG, PNG o WebP
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {helperText}
          </p>

          <div className="pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{hasPhoto ? 'Cambiar Fotografía' : 'Seleccionar Foto de Rostro'}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
};
