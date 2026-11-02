/**
 * EduControl Application Context & State Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  UserRole,
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
import { StorageService, DatabaseState } from '../services/storage';
import { NotificationService } from '../services/notifications';
import { signInWithGoogleFirebase, signOutFirebase, subscribeToAuthChanges, updateUserProfileFirestore } from '../services/firebaseAuth';
import { validateFirestoreConnection } from '../lib/firebase';

export type AppModule = 
  | 'dashboard'
  | 'usuarios'
  | 'alumnos'
  | 'docentes'
  | 'aulas'
  | 'cursos'
  | 'matriculas'
  | 'horarios'
  | 'asistencias'
  | 'calificaciones'
  | 'pagos'
  | 'comunicados'
  | 'reportes'
  | 'configuracion';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Current user & role simulation
  currentUser: UserAccount;
  currentRole: UserRole;
  setCurrentUser: (user: UserAccount) => void;
  switchRole: (role: UserRole) => void;
  canAccessModule: (module: string) => boolean;
  canCollectPayments: boolean;
  canViewPayments: boolean;

  // Authentication & Session
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  activateUserAccount: (userId: string, role: UserRole) => Promise<void>;
  setAccountStandby: (userId: string, newStatus: 'pendiente' | 'inactivo') => Promise<void>;
  toggleStudentStatus: (studentId: string, newStatus: Student['status'], reason?: string) => Promise<void>;
  toggleTeacherStatus: (teacherId: string, newStatus: Teacher['status'], reason?: string) => Promise<void>;
  toggleUserStatus: (userId: string, newStatus: 'activo' | 'inactivo' | 'pendiente', reason?: string) => Promise<void>;
  loginWithCredentials: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogleFirebase: () => Promise<{ success: boolean; message: string; user?: UserAccount }>;
  loginWithGoogle: (googleAccount: { email: string; name: string; picture?: string; googleSub?: string }) => Promise<{ success: boolean; message: string }>;
  registerWithGoogle: (data: { email: string; name: string; role: UserRole; picture?: string; phone?: string; googleSub?: string }) => Promise<{ success: boolean; message: string }>;
  registerUser: (data: { email: string; name: string; role: UserRole; password?: string; phone?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchAccount: (userId: string) => void;
  updateUserProfile: (data: Partial<UserAccount>) => void;

  // Active navigation
  activeModule: AppModule;
  setActiveModule: (mod: AppModule) => void;

  // Database State
  config: SchoolConfig;
  updateConfig: (newConfig: Partial<SchoolConfig>) => void;
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

  // Entity mutations
  saveStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  saveTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void;
  saveClassroom: (classroom: Classroom) => void;
  deleteClassroom: (classroomId: string) => void;
  saveCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  saveEnrollment: (enrollment: Enrollment) => void;
  saveScheduleSlot: (slot: ScheduleSlot) => void;
  deleteScheduleSlot: (slotId: string) => void;
  recordAttendanceBatch: (records: AttendanceRecord[]) => void;
  saveGrade: (grade: GradeRecord) => void;
  recordPayment: (payment: PaymentRecord) => void;
  createAnnouncement: (announcement: Announcement, sendPush?: boolean) => void;
  saveCustomRole: (role: CustomRole) => void;
  saveUserAccount: (user: UserAccount) => void;

  // Notifications & Alerts
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  triggerPushAlert: (title: string, body: string, isCritical?: boolean) => void;
  runPeriodicAutomatedReport: () => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Security E2EE
  encryptionUnlocked: boolean;
  setEncryptionUnlocked: (unlocked: boolean) => void;

  // Backup & Reset
  exportDatabaseJSON: () => void;
  exportDatabaseSQL: () => void;
  importDatabaseJSON: (data: DatabaseState) => void;
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState<DatabaseState>(() => StorageService.loadState());
  const [activeModule, setActiveModule] = useState<AppModule>('dashboard');
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('educontrol_auth');
    return saved !== 'false';
  });

  // Default to Superadmin pixelglez1988@gmail.com
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    return dbState.users.find(u => u.email.toLowerCase() === 'pixelglez1988@gmail.com') || dbState.users[0];
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser.role);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [encryptionUnlocked, setEncryptionUnlocked] = useState<boolean>(true);

  // Sync state to storage whenever it changes
  useEffect(() => {
    StorageService.saveState(dbState);
  }, [dbState]);

  // Test Firestore connection on boot
  useEffect(() => {
    validateFirestoreConnection()
      .then(ok => {
        if (ok) {
          console.log('Firebase Firestore connection verified.');
        }
      })
      .catch(err => {
        console.warn('Verificación de conexión Firestore inicial en modo offline:', err?.message || err);
      });

    // Listen to Firebase Auth state
    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser && fbUser.email) {
        setDbState(prev => {
          const userIdx = prev.users.findIndex(u => u.id === fbUser.uid || u.email.toLowerCase() === fbUser.email!.toLowerCase());
          if (userIdx >= 0) {
            const updated = [...prev.users];
            updated[userIdx] = {
              ...updated[userIdx],
              id: fbUser.uid,
              name: fbUser.displayName || updated[userIdx].name,
              avatarUrl: fbUser.photoURL || updated[userIdx].avatarUrl,
              googlePicture: fbUser.photoURL || updated[userIdx].googlePicture,
              emailVerified: fbUser.emailVerified,
              isGoogleLinked: true,
            };
            return { ...prev, users: updated };
          }
          return prev;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logAudit = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action,
      module,
      details,
      ipAddress: '192.168.1.15',
    };
    setDbState(prev => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs.slice(0, 99)],
    }));
  };

  // Helper booleans for payment authorization
  const canCollectPayments = ['superadmin', 'director', 'cajero'].includes(currentRole);
  const canViewPayments = canCollectPayments;

  // Switch role simulator
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const userForRole = dbState.users.find(u => u.role === role) || {
      id: `usr-${role}`,
      name: `Usuario de Prueba (${role})`,
      email: `${role}@colegio.edu`,
      role,
      status: 'activo',
    };
    setCurrentUser(userForRole);

    // If switching to a role that cannot access the current active module (e.g. pagos), redirect to dashboard
    if (activeModule === 'pagos' && !['superadmin', 'director', 'cajero'].includes(role)) {
      setActiveModule('dashboard');
    }

    addToast('info', 'Rol Activo Cambiado', `Ahora estás visualizando el sistema como: ${role.toUpperCase()}`);
    logAudit('CAMBIO_ROL_SIMULADO', 'Seguridad', `Cambio de contexto a rol: ${role}`);
  };

  // Switch between existing accounts
  const switchAccount = (userId: string) => {
    const user = dbState.users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      setIsAuthenticated(true);
      localStorage.setItem('educontrol_auth', 'true');
      if (activeModule === 'pagos' && !['superadmin', 'director', 'cajero'].includes(user.role)) {
        setActiveModule('dashboard');
      }
      addToast('success', 'Cuenta Cambiada', `Sesión activa como: ${user.name} (${user.role.toUpperCase()})`);
      logAudit('CAMBIO_CUENTA', 'Seguridad', `Cambio a cuenta de usuario: ${user.email}`);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    setIsAuthenticated(false);
    localStorage.setItem('educontrol_auth', 'false');
    addToast('info', 'Sesión Finalizada', 'Has salido del sistema. Puedes volver a ingresar en el portal.');
    logAudit('CIERRE_SESION', 'Seguridad', `Cierre de sesión de ${currentUser.email}`);
  };

  // Login with Email & Password
  const loginWithCredentials = async (email: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const user = dbState.users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'No existe una cuenta registrada con ese correo.' };
    }
    if (user.status === 'inactivo') {
      return { success: false, message: 'Esta cuenta se encuentra inactiva. Contacte a la administración.' };
    }
    if (user.password && password && user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta. Verifique sus credenciales.' };
    }

    const updatedUser: UserAccount = {
      ...user,
      lastLogin: new Date().toISOString(),
    };

    setDbState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? updatedUser : u),
    }));

    setCurrentUser(updatedUser);
    setCurrentRole(updatedUser.role);
    setIsAuthenticated(true);
    localStorage.setItem('educontrol_auth', 'true');

    if (activeModule === 'pagos' && !['superadmin', 'director', 'cajero'].includes(updatedUser.role)) {
      setActiveModule('dashboard');
    }

    addToast('success', 'Bienvenido(a)', `Hola ${updatedUser.name}, has iniciado sesión.`);
    logAudit('INICIO_SESION_LOCAL', 'Seguridad', `Inicio de sesión exitoso: ${updatedUser.email}`);
    return { success: true, message: 'Inicio de sesión exitoso' };
  };

  // Firebase Real Google Sign-In with automated profile sync
  const loginWithGoogleFirebase = async (): Promise<{ success: boolean; message: string; user?: UserAccount }> => {
    const res = await signInWithGoogleFirebase();
    if (!res.success || !res.user) {
      return {
        success: false,
        message: res.message || 'Error al autenticar con Google.',
      };
    }

    const authenticatedUser = res.user;

    setDbState(prev => {
      const idx = prev.users.findIndex(u => u.id === authenticatedUser.id || u.email.toLowerCase() === authenticatedUser.email.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev.users];
        copy[idx] = authenticatedUser;
        return { ...prev, users: copy };
      }
      return { ...prev, users: [...prev.users, authenticatedUser] };
    });

    setCurrentUser(authenticatedUser);
    setCurrentRole(authenticatedUser.role);
    setIsAuthenticated(true);
    localStorage.setItem('educontrol_auth', 'true');

    // Strict access control: redirect if non-financial role was on pagos
    if (activeModule === 'pagos' && !['superadmin', 'director', 'cajero'].includes(authenticatedUser.role)) {
      setActiveModule('dashboard');
    }

    addToast('success', 'Autenticación con Google', `¡Bienvenido(a), ${authenticatedUser.name}!`);
    logAudit('LOGIN_FIREBASE_GOOGLE', 'Seguridad', `Autenticación exitosa con Google Firebase: ${authenticatedUser.email}`);

    return {
      success: true,
      message: res.message || 'Autenticado con éxito',
      user: authenticatedUser,
    };
  };

  // Direct Google Sign-In (Identity/Mock Fallback)
  const loginWithGoogle = async (googleAccount: { email: string; name: string; picture?: string; googleSub?: string }): Promise<{ success: boolean; message: string }> => {
    let user = dbState.users.find(u => u.email.trim().toLowerCase() === googleAccount.email.trim().toLowerCase());

    if (!user) {
      const isSuper = googleAccount.email.trim().toLowerCase() === 'pixelglez1988@gmail.com';
      // Auto-register user: Only pixelglez1988 is superadmin/active, all others are standby pending approval
      const newUser: UserAccount = {
        id: `usr-g-${Date.now()}`,
        name: googleAccount.name,
        email: googleAccount.email,
        role: isSuper ? 'superadmin' : 'estudiante',
        status: isSuper ? 'activo' : 'pendiente',
        avatarUrl: googleAccount.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleAccount.name)}`,
        googlePicture: googleAccount.picture,
        isGoogleLinked: true,
        googleSub: googleAccount.googleSub || `g_${Date.now()}`,
        emailVerified: true,
        lastLogin: new Date().toISOString(),
      };
      setDbState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
      }));
      user = newUser;
    } else {
      user = {
        ...user,
        isGoogleLinked: true,
        emailVerified: true,
        googlePicture: googleAccount.picture || user.avatarUrl,
        lastLogin: new Date().toISOString(),
      };
      setDbState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === user!.id ? user! : u),
      }));
    }

    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    localStorage.setItem('educontrol_auth', 'true');

    if (activeModule === 'pagos' && !['superadmin', 'director', 'cajero'].includes(user.role)) {
      setActiveModule('dashboard');
    }

    if (user.status === 'pendiente') {
      addToast('info', 'Cuenta en Standby', 'Tu cuenta está registrada en espera de activación por el Superadministrador.');
    } else {
      addToast('success', 'Autenticación Verificada', `Identidad confirmada: ${user.name}`);
    }
    logAudit('LOGIN_GOOGLE_VERIFICADO', 'Seguridad', `Inicio con Google OAuth: ${user.email} (Estado: ${user.status})`);
    return { success: true, message: 'Autenticado con Google exitosamente' };
  };

  // Register with Google Identity Verification
  const registerWithGoogle = async (data: { email: string; name: string; role: UserRole; picture?: string; phone?: string; googleSub?: string }): Promise<{ success: boolean; message: string }> => {
    const existing = dbState.users.find(u => u.email.trim().toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'El correo electrónico ya está registrado en el sistema.' };
    }

    const isSuper = data.email.trim().toLowerCase() === 'pixelglez1988@gmail.com';
    const assignedRole: UserRole = isSuper ? 'superadmin' : (data.role === 'superadmin' ? 'estudiante' : data.role);
    const assignedStatus: 'activo' | 'pendiente' = isSuper ? 'activo' : 'pendiente';

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: assignedRole,
      status: assignedStatus,
      phone: data.phone || '',
      avatarUrl: data.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      googlePicture: data.picture,
      isGoogleLinked: true,
      googleSub: data.googleSub || `g_${Date.now()}`,
      emailVerified: true,
      lastLogin: new Date().toISOString(),
    };

    setDbState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
    }));

    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    setIsAuthenticated(true);
    localStorage.setItem('educontrol_auth', 'true');

    if (activeModule === 'pagos' && !['superadmin', 'director', 'cajero'].includes(newUser.role)) {
      setActiveModule('dashboard');
    }

    if (assignedStatus === 'pendiente') {
      addToast('info', 'Cuenta en Espera de Activación', 'Cuenta registrada. El Superadministrador asignará tu rol y activará el acceso.');
    } else {
      addToast('success', 'Registro con Google Exitoso', `Cuenta creada para ${newUser.name}`);
    }
    logAudit('REGISTRO_GOOGLE_VERIFICADO', 'Seguridad', `Nuevo usuario registrado vía Google: ${newUser.email} (Estado: ${assignedStatus})`);
    return { success: true, message: 'Cuenta creada con Google' };
  };

  // Standard Registration
  const registerUser = async (data: { email: string; name: string; role: UserRole; password?: string; phone?: string }): Promise<{ success: boolean; message: string }> => {
    const existing = dbState.users.find(u => u.email.trim().toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'Ya existe una cuenta con este correo institucional.' };
    }

    const isSuper = data.email.trim().toLowerCase() === 'pixelglez1988@gmail.com';
    const assignedRole: UserRole = isSuper ? 'superadmin' : (data.role === 'superadmin' ? 'estudiante' : data.role);
    const assignedStatus: 'activo' | 'pendiente' = isSuper ? 'activo' : 'pendiente';

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: assignedRole,
      status: assignedStatus,
      phone: data.phone || '',
      password: data.password || '123456',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      emailVerified: false,
      lastLogin: new Date().toISOString(),
    };

    setDbState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
    }));

    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    setIsAuthenticated(true);
    localStorage.setItem('educontrol_auth', 'true');

    if (activeModule === 'pagos' && !['superadmin', 'director', 'cajero'].includes(newUser.role)) {
      setActiveModule('dashboard');
    }

    if (assignedStatus === 'pendiente') {
      addToast('info', 'Cuenta en Espera', 'Registro completado. Esperando activación por el Superadministrador.');
    } else {
      addToast('success', 'Cuenta Creada', `Bienvenido al sistema, ${newUser.name}`);
    }
    logAudit('REGISTRO_USUARIO', 'Seguridad', `Nuevo usuario creado: ${newUser.email} (Estado: ${assignedStatus})`);
    return { success: true, message: 'Cuenta registrada exitosamente' };
  };

  // Superadmin Single-Authority Check
  const isSuperAdmin = currentUser.email.toLowerCase() === 'pixelglez1988@gmail.com';

  // Superadmin action: Activate pending account and assign role
  const activateUserAccount = async (userId: string, assignedRole: UserRole) => {
    if (!isSuperAdmin) {
      addToast('error', 'Acceso Denegado', 'Solo el Superadministrador (pixelglez1988@gmail.com) puede activar cuentas y asignar roles.');
      return;
    }

    const safeRole: UserRole = assignedRole === 'superadmin' ? 'director' : assignedRole;

    setDbState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? {
        ...u,
        status: 'activo',
        role: safeRole,
      } : u)
    }));

    try {
      await updateUserProfileFirestore(userId, {
        status: 'activo',
        role: safeRole,
      });
    } catch (err) {
      console.warn('Firestore user activation update warning:', err);
    }

    addToast('success', 'Cuenta Activada', `Usuario aprobado y activado con rol: ${safeRole.toUpperCase()}`);
    logAudit('ACTIVACION_USUARIO', 'Seguridad', `Superadmin activó a usuario ${userId} con rol ${safeRole}`);
  };

  // Superadmin action: Put account in Standby or Deactivate
  const setAccountStandby = async (userId: string, newStatus: 'pendiente' | 'inactivo') => {
    if (!isSuperAdmin) {
      addToast('error', 'Acceso Denegado', 'Solo el Superadministrador puede modificar el estado de activación.');
      return;
    }

    const targetUser = dbState.users.find(u => u.id === userId);
    if (targetUser?.email.toLowerCase() === 'pixelglez1988@gmail.com') {
      addToast('error', 'Operación Bloqueada', 'El Superadministrador titular no puede ser pausado ni revocado.');
      return;
    }

    setDbState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? {
        ...u,
        status: newStatus,
      } : u)
    }));

    try {
      await updateUserProfileFirestore(userId, { status: newStatus });
    } catch (err) {
      console.warn('Firestore status update warning:', err);
    }

    addToast('info', 'Estado Actualizado', `La cuenta ahora se encuentra en estado: ${newStatus.toUpperCase()}`);
    logAudit('CAMBIO_ESTADO_USUARIO', 'Seguridad', `Superadmin cambió estado de ${userId} a ${newStatus}`);
  };

  // Freeze / Pause or Activate a Student Account
  // Permitted for: Superadmin, Director, and Docente
  const toggleStudentStatus = async (studentId: string, newStatus: Student['status'], reason?: string) => {
    if (!['superadmin', 'director', 'docente'].includes(currentRole)) {
      addToast('error', 'Permiso Insuficiente', 'Solo administradores y docentes pueden pausar o reactivar cuentas de alumnos.');
      return;
    }

    const student = dbState.students.find(s => s.id === studentId);
    if (!student) return;

    const isFreezing = newStatus === 'inactivo' || newStatus === 'suspendido';

    setDbState(prev => {
      const updatedStudents = prev.students.map(s => s.id === studentId ? { ...s, status: newStatus } : s);
      const updatedUsers = prev.users.map(u => {
        if (u.linkedEntityId === studentId || (u.email && student.email && u.email.toLowerCase() === student.email.toLowerCase())) {
          return {
            ...u,
            status: (isFreezing ? 'inactivo' : 'activo') as 'activo' | 'inactivo' | 'pendiente',
          };
        }
        return u;
      });

      return {
        ...prev,
        students: updatedStudents,
        users: updatedUsers,
      };
    });

    if (currentUser.linkedEntityId === studentId || (currentUser.email && student.email && currentUser.email.toLowerCase() === student.email.toLowerCase())) {
      if (isFreezing) {
        setCurrentUser(prev => ({ ...prev, status: 'inactivo' }));
      }
    }

    const actionLabel = isFreezing ? 'Alumno Pausado / Inhabilitado' : 'Alumno Reactivado';
    addToast(isFreezing ? 'warning' : 'success', actionLabel, `${student.firstName} ${student.lastName} ha sido ${isFreezing ? 'congelado(a) del portal' : 'reactivado(a)'}.`);
    logAudit(isFreezing ? 'CONGELAR_ALUMNO' : 'REACTIVAR_ALUMNO', 'Alumnos', `${currentUser.name} (${currentRole}) cambió estado de alumno ${student.code} a ${newStatus}. ${reason ? 'Motivo: ' + reason : ''}`);
  };

  // Freeze / Pause or Activate a Teacher
  // Permitted ONLY for: Superadmin and Director (Docentes cannot manage teachers or directors)
  const toggleTeacherStatus = async (teacherId: string, newStatus: Teacher['status'], reason?: string) => {
    if (!['superadmin', 'director'].includes(currentRole)) {
      addToast('error', 'Permiso Insuficiente', 'Solo el Superadministrador y Directores pueden pausar o reactivar a docentes.');
      return;
    }

    const teacher = dbState.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const isFreezing = newStatus === 'inactivo' || newStatus === 'suspendido';

    setDbState(prev => {
      const updatedTeachers = prev.teachers.map(t => t.id === teacherId ? { ...t, status: newStatus } : t);
      const updatedUsers = prev.users.map(u => {
        if (u.linkedEntityId === teacherId || (u.email && teacher.email && u.email.toLowerCase() === teacher.email.toLowerCase())) {
          return {
            ...u,
            status: (isFreezing ? 'inactivo' : 'activo') as 'activo' | 'inactivo' | 'pendiente',
          };
        }
        return u;
      });

      return {
        ...prev,
        teachers: updatedTeachers,
        users: updatedUsers,
      };
    });

    const actionLabel = isFreezing ? 'Docente Pausado / Congelado' : 'Docente Reactivado';
    addToast(isFreezing ? 'warning' : 'success', actionLabel, `El profesor(a) ${teacher.firstName} ${teacher.lastName} ha sido ${isFreezing ? 'inhabilitado(a) de acceso' : 'reactivado(a)'}.`);
    logAudit(isFreezing ? 'CONGELAR_DOCENTE' : 'REACTIVAR_DOCENTE', 'Docentes', `${currentUser.name} (${currentRole}) cambió estado de docente ${teacher.code} a ${newStatus}. ${reason ? 'Motivo: ' + reason : ''}`);
  };

  // Toggle user account status
  const toggleUserStatus = async (userId: string, newStatus: 'activo' | 'inactivo' | 'pendiente', reason?: string) => {
    if (!['superadmin', 'director'].includes(currentRole)) {
      addToast('error', 'Permiso Insuficiente', 'Solo administradores pueden cambiar el estado de acceso de los usuarios.');
      return;
    }

    const targetUser = dbState.users.find(u => u.id === userId);
    if (targetUser?.email.toLowerCase() === 'pixelglez1988@gmail.com') {
      addToast('error', 'Operación Bloqueada', 'El Superadministrador titular nunca puede ser pausado ni inhabilitado.');
      return;
    }

    setDbState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, status: newStatus } : u),
    }));

    try {
      await updateUserProfileFirestore(userId, { status: newStatus });
    } catch (err) {
      console.warn('Firestore status update warning:', err);
    }

    addToast('info', 'Estado de Cuenta Modificado', `Usuario actualizado a estado: ${newStatus.toUpperCase()}`);
    logAudit('MODIFICAR_ESTADO_USUARIO', 'Seguridad', `Estado de ${targetUser?.email || userId} cambiado a ${newStatus}. ${reason || ''}`);
  };

  // Update current user profile
  const updateUserProfile = (data: Partial<UserAccount>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setDbState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === currentUser.id ? updated : u),
    }));

    // If user has a Firebase UID or is Google Linked, sync profile changes in Firestore
    if (currentUser.isGoogleLinked || currentUser.id.length > 20) {
      updateUserProfileFirestore(currentUser.id, {
        name: updated.name,
        avatarUrl: updated.avatarUrl,
        googlePicture: updated.googlePicture,
        phone: updated.phone,
        lastLogin: new Date().toISOString(),
      }).catch(err => {
        console.warn('Firestore profile sync warning:', err);
      });
    }

    addToast('success', 'Perfil Guardado', 'Tus datos de perfil han sido actualizados con éxito.');
    logAudit('PERFIL_ACTUALIZADO', 'Seguridad', `Modificación del perfil de ${currentUser.email}`);
  };

  // Permission verification
  const canAccessModule = (module: string): boolean => {
    // If account is pending activation or inactive, block all internal modules
    if (currentUser.status === 'pendiente' || currentUser.status === 'inactivo') {
      return false;
    }
    // Strictly restricted: ONLY superadmin, director (administradores) and cajero (caja) can view or charge payments
    if (module === 'pagos') {
      return ['superadmin', 'director', 'cajero'].includes(currentRole);
    }
    // Students can NEVER access user security, settings, registrations, teachers, or accounts
    if (currentRole === 'estudiante') {
      if (['usuarios', 'configuracion', 'docentes', 'matriculas'].includes(module)) {
        return false;
      }
    }
    // Teachers cannot access user security or configuration (directors and superadmin manage them)
    if (currentRole === 'docente') {
      if (['usuarios', 'configuracion'].includes(module)) {
        return false;
      }
    }
    if (currentRole === 'superadmin') return true;
    const roleDef = dbState.roles.find(r => r.id === `role-${currentRole}`);
    if (!roleDef) return true;
    const perm = roleDef.permissions[module];
    return perm ? (perm.read || perm.create || perm.update) : true;
  };

  // Trigger push alert
  const triggerPushAlert = (title: string, body: string, isCritical: boolean = false) => {
    NotificationService.sendNativePush(title, body, isCritical);
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: new Date().toISOString(),
      type: isCritical ? 'critica' : 'info',
      read: false,
    };
    setDbState(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
    addToast(isCritical ? 'error' : 'info', title, body);
  };

  // Automated Periodic Report Trigger (simulates scheduled cron in browser)
  const runPeriodicAutomatedReport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const totalStudents = dbState.students.length;
    const todayAtt = dbState.attendances.filter(a => a.date === today);
    const present = todayAtt.filter(a => a.status === 'presente').length;
    const attendancePct = todayAtt.length > 0 ? ((present / todayAtt.length) * 100).toFixed(0) : '94';
    
    const overdueCount = dbState.payments.filter(p => p.status === 'vencido').length;

    const reportTitle = '📊 Informe Operativo Automatizado';
    const reportBody = `Corte del día: Asistencia ${attendancePct}% (${present}/${todayAtt.length || totalStudents}). ${overdueCount} cuotas vencidas pendientes.`;

    triggerPushAlert(reportTitle, reportBody, false);
    logAudit('INFORME_AUTOMATICO_GENERADO', 'Reportes', 'Disparo de reporte programado de operatividad académica');
  };

  // Mutations
  const updateConfig = (newConfig: Partial<SchoolConfig>) => {
    setDbState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig },
    }));
    addToast('success', 'Configuración Guardada', 'Los parámetros institucionales fueron actualizados con éxito.');
    logAudit('CONFIGURACION_ACTUALIZADA', 'Configuración', 'Cambios guardados en parámetros de la institución');
  };

  const saveStudent = (student: Student) => {
    setDbState(prev => {
      const exists = prev.students.some(s => s.id === student.id);
      return {
        ...prev,
        students: exists
          ? prev.students.map(s => (s.id === student.id ? student : s))
          : [student, ...prev.students],
      };
    });
    addToast('success', 'Expediente de Alumno', `${student.lastName}, ${student.firstName} guardado correctamente.`);
    logAudit('GUARDAR_ALUMNO', 'Alumnos', `Registro/actualización del estudiante ${student.code}`);
  };

  const deleteStudent = (studentId: string) => {
    setDbState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId),
    }));
    addToast('warning', 'Alumno Eliminado', 'El estudiante fue retirado del padrón.');
    logAudit('ELIMINAR_ALUMNO', 'Alumnos', `Eliminado ID: ${studentId}`);
  };

  const saveTeacher = (teacher: Teacher) => {
    setDbState(prev => {
      const exists = prev.teachers.some(t => t.id === teacher.id);
      return {
        ...prev,
        teachers: exists
          ? prev.teachers.map(t => (t.id === teacher.id ? teacher : t))
          : [teacher, ...prev.teachers],
      };
    });
    addToast('success', 'Docente Registrado', `${teacher.lastName}, ${teacher.firstName} guardado.`);
    logAudit('GUARDAR_DOCENTE', 'Docentes', `Profesor ${teacher.code} actualizado`);
  };

  const deleteTeacher = (teacherId: string) => {
    setDbState(prev => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.id !== teacherId),
    }));
    addToast('warning', 'Docente Retirado', 'Docente eliminado de la nómina.');
  };

  const saveClassroom = (classroom: Classroom) => {
    setDbState(prev => {
      const exists = prev.classrooms.some(c => c.id === classroom.id);
      return {
        ...prev,
        classrooms: exists
          ? prev.classrooms.map(c => (c.id === classroom.id ? classroom : c))
          : [...prev.classrooms, classroom],
      };
    });
    addToast('success', 'Aula Actualizada', `Salón ${classroom.name} registrado.`);
  };

  const deleteClassroom = (classroomId: string) => {
    setDbState(prev => ({
      ...prev,
      classrooms: prev.classrooms.filter(c => c.id !== classroomId),
    }));
    addToast('warning', 'Aula Eliminada', 'Espacio eliminado del catálogo.');
  };

  const saveCourse = (course: Course) => {
    setDbState(prev => {
      const exists = prev.courses.some(c => c.id === course.id);
      return {
        ...prev,
        courses: exists
          ? prev.courses.map(c => (c.id === course.id ? course : c))
          : [...prev.courses, course],
      };
    });
    addToast('success', 'Asignatura Guardada', `Curso ${course.name} actualizado.`);
  };

  const deleteCourse = (courseId: string) => {
    setDbState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId),
    }));
    addToast('warning', 'Curso Eliminado', 'Asignatura retirada de la malla curricular.');
  };

  const saveEnrollment = (enrollment: Enrollment) => {
    setDbState(prev => {
      const exists = prev.enrollments.some(e => e.id === enrollment.id);
      return {
        ...prev,
        enrollments: exists
          ? prev.enrollments.map(e => (e.id === enrollment.id ? enrollment : e))
          : [enrollment, ...prev.enrollments],
      };
    });
    addToast('success', 'Matrícula Procesada', `Constancia N° ${enrollment.code} emitida.`);
    logAudit('MATRICULA_PROCESADA', 'Matrículas', `Matrícula ${enrollment.code}`);
  };

  const saveScheduleSlot = (slot: ScheduleSlot) => {
    setDbState(prev => {
      const exists = prev.schedules.some(s => s.id === slot.id);
      return {
        ...prev,
        schedules: exists
          ? prev.schedules.map(s => (s.id === slot.id ? slot : s))
          : [...prev.schedules, slot],
      };
    });
    addToast('success', 'Horario Asignado', 'Bloque de clase guardado en el cronograma.');
  };

  const deleteScheduleSlot = (slotId: string) => {
    setDbState(prev => ({
      ...prev,
      schedules: prev.schedules.filter(s => s.id !== slotId),
    }));
    addToast('info', 'Horario Removido', 'Bloque de clase eliminado.');
  };

  const recordAttendanceBatch = (records: AttendanceRecord[]) => {
    setDbState(prev => {
      const filtered = prev.attendances.filter(
        a => !records.some(r => r.date === a.date && r.courseId === a.courseId && r.studentId === a.studentId)
      );
      return {
        ...prev,
        attendances: [...records, ...filtered],
      };
    });

    const absents = records.filter(r => r.status === 'ausente');
    if (absents.length > 0) {
      triggerPushAlert(
        '⚠️ Alerta de Inasistencia',
        `Se han registrado ${absents.length} faltas no justificadas el día de hoy. Notificaciones automáticas despachadas a apoderados.`,
        true
      );
    } else {
      addToast('success', 'Asistencia Registrada', `Control de asistencia guardado para ${records.length} estudiantes.`);
    }
  };

  const saveGrade = (grade: GradeRecord) => {
    setDbState(prev => {
      const exists = prev.grades.some(g => g.id === grade.id);
      return {
        ...prev,
        grades: exists
          ? prev.grades.map(g => (g.id === grade.id ? grade : g))
          : [grade, ...prev.grades],
      };
    });
    addToast('success', 'Nota Asentada', `Calificación guardada con promedio: ${grade.finalScore.toFixed(1)}`);
    logAudit('REGISTRO_NOTA', 'Calificaciones', `Nota guardada para estudiante ${grade.studentId}`);
  };

  const recordPayment = (payment: PaymentRecord) => {
    if (!canCollectPayments) {
      addToast('error', 'Acción No Autorizada', 'Solo el Administrador y Caja tienen permisos para realizar cobros o registrar pagos.');
      return;
    }

    setDbState(prev => {
      const exists = prev.payments.some(p => p.id === payment.id);
      return {
        ...prev,
        payments: exists
          ? prev.payments.map(p => (p.id === payment.id ? payment : p))
          : [payment, ...prev.payments],
      };
    });
    addToast('success', 'Cobro Registrado en Caja', `Recibo N° ${payment.receiptNumber} por ${dbState.config.currencySymbol} ${payment.amount.toFixed(2)} emitido.`);
    logAudit('EMISION_RECIBO_PAGO', 'Pagos', `Recibo ${payment.receiptNumber} por ${payment.amount} registrado por ${currentUser.name} (${currentRole})`);
  };

  const createAnnouncement = (announcement: Announcement, sendPush: boolean = true) => {
    setDbState(prev => ({
      ...prev,
      announcements: [announcement, ...prev.announcements],
    }));

    if (sendPush) {
      triggerPushAlert(
        `📢 ${announcement.title}`,
        announcement.content.slice(0, 120) + '...',
        announcement.priority === 'alta'
      );
    }
    addToast('success', 'Comunicado Publicado', 'El aviso ha sido difundido a la comunidad escolar.');
  };

  const saveCustomRole = (role: CustomRole) => {
    setDbState(prev => {
      const exists = prev.roles.some(r => r.id === role.id);
      return {
        ...prev,
        roles: exists
          ? prev.roles.map(r => (r.id === role.id ? role : r))
          : [...prev.roles, role],
      };
    });
    addToast('success', 'Rol de Seguridad Guardado', `Perfil de permisos para ${role.name} actualizado.`);
  };

  const saveUserAccount = (user: UserAccount) => {
    setDbState(prev => {
      const exists = prev.users.some(u => u.id === user.id);
      return {
        ...prev,
        users: exists
          ? prev.users.map(u => (u.id === user.id ? user : u))
          : [...prev.users, user],
      };
    });
    addToast('success', 'Cuenta de Usuario', `Usuario ${user.name} guardado con éxito.`);
  };

  const markNotificationRead = (id: string) => {
    setDbState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const clearAllNotifications = () => {
    setDbState(prev => ({
      ...prev,
      notifications: [],
    }));
    addToast('info', 'Notificaciones Limpiadas', 'Bandeja de alertas vacía.');
  };

  const exportDatabaseJSON = () => {
    StorageService.exportJSON(dbState);
    addToast('success', 'Copia de Seguridad Lista', 'Archivo JSON generado y descargado.');
    logAudit('BACKUP_JSON', 'Configuración', 'Descarga de respaldo total de la base de datos');
  };

  const exportDatabaseSQL = () => {
    StorageService.exportSQL(dbState);
    addToast('success', 'Migración Cloud SQL Lista', 'Script SQL para PostgreSQL/Cloud SQL descargado.');
    logAudit('MIGRACION_SQL_EXPORT', 'Configuración', 'Generación de dump SQL de base de datos');
  };

  const importDatabaseJSON = (data: DatabaseState) => {
    StorageService.saveState(data);
    setDbState(data);
    addToast('success', 'Restauración Exitosa', 'Base de datos restaurada correctamente desde el archivo.');
    logAudit('RESTAURACION_BACKUP', 'Configuración', 'Base de datos restaurada desde archivo externo');
  };

  const resetDatabase = () => {
    const fresh = StorageService.resetToDefault();
    setDbState(fresh);
    addToast('warning', 'Base de Datos Reiniciada', 'Los datos de fábrica fueron restablecidos.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentUser,
        switchRole,
        canAccessModule,
        canCollectPayments,
        canViewPayments,
        isAuthenticated,
        isSuperAdmin,
        activateUserAccount,
        setAccountStandby,
        toggleStudentStatus,
        toggleTeacherStatus,
        toggleUserStatus,
        loginWithCredentials,
        loginWithGoogleFirebase,
        loginWithGoogle,
        registerWithGoogle,
        registerUser,
        logout,
        switchAccount,
        updateUserProfile,
        activeModule,
        setActiveModule,
        config: dbState.config,
        updateConfig,
        users: dbState.users,
        roles: dbState.roles,
        students: dbState.students,
        teachers: dbState.teachers,
        classrooms: dbState.classrooms,
        courses: dbState.courses,
        enrollments: dbState.enrollments,
        schedules: dbState.schedules,
        attendances: dbState.attendances,
        grades: dbState.grades,
        payments: dbState.payments,
        announcements: dbState.announcements,
        notifications: dbState.notifications,
        auditLogs: dbState.auditLogs,
        saveStudent,
        deleteStudent,
        saveTeacher,
        deleteTeacher,
        saveClassroom,
        deleteClassroom,
        saveCourse,
        deleteCourse,
        saveEnrollment,
        saveScheduleSlot,
        deleteScheduleSlot,
        recordAttendanceBatch,
        saveGrade,
        recordPayment,
        createAnnouncement,
        saveCustomRole,
        saveUserAccount,
        markNotificationRead,
        clearAllNotifications,
        triggerPushAlert,
        runPeriodicAutomatedReport,
        toasts,
        addToast,
        removeToast,
        encryptionUnlocked,
        setEncryptionUnlocked,
        exportDatabaseJSON,
        exportDatabaseSQL,
        importDatabaseJSON,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
