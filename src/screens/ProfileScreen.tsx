import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Animated,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { fontNames } from '../styles/fonts';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootTabParamList } from '../navigation/types';
import FogueteIcon from 'assets/icons/FogueteIcon';
import RaioIcon from 'assets/icons/RaioIcon';
import SuperCheck from 'assets/icons/SuperCheck';
import ArrowDiag from 'assets/icons/ArrowDiag';
import AnaliticsIcon from 'assets/icons/AnaliticsIcon';
import EditIcon from 'assets/icons/EditIcon';
import UserIcon from 'assets/icons/UserIcon';
import { CardService } from '../services/cardService';
import { GlobalStyles } from '@styles/global';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';
import LogOutIcon from '@icons/LogOutIcon';
import api from '../services/api';
import UserGroupIcon from '@icons/UserGroupIcon';
import CloseIcon from '@icons/CloseIcon';
import FileDocumentIcon from '@icons/FileDocumentIcon';
import Ionicons from '@expo/vector-icons/Ionicons';
import FolderIcon from '@icons/FolderIcon';
import HeartIcon from '@icons/HeartIcon';

// Atualizar o tipo de navegação para incluir CardDetail, About e Points
type ProfileScreenNavigationProp = StackNavigationProp<
  RootTabParamList & {
    CardDetail: {
      card: {
        id: string;
        title: string;
        content?: string;
        image_url?: string[];
        createdAt?: string;
        pdfs?: any[];
        priority?: 'baixa' | 'media' | 'alta';
        is_published?: boolean;
      };
      listId: string;
      listName: string;
    };
    About: undefined;
    Points: undefined;
    AllCards: undefined;
  }
>;

// Atualizar interface Card para incluir pdfs
interface Card {
  id: string;
  title: string;
  userId: string;
  createdAt?: string;
  pdfs?: {
    url: string;
    filename: string;
    uploaded_at: string;
    size_kb?: number;
  }[];
  image_url?: string[];
  content?: string;
  priority?: 'baixa' | 'media' | 'alta';
  is_published?: boolean;
  is_favorite?: boolean;
}

interface Lista {
  id: string;
  name: string;
  userId: string;
}

const ProfileScreen = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [cards, setCards] = useState<Card[]>([]);
  const [lists, setLists] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      // O contexto agora delega a ação para o controller
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Busca todos os cards do usuário (inclui createdAt e priority corretos)
  const fetchUserCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const userIdParam = user?._id || user?.id;
      // Endpoint que devolve dados completos do card, incluindo createdAt
      const response = await api.get(`/cards/user/${userIdParam}`);
      const userCards = (response.data.data || []).map((c: any, idx: number) => ({
        ...c,
        id: c.id || c._id || `card-${idx}-${Date.now()}`,
      }));
      setCards(userCards);
    } catch (err: any) {
      console.error('ProfileScreen: Erro ao buscar cards:', err);
      setError('Não foi possível carregar seus cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar listas do usuário
  const fetchUserLists = async () => {
    try {
      const response = await api.get(`/lists/user/${user?.id || user?._id}`);
      setLists(response.data.data || []);
    } catch (err: any) {
      console.error('ProfileScreen: Erro ao buscar listas:', err);
      setError('Não foi possível carregar suas listas');
      setLists([]);
    }
  };

  // Buscar cards e listas quando a tela é focada
  useFocusEffect(
    React.useCallback(() => {
      fetchUserCards();
      fetchUserLists();
    }, [])
  );

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  // Função para formatar o nome do plano
  const formatPlanName = (planId: string | null) => {
    if (!planId) return 'Free';

    // Mapeamento de IDs para nomes de planos
    const planNames: { [key: string]: string } = {
      '68379d4289ed7583b0596d87': 'Premium',
      // Adicione outros IDs de planos aqui conforme necessário
    };

    return planNames[planId] || 'Free';
  };

  // Função para navegar para o detalhe do card
  const handleCardPress = (card: Card) => {
    navigation.navigate('CardDetail', {
      card: card,
      listId: 'profile',
      listName: 'Meus Cards',
    });
  };

  // Função utilitária para obter cor da prioridade
  const getPriorityColor = (priority?: string | null) => {
    const value = priority?.toLowerCase();
    switch (value) {
      case 'alta':
        return colors.highPriority;
      case 'media':
        return colors.mediumPriority;
      case 'baixa':
        return colors.lowPriority;
      default:
        return '#888';
    }
  };

  // Função para renderizar card
  const renderCard = ({ item, index }: { item: Card; index: number }) => {
    const hasImages = Boolean(
      item.image_url && Array.isArray(item.image_url) && item.image_url.length > 0
    );
    const imageUri = hasImages && item.image_url ? item.image_url[0] : null;
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={styles.cardBox}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📄</Text>
          </View>
        )}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title || 'Sem título'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>
            {item.createdAt ? formatDate(item.createdAt) : '--/--/--'}
          </Text>
          <Text style={[styles.cardType, { color: priorityColor }]}>
            {' '}
            {item.priority || 'N/A'}{' '}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Função para gerar key única para cada item
  const getItemKey = (item: Card, index: number): string => {
    return item.id || `card-${index}-${Date.now()}`;
  };

  // Preparar dados da lista
  const listData = React.useMemo(() => {
    const totalLists = lists.length;
    return cards.slice(0, 10).map((card, index) => ({
      ...card,
      uniqueKey: getItemKey(card, index),
    }));
  }, [cards]);

  // Função para calcular estatísticas
  const stats = useMemo(() => {
    const totalCards = cards.length;
    const totalPdfs = cards.reduce((acc, card) => acc + (card.pdfs?.length || 0), 0);
    const highPriorityCards = cards.filter((card) => card.priority === 'alta').length;
    const mediumPriorityCards = cards.filter((card) => card.priority === 'media').length;
    const totalLists = lists.length;
    const favoriteCards = cards.filter((card) => card.is_favorite).length;

    return {
      totalCards,
      totalPdfs,
      highPriorityCards,
      mediumPriorityCards,

      totalLists,
      favoriteCards,
    };
  }, [cards, lists]);

  // Função para abrir o modal de estatísticas
  const handleOpenStats = () => {
    setShowStats(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Função para fechar o modal de estatísticas
  const handleCloseStats = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowStats(false);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Btn Sobre */}
        <View style={styles.sobreBtn}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.navigate('About')}>
            <UserGroupIcon color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Avatar centralizado */}
        <View style={styles.avatarContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
            </View>
          )}
        </View>

        {/* Nome, pontos e editar */}
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.iconCircle}>
              <EditIcon color="#222" size={20} />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.userPlan}>Plano: {formatPlanName(user?.plan ?? null)}</Text>
        <View style={styles.pointsRow}>
          <RaioIcon color="#222" size={16} />
          <Text style={styles.pointsText}>+{user?.orgPoints || 0}pts</Text>
        </View>

        {/* Cards */}
        <View style={styles.cardsHeaderRow}>
          <Text style={styles.cardsTitle}>#meus cards</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllCards')}>
            <Text style={styles.cardsSeeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Loading ou Lista de Cards */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando seus cards...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUserCards}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : cards.length > 0 ? (
          <FlatList
            data={cards.slice(0, 6)}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsList}
            contentContainerStyle={styles.cardsContainer}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={6}
            removeClippedSubviews={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não criou nenhum card</Text>
            <Text style={styles.emptySubText}>Comece criando seu primeiro card de estudos!</Text>
          </View>
        )}

        {/* Botões de menu */}

        {/* Botão Premium */}
        <TouchableOpacity style={styles.premiumBtn} onPress={() => navigation.navigate('Plan')}>
          <SuperCheck color="#ffffff" size={16} />
          <Text style={styles.premiumBtnText}>Vire Premium</Text>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(26, 26, 26, 0.1)' }]}>
            <ArrowDiag color="#ffffff" size={16} />
          </View>
        </TouchableOpacity>

        <View style={styles.menuBox}>
          <TouchableOpacity style={styles.menuBtn} onPress={handleOpenStats}>
            <AnaliticsIcon color="#222" size={16} />
            <Text style={styles.menuText}>Minhas Análises</Text>
            <View style={styles.iconCircle}>
              <ArrowDiag color="#222" size={16} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Points')}>
            <RaioIcon color="#222" size={16} />
            <Text style={styles.menuText}>Meus Pontos</Text>
            <View style={styles.iconCircle}>
              <ArrowDiag color="#222" size={16} />
            </View>
          </TouchableOpacity>
        </View>

        {/* button logout */}
        <CustomButton
          title="Sair da conta"
          loading={loading}
          onPress={handleLogout}
          buttonStyle={styles.logoutButton}
          icon={<LogOutIcon size={16} color={colors.white} />}
        />

        {/* Modal de Estatísticas */}
        <Modal
          visible={showStats}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCloseStats}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <View style={styles.cardDetailsHeader}>
                <View style={styles.titleModalContainer}>
                  <AnaliticsIcon size={24} color={colors.primary} />
                  <Text style={styles.modalTitle}>Estatísticas</Text>
                </View>
                <TouchableOpacity onPress={handleCloseStats} style={styles.closeButton}>
                  <CloseIcon size={24} color={colors.gray} />
                </TouchableOpacity>
              </View>

              <View style={styles.statsContent}>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <FolderIcon size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.totalLists}</Text>
                    <Text style={styles.statLabel}>Listas</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="documents-outline" size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.totalCards}</Text>
                    <Text style={styles.statLabel}>Cards</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scrollView: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },

  sobreBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    backgroundColor: '#181818',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  userName: {
    fontSize: 20,
    color: colors.primary,
    fontFamily: fontNames.bold,
  },
  editBtn: {
    marginLeft: 8,
  },
  iconCircle: {
    padding: 10,
    backgroundColor: '#E9E8E8',
    borderRadius: 999,
  },
  editIcon: {
    fontSize: 18,
    color: '#888',
    fontFamily: fontNames.regular,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pointsIcon: {
    fontSize: 16,
    color: '#222',
    marginRight: 2,
  },
  pointsText: {
    fontSize: 14,
    color: '#222',
    fontFamily: fontNames.regular,
  },
  cardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 18,
    marginHorizontal: 18,
  },
  cardsTitle: {
    color: '#222',
    fontWeight: '500',
    fontSize: 13,
    fontFamily: fontNames.semibold,
  },
  cardsSeeAll: {
    color: '#888',
    fontSize: 13,
    fontFamily: fontNames.regular,
  },
  cardsList: {
    minHeight: 180,
    maxHeight: 200,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
    fontFamily: fontNames.bold,
    minHeight: 40,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardDate: {
    fontSize: 11,
    color: '#888',
    fontFamily: fontNames.regular,
  },
  cardType: {
    fontSize: 11,
    color: '#888',
    fontFamily: fontNames.regular,
  },
  // Novos estilos para loading e erro
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fontNames.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#222',
    fontFamily: fontNames.semibold,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    textAlign: 'center',
  },
  menuBox: {
    marginTop: 8,
    marginHorizontal: 12,
    gap: 10,
  },
  menuBtn: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    fontFamily: fontNames.semibold,
  },
  menuArrow: {
    fontSize: 18,
    color: '#888',
  },

  premiumBtn: {
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 18,

    backgroundColor: colors.button,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 8,
  },
  premiumBtnText: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    marginRight: 8,
    fontFamily: fontNames.bold,
  },

  logoutButton: {
    height: 68,
    backgroundColor: colors.highPriority,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 300,
  },

  placeholderImage: {
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#888',
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
  cardsRow: {
    justifyContent: 'space-between',
  },
  userPlan: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginTop: 4,
  },

  // Estilos do Modal de Estatísticas
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
    alignSelf: 'center',
    gap: 16,
  },
  cardDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleModalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 6,
  },
  closeButton: {
    padding: 4,
  },
  statsContent: {
    flexGrow: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fontNames.bold,
    marginTop: 8,
  },
  statLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginTop: 4,
  },
  progressSection: {
    marginTop: 16,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressTxtContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.button,
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'right',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fontNames.bold,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fontNames.bold,
    marginBottom: 12,
  },
});
