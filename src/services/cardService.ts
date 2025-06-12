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
      console.log('CardService: Iniciando busca de cards do usuário');
      const response = await api.get('/cards');
      console.log('CardService: Resposta recebida:', response.data);

      // Verificar diferentes estruturas de resposta
      let cards: Card[] = [];

      if (response.data?.data) {
        cards = response.data.data;
      } else if (Array.isArray(response.data)) {
        cards = response.data;
      } else if (response.data?.cards) {
        cards = response.data.cards;
      } else {
        console.warn('CardService: Estrutura de resposta inesperada:', response.data);
        cards = [];
      }

      console.log('CardService: Cards processados:', cards);
      console.log('CardService: Número de cards:', cards?.length || 0);

      // Verificar se é um array válido
      if (!Array.isArray(cards)) {
        console.error('CardService: Dados não são um array:', cards);
        return [];
      }

      return cards;
    } catch (error: any) {
      console.error('CardService: Erro ao buscar cards do usuário:', error);
      if (error.response) {
        console.error('CardService: Detalhes do erro:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        });
        throw new Error(error.response.data.message || 'Erro ao buscar cards');
      }
      throw error;
    }
  }

  // Buscar cards por ID do usuário
  static async getCardsByUserId(userId: string): Promise<Card[]> {
    try {
      console.log('CardService: Buscando cards do usuário:', userId);
      const response = await api.get(`/cards/user/${userId}`);
      console.log('CardService: Resposta recebida:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('CardService: Erro ao buscar cards do usuário por ID:', error);
      if (error.response) {
        console.error('CardService: Detalhes do erro:', error.response.data);
        throw new Error(error.response.data.message || 'Erro ao buscar cards do usuário');
      }
      throw error;
    }
  }

  // Buscar card por ID
  static async getCardById(cardId: string): Promise<Card> {
    try {
      console.log('CardService: Buscando card por ID:', cardId);
      const response = await api.get(`/cards/${cardId}`);
      console.log('CardService: Resposta recebida:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('CardService: Erro ao buscar card por ID:', error);
      if (error.response) {
        console.error('CardService: Detalhes do erro:', error.response.data);
        throw new Error(error.response.data.message || 'Erro ao buscar card');
      }
      throw error;
    }
  }
}
