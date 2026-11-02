/**
 * Teachers / Faculty Directory Module
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  X, 
  Briefcase, 
  Mail, 
  Phone, 
  BookOpen, 
  Award,
  Snowflake,
  PlayCircle,
  PauseCircle,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import { ExcelExporterService } from '../../services/excelExporter';
import { FacePhotoUploader } from '../common/FacePhotoUploader';

export const TeachersModule: React.FC = () => {
  const { teachers, courses, saveTeacher, deleteTeacher, toggleTeacherStatus, currentRole, currentUser, addToast } = useApp();

  const isSuperAdminUser = currentUser.email === 'pixelglez1988@gmail.com' || currentRole === 'superadmin';

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Partial<Teacher>>({});

  const filteredTeachers = teachers.filter(t => 
    t.firstName.toLowerCase().includes(search.toLowerCase()) ||
    t.lastName.toLowerCase().includes(search.toLowerCase()) ||
    t.specialty.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenNew = () => {
    if (!isSuperAdminUser) {
      addToast('error', 'Acceso denegado', 'Solo el Superadmin puede registrar nuevos docentes.');
      return;
    }
    setEditingTeacher({
      id: `doc-${Date.now()}`,
      code: `DOC-2026-${String(teachers.length + 1).padStart(3, '0')}`,
      firstName: '',
      lastName: '',
      dni: '',
      specialty: '',
      email: '',
      phone: '',
      academicDegree: 'Licenciado en Educación',
      assignedCourseIds: [],
      status: 'activo',
      hireDate: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    if (!isSuperAdminUser) {
      addToast('error', 'Acceso denegado', 'Solo el Superadmin puede modificar docentes.');
      return;
    }
    setEditingTeacher({ ...t });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdminUser) {
      addToast('error', 'Acceso denegado', 'Solo el Superadmin puede registrar o modificar docentes.');
      return;
    }
    if (!editingTeacher.firstName || !editingTeacher.lastName || !editingTeacher.specialty) {
      addToast('error', 'Campos obligatorios', 'Completa los nombres, apellidos y especialidad del profesor.');
      return;
    }
    if (!editingTeacher.avatarUrl) {
      addToast('warning', 'Fotografía Facial Obligatoria', 'Es obligatorio subir una foto de rostro del docente para el padrón institucional.');
      return;
    }
    saveTeacher(editingTeacher as Teacher);
    setIsModalOpen(false);
    addToast('success', 'Docente Guardado', `Ficha y fotografía de ${editingTeacher.firstName} guardadas con éxito.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" /> Registro y Nómina de Docentes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Directorio del cuerpo docente con especialidades, carga lectiva y asignaturas vinculadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => ExcelExporterService.exportTeachers(teachers)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Exportar Excel
          </button>
          {isSuperAdminUser && (
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo Docente
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar profesor por nombre, especialidad o código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map(teacher => {
          const assignedCourses = courses.filter(c => c.teacherId === teacher.id);

          return (
            <div
              key={teacher.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {teacher.avatarUrl ? (
                    <img
                      src={teacher.avatarUrl}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="h-11 w-11 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-xs"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-blue-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {teacher.firstName[0]}{teacher.lastName[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      {(teacher.status === 'inactivo' || teacher.status === 'suspendido') && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300">
                          ❄️ Congelado
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{teacher.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isSuperAdminUser && (
                    teacher.status === 'inactivo' || teacher.status === 'suspendido' ? (
                      <button
                        onClick={() => toggleTeacherStatus(teacher.id, 'activo')}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg"
                        title="Reactivar Cuenta de Docente (Habilitar Entrada)"
                      >
                        <PlayCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`¿Congelar / Pausar al docente ${teacher.firstName} ${teacher.lastName}? Se inhabilitará su acceso al sitio hasta reactivarse.`)) {
                            toggleTeacherStatus(teacher.id, 'inactivo');
                          }
                        }}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg"
                        title="Congelar Docente / Inhabilitar Acceso"
                      >
                        <Snowflake className="h-4 w-4" />
                      </button>
                    )
                  )}
                  {isSuperAdminUser && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(teacher)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Retirar al docente ${teacher.firstName} ${teacher.lastName}?`)) {
                            deleteTeacher(teacher.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{teacher.academicDegree}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              {/* Assigned courses tags */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Cursos Asignados ({assignedCourses.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {assignedCourses.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">Sin cursos asignados</span>
                  ) : (
                    assignedCourses.map(c => (
                      <span
                        key={c.id}
                        className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      >
                        {c.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW / EDIT TEACHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                {editingTeacher.id ? 'Editar Ficha de Profesor' : 'Registrar Nuevo Profesor'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              {/* Mandatory Facial Photo */}
              <FacePhotoUploader
                currentPhotoUrl={editingTeacher.avatarUrl}
                required={true}
                label="Fotografía Facial del Docente (Obligatoria)"
                helperText="Rostro nítido y centrado para la credencial y ficha institucional oficial."
                onPhotoSelected={base64 => setEditingTeacher(prev => ({ ...prev, avatarUrl: base64 }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.firstName || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.lastName || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">DNI / Identificación</label>
                  <input
                    type="text"
                    value={editingTeacher.dni || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, dni: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Especialidad Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Matemáticas, Biología..."
                    value={editingTeacher.specialty || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, specialty: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grado Académico</label>
                <input
                  type="text"
                  placeholder="ej. Magíster en Docencia, Licenciado..."
                  value={editingTeacher.academicDegree || ''}
                  onChange={e => setEditingTeacher({ ...editingTeacher, academicDegree: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Institucional</label>
                  <input
                    type="email"
                    value={editingTeacher.email || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editingTeacher.phone || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-colors"
              >
                Guardar Docente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
