import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { User } from '../models/User';

export interface ApiResponse<T> {
  status: string;
  data: T;
}

// Interface para mapear a resposta da API de usuário
interface ApiUserResponse {
  _id?: string; // MongoDB ID (formato antigo)
  id?: string; // ID simplificado (formato novo)
  coduser?: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  role?: string;
  plan?: any | null;
  orgPoints?: number;
  profileImage?: string | null;
  loginAttempts?: number;
  lastLoginAttempt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
  // A API pode retornar tanto 'id' quanto '_id', vamos lidar com ambos
  const userId = apiUser._id || apiUser.id || '';

  if (!userId) {
    console.error('AuthService - ERRO: Nenhum ID encontrado no usuário da API!');
  }

  return {
    id: userId, // Mapeia para id para compatibilidade
    _id: userId, // Preserva o _id original para chamadas da API
    coduser: apiUser.coduser || '',
    name: apiUser.name || '',
    email: apiUser.email || '',
    dateOfBirth: apiUser.dateOfBirth || null,
    role: apiUser.role || 'user',
    plan: apiUser.plan || null,
    orgPoints: apiUser.orgPoints || 0,
    profileImage: apiUser.profileImage || null,
    loginAttempts: apiUser.loginAttempts || 0,
    lastLoginAttempt: apiUser.lastLoginAttempt || null,
    createdAt: apiUser.createdAt || new Date().toISOString(),
    updatedAt: apiUser.updatedAt || new Date().toISOString(),
    __v: apiUser.__v || 0,
  };
};

export const AuthService = {
  // Login e armazenamento do token
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/login', credentials);

      // Extraindo os dados da estrutura de resposta
      const { data } = response.data;

      // Primeiro, salva o token para poder fazer chamadas autenticadas
      await AsyncStorage.setItem(TOKEN_KEY, data.token);

      // Agora busca os dados completos do usuário usando o ID retornado no login
      const userId = data.user._id || data.user.id;
      if (userId) {
        try {
          const userResponse = await api.get<ApiResponse<ApiUserResponse>>(`/users/${userId}`);
          const completeUser = mapApiUserToModel(userResponse.data.data);

          // Salva o usuário completo
          const userJsonString = JSON.stringify(completeUser);
          await AsyncStorage.setItem(USER_KEY, userJsonString);

          return {
            user: completeUser,
            token: data.token,
          };
        } catch (userError) {
          // Se falhar ao buscar dados completos, usa os dados básicos do login
          const basicUser = mapApiUserToModel(data.user);
          const userJsonString = JSON.stringify(basicUser);
          await AsyncStorage.setItem(USER_KEY, userJsonString);

          return {
            user: basicUser,
            token: data.token,
          };
        }
      } else {
        // Fallback: usa os dados básicos do login
        const user = mapApiUserToModel(data.user);
        const userJsonString = JSON.stringify(user);
        await AsyncStorage.setItem(USER_KEY, userJsonString);

        return {
          user,
          token: data.token,
        };
      }
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

      if (!userStr) {
        return null;
      }

      const userData = JSON.parse(userStr);

      // Validação menos restritiva: verifica apenas se tem dados básicos
      if (!userData) {
        return null;
      }

      // Verificação de campos essenciais
      const hasId = !!(userData._id || userData.id);
      const hasEmail = !!userData.email;
      const hasName = !!userData.name;

      if (!hasId || !hasEmail || !hasName) {
        return null;
      }

      // Migração: garantir que id esteja presente (compatibilidade)
      if (userData && !userData.id && userData._id) {
        userData.id = userData._id;
        await this.updateCurrentUser(userData);
      }

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

  // Registro de novo usuário
  async register(userData: {
    name: string;
    email: string;
    password: string;
    dateOfBirth: string;
    coduser: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/register', userData);

      // Extraindo os dados da estrutura de resposta
      const { data } = response.data;

      // Salva o token
      await AsyncStorage.setItem(TOKEN_KEY, data.token);

      // Mapeia o usuário
      const user = mapApiUserToModel(data.user);

      // Salva o usuário
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return {
        user,
        token: data.token,
      };
    } catch (error) {
      console.error('AuthService - Erro no registro:', error);
      throw error;
    }
  },

  async updateStoredUser(userData: User): Promise<void> {
    try {
      await AsyncStorage.setItem('@Organizei:user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao atualizar usuário no storage:', error);
      throw error;
    }
  },
};

export default AuthService;
