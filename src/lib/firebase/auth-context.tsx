'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    console.log('Firebase auth object:', auth);
    
    // Check current user immediately
    const currentUser = auth.currentUser;
    console.log('Current user on mount:', currentUser);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      console.log('Firebase user:', firebaseUser);
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Create new user document on first sign in
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            preferences: {
              currency: 'USD',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              notifications: {
                billReminders: true,
                lowBalance: true,
                emailNotifications: true,
              },
            },
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...newUser,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          });
          console.log('Created new user:', newUser);
          setUser(newUser);
        } else {
          // Update existing user's last login
          const userData = userDoc.data() as User;
          const updatedUser = { ...userData, lastLogin: new Date() };
          await setDoc(doc(db, 'users', firebaseUser.uid), 
            { ...updatedUser, lastLogin: new Date().toISOString() },
            { merge: true }
          );
          console.log('Updated existing user:', updatedUser);
          setUser(updatedUser);
        }
      } else {
        console.log('No user - setting to null');
        setUser(null);
      }
      console.log('Setting loading to false');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      console.log('Starting Google sign in...');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Calling signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      console.log('signInWithPopup completed:', result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
