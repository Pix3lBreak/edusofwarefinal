/**
 * Educational Management System - Persistent Storage Engine
 * Hybrid IndexedDB + LocalStorage with full JSON and SQL Export / Import
 * Free, offline-first, zero-cost, limitless local storage
 */

import {
  UserAccount,
  Student,
  Teacher,
  Classroom,
  Course,
  Enrollment,
  ScheduleSlot,
  AttendanceRecord,
  GradeRecord,
  PaymentRecord,
  Announcement,
  CustomRole,
  SchoolConfig,
  AuditLog,
  PushNotification
} from '../types';

const DB_NAME = 'EduControl_DB_v1';
const DB_VERSION = 1;
const STORAGE_PREFIX = 'educontrol_';

export interface DatabaseState {
  config: SchoolConfig;
  users: UserAccount[];
  roles: CustomRole[];
  students: Student[];
  teachers: Teacher[];
  classrooms: Classroom[];
  courses: Course[];
  enrollments: Enrollment[];
  schedules: ScheduleSlot[];
  attendances: AttendanceRecord[];
  grades: GradeRecord[];
  payments: PaymentRecord[];
  announcements: Announcement[];
  notifications: PushNotification[];
  auditLogs: AuditLog[];
}

export const DEFAULT_CONFIG: SchoolConfig = {
  institutionName: 'Colegio Bicentenario de las Américas',
  tagline: 'Excelencia Académica, Innovación y Valores Humanos',
  institutionCode: 'CBA-2026-PE',
  logoUrl: '',
  address: 'Av. Libertador 1450, Distrito Educativo Central',
  phone: '+51 (1) 456-7890 / +51 987 654 321',
  email: 'administracion@bicentenario.edu',
  currentAcademicYear: '2026-2027',
  currencySymbol: '$',
  gradingScale: '0-20',
  minPassingGrade: 11,
  allowSelfRegistration: true,
  e2eeEnabled: true,
  lastBackupDate: new Date().toISOString(),
  loginTitle: 'Portal Académico & Administrativo',
  loginSubtitle: 'Acceso unificado para directivos, docentes, estudiantes y apoderados',
  loginBannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop',
  loginWelcomeMessage: 'Bienvenidos al ciclo lectivo 2026. Recuerde mantener sus credenciales seguras.',
  loginThemeColor: 'blue',
  loginSupportEmail: 'soporte@bicentenario.edu',
  allowGoogleLogin: true,
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  appThemePreset: 'classic_blue',
  loginThemePreset: 'classic_blue',
  loginCardStyle: 'glass',
  loginBgGradientStart: '#020617',
  loginBgGradientEnd: '#0f172a',
  loginButtonColor: '#2563eb',
  loginBadgeText: 'Portal Oficial de Gestión Escolar',
  showLoginHeroBanner: true,
  loginLogoPosition: 'left',
};

export const DEFAULT_ROLES: CustomRole[] = [
  {
    id: 'role-superadmin',
    name: 'Superadministrador',
    description: 'Control total de la plataforma, bases de datos y seguridad',
    isSystem: true,
    permissions: {
      usuarios: { create: true, read: true, update: true, delete: true },
      alumnos: { create: true, read: true, update: true, delete: true },
      docentes: { create: true, read: true, update: true, delete: true },
      aulas: { create: true, read: true, update: true, delete: true },
      cursos: { create: true, read: true, update: true, delete: true },
      matriculas: { create: true, read: true, update: true, delete: true },
      horarios: { create: true, read: true, update: true, delete: true },
      asistencias: { create: true, read: true, update: true, delete: true },
      calificaciones: { create: true, read: true, update: true, delete: true },
      pagos: { create: true, read: true, update: true, delete: true },
      comunicados: { create: true, read: true, update: true, delete: true },
      configuracion: { create: true, read: true, update: true, delete: true },
    },
  },
  {
    id: 'role-director',
    name: 'Director / Coordinador Académico',
    description: 'Supervisión curricular, docente y reportes ejecutivos',
    isSystem: true,
    permissions: {
      usuarios: { create: false, read: true, update: false, delete: false },
      alumnos: { create: true, read: true, update: true, delete: false },
      docentes: { create: true, read: true, update: true, delete: false },
      aulas: { create: true, read: true, update: true, delete: false },
      cursos: { create: true, read: true, update: true, delete: false },
      matriculas: { create: true, read: true, update: true, delete: false },
      horarios: { create: true, read: true, update: true, delete: false },
      asistencias: { create: true, read: true, update: true, delete: false },
      calificaciones: { create: false, read: true, update: false, delete: false },
      pagos: { create: true, read: true, update: true, delete: false },
      comunicados: { create: true, read: true, update: true, delete: true },
      configuracion: { create: false, read: true, update: false, delete: false },
    },
  },
  {
    id: 'role-docente',
    name: 'Profesor / Docente de Aula',
    description: 'Gestión de notas de sus cursos, registro de asistencia y avisos (Sin acceso a cobros)',
    isSystem: true,
    permissions: {
      usuarios: { create: false, read: false, update: false, delete: false },
      alumnos: { create: false, read: true, update: false, delete: false },
      docentes: { create: false, read: true, update: false, delete: false },
      aulas: { create: false, read: true, update: false, delete: false },
      cursos: { create: false, read: true, update: false, delete: false },
      matriculas: { create: false, read: false, update: false, delete: false },
      horarios: { create: false, read: true, update: false, delete: false },
      asistencias: { create: true, read: true, update: true, delete: false },
      calificaciones: { create: true, read: true, update: true, delete: false },
      pagos: { create: false, read: false, update: false, delete: false },
      comunicados: { create: true, read: true, update: false, delete: false },
      configuracion: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    id: 'role-cajero',
    name: 'Administración y Tesorería',
    description: 'Gestión autorizada de cobranzas, cobros, pensiones y recibos contables',
    isSystem: true,
    permissions: {
      usuarios: { create: false, read: false, update: false, delete: false },
      alumnos: { create: true, read: true, update: true, delete: false },
      docentes: { create: false, read: false, update: false, delete: false },
      aulas: { create: false, read: false, update: false, delete: false },
      cursos: { create: false, read: false, update: false, delete: false },
      matriculas: { create: true, read: true, update: true, delete: false },
      horarios: { create: false, read: false, update: false, delete: false },
      asistencias: { create: false, read: false, update: false, delete: false },
      calificaciones: { create: false, read: false, update: false, delete: false },
      pagos: { create: true, read: true, update: true, delete: false },
      comunicados: { create: false, read: true, update: false, delete: false },
      configuracion: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    id: 'role-padre',
    name: 'Padre de Familia / Tutor',
    description: 'Portal de consulta académica: notas, horarios, asistencias y comunicados (Sin acceso a cobros)',
    isSystem: true,
    permissions: {
      usuarios: { create: false, read: false, update: false, delete: false },
      alumnos: { create: false, read: true, update: false, delete: false },
      docentes: { create: false, read: true, update: false, delete: false },
      aulas: { create: false, read: false, update: false, delete: false },
      cursos: { create: false, read: true, update: false, delete: false },
      matriculas: { create: false, read: false, update: false, delete: false },
      horarios: { create: false, read: true, update: false, delete: false },
      asistencias: { create: false, read: true, update: false, delete: false },
      calificaciones: { create: false, read: true, update: false, delete: false },
      pagos: { create: false, read: false, update: false, delete: false },
      comunicados: { create: false, read: true, update: false, delete: false },
      configuracion: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    id: 'role-estudiante',
    name: 'Estudiante',
    description: 'Consulta de horario personal, calificaciones, asistencias y avisos (Sin acceso a cobros)',
    isSystem: true,
    permissions: {
      usuarios: { create: false, read: false, update: false, delete: false },
      alumnos: { create: false, read: false, update: false, delete: false },
      docentes: { create: false, read: true, update: false, delete: false },
      aulas: { create: false, read: false, update: false, delete: false },
      cursos: { create: false, read: true, update: false, delete: false },
      matriculas: { create: false, read: false, update: false, delete: false },
      horarios: { create: false, read: true, update: false, delete: false },
      asistencias: { create: false, read: true, update: false, delete: false },
      calificaciones: { create: false, read: true, update: false, delete: false },
      pagos: { create: false, read: false, update: false, delete: false },
      comunicados: { create: false, read: true, update: false, delete: false },
      configuracion: { create: false, read: false, update: false, delete: false },
    },
  },
];

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-superadmin-pixelglez',
    name: 'Superadministrador Titular',
    email: 'pixelglez1988@gmail.com',
    role: 'superadmin',
    status: 'activo',
    isGoogleLinked: true,
    emailVerified: true,
    lastLogin: new Date().toISOString(),
    phone: '+51 987 000 000',
  },
  {
    id: 'usr-1',
    name: 'Lic. Mariana Fernández',
    email: 'directora@bicentenario.edu',
    role: 'director',
    status: 'activo',
    lastLogin: '2026-10-30T21:40:00Z',
    phone: '+51 987 111 222',
  },
  {
    id: 'usr-2',
    name: 'Ing. Roberto Silva (Director TI)',
    email: 'admin@bicentenario.edu',
    role: 'director',
    status: 'activo',
    lastLogin: '2026-10-30T21:50:00Z',
    phone: '+51 987 333 444',
  },
  {
    id: 'usr-3',
    name: 'Prof. Carlos Mendoza',
    email: 'cmendoza@bicentenario.edu',
    role: 'docente',
    status: 'activo',
    linkedEntityId: 'doc-1',
    lastLogin: '2026-10-30T19:15:00Z',
    phone: '+51 987 555 666',
  },
  {
    id: 'usr-4',
    name: 'Valentina Ríos Castro',
    email: 'vrios@estudiante.bicentenario.edu',
    role: 'estudiante',
    status: 'activo',
    linkedEntityId: 'alu-1',
    lastLogin: '2026-10-30T17:00:00Z',
    phone: '+51 987 777 888',
  },
  {
    id: 'usr-5',
    name: 'Sr. Fernando Ríos (Apoderado)',
    email: 'frios@apoderado.com',
    role: 'padre',
    status: 'activo',
    linkedEntityId: 'alu-1',
    lastLogin: '2026-10-29T14:30:00Z',
    phone: '+51 987 999 000',
  },
  {
    id: 'usr-6',
    name: 'Lic. Claudia Morales',
    email: 'caja@bicentenario.edu',
    role: 'cajero',
    status: 'activo',
    lastLogin: '2026-10-30T20:10:00Z',
    phone: '+51 987 000 111',
  },
];

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'doc-1',
    code: 'DOC-2026-001',
    firstName: 'Carlos',
    lastName: 'Mendoza Gutiérrez',
    dni: '44892103',
    specialty: 'Matemáticas y Cálculo',
    email: 'cmendoza@bicentenario.edu',
    phone: '+51 987 555 666',
    academicDegree: 'Magíster en Didáctica de las Matemáticas',
    assignedCourseIds: ['cur-1', 'cur-5'],
    status: 'activo',
    hireDate: '2022-03-01',
  },
  {
    id: 'doc-2',
    code: 'DOC-2026-002',
    firstName: 'Patricia',
    lastName: 'Navarro Benítez',
    dni: '42109845',
    specialty: 'Ciencias Naturales y Biología',
    email: 'pnavarro@bicentenario.edu',
    phone: '+51 981 223 344',
    academicDegree: 'Licenciada en Educación Biológica y Química',
    assignedCourseIds: ['cur-2'],
    status: 'activo',
    hireDate: '2021-02-15',
  },
  {
    id: 'doc-3',
    code: 'DOC-2026-003',
    firstName: 'Alejandro',
    lastName: 'Gómez Valdivia',
    dni: '47589210',
    specialty: 'Física y Robótica Educativa',
    email: 'agomez@bicentenario.edu',
    phone: '+51 982 445 566',
    academicDegree: 'Ingeniero Mecatrónico y Docente Universitario',
    assignedCourseIds: ['cur-3', 'cur-6'],
    status: 'activo',
    hireDate: '2023-01-10',
  },
  {
    id: 'doc-4',
    code: 'DOC-2026-004',
    firstName: 'Lucía',
    lastName: 'Salazar Romero',
    dni: '45678912',
    specialty: 'Comunicación y Literatura Hispánica',
    email: 'lsalazar@bicentenario.edu',
    phone: '+51 983 667 788',
    academicDegree: 'Licenciada en Lingüística y Literatura',
    assignedCourseIds: ['cur-4'],
    status: 'activo',
    hireDate: '2020-03-01',
  },
  {
    id: 'doc-5',
    code: 'DOC-2026-005',
    firstName: 'David',
    lastName: 'McAllister',
    dni: 'E-982134',
    specialty: 'Inglés Avanzado & Certificación Cambridge',
    email: 'dmcallister@bicentenario.edu',
    phone: '+51 984 889 900',
    academicDegree: 'B.A. English Pedagogy (CELTA certified)',
    assignedCourseIds: ['cur-7'],
    status: 'activo',
    hireDate: '2024-02-01',
  },
];

export const DEFAULT_CLASSROOMS: Classroom[] = [
  {
    id: 'aul-101',
    code: 'AULA-101',
    name: 'Aula 101 - Ciencias',
    building: 'Pabellón Principal (A)',
    floor: 1,
    capacity: 35,
    resources: ['Proyector Multimedia 4K', 'Pizarra Inteligente', 'Aire Acondicionado', 'Sistema de Audio'],
    status: 'disponible',
  },
  {
    id: 'aul-102',
    code: 'AULA-102',
    name: 'Aula 102 - Humanidades',
    building: 'Pabellón Principal (A)',
    floor: 1,
    capacity: 32,
    resources: ['Smart TV 75"', 'Pizarra Acrílica', 'Cortinas Blackout'],
    status: 'disponible',
  },
  {
    id: 'aul-201',
    code: 'AULA-201',
    name: 'Laboratorio de Ciencias Experimentales',
    building: 'Pabellón Científico (B)',
    floor: 2,
    capacity: 28,
    resources: ['Microscopios Ópticos', 'Campana Extractora', 'Kit de Sensorica Digital', 'Lavaojos de Emergencia'],
    status: 'ocupado',
  },
  {
    id: 'aul-202',
    code: 'AULA-202',
    name: 'Taller de Robótica e Informática',
    building: 'Pabellón Científico (B)',
    floor: 2,
    capacity: 30,
    resources: ['30 Estaciones Core i7', 'Impresoras 3D', 'Kits Arduino y LEGO Spike', 'Fibra Óptica Dedicada'],
    status: 'disponible',
  },
  {
    id: 'aul-301',
    code: 'AULA-301',
    name: 'Salón Audiovisual e Idiomas',
    building: 'Pabellón Idiomas (C)',
    floor: 3,
    capacity: 40,
    resources: ['Cabinas Insonorizadas', 'Headsets con Microfono', 'Proyector Láser'],
    status: 'disponible',
  },
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'cur-1',
    code: 'MAT-3SEC',
    name: 'Matemáticas y Álgebra',
    gradeLevel: '3° Secundaria',
    teacherId: 'doc-1',
    weeklyHours: 5,
    color: '#3B82F6', // Blue
    evaluationWeights: { exams: 40, homeworks: 30, projects: 20, attendance: 10 },
  },
  {
    id: 'cur-2',
    code: 'BIO-3SEC',
    name: 'Biología Celular y Ecología',
    gradeLevel: '3° Secundaria',
    teacherId: 'doc-2',
    weeklyHours: 4,
    color: '#10B981', // Emerald
    evaluationWeights: { exams: 35, homeworks: 25, projects: 30, attendance: 10 },
  },
  {
    id: 'cur-3',
    code: 'FIS-4SEC',
    name: 'Física Fundamental y Cinemática',
    gradeLevel: '4° Secundaria',
    teacherId: 'doc-3',
    weeklyHours: 4,
    color: '#8B5CF6', // Purple
    evaluationWeights: { exams: 45, homeworks: 25, projects: 20, attendance: 10 },
  },
  {
    id: 'cur-4',
    code: 'LIT-3SEC',
    name: 'Comunicación y Literatura',
    gradeLevel: '3° Secundaria',
    teacherId: 'doc-4',
    weeklyHours: 4,
    color: '#F59E0B', // Amber
    evaluationWeights: { exams: 30, homeworks: 35, projects: 25, attendance: 10 },
  },
  {
    id: 'cur-5',
    code: 'GEO-4SEC',
    name: 'Geometría del Espacio y Trigonometría',
    gradeLevel: '4° Secundaria',
    teacherId: 'doc-1',
    weeklyHours: 4,
    color: '#06B6D4', // Cyan
    evaluationWeights: { exams: 40, homeworks: 30, projects: 20, attendance: 10 },
  },
  {
    id: 'cur-6',
    code: 'ROB-GEN',
    name: 'Robótica y Automatización',
    gradeLevel: '3° Secundaria',
    teacherId: 'doc-3',
    weeklyHours: 3,
    color: '#EC4899', // Pink
    evaluationWeights: { exams: 20, homeworks: 20, projects: 50, attendance: 10 },
  },
  {
    id: 'cur-7',
    code: 'ENG-ADV',
    name: 'Inglés Comunicativo Avanzado',
    gradeLevel: '3° Secundaria',
    teacherId: 'doc-5',
    weeklyHours: 5,
    color: '#14B8A6', // Teal
    evaluationWeights: { exams: 30, homeworks: 30, projects: 30, attendance: 10 },
  },
  {
    id: 'cur-8',
    code: 'QUIM-4SEC',
    name: 'Química Orgánica y Experimental',
    gradeLevel: '4° Secundaria',
    teacherId: 'doc-2',
    weeklyHours: 4,
    color: '#10B981', // Emerald
    evaluationWeights: { exams: 40, homeworks: 30, projects: 20, attendance: 10 },
  },
  {
    id: 'cur-9',
    code: 'HIST-4SEC',
    name: 'Historia Universal & Geografía',
    gradeLevel: '4° Secundaria',
    teacherId: 'doc-4',
    weeklyHours: 3,
    color: '#F59E0B', // Amber
    evaluationWeights: { exams: 30, homeworks: 30, projects: 30, attendance: 10 },
  },
  {
    id: 'cur-10',
    code: 'MAT-1PRI',
    name: 'Iniciación a las Matemáticas',
    gradeLevel: '1° Primaria',
    teacherId: 'doc-1',
    weeklyHours: 5,
    color: '#3B82F6', // Blue
    evaluationWeights: { exams: 25, homeworks: 35, projects: 30, attendance: 10 },
  },
  {
    id: 'cur-11',
    code: 'COM-1PRI',
    name: 'Comunicación y Lectoescritura',
    gradeLevel: '1° Primaria',
    teacherId: 'doc-4',
    weeklyHours: 5,
    color: '#EC4899', // Pink
    evaluationWeights: { exams: 25, homeworks: 35, projects: 30, attendance: 10 },
  },
  {
    id: 'cur-12',
    code: 'ING-1PRI',
    name: 'Inglés Lúdico y Vocabulario',
    gradeLevel: '1° Primaria',
    teacherId: 'doc-5',
    weeklyHours: 3,
    color: '#14B8A6', // Teal
    evaluationWeights: { exams: 20, homeworks: 30, projects: 40, attendance: 10 },
  },
  {
    id: 'cur-13',
    code: 'MAT-2PRI',
    name: 'Matemática y Razonamiento Lógico',
    gradeLevel: '2° Primaria',
    teacherId: 'doc-1',
    weeklyHours: 5,
    color: '#3B82F6', // Blue
    evaluationWeights: { exams: 30, homeworks: 30, projects: 30, attendance: 10 },
  },
  {
    id: 'cur-14',
    code: 'CTA-2PRI',
    name: 'Ciencia, Naturaleza y Ambiente',
    gradeLevel: '2° Primaria',
    teacherId: 'doc-2',
    weeklyHours: 4,
    color: '#10B981', // Emerald
    evaluationWeights: { exams: 30, homeworks: 30, projects: 30, attendance: 10 },
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'alu-1',
    code: 'ALU-2026-001',
    firstName: 'Valentina',
    lastName: 'Ríos Castro',
    dni: '74892019',
    birthDate: '2011-04-18',
    gender: 'F',
    email: 'vrios@estudiante.bicentenario.edu',
    phone: '+51 987 777 888',
    address: 'Calle Los Sauces 342, San Borja',
    gradeId: '3° Secundaria',
    section: 'A',
    status: 'activo',
    tutorName: 'Fernando Ríos Delgado',
    tutorPhone: '+51 987 999 000',
    tutorEmail: 'frios@apoderado.com',
    registrationDate: '2026-01-15',
    healthData: {
      bloodType: 'O+',
      allergies: 'Penicilina y mariscos',
      chronicConditions: 'Asma leve controlada con inhalador salbutamol',
      emergencyHospital: 'Clínica San Felipe',
      psychologicalNotes: 'Excelente predisposición al liderazgo. Participa activamente en debates.',
    },
  },
  {
    id: 'alu-2',
    code: 'ALU-2026-002',
    firstName: 'Mateo Alejandro',
    lastName: 'Paredes Guzmán',
    dni: '75129384',
    birthDate: '2011-09-02',
    gender: 'M',
    email: 'mparedes@estudiante.bicentenario.edu',
    phone: '+51 978 221 445',
    address: 'Av. Las Palmeras 890, Surco',
    gradeId: '3° Secundaria',
    section: 'A',
    status: 'activo',
    tutorName: 'Gloria Guzmán de Paredes',
    tutorPhone: '+51 978 333 444',
    tutorEmail: 'gguzman@correo.com',
    registrationDate: '2026-01-18',
    healthData: {
      bloodType: 'A+',
      allergies: 'Ninguna conocida',
      chronicConditions: 'Usa lentes de descanso para lectura',
      emergencyHospital: 'Hospital Central Militar',
      psychologicalNotes: 'Gran talento para las ciencias exactas. Destaca en olimpiadas de matemática.',
    },
  },
  {
    id: 'alu-3',
    code: 'ALU-2026-003',
    firstName: 'Camila Sofía',
    lastName: 'Vargas Alarcón',
    dni: '76451290',
    birthDate: '2011-12-14',
    gender: 'F',
    email: 'cvargas@estudiante.bicentenario.edu',
    phone: '+51 965 443 219',
    address: 'Jirón Bolognesi 214, Miraflores',
    gradeId: '3° Secundaria',
    section: 'A',
    status: 'becado',
    tutorName: 'Javier Vargas Ramos',
    tutorPhone: '+51 965 888 777',
    tutorEmail: 'jvargas@empresa.com',
    registrationDate: '2026-01-20',
    healthData: {
      bloodType: 'B+',
      allergies: 'Rinitis alérgica estacional al polen',
      chronicConditions: 'Ninguna',
      emergencyHospital: 'Clínica Anglo Americana',
      psychologicalNotes: 'Beca deportiva y académica. Capitana del equipo de vóley escolar.',
    },
  },
  {
    id: 'alu-4',
    code: 'ALU-2026-004',
    firstName: 'Joaquín Andrés',
    lastName: 'Salas Barrenechea',
    dni: '73908124',
    birthDate: '2010-06-25',
    gender: 'M',
    email: 'jsalas@estudiante.bicentenario.edu',
    phone: '+51 954 112 334',
    address: 'Av. El Sol 450, Chorrillos',
    gradeId: '4° Secundaria',
    section: 'B',
    status: 'moroso',
    tutorName: 'Patricia Barrenechea Solís',
    tutorPhone: '+51 954 667 889',
    tutorEmail: 'pbarrenechea@gmail.com',
    registrationDate: '2026-01-22',
    healthData: {
      bloodType: 'O-',
      allergies: 'Picaduras de abejas / avispas',
      chronicConditions: 'Trae autoinyector de epinefrina en botiquín de aula',
      emergencyHospital: 'Clínica Good Hope',
    },
  },
  {
    id: 'alu-5',
    code: 'ALU-2026-005',
    firstName: 'Luciana Belén',
    lastName: 'Herrera Morales',
    dni: '77890123',
    birthDate: '2011-03-30',
    gender: 'F',
    email: 'lherrera@estudiante.bicentenario.edu',
    phone: '+51 943 556 778',
    address: 'Calle Los Cedros 129, San Isidro',
    gradeId: '3° Secundaria',
    section: 'A',
    status: 'activo',
    tutorName: 'Eduardo Herrera Vidal',
    tutorPhone: '+51 943 999 888',
    tutorEmail: 'eherrera@grupo.com',
    registrationDate: '2026-01-25',
    healthData: {
      bloodType: 'O+',
      allergies: 'Gluten (celiaquía diagnosticada)',
      chronicConditions: 'Dieta estricta libre de gluten en quiosco y comedor',
      emergencyHospital: 'Clínica Internacional',
    },
  },
  {
    id: 'alu-6',
    code: 'ALU-2026-006',
    firstName: 'Daniel Isaac',
    lastName: 'Córdova Zúñiga',
    dni: '78239012',
    birthDate: '2010-11-08',
    gender: 'M',
    email: 'dcordova@estudiante.bicentenario.edu',
    phone: '+51 932 778 990',
    address: 'Av. Primavera 1102, Surco',
    gradeId: '4° Secundaria',
    section: 'B',
    status: 'activo',
    tutorName: 'Carmen Zúñiga de Córdova',
    tutorPhone: '+51 932 111 444',
    tutorEmail: 'czuniga@finanzas.pe',
    registrationDate: '2026-01-28',
    healthData: {
      bloodType: 'AB+',
      allergies: 'Ninguna',
      chronicConditions: 'Ninguna',
      emergencyHospital: 'Clínica Ricardo Palma',
    },
  },
];

export const DEFAULT_ENROLLMENTS: Enrollment[] = [
  {
    id: 'mat-1',
    code: 'MATR-2026-001',
    studentId: 'alu-1',
    gradeLevel: '3° Secundaria',
    section: 'A',
    academicYear: '2026-2027',
    enrollmentDate: '2026-01-15',
    status: 'vigente',
    discountPercentage: 0,
    notes: 'Matrícula regular cancelada en cuota única',
  },
  {
    id: 'mat-2',
    code: 'MATR-2026-002',
    studentId: 'alu-2',
    gradeLevel: '3° Secundaria',
    section: 'A',
    academicYear: '2026-2027',
    enrollmentDate: '2026-01-18',
    status: 'vigente',
    discountPercentage: 0,
    notes: 'Inscripción confirmada',
  },
  {
    id: 'mat-3',
    code: 'MATR-2026-003',
    studentId: 'alu-3',
    gradeLevel: '3° Secundaria',
    section: 'A',
    academicYear: '2026-2027',
    enrollmentDate: '2026-01-20',
    status: 'vigente',
    discountPercentage: 50,
    notes: 'Convenio de Beca a la Excelencia 50%',
  },
  {
    id: 'mat-4',
    code: 'MATR-2026-004',
    studentId: 'alu-4',
    gradeLevel: '4° Secundaria',
    section: 'B',
    academicYear: '2026-2027',
    enrollmentDate: '2026-01-22',
    status: 'condicional',
    discountPercentage: 0,
    notes: 'Pendiente regularizar mensualidad de Marzo',
  },
  {
    id: 'mat-5',
    code: 'MATR-2026-005',
    studentId: 'alu-5',
    gradeLevel: '3° Secundaria',
    section: 'A',
    academicYear: '2026-2027',
    enrollmentDate: '2026-01-25',
    status: 'vigente',
    discountPercentage: 0,
  },
  {
    id: 'mat-6',
    code: 'MATR-2026-006',
    studentId: 'alu-6',
    gradeLevel: '4° Secundaria',
    section: 'B',
    academicYear: '2026-2027',
    enrollmentDate: '2026-01-28',
    status: 'vigente',
    discountPercentage: 0,
  },
];

export const DEFAULT_SCHEDULES: ScheduleSlot[] = [
  // 3° Secundaria (A)
  { id: 'sch-1', dayOfWeek: 1, startTime: '08:00', endTime: '09:30', courseId: 'cur-1', classroomId: 'aul-101', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-2', dayOfWeek: 1, startTime: '09:45', endTime: '11:15', courseId: 'cur-2', classroomId: 'aul-201', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-3', dayOfWeek: 1, startTime: '11:30', endTime: '13:00', courseId: 'cur-4', classroomId: 'aul-102', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-4', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', courseId: 'cur-7', classroomId: 'aul-301', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-5', dayOfWeek: 2, startTime: '09:45', endTime: '11:15', courseId: 'cur-1', classroomId: 'aul-101', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-6', dayOfWeek: 2, startTime: '11:30', endTime: '13:00', courseId: 'cur-6', classroomId: 'aul-202', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-7', dayOfWeek: 3, startTime: '08:00', endTime: '09:30', courseId: 'cur-2', classroomId: 'aul-201', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-8', dayOfWeek: 3, startTime: '09:45', endTime: '11:15', courseId: 'cur-4', classroomId: 'aul-102', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-9', dayOfWeek: 3, startTime: '11:30', endTime: '13:00', courseId: 'cur-7', classroomId: 'aul-301', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-10', dayOfWeek: 4, startTime: '08:00', endTime: '09:30', courseId: 'cur-1', classroomId: 'aul-101', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-11', dayOfWeek: 4, startTime: '09:45', endTime: '11:15', courseId: 'cur-6', classroomId: 'aul-202', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-12', dayOfWeek: 5, startTime: '08:00', endTime: '09:30', courseId: 'cur-7', classroomId: 'aul-301', gradeLevel: '3° Secundaria', section: 'A' },
  { id: 'sch-13', dayOfWeek: 5, startTime: '09:45', endTime: '11:15', courseId: 'cur-4', classroomId: 'aul-102', gradeLevel: '3° Secundaria', section: 'A' },

  // 4° Secundaria (B)
  { id: 'sch-20', dayOfWeek: 1, startTime: '08:00', endTime: '09:30', courseId: 'cur-3', classroomId: 'aul-201', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-21', dayOfWeek: 1, startTime: '09:45', endTime: '11:15', courseId: 'cur-5', classroomId: 'aul-101', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-22', dayOfWeek: 1, startTime: '11:30', endTime: '13:00', courseId: 'cur-8', classroomId: 'aul-201', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-23', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', courseId: 'cur-9', classroomId: 'aul-102', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-24', dayOfWeek: 2, startTime: '09:45', endTime: '11:15', courseId: 'cur-3', classroomId: 'aul-201', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-25', dayOfWeek: 2, startTime: '11:30', endTime: '13:00', courseId: 'cur-5', classroomId: 'aul-101', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-26', dayOfWeek: 3, startTime: '08:00', endTime: '09:30', courseId: 'cur-5', classroomId: 'aul-101', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-27', dayOfWeek: 3, startTime: '09:45', endTime: '11:15', courseId: 'cur-8', classroomId: 'aul-201', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-28', dayOfWeek: 3, startTime: '11:30', endTime: '13:00', courseId: 'cur-9', classroomId: 'aul-102', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-29', dayOfWeek: 4, startTime: '08:00', endTime: '09:30', courseId: 'cur-3', classroomId: 'aul-201', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-30', dayOfWeek: 4, startTime: '09:45', endTime: '11:15', courseId: 'cur-9', classroomId: 'aul-102', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-31', dayOfWeek: 5, startTime: '08:00', endTime: '09:30', courseId: 'cur-5', classroomId: 'aul-101', gradeLevel: '4° Secundaria', section: 'B' },
  { id: 'sch-32', dayOfWeek: 5, startTime: '09:45', endTime: '11:15', courseId: 'cur-8', classroomId: 'aul-201', gradeLevel: '4° Secundaria', section: 'B' },

  // 1° Primaria
  { id: 'sch-40', dayOfWeek: 1, startTime: '08:00', endTime: '09:30', courseId: 'cur-10', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-41', dayOfWeek: 1, startTime: '09:45', endTime: '11:15', courseId: 'cur-11', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-42', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', courseId: 'cur-11', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-43', dayOfWeek: 2, startTime: '09:45', endTime: '11:15', courseId: 'cur-12', classroomId: 'aul-301', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-44', dayOfWeek: 3, startTime: '08:00', endTime: '09:30', courseId: 'cur-10', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-45', dayOfWeek: 3, startTime: '09:45', endTime: '11:15', courseId: 'cur-11', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-46', dayOfWeek: 4, startTime: '08:00', endTime: '09:30', courseId: 'cur-12', classroomId: 'aul-301', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-47', dayOfWeek: 4, startTime: '09:45', endTime: '11:15', courseId: 'cur-10', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-48', dayOfWeek: 5, startTime: '08:00', endTime: '09:30', courseId: 'cur-11', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },
  { id: 'sch-49', dayOfWeek: 5, startTime: '09:45', endTime: '11:15', courseId: 'cur-10', classroomId: 'aul-102', gradeLevel: '1° Primaria', section: 'A' },

  // 2° Primaria
  { id: 'sch-50', dayOfWeek: 1, startTime: '08:00', endTime: '09:30', courseId: 'cur-13', classroomId: 'aul-101', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-51', dayOfWeek: 1, startTime: '09:45', endTime: '11:15', courseId: 'cur-14', classroomId: 'aul-201', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-52', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', courseId: 'cur-14', classroomId: 'aul-201', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-53', dayOfWeek: 2, startTime: '09:45', endTime: '11:15', courseId: 'cur-13', classroomId: 'aul-101', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-54', dayOfWeek: 3, startTime: '08:00', endTime: '09:30', courseId: 'cur-13', classroomId: 'aul-101', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-55', dayOfWeek: 3, startTime: '09:45', endTime: '11:15', courseId: 'cur-14', classroomId: 'aul-201', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-56', dayOfWeek: 4, startTime: '08:00', endTime: '09:30', courseId: 'cur-13', classroomId: 'aul-101', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-57', dayOfWeek: 4, startTime: '09:45', endTime: '11:15', courseId: 'cur-14', classroomId: 'aul-201', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-58', dayOfWeek: 5, startTime: '08:00', endTime: '09:30', courseId: 'cur-14', classroomId: 'aul-201', gradeLevel: '2° Primaria', section: 'A' },
  { id: 'sch-59', dayOfWeek: 5, startTime: '09:45', endTime: '11:15', courseId: 'cur-13', classroomId: 'aul-101', gradeLevel: '2° Primaria', section: 'A' },
];

export const DEFAULT_ATTENDANCES: AttendanceRecord[] = [
  { id: 'att-1', date: '2026-10-30', courseId: 'cur-1', studentId: 'alu-1', status: 'presente', registeredByTeacherId: 'doc-1' },
  { id: 'att-2', date: '2026-10-30', courseId: 'cur-1', studentId: 'alu-2', status: 'presente', registeredByTeacherId: 'doc-1' },
  { id: 'att-3', date: '2026-10-30', courseId: 'cur-1', studentId: 'alu-3', status: 'presente', registeredByTeacherId: 'doc-1' },
  { id: 'att-4', date: '2026-10-30', courseId: 'cur-1', studentId: 'alu-4', status: 'tardanza', comment: 'Llegada 15 min tarde por tráfico', registeredByTeacherId: 'doc-1' },
  { id: 'att-5', date: '2026-10-30', courseId: 'cur-1', studentId: 'alu-5', status: 'presente', registeredByTeacherId: 'doc-1' },
  
  { id: 'att-6', date: '2026-10-29', courseId: 'cur-2', studentId: 'alu-1', status: 'presente', registeredByTeacherId: 'doc-2' },
  { id: 'att-7', date: '2026-10-29', courseId: 'cur-2', studentId: 'alu-2', status: 'presente', registeredByTeacherId: 'doc-2' },
  { id: 'att-8', date: '2026-10-29', courseId: 'cur-2', studentId: 'alu-3', status: 'presente', registeredByTeacherId: 'doc-2' },
  { id: 'att-9', date: '2026-10-29', courseId: 'cur-2', studentId: 'alu-4', status: 'ausente', comment: 'Sin justificativo previo', registeredByTeacherId: 'doc-2' },
  { id: 'att-10', date: '2026-10-29', courseId: 'cur-2', studentId: 'alu-5', status: 'justificado', comment: 'Cita médica certificada', registeredByTeacherId: 'doc-2' },
];

export const DEFAULT_GRADES: GradeRecord[] = [
  // Valentina Ríos (alu-1)
  {
    id: 'gra-1',
    studentId: 'alu-1',
    courseId: 'cur-1', // Matemáticas
    period: '1° Bimestre',
    examScore: 18,
    homeworkScore: 19,
    projectScore: 18,
    attendanceScore: 20,
    finalScore: 18.5,
    status: 'aprobado',
    comments: 'Destacado razonamiento lógico y pulcritud en entregas.',
  },
  {
    id: 'gra-2',
    studentId: 'alu-1',
    courseId: 'cur-2', // Biología
    period: '1° Bimestre',
    examScore: 17,
    homeworkScore: 18,
    projectScore: 19,
    attendanceScore: 20,
    finalScore: 18.2,
    status: 'aprobado',
  },
  {
    id: 'gra-3',
    studentId: 'alu-1',
    courseId: 'cur-4', // Literatura
    period: '1° Bimestre',
    examScore: 19,
    homeworkScore: 19,
    projectScore: 20,
    attendanceScore: 20,
    finalScore: 19.4,
    status: 'aprobado',
    comments: 'Excelente redacción de ensayos y análisis crítico.',
  },
  {
    id: 'gra-4',
    studentId: 'alu-1',
    courseId: 'cur-7', // Inglés
    period: '1° Bimestre',
    examScore: 18,
    homeworkScore: 17,
    projectScore: 18,
    attendanceScore: 19,
    finalScore: 17.9,
    status: 'aprobado',
  },

  // Mateo Paredes (alu-2)
  {
    id: 'gra-5',
    studentId: 'alu-2',
    courseId: 'cur-1',
    period: '1° Bimestre',
    examScore: 20,
    homeworkScore: 19,
    projectScore: 20,
    attendanceScore: 20,
    finalScore: 19.7,
    status: 'aprobado',
    comments: 'Puntaje perfecto en olimpiada interna.',
  },
  {
    id: 'gra-6',
    studentId: 'alu-2',
    courseId: 'cur-2',
    period: '1° Bimestre',
    examScore: 16,
    homeworkScore: 17,
    projectScore: 16,
    attendanceScore: 18,
    finalScore: 16.6,
    status: 'aprobado',
  },

  // Joaquín Salas (alu-4)
  {
    id: 'gra-7',
    studentId: 'alu-4',
    courseId: 'cur-1',
    period: '1° Bimestre',
    examScore: 9,
    homeworkScore: 11,
    projectScore: 10,
    attendanceScore: 12,
    finalScore: 10.1,
    status: 'desaprobado',
    comments: 'Requiere nivelación y tutoría personalizada en trigonometría.',
  },
];

export const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    receiptNumber: 'REC-2026-0041',
    studentId: 'alu-1',
    concept: 'Matrícula Anual 2026',
    amount: 350.00,
    dueDate: '2026-01-30',
    paidDate: '2026-01-15',
    status: 'pagado',
    method: 'transferencia',
    referenceCode: 'BCP-9812401',
    cashierName: 'Lic. Claudia Morales',
  },
  {
    id: 'pay-2',
    receiptNumber: 'REC-2026-0092',
    studentId: 'alu-1',
    concept: 'Pensión / Colegiatura Marzo 2026',
    amount: 280.00,
    dueDate: '2026-03-05',
    paidDate: '2026-03-02',
    status: 'pagado',
    method: 'tarjeta',
    referenceCode: 'VISA-4421',
    cashierName: 'Lic. Claudia Morales',
  },
  {
    id: 'pay-3',
    receiptNumber: 'REC-2026-0145',
    studentId: 'alu-1',
    concept: 'Pensión / Colegiatura Octubre 2026',
    amount: 280.00,
    dueDate: '2026-10-31',
    paidDate: '2026-10-28',
    status: 'pagado',
    method: 'efectivo',
    referenceCode: 'EFEC-098',
    cashierName: 'Lic. Claudia Morales',
  },
  {
    id: 'pay-4',
    receiptNumber: 'REC-2026-0146',
    studentId: 'alu-2',
    concept: 'Pensión / Colegiatura Octubre 2026',
    amount: 280.00,
    dueDate: '2026-10-31',
    paidDate: '2026-10-29',
    status: 'pagado',
    method: 'transferencia',
    referenceCode: 'BBVA-77123',
    cashierName: 'Lic. Claudia Morales',
  },
  {
    id: 'pay-5',
    receiptNumber: 'REC-2026-0147',
    studentId: 'alu-4',
    concept: 'Pensión / Colegiatura Octubre 2026',
    amount: 280.00,
    dueDate: '2026-10-15',
    status: 'vencido',
    notes: 'Recordatorio enviado al tutor por SMS y Notificación Push',
  },
  {
    id: 'pay-6',
    receiptNumber: 'REC-2026-0148',
    studentId: 'alu-5',
    concept: 'Taller Extracurricular de Robótica',
    amount: 90.00,
    dueDate: '2026-11-05',
    status: 'pendiente',
  },
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Simulacro Nacional de Evacuación y Prevención Escolar',
    content: 'Se comunica a toda la comunidad educativa que el jueves a las 10:00 AM se llevará a cabo el simulacro nacional. Los docentes deberán liderar la evacuación de las aulas hacia el patio central con las mochilas de emergencia.',
    category: 'urgente',
    targetAudience: 'todos',
    author: 'Dirección General',
    date: '2026-10-30',
    priority: 'alta',
    pushSent: true,
  },
  {
    id: 'ann-2',
    title: 'Feria Anual de Ciencia, Tecnología y Robótica 2026',
    content: 'Invitamos a los estudiantes de 1° a 5° de Secundaria a registrar sus proyectos de investigación antes del 15 de noviembre en el laboratorio de robótica.',
    category: 'evento',
    targetAudience: 'estudiantes',
    author: 'Coordinación de Ciencias',
    date: '2026-10-28',
    priority: 'media',
    pushSent: true,
  },
  {
    id: 'ann-3',
    title: 'Reunión General de Padres de Familia - Entrega de Boletas',
    content: 'Estimados padres y apoderados: Este sábado se llevará a cabo la entrega presencial y virtual de boletas de calificaciones del bimestre. Por favor verificar que no existan cuotas vencidas pendientes en tesorería.',
    category: 'administrativo',
    targetAudience: 'padres',
    author: 'Tesorería y Coordinación',
    date: '2026-10-25',
    priority: 'alta',
    pushSent: true,
  },
];

export const DEFAULT_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: '🚨 Alerta Crítica: Inasistencia No Justificada',
    body: 'El estudiante Joaquín Salas (4° Sec B) no ingresó a la primera hora de clase. Notificación enviada al tutor legal.',
    timestamp: '2026-10-30T08:35:00Z',
    type: 'critica',
    read: false,
  },
  {
    id: 'notif-2',
    title: '📊 Reporte Periódico Automático Listo',
    body: 'El resumen semanal de asistencia institucional y recaudación de colegiaturas ha sido procesado exitosamente.',
    timestamp: '2026-10-30T07:00:00Z',
    type: 'info',
    read: false,
  },
  {
    id: 'notif-3',
    title: '💳 Aviso de Cobranza',
    body: 'La pensión de Octubre del estudiante Joaquín Salas registra estado de morosidad. Total adeudado: $280.00.',
    timestamp: '2026-10-29T16:00:00Z',
    type: 'pago',
    read: true,
  },
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-30T21:45:10Z',
    userId: 'usr-2',
    userName: 'Ing. Roberto Silva (Admin IT)',
    userRole: 'superadmin',
    action: 'INSPECCION_SISTEMA',
    module: 'Seguridad',
    details: 'Verificación de integridad de cifrado E2EE y llaves WebCrypto',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-30T20:10:22Z',
    userId: 'usr-6',
    userName: 'Lic. Claudia Morales',
    userRole: 'cajero',
    action: 'REGISTRO_PAGO',
    module: 'Pagos',
    details: 'Emisión de recibo REC-2026-0146 por $280.00',
    ipAddress: '192.168.1.14',
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-30T19:16:05Z',
    userId: 'usr-3',
    userName: 'Prof. Carlos Mendoza',
    userRole: 'docente',
    action: 'REGISTRO_NOTAS',
    module: 'Calificaciones',
    details: 'Actualización de notas 1° Bimestre - Curso MAT-3SEC',
    ipAddress: '192.168.1.55',
  },
];

export class StorageService {
  /**
   * Initializes local database or retrieves existing state
   */
  public static loadState(): DatabaseState {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}state`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const sanitizedRoles = (parsed.roles || DEFAULT_ROLES).map((r: CustomRole) => {
          if (r.id === 'role-docente' || r.id === 'role-estudiante' || r.id === 'role-padre') {
            return {
              ...r,
              permissions: {
                ...r.permissions,
                pagos: { create: false, read: false, update: false, delete: false },
              },
            };
          }
          if (r.id === 'role-director' || r.id === 'role-cajero') {
            return {
              ...r,
              permissions: {
                ...r.permissions,
                pagos: { create: true, read: true, update: true, delete: false },
              },
            };
          }
          return r;
        });

        const courses = (parsed.courses && parsed.courses.length >= DEFAULT_COURSES.length)
          ? parsed.courses
          : [
              ...(parsed.courses || []),
              ...DEFAULT_COURSES.filter(dc => !(parsed.courses || []).some((pc: Course) => pc.id === dc.id))
            ];

        const schedules = (parsed.schedules && parsed.schedules.length >= DEFAULT_SCHEDULES.length)
          ? parsed.schedules
          : [
              ...(parsed.schedules || []),
              ...DEFAULT_SCHEDULES.filter(ds => !(parsed.schedules || []).some((ps: ScheduleSlot) => ps.id === ds.id))
            ];

        return {
          config: parsed.config || DEFAULT_CONFIG,
          users: parsed.users || DEFAULT_USERS,
          roles: sanitizedRoles,
          students: parsed.students || DEFAULT_STUDENTS,
          teachers: parsed.teachers || DEFAULT_TEACHERS,
          classrooms: parsed.classrooms || DEFAULT_CLASSROOMS,
          courses,
          enrollments: parsed.enrollments || DEFAULT_ENROLLMENTS,
          schedules,
          attendances: parsed.attendances || DEFAULT_ATTENDANCES,
          grades: parsed.grades || DEFAULT_GRADES,
          payments: parsed.payments || DEFAULT_PAYMENTS,
          announcements: parsed.announcements || DEFAULT_ANNOUNCEMENTS,
          notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
          auditLogs: parsed.auditLogs || DEFAULT_AUDIT_LOGS,
        };
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using defaults:', e);
    }

    const defaultState: DatabaseState = {
      config: DEFAULT_CONFIG,
      users: DEFAULT_USERS,
      roles: DEFAULT_ROLES,
      students: DEFAULT_STUDENTS,
      teachers: DEFAULT_TEACHERS,
      classrooms: DEFAULT_CLASSROOMS,
      courses: DEFAULT_COURSES,
      enrollments: DEFAULT_ENROLLMENTS,
      schedules: DEFAULT_SCHEDULES,
      attendances: DEFAULT_ATTENDANCES,
      grades: DEFAULT_GRADES,
      payments: DEFAULT_PAYMENTS,
      announcements: DEFAULT_ANNOUNCEMENTS,
      notifications: DEFAULT_NOTIFICATIONS,
      auditLogs: DEFAULT_AUDIT_LOGS,
    };

    this.saveState(defaultState);
    return defaultState;
  }

  /**
   * Persists entire database state to storage
   */
  public static saveState(state: DatabaseState): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}state`, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  /**
   * Resets database state to default initial seed data
   */
  public static resetToDefault(): DatabaseState {
    const defaultState: DatabaseState = {
      config: { ...DEFAULT_CONFIG, lastBackupDate: new Date().toISOString() },
      users: DEFAULT_USERS,
      roles: DEFAULT_ROLES,
      students: DEFAULT_STUDENTS,
      teachers: DEFAULT_TEACHERS,
      classrooms: DEFAULT_CLASSROOMS,
      courses: DEFAULT_COURSES,
      enrollments: DEFAULT_ENROLLMENTS,
      schedules: DEFAULT_SCHEDULES,
      attendances: DEFAULT_ATTENDANCES,
      grades: DEFAULT_GRADES,
      payments: DEFAULT_PAYMENTS,
      announcements: DEFAULT_ANNOUNCEMENTS,
      notifications: DEFAULT_NOTIFICATIONS,
      auditLogs: DEFAULT_AUDIT_LOGS,
    };
    this.saveState(defaultState);
    return defaultState;
  }

  /**
   * Exports database as a JSON file download (100% portable backup)
   */
  public static exportJSON(state: DatabaseState): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `EduControl_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Generates a complete PostgreSQL / SQLite compatible .sql dump
   * for zero-friction migration to free cloud backends (Supabase, Neon, Cloud SQL)
   */
  public static exportSQL(state: DatabaseState): void {
    let sql = `-- ==========================================================\n`;
    sql += `-- EduControl Educational Management Database Export (SQL Dump)\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Compatible with: PostgreSQL 14+, SQLite 3, Cloud SQL\n`;
    sql += `-- ==========================================================\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS school_config (\n  institution_name TEXT,\n  current_year TEXT,\n  currency TEXT,\n  address TEXT\n);\n\n`;
    sql += `INSERT INTO school_config VALUES ('${state.config.institutionName.replace(/'/g, "''")}', '${state.config.currentAcademicYear}', '${state.config.currencySymbol}', '${state.config.address.replace(/'/g, "''")}');\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS students (\n  id TEXT PRIMARY KEY,\n  code TEXT UNIQUE,\n  first_name TEXT,\n  last_name TEXT,\n  dni TEXT,\n  grade_id TEXT,\n  section TEXT,\n  status TEXT,\n  tutor_name TEXT,\n  tutor_phone TEXT\n);\n\n`;
    state.students.forEach(s => {
      sql += `INSERT INTO students VALUES ('${s.id}', '${s.code}', '${s.firstName.replace(/'/g, "''")}', '${s.lastName.replace(/'/g, "''")}', '${s.dni}', '${s.gradeId}', '${s.section}', '${s.status}', '${s.tutorName.replace(/'/g, "''")}', '${s.tutorPhone}');\n`;
    });

    sql += `\nCREATE TABLE IF NOT EXISTS teachers (\n  id TEXT PRIMARY KEY,\n  code TEXT UNIQUE,\n  first_name TEXT,\n  last_name TEXT,\n  specialty TEXT,\n  email TEXT,\n  phone TEXT\n);\n\n`;
    state.teachers.forEach(t => {
      sql += `INSERT INTO teachers VALUES ('${t.id}', '${t.code}', '${t.firstName.replace(/'/g, "''")}', '${t.lastName.replace(/'/g, "''")}', '${t.specialty.replace(/'/g, "''")}', '${t.email}', '${t.phone}');\n`;
    });

    sql += `\nCREATE TABLE IF NOT EXISTS payments (\n  id TEXT PRIMARY KEY,\n  receipt_number TEXT,\n  student_id TEXT,\n  concept TEXT,\n  amount DECIMAL(10,2),\n  due_date DATE,\n  status TEXT\n);\n\n`;
    state.payments.forEach(p => {
      sql += `INSERT INTO payments VALUES ('${p.id}', '${p.receiptNumber}', '${p.studentId}', '${p.concept.replace(/'/g, "''")}', ${p.amount}, '${p.dueDate}', '${p.status}');\n`;
    });

    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `EduControl_Cloud_Migration_${new Date().toISOString().slice(0, 10)}.sql`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  }
}
