import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { fontNames } from '../styles/fonts';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootTabParamList } from '../navigation/types';
import GameIcon from 'assets/icons/GamesIcon';
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

// Atualizar o tipo de navegação para incluir CardDetail e About
type ProfileScreenNavigationProp = StackNavigationProp<
  RootTabParamList & {
    CardDetail: {
      card: {
        id: string;
        title: string;
        content?: string;
        image_url?: string[];
        createdAt: string;
        pdfs?: any[];
      };
      listId: string;
      listName: string;
    };
    About: undefined;
  }
>;

// Atualizar interface Card para incluir pdfs
interface Card {
  _id: string;
  title: string;
  content?: string;
  image_url?: string[];
  createdAt: string;
  priority?: string;
  pdfs?: any[];
}

const ProfileScreen = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      // O contexto agora delega a ação para o controller
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para buscar cards do usuário
  const fetchUserCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/cards');
      const userCards = response.data.data || [];
      setCards(userCards);
      
    } catch (err: any) {
      console.error('ProfileScreen: Erro ao buscar cards:', err);
      setError('Não foi possível carregar seus cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar cards quando a tela é focada
  useFocusEffect(
    React.useCallback(() => {
      fetchUserCards();
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
      card: {
        id: card._id,
        title: card.title,
        content: card.content,
        image_url: card.image_url,
        createdAt: card.createdAt,
        pdfs: card.pdfs,
      },
      listId: 'profile',
      listName: 'Meus Cards'
    });
  };

  // Função para renderizar card
  const renderCard = ({ item, index }: { item: Card; index: number }) => {
    const hasImages = Boolean(
      item.image_url && Array.isArray(item.image_url) && item.image_url.length > 0
    );
    const imageUri = hasImages && item.image_url ? item.image_url[0] : null;

    return (
      <TouchableOpacity 
        style={styles.cardBox}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImage}
            resizeMode="cover"
          />
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
          <Text style={styles.cardType}>{item.priority || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Função para gerar key única para cada item
  const getItemKey = (item: Card, index: number): string => {
    return item._id || `card-${index}-${Date.now()}`;
  };

  // Preparar dados da lista
  const listData = React.useMemo(() => {
    return cards.slice(0, 10).map((card, index) => ({
      ...card,
      uniqueKey: getItemKey(card, index),
    }));
  }, [cards]);

  return (
    <SafeAreaView style={styles.container}>

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
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.iconCircle}>
            <EditIcon color="#222" size={20} />
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.userPlan}>Plano: {formatPlanName(user?.plan)}</Text>
      <View style={styles.pointsRow}>
        <RaioIcon color="#222" size={16} />
        <Text style={styles.pointsText}>+0pts</Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsHeaderRow}>
        <Text style={styles.cardsTitle}>#meus cards</Text>
        <TouchableOpacity>
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
          keyExtractor={(item) => item._id}
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
        
        <TouchableOpacity style={styles.menuBtn}>
          <AnaliticsIcon color="#222" size={16} />
          <Text style={styles.menuText}>Minhas Análises</Text>
          <View style={styles.iconCircle}>
            <ArrowDiag color="#222" size={16} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn}>
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

    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },

  sobreBtn:{
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
    marginBottom: 18,
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
});
