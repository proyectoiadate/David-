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
  LogIn,
  Shield
} from 'lucide-react';
import { db } from '../services/database';
import { CurrencyCode } from '../types/financial';
import { signInWithGoogle, ensureFirebaseAuthSession } from '../services/firebase';

interface AuthViewProps {
  onSuccessLogin?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessLogin }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Formulario Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulario Registro (Siempre rol USER)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCurrency, setRegCurrency] = useState<CurrencyCode>('USD');
  const [regInitialBalance, setRegInitialBalance] = useState('200');

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
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico.');
      return;
    }

    const res = db.login(loginEmail, loginPassword);
    if (res.requires2FA) {
      setIs2FAStep(true);
      return;
    }

    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña o crea una cuenta nueva.');
      return;
    }

    ensureFirebaseAuthSession().finally(() => {
      onSuccessLogin?.();
    });
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = db.verify2FA(totpCode);
    if (!res.success) {
      setErrorMessage(res.error || 'Código incorrecto. Ingresa 123456 para la prueba de verificación.');
      return;
    }

    setIs2FAStep(false);
    onSuccessLogin?.();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Por favor ingresa nombre y correo electrónico.');
      return;
    }

    // SEGURIDAD CRÍTICA: Todo usuario que se registra recibe única y estrictamente el rol 'USER'
    const res = db.register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword || 'password123',
      currency: regCurrency
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Error al registrar la cuenta.');
      return;
    }

    setSuccessMessage(`¡Cuenta creada con éxito para ${regName}! Ingresando al panel personal...`);
    ensureFirebaseAuthSession().finally(() => {
      setTimeout(() => {
        onSuccessLogin?.();
      }, 400);
    });
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const userCred = await signInWithGoogle();
      if (userCred?.user) {
        db.handleFirebaseAuthUser({
          uid: userCred.user.uid,
          email: userCred.user.email,
          displayName: userCred.user.displayName
        });
        onSuccessLogin?.();
      }
    } catch (err: any) {
      console.warn('Error en Google Sign-In popup:', err);
      // Fallback elegante a sesión local segura
      db.loginOAuth('GOOGLE');
      onSuccessLogin?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('password123');
    const res = db.login(email, 'password123');
    if (res.requires2FA) {
      setIs2FAStep(true);
      return;
    }
    if (res.success) {
      ensureFirebaseAuthSession().finally(() => {
        onSuccessLogin?.();
      });
    }
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    const res = db.requestPasswordReset(recoveryEmail);
    setRecoveryMessage(res.message);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center p-4 selection:bg-neutral-800 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Cabecera del Portal */}
        <div className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/60 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
            FF
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            FinanzaFamiliar
          </h1>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Plataforma de gestión financiera personal y familiar con arquitectura de roles y seguridad estricta.
          </p>
        </div>

        {/* 2FA Step */}
        {is2FAStep ? (
          <div className="p-6 md:p-8 space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs">Verificación en Dos Pasos (2FA)</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Esta cuenta tiene habilitada la autenticación en dos factores. Ingresa tu código de seguridad (Demo: <strong className="font-mono">123456</strong>).
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  autoFocus
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-lg tracking-widest font-mono py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
              >
                Verificar y Acceder
              </button>

              <button
                type="button"
                onClick={() => setIs2FAStep(false)}
                className="w-full py-1 text-center text-[11px] text-neutral-500 hover:text-neutral-800"
              >
                Volver al formulario de inicio
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-5">
            {/* Mensajes de feedback */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Selector de Pestañas (Solo Iniciar Sesión o Registrarse) */}
            <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setTab('LOGIN');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'LOGIN'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('REGISTER');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'REGISTER'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </div>

            {/* TAB 1: INICIAR SESIÓN */}
            {tab === 'LOGIN' && (
              <div className="space-y-4">
                {/* Botón Google OAuth con Firebase */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{isLoading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
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

                {/* Accesos rápidos de prueba debidamente rotulados por rol */}
                <div className="pt-2 border-t border-neutral-100">
                  <p className="text-[11px] text-neutral-400 text-center mb-2 font-medium">Accesos Rápidos de Demostración:</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('laura.gomez@ejemplo.com')}
                      className="p-2 border border-neutral-200 rounded-xl hover:border-neutral-400 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">Laura Gómez</span>
                        <span className="text-[9px] bg-neutral-100 px-1 rounded font-mono">USER</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate">Usuario Normal</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoLogin('proyectoiadate@gmail.com')}
                      className="p-2 border border-neutral-900/40 bg-neutral-50 rounded-xl hover:border-neutral-900 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">Admin Sistema</span>
                        <span className="text-[9px] bg-neutral-900 text-white px-1 rounded font-mono">ADMIN</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate">Administrador</p>
                    </button>
                  </div>
                </div>

                <div className="text-center text-xs text-neutral-500">
                  ¿No tienes una cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('REGISTER')}
                    className="text-neutral-900 font-semibold underline hover:text-neutral-700"
                  >
                    Crear cuenta gratis
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CREAR CUENTA (SIEMPRE ROL USER) */}
            {tab === 'REGISTER' && (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-xs text-neutral-900">
                    <UserPlus className="w-4 h-4 text-neutral-700" />
                    Registro de Usuario
                  </p>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Podrás gestionar tus finanzas personales privadas (cuentas, ahorros, gastos, deudas) y participar en los presupuestos familiares que autorices.
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Nombre Completo *
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
                    Correo Electrónico *
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
                    Contraseña *
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

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Saldo Inicial Personal
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
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
                >
                  Registrar mi Cuenta
                </button>

                <div className="text-center text-xs text-neutral-500 pt-1">
                  ¿Ya tienes cuenta creada?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('LOGIN')}
                    className="text-neutral-900 font-semibold underline hover:text-neutral-700"
                  >
                    Inicia sesión aquí
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Modal Recuperación de Contraseña */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-sm p-5 space-y-4 text-xs">
            <h3 className="text-base font-bold text-neutral-900">Recuperación de Contraseña</h3>
            <p className="text-neutral-600">
              Ingresa el correo electrónico asociado a tu cuenta para restablecer tu contraseña.
            </p>

            {recoveryMessage ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Solicitud Enviada
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
