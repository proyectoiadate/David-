import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Trash2
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import { Budget, VisibilityType } from '../types/financial';

export const BudgetsView: React.FC = () => {
  const currency = db.getCurrentCurrency();
  const allBudgets = db.getBudgets();
  const transactions = db.getTransactions();
  const categories = db.getState().categories;
  const currentUser = db.getCurrentUser();
  const activeScope = db.getActiveScope();

  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PERSONAL' | 'FAMILY'>(activeScope);

  React.useEffect(() => {
    setScopeFilter(activeScope);
  }, [activeScope]);

  const budgets = allBudgets.filter(b => {
    if (scopeFilter === 'PERSONAL') return b.visibility === 'PRIVATE' || (b.userId === currentUser.id && b.visibility !== 'FAMILY');
    if (scopeFilter === 'FAMILY') return b.visibility === 'FAMILY' || b.visibility === 'SHARED';
    return true;
  });

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [limitAmount, setLimitAmount] = useState('500');
  const [period, setPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('MONTHLY');
  const [threshold, setThreshold] = useState('80');
  const [visibility, setVisibility] = useState<VisibilityType>(activeScope === 'PERSONAL' ? 'PRIVATE' : 'FAMILY');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitAmount) || 100;
    const thresh = parseFloat(threshold) || 80;

    db.createBudget({
      userId: currentUser.id,
      familyGroupId: currentUser.familyGroupId,
      name: name || `Presupuesto ${category}`,
      category,
      limitAmount: limit,
      period,
      currency: 'USD',
      visibility,
      alertThresholdPercent: thresh
    });

    setShowModal(false);
    setName('');
  };

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Control de Presupuestos
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Límites de gasto por categoría</span>
            <span aria-hidden="true">·</span>
            <span>Alertas tempranas al 80% y 100% de ejecución</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          + Crear Presupuesto
        </button>
      </div>

      {/* Selector de Ámbito */}
      <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-neutral-700">Filtrar por Ámbito:</span>
          <div className="inline-flex p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setScopeFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Todos ({allBudgets.length})
            </button>
            <button
              onClick={() => setScopeFilter('PERSONAL')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'PERSONAL' ? 'bg-white text-neutral-900 shadow-xs font-bold text-sky-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              👤 Presupuestos Personales (Privados)
            </button>
            <button
              onClick={() => setScopeFilter('FAMILY')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'FAMILY' ? 'bg-white text-neutral-900 shadow-xs font-bold text-emerald-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              👨‍👩‍👧‍👦 Presupuestos Familiares (Compartidos)
            </button>
          </div>
        </div>
        <span className="text-xs text-neutral-400 font-mono">{budgets.length} presupuestos visibles</span>
      </div>

      {/* Lista de Presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(b => {
          const progress = FinancialEngine.calculateBudgetProgress(b, transactions);
          const convertedLimit = FinancialEngine.convertCurrency(b.limitAmount, b.currency, currency).convertedAmount;
          const convertedSpent = FinancialEngine.convertCurrency(progress.spentAmount, b.currency, currency).convertedAmount;

          return (
            <div 
              key={b.id} 
              className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs hover:border-neutral-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">{b.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                    <span>{b.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{b.period.toLowerCase()}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      b.visibility === 'PRIVATE' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {b.visibility === 'PRIVATE' ? '👤 Personal' : '👨‍👩‍👧‍👦 Familiar'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    progress.isExceeded
                      ? 'bg-rose-100 text-rose-800'
                      : progress.isWarning80
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {progress.usedPercent}%
                  </span>
                  <button
                    onClick={() => db.deleteBudget(b.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1"
                    title="Eliminar presupuesto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-1.5">
                <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      progress.isExceeded
                        ? 'bg-rose-600'
                        : progress.isWarning80
                        ? 'bg-amber-500'
                        : 'bg-neutral-900'
                    }`}
                    style={{ width: `${Math.min(100, progress.usedPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-mono tabular-nums text-neutral-500">
                  <span>Gastado: {symbol}{convertedSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span>Techo: {symbol}{convertedLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Estado de Alerta */}
              {progress.isExceeded ? (
                <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Presupuesto excedido en {symbol}{Math.abs(progress.remainingAmount).toFixed(2)}.</span>
                </div>
              ) : progress.isWarning80 ? (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Alerta preventiva: Has superado el {b.alertThresholdPercent}% del cupo mensual.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disponible para gastar: {symbol}{progress.remainingAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Nuevo Presupuesto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Crear Presupuesto</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  placeholder="Ej. Supermercado Familiar Octubre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Categoría a Presupuestar *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  {categories.filter(c => c.type === 'EXPENSE').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Límite Máximo ($) *</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={limitAmount}
                    onChange={e => setLimitAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Umbral Alerta (%)</label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={e => setThreshold(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Periodicidad</label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="QUARTERLY">Trimestral</option>
                  <option value="ANNUAL">Anual</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-medium"
                >
                  Guardar Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
