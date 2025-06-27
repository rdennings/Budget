'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function LoginPage() {
  const { user, signIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      redirect('/dashboard');
    }
  }, [user, loading]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your finances</p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign in with Google
        </button>
        
        {/* Debug info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Loading: {loading.toString()}</p>
          <p>User: {user ? user.email : 'null'}</p>
          <p>User ID: {user ? user.id : 'null'}</p>
        </div>
      </div>
    </div>
  );
}
