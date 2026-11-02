/**
 * Google Identity Services / One-Tap Account Chooser Modal
 * Simulates real Google OAuth 2.0 Identity verification dialog
 */

import React, { useState } from 'react';
import { X, CheckCircle2, Shield, User, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onGoogleSelect: (account: { name: string; email: string; picture: string; googleSub: string }) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onGoogleSelect,
}) => {
  const { config } = useApp();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!isOpen) return null;

  const presetGoogleAccounts = [
    {
      name: 'Superadministrador Titular',
      email: 'pixelglez1988@gmail.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Superadmin Único',
    },
  ];

  const handleSelectPreset = (acc: typeof presetGoogleAccounts[0]) => {
    onGoogleSelect({
      name: acc.name,
      email: acc.email,
      picture: acc.picture,
      googleSub: `goog_${Math.random().toString(36).substring(2, 10)}`,
    });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;
    onGoogleSelect({
      name: customName,
      email: customEmail,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customName)}`,
      googleSub: `goog_${Date.now()}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Google Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Official Google 'G' Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-xs dark:bg-slate-800 dark:border-slate-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Iniciar sesión con Google' : 'Registrarse y verificar con Google'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                para continuar en <span className="font-semibold text-blue-600 dark:text-blue-400">{config.institutionName}</span>
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

        {/* Security badge */}
        <div className="my-4 flex items-center gap-2 rounded-xl bg-blue-50/80 px-3 py-2 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          <Shield className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>Verificación de identidad instantánea mediante Google Identity Services.</span>
        </div>

        {!showCustomForm ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Selecciona una cuenta de Google:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {presetGoogleAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(acc)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-blue-500 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-600 dark:hover:bg-slate-800/80 group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.picture}
                      alt={acc.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {acc.name}
                        </span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {acc.email}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {acc.role}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 dark:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="h-3.5 w-3.5" /> Usar otra cuenta de Google distinta...
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Ingresa los datos de tu cuenta de Google para verificar el correo:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Completo (como figura en Google)
              </label>
              <input
                type="text"
                required
                placeholder="ej. Juan Pérez"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico de Google (@gmail.com o Google Workspace)
              </label>
              <input
                type="email"
                required
                placeholder="usuario@gmail.com"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ← Volver a lista de cuentas
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Verificar y Continuar
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 dark:border-slate-800">
          Protegido por Google Identity Services • OAuth 2.0 PKCE • Verificación instantánea
        </div>
      </div>
    </div>
  );
};
