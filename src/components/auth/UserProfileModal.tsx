/**
 * User Profile & Account Settings Modal
 * Edit personal information, avatar, link Google identity, change password
 */

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleAuthModal } from './GoogleAuthModal';
import { FacePhotoUploader } from '../common/FacePhotoUploader';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentRole, updateUserProfile, addToast, config } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('warning', 'Campo Obligatorio', 'El nombre no puede estar vacío.');
      return;
    }

    if (!avatarUrl.trim()) {
      addToast('warning', 'Fotografía Obligatoria', 'Es obligatorio subir una fotografía clara de tu rostro para la credencial escolar.');
      return;
    }

    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim(),
    });
    addToast('success', 'Perfil Guardado', 'Tu información y fotografía de rostro han sido actualizadas.');
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('error', 'Contraseña Corta', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('error', 'Discrepancia', 'Las nuevas contraseñas no coinciden.');
      return;
    }

    updateUserProfile({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('success', 'Contraseña Actualizada', 'Tu clave de acceso ha sido cambiada correctamente.');
  };

  const handleLinkGoogle = (account: { name: string; email: string; picture: string; googleSub: string }) => {
    updateUserProfile({
      isGoogleLinked: true,
      emailVerified: true,
      googleSub: account.googleSub,
      googlePicture: account.picture,
      avatarUrl: account.picture || avatarUrl,
    });
    addToast('success', 'Cuenta de Google Vinculada', `Tu perfil quedó asociado a ${account.email}`);
  };

  const handleUnlinkGoogle = () => {
    updateUserProfile({
      isGoogleLinked: false,
      googleSub: undefined,
    });
    addToast('info', 'Google Desvinculado', 'Se ha retirado la vinculación con Google.');
  };

  const roleLabels: Record<string, string> = {
    superadmin: 'Superadministrador IT',
    director: 'Directivo / Rector Institucional',
    docente: 'Profesor / Docente Titular',
    cajero: 'Tesorería / Caja Registradora',
    padre: 'Padre / Apoderado',
    estudiante: 'Estudiante Matriculado',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Perfil de Usuario & Seguridad
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Información personal, vinculación con Google y credenciales
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Identity Hero Banner */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 text-white shadow-sm flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-16 w-16 rounded-full object-cover ring-4 ring-white/20 shadow-md"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-black uppercase ring-4 ring-white/20">
                {name.slice(0, 2)}
              </div>
            )}
            {currentUser.isGoogleLinked && (
              <div 
                title="Cuenta Verificada por Google" 
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-base font-bold text-white">{name}</h4>
              <span className="rounded-full bg-blue-500/30 border border-blue-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-blue-200">
                {roleLabels[currentRole] || currentRole}
              </span>
            </div>
            <p className="text-xs text-blue-200/80 font-mono mt-0.5">{email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <Laptop className="h-3 w-3 text-blue-400" /> Sede: {config.institutionName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-400" /> Estado: {currentUser.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Personal Data Form */}
        <form onSubmit={handleSaveInfo} className="mt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 pb-2 dark:border-slate-800">
            1. Datos Personales
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre y Apellidos *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico Institucional / Principal *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+51 987 654 321"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <FacePhotoUploader
                currentPhotoUrl={avatarUrl}
                onPhotoSelected={(photoBase64) => setAvatarUrl(photoBase64)}
                required={true}
                label="Fotografía del Rostro (Obligatoria para tu Identificación)"
                helperText="Sube una foto tomada de frente donde se aprecie claramente tu rostro para tu carnet escolar y perfil institucional."
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20"
            >
              <Save className="h-4 w-4" /> Guardar Cambios de Perfil
            </button>
          </div>
        </form>

        {/* SECTION 2: Google Identity Services Integration */}
        <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-xs dark:bg-slate-800 dark:border-slate-700">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Vinculación con Cuenta de Google
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permite iniciar sesión rápidamente con 1 solo clic y verificar tu correo institucional
                </p>
              </div>
            </div>

            {currentUser.isGoogleLinked ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Vinculado y Verificado
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                No vinculado
              </span>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {currentUser.isGoogleLinked 
                ? 'Tu cuenta está protegida y sincronizada con Google OAuth 2.0.' 
                : 'Conecta tu cuenta de Google para agilizar el acceso y asegurar tu perfil.'}
            </p>

            {currentUser.isGoogleLinked ? (
              <button
                type="button"
                onClick={handleUnlinkGoogle}
                className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
              >
                Desvincular Google
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Vincular con Google
              </button>
            )}
          </div>
        </div>

        {/* SECTION 3: Change Password */}
        <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 pb-2 dark:border-slate-800 flex items-center gap-1.5">
            <Key className="h-4 w-4 text-slate-500" /> 2. Cambio de Contraseña
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Actualizar Contraseña
            </button>
          </div>
        </form>

        {/* Google Auth Modal Integration */}
        <GoogleAuthModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          mode="login"
          onGoogleSelect={handleLinkGoogle}
        />
      </div>
    </div>
  );
};
