import React, { useState } from 'react';
import { X, BookOpen, Database, Server, Shield, Terminal, CheckCircle2, Cpu } from 'lucide-react';

interface ArchitectureDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocModal: React.FC<ArchitectureDocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'DATA_MODEL' | 'API' | 'SECURITY' | 'TESTS' | 'DEVOPS'>('ANALYSIS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-neutral-900" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Documento de Arquitectura, Análisis & Especificación Técnica
              </h2>
              <p className="text-xs text-neutral-500">
                Ingeniería de Software · Plataforma de Gestión Financiera Personal y Familiar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-6 bg-neutral-50/40 text-xs overflow-x-auto gap-4">
          {[
            { key: 'ANALYSIS', label: '1. Análisis & Requisitos' },
            { key: 'DATA_MODEL', label: '2. Modelo de Datos & DER' },
            { key: 'API', label: '3. Diseño de API REST' },
            { key: 'SECURITY', label: '4. Estrategia de Seguridad' },
            { key: 'TESTS', label: '5. Estrategia de Pruebas' },
            { key: 'DEVOPS', label: '6. Despliegue & DevOps' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto text-xs space-y-4 text-neutral-800 leading-relaxed font-sans">
          {activeTab === 'ANALYSIS' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">1.1. Análisis de Requisitos & Alcance MVP</h3>
                <p>
                  La plataforma centraliza la liquidez familiar y personal resolviendo la fragmentación entre bancos, hojas de cálculo y notas aisladas. El alcance MVP incluye: ingresos, gastos, transferencias, cuentas bancarias y de efectivo, tarjetas de crédito con ciclo de corte y pago, préstamos y deudas con sistema francés y estrategias de amortización acelerada (Bola de Nieve y Avalancha), presupuestos mensuales con alertas al 80% y 100%, metas de ahorro, multi-moneda con preservación histórica, auditoría inmutable, soft delete y motor analítico sin chatbot.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">1.2. Detección de Inconsistencias y Soluciones</h3>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li><strong>Inconsistencia de tipos de cambio históricos:</strong> Si las tasas cambian, el balance del pasado no debe fluctuar. <em>Solución:</em> Cada transacción almacena <code className="font-mono">exchangeRateUsed</code> y <code className="font-mono">amountInBaseCurrency</code> congelados al momento de registrar el movimiento.</li>
                  <li><strong>Afectación diferida de movimientos programados:</strong> Un movimiento agendado para el día 15 no debe restar dinero hoy. <em>Solución:</em> Entidad <code className="font-mono">ScheduledTransaction</code> con estados (Programado / Ejecutado) que sólo genera una <code className="font-mono">Transaction</code> y altera saldo al ejecutarse.</li>
                  <li><strong>Eliminación accidental de transacciones vinculadas:</strong> Borrar una transacción que saldaba una tarjeta dejaría el cupo inconsistente. <em>Solución:</em> Soft delete con recálculo determinista en tiempo real desde el libro mayor.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">1.3. Árbol de Dependencias de Negocio</h3>
                <p>
                  Movimiento Financiero → Depende de [Cuenta de Origen, Categoría, Usuario, Moneda].<br />
                  Pago de Tarjeta → Depende de [Cuenta Debitable, Tarjeta de Crédito, Saldo Utilizado].<br />
                  Abono de Deuda → Depende de [Cuenta Debitable, Deuda, Tabla de Amortización].<br />
                  Presupuesto → Depende de [Categoría, Límite, Transacciones del periodo].
                </p>
              </div>
            </div>
          )}

          {activeTab === 'DATA_MODEL' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Modelo Entidad-Relación y Estructura Relacional</h3>
              <p>
                Estructura normalizada en 3FN con claves foráneas, restricciones de unicidad, auditoría y borrado lógico (<code className="font-mono">isDeleted: boolean</code>).
              </p>

              <div className="p-4 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
                <pre>{`[Users] (1) ──── (N) [Accounts]
   │                      │
   │ (1)                  │ (1)
   ▼                      ▼
[FamilyGroups]        [Transactions] ── (1) ── [Categories]
   │                      │
   │ (N)                  ├── (N) ── [Tags]
   ▼                      ├── (0..1) ── [CreditCards]
[FamilyMembers]           └── (0..1) ── [Debts] ── (N) ── [DebtPayments]

[Users] (1) ──── (N) [Budgets] ── (1) ── [Categories]
[Users] (1) ──── (N) [Goals] ── (N) ── [GoalContributions]
[Users] (1) ──── (N) [AuditLogs]
[Users] (1) ──── (N) [Alerts]`}</pre>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 mb-1">Entidades Principales:</h4>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li><strong>Users / FamilyGroups / FamilyMembers:</strong> Soporta RBAC (Admin, Member, Viewer) y visibilidad (Private, Shared, Family).</li>
                  <li><strong>Accounts:</strong> Efectivo, Ahorros, Corriente, Neobanco, Cooperativa, Wallets. Mantiene saldo actual sincronizado con las transacciones.</li>
                  <li><strong>CreditCards:</strong> Cupo, utilizado, disponible, fecha de corte y pago.</li>
                  <li><strong>Debts:</strong> Capital, tasa fija/variable, cuota, fecha inicio/fin, amortización francesa.</li>
                  <li><strong>Transactions:</strong> Libro mayor inmutable con tasa histórica y referencia a cuenta obligatoria.</li>
                  <li><strong>AuditLogs:</strong> Bitácora inmutable: Entidad, Usuario, Acción, Timestamp, Diff (Anterior vs Nuevo).</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'API' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Diseño de API RESTful Versionada (/api/v1)</h3>
              <p>
                API basada en estándares REST con códigos de estado HTTP semánticos (200, 201, 400, 401, 403, 404, 500), paginación por cursor o límite/offset y soporte de OpenAPI 3.0.
              </p>

              <div className="border border-neutral-200 rounded-xl overflow-hidden font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 text-neutral-700">
                    <tr>
                      <th className="p-2.5">Método</th>
                      <th className="p-2.5">Endpoint</th>
                      <th className="p-2.5">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-sans">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-emerald-700">POST</td>
                      <td className="p-2.5 font-mono">/api/v1/auth/login</td>
                      <td className="p-2.5">Autenticación local o OAuth (Google/Microsoft)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-blue-700">GET</td>
                      <td className="p-2.5 font-mono">/api/v1/transactions</td>
                      <td className="p-2.5">Listar movimientos (filtros de cuenta, tipo, fechas, paginación)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-emerald-700">POST</td>
                      <td className="p-2.5 font-mono">/api/v1/transactions</td>
                      <td className="p-2.5">Crear movimiento y afectar saldos inmediatamente</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-blue-700">GET</td>
                      <td className="p-2.5 font-mono">/api/v1/debts/strategy-comparison</td>
                      <td className="p-2.5">Comparar estrategias Snowball vs Avalanche</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-emerald-700">POST</td>
                      <td className="p-2.5 font-mono">/api/v1/debts/simulate-extra-payment</td>
                      <td className="p-2.5">Simular abonos extraordinarios (ahorro de interés/tiempo)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-rose-700">DELETE</td>
                      <td className="p-2.5 font-mono">/api/v1/transactions/:id</td>
                      <td className="p-2.5">Soft delete de movimiento hacia papelera</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-purple-700">POST</td>
                      <td className="p-2.5 font-mono">/api/v1/transactions/:id/restore</td>
                      <td className="p-2.5">Restaurar movimiento desde la papelera</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'SECURITY' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Estrategia de Seguridad & Autenticación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
                  <h4 className="font-bold text-neutral-900">Autenticación & Sesiones</h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-600">
                    <li>Contraseñas con Argon2id / bcrypt (cost factor 12).</li>
                    <li>Soporte de OAuth 2.0 (Google y Microsoft).</li>
                    <li>Tokens JWT de corta duración (15 min) + Refresh Tokens en cookies HttpOnly con flags <code className="font-mono">Secure; SameSite=Strict</code>.</li>
                    <li>MFA / 2FA vía TOTP (Google Authenticator).</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
                  <h4 className="font-bold text-neutral-900">Protección Perimetral & OWASP</h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-600">
                    <li>Protección CSRF mediante Double Submit Cookie.</li>
                    <li>Headers HTTP estrictos: CSP, HSTS, X-Content-Type-Options: nosniff.</li>
                    <li>Rate limiting en endpoints de autenticación (máx 5 intentos / 10 min).</li>
                    <li>Aislamiento estricto de datos familiares (Tenant ID enforcement en cada query).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TESTS' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Estrategia de Pruebas & Casos Críticos</h3>
              <p>
                La suite automatizada valida de extremo a extremo las fórmulas matemáticas y la integridad transaccional.
              </p>
              <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
                <h4 className="font-bold text-neutral-900">12 Pruebas Automatizadas Integradas:</h4>
                <ol className="list-decimal pl-5 space-y-1 text-neutral-600">
                  <li><strong>Balance General:</strong> Ingresos - Gastos exacto sin pérdidas de coma flotante.</li>
                  <li><strong>Saldo Cuenta:</strong> Ecuación contable completa con transferencias y ajustes.</li>
                  <li><strong>Tarjetas:</strong> Cupo utilizado, cupo disponible y porcentaje de saturación.</li>
                  <li><strong>Amortización Francesa:</strong> Cálculo exacto de cuotas con sistema de anualidad.</li>
                  <li><strong>Snowball vs Avalanche:</strong> Simulación en cascada de pagos y ahorro de intereses.</li>
                  <li><strong>Pagos Extraordinarios:</strong> Reducción de capital, meses ahorrados y nueva fecha.</li>
                  <li><strong>Presupuestos & Alertas:</strong> Disparo automático de advertencia al 80% y exceso al 100%.</li>
                  <li><strong>Metas Financieras:</strong> Avance porcentual y proyección de meses según aporte mensual.</li>
                  <li><strong>Multi-Moneda:</strong> Invarianza histórica de tasas de cambio registradas.</li>
                  <li><strong>Integración Saldo Inmediato:</strong> Transacción actualiza cuenta sin desfase.</li>
                  <li><strong>Soft Delete & Restauración:</strong> Reversión limpia de estados desde papelera.</li>
                  <li><strong>Auditoría Completa:</strong> Registro inmutable con diff estructurado de valores.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'DEVOPS' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Estrategia de Despliegue, CI/CD & Infraestructura</h3>
              <div className="space-y-3 text-neutral-600">
                <p>
                  <strong>Entornos:</strong> Desarrollo (Local Vite/Node), Staging (Preview en contenedores efímeros), Producción (Cloud Run / CDN escalable con balanceador de carga HTTPS).
                </p>
                <p>
                  <strong>Pipeline CI/CD:</strong> Linting estricto (<code className="font-mono">tsc --noEmit</code>) → Ejecución de Suite de Pruebas Financieras → Auditoría de dependencias (npm audit) → Build empaquetado (<code className="font-mono">npm run build</code>) → Despliegue blue-green sin tiempo de inactividad.
                </p>
                <p>
                  <strong>Monitoreo y Backups:</strong> Registro centralizado de auditoría, snapshots periódicos de bases de datos relacionales con retención a 30 días y recuperación ante desastres point-in-time recovery (PITR).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50/50 flex justify-between items-center text-xs text-neutral-500">
          <span>Diseño conforme a las 20 especificaciones del producto</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
