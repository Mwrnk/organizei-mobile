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
import { CardService, Card } from '../services/cardService';
import { GlobalStyles } from '@styles/global';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';

const ProfileScreen = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>();
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

      const userCards = await CardService.getUserCards();

      // Validar se retornou dados válidos
      if (!userCards) {
        console.log('ProfileScreen: Nenhum card retornado');
        setCards([]);
        return;
      }

      // Garantir que é um array
      const cardsArray = Array.isArray(userCards) ? userCards : [];

      // Filtrar cards inválidos
      const validCards = cardsArray.filter((card: any) => {
        return card && typeof card === 'object' && card._id && card.title;
      });

      console.log('ProfileScreen: Cards válidos encontrados:', validCards.length);

      // Log detalhado dos cards e suas imagens
      if (validCards.length > 0) {
        validCards.forEach((card, index) => {
          console.log(`ProfileScreen: Card ${index + 1}:`, {
            id: card._id,
            title: card.title,
            hasImages: Boolean(card.image_url?.length),
            imageCount: card.image_url?.length || 0,
            firstImage: card.image_url?.[0] || null,
          });
        });
      }

      setCards(validCards);
    } catch (err: any) {
      console.error('ProfileScreen: Erro ao buscar cards:', err);

      let errorMessage = 'Erro ao carregar seus cards';

      if (err.response?.status === 401) {
        errorMessage = 'Erro de autenticação. Faça login novamente.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Serviço não encontrado';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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

  // Função para renderizar card
  const renderCard = ({ item, index }: { item: Card; index: number }) => {
    const hasImages = Boolean(
      item.image_url && Array.isArray(item.image_url) && item.image_url.length > 0
    );
    const imageUri = hasImages && item.image_url ? item.image_url[0] : null;

    return (
      <View style={styles.cardBox}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImage}
            onError={() => {
              console.log('ProfileScreen: Erro ao carregar imagem:', imageUri);
            }}
            onLoad={() => {
              console.log('ProfileScreen: Imagem carregada com sucesso:', imageUri);
            }}
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
      </View>
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
          data={listData}
          keyExtractor={(item) => item.uniqueKey}
          renderItem={renderCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsList}
          contentContainerStyle={{ paddingLeft: 12, paddingRight: 12 }}
          getItemLayout={(data, index) => ({
            length: 184, // width + margin
            offset: 184 * index,
            index,
          })}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você ainda não criou nenhum card</Text>
          <Text style={styles.emptySubText}>Comece criando seu primeiro card de estudos!</Text>
        </View>
      )}

      {/* Botões de menu */}
      <View style={styles.menuBox}>
        <View style={styles.contentContainer}>
          {/* button logout */}
          <CustomButton
            title="Sair da conta"
            loading={loading}
            onPress={handleLogout}
            buttonStyle={styles.logoutButton}
            variant="outline"
          />
        </View>

        <TouchableOpacity style={styles.menuBtn}>
          <UserIcon color="#222" size={16} />
          <Text style={styles.menuText}>Informação Pessoal</Text>
          <View style={styles.iconCircle}>
            <ArrowDiag color="#222" size={16} />
          </View>
        </TouchableOpacity>
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

      {/* Botão Premium */}
      <TouchableOpacity style={styles.premiumBtn} onPress={() => navigation.navigate('Plan')}>
        <SuperCheck color="#ffffff" size={16} />
        <Text style={styles.premiumBtnText}>Vire Premium</Text>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(26, 26, 26, 0.1)' }]}>
          <ArrowDiag color="#ffffff" size={16} />
        </View>
      </TouchableOpacity>
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
    fontWeight: '600',
    color: '#222',
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
    marginTop: 8,
    minHeight: 140,
    maxHeight: 300,
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 12,
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
    height: 60,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
    fontFamily: fontNames.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginTop: 18,
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

    backgroundColor: '#007AFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 18,
  },
  premiumBtnText: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
    fontFamily: fontNames.bold,
  },

  contentContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutButton: {
    width: '80%',
    marginBottom: 20,
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
});
