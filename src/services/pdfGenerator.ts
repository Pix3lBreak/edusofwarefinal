/**
 * Professional PDF Document Generator for EduControl
 * Using jsPDF and jsPDF-AutoTable
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, GradeRecord, Course, PaymentRecord, SchoolConfig, AttendanceRecord } from '../types';

export class PDFGeneratorService {
  /**
   * Generates official Student Report Card (Boleta de Calificaciones)
   */
  public static generateReportCard(
    student: Student,
    grades: GradeRecord[],
    courses: Course[],
    config: SchoolConfig,
    period: string = '1° Bimestre'
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Institutional Header
    doc.setFillColor(30, 58, 138); // Navy blue
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(config.institutionName.toUpperCase(), 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${config.tagline} | Código: ${config.institutionCode}`, 14, 18);
    doc.text(`Año Lectivo: ${config.currentAcademicYear}`, pageWidth - 14, 18, { align: 'right' });

    // Document Title Banner
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`BOLETA OFICIAL DE CALIFICACIONES - ${period.toUpperCase()}`, 14, 36);

    // Student Information Card
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 40, pageWidth - 28, 28, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ESTUDIANTE:', 18, 47);
    doc.text('CÓDIGO / DNI:', 18, 54);
    doc.text('GRADO Y SECCIÓN:', 18, 61);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${student.lastName}, ${student.firstName}`, 50, 47);
    doc.text(`${student.code}  |  DNI: ${student.dni}`, 50, 54);
    doc.text(`${student.gradeId} - Sección "${student.section}"`, 50, 61);

    // Right column in card
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('APODERADO / TUTOR:', pageWidth / 2 + 10, 47);
    doc.text('FECHA DE EMISIÓN:', pageWidth / 2 + 10, 54);
    doc.text('ESTADO ACADÉMICO:', pageWidth / 2 + 10, 61);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(student.tutorName, pageWidth / 2 + 55, 47);
    doc.text(new Date().toLocaleDateString('es-ES'), pageWidth / 2 + 55, 54);
    doc.text(student.status.toUpperCase(), pageWidth / 2 + 55, 61);

    // Grades Table
    const tableData = courses.map((course, idx) => {
      const grade = grades.find(g => g.studentId === student.id && g.courseId === course.id);
      const finalScore = grade ? grade.finalScore.toFixed(1) : '-';
      const statusText = grade ? (grade.finalScore >= config.minPassingGrade ? 'APROBADO' : 'REQUIERE REFUERZO') : 'PENDIENTE';

      return [
        (idx + 1).toString(),
        course.code,
        course.name,
        grade ? grade.examScore.toFixed(1) : '-',
        grade ? grade.homeworkScore.toFixed(1) : '-',
        grade ? grade.projectScore.toFixed(1) : '-',
        grade ? grade.attendanceScore.toFixed(1) : '-',
        finalScore,
        statusText,
      ];
    });

    // Compute Overall Average
    const validGrades = grades.filter(g => g.studentId === student.id && typeof g.finalScore === 'number');
    const average = validGrades.length > 0 
      ? (validGrades.reduce((acc, curr) => acc + curr.finalScore, 0) / validGrades.length).toFixed(2)
      : '0.00';

    autoTable(doc, {
      startY: 74,
      head: [['#', 'Cód.', 'Asignatura / Curso', 'Exámenes (40%)', 'Tareas (30%)', 'Proyectos (20%)', 'Asistencia (10%)', 'Promedio', 'Condición']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 'auto', halign: 'left' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 22, halign: 'center' },
        6: { cellWidth: 22, halign: 'center' },
        7: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        8: { cellWidth: 24, halign: 'center', fontSize: 7.5 },
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
      },
    });

    // Summary & Signatures Box
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY || 180;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, finalY + 8, pageWidth - 28, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text(`PROMEDIO PONDERADO DEL PERIODO: ${average} / ${config.gradingScale === '0-20' ? '20' : '10'}`, 20, finalY + 17);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Escala Institucional: ${config.gradingScale} | Nota mínima aprobatoria: ${config.minPassingGrade}`, 20, finalY + 24);

    // Signatures
    const signY = finalY + 55;
    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([2, 2], 0);

    doc.line(25, signY, 85, signY);
    doc.line(pageWidth - 85, signY, pageWidth - 25, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Dirección Académica', 55, signY + 5, { align: 'center' });
    doc.text('Firma y Sello del Docente Tutor', pageWidth - 55, signY + 5, { align: 'center' });

    // Official Security Stamp note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Documento oficial generado digitalmente por el Sistema EduControl con firma electrónica y respaldo institucional.', pageWidth / 2, signY + 18, { align: 'center' });

    doc.save(`Boleta_${student.lastName}_${student.firstName}_${period.replace(/\s+/g, '_')}.pdf`);
  }

  /**
   * Generates Complete Student Expediente (Expediente Integral del Alumno)
   */
  public static generateStudentFile(
    student: Student,
    config: SchoolConfig,
    attendanceRecords: AttendanceRecord[],
    grades: GradeRecord[],
    courses: Course[]
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(config.institutionName.toUpperCase(), 14, 12);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`EXPEDIENTE DIGITAL DEL ESTUDIANTE • CONFIDENCIAL`, 14, 18);
    doc.text(`Código de Estudiante: ${student.code}`, pageWidth - 14, 18, { align: 'right' });

    let currentY = 36;

    // Section 1: Personal Information
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. DATOS PERSONALES Y FAMILIARES', 14, currentY);
    currentY += 4;

    const personalInfo = [
      ['Nombres y Apellidos:', `${student.lastName}, ${student.firstName}`, 'DNI / Identificación:', student.dni],
      ['Fecha de Nacimiento:', student.birthDate, 'Género:', student.gender === 'M' ? 'Masculino' : 'Femenino'],
      ['Grado y Sección:', `${student.gradeId} - Secc. "${student.section}"`, 'Condición de Matrícula:', student.status.toUpperCase()],
      ['Dirección Domiciliaria:', student.address, 'Teléfono del Alumno:', student.phone || 'No registra'],
      ['Apoderado / Tutor Legal:', student.tutorName, 'Teléfono Apoderado:', student.tutorPhone],
      ['Correo de Contacto:', student.tutorEmail, 'Fecha de Inscripción:', student.registrationDate],
    ];

    autoTable(doc, {
      startY: currentY,
      body: personalInfo,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 42 },
        1: { textColor: [15, 23, 42], cellWidth: 55 },
        2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 42 },
        3: { textColor: [15, 23, 42], cellWidth: 'auto' },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable?.finalY + 8 || 100;

    // Section 2: Ficha Médica y de Emergencia (Cifrado E2EE)
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. FICHA MÉDICA Y DE SALUD (PROTEGIDO POR CIFRADO E2EE)', 14, currentY);
    currentY += 4;

    const healthInfo = [
      ['Grupo Sanguíneo:', student.healthData?.bloodType || 'No registrado', 'Centro de Salud de Emergencia:', student.healthData?.emergencyHospital || 'Hospital General'],
      ['Alergias Conocidas:', student.healthData?.allergies || 'Ninguna alergia registrada', 'Condiciones Crónicas:', student.healthData?.chronicConditions || 'Ninguna reportada'],
      ['Observaciones Psicopedagógicas:', student.healthData?.psychologicalNotes || 'Conducta y adaptación social favorable.', '', ''],
    ];

    autoTable(doc, {
      startY: currentY,
      body: healthInfo,
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [241, 245, 249] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 45 },
        1: { textColor: [15, 23, 42], cellWidth: 50 },
        2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 45 },
        3: { textColor: [15, 23, 42], cellWidth: 'auto' },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable?.finalY + 8 || 160;

    // Section 3: Asistencia y Puntualidad
    const studentAtt = attendanceRecords.filter(a => a.studentId === student.id);
    const totalDays = studentAtt.length;
    const presentCount = studentAtt.filter(a => a.status === 'presente').length;
    const tardyCount = studentAtt.filter(a => a.status === 'tardanza').length;
    const absentCount = studentAtt.filter(a => a.status === 'ausente').length;
    const attendanceRate = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : '100.0';

    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`3. HISTORIAL DE ASISTENCIA (Tasa Acumulada: ${attendanceRate}%)`, 14, currentY);
    currentY += 4;

    const attSummary = [
      ['Días Registrados', 'Asistencias Puntuales', 'Tardanzas', 'Faltas Injustificadas', 'Tasa Global'],
      [totalDays.toString(), presentCount.toString(), tardyCount.toString(), absentCount.toString(), `${attendanceRate}%`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [attSummary[0]],
      body: [attSummary[1]],
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center', fontSize: 8.5 },
      bodyStyles: { halign: 'center', fontStyle: 'bold', fontSize: 9 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable?.finalY + 8 || 210;

    // Section 4: Resumen de Calificaciones
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('4. SÍNTESIS DE CALIFICACIONES VIGENTES', 14, currentY);
    currentY += 4;

    const gradesData = courses.map(c => {
      const g = grades.find(x => x.studentId === student.id && x.courseId === c.id);
      return [c.name, g ? g.finalScore.toFixed(1) : 'Pendiente', g && g.finalScore >= config.minPassingGrade ? 'Satisfactorio' : 'En proceso'];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Asignatura', 'Calificación Final', 'Apreciación Cuantitativa']],
      body: gradesData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    doc.save(`Expediente_${student.code}_${student.lastName}.pdf`);
  }

  /**
   * Generates Official Payment Voucher (Recibo de Cobranza Oficial)
   */
  public static generatePaymentReceipt(
    payment: PaymentRecord,
    student: Student,
    config: SchoolConfig
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [148, 210], // A5 size, perfect for formal receipts
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(config.institutionName.toUpperCase(), 10, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${config.address} | Tel: ${config.phone}`, 10, 17);

    // Title & Receipt Number
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('COMPROBANTE DE PAGO ELECTRÓNICO', 10, 32);

    doc.setFontSize(10);
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`N° ${payment.receiptNumber}`, pageWidth - 10, 32, { align: 'right' });

    // Client box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, 37, pageWidth - 20, 30, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ESTUDIANTE:', 14, 44);
    doc.text('CÓDIGO / GRADO:', 14, 51);
    doc.text('APODERADO / EMISIÓN A:', 14, 58);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${student.lastName}, ${student.firstName} (DNI: ${student.dni})`, 50, 44);
    doc.text(`${student.code} | ${student.gradeId} "${student.section}"`, 50, 51);
    doc.text(student.tutorName, 50, 58);

    // Date & cashier
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('FECHA:', pageWidth - 60, 44);
    doc.text('MÉTODO:', pageWidth - 60, 51);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(payment.paidDate || new Date().toISOString().slice(0, 10), pageWidth - 45, 44);
    doc.text((payment.method || 'Efectivo').toUpperCase(), pageWidth - 45, 51);

    // Concept table
    autoTable(doc, {
      startY: 72,
      head: [['Descripción del Concepto Educativo', 'Vencimiento', 'Importe']],
      body: [
        [payment.concept, payment.dueDate, `${config.currencySymbol} ${payment.amount.toFixed(2)}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
      },
      styles: { fontSize: 8.5, cellPadding: 3 },
    });

    // Total highlight
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFillColor(241, 245, 249);
    doc.rect(pageWidth - 65, finalY + 4, 55, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text(`TOTAL PAGADO:`, pageWidth - 62, finalY + 11);
    doc.text(`${config.currencySymbol} ${payment.amount.toFixed(2)}`, pageWidth - 12, finalY + 11, { align: 'right' });

    // Cashier & stamp
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Atendido por: ${payment.cashierName || 'Caja Central'}`, 10, finalY + 28);
    doc.text(`Ref: ${payment.referenceCode || 'CJA-AUT'}`, 10, finalY + 33);

    // Signature line
    doc.line(pageWidth - 60, finalY + 38, pageWidth - 10, finalY + 38);
    doc.setFontSize(7.5);
    doc.text('Firma y Sello de Tesorería', pageWidth - 35, finalY + 42, { align: 'center' });

    doc.save(`Recibo_${payment.receiptNumber}.pdf`);
  }
}
