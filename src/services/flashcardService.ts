import api from './api';
import { Tag } from './tagService';

export interface Flashcard {
  _id: string;
  cardId: string;
  front: string;
  back: string;
  tags: (string | Tag)[];
  createdAt?: string;
  updatedAt?: string;
}

export class FlashcardService {
  // Criação manual
  static async createManual(data: {
    cardId: string;
    front: string;
    back: string;
    tags: string[];
  }): Promise<Flashcard> {
    try {
      const response = await api.post('/flashcards', data);
      const flashcard = response.data?.data?.flashcard || response.data?.data || response.data;
      return flashcard;
    } catch (error) {
      console.error('FlashcardService: erro ao criar flashcard', error);
      throw error;
    }
  }

  // Criação com IA
  static async createWithAI(data: {
    cardId: string;
    amount: number;
    tags: string[];
    title: string;
  }): Promise<Flashcard[]> {
    try {
      const response = await api.post('/flashcards/withAI', data);
      const flashcards = response.data?.data?.flashcards || response.data?.data || response.data;
      return flashcards;
    } catch (error) {
      console.error('FlashcardService: erro ao criar flashcards com IA', error);
      throw error;
    }
  }

  // Buscar flashcards do usuário
  static async getAll(): Promise<Flashcard[]> {
    try {
      const response = await api.get('/flashcards');
      const flashcards = response.data?.data || response.data?.flashcards || response.data;
      if (Array.isArray(flashcards)) return flashcards;
      return [];
    } catch (error) {
      console.error('FlashcardService: erro ao buscar flashcards', error);
      throw error;
    }
  }

  // Novo: enviar nota de revisão (0-5) para um flashcard
  static async review(flashcardId: string, grade: number): Promise<void> {
    try {
      await api.patch(`/flashcards/doreview/${flashcardId}`, { grade });
    } catch (error) {
      console.error('FlashcardService: erro ao enviar nota de revisão', error);
      throw error;
    }
  }
}
