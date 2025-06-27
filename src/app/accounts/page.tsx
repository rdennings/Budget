'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/firebase/auth-context';
import { AccountsService } from '../../lib/firebase/accounts';
import { Account, ACCOUNT_TYPES } from '../../types/account';
import ProtectedRoute from '../../components/auth/protected-route';
import LoadingSpinner from '../../components/ui/loading-spinner';
import AddAccountModal from '../../components/accounts/add-account-modal';
import EditAccountModal from '../../components/accounts/edit-account-modal';
import AppLayout from '../../components/layout/app-layout';

export default function AccountsPage() {
  const { user, loading: authLoading } = useAuth();
  
  console.log('AccountsPage - user:', user, 'authLoading:', authLoading);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const userAccounts = await AccountsService.getUserAccounts(user!.id);
      setAccounts(userAccounts);
    } catch (err) {
      setError('Failed to load accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountTypeLabel = (type: string): string => {
    return ACCOUNT_TYPES.find(t => t.value === type)?.label || type;
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      await AccountsService.setDefaultAccount(accountId, user!.id);
      await loadAccounts();
    } catch (err) {
      setError('Failed to set default account');
      console.error(err);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      await AccountsService.softDeleteAccount(accountId, user!.id);
      await loadAccounts();
    } catch (err) {
      setError('Failed to delete account. Make sure the balance is zero.');
      console.error(err);
    }
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  if (loading || authLoading) {
    return (
      <LoadingSpinner className="min-h-screen bg-gray-50" />
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout title="Accounts">
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Account
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No accounts found</div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Your First Account
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {account.name}
                        </div>
                        {account.isDefault && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getAccountTypeLabel(account.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={account.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditAccount(account)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        {!account.isDefault && (
                          <button 
                            onClick={() => handleSetDefault(account.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Set Default
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={account.balance !== 0}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAccountAdded={loadAccounts}
        />

        <EditAccountModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onAccountUpdated={loadAccounts}
          account={selectedAccount}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}