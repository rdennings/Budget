'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function HomePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect('/dashboard');
      } else {
        redirect('/auth/login');
      }
    }
  }, [user, loading]);

  return <LoadingSpinner className="min-h-screen bg-gray-50" />;
}
