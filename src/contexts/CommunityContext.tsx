import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
// @ts-ignore
import Toast from 'react-native-toast-message';
import { ICard, IComment } from '../types/community.types';
import { CommunityService } from '../services/communityService';
import api from '../services/api';
import { ApiSuccess } from '../types/community.types';
import { useAuth } from './AuthContext';
import * as Haptics from 'expo-haptics';

interface CommunityContextValue {
  feed: ICard[];
  loading: boolean;
  refreshing: boolean;
  likeCard: (cardId: string) => Promise<void>;
  unlikeCard: (cardId: string) => Promise<void>;
  downloadCard: (cardId: string, listId: string) => Promise<void>;
  fetchFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [feed, setFeed] = useState<ICard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pendingLikeOps = useRef<Set<string>>(new Set()); // evita múltiplos cliques rápidos

  const { user } = useAuth();

  const PAGE_SIZE = 20; // client-side pagination since backend ainda não suporta

  // Carrega feed completo e contagem de comentários
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      // Busca cards e todos os comentários em paralelo
      const [cardsData, allCommentsRes] = await Promise.all([
        CommunityService.fetchFeed(),
        api.get<ApiSuccess<IComment[]>>('/comments'),
      ]);

      const allComments = allCommentsRes.data.data || [];

      // Cria um mapa de contagem de comentários por cardId
      const commentCounts = allComments.reduce((acc, comment) => {
        const cardId = (comment as any).cardId;
        if (cardId) {
          acc[cardId] = (acc[cardId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Mapeia os cards para adicionar a contagem de comentários
      const feedWithCounts = cardsData.map((card) => ({
        ...card,
        comments: commentCounts[card.id] || 0,
      }));

      setFeed(feedWithCounts);
      setPage(1);
    } catch (err) {
      console.error('CommunityContext: erro ao buscar feed', err);
      Toast.show({ type: 'error', text1: 'Erro ao carregar feed' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const refreshFeed = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const loadMore = async () => {
    // Como não há paginação no backend, apenas aumentamos page para renderizar mais itens
    setPage((prev) => prev + 1);
  };

  const likeCard = async (cardId: string) => {
    // Debounce rápido
    if (pendingLikeOps.current.has(cardId)) return;

    const targetCard = feed.find((c) => c.id === cardId);
    if (!targetCard) return;

    // Validação de auto-curtida
    const authorId =
      typeof targetCard.userId === 'object' ? (targetCard.userId as any)?._id : targetCard.userId;
    if (authorId && authorId === user?.id) {
      Toast.show({ type: 'info', text1: 'Você não pode curtir seu próprio post' });
      return;
    }

    // Otimista
    setFeed((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, likes: c.likes + 1, likedByUser: true } : c))
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    pendingLikeOps.current.add(cardId);
    try {
      await CommunityService.likeCard(cardId);
    } catch (err: any) {
      // Rollback
      setFeed((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, likes: Math.max(0, c.likes - 1), likedByUser: false } : c
        )
      );

      const message = err?.response?.data?.message || 'Erro ao curtir card';
      Toast.show({ type: 'error', text1: message });
    } finally {
      pendingLikeOps.current.delete(cardId);
    }
  };

  const unlikeCard = async (cardId: string) => {
    if (pendingLikeOps.current.has(cardId)) return;

    // Otimista
    setFeed((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, likes: Math.max(0, c.likes - 1), likedByUser: false } : c
      )
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    pendingLikeOps.current.add(cardId);
    try {
      await CommunityService.unlikeCard(cardId);
    } catch (err: any) {
      // Rollback
      setFeed((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, likes: c.likes + 1, likedByUser: true } : c))
      );

      const message = err?.response?.data?.message || 'Erro ao remover like';
      Toast.show({ type: 'error', text1: message });
    } finally {
      pendingLikeOps.current.delete(cardId);
    }
  };

  const downloadCard = async (cardId: string, listId: string) => {
    try {
      await CommunityService.downloadCard(cardId, listId);
      Toast.show({ type: 'success', text1: 'Card adicionado à lista!' });
      setFeed((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, downloads: c.downloads + 1 } : c))
      );
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao baixar card' });
    }
  };

  // Items expostos respeitando paginação local
  const paginatedFeed = feed.slice(0, page * PAGE_SIZE);

  const value: CommunityContextValue = {
    feed: paginatedFeed,
    loading,
    refreshing,
    likeCard,
    unlikeCard,
    downloadCard,
    fetchFeed,
    refreshFeed,
    loadMore,
  };

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
};

export const useCommunity = () => {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
};
