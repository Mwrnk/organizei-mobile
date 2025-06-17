/**
 * CONTEXTO DE AUTENTICAÇÃO
 * 
 * Este contexto gerencia o estado de autenticação do usuário em todo o aplicativo.
 * Fornece funções para login, logout e atualização de dados do usuário.
 * 
 * Funcionalidades:
 * - Gerenciamento de estado do usuário logado
 * - Funções de autenticação (login/logout)
 * - Atualização de dados do usuário
 * - Inicialização automática do estado de autenticação
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../models/User';
import { AuthService } from '../services/auth';

/**
 * Interface que define o valor do contexto de autenticação
 */
interface AuthContextValue {
  user: User | null;                    // Dados do usuário logado (null se não logado)
  loading: boolean;                     // Estado de carregamento
  login: (email: string, password: string) => Promise<void>;  // Função de login
  logout: () => Promise<void>;          // Função de logout
  updateUserData: (userData: User) => Promise<void>;  // Atualizar dados do usuário
}

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * PROVIDER DO CONTEXTO DE AUTENTICAÇÃO
 * 
 * Componente que envolve a aplicação e fornece o contexto de autenticação
 * para todos os componentes filhos
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Estado do usuário logado
  const [user, setUser] = useState<User | null>(null);
  // Estado de carregamento (usado durante inicialização)
  const [loading, setLoading] = useState(true);

  /**
   * INICIALIZAÇÃO DO CONTEXTO
   * 
   * Verifica se há um usuário logado no armazenamento local
   * e restaura o estado de autenticação
   */
  const initialize = async () => {
    setLoading(true);
    try {
      // Busca dados do usuário no armazenamento local
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } finally {
      // Sempre define loading como false, mesmo se houver erro
      setLoading(false);
    }
  };

  // Executa a inicialização quando o componente é montado
  useEffect(() => {
    initialize();
  }, []);

  /**
   * FUNÇÃO DE LOGIN
   * 
   * Realiza o processo de autenticação do usuário
   * @param email - Email do usuário
   * @param password - Senha do usuário
   */
  const login = async (email: string, password: string) => {
    const { user } = await AuthService.login({ email, password });
    setUser(user);
  };

  /**
   * FUNÇÃO DE LOGOUT
   * 
   * Realiza o processo de logout do usuário
   * Limpa os dados do usuário e tokens de autenticação
   */
  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  /**
   * ATUALIZAÇÃO DE DADOS DO USUÁRIO
   * 
   * Atualiza os dados do usuário no contexto e no armazenamento
   * @param userData - Novos dados do usuário
   */
  const updateUserData = async (userData: User) => {
    try {
      setUser(userData);
      await AuthService.updateStoredUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  // Fornece o contexto para os componentes filhos
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * HOOK PERSONALIZADO PARA USAR O CONTEXTO DE AUTENTICAÇÃO
 * 
 * Facilita o acesso ao contexto de autenticação em componentes
 * @returns Valor do contexto de autenticação
 * @throws Error se usado fora do AuthProvider
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
