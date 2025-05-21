import AuthService, { LoginCredentials } from '../services/auth';
import { User } from '../models/User';

/**
 * Controlador responsável pela lógica de autenticação
 * Implementa o padrão Singleton para garantir uma única instância
 */
export class AuthController {
  private static instance: AuthController;

  private constructor() {}

  /**
   * Obtém a instância única do controlador
   */
  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  /**
   * Realiza login do usuário
   * @param credentials Credenciais de login
   * @returns Dados do usuário autenticado
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await AuthService.login(credentials);
      return {
        user: response.user,
        token: response.token,
      };
    } catch (error) {
      console.error('Erro no controller de autenticação:', error);
      throw error;
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    return AuthService.isAuthenticated();
  }

  /**
   * Carrega os dados do usuário atual
   */
  async loadCurrentUser(): Promise<User | null> {
    try {
      return await AuthService.getCurrentUser();
    } catch (error) {
      console.error('Erro ao carregar usuário atual:', error);
      return null;
    }
  }

  /**
   * Atualiza os dados do usuário atual no armazenamento local
   * @param userData Dados atualizados do usuário
   */
  async updateCurrentUserData(userData: User): Promise<void> {
    try {
      await AuthService.updateCurrentUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário atual:', error);
      throw error;
    }
  }
}

export default AuthController.getInstance();
