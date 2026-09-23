import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // OTP flow
  sendOtp: (email: string, fullName: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<{ fullName: string }>;
  completeSignup: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Legacy signup (kept for compatibility)
  const signUp = async (email: string, password: string, fullName: string) => {
    await api.post('/auth/complete-signup', { email, password });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    await api.post('/auth/reset-password', { email });
  };

  // ── OTP Registration Flow ──────────────────────────────────
  const sendOtp = async (email: string, fullName: string) => {
    await api.post('/auth/send-otp', { email, fullName });
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ fullName: string }> => {
    const result = await api.post<{ fullName: string }>('/auth/verify-otp', { email, otp });
    return result;
  };

  const completeSignup = async (email: string, password: string) => {
    await api.post('/auth/complete-signup', { email, password });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      signUp, signIn, signOut, resetPassword,
      sendOtp, verifyOtp, completeSignup,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
