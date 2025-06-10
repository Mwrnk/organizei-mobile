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

      // Mapear os dados para garantir a estrutura correta
      return cards.map(card => ({
        _id: card._id || card.id,
        title: card.title,
        priority: card.priority || 'Baixa',
        is_published: card.is_published || false,
        image_url: card.image_url || [],
        likes: card.likes || 0,
        downloads: card.downloads || 0,
        createdAt: card.createdAt || new Date().toISOString(),
        updatedAt: card.updatedAt || new Date().toISOString(),
        content: card.content || '',
        listId: card.listId || '',
        userId: card.userId || '',
      }));
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

  // Criar novo card
  static async createCard(cardData: Partial<Card>): Promise<Card> {
    try {
      const response = await api.post('/cards', cardData);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar card:', error);
      throw error;
    }
  }

  // Atualizar card
  static async updateCard(cardId: string, cardData: Partial<Card>): Promise<Card> {
    try {
      const response = await api.patch(`/cards/${cardId}`, cardData);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      throw error;
    }
  }

  // Deletar card
  static async deleteCard(cardId: string): Promise<void> {
    try {
      await api.delete(`/cards/${cardId}`);
    } catch (error) {
      console.error('Erro ao deletar card:', error);
      throw error;
    }
  }
}
