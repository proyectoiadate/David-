/**
 * Firestore CRUD Service & Real-Time Sync Engine
 * Implementa operaciones asíncronas estándar (setDoc, addDoc, getDocs, updateDoc, deleteDoc)
 * y suscripciones reactivas en tiempo real (onSnapshot).
 */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { firestore, auth, handleFirestoreError, OperationType } from './firebase';
import {
  Account,
  CreditCard,
  Debt,
  Goal,
  Budget,
  Transaction,
  User,
  Category,
  AuditLog
} from '../types/financial';

export class FirestoreService {
  // -------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------
  static async getUser(userId: string): Promise<User | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(firestore, 'users', userId));
      return snap.exists() ? (snap.data() as User) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  static async setUser(user: User): Promise<void> {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(firestore, 'users', user.id), {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public static isCurrentUserAdmin(): boolean {
    const user = auth.currentUser;
    if (!user) return false;
    const email = (user.email || '').toLowerCase();
    return email === 'proyectoiadate@gmail.com' || email === 'carlos.perez@ejemplo.com';
  }

  static subscribeUsers(onData: (users: User[]) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) return () => {};
    const path = 'users';
    const q = this.isCurrentUserAdmin()
      ? collection(firestore, path)
      : query(collection(firestore, path), where('id', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: User[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as User);
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (_) {}
      }
    );
  }

  // -------------------------------------------------------------
  // ACCOUNTS CRUD
  // -------------------------------------------------------------
  static async addAccount(account: Omit<Account, 'id'>, customId?: string): Promise<Account> {
    const id = customId || `acc-${Date.now()}`;
    const path = `accounts/${id}`;
    const newAcc: Account = {
      ...account,
      id,
      createdAt: account.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, 'accounts', id), newAcc);
      return newAcc;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateAccount(id: string, updates: Partial<Account>): Promise<void> {
    const path = `accounts/${id}`;
    try {
      await updateDoc(doc(firestore, 'accounts', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteAccount(id: string, soft = true): Promise<void> {
    const path = `accounts/${id}`;
    try {
      if (soft) {
        await updateDoc(doc(firestore, 'accounts', id), {
          isDeleted: true,
          updatedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(doc(firestore, 'accounts', id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static subscribeAccounts(onData: (accounts: Account[]) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) return () => {};
    const path = 'accounts';
    const q = this.isCurrentUserAdmin()
      ? collection(firestore, path)
      : query(collection(firestore, path), where('userId', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Account[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Account);
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (_) {}
      }
    );
  }

  // -------------------------------------------------------------
  // CREDIT CARDS CRUD
  // -------------------------------------------------------------
  static async addCreditCard(card: Omit<CreditCard, 'id'>, customId?: string): Promise<CreditCard> {
    const id = customId || `crd-${Date.now()}`;
    const path = `creditCards/${id}`;
    const newCard: CreditCard = {
      ...card,
      id,
      createdAt: card.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, 'creditCards', id), newCard);
      return newCard;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<void> {
    const path = `creditCards/${id}`;
    try {
      await updateDoc(doc(firestore, 'creditCards', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteCreditCard(id: string, soft = true): Promise<void> {
    const path = `creditCards/${id}`;
    try {
      if (soft) {
        await updateDoc(doc(firestore, 'creditCards', id), {
          isDeleted: true,
          updatedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(doc(firestore, 'creditCards', id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static subscribeCreditCards(onData: (cards: CreditCard[]) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) return () => {};
    const path = 'creditCards';
    const q = this.isCurrentUserAdmin()
      ? collection(firestore, path)
      : query(collection(firestore, path), where('userId', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: CreditCard[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as CreditCard);
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (_) {}
      }
    );
  }

  // -------------------------------------------------------------
  // DEBTS CRUD
  // -------------------------------------------------------------
  static async addDebt(debt: Omit<Debt, 'id'>, customId?: string): Promise<Debt> {
    const id = customId || `dbt-${Date.now()}`;
    const path = `debts/${id}`;
    const newDebt: Debt = {
      ...debt,
      id,
      createdAt: debt.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, 'debts', id), newDebt);
      return newDebt;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateDebt(id: string, updates: Partial<Debt>): Promise<void> {
    const path = `debts/${id}`;
    try {
      await updateDoc(doc(firestore, 'debts', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteDebt(id: string, soft = true): Promise<void> {
    const path = `debts/${id}`;
    try {
      if (soft) {
        await updateDoc(doc(firestore, 'debts', id), {
          isDeleted: true,
          updatedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(doc(firestore, 'debts', id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static subscribeDebts(onData: (debts: Debt[]) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) return () => {};
    const path = 'debts';
    const q = this.isCurrentUserAdmin()
      ? collection(firestore, path)
      : query(collection(firestore, path), where('userId', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Debt[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Debt);
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (_) {}
      }
    );
  }

  // -------------------------------------------------------------
  // TRANSACTIONS CRUD
  // -------------------------------------------------------------
  static async addTransaction(tx: Omit<Transaction, 'id'>, customId?: string): Promise<Transaction> {
    const id = customId || `tx-${Date.now()}`;
    const path = `transactions/${id}`;
    const newTx: Transaction = {
      ...tx,
      id,
      createdAt: tx.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, 'transactions', id), newTx);
      return newTx;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const path = `transactions/${id}`;
    try {
      await updateDoc(doc(firestore, 'transactions', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteTransaction(id: string, soft = true): Promise<void> {
    const path = `transactions/${id}`;
    try {
      if (soft) {
        await updateDoc(doc(firestore, 'transactions', id), {
          isDeleted: true,
          updatedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(doc(firestore, 'transactions', id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static subscribeTransactions(onData: (txs: Transaction[]) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) return () => {};
    const path = 'transactions';
    const q = this.isCurrentUserAdmin()
      ? collection(firestore, path)
      : query(collection(firestore, path), where('userId', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Transaction);
        });
        // Ordenar por fecha descendente
        list.sort((a, b) => b.date.localeCompare(a.date));
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (_) {}
      }
    );
  }

  // -------------------------------------------------------------
  // BUDGETS CRUD
  // -------------------------------------------------------------
  static async addBudget(budget: Omit<Budget, 'id'>, customId?: string): Promise<Budget> {
    const id = customId || `bdg-${Date.now()}`;
    const path = `budgets/${id}`;
    const newBudget: Budget = {
      ...budget,
      id,
      createdAt: budget.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, 'budgets', id), newBudget);
      return newBudget;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    const path = `budgets/${id}`;
    try {
      await updateDoc(doc(firestore, 'budgets', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteBudget(id: string): Promise<void> {
    const path = `budgets/${id}`;
    try {
      await updateDoc(doc(firestore, 'budgets', id), {
        isDeleted: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static subscribeBudgets(onData: (budgets: Budget[]) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) return () => {};
    const path = 'budgets';
    const q = this.isCurrentUserAdmin()
      ? collection(firestore, path)
      : query(collection(firestore, path), where('userId', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Budget[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Budget);
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (_) {}
      }
    );
  }

  // -------------------------------------------------------------
  // GOALS CRUD
  // -------------------------------------------------------------
  static async addGoal(goal: Omit<Goal, 'id'>, customId?: string): Promise<Goal> {
    const id = customId || `gol-${Date.now()}`;
    const path = `goals/${id}`;
    const newGoal: Goal = {
      ...goal,
      id,
      createdAt: goal.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(firestore, 'goals', id), newGoal);
      return newGoal;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    const path = `goals/${id}`;
    try {
      await updateDoc(doc(firestore, 'goals', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteGoal(id: string): Promise<void> {
    const path = `goals/${id}`;
    try {
      await updateDoc(doc(firestore, 'goals', id), {
        isDeleted: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  static subscribeGoals(onData: (goals: Goal[]) => void): Unsubscribe {
    const user = auth.currentUser;
    if (!user) return () => {};
    const path = 'goals';
    const q = this.isCurrentUserAdmin()
      ? collection(firestore, path)
      : query(collection(firestore, path), where('userId', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Goal[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Goal);
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (_) {}
      }
    );
  }

  // -------------------------------------------------------------
  // INITIAL SEEDING TO FIRESTORE
  // -------------------------------------------------------------
  static async seedInitialDataIfNeeded(initialData: {
    users: User[];
    accounts: Account[];
    creditCards: CreditCard[];
    debts: Debt[];
    budgets: Budget[];
    goals: Goal[];
    transactions: Transaction[];
  }): Promise<boolean> {
    if (!this.isCurrentUserAdmin()) {
      return false;
    }
    try {
      const accSnap = await getDocs(collection(firestore, 'accounts'));
      if (!accSnap.empty) {
        // Ya existen datos en Firestore, no sobreescribir
        return false;
      }

      console.log('[Firestore] Inicializando datos iniciales en la nube...');
      const batchPromises: Promise<any>[] = [];

      // Seed Users
      for (const u of initialData.users) {
        batchPromises.push(setDoc(doc(firestore, 'users', u.id), u));
      }

      // Seed Accounts
      for (const a of initialData.accounts) {
        batchPromises.push(setDoc(doc(firestore, 'accounts', a.id), a));
      }

      // Seed Credit Cards
      for (const c of initialData.creditCards) {
        batchPromises.push(setDoc(doc(firestore, 'creditCards', c.id), c));
      }

      // Seed Debts
      for (const d of initialData.debts) {
        batchPromises.push(setDoc(doc(firestore, 'debts', d.id), d));
      }

      // Seed Budgets
      for (const b of initialData.budgets) {
        batchPromises.push(setDoc(doc(firestore, 'budgets', b.id), b));
      }

      // Seed Goals
      for (const g of initialData.goals) {
        batchPromises.push(setDoc(doc(firestore, 'goals', g.id), g));
      }

      // Seed Transactions
      for (const t of initialData.transactions) {
        batchPromises.push(setDoc(doc(firestore, 'transactions', t.id), t));
      }

      await Promise.all(batchPromises);
      console.log('[Firestore] Datos sembrados exitosamente en Google Cloud Firestore.');
      return true;
    } catch (err) {
      console.warn('[Firestore] Error opcional en seeding:', err);
      return false;
    }
  }

  // -------------------------------------------------------------
  // DIRECT SAVE HELPERS (Idempotent Writes)
  // -------------------------------------------------------------
  static async saveAccount(account: Account): Promise<void> {
    const path = `accounts/${account.id}`;
    try {
      await setDoc(doc(firestore, 'accounts', account.id), account);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async saveCreditCard(card: CreditCard): Promise<void> {
    const path = `creditCards/${card.id}`;
    try {
      await setDoc(doc(firestore, 'creditCards', card.id), card);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async saveDebt(debt: Debt): Promise<void> {
    const path = `debts/${debt.id}`;
    try {
      await setDoc(doc(firestore, 'debts', debt.id), debt);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async saveTransaction(tx: Transaction): Promise<void> {
    const path = `transactions/${tx.id}`;
    try {
      await setDoc(doc(firestore, 'transactions', tx.id), tx);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async saveBudget(budget: Budget): Promise<void> {
    const path = `budgets/${budget.id}`;
    try {
      await setDoc(doc(firestore, 'budgets', budget.id), budget);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async saveGoal(goal: Goal): Promise<void> {
    const path = `goals/${goal.id}`;
    try {
      await setDoc(doc(firestore, 'goals', goal.id), goal);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}
