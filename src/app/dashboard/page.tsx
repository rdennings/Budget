'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';
import AppLayout from '@/components/layout/app-layout';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Welcome, {user?.displayName || 'User'}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your personal finance dashboard is ready.
          </p>
          
          <div className="mt-6">
            <Link
              href="/accounts"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Accounts
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
