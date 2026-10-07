/**
 * Export Service
 * Exportaciones a Excel (CSV con BOM UTF-8 compatible con Microsoft Excel)
 * y generación de vistas imprimibles en formato PDF con diseño ejecutivo.
 */

import { Transaction, Debt, Budget, Goal, Account } from '../types/financial';

export class ExportService {
  /**
   * Exporta transacciones en formato CSV/Excel con cabeceras y codificación UTF-8
   */
  static exportTransactionsToExcel(transactions: Transaction[], filename = 'movimientos_financieros.csv') {
    const headers = [
      'ID',
      'Fecha',
      'Tipo',
      'Categoría',
      'Subcategoría',
      'Descripción',
      'Monto',
      'Moneda',
      'Tasa de Cambio',
      'Monto Base (USD)',
      'Método de Pago',
      'Visibilidad',
      'Etiquetas'
    ];

    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.category || ''}"`,
      `"${t.subcategory || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      `"${t.currency}"`,
      t.exchangeRateUsed.toFixed(4),
      t.amountInBaseCurrency.toFixed(2),
      `"${t.paymentMethod}"`,
      `"${t.visibility}"`,
      `"${(t.tags || []).join(';')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta Deudas y estrategia
   */
  static exportDebtsToExcel(debts: Debt[], filename = 'deudas_y_creditos.csv') {
    const headers = [
      'ID',
      'Nombre',
      'Acreedor',
      'Tipo',
      'Capital Inicial',
      'Saldo Pendiente',
      'Tasa Anual (%)',
      'Tipo Tasa',
      'Cuota Mensual',
      'Plazo Total',
      'Cuotas Restantes',
      'Fecha Fin',
      'Moneda'
    ];

    const rows = debts.map(d => [
      `"${d.id}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.creditor.replace(/"/g, '""')}"`,
      `"${d.type}"`,
      d.initialCapital.toFixed(2),
      d.currentBalance.toFixed(2),
      d.annualInterestRate.toFixed(2),
      `"${d.interestType}"`,
      d.monthlyInstallment.toFixed(2),
      d.totalInstallments,
      d.remainingInstallments,
      `"${d.endDate}"`,
      `"${d.currency}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta Presupuestos
   */
  static exportBudgetsToExcel(budgets: Budget[], filename = 'presupuestos.csv') {
    const headers = ['ID', 'Nombre', 'Categoría', 'Límite', 'Periodo', 'Moneda', 'Alerta (%)', 'Visibilidad'];
    const rows = budgets.map(b => [
      `"${b.id}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.category.replace(/"/g, '""')}"`,
      b.limitAmount.toFixed(2),
      `"${b.period}"`,
      `"${b.currency}"`,
      b.alertThresholdPercent,
      `"${b.visibility}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporta Metas
   */
  static exportGoalsToExcel(goals: Goal[], filename = 'metas_financieras.csv') {
    const headers = ['ID', 'Meta', 'Tipo', 'Monto Objetivo', 'Monto Ahorrado', 'Avance (%)', 'Fecha Objetivo', 'Aporte Mensual'];
    const rows = goals.map(g => [
      `"${g.id}"`,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.type}"`,
      g.targetAmount.toFixed(2),
      g.currentAmount.toFixed(2),
      ((g.currentAmount / g.targetAmount) * 100).toFixed(1),
      `"${g.targetDate}"`,
      g.monthlyPlannedContribution.toFixed(2)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Dispara el diálogo de impresión con estilos optimizados para PDF
   */
  static triggerPrintToPdf() {
    window.print();
  }

  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
