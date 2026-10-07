import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  Sliders, 
  TrendingUp, 
  Flame, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';

export const AnalyticsView: React.FC = () => {
  const currency = db.getCurrentCurrency();
  const transactions = db.getTransactions();
  const budgets = db.getBudgets();
  const debts = db.getDebts();
  const goals = db.getGoals();

  // Escenario What-If interactivo
  const [cutDiningPercent, setCutDiningPercent] = useState<number>(20);
  const [extraDebtAporte, setExtraDebtAporte] = useState<number>(150);

  const insights = FinancialEngine.runAnalyticsEngine(
    transactions,
    budgets,
    debts,
    goals,
    currency
  );

  // Cálculos dinámicos para el simulador What-If
  const diningExpenses = transactions
    .filter(t => !t.isDeleted && t.type === 'EXPENSE' && (t.category.toLowerCase().includes('aliment') || t.category.toLowerCase().includes('ocio')))
    .reduce((sum, t) => sum + FinancialEngine.convertCurrency(t.amount, t.currency, currency).convertedAmount, 0);

  const annualSavingsFromCut = Number(((diningExpenses * (cutDiningPercent / 100)) * 12).toFixed(2));

  const debtComparison = FinancialEngine.compareDebtStrategies(debts, extraDebtAporte);

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-neutral-200">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neutral-900" />
          Motor Analítico Financiero (IA Analítica MVP)
        </h1>
        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
          <span>Detección algorítmica de patrones y optimización heurística</span>
          <span aria-hidden="true">·</span>
          <span>Sin chatbot conversacional · Motor analítico estructurado</span>
          <span aria-hidden="true">·</span>
          <span>{insights.length} hallazgos activos</span>
        </div>
      </div>

      {/* Grid de Hallazgos y Sugerencias de Optimización */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">
          Diagnóstico y Recomendaciones Automáticas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map(item => (
            <div 
              key={item.id} 
              className={`p-5 rounded-xl border text-xs space-y-3 transition-all ${
                item.severity === 'WARNING'
                  ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                  : item.severity === 'OPPORTUNITY'
                  ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                  : 'bg-white border-neutral-200 text-neutral-900 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {item.severity === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : item.severity === 'OPPORTUNITY' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-neutral-600 shrink-0" />
                  )}
                  <h3 className="font-bold text-sm text-neutral-900">{item.title}</h3>
                </div>

                {item.potentialMonthlySavings && (
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-neutral-200 text-emerald-700 shadow-2xs">
                    +{symbol}{item.potentialMonthlySavings.toFixed(0)}/mes
                  </span>
                )}
              </div>

              <p className="text-neutral-600 leading-relaxed">
                {item.description}
              </p>

              <div className="p-3 bg-white/80 rounded-lg border border-neutral-200/60">
                <span className="font-semibold text-neutral-800 block mb-0.5">Acción Recomendada:</span>
                <span className="text-neutral-700">{item.suggestedAction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN CRÍTICA: Laboratorio de Escenarios Hipotéticos (What-If Analysis) */}
      <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-6 shadow-2xs">
        <div className="pb-3 border-b border-neutral-200">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-neutral-900" />
            Laboratorio de Escenarios Hipotéticos (What-If)
          </h2>
          <p className="text-xs text-neutral-500">
            Modela el impacto a mediano y largo plazo de ajustar comportamientos financieros y gastos no esenciales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Escenario 1: Reducción en Salidas y Alimentación Discrecional */}
          <div className="p-5 bg-neutral-50 rounded-xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 text-sm">Escenario A: Ajuste de Gastos Discrecionales</h3>
              <span className="font-mono text-xs font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                {cutDiningPercent}% de recorte
              </span>
            </div>

            <p className="text-neutral-600">
              Gasto actual detectado en ocio y restaurantes: <span className="font-mono font-semibold">{symbol}{diningExpenses.toFixed(2)}</span>.
            </p>

            <div className="space-y-1">
              <label className="text-neutral-500">Porcentaje de optimización deseado:</label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={cutDiningPercent}
                onChange={e => setCutDiningPercent(parseInt(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-neutral-600 font-sans">Ahorro mensual generado:</span>
                <span className="font-bold text-emerald-700">+{symbol}{(diningExpenses * (cutDiningPercent / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-neutral-600 font-sans">Capital acumulado en 1 año:</span>
                <span className="font-bold text-emerald-700">+{symbol}{annualSavingsFromCut.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Escenario 2: Asignación de Excedentes a Deudas */}
          <div className="p-5 bg-neutral-50 rounded-xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 text-sm">Escenario B: Acelerador de Desendeudamiento</h3>
              <span className="font-mono text-xs font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                +{symbol}{extraDebtAporte}/mes extra
              </span>
            </div>

            <p className="text-neutral-600">
              Inyectar excedentes directamente al método Avalancha.
            </p>

            <div className="space-y-1">
              <label className="text-neutral-500">Abono extraordinario mensual simulado:</label>
              <input
                type="range"
                min="50"
                max="600"
                step="50"
                value={extraDebtAporte}
                onChange={e => setExtraDebtAporte(parseInt(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-neutral-600 font-sans">Ahorro en intereses totales:</span>
                <span className="font-bold text-emerald-700">+{symbol}{debtComparison.avalanche.interestSavedComparedToStandard.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-neutral-600 font-sans">Reducción del plazo global:</span>
                <span className="font-bold text-neutral-900">{debtComparison.avalanche.monthsSavedComparedToStandard} meses antes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
