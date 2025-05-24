import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginCredentials } from '../services/auth';
import AuthController from '../controllers/AuthController';
import { User } from '../models/User';

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (userData: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      setLoading(true);
      console.log('AuthContext - Iniciando carregamento de dados do storage...');

      try {
        // Utiliza o controller para carregar os dados do usuário
        const currentUser = await AuthController.loadCurrentUser();
        console.log('AuthContext - Usuário carregado do storage:', {
          user: currentUser,
          hasUser: !!currentUser,
          userId: currentUser?._id,
          userEmail: currentUser?.email,
          userName: currentUser?.name,
          allFields: currentUser ? Object.keys(currentUser) : [],
        });

        if (currentUser) {
          console.log('AuthContext - Definindo usuário válido no contexto');
          setUser(currentUser);
        } else {
          console.log('AuthContext - Nenhum usuário válido encontrado no storage');
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('AuthContext - Carregamento finalizado');
      }
    }

    loadStorageData();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    console.log('AuthContext - Iniciando processo de login...');

    try {
      // Utiliza o controller para realizar o login
      const response = await AuthController.login(credentials);
      console.log('AuthContext - Resposta do login recebida:', {
        hasUser: !!response.user,
        userId: response.user?._id,
        userEmail: response.user?.email,
        userName: response.user?.name,
        userFields: response.user ? Object.keys(response.user) : [],
        hasToken: !!response.token,
      });

      console.log('AuthContext - Definindo usuário logado no contexto');
      setUser(response.user);
      console.log('AuthContext - Login finalizado com sucesso');
    } catch (error) {
      console.error('AuthContext - Erro no processo de login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      // Utiliza o controller para realizar o logout
      await AuthController.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (userData: User) => {
    try {
      await AuthController.updateCurrentUserData(userData);
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        login,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
