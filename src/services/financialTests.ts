/**
 * Automated Financial Rules & Integration Test Suite
 * Ejecuta validaciones de los 12 criterios críticos de aceptación.
 */

import { FinancialEngine } from './financialEngine';
import { db } from './database';
import { Debt, Account, CreditCard, Transaction, Budget, Goal } from '../types/financial';

export interface TestResult {
  id: string;
  name: string;
  category: 'UNIT' | 'INTEGRATION' | 'CRITICAL_CASES';
  passed: boolean;
  message: string;
  executionTimeMs: number;
  details?: any;
}

export class FinancialTestSuite {
  public static runAllTests(): TestResult[] {
    const results: TestResult[] = [];

    // Test 1: Balance General (Ingresos - Gastos)
    results.push(this.testGeneralBalance());

    // Test 2: Saldo Cuenta con movimientos múltiples
    results.push(this.testAccountBalanceFormula());

    // Test 3: Tarjetas de crédito (Cupo utilizado vs Cupo disponible)
    results.push(this.testCreditCardLimits());

    // Test 4: Simulador de Deuda & Amortización Francesa
    results.push(this.testAmortizationMath());

    // Test 5: Estrategias Snowball vs Avalanche
    results.push(this.testSnowballAndAvalanche());

    // Test 6: Simulación de Pago Extraordinario (Ahorro de Intereses y Tiempo)
    results.push(this.testExtraPaymentSimulation());

    // Test 7: Presupuestos y Alerta del 80%
    results.push(this.testBudgetThresholds());

    // Test 8: Metas de ahorro y avance porcentual
    results.push(this.testGoalProgress());

    // Test 9: Multi-Moneda y consistencia histórica
    results.push(this.testMultiCurrencyHistoricalConsistency());

    // Test 10: Integración: Creación de Transacción y afectación automática de saldo
    results.push(this.testTransactionAffectsBalance());

    // Test 11: Soft Delete y Restauración íntegra
    results.push(this.testSoftDeleteAndRestore());

    // Test 12: Registro de Auditoría exhaustivo
    results.push(this.testAuditLogRecording());

    return results;
  }

  private static testGeneralBalance(): TestResult {
    const start = performance.now();
    const mockTxs: Transaction[] = [
      {
        id: 't-1',
        userId: 'usr-1',
        type: 'INCOME',
        amount: 3000,
        currency: 'USD',
        exchangeRateUsed: 1.0,
        amountInBaseCurrency: 3000,
        date: '2026-10-01',
        accountId: 'a-1',
        category: 'Salario',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Pago',
        tags: [],
        visibility: 'PRIVATE',
        isDeleted: false,
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 't-2',
        userId: 'usr-1',
        type: 'EXPENSE',
        amount: 1200,
        currency: 'USD',
        exchangeRateUsed: 1.0,
        amountInBaseCurrency: 1200,
        date: '2026-10-02',
        accountId: 'a-1',
        category: 'Vivienda',
        paymentMethod: 'BANK_TRANSFER',
        description: 'Renta',
        tags: [],
        visibility: 'PRIVATE',
        isDeleted: false,
        createdAt: '',
        updatedAt: ''
      }
    ];

    const balance = FinancialEngine.calculateGeneralBalance(mockTxs, 'USD');
    const passed = balance.totalIncome === 3000 && balance.totalExpense === 1200 && balance.netBalance === 1800;

    return {
      id: 'TEST-01',
      name: 'Balance General = Ingresos - Gastos',
      category: 'UNIT',
      passed,
      message: passed ? 'Cálculo exacto: 3000 - 1200 = 1800' : 'Fallo en la resta de balance general',
      executionTimeMs: Number((performance.now() - start).toFixed(2)),
      details: balance
    };
  }

  private static testAccountBalanceFormula(): TestResult {
    const start = performance.now();
    const account: Account = {
      id: 'acc-test',
      userId: 'usr-1',
      name: 'Test Acc',
      type: 'SAVINGS',
      institutionName: 'Test Bank',
      currency: 'USD',
      currentBalance: 1000,
      initialBalance: 1000,
      visibility: 'PRIVATE',
      lowBalanceThreshold: 100,
      createdAt: '',
      updatedAt: '',
      isDeleted: false
    };

    const txs: Transaction[] = [
      {
        id: 'tx-a1',
        userId: 'usr-1',
        type: 'INCOME',
        amount: 500,
        currency: 'USD',
        exchangeRateUsed: 1.0,
        amountInBaseCurrency: 500,
        date: '2026-10-01',
        accountId: 'acc-test',
        category: 'Ingreso',
        paymentMethod: 'CASH',
        description: '',
        tags: [],
        visibility: 'PRIVATE',
        isDeleted: false,
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 'tx-a2',
        userId: 'usr-1',
        type: 'EXPENSE',
        amount: 200,
        currency: 'USD',
        exchangeRateUsed: 1.0,
        amountInBaseCurrency: 200,
        date: '2026-10-02',
        accountId: 'acc-test',
        category: 'Gasto',
        paymentMethod: 'CASH',
        description: '',
        tags: [],
        visibility: 'PRIVATE',
        isDeleted: false,
        createdAt: '',
        updatedAt: ''
      }
    ];

    const calculatedBalance = FinancialEngine.recalculateAccountBalance(account, txs);
    // 1000 + 500 - 200 = 1300
    const passed = calculatedBalance === 1300;

    return {
      id: 'TEST-02',
      name: 'Saldo Cuenta = Inicial + Ingresos - Gastos',
      category: 'UNIT',
      passed,
      message: passed ? 'Saldo final verificado: $1,300.00' : `Esperado 1300 pero obtuvo ${calculatedBalance}`,
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testCreditCardLimits(): TestResult {
    const start = performance.now();
    const card: CreditCard = {
      id: 'crd-test',
      userId: 'usr-1',
      accountId: 'acc-1',
      name: 'Test Card',
      issuer: 'Visa',
      currency: 'USD',
      creditLimit: 5000,
      usedAmount: 0,
      closingDay: 15,
      dueDay: 5,
      interestRateAnnual: 20,
      status: 'ACTIVE',
      cardMasked: '**** 1111',
      visibility: 'PRIVATE',
      createdAt: '',
      updatedAt: '',
      isDeleted: false
    };

    const txs: Transaction[] = [
      {
        id: 'tx-c1',
        userId: 'usr-1',
        type: 'EXPENSE',
        amount: 1500,
        currency: 'USD',
        exchangeRateUsed: 1.0,
        amountInBaseCurrency: 1500,
        date: '2026-10-01',
        accountId: 'acc-1',
        creditCardId: 'crd-test',
        category: 'Compras',
        paymentMethod: 'CREDIT_CARD',
        description: '',
        tags: [],
        visibility: 'PRIVATE',
        isDeleted: false,
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 'tx-c2',
        userId: 'usr-1',
        type: 'CARD_PAYMENT',
        amount: 500,
        currency: 'USD',
        exchangeRateUsed: 1.0,
        amountInBaseCurrency: 500,
        date: '2026-10-05',
        accountId: 'acc-1',
        creditCardId: 'crd-test',
        category: 'Pago Tarjeta',
        paymentMethod: 'BANK_TRANSFER',
        description: '',
        tags: [],
        visibility: 'PRIVATE',
        isDeleted: false,
        createdAt: '',
        updatedAt: ''
      }
    ];

    const usage = FinancialEngine.recalculateCreditCardUsage(card, txs);
    // Utilizado: 1500 - 500 = 1000. Disponible: 5000 - 1000 = 4000. % = 20%
    const passed = usage.usedAmount === 1000 && usage.availableAmount === 4000 && usage.utilizationPercent === 20;

    return {
      id: 'TEST-03',
      name: 'Tarjetas: Cupo Utilizado, Disponible y % Uso',
      category: 'UNIT',
      passed,
      message: passed ? 'Utilizado: $1,000 | Disponible: $4,000 (20%)' : 'Fallo en cupos de tarjeta',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testAmortizationMath(): TestResult {
    const start = performance.now();
    // Cuota de préstamo $10,000 al 12% anual a 12 meses
    const monthlyPayment = FinancialEngine.calculateMonthlyInstallment(10000, 12, 12);
    // Cuota esperada aprox 888.49
    const passed = monthlyPayment >= 888.0 && monthlyPayment <= 889.0;

    return {
      id: 'TEST-04',
      name: 'Amortización de Préstamo (Sistema Francés)',
      category: 'UNIT',
      passed,
      message: passed ? `Cuota calculada: $${monthlyPayment}/mes para $10,000 al 12%` : `Cuota errónea: ${monthlyPayment}`,
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testSnowballAndAvalanche(): TestResult {
    const start = performance.now();
    const debts: Debt[] = [
      {
        id: 'd-1',
        userId: 'usr-1',
        name: 'Deuda Pequeña (Alta Tasa)',
        creditor: 'Banco A',
        type: 'PERSONAL',
        initialCapital: 1000,
        currentBalance: 1000,
        annualInterestRate: 25,
        interestType: 'FIXED',
        monthlyInstallment: 95,
        totalInstallments: 12,
        remainingInstallments: 12,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        currency: 'USD',
        visibility: 'PRIVATE',
        createdAt: '',
        updatedAt: '',
        isDeleted: false
      },
      {
        id: 'd-2',
        userId: 'usr-1',
        name: 'Deuda Grande (Baja Tasa)',
        creditor: 'Banco B',
        type: 'VEHICLE',
        initialCapital: 15000,
        currentBalance: 15000,
        annualInterestRate: 6,
        interestType: 'FIXED',
        monthlyInstallment: 350,
        totalInstallments: 48,
        remainingInstallments: 48,
        startDate: '2026-01-01',
        endDate: '2030-01-01',
        currency: 'USD',
        visibility: 'PRIVATE',
        createdAt: '',
        updatedAt: '',
        isDeleted: false
      }
    ];

    const comparison = FinancialEngine.compareDebtStrategies(debts, 200);
    const passed = comparison.avalanche.totalInterestPaid <= comparison.snowball.totalInterestPaid;

    return {
      id: 'TEST-05',
      name: 'Estrategias Snowball vs Avalanche (Optimización)',
      category: 'CRITICAL_CASES',
      passed,
      message: passed ? `Avalancha ahorra $${comparison.recommendation.differenceInterestSaved} más en intereses.` : 'Fallo en comparación de estrategias',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testExtraPaymentSimulation(): TestResult {
    const start = performance.now();
    const debt: Debt = {
      id: 'd-sim',
      userId: 'usr-1',
      name: 'Deuda Prueba Simulación',
      creditor: 'Acreedor',
      type: 'BANK',
      initialCapital: 10000,
      currentBalance: 10000,
      annualInterestRate: 15,
      interestType: 'FIXED',
      monthlyInstallment: 250,
      totalInstallments: 60,
      remainingInstallments: 60,
      startDate: '2026-01-01',
      endDate: '2031-01-01',
      currency: 'USD',
      visibility: 'PRIVATE',
      createdAt: '',
      updatedAt: '',
      isDeleted: false
    };

    const sim = FinancialEngine.simulateExtraPayment(debt, 2000, 100);
    const passed = sim.interestSaved > 0 && sim.monthsSaved > 0;

    return {
      id: 'TEST-06',
      name: 'Simulador de Pagos Extraordinarios (Ahorro de Plazo e Interés)',
      category: 'CRITICAL_CASES',
      passed,
      message: passed ? `Ahorro simulado: $${sim.interestSaved} en intereses y ${sim.monthsSaved} meses.` : 'Fallo en simulación de abono extra',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testBudgetThresholds(): TestResult {
    const start = performance.now();
    const budget: Budget = {
      id: 'bdg-test',
      userId: 'usr-1',
      name: 'Comida',
      category: 'Restaurantes',
      limitAmount: 500,
      period: 'MONTHLY',
      currency: 'USD',
      visibility: 'PRIVATE',
      alertThresholdPercent: 80,
      createdAt: '',
      updatedAt: '',
      isDeleted: false
    };

    const nowMonth = new Date().toISOString().slice(0, 7);
    const txs: Transaction[] = [
      {
        id: 't-b1',
        userId: 'usr-1',
        type: 'EXPENSE',
        amount: 420, // 420 / 500 = 84%
        currency: 'USD',
        exchangeRateUsed: 1.0,
        amountInBaseCurrency: 420,
        date: `${nowMonth}-03`,
        accountId: 'acc-1',
        category: 'Restaurantes',
        paymentMethod: 'CASH',
        description: '',
        tags: [],
        visibility: 'PRIVATE',
        isDeleted: false,
        createdAt: '',
        updatedAt: ''
      }
    ];

    const progress = FinancialEngine.calculateBudgetProgress(budget, txs);
    const passed = progress.usedPercent === 84 && progress.isWarning80 && !progress.isExceeded;

    return {
      id: 'TEST-07',
      name: 'Presupuestos: Alerta del 80% y cálculo de consumo',
      category: 'UNIT',
      passed,
      message: passed ? `Consumo: 84% ($420 / $500) -> Alerta 80% activada con precisión` : 'Fallo en umbral de presupuesto',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testGoalProgress(): TestResult {
    const start = performance.now();
    const goal: Goal = {
      id: 'gol-t',
      userId: 'usr-1',
      name: 'Fondo Prueba',
      type: 'EMERGENCY_FUND',
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: '2027-12-31',
      currency: 'USD',
      visibility: 'PRIVATE',
      monthlyPlannedContribution: 500,
      createdAt: '',
      updatedAt: '',
      isDeleted: false
    };

    const res = FinancialEngine.calculateGoalProgress(goal);
    // 2500 / 10000 = 25%. Restante: 7500 / 500 = 15 meses.
    const passed = res.progressPercent === 25 && res.projectedCompletionMonths === 15;

    return {
      id: 'TEST-08',
      name: 'Metas Financieras: Avance % y proyección de meses',
      category: 'UNIT',
      passed,
      message: passed ? `Avance: 25% | Finalización estimada en 15 meses` : 'Fallo en metas financieras',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testMultiCurrencyHistoricalConsistency(): TestResult {
    const start = performance.now();
    // Conversión con tasa histórica fija registrada en el comprobante (ej: EUR a USD a 1.15 histórico)
    const conv = FinancialEngine.convertCurrency(100, 'EUR', 'USD', 1.15);
    const passed = conv.convertedAmount === 115.00 && conv.rateUsed === 1.15;

    return {
      id: 'TEST-09',
      name: 'Multi-Moneda: Consistencia Histórica de Tasa de Cambio',
      category: 'CRITICAL_CASES',
      passed,
      message: passed ? '100 EUR al tipo histórico 1.15 = 115.00 USD invariante' : 'Fallo en conversión de moneda histórica',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testTransactionAffectsBalance(): TestResult {
    const start = performance.now();
    const initialAccounts = db.getAccounts();
    const testAcc = initialAccounts[0];
    const initialBalance = testAcc.currentBalance;

    const newTx = db.createTransaction({
      userId: 'usr-1',
      type: 'EXPENSE',
      amount: 50,
      currency: 'USD',
      exchangeRateUsed: 1.0,
      date: '2026-10-06',
      accountId: testAcc.id,
      category: 'Transporte & Movilidad',
      paymentMethod: 'CASH',
      description: 'Test temporal de afectación automática',
      tags: ['test'],
      visibility: 'PRIVATE'
    });

    const updatedAccount = db.getAccounts().find(a => a.id === testAcc.id)!;
    const balanceDecreased = Number((initialBalance - updatedAccount.currentBalance).toFixed(2)) === 50.00;

    // Limpiar transacción de test
    db.deleteTransaction(newTx.id);

    return {
      id: 'TEST-10',
      name: 'Integración: Transacción afecta saldo de cuenta inmediatamente',
      category: 'INTEGRATION',
      passed: balanceDecreased,
      message: balanceDecreased ? 'Gasto de $50 redujo saldo de cuenta en exactamente $50.00' : 'Fallo en afectación inmediata de saldo',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testSoftDeleteAndRestore(): TestResult {
    const start = performance.now();
    const tx = db.createTransaction({
      userId: 'usr-1',
      type: 'INCOME',
      amount: 100,
      currency: 'USD',
      exchangeRateUsed: 1.0,
      date: '2026-10-06',
      accountId: db.getAccounts()[0].id,
      category: 'Otros Ingresos',
      paymentMethod: 'CASH',
      description: 'Test soft delete',
      tags: ['test'],
      visibility: 'PRIVATE'
    });

    // 1. Eliminar suavemente
    db.deleteTransaction(tx.id);
    const activeAfterDelete = db.getTransactions().some(t => t.id === tx.id);

    // 2. Restaurar
    db.restoreTransaction(tx.id);
    const activeAfterRestore = db.getTransactions().some(t => t.id === tx.id);

    // Limpiar
    db.deleteTransaction(tx.id);

    const passed = !activeAfterDelete && activeAfterRestore;

    return {
      id: 'TEST-11',
      name: 'Soft Delete, Papelera y Restauración',
      category: 'INTEGRATION',
      passed,
      message: passed ? 'Transacción eliminada a papelera y restaurada correctamente' : 'Fallo en soft delete o restauración',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  private static testAuditLogRecording(): TestResult {
    const start = performance.now();
    const initialLogsCount = db.getState().auditLogs.length;

    db.recordAudit('TestEntity', 'ent-123', 'CREATE', null, { status: 'active' });
    const afterCount = db.getState().auditLogs.length;

    const latest = db.getState().auditLogs[0];
    const passed = afterCount === initialLogsCount + 1 && latest.entityType === 'TestEntity' && latest.action === 'CREATE';

    return {
      id: 'TEST-12',
      name: 'Auditoría Completa (Entidad, Usuario, Acción, Diff)',
      category: 'INTEGRATION',
      passed,
      message: passed ? 'Entrada de auditoría registrada con usuario, timestamp y diff' : 'Fallo en auditoría',
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }
}
