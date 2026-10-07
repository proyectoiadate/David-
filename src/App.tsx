/**
 * FinanzaFamiliar - Main Application Component
 * Plataforma integral de gestión financiera personal y familiar.
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
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { AuditView } from './components/AuditView';
import { ExportAndApiView } from './components/ExportAndApiView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { ArchitectureDocModal } from './components/ArchitectureDocModal';
import { AccessManagementModal } from './components/AccessManagementModal';
import { AuthView } from './components/AuthView';

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Reaccionar a cambios en el almacén de datos (base de datos relacional)
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  // Si no está autenticado, mostrar portal de accesos (Login, Registro, 2FA, Directorio de Accesos)
  if (!db.isUserAuthenticated()) {
    return <AuthView onSuccessLogin={() => setTick(t => t + 1)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Top Navigation Bar adhering to the Top Bar Contract */}
      <Navbar
        onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
        onOpenArchitectureDocs={() => setIsArchModalOpen(true)}
        onOpenAccessManagement={() => setIsAccessModalOpen(true)}
        activeView={activeView}
      />

      {/* Main Workspace: Sidebar + Viewport Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          onOpenAccessManagement={() => setIsAccessModalOpen(true)}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl">
          {activeView === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveView}
              onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
            />
          )}

          {activeView === 'transactions' && (
            <TransactionsView
              onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
            />
          )}

          {activeView === 'accounts' && (
            <AccountsView />
          )}

          {activeView === 'debts' && (
            <DebtsView />
          )}

          {activeView === 'budgets' && (
            <BudgetsView />
          )}

          {activeView === 'goals' && (
            <GoalsView />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView />
          )}

          {activeView === 'reports' && (
            <ReportsView />
          )}

          {activeView === 'audit' && (
            <AuditView />
          )}

          {activeView === 'export_api' && (
            <ExportAndApiView />
          )}
        </main>
      </div>

      {/* Modales Interactivos */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
      />

      <ArchitectureDocModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <AccessManagementModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}
