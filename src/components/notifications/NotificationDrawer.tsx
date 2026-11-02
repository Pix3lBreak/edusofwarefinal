/**
 * Push Notifications Center & Live Alert Dispatcher
 */

import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Info, 
  CreditCard, 
  GraduationCap, 
  CheckCheck, 
  Trash2, 
  Send,
  Sparkles,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationService } from '../../services/notifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    clearAllNotifications, 
    triggerPushAlert, 
    runPeriodicAutomatedReport,
    addToast 
  } = useApp();

  const [filter, setFilter] = useState<'todas' | 'critica' | 'pago' | 'info'>('todas');
  const [showComposer, setShowComposer] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [isCritical, setIsCritical] = useState(false);

  if (!isOpen) return null;

  const filtered = notifications.filter(n => filter === 'todas' || n.type === filter);
  const permStatus = NotificationService.getPermissionStatus();

  const handleSendCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customBody) return;
    triggerPushAlert(customTitle, customBody, isCritical);
    setCustomTitle('');
    setCustomBody('');
    setShowComposer(false);
  };

  const handleRequestNative = async () => {
    const res = await NotificationService.requestPermission();
    if (res === 'granted') {
      addToast('success', 'Permiso Concedido', 'Notificaciones de escritorio y móviles habilitadas.');
    } else {
      addToast('warning', 'Permiso denegado', 'Permite las notificaciones en tu navegador.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critica':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pago':
        return <CreditCard className="h-4 w-4 text-amber-600" />;
      case 'academica':
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col dark:bg-slate-900 dark:border-l dark:border-slate-800 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Centro de Notificaciones Push</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Alertas críticas y avisos en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Browser Permission Banner */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Push de Navegador: </span>
            <span className={permStatus === 'granted' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
              {permStatus === 'granted' ? 'Habilitado' : 'Sin activar'}
            </span>
          </div>
          {permStatus !== 'granted' && (
            <button
              onClick={handleRequestNative}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded-md transition-colors"
            >
              Habilitar Push
            </button>
          )}
        </div>

        {/* Quick Trigger Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-blue-50/50 border-b border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComposer(!showComposer)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{showComposer ? 'Cerrar Emisor' : 'Emitir Alerta Push'}</span>
            </button>
            <button
              onClick={() => {
                triggerPushAlert('🔔 Notificación Push Institucional', 'Prueba exitosa del sistema de alertas push instantáneas en tiempo real.', false);
              }}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 flex items-center gap-1"
              title="Probar notificación push y sonido en vivo"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Probar Alerta</span>
            </button>
          </div>

          <button
            onClick={runPeriodicAutomatedReport}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
            title="Ejecuta el informe programado del día"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Informe Auto</span>
          </button>
        </div>

        {/* Custom Push Composer Modal/Section */}
        {showComposer && (
          <form onSubmit={handleSendCustomAlert} className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Emitir Notificación Push Instantánea</h3>
            <input
              type="text"
              placeholder="Título de la alerta..."
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              required
              className="w-full text-xs rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 text-slate-800 dark:text-white"
            />
            <textarea
              placeholder="Cuerpo del mensaje o instrucción para padres/docentes..."
              value={customBody}
              onChange={e => setCustomBody(e.target.value)}
              rows={2}
              required
              className="w-full text-xs rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 text-slate-800 dark:text-white"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCritical}
                  onChange={e => setIsCritical(e.target.checked)}
                  className="rounded text-red-600"
                />
                <span className="font-medium text-red-600 dark:text-red-400">Marcar como Alerta Crítica (Sonido fuerte)</span>
              </label>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                Despachar
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {(['todas', 'critica', 'pago', 'info'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {f === 'todas' ? 'Todas' : f === 'critica' ? 'Críticas' : f === 'pago' ? 'Cobranzas' : 'Informes'}
            </button>
          ))}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="ml-auto text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
              title="Borrar todas"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
              <Bell className="h-10 w-10 stroke-1 mb-2 opacity-50" />
              <p className="text-xs font-medium">No hay notificaciones en este filtro</p>
            </div>
          ) : (
            filtered.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`group relative rounded-xl border p-3 transition-all cursor-pointer ${
                  notif.read
                    ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/40 opacity-75'
                    : notif.type === 'critica'
                    ? 'border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/30'
                    : 'border-blue-200 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg p-1.5 bg-white shadow-xs dark:bg-slate-800">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.body}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          NotificationService.playChime(notif.type === 'critica' ? 'critical' : 'info');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-blue-600 dark:text-blue-400"
                        title="Reproducir timbre sonoro"
                      >
                        <Volume2 className="h-3 w-3" /> Probar timbre
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
