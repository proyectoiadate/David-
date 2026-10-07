import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Trash2
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import { Goal, GoalType, CurrencyCode } from '../types/financial';

export const GoalsView: React.FC = () => {
  const currency = db.getCurrentCurrency();
  const allGoals = db.getGoals();
  const accounts = db.getAccounts();
  const currentUser = db.getCurrentUser();
  const activeScope = db.getActiveScope();

  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PERSONAL' | 'FAMILY'>(activeScope);

  React.useEffect(() => {
    setScopeFilter(activeScope);
  }, [activeScope]);

  const goals = allGoals.filter(g => {
    if (scopeFilter === 'PERSONAL') return g.visibility === 'PRIVATE' || (g.userId === currentUser.id && g.visibility !== 'FAMILY');
    if (scopeFilter === 'FAMILY') return g.visibility === 'FAMILY' || g.visibility === 'SHARED';
    return true;
  });

  // Modal Nueva Meta
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('EMERGENCY_FUND');
  const [targetAmount, setTargetAmount] = useState('5000');
  const [currentAmount, setCurrentAmount] = useState('1000');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [monthlyPlanned, setMonthlyPlanned] = useState('300');

  // Modal Aporte a Meta
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [contributionAmount, setContributionAmount] = useState('200');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount) || 1000;
    const current = parseFloat(currentAmount) || 0;
    const monthly = parseFloat(monthlyPlanned) || 100;

    db.createGoal({
      userId: db.getCurrentUser().id,
      familyGroupId: db.getCurrentUser().familyGroupId,
      name,
      type: goalType,
      targetAmount: target,
      currentAmount: current,
      targetDate,
      currency: 'USD',
      visibility: 'FAMILY',
      monthlyPlannedContribution: monthly
    });

    setShowModal(false);
    setName('');
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount) || 0;
    const goal = goals.find(g => g.id === selectedGoalId);

    if (goal && amount > 0) {
      // 1. Actualizar meta
      db.updateGoal(goal.id, {
        currentAmount: goal.currentAmount + amount
      });

      // 2. Registrar movimiento de gasto/transferencia para afectar saldo de cuenta
      db.createTransaction({
        userId: db.getCurrentUser().id,
        familyGroupId: db.getCurrentUser().familyGroupId,
        type: 'TRANSFER',
        amount,
        currency: goal.currency,
        exchangeRateUsed: 1.0,
        date: new Date().toISOString().split('T')[0],
        accountId: sourceAccountId,
        category: 'Otros Ingresos',
        paymentMethod: 'BANK_TRANSFER',
        description: `Aporte a Meta: ${goal.name}`,
        tags: ['meta', 'ahorro'],
        visibility: 'FAMILY'
      });

      setShowContributionModal(false);
      setContributionAmount('200');
    }
  };

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Metas Financieras & Planes de Ahorro
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Objetivos de patrimonio, fondos de emergencia y compras futuras</span>
            <span aria-hidden="true">·</span>
            <span>Simulación y cálculo de fechas estimadas</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          + Crear Meta de Ahorro
        </button>
      </div>

      {/* Selector de Ámbito */}
      <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-700">Ámbito:</span>
          <div className="inline-flex p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setScopeFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Todas ({allGoals.length})
            </button>
            <button
              onClick={() => setScopeFilter('PERSONAL')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'PERSONAL' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              👤 Metas Personales
            </button>
            <button
              onClick={() => setScopeFilter('FAMILY')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'FAMILY' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              👨‍👩‍👧‍👦 Metas Familiares
            </button>
          </div>
        </div>
        <span className="text-neutral-400 font-mono">{goals.length} metas activas</span>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map(goal => {
          const progress = FinancialEngine.calculateGoalProgress(goal);
          const convertedTarget = FinancialEngine.convertCurrency(goal.targetAmount, goal.currency, currency).convertedAmount;
          const convertedCurrent = FinancialEngine.convertCurrency(goal.currentAmount, goal.currency, currency).convertedAmount;

          return (
            <div 
              key={goal.id} 
              className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">{goal.name}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                      <span className="capitalize">{goal.type.replace('_', ' ').toLowerCase()}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        goal.visibility === 'PRIVATE' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {goal.visibility === 'PRIVATE' ? '👤 Meta Personal' : '👨‍👩‍👧‍👦 Meta Familiar'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => db.deleteGoal(goal.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1"
                    title="Eliminar meta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Porcentaje y Barra */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-neutral-500">Avance acumulado</span>
                    <span className="font-mono font-bold text-emerald-700 text-base tabular-nums">
                      {progress.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, progress.progressPercent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-mono tabular-nums text-neutral-500">
                    <span>{symbol}{convertedCurrent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span>Objetivo: {symbol}{convertedTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Métricas de Simulación y Proyección */}
                <div className="p-3 bg-neutral-50 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Fecha Límite:</span>
                    <span className="font-medium text-neutral-900">{goal.targetDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Aporte mensual:</span>
                    <span className="font-mono font-medium text-neutral-900">${goal.monthlyPlannedContribution}/mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Meses proyectados:</span>
                    <span className="font-mono font-semibold text-neutral-900">{progress.projectedCompletionMonths} meses</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 flex items-center gap-1.5 text-[11px]">
                    {progress.isOnTrack ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Al ritmo actual se cumplirá el {progress.projectedCompletionDate}
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        En riesgo: Aumenta tu aporte mensual para alcanzar la fecha
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón Aportar Fondos */}
              <button
                onClick={() => {
                  setSelectedGoalId(goal.id);
                  setShowContributionModal(true);
                }}
                className="w-full py-2 px-3 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-center"
              >
                + Registrar Aporte a esta Meta
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Nueva Meta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Nueva Meta de Ahorro</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Nombre del Objetivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vacaciones de Verano, Fondo Inmobiliario"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Categoría del Objetivo</label>
                <select
                  value={goalType}
                  onChange={e => setGoalType(e.target.value as GoalType)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option value="EMERGENCY_FUND">Fondo de Emergencia</option>
                  <option value="TRAVEL">Viajes & Turismo</option>
                  <option value="HOUSING">Vivienda (Cuota Inicial)</option>
                  <option value="VEHICLE">Vehículo</option>
                  <option value="EDUCATION">Educación</option>
                  <option value="FREE_SAVINGS">Ahorro Libre</option>
                  <option value="CUSTOM">Personalizada</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Monto Objetivo ($) *</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Monto Actual Ahorrado</label>
                  <input
                    type="number"
                    step="50"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Fecha Objetivo *</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Aporte Mensual Planeado</label>
                  <input
                    type="number"
                    step="25"
                    value={monthlyPlanned}
                    onChange={e => setMonthlyPlanned(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
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
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aporte a Meta */}
      {showContributionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Registrar Aporte a Meta</h3>
            <form onSubmit={handleContribute} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Monto a Aportar ($) *</label>
                <input
                  type="number"
                  step="10"
                  required
                  value={contributionAmount}
                  onChange={e => setContributionAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Debitar de la Cuenta *</label>
                <select
                  value={sourceAccountId}
                  onChange={e => setSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency} {acc.currentBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  El monto se descontará automáticamente de la cuenta seleccionada.
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContributionModal(false)}
                  className="px-3 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-medium"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
