/**
 * Excel (.xlsx) Exporter Service for EduControl
 * Using SheetJS (xlsx)
 */

import * as XLSX from 'xlsx';
import { Student, Teacher, PaymentRecord, GradeRecord, Course, SchoolConfig } from '../types';

export class ExcelExporterService {
  /**
   * Exports list of students to formatted Excel
   */
  public static exportStudents(students: Student[], config: SchoolConfig): void {
    const data = students.map((s, index) => ({
      '#': index + 1,
      'Código': s.code,
      'Apellidos': s.lastName,
      'Nombres': s.firstName,
      'DNI': s.dni,
      'Grado': s.gradeId,
      'Sección': s.section,
      'Estado': s.status.toUpperCase(),
      'Apoderado / Tutor': s.tutorName,
      'Teléfono Tutor': s.tutorPhone,
      'Correo Tutor': s.tutorEmail,
      'Fecha Ingreso': s.registrationDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Padrón Alumnos');

    XLSX.writeFile(workbook, `Padron_Alumnos_${config.currentAcademicYear.replace('/', '-')}.xlsx`);
  }

  /**
   * Exports teacher directory to Excel
   */
  public static exportTeachers(teachers: Teacher[]): void {
    const data = teachers.map((t, index) => ({
      '#': index + 1,
      'Código': t.code,
      'Apellidos': t.lastName,
      'Nombres': t.firstName,
      'DNI': t.dni,
      'Especialidad': t.specialty,
      'Grado Académico': t.academicDegree,
      'Email Institucional': t.email,
      'Teléfono': t.phone,
      'Estado': t.status.toUpperCase(),
      'Fecha Contrato': t.hireDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Directorio Docentes');

    XLSX.writeFile(workbook, `Docentes_EduControl_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Exports full payments & treasury ledger to Excel
   */
  public static exportPayments(payments: PaymentRecord[], students: Student[], config: SchoolConfig): void {
    const studentMap = new Map(students.map(s => [s.id, s]));

    const data = payments.map((p, index) => {
      const student = studentMap.get(p.studentId);
      return {
        '#': index + 1,
        'N° Recibo': p.receiptNumber,
        'Código Alumno': student?.code || 'N/A',
        'Estudiante': student ? `${student.lastName}, ${student.firstName}` : 'Desconocido',
        'Grado': student?.gradeId || '',
        'Concepto': p.concept,
        'Monto': p.amount,
        'Moneda': config.currencySymbol,
        'Fecha Vencimiento': p.dueDate,
        'Fecha Pago': p.paidDate || '-',
        'Estado': p.status.toUpperCase(),
        'Método': p.method ? p.method.toUpperCase() : '-',
        'Ref. Operación': p.referenceCode || '-',
        'Cajero': p.cashierName || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Libro de Ingresos');

    XLSX.writeFile(workbook, `Reporte_Finanzas_Colegiaturas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Exports academic grades matrix to Excel
   */
  public static exportGrades(grades: GradeRecord[], students: Student[], courses: Course[]): void {
    const studentMap = new Map(students.map(s => [s.id, s]));
    const courseMap = new Map(courses.map(c => [c.id, c]));

    const data = grades.map((g, index) => {
      const student = studentMap.get(g.studentId);
      const course = courseMap.get(g.courseId);

      return {
        '#': index + 1,
        'Periodo': g.period,
        'Estudiante': student ? `${student.lastName}, ${student.firstName}` : 'N/A',
        'Código': student?.code || '',
        'Curso / Materia': course?.name || 'N/A',
        'Exámenes (40%)': g.examScore,
        'Tareas (30%)': g.homeworkScore,
        'Proyectos (20%)': g.projectScore,
        'Asistencia (10%)': g.attendanceScore,
        'Promedio Final': g.finalScore,
        'Estado': g.status.toUpperCase(),
        'Observación': g.comments || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sábana de Calificaciones');

    XLSX.writeFile(workbook, `Calificaciones_Consolidadas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
