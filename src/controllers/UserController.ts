import { User } from '../models/User';
import api from '../services/api';

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
   * Cria um novo usuário
   * @param userData Dados do usuário a ser criado
   * @returns Usuário criado
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      // Em um ambiente real, isso seria uma chamada à API
      const response = await api.post<{ data: User }>('/users', userData);
      const newUser = response.data.data;
      this.users.push(newUser);
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);

      // Fallback para modo offline ou para testes
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        role: userData.role || 'user',
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
      // Em um ambiente real, isso seria uma chamada à API
      const response = await api.get<{ data: User[] }>('/users');
      this.users = response.data.data;
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
      const response = await api.get<{ data: User }>(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao obter usuário com ID ${id}:`, error);
      // Tenta encontrar no cache local
      return this.users.find((user) => user.id === id) || null;
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
      const response = await api.put<{ data: User }>(`/users/${id}`, userData);
      const updatedUser = response.data.data;

      // Atualiza o cache local
      const index = this.users.findIndex((user) => user.id === id);
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
      this.users = this.users.filter((user) => user.id !== id);
      return true;
    } catch (error) {
      console.error(`Erro ao excluir usuário com ID ${id}:`, error);
      return false;
    }
  }
}

export default UserController.getInstance();
