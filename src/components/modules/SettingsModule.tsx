/**
 * Institutional Settings & Limitless Free Local Database Engine
 */

import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Database, 
  Upload, 
  RotateCcw, 
  Save, 
  Server, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive,
  FileCode2,
  FileJson,
  Image,
  Palette,
  Eye,
  LogOut,
  Sparkles,
  Shield,
  UploadCloud,
  Trash2,
  Sliders,
  Check,
  Wand2,
  Paintbrush,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SchoolConfig } from '../../types';
import { processImageUpload } from '../../services/imageUtils';

export const SettingsModule: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    exportDatabaseJSON, 
    exportDatabaseSQL, 
    importDatabaseJSON, 
    resetDatabase,
    students,
    teachers,
    payments,
    grades,
    logout,
    addToast
  } = useApp();

  const [formData, setFormData] = useState<SchoolConfig>({ ...config });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Paletas Institucionales Predefinidas
  const COLOR_PALETTES = [
    {
      id: 'classic_blue',
      name: 'Azul Bicentenario',
      primary: '#1e40af',
      secondary: '#3b82f6',
      bgStart: '#020617',
      bgEnd: '#0f172a',
      button: '#2563eb',
      badge: 'Portal Oficial de Gestión Escolar',
    },
    {
      id: 'emerald_health',
      name: 'Verde Esmeralda',
      primary: '#065f46',
      secondary: '#10b981',
      bgStart: '#022c22',
      bgEnd: '#064e3b',
      button: '#059669',
      badge: 'Campus Virtual Académico',
    },
    {
      id: 'royal_purple',
      name: 'Púrpura & Oro',
      primary: '#581c87',
      secondary: '#8b5cf6',
      bgStart: '#1e1136',
      bgEnd: '#2e1065',
      button: '#7c3aed',
      badge: 'Portal de Excelencia Institucional',
    },
    {
      id: 'crimson_red',
      name: 'Rojo Carmesí',
      primary: '#991b1b',
      secondary: '#ef4444',
      bgStart: '#280505',
      bgEnd: '#450a0a',
      button: '#dc2626',
      badge: 'Colegio Histórico & Tradición',
    },
    {
      id: 'slate_dark',
      name: 'Grafito Dark / Tech',
      primary: '#0f172a',
      secondary: '#38bdf8',
      bgStart: '#090d16',
      bgEnd: '#1e293b',
      button: '#0284c7',
      badge: 'Plataforma Tecnológica STEM',
    },
    {
      id: 'amber_gold',
      name: 'Ámbar & Café',
      primary: '#78350f',
      secondary: '#f59e0b',
      bgStart: '#291500',
      bgEnd: '#451a03',
      button: '#d97706',
      badge: 'Instituto de Humanidades y Artes',
    },
  ];

  // Presets de Fondos de Login
  const LOGIN_BG_PRESETS = [
    { name: 'Medianoche', start: '#020617', end: '#0f172a' },
    { name: 'Esmeralda', start: '#022c22', end: '#064e3b' },
    { name: 'Galaxia', start: '#1e1136', end: '#2e1065' },
    { name: 'Rubí', start: '#280505', end: '#450a0a' },
    { name: 'Ónix Puro', start: '#000000', end: '#18181b' },
    { name: 'Zafiro Profundo', start: '#082f49', end: '#0c4a6e' },
  ];

  // Handle Logo Upload from local files (PNG / JPG / WEBP / SVG)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp|svg\+xml)$/i)) {
      addToast('error', 'Formato no soportado', 'Por favor selecciona un archivo PNG o JPG válido.');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const dataUrl = await processImageUpload(file, 512, 512);
      setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
      addToast('success', 'Logo Cargado', 'El logotipo institucional fue cargado y optimizado con éxito.');
    } catch (err) {
      addToast('error', 'Error al procesar logo', 'No se pudo leer la imagen seleccionada.');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyPalette = (p: typeof COLOR_PALETTES[0]) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      appThemePreset: p.id as any,
      loginThemePreset: p.id as any,
      loginBgGradientStart: p.bgStart,
      loginBgGradientEnd: p.bgEnd,
      loginButtonColor: p.button,
      loginBadgeText: prev.loginBadgeText || p.badge,
    }));
    addToast('info', 'Paleta Seleccionada', `Estilos de "${p.name}" aplicados a la vista previa.`);
  };

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    addToast('success', 'Configuración Guardada', 'Se actualizaron los parámetros, colores institucionales y estilos de login.');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.config && json.students) {
          importDatabaseJSON(json);
        } else {
          addToast('error', 'Formato Inválido', 'El archivo no contiene una estructura válida de EduControl.');
        }
      } catch (err) {
        addToast('error', 'Error de Lectura', 'No se pudo interpretar el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" /> Parámetros del Sistema y Base de Datos
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalización institucional, escala académica, copias de seguridad sin costo y exportación a la nube.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1 & 2: INSTITUTIONAL CONFIGURATION FORM */}
        <form onSubmit={handleSaveParams} className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              Datos Generales de la Institución
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Oficial del Colegio / Instituto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={e => setFormData({ ...formData, institutionName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lema o Visión Institucional
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código Modular / Registro Educativo
                </label>
                <input
                  type="text"
                  value={formData.institutionCode}
                  onChange={e => setFormData({ ...formData, institutionCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Año Lectivo Vigente
                </label>
                <input
                  type="text"
                  value={formData.currentAcademicYear}
                  onChange={e => setFormData({ ...formData, currentAcademicYear: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold text-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección del Campus o Sede Central
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono / Central Telefónica
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico de Contacto
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Academic & Financial Parameters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              Parámetros de Calificación y Moneda
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Símbolo de Moneda
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold text-center"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Escala de Calificaciones
                </label>
                <select
                  value={formData.gradingScale}
                  onChange={e => setFormData({ ...formData, gradingScale: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                >
                  <option value="0-20">Escala 0 a 20 (Perú / Latinoamérica)</option>
                  <option value="0-10">Escala 0 a 10 (España / México / Colombia)</option>
                  <option value="0-100">Escala 0 a 100 Porcentual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nota Mínima Aprobatoria
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.minPassingGrade}
                  onChange={e => setFormData({ ...formData, minPassingGrade: parseFloat(e.target.value) || 11 })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* SECTION: LOGIN PORTAL & INSTITUTIONAL BRANDING CUSTOMIZER */}
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs dark:border-blue-900/40 dark:bg-slate-900 space-y-6">
            
            {/* Header with Test Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${formData.primaryColor || '#1e40af'}, ${formData.secondaryColor || '#3b82f6'})`
                  }}
                >
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    Estudio de Marca & Pantalla de Login
                    <span className="text-[10px] uppercase font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      Superadmin IT
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sube el logo oficial (PNG/JPG), ajusta los colores institucionales y personaliza el estilo del login.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateConfig(formData);
                  addToast('info', 'Probando Login', 'Cerrando sesión para que visualices el portal con tus cambios...');
                  setTimeout(() => logout(), 500);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shrink-0 cursor-pointer shadow-xs"
                title="Cierra sesión temporalmente para probar tu pantalla de login en vivo"
              >
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Probar Pantalla Completa</span>
              </button>
            </div>

            {/* Hidden File Input for Logo Upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
              className="hidden" 
            />

            {/* 1. LOGO UPLOAD & EMBLEM SECTION */}
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Logotipo Institucional (Subida en PNG o JPG)
                </label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Transparencia PNG recomendada
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Preview Square */}
                <div className="relative h-20 w-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-inner">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Preview"
                      className="h-full w-full object-contain"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      className="h-full w-full rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${formData.primaryColor || '#1e40af'}, ${formData.secondaryColor || '#3b82f6'})`
                      }}
                    >
                      {formData.institutionName ? formData.institutionName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'EC'}
                    </div>
                  )}

                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload & Clear Actions */}
                <div className="flex-1 space-y-2 text-xs w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      style={{
                        backgroundColor: formData.primaryColor || '#1e40af',
                      }}
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>{isUploadingLogo ? 'Optimizando...' : 'Subir Archivo (PNG / JPG)'}</span>
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, logoUrl: '' }));
                          addToast('info', 'Logo Eliminado', 'Se restableció al monograma institucional por defecto.');
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 font-bold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Quitar Logo</span>
                      </button>
                    )}
                  </div>

                  {/* Manual URL input fallback */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">O ingresa URL:</span>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/logo.png"
                      value={formData.logoUrl || ''}
                      onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-300 p-1.5 text-[11px] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  {/* Insignia Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Insignias sugeridas:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=160&auto=format&fit=crop&q=80' })}
                      className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-medium hover:border-blue-500"
                    >
                      Escudo Dorado
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=160&auto=format&fit=crop&q=80' })}
                      className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-medium hover:border-blue-500"
                    >
                      Sello Académico
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=160&auto=format&fit=crop&q=80' })}
                      className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-medium hover:border-blue-500"
                    >
                      Emblema Tech
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. APP-WIDE INSTITUTIONAL BRAND COLOR PALETTES */}
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <Paintbrush className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Colores de la Aplicación según la Institución
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Afecta Navbar, Botones y Acentos
                </span>
              </div>

              {/* Quick Palettes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COLOR_PALETTES.map(p => {
                  const isSelected = formData.primaryColor === p.primary && formData.secondaryColor === p.secondary;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPalette(p)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500' 
                          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <span className="h-5 w-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.primary }} />
                        <span className="h-5 w-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.secondary }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{p.primary}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Color Primario Institucional
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={formData.primaryColor || '#1e40af'}
                      onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="h-9 w-10 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#1e40af'}
                      onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-28 rounded-lg border border-slate-300 p-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white uppercase"
                    />
                    <span className="text-[11px] text-slate-500">Cabecera, insignias y botones</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Color Secundario / Acento
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={formData.secondaryColor || '#3b82f6'}
                      onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="h-9 w-10 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || '#3b82f6'}
                      onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-28 rounded-lg border border-slate-300 p-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white uppercase"
                    />
                    <span className="text-[11px] text-slate-500">Degradados y contrastes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. LOGIN SCREEN CUSTOMIZER (STYLES & COLORS) */}
            <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <label className="block font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Estilos & Colores de la Pantalla de Login
              </label>

              {/* Card Style Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Estilo de la Tarjeta de Inicio de Sesión:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'glass', name: 'Glassmorphism', desc: 'Translúcido con desenfoque suave' },
                    { id: 'solid_dark', name: 'Sólido Oscuro', desc: 'Carbón ejecutivo sobrio' },
                    { id: 'solid_white', name: 'Blanco Puro', desc: 'Alto contraste moderno' },
                    { id: 'bordered_neon', name: 'Borde Neón', desc: 'Borde luminoso con resplandor' },
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, loginCardStyle: style.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        (formData.loginCardStyle || 'glass') === style.id
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{style.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Background Gradient Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fondo Login (Inicio Degradado)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.loginBgGradientStart || '#020617'}
                      onChange={e => setFormData({ ...formData, loginBgGradientStart: e.target.value })}
                      className="h-8 w-9 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.loginBgGradientStart || '#020617'}
                      onChange={e => setFormData({ ...formData, loginBgGradientStart: e.target.value })}
                      className="w-24 rounded-lg border border-slate-300 p-1 text-[11px] font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fondo Login (Fin Degradado)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.loginBgGradientEnd || '#0f172a'}
                      onChange={e => setFormData({ ...formData, loginBgGradientEnd: e.target.value })}
                      className="h-8 w-9 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.loginBgGradientEnd || '#0f172a'}
                      onChange={e => setFormData({ ...formData, loginBgGradientEnd: e.target.value })}
                      className="w-24 rounded-lg border border-slate-300 p-1 text-[11px] font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Color del Botón de Login
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.loginButtonColor || formData.primaryColor || '#2563eb'}
                      onChange={e => setFormData({ ...formData, loginButtonColor: e.target.value })}
                      className="h-8 w-9 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={formData.loginButtonColor || formData.primaryColor || '#2563eb'}
                      onChange={e => setFormData({ ...formData, loginButtonColor: e.target.value })}
                      className="w-24 rounded-lg border border-slate-300 p-1 text-[11px] font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Login Background Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Degradados de fondo:</span>
                {LOGIN_BG_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, loginBgGradientStart: preset.start, loginBgGradientEnd: preset.end })}
                    className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 hover:border-blue-500"
                  >
                    <span 
                      className="h-2.5 w-2.5 rounded-full" 
                      style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }} 
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Photographic Banner Toggle & URL */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showLoginHeroBanner ?? true}
                      onChange={e => setFormData({ ...formData, showLoginHeroBanner: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Mostrar fotografía de fondo (Hero Banner con desenfoque)</span>
                  </label>
                </div>

                {formData.showLoginHeroBanner !== false && (
                  <div className="space-y-1.5 pl-6">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.loginBannerUrl || ''}
                      onChange={e => setFormData({ ...formData, loginBannerUrl: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono text-[11px]"
                    />
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Fotos sugeridas:</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, loginBannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop' })}
                        className="rounded-lg bg-white dark:bg-slate-800 border px-2 py-0.5"
                      >
                        Campus Central
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, loginBannerUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format&fit=crop' })}
                        className="rounded-lg bg-white dark:bg-slate-800 border px-2 py-0.5"
                      >
                        Biblioteca
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, loginBannerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop' })}
                        className="rounded-lg bg-white dark:bg-slate-800 border px-2 py-0.5"
                      >
                        Auditorio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. TEXTS & EDITABLE CONTENTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Texto del Distintivo / Badge Superior
                </label>
                <input
                  type="text"
                  placeholder="Portal Oficial de Gestión Escolar"
                  value={formData.loginBadgeText || ''}
                  onChange={e => setFormData({ ...formData, loginBadgeText: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título Principal del Login
                </label>
                <input
                  type="text"
                  placeholder="Portal Académico & Administrativo"
                  value={formData.loginTitle || ''}
                  onChange={e => setFormData({ ...formData, loginTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtítulo / Lema de la Pantalla de Login
                </label>
                <input
                  type="text"
                  placeholder="Acceso seguro para directivos, docentes, estudiantes y apoderados"
                  value={formData.loginSubtitle || ''}
                  onChange={e => setFormData({ ...formData, loginSubtitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mensaje de Bienvenida / Aviso Institucional
                </label>
                <textarea
                  rows={2}
                  placeholder="Bienvenidos al ciclo lectivo 2026. Recuerde mantener sus credenciales seguras."
                  value={formData.loginWelcomeMessage || ''}
                  onChange={e => setFormData({ ...formData, loginWelcomeMessage: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo de Soporte de Acceso
                </label>
                <input
                  type="email"
                  placeholder="soporte@bicentenario.edu"
                  value={formData.loginSupportEmail || ''}
                  onChange={e => setFormData({ ...formData, loginSupportEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Toggles */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowGoogleLogin ?? true}
                    onChange={e => setFormData({ ...formData, allowGoogleLogin: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Habilitar Inicio con Google
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Permite autenticación directa mediante Google Identity
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowSelfRegistration ?? true}
                    onChange={e => setFormData({ ...formData, allowSelfRegistration: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Permitir Auto-Registro de Usuarios
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Habilita la pestaña de registro institucional
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 5. LIVE REAL-TIME PREVIEW OF LOGIN PORTAL */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Vista Previa Interactiva en Tiempo Real del Login
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Renderizado en Directo
                </span>
              </div>

              {/* Scaled-down Interactive Mockup */}
              <div 
                className="relative rounded-2xl p-5 text-white overflow-hidden shadow-2xl border border-slate-700/80 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${formData.loginBgGradientStart || '#020617'} 0%, ${formData.loginBgGradientEnd || '#0f172a'} 100%)`,
                }}
              >
                {/* Hero banner preview if enabled */}
                {(formData.showLoginHeroBanner ?? true) && formData.loginBannerUrl && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none filter blur-xs"
                    style={{ backgroundImage: `url(${formData.loginBannerUrl})` }}
                  />
                )}

                <div className="relative z-10 space-y-4">
                  {/* Top bar preview */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Preview"
                          className="h-8 w-8 object-contain rounded-lg bg-white/10 p-1"
                        />
                      ) : (
                        <div 
                          className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${formData.primaryColor || '#1e40af'}, ${formData.secondaryColor || '#3b82f6'})`
                          }}
                        >
                          {formData.institutionName ? formData.institutionName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'EC'}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-xs leading-none">{formData.institutionName}</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">{formData.tagline || 'Excelencia Académica'}</p>
                      </div>
                    </div>
                    <span 
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold text-white border"
                      style={{
                        backgroundColor: `${formData.loginButtonColor || formData.primaryColor || '#2563eb'}20`,
                        borderColor: `${formData.loginButtonColor || formData.primaryColor || '#2563eb'}50`
                      }}
                    >
                      Ciclo {formData.currentAcademicYear}
                    </span>
                  </div>

                  {/* Body preview grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Left text */}
                    <div className="md:col-span-7 space-y-2">
                      <div 
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${formData.loginButtonColor || formData.primaryColor || '#2563eb'}25`,
                          borderColor: `${formData.loginButtonColor || formData.primaryColor || '#2563eb'}60`
                        }}
                      >
                        <Sparkles className="h-3 w-3" style={{ color: formData.secondaryColor || '#3b82f6' }} />
                        <span>{formData.loginBadgeText || 'Portal Oficial de Gestión Escolar'}</span>
                      </div>
                      <h4 className="text-base font-black leading-tight">{formData.loginTitle || 'Portal Académico & Administrativo'}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{formData.loginSubtitle || 'Acceso seguro para directivos, docentes y alumnos'}</p>
                    </div>

                    {/* Right Login Card Preview */}
                    <div className="md:col-span-5">
                      <div 
                        className={`p-3.5 rounded-2xl space-y-2.5 ${
                          formData.loginCardStyle === 'solid_white'
                            ? 'bg-white text-slate-900 border border-slate-200'
                            : formData.loginCardStyle === 'solid_dark'
                              ? 'bg-slate-900 text-slate-100 border border-slate-800'
                              : formData.loginCardStyle === 'bordered_neon'
                                ? 'bg-slate-950 text-slate-100 border-2'
                                : 'bg-slate-900/80 backdrop-blur-md text-slate-100 border border-white/10'
                        }`}
                        style={{
                          borderColor: formData.loginCardStyle === 'bordered_neon' ? (formData.loginButtonColor || formData.primaryColor || '#2563eb') : undefined,
                          boxShadow: formData.loginCardStyle === 'bordered_neon' ? `0 0 20px ${(formData.loginButtonColor || formData.primaryColor || '#2563eb')}40` : undefined,
                        }}
                      >
                        {/* Tab demo */}
                        <div className="flex gap-1 p-0.5 rounded-lg bg-black/20 text-[10px] font-bold">
                          <span 
                            className="flex-1 py-1 text-center rounded-md text-white font-bold shadow-xs"
                            style={{ backgroundColor: formData.loginButtonColor || formData.primaryColor || '#2563eb' }}
                          >
                            Iniciar Sesión
                          </span>
                          <span className="flex-1 py-1 text-center text-slate-400">Registrarse</span>
                        </div>

                        {/* Google button demo */}
                        {(formData.allowGoogleLogin ?? true) && (
                          <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white text-slate-900 font-bold text-[10px] shadow-sm">
                            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                            </svg>
                            <span className="truncate">Iniciar con Google</span>
                          </div>
                        )}

                        {/* Input placeholders */}
                        <div className="h-6 rounded-lg bg-slate-500/10 border border-slate-500/20" />
                        <div className="h-6 rounded-lg bg-slate-500/10 border border-slate-500/20" />

                        {/* Submit button demo */}
                        <div 
                          className="py-1.5 px-3 rounded-xl font-bold text-[10px] text-center text-white shadow-md flex items-center justify-center gap-1"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${formData.loginButtonColor || formData.primaryColor || '#2563eb'}, ${formData.secondaryColor || '#3b82f6'})`,
                            boxShadow: `0 4px 12px ${(formData.loginButtonColor || formData.primaryColor || '#2563eb')}40`
                          }}
                        >
                          <span>Ingresar a EduControl</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Los cambios se aplican automáticamente a la vista previa y se confirman con el botón de guardar.
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${formData.primaryColor || '#1e40af'}, ${formData.secondaryColor || '#3b82f6'})`,
                  boxShadow: `0 4px 15px ${(formData.primaryColor || '#1e40af')}40`
                }}
              >
                <Save className="h-4 w-4" />
                <span>Guardar Marca, Colores & Diseño</span>
              </button>
            </div>
          </div>
        </form>

        {/* COLUMN 3: DATABASE ENGINE, BACKUP & CLOUD HOSTING MIGRATION */}
        <div className="space-y-6">
          {/* Real Free Database Card */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs dark:border-emerald-900/40 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Motor de Base de Datos</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Gratis / Ilimitada
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              La base de datos opera localmente en tu navegador sin requerir suscripciones pagas ni servidores costosos.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Alumnos Registrados:</span>
                <span className="font-bold text-slate-900 dark:text-white">{students.length}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Profesores en Nómina:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teachers.length}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Recibos Emitidos:</span>
                <span className="font-bold text-slate-900 dark:text-white">{payments.length}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Calificaciones Asentadas:</span>
                <span className="font-bold text-slate-900 dark:text-white">{grades.length}</span>
              </div>
            </div>

            {/* Backup & Export Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={exportDatabaseJSON}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer"
              >
                <FileJson className="h-4 w-4 text-amber-400" />
                Exportar Copia de Base de Datos (.json)
              </button>

              <button
                type="button"
                onClick={exportDatabaseSQL}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Genera script .sql compatible con PostgreSQL, Supabase, Neon o Cloud SQL"
              >
                <FileCode2 className="h-4 w-4 text-white" />
                Exportar Script SQL para Cloud (.sql)
              </button>

              <label className="w-full flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-emerald-600" />
                Restaurar Backup desde Archivo (.json)
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* Cloud Database Integration Guide */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs dark:border-blue-900/40 dark:bg-slate-900 space-y-3">
            <h4 className="font-bold text-xs text-blue-950 dark:text-blue-200 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" /> Respaldo & Migración a Base de Datos en la Nube
            </h4>
            <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>1. Exportación SQL estándar:</strong> Usa el botón <em>"Exportar Script SQL para Cloud (.sql)"</em> para volcar tablas completas de alumnos, notas, recibos y matrículas compatibles con PostgreSQL, Supabase o Cloud SQL.
              </p>
              <p>
                <strong>2. Respaldos JSON portables:</strong> Puedes guardar o restaurar el estado completo de la institución en cualquier momento sin perder ninguna información.
              </p>
            </div>
          </div>

          {/* Factory Reset Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900/40 dark:bg-red-950/20 space-y-2">
            <h4 className="font-bold text-xs text-red-800 dark:text-red-300">
              Restablecer Datos de Demostración
            </h4>
            <p className="text-[11px] text-red-600 dark:text-red-400 leading-relaxed">
              Restaura la base de datos a sus valores iniciales de fábrica con estudiantes y docentes de prueba.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Restablecer la base de datos completa con los datos de fábrica?')) {
                  resetDatabase();
                }
              }}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer de Fábrica
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
