import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../models/User';
import { AuthService } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
<<<<<<< HEAD
  updateUserData: (userData: User) => Promise<void>;
=======
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
>>>>>>> 52028c3e00001d0a7b6307e35604e762e5805e35
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initialize = async () => {
    setLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await AuthService.login({ email, password });
    setUser(user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const updateUserData = async (userData: User) => {
    try {
      setUser(userData);
      await AuthService.updateStoredUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserData }}>{children}</AuthContext.Provider>
=======
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
>>>>>>> 52028c3e00001d0a7b6307e35604e762e5805e35
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
