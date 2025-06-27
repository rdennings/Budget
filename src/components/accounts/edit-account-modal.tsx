'use client';

import { useState, useEffect } from 'react';
import { AccountsService } from '../../lib/firebase/accounts';
import { Account, UpdateAccountData, ACCOUNT_TYPES } from '../../types/account';
import { useAuth } from '../../lib/firebase/auth-context';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountUpdated: () => void;
  account: Account | null;
}

export default function EditAccountModal({ isOpen, onClose, onAccountUpdated, account }: EditAccountModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UpdateAccountData>({
    name: '',
    type: 'checking',
    balance: 0,
    isDefault: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance,
        isDefault: account.isDefault
      });
    }
  }, [account]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Account name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Account name must be 50 characters or less';
    }

    if (!formData.type) {
      newErrors.type = 'Account type is required';
    }

    if (formData.balance !== undefined && isNaN(formData.balance)) {
      newErrors.balance = 'Balance must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user || !account) {
      return;
    }

    setIsSubmitting(true);
    try {
      await AccountsService.updateAccount(account.id, user.id, formData);
      onAccountUpdated();
      handleClose();
    } catch (error) {
      console.error('Error updating account:', error);
      setErrors({ submit: 'Failed to update account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'checking',
      balance: 0,
      isDefault: false
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof UpdateAccountData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Account</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter account name"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as any)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              {ACCOUNT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance *
            </label>
            <input
              type="number"
              id="balance"
              value={formData.balance}
              onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.balance ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              step="0.01"
              disabled={isSubmitting}
            />
            {errors.balance && <p className="text-red-500 text-sm mt-1">{errors.balance}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
              Set as default account
            </label>
          </div>

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}