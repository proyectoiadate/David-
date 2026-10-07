import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../services/database';
import { 
  TransactionType, 
  PaymentMethod, 
  VisibilityType, 
  CurrencyCode 
} from '../types/financial';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const accounts = db.getAccounts();
  const creditCards = db.getCreditCards();
  const debts = db.getDebts();
  const categories = db.getState().categories;
  const currentUser = db.getCurrentUser();
  const currentCurrency = db.getCurrentCurrency();

  // Form State
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(currentCurrency);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState<string>(accounts[1]?.id || '');
  const [creditCardId, setCreditCardId] = useState<string>('');
  const [debtId, setDebtId] = useState<string>('');
  const [category, setCategory] = useState<string>(
    categories.find(c => c.type === 'EXPENSE')?.name || 'Alimentación & Supermercado'
  );
  const [subcategory, setSubcategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DEBIT_CARD');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [visibility, setVisibility] = useState<VisibilityType>('FAMILY');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledFrequency, setScheduledFrequency] = useState<'ONCE' | 'MONTHLY'>('MONTHLY');

  const [errorMessage, setErrorMessage] = useState<string>('');

  // Cambiar categorías según tipo
  const relevantCategories = categories.filter(c => 
    type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  );

  const activeCategoryObj = categories.find(c => c.name === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (!accountId) {
      setErrorMessage('Debes seleccionar una cuenta financiera.');
      return;
    }

    if (type === 'TRANSFER' && accountId === destinationAccountId) {
      setErrorMessage('La cuenta de destino debe ser diferente a la cuenta de origen.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    if (isScheduled) {
      // Movimiento programado: NO afecta saldos hasta ejecutarse
      db.getState().scheduledTransactions.push({
        id: `sch-${Date.now()}`,
        userId: currentUser.id,
        type,
        amount: parsedAmount,
        currency,
        scheduledDate: date,
        frequency: scheduledFrequency,
        accountId,
        category,
        description: description || 'Movimiento Programado',
        status: 'SCHEDULED',
        createdAt: new Date().toISOString()
      });
      db.recordAudit('ScheduledTransaction', `sch-${Date.now()}`, 'CREATE', null, { amount: parsedAmount, category });
    } else {
      // Movimiento inmediato: AFECTA SALDOS AUTOMÁTICAMENTE
      db.createTransaction({
        userId: currentUser.id,
        familyGroupId: currentUser.familyGroupId,
        type,
        amount: parsedAmount,
        currency,
        exchangeRateUsed: 1.0,
        date,
        accountId,
        destinationAccountId: type === 'TRANSFER' ? destinationAccountId : undefined,
        creditCardId: paymentMethod === 'CREDIT_CARD' || type === 'CARD_PAYMENT' ? creditCardId || creditCards[0]?.id : undefined,
        debtId: type === 'DEBT_PAYMENT' || type === 'DEBT_RECORD' ? debtId || debts[0]?.id : undefined,
        category,
        subcategory: subcategory || undefined,
        paymentMethod,
        description: description || (type === 'INCOME' ? 'Ingreso registrado' : 'Gasto registrado'),
        notes: notes || undefined,
        tags,
        visibility,
        attachmentName: attachmentName || undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Registrar Movimiento Financiero
            </h2>
            <div className="text-xs text-neutral-500">
              Afectación inmediata de saldos y consistencia contable
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tipo de Movimiento (Segmented Tabs) */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1.5">
              Tipo de Operación *
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl">
              {[
                { key: 'EXPENSE', label: 'Gasto' },
                { key: 'INCOME', label: 'Ingreso' },
                { key: 'TRANSFER', label: 'Transferencia' },
                { key: 'CARD_PAYMENT', label: 'Pago Tarjeta' }
              ].map(item => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setType(item.key as TransactionType)}
                  className={`py-1.5 text-center font-medium rounded-lg transition-all ${
                    type === item.key
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl mt-1">
              {[
                { key: 'DEBT_PAYMENT', label: 'Pago Deuda' },
                { key: 'DEBT_RECORD', label: 'Desembolso Deuda' },
                { key: 'BALANCE_ADJUSTMENT', label: 'Ajuste Saldo' }
              ].map(item => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setType(item.key as TransactionType)}
                  className={`py-1 text-center font-medium rounded-lg transition-all text-[11px] ${
                    type === item.key
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monto y Moneda */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-medium text-neutral-700 mb-1">
                Monto *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Moneda *
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>
          </div>

          {/* Cuenta Origen y Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Cuenta {type === 'TRANSFER' ? 'Origen' : ''} *
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency} {acc.currentBalance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
              </input>
            </div>
          </div>

          {/* Si es transferencia: Cuenta Destino */}
          {type === 'TRANSFER' && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Cuenta Destino *
              </label>
              <select
                value={destinationAccountId}
                onChange={e => setDestinationAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency} {acc.currentBalance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Si es pago de tarjeta o método es tarjeta */}
          {(type === 'CARD_PAYMENT' || paymentMethod === 'CREDIT_CARD') && creditCards.length > 0 && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Tarjeta de Crédito Vinculada
              </label>
              <select
                value={creditCardId}
                onChange={e => setCreditCardId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {creditCards.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.issuer}) - Utilizado: ${c.usedAmount.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Si es pago de deuda */}
          {(type === 'DEBT_PAYMENT' || type === 'DEBT_RECORD') && debts.length > 0 && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Deuda / Préstamo Vinculado
              </label>
              <select
                value={debtId}
                onChange={e => setDebtId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {debts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.creditor}) - Saldo: ${d.currentBalance.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categoría y Subcategoría */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {relevantCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({cat.scope})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Subcategoría
              </label>
              <select
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">(Sin subcategoría)</option>
                {activeCategoryObj?.subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Método de Pago y Visibilidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Método de Pago *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="DEBIT_CARD">Tarjeta Débito</option>
                <option value="CREDIT_CARD">Tarjeta Crédito</option>
                <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                <option value="CASH">Efectivo</option>
                <option value="WALLET_APP">Billetera Digital</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Ámbito / Visibilidad *
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVisibility('PRIVATE')}
                  className={`py-1.5 px-2 text-center rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                    visibility === 'PRIVATE'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span>👤 Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('FAMILY')}
                  className={`py-1.5 px-2 text-center rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                    visibility === 'FAMILY' || visibility === 'SHARED'
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span>👨‍👩‍👧‍👦 Familiar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Descripción / Concepto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Supermercado mensual, Pago de nómina, Gasolina"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Etiquetas y Comprobante */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                placeholder="fijo, hogar, imprevisto"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Comprobante / Adjunto (Opcional)
              </label>
              <input
                type="text"
                placeholder="factura_1024.pdf"
                value={attachmentName}
                onChange={e => setAttachmentName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Notas Adicionales */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Notas Opcionales
            </label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales del movimiento..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>

          {/* Toggle: Movimiento Programado */}
          <div className="pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={e => setIsScheduled(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-medium text-neutral-800">
                Guardar como Movimiento Programado (No afecta saldos hasta su ejecución)
              </span>
            </label>

            {isScheduled && (
              <div className="mt-2 pl-6">
                <label className="block font-medium text-neutral-600 mb-1">Frecuencia</label>
                <select
                  value={scheduledFrequency}
                  onChange={e => setScheduledFrequency(e.target.value as any)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                >
                  <option value="ONCE">Una sola vez en la fecha</option>
                  <option value="MONTHLY">Recurrente Mensual</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              Confirmar & Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
