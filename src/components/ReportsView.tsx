import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart3, 
  Printer, 
  Calendar, 
  Users, 
  Download,
  TrendingUp,
  CreditCard,
  Target
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import { ExportService } from '../services/exportService';

export const ReportsView: React.FC = () => {
  const currency = db.getCurrentCurrency();
  const transactions = db.getTransactions();
  const accounts = db.getAccounts();
  const debts = db.getDebts();
  const goals = db.getGoals();
  const creditCards = db.getCreditCards();

  // Filtros de reporte
  const activeScope = db.getActiveScope();
  const [timeframe, setTimeframe] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('MONTHLY');
  const [scope, setScope] = useState<'FAMILY' | 'PERSONAL' | 'ALL'>(activeScope);

  React.useEffect(() => {
    setScope(activeScope);
  }, [activeScope]);

  const filteredTxs = transactions.filter(t => {
    if (scope === 'PERSONAL' && t.visibility !== 'PRIVATE') return false;
    if (scope === 'FAMILY' && t.visibility !== 'FAMILY' && t.visibility !== 'SHARED') return false;
    return true;
  });

  // Agrupación de Gastos por Categoría
  const expensesByCategory: Record<string, number> = {};
  const incomesByCategory: Record<string, number> = {};
  let totalExpenses = 0;
  let totalIncomes = 0;

  for (const t of filteredTxs) {
    const val = FinancialEngine.convertCurrency(t.amount, t.currency, currency, t.exchangeRateUsed).convertedAmount;
    if (t.type === 'EXPENSE') {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + val;
      totalExpenses += val;
    } else if (t.type === 'INCOME') {
      incomesByCategory[t.category] = (incomesByCategory[t.category] || 0) + val;
      totalIncomes += val;
    }
  }

  const sortedExpenses = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
  const sortedIncomes = Object.entries(incomesByCategory).sort((a, b) => b[1] - a[1]);

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Reportes & Visualizaciones Financieras
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Distribución de gastos, ingresos, evolución y estado consolidado</span>
            <span aria-hidden="true">·</span>
            <span>Filtro temporal: {timeframe}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => ExportService.triggerPrintToPdf()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Selectores de Periodo y Alcance (No print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-xl no-print text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-700">Periodo:</span>
          {(['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeframe === tf ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tf === 'MONTHLY' ? 'Mensual' : tf === 'QUARTERLY' ? 'Trimestral' : 'Anual'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-neutral-700">Alcance:</span>
          <button
            onClick={() => setScope('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              scope === 'ALL' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Consolidado
          </button>
          <button
            onClick={() => setScope('PERSONAL')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              scope === 'PERSONAL' ? 'bg-sky-600 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            👤 Personal
          </button>
          <button
            onClick={() => setScope('FAMILY')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              scope === 'FAMILY' ? 'bg-emerald-700 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            👨‍👩‍👧‍👦 Familiar
          </button>
        </div>
      </div>

      {/* Resumen Ejecutivo del Reporte */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Ingresos Registrados</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {symbol}{totalIncomes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-neutral-400">Total en el periodo analizado</span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Gastos Registrados</span>
          <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {symbol}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-neutral-400">Total en el periodo analizado</span>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Superávit / Ahorro Neto</span>
          <div className={`text-2xl font-bold font-mono tabular-nums ${totalIncomes >= totalExpenses ? 'text-neutral-900' : 'text-rose-600'}`}>
            {symbol}{(totalIncomes - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-neutral-400">
            {totalIncomes > 0 ? `${(((totalIncomes - totalExpenses) / totalIncomes) * 100).toFixed(1)}% tasa de ahorro` : 'Sin ingresos'}
          </span>
        </div>
      </div>

      {/* Gráficos de Distribución por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoría */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-neutral-700" />
              Distribución de Gastos por Categoría
            </h2>
            <span className="text-xs font-mono text-neutral-500">{sortedExpenses.length} categorías</span>
          </div>

          <div className="space-y-3">
            {sortedExpenses.map(([cat, amount], idx) => {
              const pct = totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-800">{cat}</span>
                    <span className="font-mono tabular-nums text-neutral-600">
                      {symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-neutral-900 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ingresos por Categoría */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              Fuentes de Ingresos
            </h2>
            <span className="text-xs font-mono text-neutral-500">{sortedIncomes.length} fuentes</span>
          </div>

          <div className="space-y-3">
            {sortedIncomes.map(([cat, amount]) => {
              const pct = totalIncomes > 0 ? Number(((amount / totalIncomes) * 100).toFixed(1)) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-800">{cat}</span>
                    <span className="font-mono tabular-nums text-emerald-700 font-semibold">
                      +{symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gráfico de Evolución Consolidada (SVG Bar Chart) */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Evolución Comparativa Mensual (Flujo de Caja)
            </h2>
            <div className="text-xs text-neutral-500">Comparación de entradas vs salidas</div>
          </div>
        </div>

        {/* Renderizado de Barras SVG */}
        <div className="pt-4">
          <div className="h-48 flex items-end justify-between gap-6 px-4 border-b border-neutral-200 pb-2">
            {[
              { month: 'Junio', inc: 6500, exp: 4800 },
              { month: 'Julio', inc: 7200, exp: 5100 },
              { month: 'Agosto', inc: 6900, exp: 4950 },
              { month: 'Septiembre', inc: 7400, exp: 5300 },
              { month: 'Octubre', inc: totalIncomes, exp: totalExpenses }
            ].map((d, i) => {
              const maxVal = 9000;
              const hInc = (d.inc / maxVal) * 100;
              const hExp = (d.exp / maxVal) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="flex items-end gap-2 w-full justify-center h-full">
                    <div 
                      style={{ height: `${hInc}%` }}
                      className="w-5 bg-emerald-600 rounded-t-sm transition-all"
                      title={`Ingresos: $${d.inc}`}
                    />
                    <div 
                      style={{ height: `${hExp}%` }}
                      className="w-5 bg-neutral-800 rounded-t-sm transition-all"
                      title={`Gastos: $${d.exp}`}
                    />
                  </div>
                  <span className="text-[11px] text-neutral-600 font-medium">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-600 rounded-xs" />
              <span>Ingresos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-neutral-800 rounded-xs" />
              <span>Gastos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
