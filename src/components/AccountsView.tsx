import React, { useState } from 'react';
import { 
  Landmark, 
  CreditCard as CardIcon, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Percent, 
  CheckCircle,
  Trash2
} from 'lucide-react';
import { db } from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import { AccountType, CurrencyCode, VisibilityType } from '../types/financial';

export const AccountsView: React.FC = () => {
  const currency = db.getCurrentCurrency();
  const allAccounts = db.getAccounts();
  const allCreditCards = db.getCreditCards();
  const transactions = db.getTransactions();
  const currentUser = db.getCurrentUser();
  const activeScope = db.getActiveScope();

  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PERSONAL' | 'FAMILY'>(activeScope);

  React.useEffect(() => {
    setScopeFilter(activeScope);
  }, [activeScope]);

  const personalAccounts = allAccounts.filter(a => a.visibility === 'PRIVATE' || (a.userId === currentUser.id && a.visibility !== 'FAMILY'));
  const familyAccounts = allAccounts.filter(a => a.visibility === 'FAMILY' || a.visibility === 'SHARED');
  const personalTotal = personalAccounts.reduce((sum, a) => sum + FinancialEngine.convertCurrency(a.currentBalance, a.currency, currency).convertedAmount, 0);
  const familyTotal = familyAccounts.reduce((sum, a) => sum + FinancialEngine.convertCurrency(a.currentBalance, a.currency, currency).convertedAmount, 0);

  const accounts = allAccounts.filter(a => {
    if (scopeFilter === 'PERSONAL') return a.visibility === 'PRIVATE' || (a.userId === currentUser.id && a.visibility !== 'FAMILY');
    if (scopeFilter === 'FAMILY') return a.visibility === 'FAMILY' || a.visibility === 'SHARED';
    return true;
  });

  const creditCards = allCreditCards.filter(c => {
    if (scopeFilter === 'PERSONAL') return c.visibility === 'PRIVATE';
    if (scopeFilter === 'FAMILY') return c.visibility === 'FAMILY' || c.visibility === 'SHARED';
    return true;
  });

  // Modal Crear Cuenta
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('CHECKING');
  const [newAccInst, setNewAccInst] = useState('');
  const [newAccCurr, setNewAccCurr] = useState<CurrencyCode>('USD');
  const [newAccInitBal, setNewAccInitBal] = useState('0');
  const [newAccLowThreshold, setNewAccLowThreshold] = useState('200');
  const [newAccVisibility, setNewAccVisibility] = useState<VisibilityType>(activeScope === 'PERSONAL' ? 'PRIVATE' : 'FAMILY');

  // Modal Crear Tarjeta
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardIssuer, setNewCardIssuer] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('3000');
  const [newCardClosing, setNewCardClosing] = useState('15');
  const [newCardDue, setNewCardDue] = useState('5');
  const [newCardRate, setNewCardRate] = useState('22.5');
  const [newCardAccountId, setNewCardAccountId] = useState(allAccounts[0]?.id || '');
  const [newCardVisibility, setNewCardVisibility] = useState<VisibilityType>(activeScope === 'PERSONAL' ? 'PRIVATE' : 'FAMILY');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const initBal = parseFloat(newAccInitBal) || 0;
    const threshold = parseFloat(newAccLowThreshold) || 100;

    db.createAccount({
      userId: currentUser.id,
      familyGroupId: currentUser.familyGroupId,
      name: newAccName,
      type: newAccType,
      institutionName: newAccInst || 'Entidad Financiera',
      currency: newAccCurr,
      initialBalance: initBal,
      visibility: newAccVisibility,
      lowBalanceThreshold: threshold
    });

    setShowNewAccountModal(false);
    setNewAccName('');
    setNewAccInitBal('0');
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(newCardLimit) || 1000;
    const closing = parseInt(newCardClosing) || 15;
    const due = parseInt(newCardDue) || 5;
    const rate = parseFloat(newCardRate) || 20;

    db.createCreditCard({
      userId: currentUser.id,
      familyGroupId: currentUser.familyGroupId,
      accountId: newCardAccountId || allAccounts[0]?.id,
      name: newCardName,
      issuer: newCardIssuer || 'Emisor',
      currency: 'USD',
      creditLimit: limit,
      closingDay: closing,
      dueDay: due,
      interestRateAnnual: rate,
      status: 'ACTIVE',
      cardMasked: '**** ' + Math.floor(1000 + Math.random() * 9000),
      visibility: newCardVisibility
    });

    setShowNewCardModal(false);
    setNewCardName('');
  };

  const symbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Cuentas Financieras & Tarjetas de Crédito
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>Gestión de liquidez y líneas de crédito</span>
            <span aria-hidden="true">·</span>
            <span>Regla contable: cada movimiento afecta obligatoriamente una cuenta</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewAccountModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors shadow-2xs"
          >
            + Nueva Cuenta
          </button>
          <button
            onClick={() => setShowNewCardModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            + Nueva Tarjeta
          </button>
        </div>
      </div>

      {/* Scope Filter Switcher with Personal vs Family Subtotals */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white border border-neutral-200 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="font-semibold text-neutral-700">Ámbito:</span>
          <div className="inline-flex p-1 bg-neutral-100 rounded-xl">
            <button
              onClick={() => setScopeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scopeFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Todas ({allAccounts.length})
            </button>
            <button
              onClick={() => setScopeFilter('PERSONAL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scopeFilter === 'PERSONAL' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              👤 Cuentas Personales ({personalAccounts.length})
            </button>
            <button
              onClick={() => setScopeFilter('FAMILY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scopeFilter === 'FAMILY' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              👨‍👩‍👧‍👦 Cuentas Familiares ({familyAccounts.length})
            </button>
          </div>
        </div>

        {/* Subtotales Desglosados */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block font-sans">Total Personal</span>
            <span className="font-bold text-sky-800">{symbol}{personalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="h-6 w-px bg-neutral-200" />
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block font-sans">Total Familiar</span>
            <span className="font-bold text-emerald-800">{symbol}{familyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Sección 1: Cuentas Financieras */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Cuentas de Depósito y Efectivo ({accounts.length})
          </h2>
          <span className="text-xs text-neutral-500">
            Ahorros, corrientes, billeteras, neobancos y efectivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const isLowBalance = acc.currentBalance <= acc.lowBalanceThreshold;
            const converted = FinancialEngine.convertCurrency(acc.currentBalance, acc.currency, currency).convertedAmount;

            return (
              <div 
                key={acc.id} 
                className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 hover:border-neutral-300 transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">{acc.name}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                      <span>{acc.institutionName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{acc.type.toLowerCase()}</span>
                      {acc.accountNumberMasked && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{acc.accountNumberMasked}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        acc.visibility === 'PRIVATE' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {acc.visibility === 'PRIVATE' ? '👤 Cuenta Personal' : '👨‍👩‍👧‍👦 Cuenta Familiar'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => db.deleteAccount(acc.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1"
                    title="Eliminar cuenta a papelera"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Saldo de la cuenta */}
                <div>
                  <div className="text-xs text-neutral-500">Saldo Actual</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                    {acc.currency} {acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  {acc.currency !== currency && (
                    <div className="text-xs text-neutral-400 font-mono tabular-nums">
                      ≈ {symbol}{converted.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                    </div>
                  )}
                </div>

                {/* Advertencia de Bajo Saldo */}
                {isLowBalance && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Saldo por debajo del umbral mínimo ({acc.currency} {acc.lowBalanceThreshold})</span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="capitalize">{acc.visibility.toLowerCase()}</span>
                  <span>Saldo inicial: {acc.currency} {acc.initialBalance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección 2: Tarjetas de Crédito */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Tarjetas de Crédito ({creditCards.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Cupo total, utilizado, disponible, fechas de corte y fechas de pago
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creditCards.map(card => {
            const usage = FinancialEngine.recalculateCreditCardUsage(card, transactions);
            const settlementAccount = accounts.find(a => a.id === card.accountId);

            return (
              <div 
                key={card.id} 
                className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm">{card.name}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span>{card.issuer}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{card.cardMasked}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium">Activa</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          card.visibility === 'PRIVATE' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {card.visibility === 'PRIVATE' ? '👤 Tarjeta Personal' : '👨‍👩‍👧‍👦 Tarjeta Familiar'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => db.deleteCreditCard(card.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1"
                    title="Eliminar tarjeta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Métricas de Cupo */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">Cupo Utilizado</span>
                    <span className="font-mono font-bold text-neutral-900 text-lg tabular-nums">
                      ${usage.usedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        usage.utilizationPercent > 70 
                          ? 'bg-rose-600' 
                          : usage.utilizationPercent > 40 
                          ? 'bg-amber-500' 
                          : 'bg-neutral-900'
                      }`}
                      style={{ width: `${Math.min(100, usage.utilizationPercent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Disponible: ${usage.availableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span>Límite: ${card.creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({usage.utilizationPercent}%)</span>
                  </div>
                </div>

                {/* Datos de Ciclo y Facturación */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-50 rounded-lg text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Día de Corte</span>
                    <span className="font-semibold text-neutral-900">Día {card.closingDay}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Día de Pago</span>
                    <span className="font-semibold text-neutral-900">Día {card.dueDay}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Tasa Anual</span>
                    <span className="font-semibold text-neutral-900">{card.interestRateAnnual}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex justify-between">
                  <span>Cuenta débito vinculada: {settlementAccount?.name || 'General'}</span>
                  <span className="capitalize">{card.visibility.toLowerCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Crear Cuenta */}
      {showNewAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Nueva Cuenta Financiera</h3>
            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Nombre de la Cuenta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cuenta de Ahorros Principal"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Tipo de Cuenta *</label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="CHECKING">Corriente</option>
                    <option value="SAVINGS">Ahorros</option>
                    <option value="CASH">Efectivo</option>
                    <option value="WALLET">Billetera Digital</option>
                    <option value="NEOBANK">Neobanco</option>
                    <option value="COOPERATIVE">Cooperativa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Moneda *</label>
                  <select
                    value={newAccCurr}
                    onChange={e => setNewAccCurr(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Entidad Bancaria</label>
                <input
                  type="text"
                  placeholder="Ej. Chase, Santander, N26"
                  value={newAccInst}
                  onChange={e => setNewAccInst(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Saldo Inicial *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAccInitBal}
                    onChange={e => setNewAccInitBal(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Alerta Saldo Mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccLowThreshold}
                    onChange={e => setNewAccLowThreshold(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAccountModal(false)}
                  className="px-3 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-medium"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Tarjeta */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Nueva Tarjeta de Crédito</h3>
            <form onSubmit={handleCreateCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Nombre Comercial de la Tarjeta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Platinum Rewards"
                  value={newCardName}
                  onChange={e => setNewCardName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Emisor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Visa, Mastercard, Amex"
                    value={newCardIssuer}
                    onChange={e => setNewCardIssuer(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Cupo Total (Límite) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCardLimit}
                    onChange={e => setNewCardLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium mb-1">Día Corte (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newCardClosing}
                    onChange={e => setNewCardClosing(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Día Pago (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newCardDue}
                    onChange={e => setNewCardDue(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Tasa Anual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCardRate}
                    onChange={e => setNewCardRate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="px-3 py-1.5 text-neutral-700 bg-neutral-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white bg-neutral-900 rounded-lg font-medium"
                >
                  Guardar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
