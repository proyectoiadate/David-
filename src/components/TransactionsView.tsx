import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Trash2, 
  Download, 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import { ExportService } from '../services/exportService';
import { TransactionType, VisibilityType } from '../types/financial';

interface TransactionsViewProps {
  onOpenNewTransaction: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenNewTransaction }) => {
  const currency = db.getCurrentCurrency();
  const transactions = db.getTransactions();
  const scheduledTxs = db.getScheduledTransactions();
  const accounts = db.getAccounts();
  const categories = db.getState().categories;

  // Tabs
  const [tab, setTab] = useState<'REGISTERED' | 'SCHEDULED'>('REGISTERED');
  const activeScope = db.getActiveScope();
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PERSONAL' | 'FAMILY'>(activeScope);

  React.useEffect(() => {
    setScopeFilter(activeScope);
  }, [activeScope]);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');

  // Filtrado de transacciones
  const currentUser = db.getCurrentUser();
  const filteredTransactions = transactions.filter(t => {
    // Filtro por Ámbito Personal vs Familiar
    if (scopeFilter === 'PERSONAL' && (t.userId !== currentUser.id || t.visibility !== 'PRIVATE')) {
      return false;
    }
    if (scopeFilter === 'FAMILY' && (t.visibility !== 'FAMILY' && t.visibility !== 'SHARED')) {
      return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCat = t.category?.toLowerCase().includes(q);
      const matchTags = t.tags?.some(tag => tag.toLowerCase().includes(q));
      if (!matchDesc && !matchCat && !matchTags) return false;
    }
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (accountFilter !== 'ALL' && t.accountId !== accountFilter) return false;
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (visibilityFilter !== 'ALL' && t.visibility !== visibilityFilter) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    db.deleteTransaction(id);
  };

  const handleExecuteScheduled = (id: string) => {
    db.executeScheduledTransaction(id);
  };

  const handleExport = () => {
    ExportService.exportTransactionsToExcel(filteredTransactions);
  };

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Libro de Movimientos Financieros
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Registro y control de transacciones</span>
            <span aria-hidden="true">·</span>
            <span>Afectación directa a saldos de cuentas</span>
            <span aria-hidden="true">·</span>
            <span>{filteredTransactions.length} movimientos visibles</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            + Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Segmented Control: Registrados vs Programados y Ámbito */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => setTab('REGISTERED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'REGISTERED' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Movimientos Registrados ({transactions.length})
          </button>
          <button
            onClick={() => setTab('SCHEDULED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'SCHEDULED' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Movimientos Programados ({scheduledTxs.filter(s => s.status === 'SCHEDULED').length})
          </button>
        </div>

        {/* Selector de Ámbito: Todas / Finanzas Personales / Finanzas Familiares */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => setScopeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Todas ({transactions.length})
          </button>
          <button
            onClick={() => setScopeFilter('PERSONAL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeFilter === 'PERSONAL' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            👤 Personales Privadas
          </button>
          <button
            onClick={() => setScopeFilter('FAMILY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              scopeFilter === 'FAMILY' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            👨‍👩‍👧‍👦 Familiares Compartidas
          </button>
        </div>
      </div>

      {tab === 'REGISTERED' ? (
        <>
          {/* Barra de Filtros */}
          <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Buscador */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar descripción o tag..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {/* Tipo */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="ALL">Todos los Tipos</option>
                <option value="EXPENSE">Gastos</option>
                <option value="INCOME">Ingresos</option>
                <option value="TRANSFER">Transferencias</option>
                <option value="CARD_PAYMENT">Pagos de Tarjeta</option>
                <option value="DEBT_PAYMENT">Pagos de Deuda</option>
                <option value="BALANCE_ADJUSTMENT">Ajustes</option>
              </select>

              {/* Cuenta */}
              <select
                value={accountFilter}
                onChange={e => setAccountFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="ALL">Todas las Cuentas</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>

              {/* Categoría */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="ALL">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Visibilidad */}
              <select
                value={visibilityFilter}
                onChange={e => setVisibilityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="ALL">Toda Visibilidad</option>
                <option value="FAMILY">Familiar</option>
                <option value="SHARED">Compartido</option>
                <option value="PRIVATE">Privado</option>
              </select>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Concepto & Categoría</th>
                    <th className="py-3 px-4">Cuenta / Medio</th>
                    <th className="py-3 px-4">Visibilidad</th>
                    <th className="py-3 px-4 text-right">Monto Original</th>
                    <th className="py-3 px-4 text-right">Convertido ({currency})</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-400">
                        No se encontraron movimientos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => {
                      const isIncome = tx.type === 'INCOME';
                      const account = accounts.find(a => a.id === tx.accountId);
                      const converted = FinancialEngine.convertCurrency(tx.amount, tx.currency, currency, tx.exchangeRateUsed).convertedAmount;

                      return (
                        <tr key={tx.id} className="hover:bg-neutral-50/70 transition-colors">
                          {/* Fecha */}
                          <td className="py-3 px-4 font-mono text-neutral-600 tabular-nums whitespace-nowrap">
                            {tx.date}
                          </td>

                          {/* Concepto & Categoría */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-neutral-900">{tx.description}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                              <span>{tx.category}</span>
                              {tx.subcategory && (
                                <>
                                  <span aria-hidden="true">/</span>
                                  <span>{tx.subcategory}</span>
                                </>
                              )}
                              {tx.tags && tx.tags.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-neutral-400">#{tx.tags.join(' #')}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Cuenta & Método */}
                          <td className="py-3 px-4 text-neutral-600">
                            <div>{account?.name || 'Cuenta General'}</div>
                            <div className="text-[11px] text-neutral-400 capitalize">
                              {tx.paymentMethod.replace('_', ' ').toLowerCase()}
                            </div>
                          </td>

                          {/* Visibilidad */}
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tx.visibility === 'PRIVATE'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {tx.visibility === 'PRIVATE' ? '👤 Personal' : '👨‍👩‍👧‍👦 Familiar'}
                            </span>
                          </td>

                          {/* Monto Original */}
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-neutral-700">
                            {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          {/* Monto Convertido */}
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                            <span className={isIncome ? 'text-emerald-700' : 'text-neutral-900'}>
                              {isIncome ? '+' : '-'}{symbol}{converted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Enviar a papelera (Soft Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Pestaña: Movimientos Programados */
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Movimientos Programados (Pendientes de Ejecución)
              </h2>
              <p className="text-xs text-neutral-500">
                Regla de negocio: Un movimiento programado NO afecta saldos hasta que se ejecuta formalmente.
              </p>
            </div>
          </div>

          <div className="divide-y divide-neutral-100">
            {scheduledTxs.length === 0 ? (
              <p className="py-6 text-center text-xs text-neutral-400">No hay movimientos programados.</p>
            ) : (
              scheduledTxs.map(sch => {
                const account = accounts.find(a => a.id === sch.accountId);
                const isExecuted = sch.status === 'EXECUTED';

                return (
                  <div key={sch.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isExecuted ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {isExecuted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{sch.description}</p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                          <span>Fecha programada: {sch.scheduledDate}</span>
                          <span aria-hidden="true">·</span>
                          <span>Frecuencia: {sch.frequency}</span>
                          <span aria-hidden="true">·</span>
                          <span>{account?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-semibold tabular-nums text-neutral-900">
                          {sch.currency} {sch.amount.toFixed(2)}
                        </p>
                        <span className={`text-[10px] font-medium ${isExecuted ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isExecuted ? 'Ejecutado' : 'Pendiente'}
                        </span>
                      </div>

                      {!isExecuted && (
                        <button
                          onClick={() => handleExecuteScheduled(sch.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>Ejecutar Ahora</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
