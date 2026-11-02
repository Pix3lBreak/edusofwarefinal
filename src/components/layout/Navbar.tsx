/**
 * Top Navbar with Role Switcher, Push Notifications Bell & Quick Actions
 */

import React, { useState } from 'react';
import { 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  Lock, 
  Unlock, 
  Sparkles,
  Search,
  ExternalLink,
  Laptop,
  Download,
  User,
  Users,
  LogOut,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { NotificationService } from '../../services/notifications';
import { ZipExporterService } from '../../services/zipExporter';
import { UserProfileModal } from '../auth/UserProfileModal';
import { AccountSwitcherModal } from '../auth/AccountSwitcherModal';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenNotifications }) => {
  const { 
    config, 
    currentRole, 
    currentUser, 
    switchRole, 
    logout,
    notifications, 
    canViewPayments,
    runPeriodicAutomatedReport,
    encryptionUnlocked,
    setEncryptionUnlocked,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    superadmin: { label: 'Superadmin IT', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-950 dark:text-purple-200' },
    director: { label: 'Directivo / Rector', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-950 dark:text-blue-200' },
    docente: { label: 'Profesor / Docente', bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-950 dark:text-emerald-200' },
    cajero: { label: 'Tesorería / Caja', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-950 dark:text-amber-200' },
    padre: { label: 'Padre / Apoderado', bg: 'bg-cyan-100 dark:bg-cyan-950', text: 'text-cyan-950 dark:text-cyan-200' },
    estudiante: { label: 'Estudiante', bg: 'bg-indigo-100 dark:bg-indigo-950', text: 'text-indigo-950 dark:text-indigo-200' },
  };

  const handleRequestPushPermission = async () => {
    const res = await NotificationService.requestPermission();
    if (res === 'granted') {
      addToast('success', 'Notificaciones Activadas', 'Recibirás alertas críticas e informes en tu dispositivo.');
    } else {
      addToast('warning', 'Permiso denegado', 'Habilita las notificaciones en los ajustes de tu navegador para alertas en tiempo real.');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
      {/* Left: Mobile hamburger + Institution Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Abrir Menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {config.logoUrl ? (
            <img 
              src={config.logoUrl} 
              alt={config.institutionName} 
              className="h-10 w-10 object-contain rounded-xl bg-white/10 p-1 ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm font-extrabold text-lg tracking-wider shrink-0"
              style={{
                backgroundImage: `linear-gradient(135deg, ${config.primaryColor || '#1e40af'}, ${config.secondaryColor || '#3b82f6'})`
              }}
            >
              <span>{config.institutionName ? config.institutionName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'EC'}</span>
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-900 text-sm leading-tight dark:text-white line-clamp-1">
              {config.institutionName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                <Laptop className="h-3 w-3" /> Ciclo {config.currentAcademicYear}
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DB Local Ilimitada
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Quick search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={canViewPayments ? "Buscar alumno, curso, recibo..." : "Buscar alumno, materia, horario..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right: Actions, Role Selector, E2EE status, Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Simulate Periodic Automated Report */}
        <button
          onClick={runPeriodicAutomatedReport}
          title="Ejecutar simulación de Informe Automatizado y Alerta Push"
          className="hidden xl:flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-all dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Simular Informe Auto</span>
        </button>



        {/* Authenticated Role Badge (Fixed, no demo switching) */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
          currentRole === 'superadmin'
            ? 'border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-xs'
            : currentRole === 'director'
            ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-xs'
            : currentRole === 'cajero'
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs'
            : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
        }`}
        title={`Rol asignado en el sistema: ${roleLabels[currentRole]?.label || currentRole}`}
        >
          <ShieldCheck className={`h-4 w-4 shrink-0 ${currentRole === 'superadmin' ? 'text-purple-500' : 'text-blue-500'}`} />
          <span className="hidden sm:inline">{roleLabels[currentRole]?.label || currentRole}</span>
          <span className="sm:hidden">{currentRole}</span>
        </div>

        {/* Push Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="Ver Notificaciones"
          title="Centro de Notificaciones Push"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Menu & Dropdown */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            title="Abrir menú de usuario"
          >
            <div className="relative">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/30"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {currentUser.name.slice(0, 2)}
                </div>
              )}
              {currentUser.isGoogleLinked && (
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow-xs">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                </span>
              )}
            </div>

            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${roleLabels[currentRole].bg} ${roleLabels[currentRole].text}`}>
                {roleLabels[currentRole].label}
              </span>
            </div>

            <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Popover */}
          {isProfileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileMenuOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-72 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-2">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/40"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold uppercase">
                      {currentUser.name.slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {currentUser.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${roleLabels[currentRole].bg} ${roleLabels[currentRole].text}`}>
                        {roleLabels[currentRole].label}
                      </span>
                      {currentUser.isGoogleLinked && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5">
                          • Google ID
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Mi Perfil & Seguridad</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsAccountSwitcherOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Cambiar de Cuenta</span>
                  </button>
                </div>

                <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                {/* Logout Action */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span>Cerrar Sesión / Salir al Portal</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
    </header>
  );
};
