'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/firebase/auth-context';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const isActivePage = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                Budget Tracker
              </Link>
              <div className="hidden sm:flex space-x-8">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePage('/dashboard')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/accounts"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePage('/accounts')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Accounts
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {title && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}