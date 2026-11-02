/**
 * Academic Grades & Official Report Card (Boletas) Module
 */

import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Search, 
  FileSpreadsheet, 
  FileDown, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  TrendingUp,
  Save
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GradeRecord, Student } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { ExcelExporterService } from '../../services/excelExporter';

export const GradesModule: React.FC = () => {
  const { 
    students, 
    courses, 
    grades, 
    saveGrade, 
    config, 
    teachers,
    currentRole,
    currentUser,
    addToast 
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<GradeRecord['period']>('1° Bimestre');
  const [editingScores, setEditingScores] = useState<Record<string, { exam: number; homework: number; project: number; attendance: number; comments: string }>>({});

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const teacher = teachers.find(t => t.id === activeCourse?.teacherId);

  // If student is logged in, show only their own grades
  const currentStudent = students.find(
    s => s.id === currentUser.linkedEntityId || 
    (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase())
  ) || students[0];

  const enrolledStudents = currentRole === 'estudiante'
    ? (currentStudent ? [currentStudent] : students.slice(0, 1))
    : students.filter(s => s.gradeId === activeCourse?.gradeLevel || !activeCourse);

  // Sync state when course or period changes
  React.useEffect(() => {
    const map: Record<string, { exam: number; homework: number; project: number; attendance: number; comments: string }> = {};

    enrolledStudents.forEach(s => {
      const match = grades.find(g => g.studentId === s.id && g.courseId === selectedCourseId && g.period === selectedPeriod);
      map[s.id] = {
        exam: match ? match.examScore : 15,
        homework: match ? match.homeworkScore : 16,
        project: match ? match.projectScore : 16,
        attendance: match ? match.attendanceScore : 18,
        comments: match?.comments || '',
      };
    });

    setEditingScores(map);
  }, [selectedCourseId, selectedPeriod, grades, enrolledStudents.length]);

  const handleScoreChange = (studentId: string, field: 'exam' | 'homework' | 'project' | 'attendance', val: number) => {
    if (currentRole === 'estudiante') return;
    // Clamp to scale
    const max = config.gradingScale === '0-20' ? 20 : config.gradingScale === '0-10' ? 10 : 100;
    const clamped = Math.max(0, Math.min(max, val));

    setEditingScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: clamped,
      },
    }));
  };

  const calculateFinal = (studentId: string): number => {
    const item = editingScores[studentId];
    if (!item) return 0;
    const weights = activeCourse?.evaluationWeights || { exams: 40, homeworks: 30, projects: 20, attendance: 10 };
    const weighted = (item.exam * (weights.exams / 100)) +
                     (item.homework * (weights.homeworks / 100)) +
                     (item.project * (weights.projects / 100)) +
                     (item.attendance * (weights.attendance / 100));
    return Number(weighted.toFixed(1));
  };

  const handleSaveAllGrades = () => {
    if (currentRole === 'estudiante') {
      addToast('error', 'Acción no permitida', 'Los estudiantes no tienen autorización para modificar calificaciones.');
      return;
    }
    enrolledStudents.forEach(student => {
      const score = editingScores[student.id];
      if (!score) return;

      const finalScore = calculateFinal(student.id);
      const newGradeRecord: GradeRecord = {
        id: `gra-${selectedPeriod.replace(/\s+/g, '')}-${selectedCourseId}-${student.id}`,
        studentId: student.id,
        courseId: selectedCourseId,
        period: selectedPeriod,
        examScore: score.exam,
        homeworkScore: score.homework,
        projectScore: score.project,
        attendanceScore: score.attendance,
        finalScore,
        comments: score.comments,
        status: finalScore >= config.minPassingGrade ? 'aprobado' : 'desaprobado',
      };

      saveGrade(newGradeRecord);
    });

    addToast('success', 'Registro de Notas Guardado', `Calificaciones de ${enrolledStudents.length} alumnos asentadas en el acta.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" /> 
            {currentRole === 'estudiante' ? 'Mis Calificaciones y Boleta Académica' : 'Registro de Calificaciones y Boletas'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentRole === 'estudiante'
              ? 'Consulta oficial de tus notas bimestrales ponderadas y descarga de boleta en PDF.'
              : 'Sábana de notas ponderada por exámenes, tareas, proyectos y asistencia con cálculo automático y exportación en PDF.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => ExcelExporterService.exportGrades(grades, students, courses)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Exportar Excel
          </button>
          {currentRole !== 'estudiante' && (
            <button
              onClick={handleSaveAllGrades}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Guardar Calificaciones
            </button>
          )}
        </div>
      </div>

      {/* Course & Period Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Asignatura / Curso
          </label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.gradeLevel})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Periodo de Evaluación
          </label>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value as GradeRecord['period'])}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="1° Bimestre">1° Bimestre (Actual)</option>
            <option value="2° Bimestre">2° Bimestre</option>
            <option value="3° Bimestre">3° Bimestre</option>
            <option value="4° Bimestre">4° Bimestre</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Ponderación del Curso
          </label>
          <div className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Exám: {activeCourse.evaluationWeights.exams}% • Tar: {activeCourse.evaluationWeights.homeworks}% • Proy: {activeCourse.evaluationWeights.projects}% • Asist: {activeCourse.evaluationWeights.attendance}%
          </div>
        </div>
      </div>

      {/* Grade Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4 text-center">Exámenes ({activeCourse.evaluationWeights.exams}%)</th>
                <th className="py-3 px-4 text-center">Tareas ({activeCourse.evaluationWeights.homeworks}%)</th>
                <th className="py-3 px-4 text-center">Proyectos ({activeCourse.evaluationWeights.projects}%)</th>
                <th className="py-3 px-4 text-center">Asistencia ({activeCourse.evaluationWeights.attendance}%)</th>
                <th className="py-3 px-4 text-center">Promedio</th>
                <th className="py-3 px-4 text-center">Condición</th>
                <th className="py-3 px-4 text-right">Boleta Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrolledStudents.map(student => {
                const score = editingScores[student.id] || { exam: 14, homework: 15, project: 15, attendance: 18, comments: '' };
                const final = calculateFinal(student.id);
                const isPassing = final >= config.minPassingGrade;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.lastName}, {student.firstName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {student.code} • {student.gradeId}
                      </div>
                    </td>

                    {/* Examen */}
                    <td className="py-3 px-4 text-center">
                      {currentRole === 'estudiante' ? (
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {score.exam}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={score.exam}
                          onChange={e => handleScoreChange(student.id, 'exam', parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-bold text-xs rounded-lg border border-slate-300 p-1 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white"
                        />
                      )}
                    </td>

                    {/* Tareas */}
                    <td className="py-3 px-4 text-center">
                      {currentRole === 'estudiante' ? (
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {score.homework}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={score.homework}
                          onChange={e => handleScoreChange(student.id, 'homework', parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-bold text-xs rounded-lg border border-slate-300 p-1 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white"
                        />
                      )}
                    </td>

                    {/* Proyectos */}
                    <td className="py-3 px-4 text-center">
                      {currentRole === 'estudiante' ? (
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {score.project}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={score.project}
                          onChange={e => handleScoreChange(student.id, 'project', parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-bold text-xs rounded-lg border border-slate-300 p-1 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white"
                        />
                      )}
                    </td>

                    {/* Asistencia */}
                    <td className="py-3 px-4 text-center">
                      {currentRole === 'estudiante' ? (
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {score.attendance}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={score.attendance}
                          onChange={e => handleScoreChange(student.id, 'attendance', parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-bold text-xs rounded-lg border border-slate-300 p-1 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:bg-white"
                        />
                      )}
                    </td>

                    {/* Promedio */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block font-black text-sm px-2.5 py-1 rounded-lg ${
                        isPassing 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {final.toFixed(1)}
                      </span>
                    </td>

                    {/* Condición */}
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isPassing 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {isPassing ? 'Aprobado' : 'Refuerzo'}
                      </span>
                    </td>

                    {/* Download Boleta PDF */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => PDFGeneratorService.generateReportCard(student, grades, courses, config, selectedPeriod)}
                        title="Imprimir Boleta Oficial en PDF"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <FileDown className="h-3.5 w-3.5" /> Boleta PDF
                      </button>
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
