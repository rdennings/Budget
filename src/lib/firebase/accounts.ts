import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Account, CreateAccountData, UpdateAccountData } from '../../types/account';

const ACCOUNTS_COLLECTION = 'accounts';

export class AccountsService {
  static async getUserAccounts(userId: string): Promise<Account[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      const q = query(
        collection(db, ACCOUNTS_COLLECTION),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const accounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastUpdated: doc.data().lastUpdated?.toDate()
      })) as Account[];
      
      // Sort by createdAt in descending order (newest first)
      return accounts.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Failed to fetch accounts');
    }
  }

  static async getAccountById(accountId: string, userId: string): Promise<Account | null> {
    try {
      const docRef = doc(db, ACCOUNTS_COLLECTION, accountId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const account = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
        lastUpdated: docSnap.data().lastUpdated?.toDate()
      } as Account;
      
      if (account.userId !== userId) {
        throw new Error('Unauthorized access to account');
      }
      
      return account;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw new Error('Failed to fetch account');
    }
  }

  static async createAccount(userId: string, accountData: CreateAccountData): Promise<string> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      const batch = writeBatch(db);
      
      if (accountData.isDefault) {
        try {
          const existingAccounts = await this.getUserAccounts(userId);
          existingAccounts.forEach(account => {
            if (account.isDefault) {
              const accountRef = doc(db, ACCOUNTS_COLLECTION, account.id);
              batch.update(accountRef, {
                isDefault: false,
                updatedAt: serverTimestamp()
              });
            }
          });
        } catch (error) {
          console.log('No existing accounts found, this will be the first account');
        }
      }
      
      const accountRef = doc(collection(db, ACCOUNTS_COLLECTION));
      batch.set(accountRef, {
        ...accountData,
        userId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      await batch.commit();
      return accountRef.id;
    } catch (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account');
    }
  }

  static async updateAccount(accountId: string, userId: string, updateData: UpdateAccountData): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      if (updateData.isDefault) {
        const existingAccounts = await this.getUserAccounts(userId);
        existingAccounts.forEach(account => {
          if (account.isDefault && account.id !== accountId) {
            const accountRef = doc(db, ACCOUNTS_COLLECTION, account.id);
            batch.update(accountRef, {
              isDefault: false,
              updatedAt: serverTimestamp()
            });
          }
        });
      }
      
      const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
      batch.update(accountRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error updating account:', error);
      throw new Error('Failed to update account');
    }
  }

  static async softDeleteAccount(accountId: string, userId: string): Promise<void> {
    try {
      const account = await this.getAccountById(accountId, userId);
      
      if (!account) {
        throw new Error('Account not found');
      }
      
      if (account.balance !== 0) {
        throw new Error('Cannot delete account with non-zero balance');
      }
      
      const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
      await updateDoc(accountRef, {
        isActive: false,
        isDefault: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account');
    }
  }

  static async setDefaultAccount(accountId: string, userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      const existingAccounts = await this.getUserAccounts(userId);
      existingAccounts.forEach(account => {
        const accountRef = doc(db, ACCOUNTS_COLLECTION, account.id);
        batch.update(accountRef, {
          isDefault: account.id === accountId,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error setting default account:', error);
      throw new Error('Failed to set default account');
    }
  }
}