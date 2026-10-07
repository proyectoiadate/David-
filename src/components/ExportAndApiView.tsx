import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Code, 
  CheckCircle, 
  XCircle, 
  Play, 
  Download, 
  FileJson,
  Layers,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { db } from '../services/database';
import { ExportService } from '../services/exportService';
import { OPENAPI_SPEC } from '../services/openApiSpec';
import { FinancialTestSuite, TestResult } from '../services/financialTests';

export const ExportAndApiView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXPORTS' | 'OPENAPI' | 'TESTS'>('EXPORTS');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const transactions = db.getTransactions();
  const debts = db.getDebts();
  const budgets = db.getBudgets();
  const goals = db.getGoals();

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = FinancialTestSuite.runAllTests();
      setTestResults(results);
      setIsRunningTests(false);
    }, 300);
  };

  const allPassed = testResults.length > 0 && testResults.every(t => t.passed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Exportación, API OpenAPI 3.0 & Suite de Pruebas
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Exportaciones a Excel/PDF, contrato OpenAPI y validaciones críticas</span>
            <span aria-hidden="true">·</span>
            <span>Criterios de aceptación 1 a 12</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('EXPORTS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'EXPORTS' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Exportaciones
          </button>
          <button
            onClick={() => setActiveTab('OPENAPI')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'OPENAPI' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Especificación OpenAPI
          </button>
          <button
            onClick={() => setActiveTab('TESTS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'TESTS' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Suite de Pruebas ({testResults.length > 0 ? (allPassed ? '12/12 ✅' : 'Fallo') : 'Verificar'})
          </button>
        </div>
      </div>

      {activeTab === 'EXPORTS' ? (
        /* SECCIÓN EXPORTACIONES */
        <div className="space-y-4">
          <p className="text-xs text-neutral-600">
            Descarga los datos financieros en hojas de cálculo (CSV compatible con Excel, Sheets y Numbers) o genera reportes ejecutivos en PDF.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exportar Movimientos */}
            <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-semibold text-neutral-900 text-sm">Libro de Movimientos Financieros</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Incluye todos los ingresos, egresos, transferencias, monedas originales y tasas históricas de cambio.
              </p>
              <button
                onClick={() => ExportService.exportTransactionsToExcel(transactions)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Excel / CSV ({transactions.length} filas)</span>
              </button>
            </div>

            {/* Exportar Deudas */}
            <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-semibold text-neutral-900 text-sm">Registro de Deudas y Créditos</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Exporta el capital inicial, saldo vigente, cuotas mensuales, tasas de interés y plazos restantes.
              </p>
              <button
                onClick={() => ExportService.exportDebtsToExcel(debts)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Excel / CSV ({debts.length} deudas)</span>
              </button>
            </div>

            {/* Exportar Presupuestos */}
            <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-semibold text-neutral-900 text-sm">Presupuestos y Techos de Gasto</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Límites configurados, periodicidad y porcentajes de alerta por categoría.
              </p>
              <button
                onClick={() => ExportService.exportBudgetsToExcel(budgets)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Excel / CSV ({budgets.length} presupuestos)</span>
              </button>
            </div>

            {/* Exportar Metas */}
            <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-semibold text-neutral-900 text-sm">Metas Financieras y Fondos</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Objetivos de ahorro, avances porcentuales acumulados y aportes mensuales proyectados.
              </p>
              <button
                onClick={() => ExportService.exportGoalsToExcel(goals)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Excel / CSV ({goals.length} metas)</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'OPENAPI' ? (
        /* SECCIÓN OPENAPI 3.0 */
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-neutral-900 block">Contrato REST OpenAPI 3.0.3</span>
              <span className="text-neutral-500">Especificación lista para generación de SDKs y clientes tipados.</span>
            </div>
            <button
              onClick={() => {
                const json = JSON.stringify(OPENAPI_SPEC, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'openapi-finanzafamiliar.json';
                link.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar openapi.json</span>
            </button>
          </div>

          {/* Endpoints Viewer */}
          <div className="space-y-2">
            {Object.entries(OPENAPI_SPEC.paths).map(([endpoint, methods]: any) => (
              <div key={endpoint} className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2 text-xs">
                <div className="font-mono font-bold text-neutral-900 flex items-center gap-2">
                  <span className="text-neutral-500">PATH:</span>
                  <span>{endpoint}</span>
                </div>
                <div className="space-y-1.5 pl-4 border-l border-neutral-200">
                  {Object.entries(methods).map(([verb, details]: any) => (
                    <div key={verb} className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                        verb === 'get' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {verb}
                      </span>
                      <span className="text-neutral-700">{details.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SECCIÓN SUITE DE PRUEBAS AUTOMATIZADAS */
        <div className="space-y-4">
          <div className="p-5 bg-white border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Ejecutor de Pruebas Unitarias, de Integración & Casos Críticos
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Valida formalmente los 12 criterios de aceptación de la sección 20 del documento.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunningTests ? 'Ejecutando Pruebas...' : 'Ejecutar las 12 Pruebas'}</span>
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
                allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div className="flex items-center gap-2">
                  {allPassed ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
                  <span>
                    {allPassed 
                      ? '12 de 12 pruebas completadas satisfactoriamente (100% de éxito).' 
                      : 'Una o más pruebas no alcanzaron el criterio esperado.'}
                  </span>
                </div>
                <span className="font-mono text-xs">
                  Tiempo total: {testResults.reduce((sum, t) => sum + t.executionTimeMs, 0).toFixed(2)} ms
                </span>
              </div>

              {/* Lista detallada de pruebas */}
              <div className="divide-y divide-neutral-100 bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {testResults.map(test => (
                  <div key={test.id} className="p-3.5 flex items-start justify-between text-xs hover:bg-neutral-50/70">
                    <div className="flex items-start gap-3">
                      {test.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-neutral-400">{test.id}</span>
                          <span className="font-bold text-neutral-900">{test.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-neutral-100 rounded text-neutral-600 uppercase font-mono">
                            {test.category}
                          </span>
                        </div>
                        <p className="text-neutral-600 text-[11px] mt-0.5">{test.message}</p>
                      </div>
                    </div>

                    <div className="font-mono text-[11px] text-neutral-400 tabular-nums">
                      {test.executionTimeMs} ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
