export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash';
  balance: number;
  isDefault: boolean;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountData {
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash';
  balance: number;
  isDefault?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  type?: 'checking' | 'savings' | 'credit_card' | 'cash';
  balance?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' }
] as const;