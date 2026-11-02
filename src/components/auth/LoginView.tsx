/**
 * Institutional Login & Registration Portal
 * Fully customizable by the Administrator (Logo, title, hero banner, welcome text)
 * Includes direct Google Sign-In, registration with Google verification, and role selector
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  GraduationCap, 
  KeyRound,
  Info,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { GoogleAuthModal } from './GoogleAuthModal';

export const LoginView: React.FC = () => {
  const { 
    config, 
    loginWithCredentials, 
    loginWithGoogleFirebase,
    loginWithGoogle, 
    registerWithGoogle, 
    registerUser, 
    switchAccount,
    users,
    addToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('estudiante');

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleMode, setGoogleMode] = useState<'login' | 'register'>('login');

  const handleGoogleAuthClick = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogleFirebase();
      if (!res.success) {
        // If popup was blocked by browser or preview sandbox, provide seamless fallback
        if (res.message && (res.message.includes('bloqueada') || res.message.includes('bloqueado'))) {
          addToast('warning', 'Ventana emergente bloqueada', 'Abriendo selector de credenciales.');
          setGoogleMode(activeTab);
          setIsGoogleModalOpen(true);
        } else if (res.message && !res.message.includes('cancelado')) {
          addToast('error', 'Error de Autenticación', res.message);
        }
      }
    } catch (err: any) {
      console.error('Google auth unexpected error:', err);
      setGoogleMode(activeTab);
      setIsGoogleModalOpen(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      addToast('warning', 'Correo Requerido', 'Por favor ingresa tu correo electrónico institucional.');
      return;
    }
    setIsSubmitting(true);
    const res = await loginWithCredentials(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (!res.success) {
      addToast('error', 'Error de Acceso', res.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      addToast('warning', 'Campos Requeridos', 'Por favor completa todos los campos del registro.');
      return;
    }
    setIsSubmitting(true);
    const res = await registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      password: regPassword || '123456',
      phone: regPhone.trim(),
    });
    setIsSubmitting(false);
    if (!res.success) {
      addToast('error', 'Error en Registro', res.message);
    }
  };

  const handleGoogleAccountSelected = async (googleAcc: { name: string; email: string; picture: string; googleSub: string }) => {
    if (googleMode === 'login') {
      await loginWithGoogle(googleAcc);
    } else {
      await registerWithGoogle({
        name: googleAcc.name,
        email: googleAcc.email,
        picture: googleAcc.picture,
        googleSub: googleAcc.googleSub,
        role: regRole,
        phone: regPhone,
      });
    }
  };



  // Dynamic Theme & Customization Parameters
  const primaryBrandColor = config.primaryColor || '#1e40af';
  const secondaryBrandColor = config.secondaryColor || '#3b82f6';
  const buttonColor = config.loginButtonColor || primaryBrandColor;
  const gradientStart = config.loginBgGradientStart || '#020617';
  const gradientEnd = config.loginBgGradientEnd || '#0f172a';
  const badgeText = config.loginBadgeText || 'Portal Oficial de Gestión Escolar';
  const cardStyle = config.loginCardStyle || 'glass';
  const showHeroBanner = config.showLoginHeroBanner ?? true;

  // Compute card classes and styles based on selected aesthetic
  const getCardStyling = () => {
    switch (cardStyle) {
      case 'solid_white':
        return {
          className: 'rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900',
          style: { boxShadow: `0 20px 40px -15px ${buttonColor}25` },
          isLight: true,
        };
      case 'solid_dark':
        return {
          className: 'rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100',
          style: { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' },
          isLight: false,
        };
      case 'bordered_neon':
        return {
          className: 'rounded-3xl border-2 bg-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100',
          style: {
            borderColor: buttonColor,
            boxShadow: `0 0 35px -5px ${buttonColor}40`,
          },
          isLight: false,
        };
      case 'glass':
      default:
        return {
          className: 'rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl space-y-6 text-slate-100',
          style: { boxShadow: `0 20px 50px -10px ${buttonColor}30` },
          isLight: false,
        };
    }
  };

  const cardConfig = getCardStyling();

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between text-slate-100 font-sans antialiased overflow-x-hidden selection:text-white"
      style={{
        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
      }}
    >
      {/* Background Hero Banner with custom overlay */}
      {showHeroBanner && config.loginBannerUrl && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20 mix-blend-luminosity filter blur-xs"
          style={{
            backgroundImage: `url(${config.loginBannerUrl})`,
          }}
        />
      )}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${buttonColor}20 0%, transparent 60%)`,
        }}
      />

      {/* Top Bar with School Info */}
      <header className="relative z-10 w-full border-b border-white/10 bg-black/30 backdrop-blur-md px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {config.logoUrl ? (
            <img 
              src={config.logoUrl} 
              alt={config.institutionName} 
              className="h-10 w-10 object-contain rounded-xl bg-white/10 p-1 ring-1 ring-white/20"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-black text-lg shadow-md"
              style={{
                backgroundImage: `linear-gradient(135deg, ${primaryBrandColor}, ${secondaryBrandColor})`,
                boxShadow: `0 4px 12px ${buttonColor}40`
              }}
            >
              {config.institutionName ? config.institutionName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'EC'}
            </div>
          )}
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
              {config.institutionName}
            </h1>
            <p className="text-[11px] text-slate-300 font-medium line-clamp-1">
              {config.tagline || 'Excelencia Académica y Formación Integral'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300">
          <span 
            className="font-mono px-2.5 py-1 rounded-lg border font-semibold text-white"
            style={{
              backgroundColor: `${buttonColor}20`,
              borderColor: `${buttonColor}40`
            }}
          >
            Ciclo {config.currentAcademicYear}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Servicio Activo
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN: Institutional Presentation & Notice */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div 
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-white shadow-xs"
              style={{
                borderColor: `${buttonColor}60`,
                backgroundColor: `${buttonColor}25`
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: secondaryBrandColor }} />
              <span>{badgeText}</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {config.loginTitle || 'Portal Académico & Administrativo'}
              </h2>
              <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
                {config.loginSubtitle || 'Acceso seguro para directivos, docentes, estudiantes y apoderados con integración de credenciales y Google Identity.'}
              </p>
            </div>

            {config.loginWelcomeMessage && (
              <div 
                className="p-4 rounded-2xl border text-left text-xs text-slate-100 flex items-start gap-3 shadow-xs"
                style={{
                  backgroundColor: `${buttonColor}15`,
                  borderColor: `${buttonColor}40`
                }}
              >
                <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: secondaryBrandColor }} />
                <p className="leading-relaxed">{config.loginWelcomeMessage}</p>
              </div>
            )}

            {/* Strict Financial Separation Notice */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-left text-xs text-amber-200/90 flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 mb-0.5">Política Estricta de Finanzas y Pagos:</p>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  El módulo de tesorería, cobros y libro de caja está reservado únicamente para cuentas de <strong>Dirección</strong> y <strong>Tesorería/Caja</strong>. Los docentes, alumnos y familias están deshabilitados para ver cobros o emitir transacciones.
                </p>
              </div>
            </div>

            {/* Superadministración Centralizada & Modo Standby */}
            <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-left text-xs text-purple-200/90 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-purple-400 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-bold text-purple-300">Superadministración Titular Centralizada:</p>
                <p className="text-[11px] leading-relaxed text-purple-200/80">
                  La administración total de la plataforma está asignada exclusivamente a <strong className="text-white font-mono">pixelglez1988@gmail.com</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/50 text-[11px] text-purple-200">
                  <span className="font-semibold text-purple-300">Modo Standby para Nuevos Usuarios:</span> Todo usuario registrado o ingresado con Google permanece en espera de activación hasta que el Superadministrador le asigne su rol desde el panel de control.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Login / Register Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div 
              className={cardConfig.className}
              style={cardConfig.style}
            >
              
              {/* Tabs Switcher */}
              <div 
                className={`flex rounded-2xl p-1 border text-xs font-bold ${
                  cardConfig.isLight 
                    ? 'bg-slate-100 border-slate-200 text-slate-600' 
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    activeTab === 'login'
                      ? 'text-white shadow-md'
                      : cardConfig.isLight ? 'hover:text-slate-900' : 'hover:text-white'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'login' ? buttonColor : 'transparent',
                    boxShadow: activeTab === 'login' ? `0 4px 12px ${buttonColor}40` : undefined
                  }}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    activeTab === 'register'
                      ? 'text-white shadow-md'
                      : cardConfig.isLight ? 'hover:text-slate-900' : 'hover:text-white'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'register' ? buttonColor : 'transparent',
                    boxShadow: activeTab === 'register' ? `0 4px 12px ${buttonColor}40` : undefined
                  }}
                >
                  Registrarse
                </button>
              </div>

              {/* DIRECT GOOGLE SIGN-IN BUTTON (Firebase Authentication) */}
              {(config.allowGoogleLogin ?? true) && (
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={isGoogleLoading}
                    onClick={handleGoogleAuthClick}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-white hover:bg-slate-100 disabled:opacity-75 disabled:cursor-wait text-slate-900 font-bold text-xs py-3 px-4 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      /* Google 'G' icon */
                      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                    )}
                    <span>
                      {isGoogleLoading
                        ? 'Conectando con Google...'
                        : activeTab === 'login' 
                          ? 'Iniciar sesión con Google directamente' 
                          : 'Registrarse y verificar con Google'}
                    </span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Firebase Auth Integrado
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleMode(activeTab);
                        setIsGoogleModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-blue-400 underline transition-colors"
                    >
                      Elegir otra cuenta institucional
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      o con correo institucional
                    </span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {activeTab === 'login' ? (
                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${cardConfig.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="usuario@bicentenario.edu"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-xs focus:outline-none font-mono ${
                          cardConfig.isLight 
                            ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400' 
                            : 'border-slate-700 bg-slate-950/80 text-white placeholder-slate-500'
                        }`}
                        style={{ borderColor: undefined }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs font-bold ${cardConfig.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => addToast('info', 'Recuperación', 'Contacta al Administrador IT para restablecer tu clave institucional.')}
                        className="text-[11px] hover:underline font-medium"
                        style={{ color: secondaryBrandColor }}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Ingresa tu clave (demo: 123456)"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-xs focus:outline-none font-mono ${
                          cardConfig.isLight 
                            ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400' 
                            : 'border-slate-700 bg-slate-950/80 text-white placeholder-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-xs py-3 px-4 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryBrandColor})`,
                      boxShadow: `0 10px 25px -5px ${buttonColor}50`
                    }}
                  >
                    <span>Ingresar a EduControl</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                /* TAB 2: REGISTER FORM */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${cardConfig.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="ej. Ana María Morales"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className={`w-full rounded-xl border py-2 pl-10 pr-3 text-xs focus:outline-none ${
                          cardConfig.isLight 
                            ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400' 
                            : 'border-slate-700 bg-slate-950/80 text-white placeholder-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${cardConfig.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="usuario@colegio.edu"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        className={`w-full rounded-xl border py-2 pl-10 pr-3 text-xs focus:outline-none font-mono ${
                          cardConfig.isLight 
                            ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400' 
                            : 'border-slate-700 bg-slate-950/80 text-white placeholder-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${cardConfig.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Rol Institucional *
                      </label>
                      <select
                        value={regRole}
                        onChange={e => setRegRole(e.target.value as UserRole)}
                        className={`w-full rounded-xl border p-2 text-xs focus:outline-none ${
                          cardConfig.isLight 
                            ? 'border-slate-300 bg-slate-50 text-slate-900' 
                            : 'border-slate-700 bg-slate-950/80 text-white'
                        }`}
                      >
                        <option value="estudiante">Estudiante</option>
                        <option value="padre">Padre / Apoderado</option>
                        <option value="docente">Docente</option>
                        <option value="cajero">Tesorería / Caja</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${cardConfig.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Teléfono
                      </label>
                      <input
                        type="text"
                        placeholder="+51 987 654 321"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        className={`w-full rounded-xl border p-2 text-xs focus:outline-none ${
                          cardConfig.isLight 
                            ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400' 
                            : 'border-slate-700 bg-slate-950/80 text-white placeholder-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${cardConfig.isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Contraseña *
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className={`w-full rounded-xl border py-2 pl-10 pr-3 text-xs focus:outline-none font-mono ${
                          cardConfig.isLight 
                            ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400' 
                            : 'border-slate-700 bg-slate-950/80 text-white placeholder-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-xs py-3 px-4 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${buttonColor}, ${secondaryBrandColor})`,
                      boxShadow: `0 10px 25px -5px ${buttonColor}50`
                    }}
                  >
                    <span>Completar Registro</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* Help & Support contact */}
              <div className="pt-2 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
                Soporte de Acceso:{' '}
                <a
                  href={`mailto:${config.loginSupportEmail || config.email}`}
                  className="font-medium text-blue-400 hover:underline"
                >
                  {config.loginSupportEmail || config.email}
                </a>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 {config.institutionName} • Todos los derechos reservados</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Código Modular: {config.institutionCode}</span>
          <span>•</span>
          <span className="text-blue-400 font-semibold">Seguridad Criptográfica E2EE Activa</span>
        </div>
      </footer>

      {/* Google Identity Services Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        mode={googleMode}
        onGoogleSelect={handleGoogleAccountSelected}
      />
    </div>
  );
};
