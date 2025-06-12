export interface Tag {
  _id: string;
  name: string;
}

import api from './api';

export class TagService {
  // Buscar todas as tags do usuário
  static async getAll(): Promise<Tag[]> {
    try {
      const response = await api.get('/tags');
      const data = response.data?.data || response.data?.tags || response.data;
      if (Array.isArray(data)) {
        return data;
      }
      console.warn('TagService: estrutura de resposta inesperada', response.data);
      return [];
    } catch (error) {
      console.error('TagService: erro ao buscar tags', error);
      throw error;
    }
  }

  // Criar uma nova tag
  static async create(name: string): Promise<Tag> {
    try {
      const response = await api.post('/tags', { name });
      const tag: Tag = response.data?.data?.tag || response.data?.tag || response.data;
      return tag;
    } catch (error) {
      console.error('TagService: erro ao criar tag', error);
      throw error;
    }
  }
}
