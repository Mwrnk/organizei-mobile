import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
// @ts-ignore
import Toast from 'react-native-toast-message';
import { ICard } from '../types/community.types';
import { CommunityService } from '../services/communityService';

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
  const PAGE_SIZE = 20; // client-side pagination since backend ainda não suporta

  // Carrega feed completo uma vez e depois paginamos localmente
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CommunityService.fetchFeed();
      setFeed(data);
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
    try {
      await CommunityService.likeCard(cardId);
      setFeed((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, likes: c.likes + 1, likedByUser: true } : c))
      );
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao curtir card' });
    }
  };

  const unlikeCard = async (cardId: string) => {
    try {
      await CommunityService.unlikeCard(cardId);
      setFeed((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, likes: Math.max(0, c.likes - 1), likedByUser: false } : c
        )
      );
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao remover like' });
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
