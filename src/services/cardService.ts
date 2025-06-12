import api from './api';

export interface Card {
  _id?: string;
  id?: string;
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
      console.log('CardService: Fazendo requisição para /cards');
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

      // Garantir que cada card tenha _id (mesma lógica do web)
      const normalized = cards.map((card: any) => ({
        _id: card._id || card.id,
        ...card,
      }));

      return normalized as Card[];
    } catch (error: any) {
      console.error('CardService: Erro ao buscar cards do usuário:', error);
      console.error('CardService: Detalhes do erro:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
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
