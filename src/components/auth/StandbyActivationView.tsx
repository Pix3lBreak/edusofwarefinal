/**
 * Institutional Standby / Account Activation Pending Screen
 * Displayed when an authenticated user has status: 'pendiente' or 'inactivo'
 * Strictly blocks access to educational/administrative modules until Superadmin (pixelglez1988@gmail.com) approves and assigns a role.
 */

import React, { useState } from 'react';
import { 
  Clock, 
  ShieldAlert, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  User, 
  Sparkles,
  School,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FacePhotoUploader } from '../common/FacePhotoUploader';

export const StandbyActivationView: React.FC = () => {
  const { currentUser, config, logout, addToast, users, setCurrentUser, updateUserProfile } = useApp();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setTimeout(() => {
      // Find latest user state from context users list
      const freshUser = users.find(u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (freshUser && freshUser.status === 'activo') {
        setCurrentUser(freshUser);
        addToast('success', '¡Cuenta Activada!', `Tu cuenta ha sido activada con el rol: ${freshUser.role.toUpperCase()}`);
      } else {
        addToast('info', 'En Espera', 'Tu cuenta aún está en revisión. El Superadministrador debe asignarte un rol.');
      }
      setIsChecking(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-xl">
        {/* Institutional Header Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/20 mb-3 font-extrabold text-2xl">
            EC
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {config.institutionName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma Institucional de Control Educativo & ERP
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className={`flex items-center gap-2 ${currentUser.status === 'inactivo' ? 'text-rose-400' : 'text-amber-400'}`}>
              <span className={`flex h-2.5 w-2.5 rounded-full ${currentUser.status === 'inactivo' ? 'bg-rose-400' : 'bg-amber-400'} animate-ping`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {currentUser.status === 'inactivo' ? 'Estado: Cuenta Congelada / Pausada' : 'Estado: Cuenta en Standby'}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
              currentUser.status === 'inactivo'
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            }`}>
              {currentUser.status === 'inactivo' ? 'Acceso Inhabilitado' : 'Pendiente de Activación'}
            </span>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <img 
              src={currentUser.avatarUrl || currentUser.googlePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`} 
              alt={currentUser.name}
              className={`h-14 w-14 rounded-2xl object-cover ring-2 ${currentUser.status === 'inactivo' ? 'ring-rose-500/40' : 'ring-amber-500/40'}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base truncate">
                  {currentUser.name}
                </h3>
                {currentUser.emailVerified && (
                  <span title="Identidad Verificada con Google">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate font-mono mt-0.5">
                {currentUser.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                  Rol: {currentUser.role.toUpperCase()}
                </span>
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${currentUser.status === 'inactivo' ? 'text-rose-400' : 'text-amber-400'}`}>
                  <Lock className="h-3 w-3" /> Acceso Bloqueado
                </span>
              </div>
            </div>
          </div>

          {/* Face Photo Requirement Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <FacePhotoUploader
              currentPhotoUrl={currentUser.avatarUrl}
              required={true}
              label="Fotografía Facial Obligatoria"
              helperText="El Superadministrador y la Dirección requieren ver tu rostro para validar tu identidad institucional."
              onPhotoSelected={(base64) => {
                if (base64) {
                  updateUserProfile({ avatarUrl: base64 });
                  addToast('success', 'Foto de Rostro Adjuntada', 'Tu fotografía está lista para ser verificada.');
                }
              }}
            />
          </div>

          {/* Explanation message */}
          {currentUser.status === 'inactivo' ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200/90 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                <span>Cuenta Pausada / Congelada Temporalmente</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-200/80">
                Tu perfil ha sido inhabilitado de forma preventiva por la dirección académica o coordinación docente. El ingreso a la plataforma permanecerá suspendido hasta que la administración o tu docente reactive tu perfil escolar.
              </p>
              <div className="pt-2 text-[11px] text-slate-300 border-t border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Contacto de desbloqueo:</span>
                <span className="font-mono font-bold text-rose-300">pixelglez1988@gmail.com</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Aprobación de Acceso Requerida</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-200/80">
                Tu cuenta ha sido registrada con éxito. Por políticas estrictas de seguridad de la institución, todos los nuevos usuarios permanecen en <strong>standby</strong> hasta que el Superadministrador titular te active la cuenta y te asigne tu rol definitivo (Docente, Rector, Tesorería/Caja, Alumno o Apoderado).
              </p>
              <div className="pt-2 text-[11px] text-slate-300 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Superadministrador autorizado:</span>
                <span className="font-mono font-bold text-amber-300">pixelglez1988@gmail.com</span>
              </div>
            </div>
          )}

          {/* Interactive Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isChecking}
              onClick={handleCheckStatus}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verificando estado en el servidor...' : 'Comprobar si mi cuenta ya fue activada'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-xs border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              <span>Cerrar Sesión / Salir</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          EduControl SIS • Seguridad RBAC & Cifrado Institucional
        </p>
      </div>
    </div>
  );
};
