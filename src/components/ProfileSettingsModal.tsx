import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Lock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { db } from '../services/database';
import { CurrencyCode } from '../types/financial';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const currentUser = db.getCurrentUser();
  const [name, setName] = useState(currentUser.name);
  const [currency, setCurrency] = useState<CurrencyCode>(currentUser.preferredCurrency || 'USD');
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'El nombre no puede estar vacío.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setStatusMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
        return;
      }
    }

    // Actualizar usuario en la base de datos
    db.updateUserProfile(currentUser.id, {
      name: name.trim(),
      preferredCurrency: currency,
      twoFactorEnabled: twoFactor
    });

    setStatusMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Configuración de Perfil</h3>
              <p className="text-[11px] text-neutral-500">Administra tus datos personales y preferencias de seguridad</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de estado */}
        {statusMessage && (
          <div className={`m-5 p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-xl bg-neutral-100 text-neutral-500 cursor-not-allowed font-mono text-[11px]"
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">El correo electrónico está vinculado a tu cuenta principal.</p>
          </div>

          {/* ROL ASIGNADO (ESTRICTAMENTE NO EDITABLE POR USUARIOS) */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-neutral-600" />
                Rol del Sistema
              </span>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                currentUser.role === 'ADMIN'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-neutral-200 text-neutral-800'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              {currentUser.role === 'ADMIN'
                ? 'Tienes privilegios de administración global y supervisión del sistema.'
                : 'Tu cuenta opera con privilegios de usuario estándar para finanzas personales y familiares. Por seguridad, el rol no puede ser modificado desde la interfaz.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Moneda Preferida
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
              >
                <option value="USD">USD - Dólar Estadounidense ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="COP">COP - Peso Colombiano ($)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Autenticación en Dos Pasos (2FA)
              </label>
              <button
                type="button"
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-full py-2 px-3 rounded-xl border font-medium text-left transition-colors flex items-center justify-between ${
                  twoFactor
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                    : 'bg-neutral-50 border-neutral-300 text-neutral-600'
                }`}
              >
                <span>{twoFactor ? 'Activado (TOTP)' : 'Desactivado'}</span>
                <span className={`w-2 h-2 rounded-full ${twoFactor ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <p className="font-semibold text-neutral-800">Cambiar Contraseña (Opcional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirmar nueva"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-neutral-900 hover:bg-neutral-800 font-semibold transition-colors shadow-xs"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
