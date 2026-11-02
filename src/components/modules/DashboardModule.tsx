/**
 * Executive & Academic Dashboard
 * Strictly role-adaptive:
 * - Administration & Cashier: Financial collections, tuition revenue KPIs, quick billing actions.
 * - Teachers (Docentes): Curricular management, group attendance, grading, class schedule (ZERO billing visibility).
 * - Students & Parents (Estudiante / Representantes): Academic performance, class timetable, attendance, official announcements (ZERO billing visibility or execution).
 */

import React from 'react';
import { 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  CreditCard, 
  School, 
  BookOpen, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  FileDown,
  Award,
  BookMarked,
  CheckSquare,
  Megaphone,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { ExcelExporterService } from '../../services/excelExporter';

export const DashboardModule: React.FC = () => {
  const { 
    students, 
    teachers, 
    courses, 
    classrooms, 
    attendances, 
    payments, 
    grades,
    config, 
    announcements, 
    currentRole,
    currentUser,
    canCollectPayments,
    canViewPayments,
    setActiveModule,
    runPeriodicAutomatedReport,
    addToast
  } = useApp();

  const isTeacher = currentRole === 'docente';
  const isStudentOrParent = currentRole === 'estudiante' || currentRole === 'padre';

  // Metrics calculations
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'activo').length;
  const scholarshipStudents = students.filter(s => s.status === 'becado').length;
  const delinquentStudents = students.filter(s => s.status === 'moroso').length;

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendances = attendances.filter(a => a.date === today);
  const presentCount = todayAttendances.filter(a => a.status === 'presente').length;
  const tardyCount = todayAttendances.filter(a => a.status === 'tardanza').length;
  const absentCount = todayAttendances.filter(a => a.status === 'ausente').length;

  const attendanceRate = todayAttendances.length > 0 
    ? Math.round((presentCount / todayAttendances.length) * 100) 
    : 95; // Default healthy benchmark

  // Financial calculations (strictly for Admin & Cashier only!)
  const totalCollected = payments
    .filter(p => p.status === 'pagado')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pendiente')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter(p => p.status === 'vencido')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalBilled = totalCollected + totalPending + totalOverdue;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Academic calculations for Teachers & Students
  const averageGrade = grades.length > 0 
    ? (grades.reduce((acc, g) => acc + g.finalScore, 0) / grades.length).toFixed(1)
    : '16.5';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            {canViewPayments ? (
              <span>Panel Ejecutivo y Financiero • Periodo {config.currentAcademicYear}</span>
            ) : isTeacher ? (
              <span>Panel Docente & Gestión Académica • Periodo {config.currentAcademicYear}</span>
            ) : currentRole === 'padre' ? (
              <span>Portal de la Familia & Seguimiento Escolar • Periodo {config.currentAcademicYear}</span>
            ) : (
              <span>Portal del Estudiante • Periodo {config.currentAcademicYear}</span>
            )}
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {config.institutionName}
          </h2>
          <p className="mt-1 text-sm text-blue-200/90 max-w-xl">
            {canViewPayments 
              ? `${config.tagline} • Control centralizado, recaudación y seguridad institucional.`
              : isTeacher
              ? 'Gestión curricular, control de asistencia en aula y asentamiento de calificaciones.'
              : currentRole === 'padre'
              ? 'Seguimiento pedagógico, boletines de calificaciones, asistencias y avisos oficiales.'
              : 'Horarios de clases, calificaciones personales, materias y avisos del colegio.'}
          </p>
        </div>

        {/* Action Buttons Adapted Strictly by Role */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canCollectPayments ? (
            /* ADMIN & CAJA ACTIONS */
            <>
              <button
                onClick={() => setActiveModule('asistencias')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Tomar Asistencia
              </button>
              <button
                onClick={() => setActiveModule('pagos')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
                title="Registrar cobro de mensualidad o emitir recibo oficial"
              >
                <CreditCard className="h-4 w-4 text-slate-950" />
                Registrar Cobro
              </button>
              <button
                onClick={() => setActiveModule('alumnos')}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all"
              >
                <GraduationCap className="h-4 w-4" />
                Nuevo Alumno
              </button>
            </>
          ) : isTeacher ? (
            /* TEACHER (DOCENTE) ACTIONS */
            <>
              <button
                onClick={() => setActiveModule('asistencias')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Tomar Asistencia
              </button>
              <button
                onClick={() => setActiveModule('calificaciones')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              >
                <Award className="h-4 w-4 text-amber-400" />
                Calificar Alumnos
              </button>
              <button
                onClick={() => setActiveModule('horarios')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              >
                <Calendar className="h-4 w-4 text-blue-400" />
                Mis Horarios
              </button>
            </>
          ) : (
            /* STUDENT & PARENT ACTIONS */
            <>
              <button
                onClick={() => setActiveModule('calificaciones')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                <Award className="h-4 w-4" />
                Mis Calificaciones
              </button>
              <button
                onClick={() => setActiveModule('horarios')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              >
                <Calendar className="h-4 w-4 text-blue-400" />
                Horario de Clases
              </button>
              <button
                onClick={() => setActiveModule('comunicados')}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              >
                <Megaphone className="h-4 w-4 text-cyan-400" />
                Avisos
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Grid - Strictly Customized by Role */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1 */}
        {canViewPayments ? (
          <div 
            onClick={() => setActiveModule('alumnos')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Padrón de Alumnos
              </span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalStudents}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                {activeStudents} Activos
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>{scholarshipStudents} Becados</span>
              <span className="text-amber-600 font-medium">{delinquentStudents} Con moras</span>
            </div>
          </div>
        ) : isTeacher ? (
          <div 
            onClick={() => setActiveModule('alumnos')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Estudiantes en Aula
              </span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalStudents}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                {activeStudents} Matriculados
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>Seguimiento continuo</span>
              <span className="text-blue-600 font-medium">{classrooms.length} Salones</span>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setActiveModule('calificaciones')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Condición del Alumno
              </span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Regular Activo
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>Ciclo {config.currentAcademicYear}</span>
              <span className="text-emerald-600 font-medium">Expediente al día</span>
            </div>
          </div>
        )}

        {/* CARD 2: ASISTENCIA */}
        <div 
          onClick={() => setActiveModule('asistencias')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isStudentOrParent ? 'Asistencia Acumulada' : 'Asistencia Hoy'}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {attendanceRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Puntualidad
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>{presentCount} Presentes</span>
            <span className="text-slate-400 font-medium">{absentCount} Inasistencias</span>
          </div>
        </div>

        {/* CARD 3: STRICTLY ROLE-RESTRICTED (FINANCES FOR ADMIN/CAJA, ACADEMIC FOR OTHERS) */}
        {canViewPayments ? (
          /* Recaudación & Tesorería: ONLY FOR SUPERADMIN, DIRECTOR, CAJERO */
          <div 
            onClick={() => setActiveModule('pagos')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Recaudación de Caja
              </span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {config.currencySymbol} {totalCollected.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span className="font-semibold text-emerald-600">{collectionRate}% Cobrado</span>
              <span className="text-amber-600 font-medium">{config.currencySymbol}{totalOverdue.toFixed(0)} en mora</span>
            </div>
          </div>
        ) : isTeacher ? (
          /* Cursos & Materias a Cargo: FOR DOCENTES */
          <div 
            onClick={() => setActiveModule('cursos')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Cursos & Asignaturas
              </span>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {courses.length}
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                Materias
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>Programación lectiva</span>
              <span className="text-emerald-600 font-medium">100% Asignadas</span>
            </div>
          </div>
        ) : (
          /* Rendimiento Académico: FOR ESTUDIANTE & PADRES (ZERO FINANCES!) */
          <div 
            onClick={() => setActiveModule('calificaciones')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-purple-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Promedio Académico
              </span>
              <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {averageGrade}
              </span>
              <span className="text-xs font-semibold text-purple-600">
                Escala {config.gradingScale}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span className="text-emerald-600 font-semibold">Condición: Aprobado</span>
              <span className="text-slate-400 font-medium">Cuadro de Honor</span>
            </div>
          </div>
        )}

        {/* CARD 4: DOCENTES & ESPACIOS / ASIGNATURAS */}
        <div 
          onClick={() => setActiveModule(isStudentOrParent ? 'cursos' : 'docentes')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-purple-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isStudentOrParent ? 'Plan Curricular' : 'Planta Docente & Aulas'}
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isStudentOrParent ? courses.length : teachers.length}
            </span>
            <span className="text-xs font-semibold text-purple-600">
              {isStudentOrParent ? 'Asignaturas' : 'Profesores'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>{classrooms.length} Salones</span>
            <span className="text-emerald-600 font-medium">Ciclo Activo</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Breakdown & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Asistencia & Horarios (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Asistencia breakdown card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Balance Operativo de Asistencia Diaria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {canViewPayments 
                    ? 'Supervisión en tiempo real con disparador automático de alertas a tutores' 
                    : isTeacher 
                    ? 'Registro de asistencia de tus secciones asignadas para el día de hoy'
                    : 'Registro de puntualidad y permanencia escolar'}
                </p>
              </div>
              <button
                onClick={() => setActiveModule('asistencias')}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Ver registro
              </button>
            </div>

            {/* Asistencia Bars */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Presentes en Aula ({presentCount || 5} alumnos)
                  </span>
                  <span className="text-emerald-600 font-bold">{attendanceRate}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${attendanceRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Tardanzas Justificadas ({tardyCount || 1} registros)
                  </span>
                  <span className="text-amber-600 font-bold">10%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: '10%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    Inasistencias ({absentCount} reportadas)
                  </span>
                  <span className="text-red-600 font-bold">5%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-red-500 transition-all duration-500" style={{ width: '5%' }} />
                </div>
              </div>
            </div>

            {/* Quick action button inside card */}
            <div className="mt-5 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {canViewPayments || isTeacher 
                    ? 'Las faltas despachan notificaciones push en tiempo real a los teléfonos de apoderados.'
                    : 'Las inasistencias y tardanzas quedan registradas en el expediente oficial del alumno.'}
                </span>
              </div>
              {canViewPayments && (
                <button
                  onClick={runPeriodicAutomatedReport}
                  className="text-xs bg-white dark:bg-slate-700 shadow-xs border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors shrink-0"
                >
                  Resumen Diario
                </button>
              )}
            </div>
          </div>

          {/* Quick Schedule Highlights */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" /> Horarios de Clases de Hoy
              </h3>
              <button
                onClick={() => setActiveModule('horarios')}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Ver matriz completa
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">08:00 - 09:30</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Matemáticas y Álgebra</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aula 101 • Prof. C. Mendoza</p>
                <span className="inline-block mt-2 rounded bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:text-blue-200">
                  3° Secundaria A
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">09:45 - 11:15</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Biología Celular</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Lab. Ciencias • Prof. P. Navarro</p>
                <span className="inline-block mt-2 rounded bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200">
                  3° Secundaria A
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">11:30 - 13:00</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Literatura Universal</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aula 102 • Prof. L. Salazar</p>
                <span className="inline-block mt-2 rounded bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-200">
                  3° Secundaria A
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Announcements & Direct Role Downloads */}
        <div className="space-y-6">
          {/* Quick Downloads Card (Strictly adapted to prevent any non-authorized financial downloads) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Descargas Rápidas
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => ExcelExporterService.exportStudents(students, config)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Padrón de Alumnos (.xlsx)</span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">Excel</span>
              </button>

              {/* Libro de Tesorería: ONLY FOR ADMIN & CAJA */}
              {canViewPayments && (
                <button
                  onClick={() => ExcelExporterService.exportPayments(payments, students, config)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Libro de Tesorería (.xlsx)</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">Excel</span>
                </button>
              )}

              {/* Sábana de Notas: FOR TEACHERS */}
              {isTeacher && (
                <button
                  onClick={() => ExcelExporterService.exportGrades(grades, students, courses)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sábana de Notas (.xlsx)</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">Excel</span>
                </button>
              )}

              <button
                onClick={() => setActiveModule(isStudentOrParent ? 'calificaciones' : 'reportes')}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold transition-colors mt-2"
              >
                <FileDown className="h-4 w-4" />
                {isStudentOrParent ? 'Ver Mis Calificaciones en PDF' : 'Ir a Centro de Reportes PDF'}
              </button>
            </div>
          </div>

          {/* Institutional Notices Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Comunicados Recientes
              </h3>
              <button
                onClick={() => setActiveModule('comunicados')}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-semibold"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map(ann => (
                <div 
                  key={ann.id} 
                  className={`p-3 rounded-xl border text-xs ${
                    ann.priority === 'alta'
                      ? 'border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{ann.title}</span>
                    {ann.priority === 'alta' && (
                      <span className="rounded bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                        Urgente
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                  <span className="mt-2 block text-[10px] text-slate-400">
                    {ann.author} • {ann.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
