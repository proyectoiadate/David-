import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Users, 
  User as UserIcon, 
  FileText, 
  Check, 
  AlertTriangle, 
  Info, 
  DollarSign, 
  LogOut, 
  Shield, 
  Layers,
  KeyRound,
  UserPlus
} from 'lucide-react';
import { db } from '../services/database';
import { CurrencyCode, Alert, FinancialScope } from '../types/financial';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onOpenArchitectureDocs: () => void;
  onOpenAccessManagement?: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTransaction,
  onOpenArchitectureDocs,
  onOpenAccessManagement,
  activeView
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentUser = db.getCurrentUser();
  const currentCurrency = db.getCurrentCurrency();
  const activeScope = db.getActiveScope();
  const allUsers = db.getState().users;
  const alerts = db.getAlerts();
  const unreadAlerts = alerts.filter(a => !a.isRead);

  const handleCurrencyChange = (curr: CurrencyCode) => {
    db.setCurrentCurrency(curr);
  };

  const handleUserSwitch = (userId: string) => {
    db.setCurrentUserId(userId);
    setShowUserDropdown(false);
  };

  const handleScopeChange = (scope: FinancialScope) => {
    db.setActiveScope(scope);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    db.logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 md:px-6 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
      {/* Zona 1: Brand + SELECTOR CLAVE TRIPLE (Personales vs Familiares vs Consolidado) */}
      <div className="flex items-center gap-3 md:gap-5 flex-wrap">
        <a href="#" className="text-base md:text-lg font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            FF
          </span>
          <span className="hidden sm:inline">FinanzaFamiliar</span>
        </a>

        {/* SELECTOR CLAVE TRIPLE DE ÁMBITO */}
        <div className="inline-flex rounded-xl border border-neutral-200 p-0.5 bg-neutral-100 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => handleScopeChange('PERSONAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeScope === 'PERSONAL'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
            title="Ver únicamente tus cuentas privadas, efectivo, deudas y metas personales"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Finanzas Personales</span>
          </button>

          <button
            type="button"
            onClick={() => handleScopeChange('FAMILY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeScope === 'FAMILY'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
            title="Ver el presupuesto familiar conjunto, cuentas compartidas y gastos del hogar"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Finanzas Familiares</span>
          </button>

          <button
            type="button"
            onClick={() => handleScopeChange('ALL')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeScope === 'ALL'
                ? 'bg-neutral-900 text-white shadow-xs font-bold'
                : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
            title="Vista 360° combinada: todos los activos, gastos y deudas"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Consolidado (Todo)</span>
          </button>
        </div>
      </div>

      {/* Zona 2 & 3: Controls & Primary Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Architecture Spec Button */}
        <button
          onClick={onOpenArchitectureDocs}
          className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          title="Ver especificación arquitectónica completa"
        >
          <FileText className="w-3.5 h-3.5 text-neutral-600" />
          <span>Arquitectura</span>
        </button>

        {/* Currency Selector */}
        <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 text-xs">
          {(['USD', 'EUR', 'COP'] as CurrencyCode[]).map(curr => (
            <button
              key={curr}
              onClick={() => handleCurrencyChange(curr)}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                currentCurrency === curr
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Botón Gestión de Accesos & Usuarios */}
        {onOpenAccessManagement && (
          <button
            onClick={onOpenAccessManagement}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            title="Gestionar y crear accesos de usuarios"
          >
            <KeyRound className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden sm:inline">Gestionar Accesos</span>
          </button>
        )}

        {/* Alerts Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Alertas y notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Alerts Dropdown Drawer */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                <div className="text-xs font-semibold text-neutral-900">
                  Alertas del Sistema ({unreadAlerts.length})
                </div>
                {unreadAlerts.length > 0 && (
                  <button
                    onClick={() => db.clearAllAlerts()}
                    className="text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    Marcar todas leídas
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-400">
                    No tienes alertas pendientes
                  </div>
                ) : (
                  alerts.slice(0, 5).map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => db.markAlertAsRead(alert.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        alert.isRead
                          ? 'bg-neutral-50/50 border-neutral-100 opacity-60'
                          : alert.severity === 'CRITICAL'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : alert.severity === 'WARNING'
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {alert.severity === 'CRITICAL' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                        ) : alert.severity === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-neutral-600 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold leading-tight">{alert.title}</p>
                          <p className="text-[11px] opacity-90 mt-0.5">{alert.message}</p>
                          <span className="text-[10px] opacity-60 mt-1 block">{alert.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Switcher & Logout Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-50">
              <div className="p-2 border-b border-neutral-100">
                <p className="font-bold text-xs text-neutral-900">{currentUser.name}</p>
                <p className="text-[11px] text-neutral-500">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-600">
                  <span className="font-medium bg-neutral-100 px-1.5 py-0.5 rounded">{currentUser.role}</span>
                  {currentUser.twoFactorEnabled && (
                    <span className="text-emerald-700 flex items-center gap-0.5">
                      <Shield className="w-3 h-3" /> 2FA Activo
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 px-2 py-1.5 font-medium mt-1">Cambiar de Usuario</div>
              {allUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleUserSwitch(u.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors ${
                    u.id === currentUser.id ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <div>
                      <p className="leading-tight">{u.name}</p>
                      <p className="text-[10px] text-neutral-400 font-normal">{u.role}</p>
                    </div>
                  </div>
                  {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                </button>
              ))}

              <div className="pt-2 mt-2 border-t border-neutral-100 space-y-1">
                {onOpenAccessManagement && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAccessManagement();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors font-medium text-left"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
                    <span>+ Crear Nuevos Accesos</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-medium text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cerrar Sesión / Portal Accesos</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: + Nuevo Movimiento */}
        <button
          onClick={onOpenNewTransaction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Nuevo Movimiento</span>
        </button>
      </div>
    </header>
  );
};
