/**
 * Classrooms & Educational Spaces Management Module
 */

import React, { useState } from 'react';
import { School, Plus, Search, Edit3, Trash2, X, CheckCircle2, AlertTriangle, Monitor, Wind, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Classroom } from '../../types';

export const ClassroomsModule: React.FC = () => {
  const { classrooms, saveClassroom, deleteClassroom, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Partial<Classroom>>({});

  const filteredClassrooms = classrooms.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.building.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenNew = () => {
    setEditingClassroom({
      id: `aul-${Date.now()}`,
      code: `AULA-${Math.floor(Math.random() * 800) + 100}`,
      name: '',
      building: 'Pabellón Principal (A)',
      floor: 1,
      capacity: 35,
      resources: ['Proyector Multimedia 4K', 'Pizarra Inteligente', 'Aire Acondicionado'],
      status: 'disponible',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Classroom) => {
    setEditingClassroom({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassroom.name) {
      addToast('error', 'Nombre requerido', 'Ingresa el nombre descriptivo del aula.');
      return;
    }
    saveClassroom(editingClassroom as Classroom);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <School className="h-6 w-6 text-indigo-600" /> Aulas y Espacios de Aprendizaje
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catálogo de salones, laboratorios, talleres, aforo máximo y recursos multimedia equipados.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Registrar Aula
        </button>
      </div>

      {/* Search */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar aula por nombre, código o pabellón..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClassrooms.map(room => (
          <div
            key={room.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {room.code}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">{room.name}</h3>
                <p className="text-xs text-slate-400">{room.building} • Piso {room.floor}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(room)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar ${room.name}?`)) deleteClassroom(room.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">Capacidad Máxima:</span>
              <span className="font-bold text-slate-900 dark:text-white">{room.capacity} estudiantes</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Equipamiento y Recursos
              </span>
              <div className="flex flex-wrap gap-1.5">
                {room.resources.map((res, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW / EDIT CLASSROOM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-indigo-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <School className="h-5 w-5" />
                {editingClassroom.id ? 'Editar Aula / Espacio' : 'Registrar Nuevo Salón'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Descriptivo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Aula 103 - Matemática, Laboratorio B..."
                  value={editingClassroom.name || ''}
                  onChange={e => setEditingClassroom({ ...editingClassroom, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pabellón / Edificio</label>
                  <input
                    type="text"
                    value={editingClassroom.building || ''}
                    onChange={e => setEditingClassroom({ ...editingClassroom, building: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Capacidad Máxima</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingClassroom.capacity || 30}
                    onChange={e => setEditingClassroom({ ...editingClassroom, capacity: parseInt(e.target.value) || 30 })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
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
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-colors"
              >
                Guardar Aula
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
