/**
 * Central Reports & Export Hub (PDF, Excel, and Automated Periodic Reports)
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  FileDown, 
  FileSpreadsheet, 
  Sparkles, 
  Award, 
  GraduationCap, 
  CreditCard, 
  Users, 
  CheckSquare, 
  Calendar,
  Clock,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { ExcelExporterService } from '../../services/excelExporter';

export const ReportsModule: React.FC = () => {
  const { 
    students, 
    teachers, 
    courses, 
    grades, 
    payments, 
    attendances, 
    config, 
    canViewPayments,
    runPeriodicAutomatedReport,
    addToast 
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1° Bimestre');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" /> Centro de Reportes y Análisis Administrativo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generación oficial de boletas y expedientes en PDF, libros contables en Excel (.xlsx) e informes automatizados.
          </p>
        </div>

        <button
          onClick={runPeriodicAutomatedReport}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Ejecutar Informe Automatizado
        </button>
      </div>

      {/* Grid of Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 1: REPORTES OFICIALES EN PDF */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl dark:bg-red-950/60 dark:text-red-400">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Documentos Oficiales en PDF</h3>
              <p className="text-xs text-slate-400">Listos para impresión membretada y firma institucional</p>
            </div>
          </div>

          {/* Student Selector for Individual Documents */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Seleccionar Estudiante Objetivo:
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.lastName}, {s.firstName} ({s.code}) - {s.gradeId}
                </option>
              ))}
            </select>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  if (selectedStudent) {
                    PDFGeneratorService.generateReportCard(selectedStudent, grades, courses, config, selectedPeriod);
                    addToast('success', 'Boleta Generada', `Descarga iniciada para ${selectedStudent.firstName} ${selectedStudent.lastName}`);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors"
              >
                <Award className="h-4 w-4" />
                Descargar Boleta de Notas
              </button>

              <button
                onClick={() => {
                  if (selectedStudent) {
                    PDFGeneratorService.generateStudentFile(selectedStudent, config, attendances, grades, courses);
                    addToast('success', 'Expediente Generado', `Expediente digital descargado en PDF`);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <GraduationCap className="h-4 w-4" />
                Descargar Expediente Integral
              </button>
            </div>
          </div>

          {/* Quick Receipts */}
          <div className="pt-2 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Comprobantes de Pago Recientes
            </span>
            <div className="space-y-1.5">
              {payments.filter(p => p.status === 'pagado').slice(0, 3).map(pay => {
                const s = students.find(x => x.id === pay.studentId);
                return (
                  <div key={pay.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{pay.receiptNumber}</span>
                      <span className="text-slate-400 ml-2">{pay.concept}</span>
                    </div>
                    {s && (
                      <button
                        onClick={() => PDFGeneratorService.generatePaymentReceipt(pay, s, config)}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Printer className="h-3 w-3" /> Imprimir PDF
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: EXPORTACIONES EXCEL (.XLSX) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/60 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Exportación a Hojas de Cálculo (.xlsx)</h3>
              <p className="text-xs text-slate-400">Bases de datos tabulares completas compatibles con Microsoft Excel y Google Sheets</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                ExcelExporterService.exportStudents(students, config);
                addToast('success', 'Excel Generado', 'Padrón de estudiantes descargado en .xlsx');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Padrón Completo de Estudiantes</h4>
                  <p className="text-[11px] text-slate-400">Incluye DNI, grado, datos de tutores, teléfonos y estado</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-1 rounded">
                .XLSX
              </span>
            </button>

            {canViewPayments && (
              <button
                onClick={() => {
                  ExcelExporterService.exportPayments(payments, students, config);
                  addToast('success', 'Excel Generado', 'Libro de ingresos y tesorería descargado');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Libro Diario de Caja y Cobranzas</h4>
                    <p className="text-[11px] text-slate-400">Detalle de pagos recibidos, métodos, deudores y números de operación</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-1 rounded">
                  .XLSX
                </span>
              </button>
            )}

            <button
              onClick={() => {
                ExcelExporterService.exportGrades(grades, students, courses);
                addToast('success', 'Excel Generado', 'Sábana de notas consolidada descargada');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
            >
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Sábana de Calificaciones Ponderadas</h4>
                  <p className="text-[11px] text-slate-400">Desglose de exámenes, tareas, proyectos y condición final</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-1 rounded">
                .XLSX
              </span>
            </button>

            <button
              onClick={() => {
                ExcelExporterService.exportTeachers(teachers);
                addToast('success', 'Excel Generado', 'Nómina de profesores descargada');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Nómina del Directorio Docente</h4>
                  <p className="text-[11px] text-slate-400">Especialidad pedagógica, grados académicos y canales de contacto</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-1 rounded">
                .XLSX
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* AUTOMATED REPORTS INFORMATION BANNER */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900/40 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200">
              Informes Periódicos Automatizados del Sistema
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 max-w-2xl leading-relaxed">
              El motor en segundo plano recopila las inasistencias acumuladas del día, el porcentaje de recaudación frente a la meta y las tareas pendientes, despachando resúmenes automáticos al panel directivo sin requerir intervención manual.
            </p>
          </div>
        </div>
        <button
          onClick={runPeriodicAutomatedReport}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="h-4 w-4" /> Probar Disparo Ahora
        </button>
      </div>
    </div>
  );
};
