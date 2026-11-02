/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

// Modules
import { DashboardModule } from './components/modules/DashboardModule';
import { StudentsModule } from './components/modules/StudentsModule';
import { TeachersModule } from './components/modules/TeachersModule';
import { ClassroomsModule } from './components/modules/ClassroomsModule';
import { CoursesModule } from './components/modules/CoursesModule';
import { EnrollmentsModule } from './components/modules/EnrollmentsModule';
import { SchedulesModule } from './components/modules/SchedulesModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { GradesModule } from './components/modules/GradesModule';
import { PaymentsModule } from './components/modules/PaymentsModule';
import { AnnouncementsModule } from './components/modules/AnnouncementsModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { UsersSecurityModule } from './components/modules/UsersSecurityModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { LoginView } from './components/auth/LoginView';
import { StandbyActivationView } from './components/auth/StandbyActivationView';

const MainLayout: React.FC = () => {
  const { config, activeModule, isAuthenticated, currentUser } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Synchronize dynamic institutional brand colors
  React.useEffect(() => {
    const root = document.documentElement;
    if (config.primaryColor) {
      root.style.setProperty('--brand-primary', config.primaryColor);
    }
    if (config.secondaryColor) {
      root.style.setProperty('--brand-secondary', config.secondaryColor);
    }
    if (config.institutionName) {
      document.title = `${config.institutionName} - EduControl`;
    }
  }, [config.primaryColor, config.secondaryColor, config.institutionName]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-slate-100 font-sans antialiased">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  // If user account is in standby / awaiting activation by Superadmin
  if (currentUser.status === 'pendiente' || currentUser.status === 'inactivo') {
    return (
      <>
        <StandbyActivationView />
        <ToastContainer />
      </>
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'alumnos':
        return <StudentsModule />;
      case 'docentes':
        return <TeachersModule />;
      case 'aulas':
        return <ClassroomsModule />;
      case 'cursos':
        return <CoursesModule />;
      case 'matriculas':
        return <EnrollmentsModule />;
      case 'horarios':
        return <SchedulesModule />;
      case 'asistencias':
        return <AttendanceModule />;
      case 'calificaciones':
        return <GradesModule />;
      case 'pagos':
        return <PaymentsModule />;
      case 'comunicados':
        return <AnnouncementsModule />;
      case 'reportes':
        return <ReportsModule />;
      case 'usuarios':
        return <UsersSecurityModule />;
      case 'configuracion':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Page Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Content Container (with bottom padding on mobile for MobileNav) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {renderActiveModule()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenSidebar={() => setIsSidebarOpen(true)} />

      {/* Push Notifications Drawer */}
      <NotificationDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

      {/* Reactive Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
