import { useAuth } from '@/lib/firebase/auth-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/auth/login');
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : null;
}
