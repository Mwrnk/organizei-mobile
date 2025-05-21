import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { User } from '../models/User';

export interface ApiResponse<T> {
  status: string;
  data: T;
}

// Interface para mapear a resposta da API de usuário
interface ApiUserResponse {
  _id: string;
  coduser: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  role: string;
  plan: any | null;
  orgPoints: number;
  profileImage: string | null;
  loginAttempts?: number;
  lastLoginAttempt?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AuthResponse {
  token: string;
  user: ApiUserResponse;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const TOKEN_KEY = 'jwtToken';
export const USER_KEY = 'user';

// Função para converter a resposta da API para o modelo User
const mapApiUserToModel = (apiUser: ApiUserResponse): User => {
  return {
    id: apiUser._id,
    coduser: apiUser.coduser,
    name: apiUser.name,
    email: apiUser.email,
    dateOfBirth: apiUser.dateOfBirth ? new Date(apiUser.dateOfBirth) : undefined,
    role: apiUser.role,
    plan: apiUser.plan,
    orgPoints: apiUser.orgPoints,
    profileImage: apiUser.profileImage,
    loginAttempts: apiUser.loginAttempts,
    lastLoginAttempt: apiUser.lastLoginAttempt ? new Date(apiUser.lastLoginAttempt) : null,
    createdAt: new Date(apiUser.createdAt),
    updatedAt: new Date(apiUser.updatedAt),
  };
};

export const AuthService = {
  // Login e armazenamento do token
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/login', credentials);

      // Extraindo os dados da estrutura de resposta
      const { data } = response.data;
      const user = mapApiUserToModel(data.user);

      // Armazena o token e informações do usuário
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return {
        user,
        token: data.token,
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  // Logout - remove token e informações do usuário
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  // Verifica se o usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Obtém o token JWT atual
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  // Obtém as informações do usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (!userStr) return null;

      const userData = JSON.parse(userStr);
      return userData;
    } catch (error) {
      console.error('Erro ao obter dados do usuário atual:', error);
      return null;
    }
  },

  // Atualiza os dados do usuário no armazenamento local
  async updateCurrentUser(userData: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  },
};

export default AuthService;
