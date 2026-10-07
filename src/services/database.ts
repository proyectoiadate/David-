/**
 * Relational In-Memory Datastore & Seed Data
 * Implementa relaciones, integridad referencial, Soft Delete,
 * Papelera, Restauración y Registro Completo de Auditoría.
 */

import {
  User,
  UserRole,
  FamilyGroup,
  FamilyMember,
  Account,
  CreditCard,
  Debt,
  Goal,
  Budget,
  Category,
  Transaction,
  ScheduledTransaction,
  Alert,
  AuditLog,
  AuditAction,
  CurrencyCode,
  FinancialScope,
  VisibilityType
} from '../types/financial';
import { FinancialEngine } from './financialEngine';
import { FirestoreService } from './firestoreService';

export interface DatabaseState {
  users: User[];
  familyGroups: FamilyGroup[];
  familyMembers: FamilyMember[];
  accounts: Account[];
  creditCards: CreditCard[];
  debts: Debt[];
  goals: Goal[];
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  scheduledTransactions: ScheduledTransaction[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  tags: string[];
}

// Initial realistic seed data for a family financial workspace
const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Carlos Pérez',
    email: 'carlos.perez@ejemplo.com',
    role: 'ADMIN',
    familyGroupId: 'fam-1',
    isEmailVerified: true,
    twoFactorEnabled: true,
    preferredCurrency: 'USD',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
    isDeleted: false
  },
  {
    id: 'usr-2',
    name: 'Laura Gómez',
    email: 'laura.gomez@ejemplo.com',
    role: 'MEMBER',
    familyGroupId: 'fam-1',
    isEmailVerified: true,
    twoFactorEnabled: false,
    preferredCurrency: 'USD',
    createdAt: '2026-01-16T09:30:00Z',
    updatedAt: '2026-09-20T10:00:00Z',
    isDeleted: false
  },
  {
    id: 'usr-3',
    name: 'Sofía Pérez',
    email: 'sofia.perez@ejemplo.com',
    role: 'VIEWER',
    familyGroupId: 'fam-1',
    isEmailVerified: true,
    twoFactorEnabled: false,
    preferredCurrency: 'USD',
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: '2026-08-15T16:00:00Z',
    isDeleted: false
  }
];

const INITIAL_FAMILY: FamilyGroup[] = [
  {
    id: 'fam-1',
    name: 'Familia Pérez Gómez',
    ownerId: 'usr-1',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-01-15T08:30:00Z',
    isDeleted: false
  }
];

const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-1',
    familyGroupId: 'fam-1',
    userId: 'usr-1',
    role: 'ADMIN',
    canViewAll: true,
    canManageBudgets: true,
    joinedAt: '2026-01-15T08:30:00Z'
  },
  {
    id: 'mem-2',
    familyGroupId: 'fam-1',
    userId: 'usr-2',
    role: 'MEMBER',
    canViewAll: true,
    canManageBudgets: true,
    joinedAt: '2026-01-16T09:30:00Z'
  },
  {
    id: 'mem-3',
    familyGroupId: 'fam-1',
    userId: 'usr-3',
    role: 'VIEWER',
    canViewAll: false,
    canManageBudgets: false,
    joinedAt: '2026-02-01T14:00:00Z'
  }
];

const INITIAL_CATEGORIES: Category[] = [
  // Ingresos
  {
    id: 'cat-inc-1',
    name: 'Salario & Nómina',
    scope: 'SYSTEM',
    type: 'INCOME',
    icon: 'Briefcase',
    color: '#16a34a',
    subcategories: ['Sueldo Base', 'Bonos', 'Horas Extras'],
    isDeleted: false
  },
  {
    id: 'cat-inc-2',
    name: 'Honorarios & Freelance',
    scope: 'SYSTEM',
    type: 'INCOME',
    icon: 'Laptop',
    color: '#0284c7',
    subcategories: ['Consultoría', 'Proyectos'],
    isDeleted: false
  },
  {
    id: 'cat-inc-3',
    name: 'Otros Ingresos',
    scope: 'USER',
    type: 'INCOME',
    icon: 'PlusCircle',
    color: '#0d9488',
    subcategories: ['Reembolsos', 'Premios', 'Ventas ocasionales'],
    isDeleted: false
  },
  // Gastos
  {
    id: 'cat-exp-1',
    name: 'Vivienda & Servicios',
    scope: 'SYSTEM',
    type: 'EXPENSE',
    icon: 'Home',
    color: '#4f46e5',
    subcategories: ['Alquiler/Hipoteca', 'Electricidad', 'Agua', 'Gas', 'Internet'],
    isDeleted: false
  },
  {
    id: 'cat-exp-2',
    name: 'Alimentación & Supermercado',
    scope: 'SYSTEM',
    type: 'EXPENSE',
    icon: 'ShoppingCart',
    color: '#ea580c',
    subcategories: ['Supermercado', 'Restaurantes', 'Cafés'],
    isDeleted: false
  },
  {
    id: 'cat-exp-3',
    name: 'Transporte & Movilidad',
    scope: 'SYSTEM',
    type: 'EXPENSE',
    icon: 'Car',
    color: '#ca8a04',
    subcategories: ['Gasolina', 'Transporte Público', 'Mantenimiento'],
    isDeleted: false
  },
  {
    id: 'cat-exp-4',
    name: 'Salud & Bienestar',
    scope: 'SYSTEM',
    type: 'EXPENSE',
    icon: 'HeartPulse',
    color: '#e11d48',
    subcategories: ['Seguro Médico', 'Farmacia', 'Gimnasio'],
    isDeleted: false
  },
  {
    id: 'cat-exp-5',
    name: 'Educación & Cursos',
    scope: 'FAMILY',
    type: 'EXPENSE',
    icon: 'GraduationCap',
    color: '#7c3aed',
    subcategories: ['Colegio/Universidad', 'Libros', 'Plataformas'],
    isDeleted: false
  },
  {
    id: 'cat-exp-6',
    name: 'Entretenimiento & Ocio',
    scope: 'SYSTEM',
    type: 'EXPENSE',
    icon: 'Film',
    color: '#db2777',
    subcategories: ['Streaming', 'Cine & Eventos', 'Viajes'],
    isDeleted: false
  }
];

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Cuenta Corriente Principal',
    type: 'CHECKING',
    institutionName: 'Chase Bank',
    currency: 'USD',
    currentBalance: 4850.00,
    initialBalance: 3200.00,
    accountNumberMasked: '**** 9120',
    visibility: 'FAMILY',
    lowBalanceThreshold: 500.00,
    color: '#0284c7',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
    isDeleted: false
  },
  {
    id: 'acc-2',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Fondo de Emergencia (Ahorros)',
    type: 'SAVINGS',
    institutionName: 'Ally Bank',
    currency: 'USD',
    currentBalance: 12500.00,
    initialBalance: 10000.00,
    accountNumberMasked: '**** 4431',
    visibility: 'FAMILY',
    lowBalanceThreshold: 2000.00,
    color: '#16a34a',
    createdAt: '2026-01-15T09:15:00Z',
    updatedAt: '2026-10-05T14:00:00Z',
    isDeleted: false
  },
  {
    id: 'acc-3',
    userId: 'usr-2',
    familyGroupId: 'fam-1',
    name: 'Cuenta Nómina Laura',
    type: 'CHECKING',
    institutionName: 'Bank of America',
    currency: 'USD',
    currentBalance: 3120.00,
    initialBalance: 2400.00,
    accountNumberMasked: '**** 7089',
    visibility: 'SHARED',
    lowBalanceThreshold: 300.00,
    color: '#8b5cf6',
    createdAt: '2026-01-16T10:00:00Z',
    updatedAt: '2026-10-04T11:20:00Z',
    isDeleted: false
  },
  {
    id: 'acc-4',
    userId: 'usr-1',
    name: 'Efectivo Billetera Personal',
    type: 'CASH',
    institutionName: 'Efectivo',
    currency: 'USD',
    currentBalance: 280.00,
    initialBalance: 150.00,
    visibility: 'PRIVATE',
    lowBalanceThreshold: 50.00,
    color: '#64748b',
    createdAt: '2026-01-20T12:00:00Z',
    updatedAt: '2026-10-06T09:00:00Z',
    isDeleted: false
  },
  {
    id: 'acc-5',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Cuenta de Ahorros Santander (EUR)',
    type: 'SAVINGS',
    institutionName: 'Banco Santander',
    currency: 'EUR',
    currentBalance: 1850.00,
    initialBalance: 1500.00,
    accountNumberMasked: '**** 5519',
    visibility: 'SHARED',
    lowBalanceThreshold: 200.00,
    color: '#dc2626',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-02T15:00:00Z',
    isDeleted: false
  },
  {
    id: 'acc-6',
    userId: 'usr-1',
    name: 'Fidelity Cash & Ahorros Personales',
    type: 'SAVINGS',
    institutionName: 'Fidelity Investments',
    currency: 'USD',
    currentBalance: 3450.00,
    initialBalance: 2800.00,
    accountNumberMasked: '**** 8832',
    visibility: 'PRIVATE',
    lowBalanceThreshold: 300.00,
    color: '#059669',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-10-06T09:00:00Z',
    isDeleted: false
  }
];

const INITIAL_CREDIT_CARDS: CreditCard[] = [
  {
    id: 'crd-1',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    accountId: 'acc-1',
    name: 'Sapphire Preferred',
    issuer: 'Chase',
    currency: 'USD',
    creditLimit: 7500.00,
    usedAmount: 1840.50,
    closingDay: 20, // Corte el 20 de cada mes
    dueDay: 15, // Pago el 15 de cada mes
    interestRateAnnual: 22.49,
    status: 'ACTIVE',
    cardMasked: '**** 6712',
    visibility: 'FAMILY',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-10-06T11:00:00Z',
    isDeleted: false
  },
  {
    id: 'crd-2',
    userId: 'usr-2',
    familyGroupId: 'fam-1',
    accountId: 'acc-3',
    name: 'Blue Cash Everyday',
    issuer: 'American Express',
    currency: 'USD',
    creditLimit: 5000.00,
    usedAmount: 890.00,
    closingDay: 10,
    dueDay: 5,
    interestRateAnnual: 24.99,
    status: 'ACTIVE',
    cardMasked: '**** 3044',
    visibility: 'SHARED',
    createdAt: '2026-01-20T11:30:00Z',
    updatedAt: '2026-10-05T09:15:00Z',
    isDeleted: false
  },
  {
    id: 'crd-3',
    userId: 'usr-1',
    accountId: 'acc-6',
    name: 'Apple Card (Personal)',
    issuer: 'Goldman Sachs',
    currency: 'USD',
    creditLimit: 3500.00,
    usedAmount: 435.50,
    closingDay: 28,
    dueDay: 20,
    interestRateAnnual: 19.24,
    status: 'ACTIVE',
    cardMasked: '**** 9012',
    visibility: 'PRIVATE',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-06T11:00:00Z',
    isDeleted: false
  }
];

const INITIAL_DEBTS: Debt[] = [
  {
    id: 'dbt-1',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Préstamo Vehículo Familiar (SUV)',
    creditor: 'Toyota Financial Services',
    type: 'VEHICLE',
    initialCapital: 18000.00,
    currentBalance: 9400.00,
    annualInterestRate: 6.75,
    interestType: 'FIXED',
    monthlyInstallment: 380.00,
    totalInstallments: 48,
    remainingInstallments: 26,
    startDate: '2024-11-01',
    endDate: '2028-10-30',
    currency: 'USD',
    visibility: 'FAMILY',
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
    isDeleted: false
  },
  {
    id: 'dbt-2',
    userId: 'usr-1',
    name: 'Crédito Educativo Maestría',
    creditor: 'Sallie Mae',
    type: 'CONSUMER',
    initialCapital: 8500.00,
    currentBalance: 3200.00,
    annualInterestRate: 11.20,
    interestType: 'FIXED',
    monthlyInstallment: 240.00,
    totalInstallments: 36,
    remainingInstallments: 14,
    startDate: '2025-01-10',
    endDate: '2027-12-10',
    currency: 'USD',
    visibility: 'PRIVATE',
    createdAt: '2026-01-15T09:45:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
    isDeleted: false
  },
  {
    id: 'dbt-3',
    userId: 'usr-2',
    familyGroupId: 'fam-1',
    name: 'Refacción Cocina (Préstamo Personal)',
    creditor: 'SoFi Bank',
    type: 'PERSONAL',
    initialCapital: 5000.00,
    currentBalance: 1800.00,
    annualInterestRate: 14.50,
    interestType: 'FIXED',
    monthlyInstallment: 220.00,
    totalInstallments: 24,
    remainingInstallments: 9,
    startDate: '2025-06-01',
    endDate: '2027-06-01',
    currency: 'USD',
    visibility: 'SHARED',
    createdAt: '2026-01-20T15:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
    isDeleted: false
  }
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'gol-1',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Fondo de Emergencia (6 meses)',
    type: 'EMERGENCY_FUND',
    targetAmount: 20000.00,
    currentAmount: 12500.00,
    targetDate: '2027-06-30',
    currency: 'USD',
    visibility: 'FAMILY',
    monthlyPlannedContribution: 500.00,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-10-05T14:00:00Z',
    isDeleted: false
  },
  {
    id: 'gol-2',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Vacaciones Familiares Europa 2027',
    type: 'TRAVEL',
    targetAmount: 6000.00,
    currentAmount: 2400.00,
    targetDate: '2027-07-15',
    currency: 'USD',
    visibility: 'FAMILY',
    monthlyPlannedContribution: 350.00,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
    isDeleted: false
  },
  {
    id: 'gol-3',
    userId: 'usr-2',
    name: 'Cuota Inicial Vivienda Propia',
    type: 'HOUSING',
    targetAmount: 35000.00,
    currentAmount: 8500.00,
    targetDate: '2028-12-31',
    currency: 'USD',
    visibility: 'FAMILY',
    monthlyPlannedContribution: 600.00,
    createdAt: '2026-01-25T16:00:00Z',
    updatedAt: '2026-09-30T10:00:00Z',
    isDeleted: false
  },
  {
    id: 'gol-4',
    userId: 'usr-1',
    name: 'Computadora Portátil Trabajo (Personal)',
    type: 'CUSTOM',
    targetAmount: 2500.00,
    currentAmount: 1400.00,
    targetDate: '2027-03-31',
    currency: 'USD',
    visibility: 'PRIVATE',
    monthlyPlannedContribution: 200.00,
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
    isDeleted: false
  },
  {
    id: 'gol-5',
    userId: 'usr-1',
    name: 'Certificación Cloud AWS (Personal)',
    type: 'EDUCATION',
    targetAmount: 600.00,
    currentAmount: 450.00,
    targetDate: '2026-12-15',
    currency: 'USD',
    visibility: 'PRIVATE',
    monthlyPlannedContribution: 75.00,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
    isDeleted: false
  }
];

const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'bdg-1',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Alimentación & Supermercado',
    category: 'Alimentación & Supermercado',
    limitAmount: 1100.00,
    period: 'MONTHLY',
    currency: 'USD',
    visibility: 'FAMILY',
    alertThresholdPercent: 80,
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    isDeleted: false
  },
  {
    id: 'bdg-2',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Vivienda & Servicios',
    category: 'Vivienda & Servicios',
    limitAmount: 1600.00,
    period: 'MONTHLY',
    currency: 'USD',
    visibility: 'FAMILY',
    alertThresholdPercent: 80,
    createdAt: '2026-01-15T11:15:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    isDeleted: false
  },
  {
    id: 'bdg-3',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Transporte & Movilidad',
    category: 'Transporte & Movilidad',
    limitAmount: 450.00,
    period: 'MONTHLY',
    currency: 'USD',
    visibility: 'FAMILY',
    alertThresholdPercent: 80,
    createdAt: '2026-01-15T11:30:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    isDeleted: false
  },
  {
    id: 'bdg-4',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    name: 'Entretenimiento & Ocio',
    category: 'Entretenimiento & Ocio',
    limitAmount: 350.00,
    period: 'MONTHLY',
    currency: 'USD',
    visibility: 'FAMILY',
    alertThresholdPercent: 80,
    createdAt: '2026-01-15T11:45:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    isDeleted: false
  },
  {
    id: 'bdg-5',
    userId: 'usr-1',
    name: 'Presupuesto Ocio Personal Carlos',
    category: 'Entretenimiento & Ocio',
    limitAmount: 200.00,
    period: 'MONTHLY',
    currency: 'USD',
    visibility: 'PRIVATE',
    alertThresholdPercent: 80,
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    isDeleted: false
  },
  {
    id: 'bdg-6',
    userId: 'usr-1',
    name: 'Desarrollo Profesional & Cursos',
    category: 'Educación & Cursos',
    limitAmount: 150.00,
    period: 'MONTHLY',
    currency: 'USD',
    visibility: 'PRIVATE',
    alertThresholdPercent: 80,
    createdAt: '2026-01-15T12:15:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    isDeleted: false
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    type: 'INCOME',
    amount: 4200.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 4200.00,
    date: '2026-10-01',
    accountId: 'acc-1',
    category: 'Salario & Nómina',
    subcategory: 'Sueldo Base',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Nómina Quincena Carlos - Empresa Tech',
    notes: 'Pago puntual mes de octubre',
    tags: ['salario', 'fijo'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z'
  },
  {
    id: 'tx-102',
    userId: 'usr-2',
    familyGroupId: 'fam-1',
    type: 'INCOME',
    amount: 3100.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 3100.00,
    date: '2026-10-01',
    accountId: 'acc-3',
    category: 'Salario & Nómina',
    subcategory: 'Sueldo Base',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Nómina Laura - Sector Salud',
    notes: 'Depósito mensual',
    tags: ['salario', 'fijo'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tx-103',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    type: 'EXPENSE',
    amount: 1250.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 1250.00,
    date: '2026-10-02',
    accountId: 'acc-1',
    category: 'Vivienda & Servicios',
    subcategory: 'Alquiler/Hipoteca',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Pago Renta Departamento Mensual',
    tags: ['vivienda', 'fijo'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-02T11:00:00Z',
    updatedAt: '2026-10-02T11:00:00Z'
  },
  {
    id: 'tx-104',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    type: 'EXPENSE',
    amount: 345.80,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 345.80,
    date: '2026-10-03',
    accountId: 'acc-1',
    creditCardId: 'crd-1',
    category: 'Alimentación & Supermercado',
    subcategory: 'Supermercado',
    paymentMethod: 'CREDIT_CARD',
    description: 'Compra Mercado Quincenal Costco',
    tags: ['mercado', 'hogar'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-03T16:20:00Z',
    updatedAt: '2026-10-03T16:20:00Z'
  },
  {
    id: 'tx-105',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    type: 'DEBT_PAYMENT',
    amount: 380.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 380.00,
    date: '2026-10-04',
    accountId: 'acc-1',
    debtId: 'dbt-1',
    category: 'Transporte & Movilidad',
    subcategory: 'Mantenimiento',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Cuota Mensual Préstamo SUV Toyota',
    tags: ['deuda', 'auto'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-04T14:00:00Z',
    updatedAt: '2026-10-04T14:00:00Z'
  },
  {
    id: 'tx-106',
    userId: 'usr-2',
    familyGroupId: 'fam-1',
    type: 'EXPENSE',
    amount: 185.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 185.00,
    date: '2026-10-04',
    accountId: 'acc-3',
    creditCardId: 'crd-2',
    category: 'Alimentación & Supermercado',
    subcategory: 'Supermercado',
    paymentMethod: 'CREDIT_CARD',
    description: 'Supermercado Trader Joes & Frutería',
    tags: ['mercado'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-04T17:40:00Z',
    updatedAt: '2026-10-04T17:40:00Z'
  },
  {
    id: 'tx-107',
    userId: 'usr-1',
    type: 'EXPENSE',
    amount: 75.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 75.00,
    date: '2026-10-05',
    accountId: 'acc-4',
    category: 'Transporte & Movilidad',
    subcategory: 'Gasolina',
    paymentMethod: 'CASH',
    description: 'Tanque Lleno Gasolinera Shell',
    tags: ['auto', 'gasolina'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-05T08:30:00Z',
    updatedAt: '2026-10-05T08:30:00Z'
  },
  {
    id: 'tx-108',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    type: 'TRANSFER',
    amount: 500.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 500.00,
    date: '2026-10-05',
    accountId: 'acc-1',
    destinationAccountId: 'acc-2',
    category: 'Otros Ingresos',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Aporte mensual automático al Fondo de Emergencia',
    tags: ['ahorro', 'meta'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-05T12:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'tx-109',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    type: 'EXPENSE',
    amount: 120.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 120.00,
    date: '2026-10-05',
    accountId: 'acc-1',
    category: 'Entretenimiento & Ocio',
    subcategory: 'Restaurantes',
    paymentMethod: 'DEBIT_CARD',
    description: 'Cena Familiar Fin de Semana',
    tags: ['salida', 'restaurante'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-05T20:45:00Z',
    updatedAt: '2026-10-05T20:45:00Z'
  },
  {
    id: 'tx-110',
    userId: 'usr-1',
    familyGroupId: 'fam-1',
    type: 'EXPENSE',
    amount: 25.99,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 25.99,
    date: '2026-10-06',
    accountId: 'acc-1',
    category: 'Entretenimiento & Ocio',
    subcategory: 'Streaming',
    paymentMethod: 'DEBIT_CARD',
    description: 'Suscripción Netflix & Spotify Familiar',
    tags: ['suscripcion', 'fijo'],
    visibility: 'FAMILY',
    isDeleted: false,
    createdAt: '2026-10-06T06:10:00Z',
    updatedAt: '2026-10-06T06:10:00Z'
  },
  {
    id: 'tx-111',
    userId: 'usr-1',
    type: 'INCOME',
    amount: 750.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 750.00,
    date: '2026-10-03',
    accountId: 'acc-6',
    category: 'Honorarios & Freelance',
    subcategory: 'Consultoría',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Honorarios Consultoría de Software (Personal)',
    notes: 'Proyecto particular fin de semana',
    tags: ['freelance', 'personal'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-03T11:00:00Z',
    updatedAt: '2026-10-03T11:00:00Z'
  },
  {
    id: 'tx-112',
    userId: 'usr-1',
    type: 'EXPENSE',
    amount: 24.99,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 24.99,
    date: '2026-10-04',
    accountId: 'acc-6',
    category: 'Educación & Cursos',
    subcategory: 'Plataformas',
    paymentMethod: 'DEBIT_CARD',
    description: 'Curso Online de Arquitectura Cloud (Personal)',
    tags: ['educacion', 'personal'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'tx-113',
    userId: 'usr-1',
    type: 'EXPENSE',
    amount: 18.50,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 18.50,
    date: '2026-10-05',
    accountId: 'acc-4',
    category: 'Alimentación & Supermercado',
    subcategory: 'Cafés',
    paymentMethod: 'CASH',
    description: 'Café y Almuerzo de Trabajo Individual',
    tags: ['personal', 'almuerzo'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-05T13:30:00Z',
    updatedAt: '2026-10-05T13:30:00Z'
  },
  {
    id: 'tx-114',
    userId: 'usr-1',
    type: 'EXPENSE',
    amount: 45.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 45.00,
    date: '2026-10-02',
    accountId: 'acc-6',
    category: 'Salud & Bienestar',
    subcategory: 'Gimnasio',
    paymentMethod: 'DEBIT_CARD',
    description: 'Membresía Mensual Gimnasio Personal (Carlos)',
    tags: ['gimnasio', 'personal'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-02T08:00:00Z',
    updatedAt: '2026-10-02T08:00:00Z'
  },
  {
    id: 'tx-115',
    userId: 'usr-1',
    type: 'DEBT_PAYMENT',
    amount: 240.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 240.00,
    date: '2026-10-03',
    accountId: 'acc-6',
    debtId: 'dbt-2',
    category: 'Educación & Cursos',
    subcategory: 'Colegio/Universidad',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Cuota Préstamo Educativo Maestría (Personal Carlos)',
    tags: ['deuda', 'educacion', 'personal'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-03T09:30:00Z',
    updatedAt: '2026-10-03T09:30:00Z'
  },
  {
    id: 'tx-116',
    userId: 'usr-1',
    type: 'INCOME',
    amount: 850.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 850.00,
    date: '2026-10-04',
    accountId: 'acc-6',
    category: 'Honorarios & Freelance',
    subcategory: 'Proyectos',
    paymentMethod: 'BANK_TRANSFER',
    description: 'Cobro Proyecto Particular Freelance Web (Personal)',
    tags: ['freelance', 'ingreso', 'personal'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-04T15:00:00Z',
    updatedAt: '2026-10-04T15:00:00Z'
  },
  {
    id: 'tx-117',
    userId: 'usr-1',
    type: 'EXPENSE',
    amount: 35.00,
    currency: 'USD',
    exchangeRateUsed: 1.0,
    amountInBaseCurrency: 35.00,
    date: '2026-10-05',
    accountId: 'acc-4',
    category: 'Educación & Cursos',
    subcategory: 'Libros',
    paymentMethod: 'CASH',
    description: 'Libros Técnicos de Finanzas & Arquitectura (Personal)',
    tags: ['libros', 'personal'],
    visibility: 'PRIVATE',
    isDeleted: false,
    createdAt: '2026-10-05T16:00:00Z',
    updatedAt: '2026-10-05T16:00:00Z'
  }
];

const INITIAL_SCHEDULED: ScheduledTransaction[] = [
  {
    id: 'sch-1',
    userId: 'usr-1',
    type: 'EXPENSE',
    amount: 85.00,
    currency: 'USD',
    scheduledDate: '2026-10-15',
    frequency: 'MONTHLY',
    accountId: 'acc-1',
    category: 'Vivienda & Servicios',
    description: 'Pago mensual de Internet Fibra Óptica',
    status: 'SCHEDULED',
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'sch-2',
    userId: 'usr-1',
    type: 'DEBT_PAYMENT',
    amount: 240.00,
    currency: 'USD',
    scheduledDate: '2026-10-10',
    frequency: 'MONTHLY',
    accountId: 'acc-1',
    category: 'Educación & Cursos',
    description: 'Cuota programada Crédito Educativo Sallie Mae',
    status: 'SCHEDULED',
    createdAt: '2026-10-01T10:15:00Z'
  }
];

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    userId: 'usr-1',
    type: 'CARD_DUE_DATE',
    severity: 'WARNING',
    title: 'Vencimiento de Tarjeta Próximo',
    message: 'La tarjeta Sapphire Preferred vence el día 15 de este mes. Saldo a pagar: $1,840.50.',
    entityId: 'crd-1',
    isRead: false,
    date: '2026-10-06',
    createdAt: '2026-10-06T07:00:00Z'
  },
  {
    id: 'alt-2',
    userId: 'usr-1',
    type: 'BUDGET_WARNING_80',
    severity: 'WARNING',
    title: '80% Presupuesto Consumido',
    message: 'Has utilizado más del 80% del presupuesto de Alimentación & Supermercado ($530.80 / $1,100).',
    entityId: 'bdg-1',
    isRead: false,
    date: '2026-10-05',
    createdAt: '2026-10-05T18:00:00Z'
  },
  {
    id: 'alt-3',
    userId: 'usr-1',
    type: 'UPCOMING_INSTALLMENT',
    severity: 'INFO',
    title: 'Próxima cuota de deuda',
    message: 'Cuota de $240.00 del Crédito Educativo vence en 4 días (10 de octubre).',
    entityId: 'dbt-2',
    isRead: true,
    date: '2026-10-06',
    createdAt: '2026-10-06T08:00:00Z'
  }
];

const INITIAL_AUDIT: AuditLog[] = [
  {
    id: 'aud-1',
    userId: 'usr-1',
    userName: 'Carlos Pérez',
    entityType: 'Transaction',
    entityId: 'tx-101',
    action: 'CREATE',
    previousValue: null,
    newValue: { amount: 4200, category: 'Salario & Nómina', date: '2026-10-01' },
    timestamp: '2026-10-01T09:00:00Z'
  },
  {
    id: 'aud-2',
    userId: 'usr-1',
    userName: 'Carlos Pérez',
    entityType: 'Goal',
    entityId: 'gol-1',
    action: 'UPDATE',
    previousValue: { currentAmount: 12000 },
    newValue: { currentAmount: 12500 },
    timestamp: '2026-10-05T12:00:00Z'
  }
];

// Persistent state instance (Google Cloud Firestore + Real-Time Sync)
class RelationalDatabase {
  private state: DatabaseState;
  private currentUserId: string = 'usr-1';
  private currentCurrency: CurrencyCode = 'USD';
  private subscribers: Array<() => void> = [];
  private activeScope: FinancialScope = 'PERSONAL';
  private authenticated: boolean = false;
  private pending2FAUser: User | null = null;
  private firestoreInitialized: boolean = false;
  private isFirestoreOnline: boolean = false;
  private unsubscribers: Array<() => void> = [];

  constructor() {
    this.state = this.loadInitialState();
    this.initFirestoreSync();
  }

  public getFirestoreOnlineStatus(): boolean {
    return this.isFirestoreOnline;
  }

  public initFirestoreSync() {
    if (this.firestoreInitialized) return;
    this.firestoreInitialized = true;

    // Conectar y sincronizar con Google Cloud Firestore
    FirestoreService.seedInitialDataIfNeeded({
      users: this.state.users,
      accounts: this.state.accounts,
      creditCards: this.state.creditCards,
      debts: this.state.debts,
      budgets: this.state.budgets,
      goals: this.state.goals,
      transactions: this.state.transactions
    }).then(() => {
      this.isFirestoreOnline = true;
      this.startFirestoreRealtimeSubscriptions();
      this.notify();
    }).catch(err => {
      console.warn('[Firestore] Error inicializando seed Firestore:', err);
      this.startFirestoreRealtimeSubscriptions();
    });
  }

  private startFirestoreRealtimeSubscriptions() {
    // 1. Cuentas en tiempo real
    const unsubAcc = FirestoreService.subscribeAccounts(accounts => {
      if (accounts && accounts.length > 0) {
        this.state.accounts = accounts;
        this.syncAccountBalances();
        this.isFirestoreOnline = true;
        this.notify();
      }
    });
    this.unsubscribers.push(unsubAcc);

    // 2. Tarjetas de crédito en tiempo real
    const unsubCards = FirestoreService.subscribeCreditCards(cards => {
      if (cards && cards.length > 0) {
        this.state.creditCards = cards;
        this.syncCreditCardUsages();
        this.isFirestoreOnline = true;
        this.notify();
      }
    });
    this.unsubscribers.push(unsubCards);

    // 3. Deudas en tiempo real
    const unsubDebts = FirestoreService.subscribeDebts(debts => {
      if (debts && debts.length > 0) {
        this.state.debts = debts;
        this.isFirestoreOnline = true;
        this.notify();
      }
    });
    this.unsubscribers.push(unsubDebts);

    // 4. Transacciones en tiempo real
    const unsubTxs = FirestoreService.subscribeTransactions(txs => {
      if (txs && txs.length > 0) {
        this.state.transactions = txs;
        this.syncAccountBalances();
        this.syncCreditCardUsages();
        this.checkBudgetAlerts();
        this.isFirestoreOnline = true;
        this.notify();
      }
    });
    this.unsubscribers.push(unsubTxs);

    // 5. Presupuestos en tiempo real
    const unsubBdg = FirestoreService.subscribeBudgets(budgets => {
      if (budgets && budgets.length > 0) {
        this.state.budgets = budgets;
        this.checkBudgetAlerts();
        this.isFirestoreOnline = true;
        this.notify();
      }
    });
    this.unsubscribers.push(unsubBdg);

    // 6. Metas en tiempo real
    const unsubGoals = FirestoreService.subscribeGoals(goals => {
      if (goals && goals.length > 0) {
        this.state.goals = goals;
        this.isFirestoreOnline = true;
        this.notify();
      }
    });
    this.unsubscribers.push(unsubGoals);

    // 7. Usuarios en tiempo real
    const unsubUsers = FirestoreService.subscribeUsers(users => {
      if (users && users.length > 0) {
        this.state.users = users;
        this.isFirestoreOnline = true;
        this.notify();
      }
    });
    this.unsubscribers.push(unsubUsers);
  }

  private loadInitialState(): DatabaseState {
    return {
      users: [...INITIAL_USERS],
      familyGroups: [...INITIAL_FAMILY],
      familyMembers: [...INITIAL_MEMBERS],
      accounts: [...INITIAL_ACCOUNTS],
      creditCards: [...INITIAL_CREDIT_CARDS],
      debts: [...INITIAL_DEBTS],
      goals: [...INITIAL_GOALS],
      budgets: [...INITIAL_BUDGETS],
      categories: [...INITIAL_CATEGORIES],
      transactions: [...INITIAL_TRANSACTIONS],
      scheduledTransactions: [...INITIAL_SCHEDULED],
      alerts: [...INITIAL_ALERTS],
      auditLogs: [...INITIAL_AUDIT],
      tags: ['salario', 'fijo', 'vivienda', 'mercado', 'hogar', 'deuda', 'auto', 'ahorro', 'meta', 'restaurante', 'suscripcion']
    };
  }

  public subscribe(cb: () => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  // -------------------------------------------------------------
  // AUTHENTICATION & SESSION MANAGEMENT
  // -------------------------------------------------------------
  public isUserAuthenticated(): boolean {
    return this.authenticated;
  }

  public getPending2FAUser(): User | null {
    return this.pending2FAUser;
  }

  public login(email: string, _password?: string): { success: boolean; requires2FA?: boolean; user?: User; error?: string } {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'No se encontró un usuario con este correo electrónico.' };
    }

    if (user.twoFactorEnabled) {
      this.pending2FAUser = user;
      this.notify();
      return { success: false, requires2FA: true, user };
    }

    this.currentUserId = user.id;
    this.authenticated = true;
    this.pending2FAUser = null;
    this.recordAudit('UserSession', user.id, 'CREATE', null, { email: user.email, method: 'EMAIL_PASSWORD' });
    this.notify();
    return { success: true, user };
  }

  public verify2FA(code: string): { success: boolean; user?: User; error?: string } {
    if (!this.pending2FAUser) {
      return { success: false, error: 'No hay una verificación de dos factores pendiente.' };
    }

    if (code.trim().length !== 6) {
      return { success: false, error: 'El código de seguridad debe tener exactamente 6 dígitos.' };
    }

    const user = this.pending2FAUser;
    this.currentUserId = user.id;
    this.authenticated = true;
    this.pending2FAUser = null;
    this.recordAudit('UserSession', user.id, 'CREATE', null, { email: user.email, method: '2FA_TOTP' });
    this.notify();
    return { success: true, user };
  }

  public loginOAuth(provider: 'GOOGLE' | 'MICROSOFT'): { success: boolean; user?: User } {
    const targetEmail = provider === 'GOOGLE' ? 'carlos.perez@ejemplo.com' : 'laura.gomez@ejemplo.com';
    let user = this.state.users.find(u => u.email === targetEmail);
    if (!user) {
      user = this.state.users[0];
    }

    this.currentUserId = user.id;
    this.authenticated = true;
    this.pending2FAUser = null;
    this.recordAudit('UserSession', user.id, 'CREATE', null, { email: user.email, provider, method: 'OAUTH' });
    this.notify();
    return { success: true, user };
  }

  public register(data: { name: string; email: string; password?: string; currency?: CurrencyCode; role?: UserRole }): { success: boolean; user?: User; error?: string } {
    if (this.state.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const id = `usr-${Date.now()}`;
    const now = new Date().toISOString();
    const newUser: User = {
      id,
      name: data.name,
      email: data.email,
      role: data.role || 'MEMBER',
      familyGroupId: 'fam-1',
      isEmailVerified: true,
      twoFactorEnabled: false,
      preferredCurrency: data.currency || 'USD',
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    this.state.users.push(newUser);
    
    // Crear cuenta personal inicial
    this.createAccount({
      userId: id,
      name: `Billetera Personal de ${data.name.split(' ')[0]}`,
      type: 'CASH',
      institutionName: 'Efectivo',
      currency: data.currency || 'USD',
      initialBalance: 100,
      visibility: 'PRIVATE',
      lowBalanceThreshold: 20
    });

    this.currentUserId = newUser.id;
    this.authenticated = true;
    this.pending2FAUser = null;
    this.recordAudit('User', id, 'CREATE', null, { name: data.name, email: data.email });
    this.notify();
    return { success: true, user: newUser };
  }

  public requestPasswordReset(email: string): { success: boolean; message: string } {
    return {
      success: true,
      message: `Se ha enviado un enlace de restablecimiento seguro a ${email}. Revisa tu bandeja de entrada.`
    };
  }

  public logout(): void {
    const user = this.getCurrentUser();
    this.recordAudit('UserSession', user.id, 'UPDATE', null, { status: 'LOGGED_OUT' });
    this.authenticated = false;
    this.pending2FAUser = null;
    this.notify();
  }

  // -------------------------------------------------------------
  // SCOPE MANAGEMENT (PERSONAL VS FAMILIAR)
  // -------------------------------------------------------------
  public getActiveScope(): FinancialScope {
    return this.activeScope;
  }

  public setActiveScope(scope: FinancialScope): void {
    this.activeScope = scope;
    this.notify();
  }

  public getScopedAccounts(): Account[] {
    const current = this.getCurrentUser();
    if (this.activeScope === 'ALL') {
      return this.state.accounts.filter(a => !a.isDeleted);
    }
    if (this.activeScope === 'PERSONAL') {
      return this.state.accounts.filter(a => !a.isDeleted && a.userId === current.id && a.visibility === 'PRIVATE');
    }
    return this.state.accounts.filter(a => !a.isDeleted && (a.visibility === 'FAMILY' || a.visibility === 'SHARED'));
  }

  public getScopedTransactions(): Transaction[] {
    const current = this.getCurrentUser();
    if (this.activeScope === 'ALL') {
      return this.state.transactions.filter(t => !t.isDeleted);
    }
    if (this.activeScope === 'PERSONAL') {
      return this.state.transactions.filter(t => !t.isDeleted && t.userId === current.id && t.visibility === 'PRIVATE');
    }
    return this.state.transactions.filter(t => !t.isDeleted && (t.visibility === 'FAMILY' || t.visibility === 'SHARED'));
  }

  public getScopedCreditCards(): CreditCard[] {
    const current = this.getCurrentUser();
    if (this.activeScope === 'ALL') {
      return this.state.creditCards.filter(c => !c.isDeleted);
    }
    if (this.activeScope === 'PERSONAL') {
      return this.state.creditCards.filter(c => !c.isDeleted && c.userId === current.id && c.visibility === 'PRIVATE');
    }
    return this.state.creditCards.filter(c => !c.isDeleted && (c.visibility === 'FAMILY' || c.visibility === 'SHARED'));
  }

  public getScopedDebts(): Debt[] {
    const current = this.getCurrentUser();
    if (this.activeScope === 'ALL') {
      return this.state.debts.filter(d => !d.isDeleted);
    }
    if (this.activeScope === 'PERSONAL') {
      return this.state.debts.filter(d => !d.isDeleted && d.userId === current.id && d.visibility === 'PRIVATE');
    }
    return this.state.debts.filter(d => !d.isDeleted && (d.visibility === 'FAMILY' || d.visibility === 'SHARED'));
  }

  public getScopedBudgets(): Budget[] {
    const current = this.getCurrentUser();
    if (this.activeScope === 'ALL') {
      return this.state.budgets.filter(b => !b.isDeleted);
    }
    if (this.activeScope === 'PERSONAL') {
      return this.state.budgets.filter(b => !b.isDeleted && b.userId === current.id && b.visibility === 'PRIVATE');
    }
    return this.state.budgets.filter(b => !b.isDeleted && (b.visibility === 'FAMILY' || b.visibility === 'SHARED'));
  }

  public getScopedGoals(): Goal[] {
    const current = this.getCurrentUser();
    if (this.activeScope === 'ALL') {
      return this.state.goals.filter(g => !g.isDeleted);
    }
    if (this.activeScope === 'PERSONAL') {
      return this.state.goals.filter(g => !g.isDeleted && g.userId === current.id && g.visibility === 'PRIVATE');
    }
    return this.state.goals.filter(g => !g.isDeleted && (g.visibility === 'FAMILY' || g.visibility === 'SHARED'));
  }

  public getPersonalVsFamilyBreakdown() {
    const current = this.getCurrentUser();
    const curr = this.currentCurrency;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Personal entities
    const pAccs = this.state.accounts.filter(a => !a.isDeleted && a.userId === current.id && a.visibility === 'PRIVATE');
    const pTxs = this.state.transactions.filter(t => !t.isDeleted && t.userId === current.id && t.visibility === 'PRIVATE');
    const pMonthTxs = pTxs.filter(t => t.date.startsWith(currentMonth));
    const pDebts = this.state.debts.filter(d => !d.isDeleted && d.userId === current.id && d.visibility === 'PRIVATE');
    const pCards = this.state.creditCards.filter(c => !c.isDeleted && c.userId === current.id && c.visibility === 'PRIVATE');
    const pBalance = FinancialEngine.calculateGeneralBalance(pMonthTxs, curr);
    const pLiquidAssets = pAccs.reduce((sum, a) => sum + FinancialEngine.convertCurrency(a.currentBalance, a.currency, curr).convertedAmount, 0);
    const pTotalDebt = pDebts.reduce((sum, d) => sum + FinancialEngine.convertCurrency(d.currentBalance, d.currency, curr).convertedAmount, 0);
    const pUsedCards = pCards.reduce((sum, c) => sum + FinancialEngine.convertCurrency(c.usedAmount, c.currency, curr).convertedAmount, 0);

    // Family entities
    const fAccs = this.state.accounts.filter(a => !a.isDeleted && (a.visibility === 'FAMILY' || a.visibility === 'SHARED'));
    const fTxs = this.state.transactions.filter(t => !t.isDeleted && (t.visibility === 'FAMILY' || t.visibility === 'SHARED'));
    const fMonthTxs = fTxs.filter(t => t.date.startsWith(currentMonth));
    const fDebts = this.state.debts.filter(d => !d.isDeleted && (d.visibility === 'FAMILY' || d.visibility === 'SHARED'));
    const fCards = this.state.creditCards.filter(c => !c.isDeleted && (c.visibility === 'FAMILY' || c.visibility === 'SHARED'));
    const fBalance = FinancialEngine.calculateGeneralBalance(fMonthTxs, curr);
    const fLiquidAssets = fAccs.reduce((sum, a) => sum + FinancialEngine.convertCurrency(a.currentBalance, a.currency, curr).convertedAmount, 0);
    const fTotalDebt = fDebts.reduce((sum, d) => sum + FinancialEngine.convertCurrency(d.currentBalance, d.currency, curr).convertedAmount, 0);
    const fUsedCards = fCards.reduce((sum, c) => sum + FinancialEngine.convertCurrency(c.usedAmount, c.currency, curr).convertedAmount, 0);

    // Member contributions to Family income
    const familyIncomes = fMonthTxs.filter(t => t.type === 'INCOME');
    const memberContributions = this.state.users.map(u => {
      const uIncomes = familyIncomes.filter(t => t.userId === u.id);
      const total = uIncomes.reduce((sum, t) => sum + FinancialEngine.convertCurrency(t.amount, t.currency, curr).convertedAmount, 0);
      return {
        userId: u.id,
        name: u.name,
        amount: total,
        percentage: fBalance.totalIncome > 0 ? Math.round((total / fBalance.totalIncome) * 100) : 0
      };
    }).filter(m => m.amount > 0 || m.userId === current.id);

    return {
      personal: {
        liquidAssets: pLiquidAssets,
        monthlyIncome: pBalance.totalIncome,
        monthlyExpense: pBalance.totalExpense,
        netBalance: pBalance.netBalance,
        totalDebt: pTotalDebt,
        usedCards: pUsedCards,
        accountCount: pAccs.length,
        transactionCount: pMonthTxs.length
      },
      family: {
        liquidAssets: fLiquidAssets,
        monthlyIncome: fBalance.totalIncome,
        monthlyExpense: fBalance.totalExpense,
        netBalance: fBalance.netBalance,
        totalDebt: fTotalDebt,
        usedCards: fUsedCards,
        accountCount: fAccs.length,
        transactionCount: fMonthTxs.length
      },
      consolidated: {
        totalLiquidAssets: pLiquidAssets + fLiquidAssets,
        totalIncome: pBalance.totalIncome + fBalance.totalIncome,
        totalExpense: pBalance.totalExpense + fBalance.totalExpense,
        netBalance: pBalance.netBalance + fBalance.netBalance,
        totalDebt: pTotalDebt + fTotalDebt,
        totalUsedCards: pUsedCards + fUsedCards
      },
      memberContributions
    };
  }

  public createAccessUser(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    preferredCurrency: CurrencyCode;
    twoFactorEnabled?: boolean;
    initialPersonalBalance?: number;
  }): { success: boolean; user?: User; error?: string } {
    if (this.state.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico.' };
    }
    const id = `usr-${Date.now()}`;
    const now = new Date().toISOString();
    const newUser: User = {
      id,
      name: data.name,
      email: data.email,
      role: data.role,
      familyGroupId: 'fam-1',
      isEmailVerified: true,
      twoFactorEnabled: !!data.twoFactorEnabled,
      preferredCurrency: data.preferredCurrency || 'USD',
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    this.state.users.push(newUser);

    // Create a personal wallet account for the new user
    this.createAccount({
      userId: id,
      name: `Billetera Personal de ${data.name.split(' ')[0]}`,
      type: 'CASH',
      institutionName: 'Efectivo Personal',
      currency: data.preferredCurrency || 'USD',
      initialBalance: data.initialPersonalBalance ?? 150,
      visibility: 'PRIVATE',
      lowBalanceThreshold: 20
    });

    // Add to family members
    this.state.familyMembers.push({
      id: `mem-${Date.now()}`,
      familyGroupId: 'fam-1',
      userId: id,
      role: data.role,
      canViewAll: data.role === 'ADMIN' || data.role === 'MEMBER',
      canManageBudgets: data.role === 'ADMIN',
      joinedAt: now
    });

    this.recordAudit('UserAccess', id, 'CREATE', null, { name: data.name, email: data.email, role: data.role });
    FirestoreService.setUser(newUser).catch(err => console.warn('[Firestore] Error guardando usuario:', err));
    this.notify();
    return { success: true, user: newUser };
  }

  public getRegisteredAccesses(): User[] {
    return this.state.users.filter(u => !u.isDeleted);
  }

  // Active Context
  public getCurrentUser(): User {
    return this.state.users.find(u => u.id === this.currentUserId) || this.state.users[0];
  }

  public setCurrentUserId(id: string) {
    if (this.state.users.some(u => u.id === id)) {
      this.currentUserId = id;
      this.notify();
    }
  }

  public getCurrentCurrency(): CurrencyCode {
    return this.currentCurrency;
  }

  public setCurrentCurrency(currency: CurrencyCode) {
    this.currentCurrency = currency;
    this.notify();
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // -------------------------------------------------------------
  // AUDIT LOG HELPER
  // -------------------------------------------------------------
  public recordAudit(
    entityType: string,
    entityId: string,
    action: AuditAction,
    previousValue: any,
    newValue: any
  ) {
    const user = this.getCurrentUser();
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      userName: user.name,
      entityType,
      entityId,
      action,
      previousValue: previousValue ? JSON.parse(JSON.stringify(previousValue)) : null,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(log);
  }

  // -------------------------------------------------------------
  // TRANSACTIONS CRUD (Afecta Saldos Automáticamente)
  // -------------------------------------------------------------
  public getTransactions(includeDeleted = false): Transaction[] {
    return this.state.transactions.filter(t => includeDeleted || !t.isDeleted);
  }

  public createTransaction(txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'amountInBaseCurrency'>): Transaction {
    const id = `tx-${Date.now()}`;
    const now = new Date().toISOString();

    const rate = txData.exchangeRateUsed || FinancialEngine.convertCurrency(1, txData.currency, 'USD').rateUsed;
    const amountInBaseCurrency = FinancialEngine.convertCurrency(txData.amount, txData.currency, 'USD', rate).convertedAmount;

    const newTx: Transaction = {
      ...txData,
      id,
      exchangeRateUsed: rate,
      amountInBaseCurrency,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.state.transactions.unshift(newTx);
    this.recordAudit('Transaction', id, 'CREATE', null, newTx);

    // Actualizar saldos de cuenta
    this.syncAccountBalances();
    // Actualizar uso de tarjetas
    this.syncCreditCardUsages();
    // Evaluar y disparar alertas de presupuestos
    this.checkBudgetAlerts();

    this.notify();
    return newTx;
  }

  public updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const idx = this.state.transactions.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const prev = { ...this.state.transactions[idx] };
    const updated: Transaction = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.state.transactions[idx] = updated;
    this.recordAudit('Transaction', id, 'UPDATE', prev, updated);

    this.syncAccountBalances();
    this.syncCreditCardUsages();
    this.checkBudgetAlerts();

    this.notify();
    return updated;
  }

  // Soft Delete
  public deleteTransaction(id: string): boolean {
    const idx = this.state.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.transactions[idx] };
    this.state.transactions[idx].isDeleted = true;
    this.state.transactions[idx].updatedAt = new Date().toISOString();

    this.recordAudit('Transaction', id, 'DELETE', prev, { isDeleted: true });

    this.syncAccountBalances();
    this.syncCreditCardUsages();
    this.notify();
    return true;
  }

  // Restore from Trash
  public restoreTransaction(id: string): boolean {
    const idx = this.state.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.transactions[idx] };
    this.state.transactions[idx].isDeleted = false;
    this.state.transactions[idx].updatedAt = new Date().toISOString();

    this.recordAudit('Transaction', id, 'RESTORE', prev, { isDeleted: false });

    this.syncAccountBalances();
    this.syncCreditCardUsages();
    this.notify();
    return true;
  }

  // -------------------------------------------------------------
  // ACCOUNTS CRUD
  // -------------------------------------------------------------
  public getAccounts(includeDeleted = false): Account[] {
    return this.state.accounts.filter(a => includeDeleted || !a.isDeleted);
  }

  public createAccount(accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'currentBalance'>): Account {
    const id = `acc-${Date.now()}`;
    const now = new Date().toISOString();

    const newAccount: Account = {
      ...accountData,
      id,
      currentBalance: accountData.initialBalance,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.state.accounts.push(newAccount);
    this.recordAudit('Account', id, 'CREATE', null, newAccount);
    this.syncAccountBalances();
    this.notify();
    return newAccount;
  }

  public updateAccount(id: string, updates: Partial<Account>): Account | null {
    const idx = this.state.accounts.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const prev = { ...this.state.accounts[idx] };
    const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
    this.state.accounts[idx] = updated;

    this.recordAudit('Account', id, 'UPDATE', prev, updated);
    this.notify();
    return updated;
  }

  public deleteAccount(id: string): boolean {
    const idx = this.state.accounts.findIndex(a => a.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.accounts[idx] };
    this.state.accounts[idx].isDeleted = true;
    this.recordAudit('Account', id, 'DELETE', prev, { isDeleted: true });
    this.notify();
    return true;
  }

  public restoreAccount(id: string): boolean {
    const idx = this.state.accounts.findIndex(a => a.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.accounts[idx] };
    this.state.accounts[idx].isDeleted = false;
    this.recordAudit('Account', id, 'RESTORE', prev, { isDeleted: false });
    this.notify();
    return true;
  }

  // -------------------------------------------------------------
  // CREDIT CARDS CRUD
  // -------------------------------------------------------------
  public getCreditCards(includeDeleted = false): CreditCard[] {
    return this.state.creditCards.filter(c => includeDeleted || !c.isDeleted);
  }

  public createCreditCard(cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'usedAmount'>): CreditCard {
    const id = `crd-${Date.now()}`;
    const now = new Date().toISOString();

    const newCard: CreditCard = {
      ...cardData,
      id,
      usedAmount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.state.creditCards.push(newCard);
    this.recordAudit('CreditCard', id, 'CREATE', null, newCard);
    this.syncCreditCardUsages();
    this.notify();
    return newCard;
  }

  public updateCreditCard(id: string, updates: Partial<CreditCard>): CreditCard | null {
    const idx = this.state.creditCards.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const prev = { ...this.state.creditCards[idx] };
    const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
    this.state.creditCards[idx] = updated;

    this.recordAudit('CreditCard', id, 'UPDATE', prev, updated);
    this.notify();
    return updated;
  }

  public deleteCreditCard(id: string): boolean {
    const idx = this.state.creditCards.findIndex(c => c.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.creditCards[idx] };
    this.state.creditCards[idx].isDeleted = true;
    this.recordAudit('CreditCard', id, 'DELETE', prev, { isDeleted: true });
    this.notify();
    return true;
  }

  public restoreCreditCard(id: string): boolean {
    const idx = this.state.creditCards.findIndex(c => c.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.creditCards[idx] };
    this.state.creditCards[idx].isDeleted = false;
    this.recordAudit('CreditCard', id, 'RESTORE', prev, { isDeleted: false });
    this.notify();
    return true;
  }

  // -------------------------------------------------------------
  // DEBTS CRUD
  // -------------------------------------------------------------
  public getDebts(includeDeleted = false): Debt[] {
    return this.state.debts.filter(d => includeDeleted || !d.isDeleted);
  }

  public createDebt(debtData: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Debt {
    const id = `dbt-${Date.now()}`;
    const now = new Date().toISOString();

    const newDebt: Debt = {
      ...debtData,
      id,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.state.debts.push(newDebt);
    this.recordAudit('Debt', id, 'CREATE', null, newDebt);
    this.notify();
    return newDebt;
  }

  public updateDebt(id: string, updates: Partial<Debt>): Debt | null {
    const idx = this.state.debts.findIndex(d => d.id === id);
    if (idx === -1) return null;

    const prev = { ...this.state.debts[idx] };
    const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
    this.state.debts[idx] = updated;

    this.recordAudit('Debt', id, 'UPDATE', prev, updated);
    this.notify();
    return updated;
  }

  public deleteDebt(id: string): boolean {
    const idx = this.state.debts.findIndex(d => d.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.debts[idx] };
    this.state.debts[idx].isDeleted = true;
    this.recordAudit('Debt', id, 'DELETE', prev, { isDeleted: true });
    this.notify();
    return true;
  }

  public restoreDebt(id: string): boolean {
    const idx = this.state.debts.findIndex(d => d.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.debts[idx] };
    this.state.debts[idx].isDeleted = false;
    this.recordAudit('Debt', id, 'RESTORE', prev, { isDeleted: false });
    this.notify();
    return true;
  }

  // -------------------------------------------------------------
  // GOALS CRUD
  // -------------------------------------------------------------
  public getGoals(includeDeleted = false): Goal[] {
    return this.state.goals.filter(g => includeDeleted || !g.isDeleted);
  }

  public createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Goal {
    const id = `gol-${Date.now()}`;
    const now = new Date().toISOString();

    const newGoal: Goal = {
      ...goalData,
      id,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.state.goals.push(newGoal);
    this.recordAudit('Goal', id, 'CREATE', null, newGoal);
    this.notify();
    return newGoal;
  }

  public updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const idx = this.state.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;

    const prev = { ...this.state.goals[idx] };
    const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
    this.state.goals[idx] = updated;

    this.recordAudit('Goal', id, 'UPDATE', prev, updated);
    this.notify();
    return updated;
  }

  public deleteGoal(id: string): boolean {
    const idx = this.state.goals.findIndex(g => g.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.goals[idx] };
    this.state.goals[idx].isDeleted = true;
    this.recordAudit('Goal', id, 'DELETE', prev, { isDeleted: true });
    this.notify();
    return true;
  }

  public restoreGoal(id: string): boolean {
    const idx = this.state.goals.findIndex(g => g.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.goals[idx] };
    this.state.goals[idx].isDeleted = false;
    this.recordAudit('Goal', id, 'RESTORE', prev, { isDeleted: false });
    this.notify();
    return true;
  }

  // -------------------------------------------------------------
  // BUDGETS CRUD
  // -------------------------------------------------------------
  public getBudgets(includeDeleted = false): Budget[] {
    return this.state.budgets.filter(b => includeDeleted || !b.isDeleted);
  }

  public createBudget(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Budget {
    const id = `bdg-${Date.now()}`;
    const now = new Date().toISOString();

    const newBudget: Budget = {
      ...budgetData,
      id,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.state.budgets.push(newBudget);
    this.recordAudit('Budget', id, 'CREATE', null, newBudget);
    this.checkBudgetAlerts();
    this.notify();
    return newBudget;
  }

  public updateBudget(id: string, updates: Partial<Budget>): Budget | null {
    const idx = this.state.budgets.findIndex(b => b.id === id);
    if (idx === -1) return null;

    const prev = { ...this.state.budgets[idx] };
    const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
    this.state.budgets[idx] = updated;

    this.recordAudit('Budget', id, 'UPDATE', prev, updated);
    this.checkBudgetAlerts();
    this.notify();
    return updated;
  }

  public deleteBudget(id: string): boolean {
    const idx = this.state.budgets.findIndex(b => b.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.budgets[idx] };
    this.state.budgets[idx].isDeleted = true;
    this.recordAudit('Budget', id, 'DELETE', prev, { isDeleted: true });
    this.notify();
    return true;
  }

  public restoreBudget(id: string): boolean {
    const idx = this.state.budgets.findIndex(b => b.id === id);
    if (idx === -1) return false;

    const prev = { ...this.state.budgets[idx] };
    this.state.budgets[idx].isDeleted = false;
    this.recordAudit('Budget', id, 'RESTORE', prev, { isDeleted: false });
    this.notify();
    return true;
  }

  // -------------------------------------------------------------
  // SCHEDULED MOVEMENTS (Ejecución real)
  // -------------------------------------------------------------
  public getScheduledTransactions(): ScheduledTransaction[] {
    return this.state.scheduledTransactions;
  }

  public executeScheduledTransaction(id: string): Transaction | null {
    const sch = this.state.scheduledTransactions.find(s => s.id === id);
    if (!sch || sch.status !== 'SCHEDULED') return null;

    const tx = this.createTransaction({
      userId: sch.userId,
      type: sch.type,
      amount: sch.amount,
      currency: sch.currency,
      exchangeRateUsed: 1.0,
      date: new Date().toISOString().split('T')[0],
      accountId: sch.accountId,
      category: sch.category,
      paymentMethod: 'BANK_TRANSFER',
      description: `[Ejecución programada] ${sch.description}`,
      tags: ['programado', 'automatico'],
      visibility: 'FAMILY'
    });

    sch.status = 'EXECUTED';
    sch.executedTransactionId = tx.id;
    this.recordAudit('ScheduledTransaction', id, 'UPDATE', { status: 'SCHEDULED' }, { status: 'EXECUTED', executedTransactionId: tx.id });

    this.notify();
    return tx;
  }

  // -------------------------------------------------------------
  // ALERTS & NOTIFICATIONS
  // -------------------------------------------------------------
  public getAlerts(): Alert[] {
    return this.state.alerts;
  }

  public markAlertAsRead(id: string) {
    const alert = this.state.alerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
      this.notify();
    }
  }

  public clearAllAlerts() {
    this.state.alerts.forEach(a => (a.isRead = true));
    this.notify();
  }

  private checkBudgetAlerts() {
    const activeBudgets = this.getBudgets();
    const activeTxs = this.getTransactions();

    for (const b of activeBudgets) {
      const progress = FinancialEngine.calculateBudgetProgress(b, activeTxs);
      if (progress.isExceeded) {
        // Chequear si ya existe alerta activa
        const exists = this.state.alerts.some(a => a.entityId === b.id && a.type === 'BUDGET_EXCEEDED' && !a.isRead);
        if (!exists) {
          this.state.alerts.unshift({
            id: `alt-bdg-exc-${Date.now()}`,
            userId: this.currentUserId,
            type: 'BUDGET_EXCEEDED',
            severity: 'CRITICAL',
            title: `Presupuesto Excedido: ${b.name}`,
            message: `Has gastado $${progress.spentAmount} de un límite de $${b.limitAmount} (${progress.usedPercent}%).`,
            entityId: b.id,
            isRead: false,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          });
        }
      } else if (progress.isWarning80) {
        const exists = this.state.alerts.some(a => a.entityId === b.id && a.type === 'BUDGET_WARNING_80' && !a.isRead);
        if (!exists) {
          this.state.alerts.unshift({
            id: `alt-bdg-80-${Date.now()}`,
            userId: this.currentUserId,
            type: 'BUDGET_WARNING_80',
            severity: 'WARNING',
            title: `Alerta 80%: ${b.name}`,
            message: `Has consumido el ${progress.usedPercent}% de tu presupuesto ($${progress.spentAmount} / $${b.limitAmount}).`,
            entityId: b.id,
            isRead: false,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // INTERNAL SYNCS & INTEGRITY
  // -------------------------------------------------------------
  private syncAccountBalances() {
    const txs = this.state.transactions;
    for (const acc of this.state.accounts) {
      if (!acc.isDeleted) {
        acc.currentBalance = FinancialEngine.recalculateAccountBalance(acc, txs);
      }
    }
  }

  private syncCreditCardUsages() {
    const txs = this.state.transactions;
    for (const card of this.state.creditCards) {
      if (!card.isDeleted) {
        const usage = FinancialEngine.recalculateCreditCardUsage(card, txs);
        card.usedAmount = usage.usedAmount;
      }
    }
  }

  // -------------------------------------------------------------
  // RESTART / RESET DATA
  // -------------------------------------------------------------
  public resetToInitial() {
    this.state = this.loadInitialState();
    this.syncAccountBalances();
    this.syncCreditCardUsages();
    this.notify();
  }
}

// Global singleton instance
export const db = new RelationalDatabase();
