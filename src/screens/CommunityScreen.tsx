import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

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

  const filteredCards = cards.filter(card =>
    card.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Título */}
      <View style={styles.header}>
        <Text style={styles.title}>O que está procurando hoje?</Text>
      </View>

      {/* Área de busca */}
      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise o nome do card..."
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.searchBtn}>
            <Ionicons name="search" size={22} color="#181818" />
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
              <View style={styles.cardBox}>
                <Image source={{ uri: item.image_url?.[0] || 'https://via.placeholder.com/120x80' }} style={styles.cardImg} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardFooterRow}>
                  <Text style={styles.cardDate}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
                  {item.userId?.avatar ? (
                    <Image source={{ uri: item.userId.avatar }} style={styles.cardAvatar} />
                  ) : (
                    <Ionicons name="person-circle-outline" size={18} color="#181818" style={{ marginLeft: 4 }} />
                  )}
                  <Text style={styles.cardType}>Escolar</Text>
                </View>
              </View>
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
          <Ionicons name="chevron-down" size={20} color="#888" />
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
        <View style={styles.radioRow}>
          <TouchableOpacity style={styles.radioBtn}>
            <View style={[styles.radioCircle, true && styles.radioCircleActive]} />
            <Text style={styles.radioLabel}>Escolar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.publishBtn, (!selectedCard || publishing) && { opacity: 0.6 }]}
          disabled={!selectedCard || publishing}
          onPress={async () => {
            console.log('Card selecionado:', selectedCard);
            if (!selectedCard || !selectedCard._id) {
              setPublishMessage('Selecione um card para publicar.');
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
            } catch (err) {
              setPublishMessage('Erro ao publicar o card.');
            } finally {
              setPublishing(false);
            }
          }}
        >
          {publishing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.publishBtnText}>Publicar</Text>
          )}
        </TouchableOpacity>
        {!!publishMessage && (
          <Text style={{ textAlign: 'center', color: publishMessage.includes('sucesso') ? 'green' : 'red', marginBottom: 8 }}>
            {publishMessage}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingBottom: 32 },
  header: { marginTop: 24, marginBottom: 12, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#181818' },
  searchArea: { marginBottom: 16, paddingHorizontal: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 24,
    paddingHorizontal: 18,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#181818',
  },
  searchBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  recommendedSection: { flex: 1, paddingHorizontal: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#222',
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
    borderRadius: 1,
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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
  publishSection: { paddingHorizontal: 16, paddingBottom: 24 },
  publishTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#181818',
    marginBottom: 12,
    marginTop: 8,
  },
  dropdown: {
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dropdownText: {
    color: '#888',
    fontSize: 15,
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '500',
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
    fontWeight: '500',
  },
});

export default CommunityScreen;
