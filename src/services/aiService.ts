import api from './api';
import { AxiosError } from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface ChatError {
  error: string;
}

class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await api.post('/ai/chat', {
        message: message,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem para a IA:', error);
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ChatError;
        throw new Error(errorData.error || 'Erro ao se comunicar com a IA');
      }
      throw new Error('Erro ao se comunicar com a IA');
    }
  }

  // Como não temos endpoint de histórico ainda, vamos manter as mensagens em memória
  private messages: ChatMessage[] = [];

  async getChatHistory(): Promise<ChatMessage[]> {
    return this.messages;
  }

  // Método auxiliar para adicionar mensagem ao histórico local
  addMessageToHistory(message: ChatMessage) {
    this.messages.push(message);
  }
}

export default AIService.getInstance();
