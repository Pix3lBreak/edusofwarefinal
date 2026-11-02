/**
 * Security, Custom Roles, E2EE Encryption & User RBAC Control Panel
 * Exclusively managed by the titular Superadmin: pixelglez1988@gmail.com
 * Approves standby user registrations and assigns roles (Director, Docente, Cajero, Estudiante, Padre).
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Plus, 
  Search, 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  ShieldAlert,
  History,
  FileKey,
  Clock,
  UserCheck,
  UserX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomRole, UserAccount, UserRole } from '../../types';
import { CryptoService } from '../../services/crypto';

export const UsersSecurityModule: React.FC = () => {
  const { 
    users, 
    roles, 
    auditLogs, 
    saveCustomRole, 
    saveUserAccount, 
    encryptionUnlocked, 
    setEncryptionUnlocked, 
    addToast,
    isSuperAdmin,
    activateUserAccount,
    setAccountStandby,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles' | 'cifrado' | 'auditoria'>('usuarios');
  const [searchUser, setSearchUser] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente' | 'activo' | 'inactivo'>('todos');
  
  // Pending user role selection buffer
  const [pendingRoleSelection, setPendingRoleSelection] = useState<Record<string, UserRole>>({});

  // Custom role editor state
  const [selectedRole, setSelectedRole] = useState<CustomRole>(roles[0]);

  // E2EE testing state
  const [masterKey, setMasterKey] = useState(CryptoService.getPassphrase());
  const [fingerprint, setFingerprint] = useState('');
  const [testPlaintext, setTestPlaintext] = useState('Registro Médico Confidencial: El alumno presenta cuadro de asma leve.');
  const [testCiphertext, setTestCiphertext] = useState('');
  const [testDecrypted, setTestDecrypted] = useState('');

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserAccount>>({});

  useEffect(() => {
    CryptoService.getFingerprint(masterKey).then(fp => setFingerprint(fp));
  }, [masterKey]);

  const handleTestEncrypt = async () => {
    const cipher = await CryptoService.encrypt(testPlaintext, masterKey);
    setTestCiphertext(cipher);
    const decrypted = await CryptoService.decrypt<string>(cipher, masterKey);
    setTestDecrypted(decrypted || 'Error al descifrar');
  };

  const handleSaveMasterKey = () => {
    CryptoService.setPassphrase(masterKey);
    addToast('success', 'Llave Maestra Actualizada', 'La clave de cifrado E2EE institucional fue actualizada.');
  };

  const handleSaveRole = () => {
    if (selectedRole.isSystem) {
      addToast('warning', 'Rol Protegido', 'Los roles predefinidos del sistema no pueden modificarse.');
      return;
    }
    saveCustomRole(selectedRole);
  };

  const handleOpenNewUser = () => {
    setEditingUser({
      id: `usr-${Date.now()}`,
      name: '',
      email: '',
      role: 'docente',
      status: 'activo',
      phone: '',
      password: '',
    });
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser.name || !editingUser.email) {
      addToast('warning', 'Campos Incompletos', 'Nombre y correo electrónico son obligatorios.');
      return;
    }

    // Safety: only pixelglez1988@gmail.com can be superadmin
    if (editingUser.role === 'superadmin' && editingUser.email?.toLowerCase() !== 'pixelglez1988@gmail.com') {
      addToast('error', 'Rol Restringido', 'Solo pixelglez1988@gmail.com puede ser Superadmin.');
      editingUser.role = 'director';
    }

    saveUserAccount(editingUser as UserAccount);
    setIsUserModalOpen(false);
    addToast('success', 'Usuario Guardado', `Datos de ${editingUser.name} actualizados.`);
  };

  const handleRoleSelectionChange = (userId: string, role: UserRole) => {
    setPendingRoleSelection(prev => ({ ...prev, [userId]: role }));
  };

  const handleApprovePending = async (user: UserAccount) => {
    const selected = pendingRoleSelection[user.id] || 'estudiante';
    await activateUserAccount(user.id, selected);
  };

  const modulesList = [
    { key: 'alumnos', label: 'Alumnos y Expedientes' },
    { key: 'docentes', label: 'Docentes y Personal' },
    { key: 'aulas', label: 'Aulas y Espacios' },
    { key: 'cursos', label: 'Materia y Asignaturas' },
    { key: 'matriculas', label: 'Matrículas e Inscripciones' },
    { key: 'horarios', label: 'Horarios de Clases' },
    { key: 'asistencias', label: 'Control de Asistencias' },
    { key: 'calificaciones', label: 'Registro de Notas' },
    { key: 'pagos', label: 'Cobros y Caja (Restringido)' },
    { key: 'comunicados', label: 'Muro de Comunicados' },
    { key: 'reportes', label: 'Informes y Estadísticas' },
    { key: 'configuracion', label: 'Configuración Institucional' },
  ];

  const pendingUsers = users.filter(u => u.status === 'pendiente');
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchUser.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const roleDisplayNames: Record<UserRole, { name: string; bg: string; text: string }> = {
    superadmin: { name: 'Superadmin Titular', bg: 'bg-purple-100 dark:bg-purple-950/80', text: 'text-purple-700 dark:text-purple-300' },
    director: { name: 'Directivo / Rector', bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-700 dark:text-blue-300' },
    cajero: { name: 'Tesorería / Caja', bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300' },
    docente: { name: 'Profesor / Docente', bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300' },
    estudiante: { name: 'Estudiante / Alumno', bg: 'bg-indigo-100 dark:bg-indigo-950/80', text: 'text-indigo-700 dark:text-indigo-300' },
    padre: { name: 'Padre / Apoderado', bg: 'bg-cyan-100 dark:bg-cyan-950/80', text: 'text-cyan-700 dark:text-cyan-300' },
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span>Control de Usuarios, Roles & Activación</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Superadministrador único: <strong className="text-purple-600 dark:text-purple-400 font-mono">pixelglez1988@gmail.com</strong> • Asignación de roles y aprobación de cuentas en standby
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'usuarios'
                ? 'bg-white text-purple-700 shadow-xs dark:bg-slate-900 dark:text-purple-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Usuarios ({users.length})</span>
            {pendingUsers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'roles'
                ? 'bg-white text-purple-700 shadow-xs dark:bg-slate-900 dark:text-purple-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Matriz de Permisos</span>
          </button>
          <button
            onClick={() => setActiveTab('cifrado')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cifrado'
                ? 'bg-white text-purple-700 shadow-xs dark:bg-slate-900 dark:text-purple-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Cifrado E2EE</span>
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'auditoria'
                ? 'bg-white text-purple-700 shadow-xs dark:bg-slate-900 dark:text-purple-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Auditoría</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GESTIÓN DE USUARIOS & ACTIVACIONES */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          {/* NOTICE: CENTRALIZED SUPERADMIN AUTHORITY */}
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-purple-900 dark:text-purple-300 text-sm">
                Política Institucional: Superadministración Única
              </p>
              <p className="leading-relaxed text-purple-800 dark:text-purple-200/90 text-xs">
                Únicamente <strong className="font-mono text-purple-900 dark:text-white">pixelglez1988@gmail.com</strong> tiene privilegios de Superadministrador inmutable. Los demás usuarios registrados ingresan en modo <strong>standby</strong> hasta que les asignes su rol y actives su cuenta desde este panel.
              </p>
            </div>
          </div>

          {/* STANDBY QUEUE: PENDING ACCOUNTS WAITING FOR ACTIVATION */}
          {pendingUsers.length > 0 && (
            <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-ping" />
                  <h3 className="font-extrabold text-amber-900 dark:text-amber-300 text-sm sm:text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span>Cuentas Registradas en Espera de Activación (Standby) ({pendingUsers.length})</span>
                  </h3>
                </div>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                  Requiere tu Aprobación
                </span>
              </div>

              <div className="space-y-3">
                {pendingUsers.map(user => {
                  const currentRoleChoice = pendingRoleSelection[user.id] || 'estudiante';

                  return (
                    <div 
                      key={user.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-200 bg-white dark:border-amber-900/50 dark:bg-slate-900 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={user.avatarUrl || user.googlePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} 
                          alt={user.name}
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-amber-500/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {user.name}
                            </span>
                            {user.isGoogleLinked && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Google
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Role selection & approval actions */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Asignar Rol:
                          </label>
                          <select
                            value={currentRoleChoice}
                            onChange={e => handleRoleSelectionChange(user.id, e.target.value as UserRole)}
                            className="text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 p-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="director">Directivo / Rector</option>
                            <option value="docente">Profesor / Docente</option>
                            <option value="cajero">Tesorería / Caja</option>
                            <option value="estudiante">Estudiante / Alumno</option>
                            <option value="padre">Padre / Apoderado</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApprovePending(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          title="Aprobar y conceder acceso al sistema con el rol seleccionado"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Aprobar y Activar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAccountStandby(user.id, 'inactivo')}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
                          title="Rechazar solicitud y marcar como inactiva"
                        >
                          <UserX className="h-3.5 w-3.5 text-red-500" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN USERS DIRECTORY CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o rol..."
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="text-xs font-semibold rounded-xl border border-slate-200 bg-white p-2 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Solo Activos</option>
                <option value="pendiente">Solo Standby ({pendingUsers.length})</option>
                <option value="inactivo">Solo Inactivos</option>
              </select>
            </div>

            <button
              onClick={handleOpenNewUser}
              className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Registrar Usuario Manual
            </button>
          </div>

          {/* USERS TABLE WITH IN-LINE ROLE ASSIGNMENT & STATUS TOGGLE */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol Asignado</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4">Cambiar Rol / Activar</th>
                    <th className="py-3 px-4 text-right">Último Acceso</th>
                    <th className="py-3 px-4 text-center">Editar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map(u => {
                    const isSuperAdminAccount = u.email.toLowerCase() === 'pixelglez1988@gmail.com';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatarUrl || u.googlePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                              alt={u.name}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isSuperAdminAccount && (
                                  <span className="text-[10px] bg-purple-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                                    TITULAR
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-block font-bold px-2.5 py-1 rounded-md uppercase text-[10px] border ${
                            isSuperAdminAccount 
                              ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800 font-black'
                              : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                          }`}>
                            {roleDisplayNames[u.role]?.name || u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {u.status === 'activo' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Activo
                            </span>
                          )}
                          {u.status === 'pendiente' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                              Standby
                            </span>
                          )}
                          {u.status === 'inactivo' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              Inactivo
                            </span>
                          )}
                        </td>

                        {/* Direct Role Assignment & Status Management */}
                        <td className="py-3 px-4">
                          {isSuperAdminAccount ? (
                            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5" /> Superadmin Titular (Inmutable)
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {/* Change role selector */}
                              <select
                                value={u.role}
                                onChange={e => activateUserAccount(u.id, e.target.value as UserRole)}
                                className="text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 p-1 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                                title="Cambiar rol institucional asignado"
                              >
                                <option value="director">Directivo / Rector</option>
                                <option value="docente">Docente</option>
                                <option value="cajero">Tesorería / Caja</option>
                                <option value="estudiante">Estudiante</option>
                                <option value="padre">Padre de Familia</option>
                              </select>

                              {/* Toggle Active / Standby button */}
                              {u.status === 'activo' ? (
                                <button
                                  type="button"
                                  onClick={() => setAccountStandby(u.id, 'pendiente')}
                                  className="text-[10px] font-bold px-2 py-1 rounded-md border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
                                  title="Poner en modo standby para bloquear acceso"
                                >
                                  Pausar
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => activateUserAccount(u.id, u.role)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                  title="Activar cuenta inmediatamente"
                                >
                                  Activar
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleEditUser(u)}
                            className="p-1 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                            title="Editar datos de usuario"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
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
      )}

      {/* TAB 2: ROLES & MATRIZ DE PERMISOS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Perfiles Institucionales
            </h3>
            <div className="space-y-2">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selectedRole.id === r.id
                      ? 'border-purple-600 bg-purple-100/90 text-purple-950 dark:bg-purple-950 dark:text-purple-100 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{r.name}</span>
                    {r.isSystem && (
                      <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded-md dark:bg-slate-700 dark:text-slate-200 shadow-xs">
                        Sistema
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-700 dark:text-slate-300 line-clamp-1 font-medium leading-relaxed">{r.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Matriz de Permisos: {selectedRole.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedRole.description}</p>
              </div>

              {!selectedRole.isSystem && (
                <button
                  onClick={handleSaveRole}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                >
                  Guardar Permisos
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5">Módulo</th>
                    <th className="py-2.5 text-center">Lectura</th>
                    <th className="py-2.5 text-center">Crear</th>
                    <th className="py-2.5 text-center">Modificar</th>
                    <th className="py-2.5 text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {modulesList.map(mod => {
                    const isPaymentModule = mod.key === 'pagos';
                    const isRestricted = selectedRole.id === 'role-docente' || selectedRole.id === 'role-estudiante' || selectedRole.id === 'role-padre';
                    const p = (isPaymentModule && isRestricted)
                      ? { read: false, create: false, update: false, delete: false }
                      : (selectedRole.permissions[mod.key] || { read: false, create: false, update: false, delete: false });

                    return (
                      <tr key={mod.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                          {mod.label}
                        </td>
                        <td className="py-2.5 text-center">
                          {p.read ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="py-2.5 text-center">
                          {p.create ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="py-2.5 text-center">
                          {p.update ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="py-2.5 text-center">
                          {p.delete ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CIFRADO E2EE */}
      {activeTab === 'cifrado' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-purple-600" /> Clave Maestra de Seguridad Institucional
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={masterKey}
                onChange={e => setMasterKey(e.target.value)}
                placeholder="Ingresa clave maestra..."
                className="flex-1 rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
              <button
                onClick={handleSaveMasterKey}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Actualizar Clave
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileKey className="h-4 w-4 text-blue-600" /> Probador de Cifrado en Tiempo Real
              </h3>
              <button
                onClick={handleTestEncrypt}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Ejecutar Cifrado y Descifrado
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-400 block mb-1">1. Texto en Claro (Memoria)</span>
                <textarea
                  rows={3}
                  value={testPlaintext}
                  onChange={e => setTestPlaintext(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-red-500 block mb-1">2. Criptograma AES-GCM (Almacenado)</span>
                <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all max-h-20 overflow-y-auto">
                  {testCiphertext || 'Haz clic en "Ejecutar Cifrado" para generar el vector y criptograma.'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-500 block mb-1">3. Verificación de Integridad</span>
                <p className="text-slate-800 dark:text-slate-200">{testDecrypted || 'Pendiente de prueba'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORÍA */}
      {activeTab === 'auditoria' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registro Inmutable de Eventos y Auditoría
            </h3>
            <span className="text-xs text-slate-400 font-medium">{auditLogs.length} eventos registrados</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Detalles</th>
                  <th className="py-3 px-4 text-right">IP Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">
                      {log.userName} ({log.userRole})
                    </td>
                    <td className="py-2.5 px-4 text-blue-600 font-bold">{log.action}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400">{log.module}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700 dark:text-slate-300">{log.details}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR / EDITAR USUARIO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>{editingUser.id?.startsWith('usr-') ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Ej. Prof. Juan Pérez"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="usuario@colegio.edu"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rol Institucional
                  </label>
                  <select
                    value={editingUser.role || 'docente'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="director">Directivo / Rector</option>
                    <option value="docente">Docente</option>
                    <option value="cajero">Tesorería / Caja</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="padre">Padre de Familia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado de Cuenta
                  </label>
                  <select
                    value={editingUser.status || 'activo'}
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="activo">Activo</option>
                    <option value="pendiente">Standby (En Espera)</option>
                    <option value="inactivo">Inactivo / Bloqueado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                  placeholder="+51 987 654 321"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-md transition-colors"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
