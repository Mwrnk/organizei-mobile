import api from './api';
import { Flashcard, CreateFlashcardDTO, isValidMongoId, isValidFrontContent } from '../models/Flashcard';
import { CardService } from './cardService';

export class FlashcardService {
  // Criar um novo flashcard
  static async createFlashcard(data: CreateFlashcardDTO): Promise<Flashcard> {
    try {
      console.log('Iniciando criação do flashcard com dados:', data);

      // Validar o formato do CardId
      if (!isValidMongoId(data.cardId)) {
        throw new Error('ID do card inválido. Deve ser um ObjectId válido do MongoDB (24 caracteres hexadecimais)');
      }

      // Validar o conteúdo da frente
      if (!isValidFrontContent(data.front)) {
        throw new Error('O conteúdo da frente não pode estar vazio');
      }

      // Verificar se o card existe
      console.log('Verificando existência do card:', data.cardId);
      const card = await CardService.getCardById(data.cardId);
      if (!card) {
        throw new Error('Card não encontrado');
      }
      
      console.log('Enviando requisição para criar flashcard');
      const response = await api.post('/flashcards', data);
      console.log('Resposta da API:', response.data);
      
      if (!response.data.data) {
        throw new Error('Resposta inválida da API');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Erro detalhado ao criar flashcard:', error);
      if (error.response) {
        console.error('Resposta de erro da API:', error.response.data);
        throw new Error(error.response.data.message || 'Erro ao criar flashcard');
      }
      throw error;
    }
  }

  // Buscar todos os flashcards do usuário
  static async getUserFlashcards(): Promise<Flashcard[]> {
    try {
      const response = await api.get('/flashcards');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar flashcards do usuário:', error);
      throw error;
    }
  }

  // Buscar flashcard por ID
  static async getFlashcardById(id: string): Promise<Flashcard> {
    try {
      if (!isValidMongoId(id)) {
        throw new Error('ID do flashcard inválido');
      }
      const response = await api.get(`/flashcards/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar flashcard por ID:', error);
      throw error;
    }
  }

  // Buscar flashcards por card ID
  static async getFlashcardsByCardId(cardId: string): Promise<Flashcard[]> {
    try {
      if (!isValidMongoId(cardId)) {
        throw new Error('ID do card inválido');
      }
      const response = await api.get(`/flashcards/card/${cardId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar flashcards por card ID:', error);
      throw error;
    }
  }

  // Atualizar flashcard
  static async updateFlashcard(id: string, data: Partial<CreateFlashcardDTO>): Promise<Flashcard> {
    try {
      if (!isValidMongoId(id)) {
        throw new Error('ID do flashcard inválido');
      }
      if (data.cardId && !isValidMongoId(data.cardId)) {
        throw new Error('ID do card inválido');
      }
      if (data.front && !isValidFrontContent(data.front)) {
        throw new Error('O conteúdo da frente não pode estar vazio');
      }
      const response = await api.put(`/flashcards/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error);
      throw error;
    }
  }

  // Deletar flashcard
  static async deleteFlashcard(id: string): Promise<void> {
    try {
      if (!isValidMongoId(id)) {
        throw new Error('ID do flashcard inválido');
      }
      await api.delete(`/flashcards/${id}`);
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error);
      throw error;
    }
  }
} 