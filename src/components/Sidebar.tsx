import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard as CardIcon, 
  PiggyBank, 
  Target, 
  PieChart, 
  ShieldCheck, 
  FileSpreadsheet, 
  User as UserIcon,
  Users,
  Settings,
  LogOut,
  KeyRound,
  FileText,
  Percent
} from 'lucide-react';
import { db } from '../services/database';
import { signOutFromFirebase } from '../services/firebase';

export type ViewKey = 
  | 'dashboard_personal'
  | 'dashboard_family'
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'debts'
  | 'cards'
  | 'accounts'
  | 'reports'
  | 'profile'
  | 'audit'
  | 'export_api';

interface SidebarProps {
  activeView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  onOpenAccessManagement?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenArchitectureDocs?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onSelectView,
  onOpenAccessManagement,
  onOpenProfileSettings,
  onOpenArchitectureDocs
}) => {
  const currentUser = db.getCurrentUser();
  const isAdmin = db.isCurrentUserAdmin();
  const deletedCount = db.getState().transactions.filter(t => t.isDeleted).length +
    db.getState().accounts.filter(a => a.isDeleted).length +
    db.getState().debts.filter(d => d.isDeleted).length;

  const handleLogout = async () => {
    await signOutFromFirebase();
    db.logout();
    window.location.reload();
  };

  const handleSelectNav = (key: ViewKey) => {
    if (key === 'dashboard_personal') {
      db.setActiveScope('PERSONAL');
      onSelectView('dashboard_personal');
    } else if (key === 'dashboard_family') {
      db.setActiveScope('FAMILY');
      onSelectView('dashboard_family');
    } else if (key === 'profile') {
      if (onOpenProfileSettings) {
        onOpenProfileSettings();
      } else {
        onSelectView('profile');
      }
    } else {
      onSelectView(key);
    }
  };

  // MENÚS EXCLUSIVOS PARA USUARIO (10 ELEMENTOS EXACTOS SEGÚN ESPECIFICACIÓN)
  // 1. Dashboard Personal
  // 2. Dashboard Familiar
  // 3. Movimientos
  // 4. Presupuestos
  // 5. Metas Financieras
  // 6. Deudas
  // 7. Tarjetas de Crédito
  // 8. Reportes
  // 9. Configuración de Perfil
  // 10. Cerrar Sesión
  const userNavItems: { key: ViewKey; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard_personal', label: 'Dashboard Personal', icon: LayoutDashboard },
    { key: 'dashboard_family', label: 'Dashboard Familiar', icon: Users },
    { key: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
    { key: 'budgets', label: 'Presupuestos', icon: PiggyBank },
    { key: 'goals', label: 'Metas Financieras', icon: Target },
    { key: 'debts', label: 'Deudas', icon: Percent },
    { key: 'cards', label: 'Tarjetas de Crédito', icon: CardIcon },
    { key: 'reports', label: 'Reportes', icon: PieChart },
    { key: 'profile', label: 'Configuración de Perfil', icon: Settings }
  ];

  // MENÚS EXCLUSIVOS PARA ADMINISTRADOR TÉCNICO (OCULTOS COMPLETAMENTE PARA USER)
  const adminNavItems: { key: ViewKey; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { key: 'audit', label: 'Auditoría Global & Logs', icon: ShieldCheck, badge: deletedCount > 0 ? deletedCount : undefined },
    { key: 'export_api', label: 'Consola Técnica & API', icon: FileSpreadsheet }
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col justify-between shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* IDENTIFICADOR DE USUARIO CON ROL PROTEGIDO */}
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                  currentUser.role === 'ADMIN' 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-neutral-200/80 text-neutral-700'
                }`}>
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-neutral-400 truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL: MENÚS VISIBLES PARA USER */}
        <div>
          <div className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase px-2 mb-2">
            Módulos Principales
          </div>
          <nav className="space-y-1">
            {userNavItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeView === item.key || 
                (item.key === 'dashboard_personal' && activeView === 'dashboard' && db.getActiveScope() === 'PERSONAL') ||
                (item.key === 'dashboard_family' && activeView === 'dashboard' && db.getActiveScope() === 'FAMILY');

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectNav(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* MÓDULOS DE ADMINISTRACIÓN: EXCLUSIVO ROL ADMIN (NO EXISTE PARA USER) */}
        {isAdmin && (
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-900 uppercase tracking-wider px-2">
              <KeyRound className="w-3.5 h-3.5 text-neutral-700" />
              <span>Consola Administrativa</span>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelectView(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-600'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {onOpenAccessManagement && (
                <button
                  type="button"
                  onClick={onOpenAccessManagement}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors text-left"
                >
                  <Users className="w-4 h-4 text-neutral-700" />
                  <span>Gestión Global de Usuarios</span>
                </button>
              )}

              {onOpenArchitectureDocs && (
                <button
                  type="button"
                  onClick={onOpenArchitectureDocs}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-neutral-600" />
                  <span>Arquitectura Técnica</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* FOOTER: BOTÓN DE CERRAR SESIÓN OBLIGATORIO */}
      <div className="p-4 border-t border-neutral-100 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Cerrar Sesión</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1">
          <span>FinanzaFamiliar</span>
          <span className="font-mono">v1.2</span>
        </div>
      </div>
    </aside>
  );
};
