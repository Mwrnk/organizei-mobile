import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Modal, Pressable, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';
import SearchIcon from '@icons/SearchIcon';

type RootStackParamList = {
  CardDetail: {
    card: {
      id: string;
      title: string;
      image_url?: string[];
      createdAt?: string;
    };
    listId: string;
    listName: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CardDetail'>;

interface Card {
  _id: string;
  title: string;
  image_url?: string[];
  createdAt?: string;
  userId?: {
    avatar?: string;
  };
  isPublished?: boolean;
}

const CommunityScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dropdown de cards do usuário
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [loadingUserCards, setLoadingUserCards] = useState(false);
  const [errorUserCards, setErrorUserCards] = useState('');

  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/comunidade/cards');
        setCards(response.data.data || []);
      } catch (err) {
        setError('Erro ao carregar os cards da comunidade.');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  // Buscar cards do usuário para o dropdown
  useEffect(() => {
    const fetchUserCards = async () => {
      setLoadingUserCards(true);
      setErrorUserCards('');
      try {
        const response = await api.get('/cards');
        const userCardsData = response.data.data || [];
        
        // Buscar cards publicados na comunidade
        const communityResponse = await api.get('/comunidade/cards');
        const publishedCards = communityResponse.data.data || [];
        
        // Marcar cards que já foram publicados
        const cardsWithStatus = userCardsData.map((card: Card) => ({
          ...card,
          isPublished: publishedCards.some((publishedCard: Card) => publishedCard._id === card._id)
        }));
        
        setUserCards(cardsWithStatus);
      } catch (err) {
        setErrorUserCards('Erro ao carregar seus cards.');
      } finally {
        setLoadingUserCards(false);
      }
    };
    fetchUserCards();
  }, []);

  const filteredCards = cards
    .filter(card => card.title?.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 2);

  const handleCardPress = (card: Card) => {
    navigation.navigate('CardDetail', {
      card: {
        id: card._id,
        title: card.title,
        image_url: card.image_url,
        createdAt: card.createdAt,
      },
      listId: 'community',
      listName: 'Comunidade',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header / Título */}
        <View style={styles.header}>
          <Text style={styles.title}>O que está {"\n"}procurando hoje?</Text>
        </View>

        {/* Área de busca */}
        <View style={styles.searchArea}>  
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise o nome do card..."
              placeholderTextColor= {colors.gray}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.searchBtn}>
              <SearchIcon size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de cards recomendados */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>#recomendados</Text>
            <View style={styles.sectionLine} />
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 24 }} />
          ) : error ? (
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 24 }}>{error}</Text>
          ) : filteredCards.length === 0 ? (
            <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhum card encontrado.</Text>
          ) : (
            <FlatList
              data={filteredCards}
              keyExtractor={(item, index) => item._id || String(index)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cardBox}
                  onPress={() => handleCardPress(item)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item.image_url?.[0] || 'https://via.placeholder.com/120x80' }} style={styles.cardImg} />
                  <View style={styles.cardFooterRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDate}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
                    {item.userId?.avatar ? (
                      <Image source={{ uri: item.userId.avatar }} style={styles.cardAvatar} />
                    ) : (
                      <Ionicons name="person-circle-outline" size={18} color="#181818" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 18 }}
            />
          )}
        </View>

        {/* Seção de publicação */}
        <View style={styles.publishSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>#publique</Text>
            <View style={styles.sectionLine} />
          </View>
          <Text style={styles.publishTitle}>Publique os seus cards{"\n"}mais fácil!</Text>
          {/* Dropdown de seleção de card */}
          <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownVisible(true)}>
            <Text style={styles.dropdownText}>
              {selectedCard ? selectedCard.title : 'Selecionar o card'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.gray} />
          </TouchableOpacity>
          {/* Modal do dropdown */}
          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecione um card</Text>
                {loadingUserCards ? (
                  <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 16 }} />
                ) : errorUserCards ? (
                  <Text style={{ color: 'red', textAlign: 'center', marginVertical: 16 }}>{errorUserCards}</Text>
                ) : userCards.length === 0 ? (
                  <Text style={{ color: '#888', textAlign: 'center', marginVertical: 16 }}>Você não possui cards.</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 300 }}>
                    {userCards.map((card, index) => (
                      <TouchableOpacity
                        key={card._id || String(index)}
                        style={styles.modalItem}
                        onPress={() => {
                          setSelectedCard(card);
                          setDropdownVisible(false);
                        }}
                      >
                        <View style={styles.modalItemContent}>
                          <Text style={styles.modalItemText}>{card.title}</Text>
                          {card.isPublished ? (
                            <View style={styles.publishedBadge}>
                              <Text style={styles.publishedText}>Publicado</Text>
                            </View>
                          ) : (
                            <View style={styles.availableBadge}>
                              <Text style={styles.availableText}>Disponível</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </Pressable>
          </Modal>
          
          <TouchableOpacity
            style={[styles.publishBtn, (!selectedCard || publishing || selectedCard?.isPublished) && { opacity: 0.6 }]}
            disabled={!selectedCard || publishing || selectedCard?.isPublished}
            onPress={async () => {
              console.log('Card selecionado:', selectedCard);
              if (!selectedCard || !selectedCard._id) {
                setPublishMessage('Selecione um card para publicar.');
                return;
              }

              if (selectedCard.isPublished) {
                setPublishMessage('Este card já está publicado na comunidade.');
                return;
              }

              setPublishing(true);
              setPublishMessage('');
              try {
                await api.post(`/comunidade/publish/${selectedCard._id}`);
                setPublishMessage('Card publicado com sucesso!');
                // Atualizar cards da comunidade
                const response = await api.get('/comunidade/cards');
                setCards(response.data.data || []);
                // Atualizar lista de cards do usuário para marcar como publicado
                const userCardsResponse = await api.get('/cards');
                const userCardsData = userCardsResponse.data.data || [];
                const publishedCards = response.data.data || [];
                const cardsWithStatus = userCardsData.map((card: Card) => ({
                  ...card,
                  isPublished: publishedCards.some((publishedCard: Card) => publishedCard._id === card._id)
                }));
                setUserCards(cardsWithStatus);
                setSelectedCard(null); // Limpa a seleção após publicar
              } catch (err) {
                setPublishMessage('Erro ao publicar o card.');
              } finally {
                setPublishing(false);
              }
            }}
          >
            {publishing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.publishBtnText}>
                {selectedCard?.isPublished ? 'Já publicado' : 'Publicar'}
              </Text>
            )}
          </TouchableOpacity>
          {!!publishMessage && (
            <Text style={[
              styles.publishMessage,
              { color: publishMessage.includes('sucesso') ? colors.lowPriority : colors.highPriority }
            ]}>
              {publishMessage}
            </Text>
          )}
          
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.white, 
    paddingBottom: 130,
    paddingTop: 40,
  },

  header: { 
    marginBottom: 12, 
    paddingHorizontal: 16,
  },

  title: { 
    fontSize: 24, 
    fontFamily: fontNames.bold, 
    color: colors.primary,
  },

  searchArea: { 
    marginBottom: 16, 
    paddingHorizontal: 16,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    paddingLeft: 18,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedSection: { flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 12,
    marginRight: 8,
    fontFamily: fontNames.regular,
  },
  sectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.lightGray,
    borderRadius: 1,
  },
  cardBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  cardImg: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#181818',
    marginBottom: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  cardAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginHorizontal: 4,
  },
  cardType: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },

  publishSection: { 
    paddingHorizontal: 16, 
    paddingBottom: 24,
    marginTop: 16,
  },

  publishTitle: {
    fontFamily: fontNames.bold,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 12,
    marginTop: 8,
  },

  dropdown: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dropdownText: {
    color: colors.gray,
    fontSize: 14,
    fontFamily: fontNames.regular,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#EAEAEA',
    backgroundColor: '#EAEAEA',
    marginRight: 6,
  },
  radioCircleActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    color: '#181818',
    fontSize: 15,
  },
  publishBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 18,
  },
  publishBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontNames.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 340,
    elevation: 4,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#181818',
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalItemText: {
    fontSize: 16,
    color: '#181818',
    textAlign: 'center',
  },
  publishedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedText: {
    color: colors.lowPriority,
    fontSize: 12,
    fontFamily: fontNames.regular,
  },
  availableBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#1976D2',
    fontSize: 12,
    fontFamily: fontNames.regular
  },
  publishMessage: {
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
    fontSize: 14,
    fontFamily: fontNames.regular,
  },
});

export default CommunityScreen;
