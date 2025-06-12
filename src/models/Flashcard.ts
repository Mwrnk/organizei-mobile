import { Card } from '../services/cardService';

export interface Flashcard {
  _id: string;
  cardId: string; // MongoDB ObjectId (24 caracteres hexadecimais)
  front: string;
  back: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  card?: Card; // Referência ao card associado
}

export interface CreateFlashcardDTO {
  cardId: string;
  front: string;
  back: string;
  tags: string[];
}

export interface FlashcardValidation {
  isValid: boolean;
  errors: {
    cardId?: string;
    front?: string;
    back?: string;
    tags?: string;
  };
}

// Função de validação do ObjectId do MongoDB
export const isValidMongoId = (id: string): boolean => {
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  return mongoIdRegex.test(id);
};

// Função de validação do conteúdo da frente
export const isValidFrontContent = (content: string): boolean => {
  return content.trim().length > 0;
}; 