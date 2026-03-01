import React, { createContext, useContext, useState, useEffect } from 'react';
import { pb, authHelpers } from '@/lib/pocketbase';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model as unknown as User);
    }
    setIsLoading(false);

    // Subscribe to auth changes
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(model as unknown as User);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authHelpers.login(email, password);
    if (result.success) {
      setUser(result.record as unknown as User);
    }
    return result;
  };

  const logout = () => {
    authHelpers.logout();
    setUser(null);
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await authHelpers.register(email, password, name);
    if (result.success) {
      // Auto login after registration
      await login(email, password);
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
        register
      }}
    >
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
