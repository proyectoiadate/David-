import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  KeyRound, 
  Mail, 
  Lock, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { db } from '../services/database';
import { UserRole, CurrencyCode } from '../types/financial';

interface AccessManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessManagementModal: React.FC<AccessManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tab, setTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [initialBalance, setInitialBalance] = useState('200');
  const [twoFactor, setTwoFactor] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const users = db.getRegisteredAccesses();
  const currentUser = db.getCurrentUser();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !email.trim()) {
      setMessage({ text: 'Por favor completa nombre y correo.', type: 'error' });
      return;
    }

    const res = db.createAccessUser({
      name: name.trim(),
      email: email.trim(),
      password: password || 'password123',
      role,
      preferredCurrency: currency,
      twoFactorEnabled: twoFactor,
      initialPersonalBalance: parseFloat(initialBalance) || 0
    });

    if (!res.success) {
      setMessage({ text: res.error || 'Error al crear el acceso.', type: 'error' });
      return;
    }

    setMessage({ text: `Acceso creado con éxito para ${name}. Se ha habilitado su billetera personal y rol familiar.`, type: 'success' });
    setName('');
    setEmail('');
    setPassword('');
    setTab('LIST');
  };

  const handleSwitchUser = (userId: string) => {
    db.setCurrentUserId(userId);
    setMessage({ text: 'Has cambiado al perfil seleccionado.', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-900 text-white rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Gestión de Accesos & Usuarios
              </h2>
              <p className="text-xs text-neutral-500">
                Crea y administra credenciales para finanzas personales y familiares
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-neutral-100 flex gap-4 text-xs font-medium">
          <button
            onClick={() => { setTab('LIST'); setMessage(null); }}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'LIST' 
                ? 'border-neutral-900 text-neutral-900 font-bold' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Accesos Registrados ({users.length})</span>
          </button>
          <button
            onClick={() => { setTab('CREATE'); setMessage(null); }}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'CREATE' 
                ? 'border-neutral-900 text-neutral-900 font-bold' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Crear Nuevo Acceso</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {message && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {tab === 'LIST' ? (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 leading-relaxed text-[11px]">
                Cada usuario tiene su propio <strong>espacio financiero personal (privado)</strong> y acceso coordinado al <strong>espacio familiar compartido</strong>. Puedes cambiar de perfil activo en cualquier momento:
              </div>

              <div className="space-y-2">
                {users.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent 
                          ? 'border-neutral-900 bg-neutral-50/80 shadow-xs ring-1 ring-neutral-900/10' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-xs">{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 bg-neutral-900 text-white font-semibold rounded-md">
                              Activo Ahora
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {u.role}
                          </span>
                          {u.twoFactorEnabled && (
                            <span className="text-[10px] px-1 bg-sky-100 text-sky-800 rounded font-medium">
                              2FA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono">{u.email}</p>
                        <p className="text-[10px] text-neutral-400">
                          Moneda: {u.preferredCurrency} · Creado: {u.createdAt.split('T')[0]}
                        </p>
                      </div>

                      {!isCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleSwitchUser(u.id)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                        >
                          <span>Cambiar a este usuario</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Sesión actual
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setTab('CREATE')}
                  className="w-full py-2.5 border border-dashed border-neutral-300 hover:border-neutral-900 text-neutral-800 font-medium rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear un Nuevo Acceso para un Miembro Familiar</span>
                </button>
              </div>
            </div>
          ) : (
            /* FORM CREAR ACCESO */
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-950 text-[11px]">
                Al crear este acceso, se generarán automáticamente sus credenciales de inicio de sesión, su billetera personal y sus permisos familiares.
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Gómez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Correo Electrónico (Usuario de Acceso) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="andres.gomez@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Contraseña Asignada *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Rol de Acceso
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="ADMIN">Administrador (Total)</option>
                    <option value="MEMBER">Miembro Familiar</option>
                    <option value="VIEWER">Lector / Hijo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Moneda Preferida
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
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
                <input
                  type="number"
                  step="10"
                  value={initialBalance}
                  onChange={e => setInitialBalance(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <input
                  type="checkbox"
                  id="modal2fa"
                  checked={twoFactor}
                  onChange={e => setTwoFactor(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900"
                />
                <label htmlFor="modal2fa" className="text-[11px] text-neutral-700 cursor-pointer">
                  Activar verificación en dos pasos (2FA) para este nuevo acceso
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTab('LIST')}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  Guardar & Crear Acceso
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
