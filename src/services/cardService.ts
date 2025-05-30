import api from './api';

export interface Card {
  _id: string;
  title: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  is_published: boolean;
  image_url?: string[];
  likes: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  content?: string;
  listId: string;
  userId: string;
}

export class CardService {
  // Buscar todos os cards do usuário logado
  static async getUserCards(): Promise<Card[]> {
    try {
      const response = await api.get('/cards');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar cards do usuário:', error);
      throw error;
    }
  }

  // Buscar cards por ID do usuário
  static async getCardsByUserId(userId: string): Promise<Card[]> {
    try {
      const response = await api.get(`/cards/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar cards do usuário por ID:', error);
      throw error;
    }
  }

  // Buscar card por ID
  static async getCardById(cardId: string): Promise<Card> {
    try {
      const response = await api.get(`/cards/${cardId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar card por ID:', error);
      throw error;
    }
  }
}
