/**
 * FinanzaFamiliar - Main Application Component
 * Plataforma integral de gestión financiera personal y familiar.
 * Implementa control estricto de roles (USER vs ADMIN), rutas protegidas y RBAC.
 */

import React, { useState, useEffect } from 'react';
import { db } from './services/database';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewKey } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { DebtsView } from './components/DebtsView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsView } from './components/GoalsView';
import { ReportsView } from './components/ReportsView';
import { AuditView } from './components/AuditView';
import { ExportAndApiView } from './components/ExportAndApiView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { ArchitectureDocModal } from './components/ArchitectureDocModal';
import { AccessManagementModal } from './components/AccessManagementModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { AuthView } from './components/AuthView';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Reaccionar a cambios en el almacén de datos (base de datos relacional)
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  // Escuchar cambios de Firebase Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        db.handleFirebaseAuthUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        });
      }
    });
    return () => unsubAuth();
  }, []);

  // Si no está autenticado, mostrar portal de accesos (Login o Registro)
  if (!db.isUserAuthenticated()) {
    return <AuthView onSuccessLogin={() => setTick(t => t + 1)} />;
  }

  const isAdmin = db.isCurrentUserAdmin();

  // PROTECCIÓN CRÍTICA DE RUTAS:
  // Si un usuario con rol USER intenta acceder a vistas de administración o técnicas,
  // el guardián de rutas lo redirige inmediatamente al dashboard personal.
  const isRestrictedAdminView = activeView === 'audit' || activeView === 'export_api';
  const safeActiveView: ViewKey = (!isAdmin && isRestrictedAdminView)
    ? 'dashboard'
    : activeView;

  const isDashboardView = safeActiveView === 'dashboard' || 
    safeActiveView === 'dashboard_personal' || 
    safeActiveView === 'dashboard_family';

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
        onOpenArchitectureDocs={() => setIsArchModalOpen(true)}
        onOpenAccessManagement={() => setIsAccessModalOpen(true)}
        onOpenProfileSettings={() => setIsProfileModalOpen(true)}
        activeView={safeActiveView}
      />

      {/* Main Workspace: Sidebar + Viewport Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={safeActiveView}
          onSelectView={setActiveView}
          onOpenAccessManagement={() => setIsAccessModalOpen(true)}
          onOpenProfileSettings={() => setIsProfileModalOpen(true)}
          onOpenArchitectureDocs={() => setIsArchModalOpen(true)}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl">
          {isDashboardView && (
            <DashboardView
              onNavigate={setActiveView}
              onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
            />
          )}

          {safeActiveView === 'transactions' && (
            <TransactionsView
              onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
            />
          )}

          {(safeActiveView === 'accounts' || safeActiveView === 'cards') && (
            <AccountsView />
          )}

          {safeActiveView === 'debts' && (
            <DebtsView />
          )}

          {safeActiveView === 'budgets' && (
            <BudgetsView />
          )}

          {safeActiveView === 'goals' && (
            <GoalsView />
          )}

          {safeActiveView === 'reports' && (
            <ReportsView />
          )}

          {/* Vistas protegidas estrictamente para rol ADMIN */}
          {safeActiveView === 'audit' && isAdmin && (
            <AuditView />
          )}

          {safeActiveView === 'export_api' && isAdmin && (
            <ExportAndApiView />
          )}
        </main>
      </div>

      {/* Modales Interactivos para Usuarios */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
      />

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Modales técnicos estrictamente para ADMIN (Nunca renderizados para USER) */}
      {isAdmin && (
        <>
          <ArchitectureDocModal
            isOpen={isArchModalOpen}
            onClose={() => setIsArchModalOpen(false)}
          />

          <AccessManagementModal
            isOpen={isAccessModalOpen}
            onClose={() => setIsAccessModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
