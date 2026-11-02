/**
 * Courses & Subjects Curriculum Module
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Search, Edit3, Trash2, X, User, Clock, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';

export const CoursesModule: React.FC = () => {
  const { courses, teachers, students, currentUser, saveCourse, deleteCourse, currentRole, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course>>({});

  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  const currentStudent = currentRole === 'estudiante'
    ? students.find(s => s.id === currentUser.linkedEntityId || (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()))
    : null;

  const filteredCourses = courses.filter(c => {
    if (currentRole === 'estudiante' && currentStudent) {
      if (c.gradeLevel !== currentStudent.gradeId) return false;
    }
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.gradeLevel.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenNew = () => {
    if (currentRole === 'estudiante') return;
    setEditingCourse({
      id: `cur-${Date.now()}`,
      code: `CUR-${Math.floor(Math.random() * 800) + 100}`,
      name: '',
      gradeLevel: '3° Secundaria',
      teacherId: teachers[0]?.id || '',
      weeklyHours: 4,
      color: '#3B82F6',
      evaluationWeights: { exams: 40, homeworks: 30, projects: 20, attendance: 10 },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    if (currentRole === 'estudiante') return;
    setEditingCourse({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'estudiante') return;
    if (!editingCourse.name) {
      addToast('error', 'Nombre requerido', 'Ingresa el nombre del curso.');
      return;
    }
    saveCourse(editingCourse as Course);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" /> Plan Curricular y Cursos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentRole === 'estudiante'
              ? 'Consulta de catálogo de asignaturas, ponderación evaluativa y docentes.'
              : 'Catálogo de materias por nivel académico, ponderación de evaluaciones y docentes a cargo.'}
          </p>
        </div>

        {currentRole !== 'estudiante' && (
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Materia
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar materia o asignatura..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => {
          const teacher = teacherMap.get(course.teacherId);

          return (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs"
                    style={{ backgroundColor: course.color || '#3b82f6' }}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{course.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {course.gradeLevel} • {course.code}
                    </span>
                  </div>
                </div>

                {currentRole !== 'estudiante' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar ${course.name}?`)) deleteCourse(course.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Sin profesor'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{course.weeklyHours} Horas pedagógicas semanales</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Ponderación de Notas
                </span>
                <div className="grid grid-cols-4 gap-1 text-center font-bold">
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded text-slate-700 dark:text-slate-300">
                    <span className="text-[9px] block text-slate-400 font-normal">Exám</span>
                    {course.evaluationWeights.exams}%
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded text-slate-700 dark:text-slate-300">
                    <span className="text-[9px] block text-slate-400 font-normal">Tareas</span>
                    {course.evaluationWeights.homeworks}%
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded text-slate-700 dark:text-slate-300">
                    <span className="text-[9px] block text-slate-400 font-normal">Proy</span>
                    {course.evaluationWeights.projects}%
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded text-slate-700 dark:text-slate-300">
                    <span className="text-[9px] block text-slate-400 font-normal">Asist</span>
                    {course.evaluationWeights.attendance}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW / EDIT COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {editingCourse.id ? 'Editar Materia' : 'Nueva Asignatura'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de la Materia *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.name || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grado / Nivel</label>
                  <select
                    value={editingCourse.gradeLevel || '3° Secundaria'}
                    onChange={e => setEditingCourse({ ...editingCourse, gradeLevel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="1° Primaria">1° Primaria</option>
                    <option value="2° Primaria">2° Primaria</option>
                    <option value="3° Secundaria">3° Secundaria</option>
                    <option value="4° Secundaria">4° Secundaria</option>
                    <option value="5° Secundaria">5° Secundaria</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Docente Asignado</label>
                  <select
                    value={editingCourse.teacherId}
                    onChange={e => setEditingCourse({ ...editingCourse, teacherId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
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
                Guardar Curso
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
