/**
 * Interactive Weekly Class Schedule Module with conflict detection
 */

import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  BookOpen, 
  School, 
  User,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduleSlot } from '../../types';

export const SchedulesModule: React.FC = () => {
  const { 
    schedules, 
    courses, 
    classrooms, 
    teachers, 
    students,
    currentUser,
    currentRole,
    saveScheduleSlot, 
    deleteScheduleSlot,
    addToast 
  } = useApp();

  const format12Hour = (time: string) => {
    if (!time) return '';
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return time;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${String(h).padStart(2, '0')}:${mStr || '00'} ${ampm}`;
  };

  const [selectedGrade, setSelectedGrade] = useState('3° Secundaria');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If student is logged in, auto-select their grade
  React.useEffect(() => {
    if (currentRole === 'estudiante') {
      const student = students.find(
        s => s.id === currentUser.linkedEntityId || 
        (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (student && student.gradeId) {
        setSelectedGrade(student.gradeId);
      }
    }
  }, [currentRole, currentUser, students]);

  const [newSlot, setNewSlot] = useState<Partial<ScheduleSlot>>({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:30',
    courseId: courses[0]?.id || '',
    classroomId: classrooms[0]?.id || '',
    gradeLevel: '3° Secundaria',
    section: 'A',
  });

  const days = [
    { num: 1, name: 'Lunes' },
    { num: 2, name: 'Martes' },
    { num: 3, name: 'Miércoles' },
    { num: 4, name: 'Jueves' },
    { num: 5, name: 'Viernes' },
    { num: 6, name: 'Sábado' },
    { num: 7, name: 'Domingo' },
  ];

  // Filter schedules for the active grade
  const gradeSchedules = schedules.filter(s => s.gradeLevel === selectedGrade);

  const defaultBlocks = [
    { start: '08:00', end: '09:30' },
    { start: '09:45', end: '11:15' },
    { start: '11:30', end: '13:00' },
    { start: '13:15', end: '14:45' },
  ];

  const timeBlocksMap = new Map<string, { start: string; end: string; label: string }>();
  defaultBlocks.forEach(b => {
    timeBlocksMap.set(`${b.start}-${b.end}`, { ...b, label: `${b.start} - ${b.end}` });
  });
  gradeSchedules.forEach(s => {
    if (s.startTime && s.endTime) {
      const key = `${s.startTime}-${s.endTime}`;
      if (!timeBlocksMap.has(key)) {
        timeBlocksMap.set(key, { start: s.startTime, end: s.endTime, label: `${s.startTime} - ${s.endTime}` });
      }
    }
  });

  const timeBlocks = Array.from(timeBlocksMap.values()).sort((a, b) => a.start.localeCompare(b.start));

  const courseMap = new Map(courses.map(c => [c.id, c]));
  const classroomMap = new Map(classrooms.map(c => [c.id, c]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'estudiante') return;
    if (!newSlot.courseId || !newSlot.classroomId) return;

    // Conflict detection: verify classroom isn't double-booked
    const classroomConflict = schedules.find(
      s => s.dayOfWeek === newSlot.dayOfWeek && 
           s.startTime === newSlot.startTime && 
           s.classroomId === newSlot.classroomId
    );

    if (classroomConflict) {
      addToast('error', 'Conflicto de Aula', `El aula ya se encuentra ocupada por otro grupo en este mismo horario.`);
      return;
    }

    const slot: ScheduleSlot = {
      id: `sch-${Date.now()}`,
      dayOfWeek: newSlot.dayOfWeek as 1 | 2 | 3 | 4 | 5,
      startTime: newSlot.startTime || '08:00',
      endTime: newSlot.endTime || '09:30',
      courseId: newSlot.courseId,
      classroomId: newSlot.classroomId,
      gradeLevel: newSlot.gradeLevel || selectedGrade,
      section: newSlot.section || 'A',
    };

    saveScheduleSlot(slot);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-blue-600" /> Horario Escolar Semanal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentRole === 'estudiante' 
              ? 'Consulta de horario oficial de clases por grado y sección asignada.' 
              : 'Cuadrícula interactiva semanal con prevención automática de colisiones entre aulas y profesores.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {currentRole === 'estudiante' ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/40 py-2 px-3 text-xs font-bold text-blue-700 dark:text-blue-300">
              {selectedGrade} (Mi Sección)
            </div>
          ) : (
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-xs focus:outline-none"
            >
              <option value="3° Secundaria">3° Secundaria (A)</option>
              <option value="4° Secundaria">4° Secundaria (B)</option>
              <option value="1° Primaria">1° Primaria (A)</option>
              <option value="2° Primaria">2° Primaria (A)</option>
            </select>
          )}
          {currentRole !== 'estudiante' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Asignar Bloque
            </button>
          )}
        </div>
      </div>

      {/* Weekly Interactive Timetable Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-2 w-24 text-center border-r border-slate-200 dark:border-slate-800">
                  Horario
                </th>
                {days.map(d => (
                  <th key={d.num} className="py-2.5 px-1.5 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800">
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {timeBlocks.map((block, bIdx) => (
                <tr key={bIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                  <td className="py-4 px-2 text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="text-[11px] font-mono">{format12Hour(block.start)}</div>
                    <div className="text-[10px] text-slate-400 font-normal">a {format12Hour(block.end)}</div>
                  </td>

                  {days.map(d => {
                    const slot = gradeSchedules.find(
                      s => s.dayOfWeek === d.num && s.startTime === block.start
                    );

                    if (!slot) {
                      return (
                        <td 
                          key={d.num} 
                          className="py-2.5 px-1 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800"
                        >
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium italic">
                            Libre
                          </span>
                        </td>
                      );
                    }

                    const course = courseMap.get(slot.courseId);
                    const classroom = classroomMap.get(slot.classroomId);
                    const teacher = course ? teacherMap.get(course.teacherId) : null;

                    return (
                      <td 
                        key={d.num} 
                        className="py-2 px-1 border-r last:border-r-0 border-slate-200 dark:border-slate-800"
                      >
                        <div 
                          className="group relative rounded-xl p-2 border shadow-xs transition-all hover:shadow-md"
                          style={{
                            borderColor: course?.color ? `${course.color}40` : '#94a3b8',
                            backgroundColor: course?.color ? `${course.color}15` : '#f8fafc',
                          }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span 
                              className="font-bold text-xs leading-tight line-clamp-1"
                              style={{ color: course?.color || '#1e293b' }}
                            >
                              {course?.name || 'Materia'}
                            </span>
                            {currentRole !== 'estudiante' && (
                              <button
                                onClick={() => deleteScheduleSlot(slot.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-600 transition-opacity"
                                title="Remover bloque"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          <div className="mt-1.5 space-y-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1 text-slate-500">
                              <School className="h-3 w-3" />
                              <span className="truncate">{classroom?.name || 'Aula'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                              <User className="h-3 w-3" />
                              <span className="truncate">{teacher ? `${teacher.firstName[0]}. ${teacher.lastName}` : 'Profesor'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SCHEDULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddSlot}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CalendarClock className="h-5 w-5" /> Asignar Clase al Horario
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Día de la Semana</label>
                <select
                  value={newSlot.dayOfWeek}
                  onChange={e => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) as any })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                >
                  <option value={1}>Lunes</option>
                  <option value={2}>Martes</option>
                  <option value={3}>Miércoles</option>
                  <option value={4}>Jueves</option>
                  <option value={5}>Viernes</option>
                  <option value={6}>Sábado</option>
                  <option value={7}>Domingo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora de Inicio</label>
                  <input
                    type="time"
                    required
                    value={newSlot.startTime || '08:00'}
                    onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora de Fin</label>
                  <input
                    type="time"
                    required
                    value={newSlot.endTime || '09:30'}
                    onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Asignatura / Curso</label>
                <select
                  value={newSlot.courseId}
                  onChange={e => setNewSlot({ ...newSlot, courseId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Aula / Salón Asignado</label>
                <select
                  value={newSlot.classroomId}
                  onChange={e => setNewSlot({ ...newSlot, classroomId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Cap: {c.capacity}
                    </option>
                  ))}
                </select>
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
                Guardar Bloque
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
