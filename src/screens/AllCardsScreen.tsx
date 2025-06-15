import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootTabParamList } from '../navigation/types';
import { fontNames } from '../styles/fonts';
import colors from '@styles/colors';
import ArrowBack from 'assets/icons/ArrowBack';
import api from '../services/api';

type AllCardsScreenNavigationProp = StackNavigationProp<
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
  }
>;

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
}

const AllCardsScreen = () => {
  const navigation = useNavigation<AllCardsScreenNavigationProp>();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/cards');
      const userCards = response.data.data || [];
      setCards(userCards);
      
    } catch (err: any) {
      console.error('AllCardsScreen: Erro ao buscar cards:', err);
      setError('Não foi possível carregar seus cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const handleCardPress = (card: Card) => {
    navigation.navigate('CardDetail', {
      card: card,
      listId: 'allCards',
      listName: 'Todos os Cards'
    });
  };

  const renderCard = ({ item }: { item: Card }) => {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowBack color={colors.primary} size={16} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Cards</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Loading ou Lista de Cards */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.button} />
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
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2}
          contentContainerStyle={styles.cardsContainer}
          columnWrapperStyle={styles.cardsRow}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você ainda não criou nenhum card</Text>
          <Text style={styles.emptySubText}>Comece criando seu primeiro card de estudos!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AllCardsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  cardsContainer: {
    padding: 16,
  },
  cardsRow: {
    justifyContent: 'space-between',
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#222',
    fontFamily: fontNames.semibold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    textAlign: 'center',
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