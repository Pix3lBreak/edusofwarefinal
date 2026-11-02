/**
 * Daily Attendance Module with 1-click batch actions and automated push alert triggers
 */

import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileCheck, 
  Send, 
  Calendar, 
  BookOpen, 
  Users, 
  AlertTriangle,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';

export const AttendanceModule: React.FC = () => {
  const { 
    students, 
    courses, 
    attendances, 
    recordAttendanceBatch, 
    teachers, 
    currentRole,
    currentUser,
    triggerPushAlert,
    addToast 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [currentRecords, setCurrentRecords] = useState<Record<string, { status: AttendanceStatus; comment: string }>>({});

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const teacher = teachers.find(t => t.id === selectedCourse?.teacherId);

  // If student is logged in, show only their own attendance
  const currentStudent = students.find(
    s => s.id === currentUser.linkedEntityId || 
    (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase())
  ) || students[0];

  const courseStudents = currentRole === 'estudiante'
    ? (currentStudent ? [currentStudent] : students.slice(0, 1))
    : students.filter(s => s.gradeId === selectedCourse?.gradeLevel || !selectedCourse);

  // Initialize records when date or course changes
  React.useEffect(() => {
    const existingForDay = attendances.filter(a => a.date === selectedDate && a.courseId === selectedCourseId);
    const map: Record<string, { status: AttendanceStatus; comment: string }> = {};

    courseStudents.forEach(s => {
      const match = existingForDay.find(a => a.studentId === s.id);
      map[s.id] = {
        status: match ? match.status : 'presente',
        comment: match?.comment || '',
      };
    });

    setCurrentRecords(map);
  }, [selectedDate, selectedCourseId, attendances, courseStudents.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (currentRole === 'estudiante') return;
    setCurrentRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    if (currentRole === 'estudiante') return;
    setCurrentRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    if (currentRole === 'estudiante') return;
    const updated: Record<string, { status: AttendanceStatus; comment: string }> = {};
    courseStudents.forEach(s => {
      updated[s.id] = { status: 'presente', comment: '' };
    });
    setCurrentRecords(updated);
    addToast('info', 'Asistencia Masiva', 'Se marcaron todos los estudiantes como Presentes.');
  };

  const handleSaveAttendance = () => {
    if (currentRole === 'estudiante') {
      addToast('error', 'Acción Denegada', 'Los estudiantes no pueden asentar asistencias.');
      return;
    }
    const recordsToSave: AttendanceRecord[] = courseStudents.map(s => ({
      id: `att-${selectedDate}-${selectedCourseId}-${s.id}`,
      date: selectedDate,
      courseId: selectedCourseId,
      studentId: s.id,
      status: currentRecords[s.id]?.status || 'presente',
      comment: currentRecords[s.id]?.comment,
      registeredByTeacherId: teacher?.id || 'doc-1',
    }));

    recordAttendanceBatch(recordsToSave);
  };

  // Stats calculation
  const totalInCourse = courseStudents.length;
  const presentCount = Object.values(currentRecords).filter(r => r.status === 'presente').length;
  const tardyCount = Object.values(currentRecords).filter(r => r.status === 'tardanza').length;
  const absentCount = Object.values(currentRecords).filter(r => r.status === 'ausente').length;
  const justifiedCount = Object.values(currentRecords).filter(r => r.status === 'justificado').length;
  const rate = totalInCourse > 0 ? Math.round((presentCount / totalInCourse) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-emerald-600" /> 
            {currentRole === 'estudiante' ? 'Mi Registro de Asistencia' : 'Control de Asistencia y Puntualidad'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentRole === 'estudiante'
              ? 'Consulta personal de registro de asistencia por asignatura y fecha oficial.'
              : 'Registro diario por aula/materia con despacho automático de alertas a tutores por inasistencias o tardanzas.'}
          </p>
        </div>

        {currentRole !== 'estudiante' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleMarkAllPresent}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
            >
              ✓ Todos Presentes
            </button>
            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Guardar Asistencia
            </button>
          </div>
        )}
      </div>

      {/* Control Filters and Live Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Fecha de Pase de Lista
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Asignatura y Grado
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.gradeLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Profesor Asignado
          </label>
          <div className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Docente Titular'}
          </div>
        </div>
      </div>

      {/* Summary KPI Counters for Current Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Presentes</span>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{presentCount}</p>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-60" />
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">Tardanzas</span>
            <p className="text-xl font-black text-amber-700 dark:text-amber-400">{tardyCount}</p>
          </div>
          <Clock className="h-6 w-6 text-amber-500 opacity-60" />
        </div>

        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-red-800 dark:text-red-300">Ausentes (Crítico)</span>
            <p className="text-xl font-black text-red-700 dark:text-red-400">{absentCount}</p>
          </div>
          <XCircle className="h-6 w-6 text-red-500 opacity-60" />
        </div>

        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300">Justificados</span>
            <p className="text-xl font-black text-blue-700 dark:text-blue-400">{justifiedCount}</p>
          </div>
          <FileCheck className="h-6 w-6 text-blue-500 opacity-60" />
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4 text-center">Estado de Asistencia</th>
                <th className="py-3 px-4">Observación / Justificación</th>
                <th className="py-3 px-4 text-right">Alerta Tutor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courseStudents.map((student, idx) => {
                const record = currentRecords[student.id] || { status: 'presente', comment: '' };

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.lastName}, {student.firstName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {student.code} • Tutor: {student.tutorName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {currentRole === 'estudiante' ? (
                        <div className="flex items-center justify-center">
                          <span className={`px-3 py-1 rounded-full font-bold text-xs capitalize ${
                            record.status === 'presente' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : record.status === 'tardanza'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : record.status === 'ausente'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {record.status === 'presente' ? '✓ Presente' : record.status}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'presente')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              record.status === 'presente'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Presente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'tardanza')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              record.status === 'tardanza'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Tardanza
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ausente')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              record.status === 'ausente'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-red-50 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Falta
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'justificado')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              record.status === 'justificado'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Justif.
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {currentRole === 'estudiante' ? (
                        <span className="text-xs text-slate-600 dark:text-slate-300 italic">
                          {record.comment || 'Sin observaciones registradas'}
                        </span>
                      ) : (
                        <input
                          type="text"
                          placeholder="Motivo de tardanza o justificación..."
                          value={record.comment || ''}
                          onChange={e => handleCommentChange(student.id, e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {currentRole === 'estudiante' ? (
                        <span className="text-[11px] text-slate-400 font-medium">Asentado</span>
                      ) : record.status === 'ausente' ? (
                        <button
                          type="button"
                          onClick={() => {
                            triggerPushAlert(
                              `🚨 Aviso de Inasistencia: ${student.firstName} ${student.lastName}`,
                              `Estimado(a) ${student.tutorName}, se le informa que su menor hijo(a) no asistió a la clase de ${selectedCourse?.name} hoy ${selectedDate}. Favor comunicarse con el colegio.`,
                              true
                            );
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 rounded-lg transition-colors"
                          title="Enviar notificación push inmediata al móvil del apoderado"
                        >
                          <Send className="h-3 w-3" /> Push a Tutor
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Regular</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
