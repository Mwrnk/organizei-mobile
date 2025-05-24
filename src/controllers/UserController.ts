import { User } from '../models/User';
import api from '../services/api';

// Interface para mapear a resposta da API
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

// Interface para a estrutura da resposta da API
interface ApiResponse<T> {
  status?: string;
  data: T;
}

export class UserController {
  private static instance: UserController;
  private users: User[] = [];

  private constructor() {}

  /**
   * Obtém a instância única do controlador
   */
  public static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  /**
   * Converte a resposta da API para o modelo User
   * @param apiUser Dados do usuário da API
   * @returns Objeto User formatado
   */
  private mapApiUserToModel(apiUser: ApiUserResponse): User {
    return {
      id: apiUser._id,
      _id: apiUser._id, // Mantém o ID original do MongoDB
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
  }

  /**
   * Cria um novo usuário
   * @param userData Dados do usuário a ser criado
   * @returns Usuário criado
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const response = await api.post<ApiResponse<ApiUserResponse>>('/users', userData);
      const newUser = this.mapApiUserToModel(response.data.data);
      this.users.push(newUser);
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);

      // Fallback para modo offline ou para testes
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        coduser: userData.coduser || 'temp_' + Math.random().toString(36).substr(2, 5),
        role: userData.role || 'user',
        orgPoints: userData.orgPoints || 0,
        plan: null,
        profileImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.users.push(newUser);
      return newUser;
    }
  }

  /**
   * Obtém todos os usuários
   * @returns Lista de usuários
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<ApiResponse<ApiUserResponse[]>>('/users');
      this.users = response.data.data.map((user) => this.mapApiUserToModel(user));
      return this.users;
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      return this.users; // Retorna cache local em caso de falha
    }
  }

  /**
   * Obtém um usuário pelo ID
   * @param id ID do usuário
   * @returns Usuário encontrado ou null
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<ApiUserResponse>>(`/users/${id}`);
      return this.mapApiUserToModel(response.data.data);
    } catch (error) {
      console.error(`Erro ao obter usuário com ID ${id}:`, error);
      // Tenta encontrar no cache local
      return this.users.find((user) => user._id === id) || null;
    }
  }

  /**
   * Atualiza um usuário existente
   * @param id ID do usuário
   * @param userData Novos dados do usuário
   * @returns Usuário atualizado
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const response = await api.put<ApiResponse<ApiUserResponse>>(`/users/${id}`, userData);
      const updatedUser = this.mapApiUserToModel(response.data.data);

      // Atualiza o cache local
      const index = this.users.findIndex((user) => user._id === id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }

      return updatedUser;
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Remove um usuário
   * @param id ID do usuário a ser removido
   * @returns true se removido com sucesso, false caso contrário
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      await api.delete(`/users/${id}`);

      // Atualiza o cache local
      this.users = this.users.filter((user) => user._id !== id);
      return true;
    } catch (error) {
      console.error(`Erro ao excluir usuário com ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Obtém o perfil do usuário atual
   * @returns Dados do perfil do usuário
   */
  async getUserProfile(): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<ApiUserResponse>>('/users/profile');
      return this.mapApiUserToModel(response.data.data);
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      return null;
    }
  }

  /**
   * Atualiza os pontos de um usuário
   * @param id ID do usuário
   * @param points Número de pontos a adicionar
   * @returns Usuário atualizado
   */
  async updateUserPoints(id: string, points: number): Promise<User | null> {
    try {
      const response = await api.patch<ApiResponse<ApiUserResponse>>(`/users/${id}/points`, {
        points,
      });
      const updatedUser = this.mapApiUserToModel(response.data.data);

      // Atualiza o cache local
      const index = this.users.findIndex((user) => user._id === id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }

      return updatedUser;
    } catch (error) {
      console.error(`Erro ao atualizar pontos do usuário com ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Atualiza a imagem de perfil do usuário
   * @param id ID do usuário
   * @param imageUri URI da imagem
   * @returns Usuário atualizado
   */
  async updateProfileImage(id: string, imageUri: string): Promise<User | null> {
    try {
      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-image.jpg',
      } as any);

      const response = await api.post<ApiResponse<ApiUserResponse>>(
        `/users/${id}/profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedUser = this.mapApiUserToModel(response.data.data);

      // Atualiza o cache local
      const index = this.users.findIndex((user) => user._id === id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }

      return updatedUser;
    } catch (error) {
      console.error(`Erro ao atualizar imagem de perfil do usuário com ID ${id}:`, error);
      return null;
    }
  }
}

export default UserController.getInstance();
