/**
 * Financial Engine
 * Cálculos financieros exactos, amortizaciones, simulaciones de deuda
 * (Snowball vs Avalanche, pagos extraordinarios), presupuestos, metas,
 * multi-moneda y motor analítico predictivo sin chatbot.
 */

import {
  Account,
  CreditCard,
  Debt,
  DebtPayoffStrategy,
  Goal,
  Budget,
  Transaction,
  DebtStrategyResult,
  DebtExtraPaymentSimulation,
  AmortizationRow,
  FinancialAnalyticsInsight,
  CurrencyCode
} from '../types/financial';

// Tipos de cambio fijos de referencia frente a USD (actualizables)
export const EXCHANGE_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 1.09, // 1 EUR = 1.09 USD
  COP: 0.000244 // 1 COP = 0.000244 USD (aprox 4100 COP/USD)
};

export class FinancialEngine {
  /**
   * Convierte un monto entre cualquier par de monedas soportadas
   */
  static convertCurrency(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    customRate?: number
  ): { convertedAmount: number; rateUsed: number } {
    if (from === to) {
      return { convertedAmount: amount, rateUsed: 1.0 };
    }

    if (customRate && customRate > 0) {
      return { convertedAmount: Number((amount * customRate).toFixed(2)), rateUsed: customRate };
    }

    // Conversión a través de USD como pivote
    const fromToUsd = EXCHANGE_RATES_TO_USD[from];
    const toToUsd = EXCHANGE_RATES_TO_USD[to];
    const rateUsed = fromToUsd / toToUsd;
    const convertedAmount = Number((amount * rateUsed).toFixed(2));

    return { convertedAmount, rateUsed: Number(rateUsed.toFixed(6)) };
  }

  /**
   * Balance General = Ingresos - Gastos
   */
  static calculateGeneralBalance(transactions: Transaction[], baseCurrency: CurrencyCode = 'USD'): {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
  } {
    const active = transactions.filter(t => !t.isDeleted);
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of active) {
      const converted = this.convertCurrency(t.amount, t.currency, baseCurrency, t.exchangeRateUsed).convertedAmount;
      if (t.type === 'INCOME') {
        totalIncome += converted;
      } else if (t.type === 'EXPENSE') {
        totalExpense += converted;
      }
    }

    return {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      netBalance: Number((totalIncome - totalExpense).toFixed(2))
    };
  }

  /**
   * Saldo Cuenta =
   * Ingresos + Transferencias Recibidas - Gastos - Transferencias Enviadas - Pagos ± Ajustes
   */
  static recalculateAccountBalance(account: Account, transactions: Transaction[]): number {
    let balance = account.initialBalance;
    const relevant = transactions.filter(t => !t.isDeleted);

    for (const t of relevant) {
      // Ajuste si la transacción es en otra moneda
      const amountInAccountCurrency = this.convertCurrency(t.amount, t.currency, account.currency, t.exchangeRateUsed).convertedAmount;

      if (t.accountId === account.id) {
        switch (t.type) {
          case 'INCOME':
            balance += amountInAccountCurrency;
            break;
          case 'EXPENSE':
            balance -= amountInAccountCurrency;
            break;
          case 'TRANSFER':
            balance -= amountInAccountCurrency; // Enviada
            break;
          case 'CARD_PAYMENT':
            balance -= amountInAccountCurrency; // Pago de tarjeta desde esta cuenta
            break;
          case 'DEBT_PAYMENT':
            balance -= amountInAccountCurrency; // Pago de deuda desde esta cuenta
            break;
          case 'DEBT_RECORD':
            balance += amountInAccountCurrency; // Desembolso de préstamo en la cuenta
            break;
          case 'BALANCE_ADJUSTMENT':
            balance += amountInAccountCurrency; // Puede ser positivo o negativo
            break;
        }
      }

      // Transferencia recibida en esta cuenta de destino
      if (t.destinationAccountId === account.id && t.type === 'TRANSFER') {
        balance += amountInAccountCurrency;
      }
    }

    return Number(balance.toFixed(2));
  }

  /**
   * Recalcula el saldo utilizado y cupo disponible de una tarjeta de crédito
   */
  static recalculateCreditCardUsage(
    card: CreditCard,
    transactions: Transaction[]
  ): { usedAmount: number; availableAmount: number; utilizationPercent: number } {
    const cardTxs = transactions.filter(t => !t.isDeleted && t.creditCardId === card.id);
    let used = 0;

    for (const t of cardTxs) {
      const amountInCardCurrency = this.convertCurrency(t.amount, t.currency, card.currency, t.exchangeRateUsed).convertedAmount;
      if (t.type === 'EXPENSE') {
        // Compra incrementa saldo utilizado
        used += amountInCardCurrency;
      } else if (t.type === 'CARD_PAYMENT') {
        // Pago reduce saldo utilizado
        used -= amountInCardCurrency;
      }
    }

    // No permitir valores negativos por redondeo o sobrepagos sin reflejo
    used = Math.max(0, Number(used.toFixed(2)));
    const available = Math.max(0, Number((card.creditLimit - used).toFixed(2)));
    const utilizationPercent = card.creditLimit > 0 ? Number(((used / card.creditLimit) * 100).toFixed(1)) : 0;

    return {
      usedAmount: used,
      availableAmount: available,
      utilizationPercent
    };
  }

  /**
   * Calcula la cuota mensual fija (sistema francés / anualidad)
   * PMT = P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
   */
  static calculateMonthlyInstallment(principal: number, annualRatePercent: number, totalMonths: number): number {
    if (principal <= 0 || totalMonths <= 0) return 0;
    const monthlyRate = (annualRatePercent / 100) / 12;
    if (monthlyRate === 0) {
      return Number((principal / totalMonths).toFixed(2));
    }

    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
    return Number(monthlyPayment.toFixed(2));
  }

  /**
   * Genera la tabla de amortización para una deuda
   */
  static generateAmortizationSchedule(debt: Debt, extraMonthlyPayment = 0): AmortizationRow[] {
    const rows: AmortizationRow[] = [];
    let balance = debt.currentBalance;
    const monthlyRate = (debt.annualInterestRate / 100) / 12;
    const basePayment = debt.monthlyInstallment || this.calculateMonthlyInstallment(debt.initialCapital, debt.annualInterestRate, debt.totalInstallments);
    const payment = basePayment + extraMonthlyPayment;

    let installmentNum = 1;
    let currentDate = new Date(debt.startDate);

    while (balance > 0.01 && installmentNum <= 360) {
      const interest = Number((balance * monthlyRate).toFixed(2));
      let principal = Number((payment - interest).toFixed(2));

      if (principal > balance) {
        principal = balance;
      }

      balance = Number((balance - principal).toFixed(2));

      // Incrementar un mes
      currentDate.setMonth(currentDate.getMonth() + 1);
      const dueDate = currentDate.toISOString().split('T')[0];

      rows.push({
        installmentNumber: installmentNum,
        dueDate,
        payment: Number((principal + interest).toFixed(2)),
        principal,
        interest,
        remainingBalance: Math.max(0, balance)
      });

      if (balance <= 0) break;
      installmentNum++;
    }

    return rows;
  }

  /**
   * Simular pagos extraordinarios en una deuda:
   * Calcula intereses ahorrados, tiempo ahorrado y nueva fecha de pago
   */
  static simulateExtraPayment(
    debt: Debt,
    oneTimeExtraPayment: number = 0,
    monthlyExtraPayment: number = 0
  ): DebtExtraPaymentSimulation {
    // Escenario Base
    const baseSchedule = this.generateAmortizationSchedule(debt, 0);
    const originalTotalInterest = Number(baseSchedule.reduce((sum, r) => sum + r.interest, 0).toFixed(2));
    const originalPayoffDate = baseSchedule.length > 0 ? baseSchedule[baseSchedule.length - 1].dueDate : debt.endDate;

    // Escenario Simulado (con abono inicial extraordinario + incremento mensual)
    const simulatedDebt: Debt = {
      ...debt,
      currentBalance: Math.max(0, debt.currentBalance - oneTimeExtraPayment)
    };

    const simulatedSchedule = this.generateAmortizationSchedule(simulatedDebt, monthlyExtraPayment);
    const simulatedTotalInterest = Number(simulatedSchedule.reduce((sum, r) => sum + r.interest, 0).toFixed(2));
    const newPayoffDate = simulatedSchedule.length > 0 ? simulatedSchedule[simulatedSchedule.length - 1].dueDate : debt.endDate;

    const interestSaved = Math.max(0, Number((originalTotalInterest - simulatedTotalInterest).toFixed(2)));
    const monthsSaved = Math.max(0, baseSchedule.length - simulatedSchedule.length);

    return {
      originalTotalInterest,
      simulatedTotalInterest,
      interestSaved,
      originalPayoffDate,
      newPayoffDate,
      monthsSaved,
      monthlyExtraPayment,
      oneTimeExtraPayment
    };
  }

  /**
   * Simulación y Comparación de Estrategias de Deuda:
   * - Snowball: Pagar primero la deuda con menor saldo (rápida victoria psicológica)
   * - Avalanche: Pagar primero la deuda con mayor tasa de interés (máximo ahorro financiero)
   */
  static compareDebtStrategies(debts: Debt[], extraMonthlyBudget = 300): {
    snowball: DebtStrategyResult;
    avalanche: DebtStrategyResult;
    recommendation: {
      preferredStrategy: DebtPayoffStrategy;
      reason: string;
      differenceInterestSaved: number;
    };
  } {
    const activeDebts = debts.filter(d => !d.isDeleted && d.currentBalance > 0);

    if (activeDebts.length === 0) {
      const emptyResult: DebtStrategyResult = {
        strategy: 'AVALANCHE',
        totalPaid: 0,
        totalInterestPaid: 0,
        totalMonths: 0,
        payoffDate: new Date().toISOString().split('T')[0],
        interestSavedComparedToStandard: 0,
        monthsSavedComparedToStandard: 0,
        orderOfDebts: []
      };
      return {
        snowball: { ...emptyResult, strategy: 'SNOWBALL' },
        avalanche: emptyResult,
        recommendation: {
          preferredStrategy: 'AVALANCHE',
          reason: 'No hay deudas activas registradas.',
          differenceInterestSaved: 0
        }
      };
    }

    // 1. Simulación estándar (sin presupuesto extra)
    let standardTotalInterest = 0;
    let standardMaxMonths = 0;
    for (const d of activeDebts) {
      const schedule = this.generateAmortizationSchedule(d, 0);
      standardTotalInterest += schedule.reduce((sum, r) => sum + r.interest, 0);
      standardMaxMonths = Math.max(standardMaxMonths, schedule.length);
    }

    // 2. Snowball (Orden por saldo menor a mayor)
    const snowballDebts = [...activeDebts].sort((a, b) => a.currentBalance - b.currentBalance);
    const snowballSim = this.simulateDebtCascade(snowballDebts, extraMonthlyBudget, 'SNOWBALL', standardTotalInterest, standardMaxMonths);

    // 3. Avalanche (Orden por tasa de interés mayor a menor)
    const avalancheDebts = [...activeDebts].sort((a, b) => b.annualInterestRate - a.annualInterestRate);
    const avalancheSim = this.simulateDebtCascade(avalancheDebts, extraMonthlyBudget, 'AVALANCHE', standardTotalInterest, standardMaxMonths);

    const diffInterest = Number((snowballSim.totalInterestPaid - avalancheSim.totalInterestPaid).toFixed(2));

    let preferredStrategy: DebtPayoffStrategy = 'AVALANCHE';
    let reason = '';

    if (diffInterest > 150) {
      preferredStrategy = 'AVALANCHE';
      reason = `La estrategia Avalancha te ahorra $${diffInterest.toLocaleString()} más en intereses totales que la Bola de Nieve, atacando las deudas más costosas primero.`;
    } else {
      preferredStrategy = 'SNOWBALL';
      reason = `La diferencia en intereses es de solo $${diffInterest.toLocaleString()}, por lo que la Bola de Nieve es muy recomendable para liquidar deudas pequeñas rápidamente y ganar motivación.`;
    }

    return {
      snowball: snowballSim,
      avalanche: avalancheSim,
      recommendation: {
        preferredStrategy,
        reason,
        differenceInterestSaved: Math.abs(diffInterest)
      }
    };
  }

  private static simulateDebtCascade(
    orderedDebts: Debt[],
    extraMonthlyBudget: number,
    strategy: DebtPayoffStrategy,
    standardInterest: number,
    standardMonths: number
  ): DebtStrategyResult {
    let balances = orderedDebts.map(d => d.currentBalance);
    const rates = orderedDebts.map(d => (d.annualInterestRate / 100) / 12);
    const minPayments = orderedDebts.map(d => d.monthlyInstallment);

    let month = 0;
    let totalInterestPaid = 0;
    let totalPaid = 0;
    const maxMonths = 360;

    while (balances.some(b => b > 0.01) && month < maxMonths) {
      month++;
      let extraAvailable = extraMonthlyBudget;

      // 1. Calcular intereses para cada deuda y sumar cuotas mínimas liberadas
      for (let i = 0; i < orderedDebts.length; i++) {
        if (balances[i] > 0.01) {
          const interest = balances[i] * rates[i];
          totalInterestPaid += interest;
          balances[i] += interest; // Se acumula interés del mes

          // Pagar cuota mínima si balance lo permite
          const payMin = Math.min(balances[i], minPayments[i]);
          balances[i] -= payMin;
          totalPaid += payMin;
        } else {
          // Deuda pagada: su cuota mínima ahora se suma al fondo bola de nieve / avalancha
          extraAvailable += minPayments[i];
        }
      }

      // 2. Aplicar todo el fondo extra disponible a la primera deuda con saldo pendiente
      for (let i = 0; i < orderedDebts.length; i++) {
        if (balances[i] > 0.01 && extraAvailable > 0) {
          const extraToApply = Math.min(balances[i], extraAvailable);
          balances[i] -= extraToApply;
          totalPaid += extraToApply;
          extraAvailable -= extraToApply;
        }
      }
    }

    const today = new Date();
    today.setMonth(today.getMonth() + month);
    const payoffDate = today.toISOString().split('T')[0];

    const interestSaved = Math.max(0, Number((standardInterest - totalInterestPaid).toFixed(2)));
    const monthsSaved = Math.max(0, standardMonths - month);

    return {
      strategy,
      totalPaid: Number(totalPaid.toFixed(2)),
      totalInterestPaid: Number(totalInterestPaid.toFixed(2)),
      totalMonths: month,
      payoffDate,
      interestSavedComparedToStandard: interestSaved,
      monthsSavedComparedToStandard: monthsSaved,
      orderOfDebts: orderedDebts.map(d => d.name)
    };
  }

  /**
   * Cálculo de Presupuesto:
   * Porcentaje Utilizado = (Gastado / Presupuesto) * 100
   */
  static calculateBudgetProgress(
    budget: Budget,
    transactions: Transaction[]
  ): {
    spentAmount: number;
    remainingAmount: number;
    usedPercent: number;
    isWarning80: boolean;
    isExceeded: boolean;
  } {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const categoryTxs = transactions.filter(t => 
      !t.isDeleted && 
      t.type === 'EXPENSE' && 
      t.category.toLowerCase() === budget.category.toLowerCase() &&
      t.date.startsWith(currentMonth)
    );

    let spent = 0;
    for (const t of categoryTxs) {
      spent += this.convertCurrency(t.amount, t.currency, budget.currency, t.exchangeRateUsed).convertedAmount;
    }

    spent = Number(spent.toFixed(2));
    const usedPercent = budget.limitAmount > 0 ? Number(((spent / budget.limitAmount) * 100).toFixed(1)) : 0;
    const remainingAmount = Number((budget.limitAmount - spent).toFixed(2));

    return {
      spentAmount: spent,
      remainingAmount,
      usedPercent,
      isWarning80: usedPercent >= (budget.alertThresholdPercent || 80) && usedPercent < 100,
      isExceeded: usedPercent >= 100
    };
  }

  /**
   * Cálculo de Metas:
   * Avance = (Ahorrado / Meta) * 100
   */
  static calculateGoalProgress(goal: Goal): {
    savedAmount: number;
    targetAmount: number;
    progressPercent: number;
    remainingAmount: number;
    projectedCompletionMonths: number;
    projectedCompletionDate: string;
    isOnTrack: boolean;
  } {
    const progressPercent = goal.targetAmount > 0 ? Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)) : 0;
    const remainingAmount = Math.max(0, Number((goal.targetAmount - goal.currentAmount).toFixed(2)));

    let projectedCompletionMonths = 0;
    if (goal.monthlyPlannedContribution > 0) {
      projectedCompletionMonths = Math.ceil(remainingAmount / goal.monthlyPlannedContribution);
    }

    const projDate = new Date();
    projDate.setMonth(projDate.getMonth() + projectedCompletionMonths);
    const projectedCompletionDate = projDate.toISOString().split('T')[0];

    const targetDateObj = new Date(goal.targetDate);
    const isOnTrack = projDate <= targetDateObj || progressPercent >= 100;

    return {
      savedAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      progressPercent,
      remainingAmount,
      projectedCompletionMonths,
      projectedCompletionDate,
      isOnTrack
    };
  }

  /**
   * Motor Analítico MVP de IA Financiera (Reglas analíticas y heurísticas predictivas)
   * Detecta gastos excesivos, patrones, analiza deudas, recomienda presupuestos y escenarios.
   */
  static runAnalyticsEngine(
    transactions: Transaction[],
    budgets: Budget[],
    debts: Debt[],
    goals: Goal[],
    baseCurrency: CurrencyCode = 'USD'
  ): FinancialAnalyticsInsight[] {
    const insights: FinancialAnalyticsInsight[] = [];
    const activeTxs = transactions.filter(t => !t.isDeleted);

    // 1. Detección de Gastos Excesivos por Categoría
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const categoryTotals: Record<string, number> = {};
    for (const t of activeTxs.filter(tx => tx.type === 'EXPENSE' && tx.date.startsWith(currentMonthPrefix))) {
      const val = this.convertCurrency(t.amount, t.currency, baseCurrency, t.exchangeRateUsed).convertedAmount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + val;
    }

    const highSpendingCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (highSpendingCategory && highSpendingCategory[1] > 500) {
      insights.push({
        id: 'ins-excessive-cat',
        type: 'EXCESSIVE_EXPENSE',
        title: `Gasto elevado en ${highSpendingCategory[0]}`,
        description: `Has destinado $${highSpendingCategory[1].toLocaleString()} a ${highSpendingCategory[0]} en lo que va del mes, representando la mayor salida de capital.`,
        suggestedAction: `Establece un techo presupuestario o recorta un 15% para liberar flujo de caja.`,
        potentialMonthlySavings: Number((highSpendingCategory[1] * 0.15).toFixed(2)),
        severity: 'WARNING'
      });
    }

    // 2. Detección de Patrones Recurrentes (Suscripciones / Gastos fijos)
    const recurringCandidates = activeTxs.filter(t => 
      t.type === 'EXPENSE' && 
      (t.tags?.includes('suscripcion') || t.tags?.includes('fijo') || t.description.toLowerCase().includes('netflix') || t.description.toLowerCase().includes('spotify') || t.description.toLowerCase().includes('gimnasio'))
    );
    if (recurringCandidates.length > 0) {
      const recurringSum = recurringCandidates.reduce((sum, t) => sum + t.amount, 0);
      insights.push({
        id: 'ins-recurring-patterns',
        type: 'PATTERN',
        title: `Patrón recurrente: Gastos fijos detectados`,
        description: `Se detectaron ${recurringCandidates.length} gastos automáticos o suscripciones mensuales que suman aprox. $${recurringSum.toFixed(2)}.`,
        suggestedAction: `Revisa los servicios que no uses con frecuencia para optimizar hasta $${(recurringSum * 0.3).toFixed(2)} mensuales.`,
        potentialMonthlySavings: Number((recurringSum * 0.3).toFixed(2)),
        severity: 'INFO'
      });
    }

    // 3. Recomendación de Estrategia de Deuda (Avalanche vs Snowball)
    const activeDebts = debts.filter(d => !d.isDeleted && d.currentBalance > 0);
    if (activeDebts.length > 1) {
      const comparison = this.compareDebtStrategies(activeDebts, 250);
      insights.push({
        id: 'ins-debt-strat',
        type: 'DEBT_OPTIMIZATION',
        title: `Optimización de Deudas: Método ${comparison.recommendation.preferredStrategy === 'AVALANCHE' ? 'Avalancha' : 'Bola de Nieve'}`,
        description: comparison.recommendation.reason,
        suggestedAction: `Asigna un pago extraordinario mensual de $250 a la deuda prioritaria: "${comparison.avalanche.orderOfDebts[0]}".`,
        potentialMonthlySavings: comparison.recommendation.differenceInterestSaved,
        severity: 'OPPORTUNITY'
      });
    }

    // 4. Recomendación de Presupuesto (Regla 50/30/20)
    const generalBalance = this.calculateGeneralBalance(activeTxs, baseCurrency);
    if (generalBalance.totalIncome > 0) {
      const recommendedSavings = Number((generalBalance.totalIncome * 0.20).toFixed(2));
      insights.push({
        id: 'ins-rule-50-30-20',
        type: 'BUDGET_RECOM',
        title: 'Recomendación de Presupuesto 50/30/20',
        description: `Con ingresos de $${generalBalance.totalIncome.toLocaleString()}, tu meta saludable de ahorro e inversión es de $${recommendedSavings.toLocaleString()} (20%).`,
        suggestedAction: `Automatiza una transferencia de ahorro a principio de mes antes de realizar gastos discrecionales.`,
        potentialMonthlySavings: recommendedSavings,
        severity: 'INFO'
      });
    }

    // 5. Escenario Hipotético What-If
    if (generalBalance.totalExpense > 300) {
      const cut10 = Number((generalBalance.totalExpense * 0.10).toFixed(2));
      insights.push({
        id: 'ins-what-if-savings',
        type: 'WHAT_IF',
        title: 'Escenario What-If: Reducción del 10% en gastos discrecionales',
        description: `Si optimizas gastos hormiga y salidas no esenciales en un 10%, acumularías $${(cut10 * 12).toLocaleString()} adicionales al cabo de 1 año.`,
        suggestedAction: `Destinar estos fondos aceleraría tus metas financieras en más de 4 meses.`,
        potentialMonthlySavings: cut10,
        severity: 'OPPORTUNITY'
      });
    }

    return insights;
  }
}
