/**
 * Types & Domain Interfaces for EduControl SIS / ERP
 */

export type UserRole = 'superadmin' | 'director' | 'docente' | 'estudiante' | 'padre' | 'cajero';

export interface UserPermission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  permissions: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customRoleId?: string;
  avatarUrl?: string;
  status: 'activo' | 'inactivo' | 'pendiente';
  lastLogin?: string;
  linkedEntityId?: string; // Links to Student or Teacher ID
  phone?: string;
  password?: string;
  isGoogleLinked?: boolean;
  googleSub?: string;
  emailVerified?: boolean;
  googlePicture?: string;
}

export interface Student {
  id: string;
  code: string; // ej. ALU-2026-001
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Otro';
  email: string;
  phone: string;
  address: string;
  gradeId: string; // ej. "3-sec"
  section: string; // "A", "B", etc.
  status: 'activo' | 'moroso' | 'becado' | 'retirado' | 'inactivo' | 'suspendido';
  tutorName: string;
  tutorPhone: string;
  tutorEmail: string;
  avatarUrl?: string;
  registrationDate: string;
  
  // Encrypted Sensitive Medical & Psychological info (E2EE)
  encryptedHealthData?: string; 
  healthData?: {
    bloodType: string;
    allergies: string;
    chronicConditions: string;
    emergencyHospital: string;
    psychologicalNotes?: string;
  };
}

export interface Teacher {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  dni: string;
  specialty: string;
  email: string;
  phone: string;
  academicDegree: string;
  assignedCourseIds: string[];
  status: 'activo' | 'licencia' | 'inactivo' | 'suspendido';
  hireDate: string;
  avatarUrl?: string;
}

export interface Classroom {
  id: string;
  code: string; // ej. AULA-101
  name: string;
  building: string;
  floor: number;
  capacity: number;
  resources: string[]; // ['Proyector', 'Pizarra Inteligente', 'Aire Acondicionado', 'Audio']
  status: 'disponible' | 'mantenimiento' | 'ocupado';
}

export interface Course {
  id: string;
  code: string; // ej. MAT-3SEC
  name: string;
  gradeLevel: string; // ej. "3° Secundaria"
  teacherId: string;
  weeklyHours: number;
  color: string;
  evaluationWeights: {
    exams: number; // default 40%
    homeworks: number; // default 30%
    projects: number; // default 20%
    attendance: number; // default 10%
  };
}

export interface Enrollment {
  id: string;
  code: string; // MATR-2026-004
  studentId: string;
  gradeLevel: string;
  section: string;
  academicYear: string;
  enrollmentDate: string;
  status: 'vigente' | 'anulada' | 'condicional';
  discountPercentage: number;
  notes?: string;
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Lunes, 6 = Sábado, 7 = Domingo
  startTime: string; // "08:00"
  endTime: string;   // "09:30"
  courseId: string;
  classroomId: string;
  gradeLevel: string;
  section: string;
}

export type AttendanceStatus = 'presente' | 'ausente' | 'tardanza' | 'justificado';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string;
  studentId: string;
  status: AttendanceStatus;
  comment?: string;
  registeredByTeacherId: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  period: '1° Bimestre' | '2° Bimestre' | '3° Bimestre' | '4° Bimestre';
  examScore: number;
  homeworkScore: number;
  projectScore: number;
  attendanceScore: number;
  finalScore: number;
  comments?: string;
  status: 'aprobado' | 'desaprobado' | 'en_curso';
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string; // ej. REC-2026-0089
  studentId: string;
  concept: string; // "Mensualidad Marzo 2026", "Matrícula 2026", "Taller Extracurricular"
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pagado' | 'pendiente' | 'vencido';
  method?: 'efectivo' | 'transferencia' | 'tarjeta' | 'deposito';
  referenceCode?: string;
  cashierName?: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'academico' | 'administrativo' | 'evento' | 'urgente';
  targetAudience: 'todos' | 'docentes' | 'estudiantes' | 'padres' | 'personal';
  author: string;
  date: string;
  priority: 'alta' | 'media' | 'baja';
  pushSent: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'critica' | 'info' | 'academica' | 'pago';
  read: boolean;
  actionUrl?: string;
}

export interface SchoolConfig {
  institutionName: string;
  tagline: string;
  institutionCode: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  currentAcademicYear: string;
  currencySymbol: string;
  gradingScale: '0-20' | '0-10' | '0-100';
  minPassingGrade: number;
  allowSelfRegistration: boolean;
  e2eeEnabled: boolean;
  masterEncryptionKeyHash?: string;
  lastBackupDate?: string;

  // Login Portal & Institutional Branding Customization
  loginTitle?: string;
  loginSubtitle?: string;
  loginBannerUrl?: string;
  loginWelcomeMessage?: string;
  loginThemeColor?: string;
  loginSupportEmail?: string;
  allowGoogleLogin?: boolean;

  // Colors & App-wide theme
  primaryColor?: string;
  secondaryColor?: string;
  appThemePreset?: 'classic_blue' | 'emerald_health' | 'royal_purple' | 'crimson_red' | 'slate_dark' | 'amber_gold' | 'custom';
  loginThemePreset?: 'classic_blue' | 'emerald_health' | 'royal_purple' | 'crimson_red' | 'slate_dark' | 'amber_gold' | 'custom';
  loginCardStyle?: 'glass' | 'solid_dark' | 'solid_white' | 'bordered_neon';
  loginBgGradientStart?: string;
  loginBgGradientEnd?: string;
  loginButtonColor?: string;
  loginBadgeText?: string;
  showLoginHeroBanner?: boolean;
  loginLogoPosition?: 'center' | 'left';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}
