import React, { useState } from 'react';
import { 
  Calculator, 
  Flame, 
  Snowflake, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Percent, 
  CheckCircle,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import { Debt, DebtType, InterestType, CurrencyCode } from '../types/financial';

export const DebtsView: React.FC = () => {
  const currency = db.getCurrentCurrency();
  const allDebts = db.getDebts();
  const currentUser = db.getCurrentUser();
  const activeScope = db.getActiveScope();

  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PERSONAL' | 'FAMILY'>(activeScope);

  React.useEffect(() => {
    setScopeFilter(activeScope);
  }, [activeScope]);

  const debts = allDebts.filter(d => {
    if (scopeFilter === 'PERSONAL') return d.visibility === 'PRIVATE' || (d.userId === currentUser.id && d.visibility !== 'FAMILY');
    if (scopeFilter === 'FAMILY') return d.visibility === 'FAMILY' || d.visibility === 'SHARED';
    return true;
  });

  // Estados de simulación de pago extraordinario
  const [selectedDebtId, setSelectedDebtId] = useState<string>(debts[0]?.id || allDebts[0]?.id || '');
  const [oneTimeExtra, setOneTimeExtra] = useState<string>('1000');
  const [monthlyExtra, setMonthlyExtra] = useState<string>('150');

  // Estado del presupuesto extra para la comparativa Snowball vs Avalanche
  const [strategyExtraBudget, setStrategyExtraBudget] = useState<string>('250');

  // Modal Nueva Deuda
  const [showNewDebtModal, setShowNewDebtModal] = useState(false);
  const [debtName, setDebtName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [debtType, setDebtType] = useState<DebtType>('BANK');
  const [initialCapital, setInitialCapital] = useState('10000');
  const [currentBalance, setCurrentBalance] = useState('8500');
  const [interestRate, setInterestRate] = useState('12.5');
  const [monthlyInstallment, setMonthlyInstallment] = useState('280');
  const [totalInstallments, setTotalInstallments] = useState('48');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2029-01-01');

  const selectedDebt = debts.find(d => d.id === selectedDebtId) || debts[0];

  // Ejecución de la simulación de pago extraordinario
  const extraSimulation = selectedDebt 
    ? FinancialEngine.simulateExtraPayment(
        selectedDebt,
        parseFloat(oneTimeExtra) || 0,
        parseFloat(monthlyExtra) || 0
      )
    : null;

  // Comparativa de Estrategias Snowball vs Avalanche
  const strategyComparison = FinancialEngine.compareDebtStrategies(
    debts,
    parseFloat(strategyExtraBudget) || 200
  );

  // Tabla de amortización de la deuda seleccionada
  const amortizationSchedule = selectedDebt 
    ? FinancialEngine.generateAmortizationSchedule(selectedDebt, parseFloat(monthlyExtra) || 0).slice(0, 12)
    : [];

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(initialCapital) || 0;
    const curBal = parseFloat(currentBalance) || cap;
    const rate = parseFloat(interestRate) || 10;
    const inst = parseFloat(monthlyInstallment) || FinancialEngine.calculateMonthlyInstallment(cap, rate, parseInt(totalInstallments) || 36);

    db.createDebt({
      userId: db.getCurrentUser().id,
      familyGroupId: db.getCurrentUser().familyGroupId,
      name: debtName,
      creditor: creditor || 'Acreedor Financiero',
      type: debtType,
      initialCapital: cap,
      currentBalance: curBal,
      annualInterestRate: rate,
      interestType: 'FIXED',
      monthlyInstallment: inst,
      totalInstallments: parseInt(totalInstallments) || 36,
      remainingInstallments: Math.ceil(curBal / (inst || 1)),
      startDate,
      endDate,
      currency: 'USD',
      visibility: 'FAMILY'
    });

    setShowNewDebtModal(false);
    setDebtName('');
  };

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Gestión & Simulación de Deudas
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Control de pasivos y estrategias de desendeudamiento acelerado</span>
            <span aria-hidden="true">·</span>
            <span>Métodos Avalancha & Bola de Nieve</span>
          </div>
        </div>

        <button
          onClick={() => setShowNewDebtModal(true)}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
        >
          + Registrar Deuda / Préstamo
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
              Todas ({allDebts.length})
            </button>
            <button
              onClick={() => setScopeFilter('PERSONAL')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'PERSONAL' ? 'bg-white text-neutral-900 shadow-xs font-bold text-sky-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              👤 Deudas Personales (Privadas)
            </button>
            <button
              onClick={() => setScopeFilter('FAMILY')}
              className={`px-3 py-1 rounded-md transition-all ${
                scopeFilter === 'FAMILY' ? 'bg-white text-neutral-900 shadow-xs font-bold text-emerald-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              👨‍👩‍👧‍👦 Deudas Familiares (Compartidas)
            </button>
          </div>
        </div>
        <span className="text-xs text-neutral-400 font-mono">{debts.length} deudas visibles</span>
      </div>

      {/* Tarjetas de Deudas Registradas */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">
          Deudas y Obligaciones Financieras Activas ({debts.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {debts.map(debt => {
            const isSelected = debt.id === selectedDebtId;
            const payoffProgress = Math.max(0, Math.min(100, Number((((debt.initialCapital - debt.currentBalance) / debt.initialCapital) * 100).toFixed(1))));

            return (
              <div
                key={debt.id}
                onClick={() => setSelectedDebtId(debt.id)}
                className={`p-5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900/10'
                    : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{debt.name}</h3>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {debt.creditor} · {debt.type}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        debt.visibility === 'PRIVATE'
                          ? isSelected ? 'bg-sky-900 text-sky-200' : 'bg-sky-100 text-sky-800'
                          : isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {debt.visibility === 'PRIVATE' ? '👤 Personal' : '👨‍👩‍👧‍👦 Familiar'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      db.deleteDebt(debt.id);
                    }}
                    className={`p-1 rounded hover:text-rose-500 transition-colors ${
                      isSelected ? 'text-neutral-400' : 'text-neutral-300'
                    }`}
                    title="Eliminar deuda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  <div className={`text-[11px] ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Saldo Pendiente
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums">
                    ${debt.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Barra de amortización pagada */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className={isSelected ? 'text-neutral-400' : 'text-neutral-500'}>Progreso pagado</span>
                    <span className="font-mono">{payoffProgress}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                    <div 
                      className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-neutral-900'}`}
                      style={{ width: `${payoffProgress}%` }}
                    />
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-[11px] ${
                  isSelected ? 'border-neutral-800 text-neutral-300' : 'border-neutral-100 text-neutral-600'
                }`}>
                  <div>
                    <span className="block text-[10px] text-neutral-400">Tasa Anual</span>
                    <span className="font-semibold">{debt.annualInterestRate}% {debt.interestType}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-neutral-400">Cuota Mensual</span>
                    <span className="font-semibold">${debt.monthlyInstallment.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN CRÍTICA: Simulador de Pago Extraordinario */}
      {selectedDebt && extraSimulation && (
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-neutral-900" />
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Simulador de Abonos Extraordinarios: {selectedDebt.name}
                </h2>
                <div className="text-xs text-neutral-500">
                  Calcula el impacto exacto en intereses ahorrados y tiempo reducido
                </div>
              </div>
            </div>

            <div className="text-xs text-neutral-500 font-mono">
              Tasa: {selectedDebt.annualInterestRate}% · Cuota: ${selectedDebt.monthlyInstallment}/mes
            </div>
          </div>

          {/* Entradas del simulador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-xl space-y-2 text-xs">
              <label className="block font-semibold text-neutral-800">
                Abono Extraordinario Único Inmediato ($)
              </label>
              <input
                type="number"
                step="50"
                value={oneTimeExtra}
                onChange={e => setOneTimeExtra(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold text-sm"
              />
              <span className="text-[11px] text-neutral-500 block">
                Reduce el saldo de capital hoy mismo (ej. prima o bono).
              </span>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl space-y-2 text-xs">
              <label className="block font-semibold text-neutral-800">
                Abono Extra Mensual Adicional a la Cuota ($)
              </label>
              <input
                type="number"
                step="25"
                value={monthlyExtra}
                onChange={e => setMonthlyExtra(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-mono font-bold text-sm"
              />
              <span className="text-[11px] text-neutral-500 block">
                Incremento sostenido sobre la cuota mínima regular.
              </span>
            </div>
          </div>

          {/* Resultados de la Simulación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="text-xs text-emerald-800 font-medium block">Intereses Totales Ahorrados</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                +${extraSimulation.interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-emerald-800 mt-1 block">
                Dinero que dejas de pagar al acreedor
              </span>
            </div>

            <div className="p-4 bg-neutral-900 text-white rounded-xl">
              <span className="text-xs text-neutral-400 font-medium block">Tiempo Ahorrado</span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {extraSimulation.monthsSaved} meses
              </span>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Reducción directa en el plazo del préstamo
              </span>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="text-xs text-neutral-600 font-medium block">Nueva Fecha de Liquidación</span>
              <span className="text-lg font-bold font-mono text-neutral-900 tabular-nums block mt-1">
                {extraSimulation.newPayoffDate}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Fecha original: {extraSimulation.originalPayoffDate}
              </span>
            </div>
          </div>

          {/* Tabla de Primeras 6 Cuotas Amortizadas */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-900">
              Tabla de Amortización Francesa Proyectada (Próximas Cuotas)
            </h3>
            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3"># Cuota</th>
                    <th className="py-2.5 px-3">Fecha Vencimiento</th>
                    <th className="py-2.5 px-3 text-right">Cuota Total</th>
                    <th className="py-2.5 px-3 text-right">Abono Capital</th>
                    <th className="py-2.5 px-3 text-right">Intereses</th>
                    <th className="py-2.5 px-3 text-right">Saldo Restante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono tabular-nums">
                  {amortizationSchedule.slice(0, 6).map(row => (
                    <tr key={row.installmentNumber} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 text-neutral-500">{row.installmentNumber}</td>
                      <td className="py-2 px-3 text-neutral-700">{row.dueDate}</td>
                      <td className="py-2 px-3 text-right font-medium text-neutral-900">${row.payment.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-emerald-700">${row.principal.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-rose-700">${row.interest.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold text-neutral-900">${row.remainingBalance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN CRÍTICA: Comparativa Snowball vs Avalanche */}
      <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-900" />
              Estrategias de Desendeudamiento: Snowball vs Avalanche
            </h2>
            <div className="text-xs text-neutral-500">
              Comparativa algorítmica automatizada para la consolidación de deudas familiares
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-600">Presupuesto Extra Mensual:</span>
            <input
              type="number"
              step="50"
              value={strategyExtraBudget}
              onChange={e => setStrategyExtraBudget(e.target.value)}
              className="w-24 px-2 py-1 bg-neutral-50 border border-neutral-300 rounded font-mono font-bold"
            />
          </div>
        </div>

        {/* Recomendación Automatizada */}
        <div className="p-4 bg-neutral-100 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
            <span>Recomendación Financiera Automatizada:</span>
            <span className="font-mono uppercase bg-neutral-900 text-white px-2 py-0.5 rounded text-[11px]">
              Método {strategyComparison.recommendation.preferredStrategy === 'AVALANCHE' ? 'Avalancha' : 'Bola de Nieve'}
            </span>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed">
            {strategyComparison.recommendation.reason}
          </p>
        </div>

        {/* Comparativa Cara a Cara */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta Avalanche */}
          <div className="p-5 border border-neutral-200 rounded-xl space-y-3 bg-neutral-50/50">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>Método Avalancha (Avalanche)</span>
            </div>
            <p className="text-xs text-neutral-600">
              Prioriza la deuda con mayor tasa de interés anual primero para minimizar el costo financiero total.
            </p>

            <div className="space-y-2 pt-2 border-t border-neutral-200 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Intereses Totales Pagados:</span>
                <span className="font-bold text-neutral-900">${strategyComparison.avalanche.totalInterestPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Meses para Liquidación Total:</span>
                <span className="font-bold text-neutral-900">{strategyComparison.avalanche.totalMonths} meses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Fecha Libre de Deudas:</span>
                <span className="font-bold text-emerald-700">{strategyComparison.avalanche.payoffDate}</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200">
              <span className="font-semibold block text-neutral-700">Orden de Ataque:</span>
              <span>{strategyComparison.avalanche.orderOfDebts.join(' → ')}</span>
            </div>
          </div>

          {/* Tarjeta Snowball */}
          <div className="p-5 border border-neutral-200 rounded-xl space-y-3 bg-neutral-50/50">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <Snowflake className="w-4 h-4 text-sky-600" />
              <span>Método Bola de Nieve (Snowball)</span>
            </div>
            <p className="text-xs text-neutral-600">
              Prioriza la deuda con menor saldo pendiente primero para lograr victorias tempranas y motivación psicológica.
            </p>

            <div className="space-y-2 pt-2 border-t border-neutral-200 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Intereses Totales Pagados:</span>
                <span className="font-bold text-neutral-900">${strategyComparison.snowball.totalInterestPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Meses para Liquidación Total:</span>
                <span className="font-bold text-neutral-900">{strategyComparison.snowball.totalMonths} meses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Fecha Libre de Deudas:</span>
                <span className="font-bold text-emerald-700">{strategyComparison.snowball.payoffDate}</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200">
              <span className="font-semibold block text-neutral-700">Orden de Ataque:</span>
              <span>{strategyComparison.snowball.orderOfDebts.join(' → ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Deuda */}
      {showNewDebtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900">Registrar Deuda u Obligación</h3>
            <form onSubmit={handleCreateDebt} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Nombre de la Deuda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Préstamo Automotriz, Crédito Hipotecario"
                  value={debtName}
                  onChange={e => setDebtName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Acreedor / Banco *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Santander, Banco Estado"
                    value={creditor}
                    onChange={e => setCreditor(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Tipo de Deuda *</label>
                  <select
                    value={debtType}
                    onChange={e => setDebtType(e.target.value as DebtType)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="BANK">Bancaria</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="FAMILY">Familiar</option>
                    <option value="VEHICLE">Vehículo</option>
                    <option value="MORTGAGE">Vivienda (Hipoteca)</option>
                    <option value="CONSUMER">Consumo</option>
                    <option value="OTHER">Otra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Capital Inicial *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={initialCapital}
                    onChange={e => setInitialCapital(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Saldo Actual Pendiente *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentBalance}
                    onChange={e => setCurrentBalance(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium mb-1">Tasa Anual (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={interestRate}
                    onChange={e => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Cuota Mensual *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={monthlyInstallment}
                    onChange={e => setMonthlyInstallment(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Plazo (Meses)</label>
                  <input
                    type="number"
                    value={totalInstallments}
                    onChange={e => setTotalInstallments(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Fecha Estimada de Fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDebtModal(false)}
                  className="px-3 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-medium"
                >
                  Guardar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
