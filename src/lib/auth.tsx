import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define User type locally since we removed Supabase
export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  subscription_status?: string;
}

export interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isProUser: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (e) {
        console.error('Failed to parse session', e);
        localStorage.removeItem('session');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');

      const newSession = data.session;
      setSession(newSession);
      setUser(newSession.user);
      localStorage.setItem('session', JSON.stringify(newSession));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signin failed');

      const newSession = data.session;
      setSession(newSession);
      setUser(newSession.user);
      localStorage.setItem('session', JSON.stringify(newSession));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    localStorage.removeItem('session');
  };

  const resetPassword = async (email: string) => {
    // Mock implementation
    console.log('Reset password for', email);
    return { error: null };
  };

  const isProUser = user?.subscription_status === 'active';

  return (
    <AuthContext.Provider value={{ user, session, loading, isProUser, signUp, signIn, signOut, resetPassword }}>
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
