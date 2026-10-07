/**
 * Financial Platform Data Types & Interfaces
 * Entidades completas según especificación: Users, Accounts, Cards, Debts,
 * Transactions, Budgets, Goals, Categories, Audit, Alerts, Tags, etc.
 */

export type UserRole = 'ADMIN' | 'MEMBER' | 'VIEWER';
export type VisibilityType = 'PRIVATE' | 'SHARED' | 'FAMILY';
export type FinancialScope = 'PERSONAL' | 'FAMILY' | 'ALL';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export type AccountType = 
  | 'CASH' 
  | 'SAVINGS' 
  | 'CHECKING' 
  | 'WALLET' 
  | 'NEOBANK' 
  | 'COOPERATIVE' 
  | 'OTHER';

export type TransactionType = 
  | 'INCOME' 
  | 'EXPENSE' 
  | 'TRANSFER' 
  | 'CARD_PAYMENT' 
  | 'DEBT_RECORD' 
  | 'DEBT_PAYMENT' 
  | 'BALANCE_ADJUSTMENT';

export type PaymentMethod = 
  | 'CASH' 
  | 'DEBIT_CARD' 
  | 'CREDIT_CARD' 
  | 'BANK_TRANSFER' 
  | 'WALLET_APP' 
  | 'OTHER';

export type DebtType = 
  | 'BANK' 
  | 'PERSONAL' 
  | 'FAMILY' 
  | 'VEHICLE' 
  | 'MORTGAGE' 
  | 'CONSUMER' 
  | 'OTHER';

export type InterestType = 'FIXED' | 'VARIABLE';

export type DebtPayoffStrategy = 'SNOWBALL' | 'AVALANCHE';

export type GoalType = 
  | 'TRAVEL' 
  | 'HOUSING' 
  | 'VEHICLE' 
  | 'EDUCATION' 
  | 'EMERGENCY_FUND' 
  | 'FREE_SAVINGS' 
  | 'CUSTOM';

export type ScheduledStatus = 'SCHEDULED' | 'EXECUTED' | 'CANCELLED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType = 
  | 'CARD_DUE_DATE' 
  | 'DEBT_DUE_DATE' 
  | 'UPCOMING_INSTALLMENT' 
  | 'LOW_BALANCE' 
  | 'UNUSUAL_EXPENSE' 
  | 'BUDGET_EXCEEDED' 
  | 'BUDGET_WARNING_80' 
  | 'GOAL_AT_RISK';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

export type CurrencyCode = 'USD' | 'EUR' | 'COP';

// -------------------------------------------------------------
// CORE ENTITIES
// -------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  familyGroupId?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  preferredCurrency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface FamilyMember {
  id: string;
  familyGroupId: string;
  userId: string;
  role: UserRole;
  canViewAll: boolean;
  canManageBudgets: boolean;
  joinedAt: string;
}

export interface FinancialInstitution {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
}

export interface Account {
  id: string;
  userId: string;
  familyGroupId?: string;
  name: string;
  type: AccountType;
  institutionName: string;
  currency: CurrencyCode;
  currentBalance: number;
  initialBalance: number;
  accountNumberMasked?: string;
  visibility: VisibilityType;
  lowBalanceThreshold: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreditCard {
  id: string;
  userId: string;
  familyGroupId?: string;
  accountId: string; // Associated settlement account
  name: string;
  issuer: string;
  currency: CurrencyCode;
  creditLimit: number;
  usedAmount: number; // Saldo utilizado
  closingDay: number; // Día corte mensual (1 - 31)
  dueDay: number; // Día pago mensual (1 - 31)
  interestRateAnnual: number;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
  cardMasked: string; // e.g. **** 4812
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Debt {
  id: string;
  userId: string;
  familyGroupId?: string;
  name: string;
  creditor: string; // Acreedor
  type: DebtType;
  initialCapital: number;
  currentBalance: number; // Saldo actual
  annualInterestRate: number; // Tasa en %
  interestType: InterestType;
  monthlyInstallment: number; // Cuota mensual
  totalInstallments: number; // Plazo total
  remainingInstallments: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  currency: CurrencyCode;
  visibility: VisibilityType;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  accountId: string;
  amount: number;
  principalAmount: number; // Abono a capital
  interestAmount: number; // Intereses
  paymentDate: string;
  isExtraordinary: boolean;
  notes?: string;
}

export interface Goal {
  id: string;
  userId: string;
  familyGroupId?: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  currency: CurrencyCode;
  visibility: VisibilityType;
  monthlyPlannedContribution: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  accountId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  scope: 'SYSTEM' | 'USER' | 'FAMILY';
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  familyGroupId?: string;
  userId?: string;
  subcategories: string[];
  isDeleted: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  familyGroupId?: string;
  type: TransactionType;
  amount: number; // En la moneda original
  currency: CurrencyCode;
  exchangeRateUsed: number; // 1.0 si es la moneda base o tasa histórica
  amountInBaseCurrency: number; // Consistencia histórica
  date: string; // YYYY-MM-DD
  accountId: string;
  destinationAccountId?: string; // Para transferencias
  creditCardId?: string; // Si es pago o gasto con tarjeta
  debtId?: string; // Si es abono o registro de deuda
  category: string;
  subcategory?: string;
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  tags: string[];
  visibility: VisibilityType;
  attachmentName?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  scheduledDate: string;
  frequency: 'ONCE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  accountId: string;
  category: string;
  description: string;
  status: ScheduledStatus;
  executedTransactionId?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  familyGroupId?: string;
  name: string;
  category: string;
  limitAmount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  currency: CurrencyCode;
  visibility: VisibilityType;
  alertThresholdPercent: number; // e.g. 80
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityId?: string;
  isRead: boolean;
  date: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  previousValue: any;
  newValue: any;
  timestamp: string;
}

export interface ExchangeRate {
  pair: string; // e.g. 'EUR_USD', 'COP_USD'
  rate: number;
  updatedAt: string;
}

// -------------------------------------------------------------
// ANALYTICS & SIMULATION TYPES
// -------------------------------------------------------------

export interface AmortizationRow {
  installmentNumber: number;
  dueDate: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface DebtStrategyResult {
  strategy: DebtPayoffStrategy;
  totalPaid: number;
  totalInterestPaid: number;
  totalMonths: number;
  payoffDate: string;
  interestSavedComparedToStandard: number;
  monthsSavedComparedToStandard: number;
  orderOfDebts: string[];
}

export interface DebtExtraPaymentSimulation {
  originalTotalInterest: number;
  simulatedTotalInterest: number;
  interestSaved: number;
  originalPayoffDate: string;
  newPayoffDate: string;
  monthsSaved: number;
  monthlyExtraPayment: number;
  oneTimeExtraPayment: number;
}

export interface FinancialAnalyticsInsight {
  id: string;
  type: 'EXCESSIVE_EXPENSE' | 'PATTERN' | 'DEBT_OPTIMIZATION' | 'BUDGET_RECOM' | 'SAVINGS_GOAL' | 'WHAT_IF';
  title: string;
  description: string;
  suggestedAction: string;
  potentialMonthlySavings?: number;
  severity: 'INFO' | 'OPPORTUNITY' | 'WARNING';
}
