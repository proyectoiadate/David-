import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  DollarSign, 
  Sparkles,
  UserPlus,
  LogIn
} from 'lucide-react';
import { db } from '../services/database';
import { CurrencyCode, UserRole } from '../types/financial';

interface AuthViewProps {
  onSuccessLogin?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessLogin }) => {
  const [tab, setTab] = useState<'LOGIN' | 'CREATE_ACCESS' | 'DIRECTORY'>('LOGIN');

  // Formulario Login
  const [loginEmail, setLoginEmail] = useState('carlos.perez@ejemplo.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Formulario Crear Accesos
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCurrency, setRegCurrency] = useState<CurrencyCode>('USD');
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');
  const [regInitialBalance, setRegInitialBalance] = useState('250');
  const [regEnable2FA, setRegEnable2FA] = useState(false);

  // 2FA Flow
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  // Password Recovery Flow
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // Status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const registeredUsers = db.getRegisteredAccesses();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = db.login(loginEmail, loginPassword);
    if (res.requires2FA) {
      setIs2FAStep(true);
      return;
    }

    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña o crea un acceso nuevo.');
      return;
    }

    onSuccessLogin?.();
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = db.verify2FA(totpCode);
    if (!res.success) {
      setErrorMessage(res.error || 'Código incorrecto. Ingresa 123456 para la prueba demo.');
      return;
    }

    setIs2FAStep(false);
    onSuccessLogin?.();
  };

  const handleCreateAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Por favor ingresa nombre y correo electrónico.');
      return;
    }

    const res = db.createAccessUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword || 'password123',
      role: regRole,
      preferredCurrency: regCurrency,
      twoFactorEnabled: regEnable2FA,
      initialPersonalBalance: parseFloat(regInitialBalance) || 0
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Error al crear el acceso.');
      return;
    }

    // Auto-login con el nuevo usuario creado
    if (regEnable2FA) {
      setSuccessMessage(`Acceso creado para ${regName}. Autenticando con 2FA...`);
      setLoginEmail(regEmail);
      db.login(regEmail);
      setIs2FAStep(true);
    } else {
      setSuccessMessage(`¡Acceso creado con éxito para ${regName}! Entrando a la plataforma...`);
      db.setCurrentUserId(res.user!.id);
      db.login(regEmail);
      setTimeout(() => {
        onSuccessLogin?.();
      }, 500);
    }
  };

  const handleOAuth = (provider: 'GOOGLE' | 'MICROSOFT') => {
    db.loginOAuth(provider);
    onSuccessLogin?.();
  };

  const handleQuickLogin = (email: string) => {
    const user = db.getState().users.find(u => u.email === email);
    if (user?.twoFactorEnabled) {
      setLoginEmail(email);
      db.login(email);
      setIs2FAStep(true);
    } else {
      db.login(email);
      onSuccessLogin?.();
    }
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    const res = db.requestPasswordReset(recoveryEmail);
    setRecoveryMessage(res.message);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Brand Lockup */}
        <div className="p-6 pb-4 border-b border-neutral-100 text-center bg-neutral-50/70">
          <div className="inline-flex w-12 h-12 rounded-xl bg-neutral-900 text-white items-center justify-center font-bold text-lg mb-2 shadow-xs">
            FF
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            FinanzaFamiliar
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Portal de Accesos · Gestión de Finanzas Personales y Familiares
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-600">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-800 rounded-md border border-sky-200 font-medium">
              👤 Finanzas Personales
            </span>
            <span className="text-neutral-300">·</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 font-medium">
              👨‍👩‍👧‍👦 Finanzas Familiares
            </span>
          </div>
        </div>

        {/* 2FA STEP */}
        {is2FAStep ? (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold">Autenticación de Dos Factores (2FA)</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Esta cuenta tiene verificación en dos pasos activada. Ingresa tu código de 6 dígitos.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Código de Seguridad (6 dígitos)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 text-center text-lg font-mono tracking-widest border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>¿Modo prueba?</span>
                <button
                  type="button"
                  onClick={() => setTotpCode('123456')}
                  className="font-medium text-neutral-900 underline hover:text-neutral-700"
                >
                  Autocompletar código demo (123456)
                </button>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIs2FAStep(false)}
                  className="w-1/3 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg font-medium transition-colors shadow-xs"
                >
                  Verificar & Acceder
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* PESTAÑAS: LOGIN / CREAR ACCESOS / DIRECTORIO */
          <div className="p-6 space-y-4">
            {/* 3-Way Tabs */}
            <div className="grid grid-cols-3 p-1 bg-neutral-100 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => { setTab('LOGIN'); setErrorMessage(''); }}
                className={`py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'LOGIN' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('CREATE_ACCESS'); setErrorMessage(''); }}
                className={`py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'CREATE_ACCESS' ? 'bg-white text-neutral-900 shadow-xs font-bold text-sky-900' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Accesos</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('DIRECTORY'); setErrorMessage(''); }}
                className={`py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'DIRECTORY' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Accesos ({registeredUsers.length})</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {tab === 'LOGIN' && (
              <div className="space-y-4">
                {/* SSO Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOAuth('GOOGLE')}
                    className="w-full flex items-center justify-center gap-2.5 py-2 px-3 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth('MICROSOFT')}
                    className="w-full flex items-center justify-center gap-2.5 py-2 px-3 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span>Continuar con Microsoft</span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-neutral-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-neutral-400">o ingresa con tu correo</span>
                  <div className="flex-grow border-t border-neutral-200"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="tu.correo@ejemplo.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-neutral-700">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryEmail(loginEmail);
                          setShowRecoveryModal(true);
                        }}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
                  >
                    Iniciar Sesión
                  </button>
                </form>

                <div className="pt-2 text-center text-xs text-neutral-500">
                  ¿No tienes un acceso creado?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('CREATE_ACCESS')}
                    className="text-neutral-900 font-semibold underline hover:text-neutral-700"
                  >
                    Crear un acceso nuevo aquí
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CREAR ACCESOS */}
            {tab === 'CREATE_ACCESS' && (
              <form onSubmit={handleCreateAccess} className="space-y-3 text-xs">
                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-sky-950 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-sky-600" />
                    Creación de Accesos a la Plataforma
                  </p>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    Crea credenciales para ti o para los miembros de tu familia. Cada acceso dispondrá de su <strong>espacio personal privado</strong> y podrá participar en el <strong>espacio familiar compartido</strong> según su rol.
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Nombre Completo del Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mateo Gómez"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Correo Electrónico (Será su Usuario de Acceso) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="mateo.gomez@ejemplo.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Contraseña de Acceso *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Rol de Permisos
                    </label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value as UserRole)}
                      className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg"
                    >
                      <option value="ADMIN">Administrador (Total)</option>
                      <option value="MEMBER">Miembro Familiar</option>
                      <option value="VIEWER">Lector (Hijo/a)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Moneda Principal
                    </label>
                    <select
                      value={regCurrency}
                      onChange={e => setRegCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="COP">COP ($)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Saldo Inicial en su Billetera Personal
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-400 font-mono">$</span>
                    <input
                      type="number"
                      step="10"
                      value={regInitialBalance}
                      onChange={e => setRegInitialBalance(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <input
                    type="checkbox"
                    id="enable2fa"
                    checked={regEnable2FA}
                    onChange={e => setRegEnable2FA(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900"
                  />
                  <label htmlFor="enable2fa" className="text-[11px] text-neutral-700 cursor-pointer">
                    Exigir verificación en dos pasos (2FA) para este acceso
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
                >
                  Crear Acceso & Ingresar a la Plataforma
                </button>
              </form>
            )}

            {/* TAB 3: DIRECTORIO DE ACCESOS REGISTRADOS */}
            {tab === 'DIRECTORY' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <p className="font-semibold text-neutral-900">Directorio de Accesos Activos</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Selecciona cualquier usuario para ingresar inmediatamente a su perfil y explorar tanto sus finanzas personales como las del hogar:
                  </p>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {registeredUsers.map(user => (
                    <div
                      key={user.id}
                      className="p-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between hover:border-neutral-400 transition-all shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-900 text-xs">{user.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            user.role === 'ADMIN' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {user.role}
                          </span>
                          {user.twoFactorEnabled && (
                            <span className="text-[10px] px-1 bg-amber-100 text-amber-800 rounded">2FA</span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono">{user.email}</p>
                        <p className="text-[10px] text-neutral-400">
                          {user.role === 'ADMIN' ? 'Finanzas Personales + Gestión Familiar' : 'Finanzas Personales + Participación Familiar'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickLogin(user.email)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                      >
                        <span>Entrar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setTab('CREATE_ACCESS')}
                  className="w-full py-2 border border-dashed border-neutral-300 hover:border-neutral-400 rounded-xl text-neutral-700 font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Crear Nuevo Acceso Familiar</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL RECUPERACIÓN DE CONTRASEÑA */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-sm p-5 space-y-4 text-xs">
            <h3 className="text-base font-bold text-neutral-900">Recuperación de Acceso</h3>
            <p className="text-neutral-600">
              Ingresa el correo electrónico asociado a tu cuenta para restablecer tu contraseña.
            </p>

            {recoveryMessage ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Solicitud Procesada
                </p>
                <p className="mt-1 text-[11px] text-emerald-800">{recoveryMessage}</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordRecovery} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="tu.correo@ejemplo.com"
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Enviar Instrucciones
                </button>
              </form>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setShowRecoveryModal(false);
                  setRecoveryMessage('');
                }}
                className="px-3 py-1 text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
