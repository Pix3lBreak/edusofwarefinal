/**
 * Mobile Bottom Bar for quick navigation on mobile phones and small tablets
 * Tailored dynamically by role:
 * - Admin & Caja: Inicio, Alumnos, Asistencia, Pagos, Menú
 * - Docentes: Inicio, Asistencia, Calificaciones, Horarios, Menú (NO Pagos)
 * - Estudiantes & Padres: Inicio, Calificaciones, Horarios, Comunicados, Menú (NO Pagos)
 */

import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  CheckSquare, 
  CreditCard, 
  Menu,
  Award,
  CalendarClock,
  Megaphone
} from 'lucide-react';
import { useApp, AppModule } from '../../context/AppContext';

interface MobileNavProps {
  onOpenSidebar: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenSidebar }) => {
  const { activeModule, setActiveModule, canAccessModule, currentRole, canViewPayments } = useApp();

  let primaryItems: { id: AppModule; label: string; icon: React.ElementType }[] = [];

  if (canViewPayments) {
    // Admin & Cashier
    primaryItems = [
      { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
      { id: 'alumnos', label: 'Alumnos', icon: GraduationCap },
      { id: 'asistencias', label: 'Asistencia', icon: CheckSquare },
      { id: 'pagos', label: 'Cobros / Caja', icon: CreditCard },
    ];
  } else if (currentRole === 'docente') {
    // Teachers: Academic focus
    primaryItems = [
      { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
      { id: 'asistencias', label: 'Asistencia', icon: CheckSquare },
      { id: 'calificaciones', label: 'Notas', icon: Award },
      { id: 'horarios', label: 'Horarios', icon: CalendarClock },
    ];
  } else {
    // Students & Parents: Grades & Schedules
    primaryItems = [
      { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
      { id: 'calificaciones', label: 'Mis Notas', icon: Award },
      { id: 'horarios', label: 'Horario', icon: CalendarClock },
      { id: 'comunicados', label: 'Avisos', icon: Megaphone },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden shadow-lg shadow-slate-900/5">
      {primaryItems.map(item => {
        const Icon = item.icon;
        const isActive = activeModule === item.id;
        if (!canAccessModule(item.id)) return null;

        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 ${
              isActive 
                ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/60' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`h-5 w-5 mb-0.5 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Menu Drawer button */}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-all duration-150"
      >
        <Menu className="h-5 w-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Módulos</span>
      </button>
    </nav>
  );
};
