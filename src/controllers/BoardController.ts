import api from '../services/api';

// Interfaces para representar os dados
export interface Card {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  boardId: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

/**
 * Controlador responsável pela lógica de negócio dos boards e cards
 * Implementa o padrão Singleton para garantir uma única instância
 */
export class BoardController {
  private static instance: BoardController;
  private boards: Board[] = [];

  private constructor() {}

  /**
   * Obtém a instância única do controlador
   */
  public static getInstance(): BoardController {
    if (!BoardController.instance) {
      BoardController.instance = new BoardController();
    }
    return BoardController.instance;
  }

  /**
   * Obtém todos os boards do usuário
   * @param userId ID do usuário
   * @returns Lista de boards
   */
  async getBoards(userId: string): Promise<Board[]> {
    try {
      const response = await api.get<{ data: Board[] }>(`/users/${userId}/boards`);
      this.boards = response.data.data;
      return this.boards;
    } catch (error) {
      console.error('Erro ao obter boards:', error);
      return this.boards; // Retorna cache local em caso de falha
    }
  }

  /**
   * Cria um novo board
   * @param userId ID do usuário
   * @param boardData Dados do board
   * @returns Board criado
   */
  async createBoard(
    userId: string,
    boardData: { title: string; description?: string }
  ): Promise<Board> {
    try {
      const response = await api.post<{ data: Board }>(`/users/${userId}/boards`, boardData);
      const newBoard = response.data.data;
      this.boards.push(newBoard);
      return newBoard;
    } catch (error) {
      console.error('Erro ao criar board:', error);

      // Fallback para modo offline ou para testes
      const newBoard: Board = {
        id: Math.random().toString(36).substr(2, 9),
        title: boardData.title,
        description: boardData.description,
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
      };

      this.boards.push(newBoard);
      return newBoard;
    }
  }

  /**
   * Adiciona um card a um board
   * @param boardId ID do board
   * @param cardData Dados do card
   * @returns Card criado
   */
  async addCard(
    boardId: string,
    userId: string,
    cardData: { title: string; description?: string }
  ): Promise<Card> {
    try {
      const response = await api.post<{ data: Card }>(`/boards/${boardId}/cards`, cardData);
      const newCard = response.data.data;

      // Atualiza o cache local
      const boardIndex = this.boards.findIndex((board) => board.id === boardId);
      if (boardIndex !== -1) {
        this.boards[boardIndex].cards.push(newCard);
      }

      return newCard;
    } catch (error) {
      console.error('Erro ao adicionar card:', error);

      // Fallback para modo offline ou para testes
      const newCard: Card = {
        id: Math.random().toString(36).substr(2, 9),
        title: cardData.title,
        description: cardData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        boardId: boardId,
      };

      // Atualiza o cache local
      const boardIndex = this.boards.findIndex((board) => board.id === boardId);
      if (boardIndex !== -1) {
        this.boards[boardIndex].cards.push(newCard);
      }

      return newCard;
    }
  }

  /**
   * Atualiza um card
   * @param cardId ID do card
   * @param cardData Novos dados do card
   * @returns Card atualizado
   */
  async updateCard(cardId: string, cardData: Partial<Card>): Promise<Card | null> {
    try {
      const response = await api.put<{ data: Card }>(`/cards/${cardId}`, cardData);
      const updatedCard = response.data.data;

      // Atualiza o cache local
      for (const board of this.boards) {
        const cardIndex = board.cards.findIndex((card) => card.id === cardId);
        if (cardIndex !== -1) {
          board.cards[cardIndex] = updatedCard;
          break;
        }
      }

      return updatedCard;
    } catch (error) {
      console.error(`Erro ao atualizar card com ID ${cardId}:`, error);
      return null;
    }
  }

  /**
   * Remove um card
   * @param cardId ID do card a ser removido
   * @returns true se removido com sucesso, false caso contrário
   */
  async deleteCard(cardId: string): Promise<boolean> {
    try {
      await api.delete(`/cards/${cardId}`);

      // Atualiza o cache local
      for (const board of this.boards) {
        const cardIndex = board.cards.findIndex((card) => card.id === cardId);
        if (cardIndex !== -1) {
          board.cards.splice(cardIndex, 1);
          break;
        }
      }

      return true;
    } catch (error) {
      console.error(`Erro ao excluir card com ID ${cardId}:`, error);
      return false;
    }
  }
}

export default BoardController.getInstance();
