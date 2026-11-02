/**
 * Students Module & Automated Digital Expedientes
 * With E2EE encrypted medical file, PDF generation, and Excel export
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  Edit3, 
  Trash2, 
  X, 
  HeartPulse, 
  Award, 
  Calendar,
  Lock,
  Unlock,
  Eye,
  Snowflake,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { ExcelExporterService } from '../../services/excelExporter';
import { FacePhotoUploader } from '../common/FacePhotoUploader';

export const StudentsModule: React.FC = () => {
  const { 
    students, 
    saveStudent, 
    deleteStudent, 
    config, 
    attendances, 
    grades, 
    courses,
    encryptionUnlocked,
    canViewPayments,
    toggleStudentStatus,
    currentRole,
    addToast
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student>>({});

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.dni.includes(search);

    const matchesGrade = filterGrade === 'todos' || s.gradeId === filterGrade;
    const matchesStatus = filterStatus === 'todos' || s.status === filterStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleOpenNew = () => {
    const newCode = `ALU-2026-${String(students.length + 1).padStart(3, '0')}`;
    setEditingStudent({
      id: `alu-${Date.now()}`,
      code: newCode,
      firstName: '',
      lastName: '',
      dni: '',
      birthDate: '2011-01-01',
      gender: 'M',
      email: '',
      phone: '',
      address: '',
      gradeId: '3° Secundaria',
      section: 'A',
      status: 'activo',
      tutorName: '',
      tutorPhone: '',
      tutorEmail: '',
      registrationDate: new Date().toISOString().slice(0, 10),
      healthData: {
        bloodType: 'O+',
        allergies: 'Ninguna',
        chronicConditions: 'Ninguna',
        emergencyHospital: 'Hospital Central',
        psychologicalNotes: 'Buen desenvolvimiento escolar.',
      },
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingStudent({ ...student });
    setIsFormOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent.firstName || !editingStudent.lastName || !editingStudent.dni) {
      addToast('error', 'Campos obligatorios', 'Completa los nombres, apellidos y DNI del alumno.');
      return;
    }

    if (!editingStudent.avatarUrl) {
      addToast('warning', 'Fotografía de Rostro Obligatoria', 'Es obligatorio subir una foto de rostro del alumno para su credencial y ficha institucional.');
      return;
    }

    saveStudent(editingStudent as Student);
    setIsFormOpen(false);
    addToast('success', 'Alumno Guardado', `Ficha con fotografía de ${editingStudent.firstName} registrada con éxito.`);
  };

  const statusColors: Record<string, string> = {
    activo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    becado: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    moroso: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    retirado: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    inactivo: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
    suspendido: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
  };

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" /> Padrón & Expedientes de Alumnos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro automatizado de estudiantes con historial académico, congelamiento de cuenta y emisión de PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => ExcelExporterService.exportStudents(filteredStudents, config)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Exportar Excel
          </button>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Inscribir Alumno
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, código o DNI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="todos">Todos los Grados</option>
            <option value="1° Primaria">1° Primaria</option>
            <option value="2° Primaria">2° Primaria</option>
            <option value="1° Secundaria">1° Secundaria</option>
            <option value="2° Secundaria">2° Secundaria</option>
            <option value="3° Secundaria">3° Secundaria</option>
            <option value="4° Secundaria">4° Secundaria</option>
            <option value="5° Secundaria">5° Secundaria</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Congelados / Inactivos</option>
            <option value="becado">Becados</option>
            <option value="moroso">Con Moras / Pagos Pendientes</option>
            <option value="retirado">Retirados</option>
          </select>
        </div>
      </div>

      {/* Students Data Table / Card Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4">Código / DNI</th>
                <th className="py-3 px-4">Grado & Secc.</th>
                <th className="py-3 px-4">Apoderado / Contacto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No se encontraron estudiantes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {student.lastName}, {student.firstName}
                          </p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      <div>{student.code}</div>
                      <div className="text-[10px] text-slate-400">DNI: {student.dni}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {student.gradeId}
                      </span>
                      <span className="ml-1 text-slate-400 font-medium">({student.section})</span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{student.tutorName}</p>
                      <p className="text-[11px] text-slate-400">{student.tutorPhone}</p>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {(() => {
                        const effectiveStatus = (!canViewPayments && student.status === 'moroso') ? 'activo' : student.status;
                        return (
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusColors[effectiveStatus]}`}>
                            {effectiveStatus}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        {['superadmin', 'director', 'docente'].includes(currentRole) && (
                          student.status === 'inactivo' || student.status === 'suspendido' ? (
                            <button
                              onClick={() => toggleStudentStatus(student.id, 'activo')}
                              title="Reactivar Cuenta de Alumno (Habilitar Entrada)"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`¿Congelar / Pausar la cuenta del alumno ${student.firstName} ${student.lastName}? Su acceso al portal quedará inhabilitado.`)) {
                                  toggleStudentStatus(student.id, 'inactivo');
                                }
                              }}
                              title="Pausar / Congelar Cuenta de Alumno (Inhabilitar Entrada)"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg"
                            >
                              <Snowflake className="h-4 w-4" />
                            </button>
                          )
                        )}
                        <button
                          onClick={() => setSelectedStudent(student)}
                          title="Ver Expediente Integral"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={e => handleOpenEdit(student, e)}
                          title="Editar Datos"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar al estudiante ${student.firstName} ${student.lastName}?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          title="Retirar Alumno"
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT FULL DOSSIER / EXPEDIENTE MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-bold">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Expediente Digital Oficial • {selectedStudent.code}
                  </span>
                  <h3 className="text-xl font-black">{selectedStudent.lastName}, {selectedStudent.firstName}</h3>
                  <p className="text-xs text-blue-200">{selectedStudent.gradeId} - Sección "{selectedStudent.section}" • DNI: {selectedStudent.dni}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Tabs & Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Quick Actions / PDF Generator */}
              <div className="flex flex-wrap gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => PDFGeneratorService.generateStudentFile(selectedStudent, config, attendances, grades, courses)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Descargar Expediente Completo (PDF)
                </button>
                <button
                  onClick={() => PDFGeneratorService.generateReportCard(selectedStudent, grades, courses, config)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <Award className="h-4 w-4" />
                  Descargar Boleta Oficial (PDF)
                </button>
                {['superadmin', 'director', 'docente'].includes(currentRole) && (
                  selectedStudent.status === 'inactivo' || selectedStudent.status === 'suspendido' ? (
                    <button
                      onClick={() => {
                        toggleStudentStatus(selectedStudent.id, 'activo');
                        setSelectedStudent(prev => prev ? ({ ...prev, status: 'activo' }) : null);
                      }}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Reactivar Cuenta Alumno
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (confirm(`¿Pausar o congelar la cuenta de ${selectedStudent.firstName}? Se inhabilitará su acceso al portal escolar.`)) {
                          toggleStudentStatus(selectedStudent.id, 'inactivo');
                          setSelectedStudent(prev => prev ? ({ ...prev, status: 'inactivo' }) : null);
                        }
                      }}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                    >
                      <Snowflake className="h-4 w-4" />
                      Congelar / Inhabilitar Cuenta
                    </button>
                  )
                )}
              </div>

              {/* Personal & Family Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" /> Información Personal y Tutor Legal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Fecha de Nacimiento:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.birthDate}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Dirección Residencial:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.address}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Tutor / Apoderado:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.tutorName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-400 block text-[10px]">Teléfono de Emergencia Tutor:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedStudent.tutorPhone}</span>
                  </div>
                </div>
              </div>

              {/* Ficha Médica Cifrada E2EE */}
              <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <HeartPulse className="h-3.5 w-3.5 text-red-500" /> Ficha Médica y de Emergencia
                  </h4>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" /> Cifrado Extremo a Extremo (E2EE AES-256)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-red-100 bg-red-50/40 dark:border-red-900/30 dark:bg-red-950/20">
                    <span className="text-slate-400 block text-[10px]">Grupo Sanguíneo:</span>
                    <span className="font-bold text-red-700 dark:text-red-300 text-sm">
                      {selectedStudent.healthData?.bloodType || 'O+'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-red-100 bg-red-50/40 dark:border-red-900/30 dark:bg-red-950/20">
                    <span className="text-slate-400 block text-[10px]">Hospital / Clínica de Referencia:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedStudent.healthData?.emergencyHospital || 'Hospital General'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 p-3 rounded-xl border border-amber-100 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <span className="text-slate-400 block text-[10px]">Alergias Conocidas:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedStudent.healthData?.allergies || 'Ninguna registrada'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">Condiciones y Tratamientos:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {selectedStudent.healthData?.chronicConditions || 'Sin condiciones crónicas'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">Observaciones Psicopedagógicas:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {selectedStudent.healthData?.psychologicalNotes || 'Conducta participativa y colaborativa en aula.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Expediente actualizado automáticamente</span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW / EDIT STUDENT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveStudent} 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-400" />
                {editingStudent.id ? 'Editar Ficha de Estudiante' : 'Inscribir Nuevo Alumno'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Mandatory Facial Photo Uploader */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <FacePhotoUploader
                  currentPhotoUrl={editingStudent.avatarUrl}
                  required={true}
                  label="Fotografía del Rostro del Alumno (Obligatoria)"
                  helperText="Sube una fotografía de frente con buena iluminación para el carnet escolar y el expediente digital del alumno."
                  onPhotoSelected={(base64) => setEditingStudent({ ...editingStudent, avatarUrl: base64 })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.firstName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.lastName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">DNI / Documento *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.dni || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, dni: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={editingStudent.birthDate || '2011-01-01'}
                    onChange={e => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grado</label>
                  <select
                    value={editingStudent.gradeId || '3° Secundaria'}
                    onChange={e => setEditingStudent({ ...editingStudent, gradeId: e.target.value })}
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
                    value={editingStudent.section || 'A'}
                    onChange={e => setEditingStudent({ ...editingStudent, section: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estado de Matrícula</label>
                  <select
                    value={editingStudent.status || 'activo'}
                    onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="activo">Activo Regular</option>
                    <option value="becado">Becado (Excelencia)</option>
                    <option value="moroso">Con Moras / Pagos Pendientes</option>
                    <option value="retirado">Retirado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={editingStudent.address || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Tutor Details */}
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white mb-2">Datos del Apoderado / Tutor</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={editingStudent.tutorName || ''}
                      onChange={e => setEditingStudent({ ...editingStudent, tutorName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={editingStudent.tutorPhone || ''}
                      onChange={e => setEditingStudent({ ...editingStudent, tutorPhone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editingStudent.tutorEmail || ''}
                      onChange={e => setEditingStudent({ ...editingStudent, tutorEmail: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-colors"
              >
                Guardar Expediente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
