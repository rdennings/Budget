'use client';

import { AuthProvider } from '@/lib/firebase/auth-context';

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
