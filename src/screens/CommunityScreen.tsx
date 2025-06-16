import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCommunity } from '../contexts/CommunityContext';
import { ICard } from '../types/community.types';
import CommunityCard from '../components/community/CommunityCard';
import api from '../services/api';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';
import SearchIcon from '@icons/SearchIcon';
// @ts-ignore
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  CommunityMain: undefined;
  CardDetail: { card: ICard };
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CommunityScreen = () => {
  const navigation = useNavigation<Nav>();
  const { feed, loading, refreshing, refreshFeed, loadMore } = useCommunity();
  const [search, setSearch] = useState('');

  // Dropdown de publicação
  const [userCards, setUserCards] = useState<ICard[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ICard | null>(null);
  const [loadingUserCards, setLoadingUserCards] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchUserCards = async () => {
    setLoadingUserCards(true);
    try {
      const response = await api.get('/cards');
      const allUserCards = response.data.data || [];
      const unpublished = allUserCards.filter((c: ICard) => !c.is_published);
      setUserCards(unpublished);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar seus cards' });
    } finally {
      setLoadingUserCards(false);
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, []);

  const handlePublish = async () => {
    if (!selectedCard) return;
    setPublishing(true);
    try {
      await api.post(`/comunidade/publish/${selectedCard.id}`);
      Toast.show({ type: 'success', text1: 'Card publicado com sucesso!' });
      setSelectedCard(null);
      await Promise.all([refreshFeed(), fetchUserCards()]); // Atualiza feed e lista de cards
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao publicar o card.';
      Toast.show({ type: 'error', text1: message });
    } finally {
      setPublishing(false);
    }
  };

  const filteredFeed = feed.filter((card) =>
    card.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCardPress = (card: ICard) => {
    navigation.navigate('CardDetail', { card });
  };

  

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>O que está {'\n'}procurando hoje?</Text>
      </View>
      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise o nome do card..."
            placeholderTextColor={colors.gray}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.searchBtn}>
            <SearchIcon size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>#recomendados</Text>
        <View style={styles.sectionLine} />
      </View>
    </>
  );

  const renderListFooter = () => (
    <View style={styles.publishSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>#publique</Text>
        <View style={styles.sectionLine} />
      </View>
      <Text style={styles.publishTitle}>Publique os seus cards{'\n'}mais fácil!</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownVisible(true)}>
        <Text style={styles.dropdownText}>
          {selectedCard ? selectedCard.title : 'Selecionar o card'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.publishBtn, (!selectedCard || publishing) && { opacity: 0.6 }]}
        disabled={!selectedCard || publishing}
        onPress={handlePublish}
      >
        {publishing ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.publishBtnText}>Publicar</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && feed.length === 0 ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={filteredFeed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommunityCard card={item} onPress={() => handleCardPress(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshFeed}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum card encontrado.</Text>
            </View>
          }
        />
      )}

      {/* Modal Dropdown para Publicar */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione um card para publicar</Text>
            {loadingUserCards ? (
              <ActivityIndicator />
            ) : userCards.length === 0 ? (
              <Text style={styles.emptyText}>Você não tem cards disponíveis para publicar.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {userCards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCard(card);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{card.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: fontNames.bold,
    color: colors.primary,
    lineHeight: 34,
  },
  searchArea: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 12,
    marginRight: 8,
    fontFamily: fontNames.regular,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'center',
  },
  publishSection: {
    paddingVertical: 24,
    marginBottom: 130,
  },
  publishTitle: {
    fontFamily: fontNames.bold,
    fontSize: 22,
    color: colors.primary,
    marginBottom: 16,
    lineHeight: 28,
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
  publishBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  publishBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontNames.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '60%',
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
  modalItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default CommunityScreen;
