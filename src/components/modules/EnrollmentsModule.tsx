/**
 * Enrollments & Student Admissions Module
 */

import React, { useState } from 'react';
import { FileText, Plus, Search, Edit3, Trash2, X, CheckCircle2, Award, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Enrollment } from '../../types';

export const EnrollmentsModule: React.FC = () => {
  const { enrollments, students, config, saveEnrollment, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState<Partial<Enrollment>>({
    code: `MATR-2026-${String(enrollments.length + 1).padStart(3, '0')}`,
    studentId: students[0]?.id || '',
    gradeLevel: '3° Secundaria',
    section: 'A',
    academicYear: config.currentAcademicYear,
    enrollmentDate: new Date().toISOString().slice(0, 10),
    status: 'vigente',
    discountPercentage: 0,
    notes: 'Matrícula regular 2026',
  });

  const studentMap = new Map(students.map(s => [s.id, s]));

  const filteredEnrollments = enrollments.filter(e => {
    const student = studentMap.get(e.studentId);
    return (
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      (student && `${student.firstName} ${student.lastName}`.toLowerCase().includes(search.toLowerCase())) ||
      e.gradeLevel.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnrollment.studentId) return;

    const enrollment: Enrollment = {
      id: `mat-${Date.now()}`,
      code: newEnrollment.code || `MATR-2026-${Date.now().toString().slice(-3)}`,
      studentId: newEnrollment.studentId,
      gradeLevel: newEnrollment.gradeLevel || '3° Secundaria',
      section: newEnrollment.section || 'A',
      academicYear: config.currentAcademicYear,
      enrollmentDate: newEnrollment.enrollmentDate || new Date().toISOString().slice(0, 10),
      status: (newEnrollment.status as any) || 'vigente',
      discountPercentage: Number(newEnrollment.discountPercentage) || 0,
      notes: newEnrollment.notes,
    };

    saveEnrollment(enrollment);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> Registro de Matrículas e Inscripciones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de altas académicas, asignación de secciones, validación de cuota de ingreso y becas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Matrícula
        </button>
      </div>

      {/* Search */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código de matrícula o estudiante..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Constancia</th>
                <th className="py-3 px-4">Estudiante Inscrito</th>
                <th className="py-3 px-4">Grado y Sección</th>
                <th className="py-3 px-4">Año Académico</th>
                <th className="py-3 px-4 text-center">Beca / Descuento</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEnrollments.map(mat => {
                const student = studentMap.get(mat.studentId);

                return (
                  <tr key={mat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {mat.code}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student ? `${student.lastName}, ${student.firstName}` : 'Estudiante'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {student?.code} • DNI: {student?.dni}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {mat.gradeLevel} - Sección "{mat.section}"
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {mat.academicYear}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {mat.discountPercentage > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10px]">
                          {mat.discountPercentage}% BECA
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Tarifa Ordinaria</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {mat.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ENROLLMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="h-5 w-5" /> Nueva Inscripción Escolar
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estudiante a Matricular *</label>
                <select
                  value={newEnrollment.studentId}
                  onChange={e => setNewEnrollment({ ...newEnrollment, studentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.lastName}, {s.firstName} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grado</label>
                  <select
                    value={newEnrollment.gradeLevel}
                    onChange={e => setNewEnrollment({ ...newEnrollment, gradeLevel: e.target.value })}
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sección</label>
                  <input
                    type="text"
                    value={newEnrollment.section}
                    onChange={e => setNewEnrollment({ ...newEnrollment, section: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Porcentaje de Beca / Descuento (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newEnrollment.discountPercentage || 0}
                  onChange={e => setNewEnrollment({ ...newEnrollment, discountPercentage: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={newEnrollment.notes || ''}
                  onChange={e => setNewEnrollment({ ...newEnrollment, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
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
                Emitir Matrícula
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
