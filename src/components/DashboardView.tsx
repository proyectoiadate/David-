import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  CreditCard, 
  AlertTriangle, 
  Clock,
  User as UserIcon,
  Users,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import { ViewKey } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (view: ViewKey) => void;
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenNewTransaction }) => {
  const currency = db.getCurrentCurrency();
  const activeScope = db.getActiveScope();
  const currentUser = db.getCurrentUser();

  // Entidades filtradas según el alcance activo (Personal, Familiar o Consolidado)
  const transactions = db.getScopedTransactions();
  const accounts = db.getScopedAccounts();
  const creditCards = db.getScopedCreditCards();
  const debts = db.getScopedDebts();
  const budgets = db.getScopedBudgets();
  const goals = db.getScopedGoals();
  const alerts = db.getAlerts().filter(a => !a.isRead);

  // Desglose comparativo Personal vs Familiar
  const breakdown = db.getPersonalVsFamilyBreakdown();

  // Totales financieros del mes actual para el scope activo
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthBalance = FinancialEngine.calculateGeneralBalance(monthTxs, currency);

  // Balance Total consolidado en las cuentas del scope activo
  const totalLiquidAssets = accounts.reduce((sum, acc) => {
    return sum + FinancialEngine.convertCurrency(acc.currentBalance, acc.currency, currency).convertedAmount;
  }, 0);

  // Total deudas pendientes
  const totalDebtBalance = debts.reduce((sum, d) => {
    return sum + FinancialEngine.convertCurrency(d.currentBalance, d.currency, currency).convertedAmount;
  }, 0);

  // Presupuesto global mensual
  const totalBudgetLimit = budgets.reduce((sum, b) => {
    return sum + FinancialEngine.convertCurrency(b.limitAmount, b.currency, currency).convertedAmount;
  }, 0);

  const budgetUsedPercent = totalBudgetLimit > 0 
    ? Math.min(100, Number(((monthBalance.totalExpense / totalBudgetLimit) * 100).toFixed(1)))
    : 0;

  // Próximos vencimientos (Tarjetas y Deudas)
  const upcomingCards = creditCards.map(c => ({
    title: `${c.name} (${c.issuer})`,
    due: `Día ${c.dueDay} de este mes`,
    amount: FinancialEngine.convertCurrency(c.usedAmount, c.currency, currency).convertedAmount,
    type: 'Tarjeta'
  }));

  const upcomingDebts = debts.slice(0, 3).map(d => ({
    title: d.name,
    due: `Vence el ${d.endDate}`,
    amount: FinancialEngine.convertCurrency(d.monthlyInstallment, d.currency, currency).convertedAmount,
    type: 'Préstamo'
  }));

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-6">
      {/* Scope Banner: Claridad Absoluta de Finanzas Personales vs Familiares */}
      <div className={`p-4 md:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs ${
        activeScope === 'PERSONAL'
          ? 'bg-sky-50/80 border-sky-200 text-sky-950'
          : activeScope === 'FAMILY'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-neutral-900 text-white border-neutral-800'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            activeScope === 'PERSONAL'
              ? 'bg-sky-600 text-white'
              : activeScope === 'FAMILY'
                ? 'bg-emerald-700 text-white'
                : 'bg-neutral-800 text-white'
          }`}>
            {activeScope === 'PERSONAL' ? <UserIcon className="w-5 h-5" /> : activeScope === 'FAMILY' ? <Users className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {activeScope === 'PERSONAL' 
                  ? `Espacio Privado: Finanzas Personales de ${currentUser.name}`
                  : activeScope === 'FAMILY'
                    ? 'Espacio Compartido: Finanzas Familiares del Hogar'
                    : 'Vista Consolidada 360° (Personal + Familiar)'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                activeScope === 'PERSONAL'
                  ? 'bg-sky-200/80 text-sky-900'
                  : activeScope === 'FAMILY'
                    ? 'bg-emerald-200/80 text-emerald-900'
                    : 'bg-neutral-700 text-neutral-200'
              }`}>
                {activeScope === 'PERSONAL' ? 'PRIVADO' : activeScope === 'FAMILY' ? 'FAMILIAR' : 'CONSOLIDADO'}
              </span>
            </div>
            <p className="opacity-90 mt-1 leading-relaxed text-[11px] max-w-2xl">
              {activeScope === 'PERSONAL'
                ? `Mostrando únicamente tus ${breakdown.personal.accountCount} cuentas personales, tus gastos individuales ($${breakdown.personal.monthlyExpense.toFixed(2)}), tu deuda propia ($${breakdown.personal.totalDebt.toFixed(2)}) y tus metas individuales.`
                : activeScope === 'FAMILY'
                  ? `Mostrando el patrimonio común del hogar ($${breakdown.family.liquidAssets.toFixed(2)} en ${breakdown.family.accountCount} cuentas), presupuestos conjuntos del mes y gastos compartidos de la vivienda.`
                  : `Visualizando la totalidad de tus finanzas: ${breakdown.consolidated.totalLiquidAssets.toFixed(2)} ${currency} en activos líquidos totales, integrando lo personal y lo familiar.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => db.setActiveScope(activeScope === 'PERSONAL' ? 'FAMILY' : 'PERSONAL')}
            className={`px-3 py-1.5 rounded-xl font-semibold border shadow-2xs transition-all flex items-center gap-1.5 text-xs ${
              activeScope === 'PERSONAL'
                ? 'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-100'
                : 'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            <span>Cambiar a {activeScope === 'PERSONAL' ? 'Finanzas Familiares 👨‍👩‍👧‍👦' : 'Mis Finanzas Personales 👤'}</span>
          </button>
        </div>
      </div>

      {/* TARJETA COMPARATIVA CLAVE: DESGLOSE PERSONAL VS FAMILIAR */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span>Comparativa Instantánea: Finanzas Personales vs Finanzas Familiares</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Visualiza en paralelo tu patrimonio individual frente a los fondos conjuntos del hogar
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => db.setActiveScope('PERSONAL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeScope === 'PERSONAL' ? 'bg-sky-600 text-white font-bold' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              👤 Ver Personales
            </button>
            <button
              onClick={() => db.setActiveScope('FAMILY')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeScope === 'FAMILY' ? 'bg-emerald-700 text-white font-bold' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              👨‍👩‍👧‍👦 Ver Familiares
            </button>
            <button
              onClick={() => db.setActiveScope('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeScope === 'ALL' ? 'bg-neutral-900 text-white font-bold' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              🌐 Ver Todo
            </button>
          </div>
        </div>

        {/* Columnas Side-by-Side: Personal vs Familiar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna 1: Finanzas Personales */}
          <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">
                  👤
                </span>
                <div>
                  <h3 className="font-bold text-xs text-sky-950">Mis Finanzas Personales</h3>
                  <p className="text-[10px] text-sky-700">{currentUser.name} · Cuentas privadas y autónomas</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-900">
                {symbol}{breakdown.personal.liquidAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-sky-100">
              <div>
                <span className="text-neutral-500 block">Ingresos Mes</span>
                <span className="font-mono font-semibold text-emerald-700">
                  +{symbol}{breakdown.personal.monthlyIncome.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Gastos Mes</span>
                <span className="font-mono font-semibold text-rose-700">
                  -{symbol}{breakdown.personal.monthlyExpense.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Deuda Propia</span>
                <span className="font-mono font-semibold text-neutral-800">
                  {symbol}{breakdown.personal.totalDebt.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-600 flex items-center justify-between pt-1">
              <span>{breakdown.personal.accountCount} cuentas privadas (Efectivo & Ahorros)</span>
              <button
                onClick={() => {
                  db.setActiveScope('PERSONAL');
                  onNavigate('accounts');
                }}
                className="text-sky-700 hover:text-sky-900 font-semibold"
              >
                Ver Cuentas →
              </button>
            </div>
          </div>

          {/* Columna 2: Finanzas Familiares */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">
                  👨‍👩‍👧‍👦
                </span>
                <div>
                  <h3 className="font-bold text-xs text-emerald-950">Finanzas Familiares (Hogar)</h3>
                  <p className="text-[10px] text-emerald-700">Fondo común · Gastos de la vivienda y familia</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-900">
                {symbol}{breakdown.family.liquidAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-emerald-100">
              <div>
                <span className="text-neutral-500 block">Ingresos Hogar</span>
                <span className="font-mono font-semibold text-emerald-700">
                  +{symbol}{breakdown.family.monthlyIncome.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Gastos Hogar</span>
                <span className="font-mono font-semibold text-rose-700">
                  -{symbol}{breakdown.family.monthlyExpense.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Deuda Familiar</span>
                <span className="font-mono font-semibold text-neutral-800">
                  {symbol}{breakdown.family.totalDebt.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Aportes por miembro */}
            <div className="pt-1 text-[11px] text-neutral-600 flex items-center justify-between">
              <span>Aportes: {breakdown.memberContributions.map(m => `${m.name.split(' ')[0]}: ${m.percentage}%`).join(' · ')}</span>
              <button
                onClick={() => {
                  db.setActiveScope('FAMILY');
                  onNavigate('budgets');
                }}
                className="text-emerald-800 hover:text-emerald-950 font-semibold"
              >
                Ver Presupuesto →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principales (KPIs) del Scope Activo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Patrimonio Líquido / Saldo Consolidado */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Saldos Líquidos Activos</span>
            <Wallet className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {symbol}{totalLiquidAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500 flex items-center justify-between">
            <span>{accounts.length} cuentas activas</span>
            <span className="font-semibold text-neutral-700">
              {activeScope === 'PERSONAL' ? 'Solo Privadas' : activeScope === 'FAMILY' ? 'Solo Hogar' : 'Total 360°'}
            </span>
          </div>
        </div>

        {/* KPI 2: Ingresos del Mes */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Ingresos del Mes</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            +{symbol}{monthBalance.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500">
            {activeScope === 'PERSONAL' ? 'Tus ingresos particulares' : 'Entradas de todo el hogar'}
          </div>
        </div>

        {/* KPI 3: Gastos del Mes */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Gastos del Mes</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
            -{symbol}{monthBalance.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500">
            {activeScope === 'PERSONAL' ? 'Tus egresos individuales' : 'Egresos comunes de la familia'}
          </div>
        </div>

        {/* KPI 4: Balance Neto del Mes */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Superávit / Flujo Neto</span>
            <span className="text-xs font-mono font-medium text-neutral-400">Neto</span>
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${
            monthBalance.netBalance >= 0 ? 'text-neutral-900' : 'text-rose-600'
          }`}>
            {monthBalance.netBalance >= 0 ? '+' : ''}{symbol}{monthBalance.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500">
            Ingresos menos egresos netos
          </div>
        </div>
      </div>

      {/* Fila 2: Presupuestos & Alertas & Deudas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget: Consumo de Presupuesto Mensual */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Presupuestos ({activeScope === 'PERSONAL' ? 'Personales' : activeScope === 'FAMILY' ? 'Familiares' : 'Consolidados'})
            </h2>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Gestionar →
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-500">Consumo General de Límites</span>
                <span className="font-mono font-semibold text-neutral-900">{budgetUsedPercent}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    budgetUsedPercent > 90 ? 'bg-rose-600' : budgetUsedPercent > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${budgetUsedPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-2 divide-y divide-neutral-100">
              {budgets.slice(0, 3).map(b => {
                const prog = FinancialEngine.calculateBudgetProgress(b, transactions);
                return (
                  <div key={b.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-neutral-900">{b.name}</p>
                      <span className="text-[10px] text-neutral-400 capitalize">{b.visibility.toLowerCase()}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold tabular-nums text-neutral-800">
                        {symbol}{prog.spentAmount.toFixed(0)} / {symbol}{b.limitAmount.toFixed(0)}
                      </p>
                      <span className={`text-[10px] font-mono ${prog.isExceeded ? 'text-rose-600 font-bold' : 'text-neutral-400'}`}>
                        {prog.usedPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Widget: Próximos Vencimientos */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Próximos Pagos & Cuotas
            </h2>
            <button
              onClick={() => onNavigate('debts')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Simulador →
            </button>
          </div>

          <div className="space-y-2.5">
            {[...upcomingCards, ...upcomingDebts].slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900">{item.title}</p>
                    <p className="text-[11px] text-neutral-500">{item.due}</p>
                  </div>
                </div>
                <div className="text-right font-mono font-semibold text-neutral-900">
                  {symbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget: Metas Financieras Activas */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Metas de Ahorro
            </h2>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Ver Metas →
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map(g => {
              const prog = FinancialEngine.calculateGoalProgress(g);
              return (
                <div key={g.id} className="p-2.5 bg-neutral-50 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-neutral-900">{g.name}</span>
                      <span className="text-[10px] text-neutral-400 block capitalize">{g.visibility.toLowerCase()}</span>
                    </div>
                    <span className="font-mono tabular-nums font-semibold text-emerald-700">
                      {prog.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, prog.progressPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-500">
                    <span className="font-mono tabular-nums">{symbol}{g.currentAmount.toLocaleString()} / {symbol}{g.targetAmount.toLocaleString()}</span>
                    <span>Proy: {prog.projectedCompletionMonths} meses</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fila 3: Movimientos Recientes & Alertas Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movimientos Recientes */}
        <div className="lg:col-span-2 p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                Movimientos Recientes ({activeScope === 'PERSONAL' ? 'Personales' : activeScope === 'FAMILY' ? 'Familiares' : 'Consolidados'})
              </h2>
              <div className="text-xs text-neutral-500">Últimos registros en tiempo real</div>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Historial Completo ({transactions.length}) →
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {transactions.slice(0, 5).map(tx => {
              const isIncome = tx.type === 'INCOME';
              const converted = FinancialEngine.convertCurrency(tx.amount, tx.currency, currency, tx.exchangeRateUsed).convertedAmount;
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900">{tx.description || tx.category}</p>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          tx.visibility === 'PRIVATE' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tx.visibility === 'PRIVATE' ? 'Personal' : 'Familiar'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{tx.paymentMethod.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-mono font-semibold tabular-nums ${isIncome ? 'text-emerald-700' : 'text-neutral-900'}`}>
                      {isIncome ? '+' : '-'}{symbol}{converted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Alertas y Analítica Rápida */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Alertas Activas
            </h2>
            <span className="font-mono text-xs text-neutral-500">{alerts.length} pendientes</span>
          </div>

          <div className="space-y-2.5">
            {alerts.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">Todas las cuentas operan dentro de los parámetros normales.</p>
            ) : (
              alerts.slice(0, 4).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg text-xs border ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-50/60 border-red-200 text-red-950'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                >
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-neutral-600 text-[11px] mt-0.5">{alert.message}</p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="w-full mt-2 py-2 px-3 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-center"
          >
            Ver Reportes Financieros →
          </button>
        </div>
      </div>
    </div>
  );
};
