/**
 * Account Switcher Modal
 * Allows switching between existing accounts and profiles quickly
 */

import React from 'react';
import { X, Check, UserCheck, ShieldAlert, LogOut, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
}) => {
  const { users, currentUser, switchAccount, logout } = useApp();

  if (!isOpen) return null;

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    superadmin: { label: 'Superadmin IT', badge: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300' },
    director: { label: 'Directivo / Rector', badge: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300' },
    docente: { label: 'Docente', badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300' },
    cajero: { label: 'Tesorería / Caja', badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' },
    padre: { label: 'Padre / Apoderado', badge: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300' },
    estudiante: { label: 'Estudiante', badge: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300' },
  };

  const handleSelectAccount = (userId: string) => {
    switchAccount(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cambiar de Cuenta
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona una cuenta registrada para cambiar de sesión
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

        {/* Notice on financial security */}
        <div className="my-4 flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold">Control de Privilegios:</span> Los permisos de cobros, recibos y caja solo están habilitados para cuentas con rol <strong>Director</strong>, <strong>Superadmin</strong> o <strong>Tesorería/Caja</strong>. Docentes, estudiantes y padres no tienen acceso financiero.
          </div>
        </div>

        {/* Account list */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {users.map(user => {
            const isCurrent = user.id === currentUser.id;
            const roleInfo = roleLabels[user.role] || { label: user.role, badge: 'bg-slate-100 text-slate-800' };

            return (
              <button
                key={user.id}
                disabled={user.status !== 'activo'}
                onClick={() => handleSelectAccount(user.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                  user.status !== 'activo'
                    ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                    : isCurrent
                    ? 'border-blue-500 bg-blue-50/60 dark:border-blue-500/70 dark:bg-blue-950/40 ring-1 ring-blue-500/30 cursor-pointer'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold uppercase">
                        {user.name.slice(0, 2)}
                      </div>
                    )}
                    {user.isGoogleLinked && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs">
                        <svg className="h-3 w-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      {isCurrent && (
                        <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.2 rounded-full">
                          Activa
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleInfo.badge}`}>
                        {roleInfo.label}
                      </span>
                      {user.emailVerified && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                          • Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isCurrent ? (
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400">
                    Cambiar →
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Editar mi Perfil Actual
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" /> Salir e Iniciar con Otra Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};
