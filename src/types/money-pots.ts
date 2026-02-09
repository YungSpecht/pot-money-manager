export interface HistoryEntry {
  id: string;
  date: string; // ISO string
  type: 'deposit' | 'withdrawal' | 'interest' | 'manual';
  amount: number;
  description: string;
}

export interface Pot {
  id: string;
  name: string;
  balance: number;
  history: HistoryEntry[];
}

export interface SplitRule {
  potId: string;
  type: 'fixed' | 'percentage';
  value: number;
}

export interface MonthlyTransfer {
  totalAmount: number;
  splits: SplitRule[];
}

export interface ScheduledWithdrawal {
  id: string;
  potId: string;
  amount: number;
  dayOfMonth: number; // 1-31
  description: string;
  recurring: boolean;
  nextDate: string; // ISO date string
  completed: boolean;
}

export interface AccountData {
  totalBalance: number;
  interestRate: number; // annual percentage
  pots: Pot[];
  monthlyTransfer: MonthlyTransfer;
  scheduledWithdrawals: ScheduledWithdrawal[];
  setupComplete: boolean;
  lastInterestDate?: string;
}

export const defaultAccountData: AccountData = {
  totalBalance: 0,
  interestRate: 0,
  pots: [],
  monthlyTransfer: { totalAmount: 0, splits: [] },
  scheduledWithdrawals: [],
  setupComplete: false,
};
