/**
 * Sidebar Navigation for EduControl
 * Responsive, grouped modules with role-based access control
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Briefcase, 
  School, 
  BookOpen, 
  FileText, 
  CalendarClock, 
  CheckSquare, 
  Award, 
  CreditCard, 
  Megaphone, 
  BarChart3, 
  Settings, 
  X,
  ShieldAlert,
  Database
} from 'lucide-react';
import { useApp, AppModule } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: AppModule;
  label: string;
  icon: React.ElementType;
  badge?: string;
  moduleKey: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { config, activeModule, setActiveModule, canAccessModule, notifications, students, payments } = useApp();

  const overduePaymentsCount = payments.filter(p => p.status === 'vencido').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navGroups: NavGroup[] = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard, moduleKey: 'dashboard' },
      ],
    },
    {
      title: 'GESTIÓN ACADÉMICA',
      items: [
        { id: 'alumnos', label: 'Alumnos & Expedientes', icon: GraduationCap, badge: `${students.length}`, moduleKey: 'alumnos' },
        { id: 'docentes', label: 'Docentes', icon: Briefcase, moduleKey: 'docentes' },
        { id: 'aulas', label: 'Aulas & Espacios', icon: School, moduleKey: 'aulas' },
        { id: 'cursos', label: 'Cursos & Materias', icon: BookOpen, moduleKey: 'cursos' },
        { id: 'matriculas', label: 'Matrículas', icon: FileText, moduleKey: 'matriculas' },
        { id: 'horarios', label: 'Horarios de Clase', icon: CalendarClock, moduleKey: 'horarios' },
      ],
    },
    {
      title: 'SEGUIMIENTO ESCOLAR',
      items: [
        { id: 'asistencias', label: 'Control Asistencia', icon: CheckSquare, moduleKey: 'asistencias' },
        { id: 'calificaciones', label: 'Calificaciones & Boletas', icon: Award, moduleKey: 'calificaciones' },
      ],
    },
    {
      title: 'ADMINISTRACIÓN Y COMUNIDAD',
      items: [
        { 
          id: 'pagos', 
          label: 'Control de Pagos', 
          icon: CreditCard, 
          badge: overduePaymentsCount > 0 ? `${overduePaymentsCount} moras` : undefined, 
          moduleKey: 'pagos' 
        },
        { 
          id: 'comunicados', 
          label: 'Comunicados & Avisos', 
          icon: Megaphone, 
          badge: unreadNotifs > 0 ? `${unreadNotifs} nuevos` : undefined, 
          moduleKey: 'comunicados' 
        },
      ],
    },
    {
      title: 'SISTEMA Y SEGURIDAD',
      items: [
        { id: 'reportes', label: 'Reportes PDF / Excel', icon: BarChart3, moduleKey: 'reportes' },
        { id: 'usuarios', label: 'Usuarios y Roles E2EE', icon: Users, moduleKey: 'usuarios' },
        { id: 'configuracion', label: 'Configuración & BD', icon: Settings, moduleKey: 'configuracion' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2.5">
            {config.logoUrl ? (
              <img 
                src={config.logoUrl} 
                alt={config.institutionName} 
                className="h-8 w-8 object-contain rounded-lg bg-white/10 p-0.5 ring-1 ring-slate-200 dark:ring-slate-700" 
              />
            ) : (
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-xs shadow-xs"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${config.primaryColor || '#1e40af'}, ${config.secondaryColor || '#3b82f6'})`
                }}
              >
                {config.institutionName ? config.institutionName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'EC'}
              </div>
            )}
            <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{config.institutionName || 'EduControl SIS'}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navGroups.map((group, groupIdx) => {
            // Filter items user can access based on active role
            const accessibleItems = group.items.filter(item => canAccessModule(item.moduleKey));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </p>
                {accessibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        onClose();
                      }}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom System Health & DB Card */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Database className="h-3.5 w-3.5 text-emerald-600" /> Base de Datos
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Local / 100% Gratis
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Sin costo por usuario ni límites. Lista para hosting web estático o servidor Cloud.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
