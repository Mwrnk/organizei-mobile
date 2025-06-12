import api from './api';
import { ApiSuccess, ICard, IComment } from '../types/community.types';

export const CommunityService = {
  async fetchFeed(): Promise<ICard[]> {
    const { data } = await api.get<ApiSuccess<ICard[]>>('/comunidade/cards');
    return data.data;
  },

  async likeCard(cardId: string): Promise<void> {
    await api.post(`/cards/${cardId}/like`);
  },

  async unlikeCard(cardId: string): Promise<void> {
    await api.post(`/cards/${cardId}/unlike`);
  },

  async downloadCard(cardId: string, listId: string): Promise<void> {
    await api.post(`/comunidade/download/${cardId}`, { listId });
  },

  async publishCard(cardId: string): Promise<void> {
    await api.post(`/comunidade/publish/${cardId}`);
  },

  async getComments(cardId: string): Promise<IComment[]> {
    const { data } = await api.get<ApiSuccess<IComment[]>>(`/comments/${cardId}`);
    return data.data;
  },

  async createComment(cardId: string, description: string): Promise<IComment> {
    const { data } = await api.post<ApiSuccess<IComment>>('/comments', { cardId, description });
    return data.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },
};
