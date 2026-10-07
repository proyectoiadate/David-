import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Landmark, 
  CreditCard as CardIcon, 
  PiggyBank, 
  Target, 
  PieChart, 
  Sparkles, 
  ShieldCheck, 
  FileSpreadsheet, 
  AlertCircle,
  User as UserIcon,
  Users,
  Layers,
  KeyRound
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialScope } from '../types/financial';

export type ViewKey = 
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'debts'
  | 'budgets'
  | 'goals'
  | 'analytics'
  | 'reports'
  | 'audit'
  | 'export_api';

interface SidebarProps {
  activeView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  onOpenAccessManagement?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onSelectView,
  onOpenAccessManagement 
}) => {
  const activeScope = db.getActiveScope();
  const currentUser = db.getCurrentUser();
  const alerts = db.getAlerts().filter(a => !a.isRead);
  const deletedCount = db.getState().transactions.filter(t => t.isDeleted).length +
    db.getState().accounts.filter(a => a.isDeleted).length +
    db.getState().debts.filter(d => d.isDeleted).length;

  const handleScopeChange = (scope: FinancialScope) => {
    db.setActiveScope(scope);
  };

  const navItems: { key: ViewKey; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { key: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { key: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
    { key: 'accounts', label: 'Cuentas & Tarjetas', icon: Landmark },
    { key: 'debts', label: 'Deudas & Préstamos', icon: CardIcon },
    { key: 'budgets', label: 'Presupuestos', icon: PiggyBank },
    { key: 'goals', label: 'Metas Financieras', icon: Target },
    { key: 'analytics', label: 'Motor Analítico IA', icon: Sparkles },
    { key: 'reports', label: 'Reportes & Gráficos', icon: PieChart },
    { key: 'audit', label: 'Auditoría & Papelera', icon: ShieldCheck, badge: deletedCount > 0 ? deletedCount : undefined },
    { key: 'export_api', label: 'Exportación & API', icon: FileSpreadsheet }
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col justify-between shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* WIDGET CRÍTICO: ESPACIO FINANCIERO ACTIVO */}
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-1">
            <span>Espacio Financiero</span>
            <span className="text-[10px] text-neutral-400 capitalize font-mono">
              {currentUser.name.split(' ')[0]}
            </span>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleScopeChange('PERSONAL')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeScope === 'PERSONAL'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>Mis Finanzas Personales</span>
              </div>
              {activeScope === 'PERSONAL' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleScopeChange('FAMILY')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeScope === 'FAMILY'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Finanzas Familiares</span>
              </div>
              {activeScope === 'FAMILY' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleScopeChange('ALL')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeScope === 'ALL'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Consolidado 360°</span>
              </div>
              {activeScope === 'ALL' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <div>
          <div className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase px-2 mb-2">
            Módulos de la Plataforma
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectView(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ACCESO RÁPIDO A GESTIÓN DE ACCESOS */}
        {onOpenAccessManagement && (
          <div className="pt-1">
            <button
              onClick={onOpenAccessManagement}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors text-left"
            >
              <KeyRound className="w-4 h-4 text-neutral-500 shrink-0" />
              <div>
                <p className="font-semibold text-neutral-900">Gestión de Accesos</p>
                <p className="text-[10px] text-neutral-500">Crear usuarios y roles</p>
              </div>
            </button>
          </div>
        )}

        {/* Resumen Rápido de Alertas */}
        {alerts.length > 0 && (
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{alerts.length} Notificaciones</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Existen vencimientos y umbrales de presupuesto pendientes de atención.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="font-medium text-neutral-600">FinanzaFamiliar</span>
          <span className="font-mono text-[11px]">v1.1</span>
        </div>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          {activeScope === 'PERSONAL' ? '👤 Ámbito: Mis Finanzas' : activeScope === 'FAMILY' ? '👨‍👩‍👧‍👦 Ámbito: Familia' : '🌐 Ámbito: Consolidado'}
        </p>
      </div>
    </aside>
  );
};
