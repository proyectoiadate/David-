import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  RotateCcw, 
  Clock, 
  User, 
  Eye, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { db } from '../services/database';
import { AuditLog, Transaction } from '../types/financial';

export const AuditView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'TRASH'>('AUDIT');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const auditLogs = db.getState().auditLogs;
  const deletedTransactions = db.getState().transactions.filter(t => t.isDeleted);
  const deletedAccounts = db.getState().accounts.filter(a => a.isDeleted);
  const deletedDebts = db.getState().debts.filter(d => d.isDeleted);
  const deletedGoals = db.getState().goals.filter(g => g.isDeleted);
  const deletedBudgets = db.getState().budgets.filter(b => b.isDeleted);

  const totalDeleted = 
    deletedTransactions.length + 
    deletedAccounts.length + 
    deletedDebts.length + 
    deletedGoals.length + 
    deletedBudgets.length;

  const handleRestoreTx = (id: string) => {
    db.restoreTransaction(id);
  };

  const handleRestoreAccount = (id: string) => {
    db.restoreAccount(id);
  };

  const handleRestoreDebt = (id: string) => {
    db.restoreDebt(id);
  };

  const handleRestoreGoal = (id: string) => {
    db.restoreGoal(id);
  };

  const handleRestoreBudget = (id: string) => {
    db.restoreBudget(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-900" />
            Auditoría Completa & Papelera de Restauración
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Trazabilidad inmutable de cambios y prevención de pérdida accidental de datos</span>
            <span aria-hidden="true">·</span>
            <span>Soft Delete activo</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'AUDIT' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Bitácora de Auditoría ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('TRASH')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'TRASH' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Papelera de Reciclaje ({totalDeleted})
          </button>
        </div>
      </div>

      {activeTab === 'AUDIT' ? (
        /* Tabla de Auditoría */
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Entidad Modificada</th>
                    <th className="py-3 px-4">ID de Registro</th>
                    <th className="py-3 px-4 text-center">Detalle de Cambios</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4 text-neutral-600 tabular-nums whitespace-nowrap">
                        {log.timestamp.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="py-3 px-4 font-sans text-neutral-900 font-medium">
                        {log.userName}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-100 text-blue-800'
                            : log.action === 'DELETE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-neutral-800 font-medium">
                        {log.entityType}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 text-[11px]">
                        {log.entityId}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-900 font-medium px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Diff</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Papelera y Restauración */
        <div className="space-y-6">
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span className="font-semibold block mb-0.5">Política de Soft Delete:</span>
            Los elementos eliminados se retienen en la papelera para evitar descalces o inconsistencias financieras involuntarias. Puedes restaurarlos en cualquier momento manteniendo su historial contable.
          </div>

          {/* Transacciones en Papelera */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-900">
              Movimientos Financieros en Papelera ({deletedTransactions.length})
            </h2>

            {deletedTransactions.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No hay transacciones en papelera.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {deletedTransactions.map(tx => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-neutral-900">{tx.description} ({tx.category})</p>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {tx.date} · {tx.currency} {tx.amount.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRestoreTx(tx.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cuentas y Deudas en Papelera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900">
                Cuentas en Papelera ({deletedAccounts.length})
              </h2>
              {deletedAccounts.length === 0 ? (
                <p className="text-xs text-neutral-400 py-2">No hay cuentas eliminadas.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {deletedAccounts.map(acc => (
                    <div key={acc.id} className="py-2 flex items-center justify-between text-xs">
                      <span>{acc.name} ({acc.currency})</span>
                      <button
                        onClick={() => handleRestoreAccount(acc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900">
                Deudas en Papelera ({deletedDebts.length})
              </h2>
              {deletedDebts.length === 0 ? (
                <p className="text-xs text-neutral-400 py-2">No hay deudas eliminadas.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {deletedDebts.map(d => (
                    <div key={d.id} className="py-2 flex items-center justify-between text-xs">
                      <span>{d.name} (${d.currentBalance})</span>
                      <button
                        onClick={() => handleRestoreDebt(d.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle de Diff de Auditoría */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">
                Detalle de Auditoría: {selectedLog.entityType} ({selectedLog.action})
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-500 hover:text-neutral-800 text-xs font-medium"
              >
                Cerrar
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div>Usuario: <strong className="text-neutral-900">{selectedLog.userName}</strong></div>
                <div>Fecha: <strong className="text-neutral-900">{selectedLog.timestamp}</strong></div>
              </div>

              <div>
                <span className="font-semibold text-neutral-700 block mb-1">Valor Anterior:</span>
                <pre className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-[11px] overflow-x-auto text-neutral-800">
                  {selectedLog.previousValue ? JSON.stringify(selectedLog.previousValue, null, 2) : '(Sin valor previo - Registro nuevo)'}
                </pre>
              </div>

              <div>
                <span className="font-semibold text-neutral-700 block mb-1">Valor Nuevo (Modificado):</span>
                <pre className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-[11px] overflow-x-auto text-neutral-800">
                  {selectedLog.newValue ? JSON.stringify(selectedLog.newValue, null, 2) : '(Eliminado)'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
