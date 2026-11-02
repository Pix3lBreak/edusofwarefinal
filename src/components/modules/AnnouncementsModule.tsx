/**
 * Institutional Announcements & Push Broadcast Module
 */

import React, { useState } from 'react';
import { Megaphone, Plus, Search, Trash2, X, Send, AlertTriangle, Users, Sparkles, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';

export const AnnouncementsModule: React.FC = () => {
  const { announcements, createAnnouncement, currentUser, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newNotice, setNewNotice] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    category: 'academico',
    targetAudience: 'todos',
    priority: 'media',
    author: currentUser.name,
    pushSent: true,
  });

  const filtered = announcements.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchesAudience = filterAudience === 'todos' || a.targetAudience === filterAudience || a.targetAudience === 'todos';
    return matchesSearch && matchesAudience;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'estudiante') {
      addToast('error', 'Acceso denegado', 'Los alumnos sólo pueden recibir comunicados y notificaciones.');
      return;
    }
    if (!newNotice.title || !newNotice.content) {
      addToast('error', 'Campos requeridos', 'Ingresa título y contenido para el comunicado.');
      return;
    }

    const notice: Announcement = {
      id: `ann-${Date.now()}`,
      title: newNotice.title,
      content: newNotice.content,
      category: (newNotice.category as any) || 'academico',
      targetAudience: (newNotice.targetAudience as any) || 'todos',
      author: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      priority: (newNotice.priority as any) || 'media',
      pushSent: true,
    };

    createAnnouncement(notice, true);
    setIsModalOpen(false);
    setNewNotice({
      title: '',
      content: '',
      category: 'academico',
      targetAudience: 'todos',
      priority: 'media',
      author: currentUser.name,
      pushSent: true,
    });
  };

  const priorityBadges = {
    alta: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800',
    media: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    baja: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-blue-600" /> Comunicados & Avisos Institucionales
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tablero de novedades segmentado por audiencia con despacho directo de notificaciones push al teléfono de usuarios.
          </p>
        </div>

        {currentUser.role !== 'estudiante' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Comunicado Push
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar avisos o comunicados..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <select
            value={filterAudience}
            onChange={e => setFilterAudience(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="todos">Toda la Comunidad</option>
            <option value="docentes">Solo Profesores</option>
            <option value="padres">Solo Padres de Familia</option>
            <option value="estudiantes">Solo Estudiantes</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.map(notice => (
          <div
            key={notice.id}
            className={`rounded-2xl border p-5 shadow-xs transition-all ${
              notice.priority === 'alta'
                ? 'border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityBadges[notice.priority]}`}>
                  Prioridad {notice.priority}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 capitalize">
                  Para: {notice.targetAudience}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{notice.date} • Por: {notice.author}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {notice.title}
            </h3>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {notice.content}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <Bell className="h-3.5 w-3.5" /> Notificación Push Despachada
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NEW NOTICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Megaphone className="h-5 w-5" /> Redactar Comunicado Institucional
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título del Aviso *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Suspensión de actividades por feriado..."
                  value={newNotice.title}
                  onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destinatarios</label>
                  <select
                    value={newNotice.targetAudience}
                    onChange={e => setNewNotice({ ...newNotice, targetAudience: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="todos">Toda la Comunidad</option>
                    <option value="docentes">Solo Profesores</option>
                    <option value="padres">Solo Padres de Familia</option>
                    <option value="estudiantes">Solo Alumnos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nivel de Prioridad</label>
                  <select
                    value={newNotice.priority}
                    onChange={e => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  >
                    <option value="baja">Baja (Informativo general)</option>
                    <option value="media">Media (Actividad escolar)</option>
                    <option value="alta">Alta / Urgente (Alerta crítica)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contenido del Comunicado *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribe el mensaje detallado para la comunidad..."
                  value={newNotice.content}
                  onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-blue-50 p-3 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <Bell className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="text-[11px]">
                  Al publicar, se disparará una notificación push instantánea con alerta sonora en los navegadores y teléfonos de los destinatarios.
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Publicar y Enviar Push
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
