import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { TOKEN_KEY } from '../services/auth';
import { GlobalStyles } from '@styles/global';
import { fontNames } from '@styles/fonts';
import colors from '@styles/colors';
import Input from '@components/Input';
import CustomButton from '@components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// Interfaces baseadas na versão web
interface Lista {
  id: string;
  name: string;
  userId: string;
}

interface CardData {
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

// Componente de Card memoizado para melhor performance
const CardItem = React.memo(
  ({
    item,
    index,
    listId,
    viewMode,
    favorites,
    onCardPress,
    onDeleteCard,
    onToggleFavorite,
  }: {
    item: CardData;
    index: number;
    listId: string;
    viewMode: 'list' | 'grid';
    favorites: Set<string>;
    onCardPress: (item: CardData, listId: string) => void;
    onDeleteCard: (cardId: string, listId: string) => void;
    onToggleFavorite: (cardId: string) => void;
  }) => {
    const cardAnimation = React.useRef(new Animated.Value(0)).current;

    const animateCard = useCallback(() => {
      Animated.spring(cardAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, [cardAnimation]);

    React.useEffect(() => {
      const timer = setTimeout(() => animateCard(), index * 50);
      return () => clearTimeout(timer);
    }, [animateCard, index]);

    const handlePress = useCallback(() => {
      onCardPress(item, listId);
    }, [item, listId, onCardPress]);

    const handleLongPress = useCallback(() => {
      onDeleteCard(item.id, listId);
    }, [item.id, listId, onDeleteCard]);

    const handleFavoritePress = useCallback(() => {
      onToggleFavorite(item.id);
    }, [item.id, onToggleFavorite]);

    return (
      <Animated.View
        style={[
          styles.cardItem,
          viewMode === 'grid' && styles.cardItemGrid,
          {
            opacity: cardAnimation,
            transform: [
              {
                translateY: cardAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          style={styles.cardContent}
        >
          <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
            <Ionicons
              name={favorites.has(item.id) ? 'heart' : 'heart-outline'}
              size={20}
              color={favorites.has(item.id) ? '#ff4444' : colors.gray}
            />
          </TouchableOpacity>

          <Text style={styles.cardTitle}>{item.title}</Text>

          <View style={styles.cardFooter}>
            {item.pdfs && item.pdfs.length > 0 && (
              <View style={styles.cardPdfIndicator}>
                <Ionicons name="document-text-outline" size={16} color="#666" />
                <Text style={styles.cardPdfText}>{item.pdfs.length} arquivo(s)</Text>
              </View>
            )}

            {item.createdAt && (
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const EscolarScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const userId = user?._id || user?.id; // Usar _id do MongoDB ou fallback para id

  // Estados principais
  const [lists, setLists] = useState<Lista[]>([]);
  const [cards, setCards] = useState<Record<string, CardData[]>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para melhorias
  const [searchText, setSearchText] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [activeFilters, setActiveFilters] = useState({
    onlyFavorites: false,
    onlyWithPdfs: false,
    sortBy: 'date' as 'date' | 'name' | 'pdfs',
  });

  // Estados para animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  // Estados para modais
  const [showListModal, setShowListModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Estados para formulários
  const [listName, setListName] = useState('');

  // Carrega listas e cards
  useEffect(() => {
    if (userId) {
      fetchListsAndCards();
    }
  }, [userId]);

  // Animações iniciais
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Carregar preferências e verificar se é primeira vez
    loadPreferences();
  }, []);

  // Função para carregar preferências do usuário
  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem(`escolar_preferences_${userId}`);
      const hasSeenTutorial = await AsyncStorage.getItem(`escolar_tutorial_${userId}`);

      if (savedPreferences) {
        const prefs = JSON.parse(savedPreferences);
        setViewMode(prefs.viewMode || 'list');
        setActiveFilters(
          prefs.activeFilters || {
            onlyFavorites: false,
            onlyWithPdfs: false,
            sortBy: 'date',
          }
        );
        if (prefs.favorites) {
          setFavorites(new Set(prefs.favorites));
        }
      }

      // Mostrar tutorial se é primeira vez
      if (!hasSeenTutorial && lists.length === 0) {
        setTimeout(() => setShowTutorial(true), 1000);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  // Função para salvar preferências
  const savePreferences = async () => {
    try {
      const preferences = {
        viewMode,
        activeFilters,
        favorites: Array.from(favorites),
      };
      await AsyncStorage.setItem(`escolar_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  // Salvar preferências sempre que mudarem
  useEffect(() => {
    if (userId) {
      savePreferences();
    }
  }, [viewMode, activeFilters, favorites, userId, lists, cards]);

  const fetchListsAndCards = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await api.get(`/lists/user/${userId}`);
      const listas = res.data.data || [];
      setLists(listas);

      if (listas.length === 0) {
        setCards({});
        return;
      }

      const cardsPorLista: Record<string, CardData[]> = {};
      await Promise.all(
        listas.map(async (list: Lista) => {
          const cardsRes = await api.get(`/lists/${list.id}/cards`);
          cardsPorLista[list.id] = cardsRes.data.data.map((card: any) => ({
            id: card.id,
            title: card.title,
            userId: card.userId,
            createdAt: card.createdAt,
            pdfs: card.pdfs || [],
          }));
        })
      );

      setCards(cardsPorLista);
    } catch (err) {
      console.error('Erro ao buscar listas ou cards', err);

      // Modo offline com dados simulados para demonstração
      Alert.alert(
        'Modo Offline',
        'Não foi possível conectar ao servidor. Carregando dados de demonstração.',
        [
          {
            text: 'OK',
            onPress: () => loadDemoData(),
          },
        ]
      );
      setOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  // Dados simulados para demonstração
  const loadDemoData = () => {
    const demoLists: Lista[] = [
      { id: 'demo-1', name: 'Matemática', userId: userId || 'demo' },
      { id: 'demo-2', name: 'História', userId: userId || 'demo' },
      { id: 'demo-3', name: 'Ciências', userId: userId || 'demo' },
    ];

    const demoCards: Record<string, CardData[]> = {
      'demo-1': [
        {
          id: 'card-1',
          title: 'Álgebra Linear',
          userId: userId || 'demo',
          createdAt: new Date().toISOString(),
          pdfs: [
            {
              url: '',
              filename: 'equacoes_primeiro_grau.pdf',
              uploaded_at: new Date().toISOString(),
              size_kb: 245,
            },
          ],
        },
        {
          id: 'card-2',
          title: 'Geometria',
          userId: userId || 'demo',
          createdAt: new Date().toISOString(),
          pdfs: [],
        },
      ],
      'demo-2': [
        {
          id: 'card-3',
          title: 'Brasil Império',
          userId: userId || 'demo',
          createdAt: new Date().toISOString(),
          pdfs: [
            {
              url: '',
              filename: 'proclamacao_republica.pdf',
              uploaded_at: new Date().toISOString(),
              size_kb: 380,
            },
          ],
        },
      ],
      'demo-3': [
        {
          id: 'card-4',
          title: 'Sistema Solar',
          userId: userId || 'demo',
          createdAt: new Date().toISOString(),
          pdfs: [],
        },
        {
          id: 'card-5',
          title: 'Fotossíntese',
          userId: userId || 'demo',
          createdAt: new Date().toISOString(),
          pdfs: [
            {
              url: '',
              filename: 'processo_fotossintetico.pdf',
              uploaded_at: new Date().toISOString(),
              size_kb: 156,
            },
          ],
        },
      ],
    };

    setLists(demoLists);
    setCards(demoCards);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListsAndCards();
    setRefreshing(false);
  };

  // Função para filtrar listas pela busca - otimizada com useMemo
  const filteredLists = useMemo(() => {
    return lists.filter((list) => list.name.toLowerCase().includes(searchText.toLowerCase()));
  }, [lists, searchText]);

  // Função para filtrar cards pela busca e filtros - otimizada com useCallback
  const getFilteredCards = useCallback(
    (listId: string) => {
      let listCards = cards[listId] || [];

      // Filtro por texto de busca
      if (searchText) {
        listCards = listCards.filter((card) =>
          card.title.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // Filtro por favoritos
      if (activeFilters.onlyFavorites) {
        listCards = listCards.filter((card) => favorites.has(card.id));
      }

      // Filtro por PDFs
      if (activeFilters.onlyWithPdfs) {
        listCards = listCards.filter((card) => card.pdfs && card.pdfs.length > 0);
      }

      // Ordenação
      listCards.sort((a, b) => {
        switch (activeFilters.sortBy) {
          case 'name':
            return a.title.localeCompare(b.title);
          case 'pdfs':
            return (b.pdfs?.length || 0) - (a.pdfs?.length || 0);
          case 'date':
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });

      return listCards;
    },
    [cards, searchText, activeFilters, favorites]
  );

  // Função para upload de PDF (placeholder)
  const handlePdfUpload = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Upload de PDF',
      'Funcionalidade em desenvolvimento. Em breve você poderá anexar arquivos PDF aos seus cards.',
      [{ text: 'OK' }]
    );
  }, []);

  // Função para selecionar imagem
  const handleSelectImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  }, []);

  // Função para selecionar PDF
  const handleSelectPdf = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Erro ao selecionar PDF:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
    }
  }, []);

  // Função para alternar favorito - otimizada com useCallback
  const toggleFavorite = useCallback((cardId: string) => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(cardId)) {
        newFavorites.delete(cardId);
      } else {
        newFavorites.add(cardId);
      }
      return newFavorites;
    });
  }, []);

  // Função para carregar dados demo manualmente
  const handleLoadDemo = () => {
    Alert.alert(
      'Carregar Dados Demo',
      'Deseja carregar dados de demonstração para testar a funcionalidade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          onPress: () => {
            loadDemoData();
            setOfflineMode(true);
          },
        },
      ]
    );
  };

  // Tutorial Steps
  const tutorialSteps = [
    {
      title: 'Bem-vindo à área Escolar! 📚',
      description:
        'Aqui você pode organizar seus estudos em listas e cards. Vamos fazer um tour rápido!',
      highlight: null,
    },
    {
      title: 'Criar suas listas',
      description: 'Clique aqui para criar listas temáticas como "Matemática", "História", etc.',
      highlight: 'createButton',
    },
    {
      title: 'Filtros inteligentes',
      description: 'Use filtros para encontrar rapidamente seus cards favoritos ou com PDFs.',
      highlight: 'filterButton',
    },
    {
      title: 'Estatísticas dos estudos',
      description: 'Acompanhe seu progresso e veja estatísticas dos seus estudos.',
      highlight: 'statsButton',
    },
    {
      title: 'Modos de visualização',
      description: 'Alterne entre visualização em lista ou grade conforme sua preferência.',
      highlight: 'viewModeButton',
    },
  ];

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = async () => {
    setShowTutorial(false);
    setTutorialStep(0);
    try {
      await AsyncStorage.setItem(`escolar_tutorial_${userId}`, 'completed');
    } catch (error) {
      console.error('Erro ao salvar status do tutorial:', error);
    }

    // Oferecer carregar dados demo após tutorial
    setTimeout(() => {
      Alert.alert(
        'Começar com dados demo?',
        'Quer carregar alguns dados de demonstração para experimentar as funcionalidades?',
        [
          { text: 'Não, obrigado', style: 'cancel' },
          { text: 'Sim, carregar demo', onPress: handleLoadDemo },
        ]
      );
    }, 500);
  };

  // Função para calcular estatísticas - otimizada com useMemo
  const stats = useMemo(() => {
    const totalLists = lists.length;
    const totalCards = Object.values(cards).reduce((acc, listCards) => acc + listCards.length, 0);
    const totalPdfs = Object.values(cards).reduce(
      (acc, listCards) =>
        acc + listCards.reduce((cardAcc, card) => cardAcc + (card.pdfs?.length || 0), 0),
      0
    );
    const favoriteCards = favorites.size;

    return { totalLists, totalCards, totalPdfs, favoriteCards };
  }, [lists, cards, favorites]);

  // Função para deletar card com swipe
  const handleDeleteCard = (cardId: string, listId: string) => {
    // Haptic feedback forte para ação destrutiva
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Excluir Card', 'Tem certeza que deseja excluir este card?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          // Haptic feedback de sucesso
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          setCards((prev) => {
            // Verificar se a lista existe antes de tentar filtrar
            if (!prev[listId]) {
              console.warn(`Lista ${listId} não encontrada ao tentar deletar card ${cardId}`);
              return prev;
            }

            return {
              ...prev,
              [listId]: prev[listId].filter((card) => card.id !== cardId),
            };
          });

          // Remove dos favoritos se estiver marcado
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.delete(cardId);
            return newFavorites;
          });
        },
      },
    ]);
  };
  const handleCreateList = async () => {
    if (!userId || !listName.trim()) {
      Alert.alert('Erro', 'Preencha o nome da lista corretamente.');
      return;
    }

    if (offlineMode) {
      // Modo offline - criar lista localmente
      const novaLista: Lista = {
        id: `demo-${Date.now()}`,
        name: listName.trim(),
        userId: userId,
      };

      setLists((prev) => [...prev, novaLista]);
      setCards((prev) => ({ ...prev, [novaLista.id]: [] }));
      setListName('');
      setShowListModal(false);
      Alert.alert('Sucesso', 'Lista criada com sucesso! (Modo Offline)');
      return;
    }

    const payload = {
      name: listName.trim(),
      userId,
    };

    try {
      const res = await api.post(`/lists`, payload);

      const novaLista: Lista = {
        id: res.data.data.id || res.data.data._id,
        name: res.data.data.name,
        userId: res.data.data.userId,
      };

      setLists((prev) => [...prev, novaLista]);
      setListName('');
      setShowListModal(false);
      Alert.alert('Sucesso', 'Lista criada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar lista', err);
      Alert.alert('Erro', 'Não foi possível criar a lista');
    }
  };

  const handleCreateCard = async () => {
    // Esta função foi movida para CreateCardScreen.tsx
    // Mantida apenas para compatibilidade temporária
  };

  const handleDeleteList = async (listId: string) => {
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/lists/${listId}`);
            setLists((prev) => prev.filter((list) => list.id !== listId));
            setCards((prev) => {
              const updated = { ...prev };
              delete updated[listId];
              return updated;
            });
          } catch (err) {
            console.error('Erro ao excluir lista', err);
            Alert.alert('Erro', 'Não foi possível excluir a lista');
          }
        },
      },
    ]);
  };

  const handleCardPress = async (card: CardData, listId: string) => {
    // Navigate to CardDetailScreen instead of showing modal
    const selectedList = lists.find((list) => list.id === listId);

    navigation.navigate('CardDetail', {
      card: card,
      listId: listId,
      listName: selectedList?.name || 'Lista',
    });
  };

  const openCardModal = (listId: string) => {
    const selectedList = lists.find((list) => list.id === listId);
    if (selectedList) {
      navigation.navigate('CreateCard', {
        listId: listId,
        listName: selectedList.name,
      });
    }
  };

  const renderList = ({ item }: { item: Lista }) => {
    const filteredCards = getFilteredCards(item.id);

    return (
      <View style={[styles.listContainer, viewMode === 'grid' && styles.listContainerGrid]}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{item.name}</Text>
          <View style={styles.listHeaderActions}>
            <Text style={styles.cardCount}>
              {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteList(item.id)}
              style={styles.deleteListButton}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredCards}
          renderItem={({ item: cardItem, index }) => (
            <CardItem
              item={cardItem}
              index={index}
              listId={item.id}
              viewMode={viewMode}
              favorites={favorites}
              onCardPress={handleCardPress}
              onDeleteCard={handleDeleteCard}
              onToggleFavorite={toggleFavorite}
            />
          )}
          keyExtractor={(card) => card.id}
          style={styles.cardsList}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          ListEmptyComponent={
            <View style={styles.emptyCardsContainer}>
              <Text style={styles.emptyCardsText}>
                {searchText ? 'Nenhum card encontrado' : 'Nenhum card ainda'}
              </Text>
            </View>
          }
        />

        <TouchableOpacity style={styles.addCardButton} onPress={() => openCardModal(item.id)}>
          <Ionicons name="add" size={20} color="#007AFF" />
          <Text style={styles.addCardText}>Adicionar Card</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[GlobalStyles.container, { backgroundColor: 'transparent' }]}
        pointerEvents="box-none"
      >
        {/* Network Status Indicator */}
        {offlineMode && (
          <View style={styles.networkStatus}>
            <Ionicons name="wifi-outline" size={16} color="#ff9500" />
            <Text style={styles.networkStatusText}>Modo Offline - Dados de demonstração</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={styles.subtitle}>#escolar</Text>
              <Text style={styles.title}>O que vamos estudar hoje?</Text>
            </View>

            <View style={styles.headerActions}>
              {offlineMode && (
                <View style={styles.offlineBadge}>
                  <Text style={styles.offlineText}>DEMO</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setShowFilters(true)}
                style={[
                  styles.filterButton,
                  activeFilters.onlyFavorites || activeFilters.onlyWithPdfs
                    ? styles.filterButtonActive
                    : null,
                ]}
              >
                <Ionicons
                  name="filter"
                  size={24}
                  color={
                    activeFilters.onlyFavorites || activeFilters.onlyWithPdfs
                      ? '#fff'
                      : colors.button
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowStats(true)} style={styles.statsButton}>
                <Ionicons name="stats-chart" size={24} color={colors.button} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                style={styles.viewModeButton}
              >
                <Ionicons
                  name={viewMode === 'list' ? 'grid' : 'list'}
                  size={24}
                  color={colors.button}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo de busca */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar listas ou cards..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInputText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.gray} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonsRow}>
            <CustomButton
              title="+ Criar nova lista"
              onPress={() => {
                setShowListModal(true);
              }}
              buttonStyle={styles.createListButton}
            />
            {!offlineMode && (
              <TouchableOpacity onPress={handleLoadDemo} style={styles.demoButton}>
                <Text style={styles.demoButtonText}>Demo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredLists}
          renderItem={renderList}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listsContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText ? 'Nenhuma lista encontrada' : 'Você ainda não criou nenhuma lista'}
              </Text>
              {!searchText && (
                <CustomButton
                  title="Criar primeira lista"
                  onPress={() => setShowListModal(true)}
                  buttonStyle={styles.emptyButton}
                />
              )}
            </View>
          }
        />

        {/* Modal para criar lista */}
        <Modal
          visible={showListModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowListModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={styles.modalContent}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              <Text style={styles.modalTitle}>Nova Lista</Text>

              <Input
                placeholder="Nome da lista"
                value={listName}
                onChangeText={(text) => {
                  setListName(text);
                }}
              />

              <View style={styles.modalButtons}>
                <CustomButton
                  title="Cancelar"
                  onPress={() => {
                    setShowListModal(false);
                    setListName('');
                  }}
                  variant="outline"
                  buttonStyle={styles.modalButton}
                />
                <CustomButton
                  title="Criar"
                  onPress={handleCreateList}
                  buttonStyle={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Estatísticas */}
        <Modal
          visible={showStats}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowStats(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <View style={styles.cardDetailsHeader}>
                <Text style={styles.modalTitle}>📊 Estatísticas Escolar</Text>
                <TouchableOpacity onPress={() => setShowStats(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.statsContent}>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Ionicons name="folder-outline" size={32} color={colors.button} />
                    <Text style={styles.statNumber}>{stats.totalLists}</Text>
                    <Text style={styles.statLabel}>Listas</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="documents-outline" size={32} color="#4CAF50" />
                    <Text style={styles.statNumber}>{stats.totalCards}</Text>
                    <Text style={styles.statLabel}>Cards</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="document-text-outline" size={32} color="#FF9500" />
                    <Text style={styles.statNumber}>{stats.totalPdfs}</Text>
                    <Text style={styles.statLabel}>PDFs</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="heart" size={32} color="#FF4444" />
                    <Text style={styles.statNumber}>{stats.favoriteCards}</Text>
                    <Text style={styles.statLabel}>Favoritos</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <Text style={styles.sectionTitle}>Progresso de Estudos</Text>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressText}>Cards estudados hoje</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '65%' }]} />
                    </View>
                    <Text style={styles.progressValue}>65%</Text>
                  </View>

                  <View style={styles.progressItem}>
                    <Text style={styles.progressText}>Meta semanal</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '40%' }]} />
                    </View>
                    <Text style={styles.progressValue}>40%</Text>
                  </View>
                </View>

                {offlineMode && (
                  <View style={styles.demoNotice}>
                    <Ionicons name="information-circle" size={20} color={colors.button} />
                    <Text style={styles.demoNoticeText}>Estatísticas em modo demonstração</Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal de Filtros */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <View style={styles.cardDetailsHeader}>
                <Text style={styles.modalTitle}>🔍 Filtros</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filtersContent}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Exibir apenas:</Text>

                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      activeFilters.onlyFavorites && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      setActiveFilters((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))
                    }
                  >
                    <Ionicons
                      name="heart"
                      size={20}
                      color={activeFilters.onlyFavorites ? '#fff' : colors.button}
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeFilters.onlyFavorites && styles.filterOptionTextActive,
                      ]}
                    >
                      Cards Favoritos
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      activeFilters.onlyWithPdfs && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      setActiveFilters((prev) => ({ ...prev, onlyWithPdfs: !prev.onlyWithPdfs }))
                    }
                  >
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={activeFilters.onlyWithPdfs ? '#fff' : colors.button}
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeFilters.onlyWithPdfs && styles.filterOptionTextActive,
                      ]}
                    >
                      Cards com PDFs
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Ordenar por:</Text>

                  {[
                    { key: 'date', label: 'Data de criação', icon: 'calendar' },
                    { key: 'name', label: 'Nome alfabético', icon: 'text' },
                    { key: 'pdfs', label: 'Quantidade de PDFs', icon: 'documents' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.filterOption,
                        activeFilters.sortBy === option.key && styles.filterOptionActive,
                      ]}
                      onPress={() =>
                        setActiveFilters((prev) => ({ ...prev, sortBy: option.key as any }))
                      }
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={activeFilters.sortBy === option.key ? '#fff' : colors.button}
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          activeFilters.sortBy === option.key && styles.filterOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() =>
                    setActiveFilters({ onlyFavorites: false, onlyWithPdfs: false, sortBy: 'date' })
                  }
                >
                  <Ionicons name="refresh" size={20} color={colors.button} />
                  <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>

        {/* Tutorial Modal */}
        <Modal
          visible={showTutorial}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowTutorial(false)}
        >
          <View style={styles.tutorialOverlay}>
            <Animated.View style={[styles.tutorialContent, { opacity: fadeAnim }]}>
              <View style={styles.tutorialHeader}>
                <Text style={styles.tutorialTitle}>{tutorialSteps[tutorialStep]?.title}</Text>
                <TouchableOpacity
                  onPress={() => setShowTutorial(false)}
                  style={styles.tutorialSkip}
                >
                  <Text style={styles.tutorialSkipText}>Pular</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tutorialDescription}>
                {tutorialSteps[tutorialStep]?.description}
              </Text>

              <View style={styles.tutorialProgress}>
                {tutorialSteps.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.tutorialDot, index === tutorialStep && styles.tutorialDotActive]}
                  />
                ))}
              </View>

              <View style={styles.tutorialButtons}>
                {tutorialStep > 0 && (
                  <TouchableOpacity
                    onPress={() => setTutorialStep(tutorialStep - 1)}
                    style={styles.tutorialButtonSecondary}
                  >
                    <Text style={styles.tutorialButtonSecondaryText}>Anterior</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={nextTutorialStep} style={styles.tutorialButtonPrimary}>
                  <Text style={styles.tutorialButtonPrimaryText}>
                    {tutorialStep === tutorialSteps.length - 1 ? 'Concluir' : 'Próximo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Debug: adicionar logs para verificar interações */}
        {/*
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#fff' }}>
            Debug - Modal de lista: {showListModal ? 'Visível' : 'Oculto'}
          </Text>
          <Text style={{ color: '#fff' }}>
            Debug - Nome da lista: {listName}
          </Text>
        </View>
        */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: fontNames.regular,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.bold,
    marginBottom: 24,
    textAlign: 'center',
  },
  createListButton: {
    width: '80%',
    marginBottom: 16,
  },
  listsContainer: {
    paddingHorizontal: 16,
  },
  listContainer: {
    width: 280,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    minHeight: 300,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.bold,
    flex: 1,
  },
  deleteListButton: {
    padding: 4,
  },
  cardsList: {
    flex: 1,
    marginBottom: 12,
  },
  cardItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 4,
  },
  cardPdfIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardPdfText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: fontNames.regular,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addCardText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '500',
    fontFamily: fontNames.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontNames.regular,
  },
  emptyButton: {
    width: 200,
  },
  emptyCardsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCardsText: {
    fontSize: 14,
    color: '#999',
    fontFamily: fontNames.regular,
  },
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
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.bold,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  cardDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  cardDetailsContent: {
    flex: 1,
  },
  pdfSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 12,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pdfItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pdfItemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  pdfName: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
    marginBottom: 2,
  },
  pdfSize: {
    fontSize: 12,
    color: '#666',
    fontFamily: fontNames.regular,
  },
  pdfActionButton: {
    padding: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  pdfViewer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  pdfViewerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 12,
  },
  pdfViewerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pdfViewerPlaceholder: {
    fontSize: 16,
    color: '#666',
    fontFamily: fontNames.regular,
    marginBottom: 12,
    textAlign: 'center',
  },
  pdfViewerNote: {
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.button,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontFamily: fontNames.semibold,
    fontSize: 14,
  },
  noPdfsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPdfsText: {
    fontSize: 16,
    color: '#999',
    fontFamily: fontNames.regular,
    marginTop: 12,
    textAlign: 'center',
  },
  noPdfsSubtext: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  pendingUploadsSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  pendingFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pendingFileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
  },
  saveFilesButton: {
    marginTop: 12,
  },
  cardInfoSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
  },
  uploadSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.button,
  },
  uploadActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.button,
    fontFamily: fontNames.semibold,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageUploadArea: {
    height: 120,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageUploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    marginTop: 8,
    color: '#666',
    fontFamily: fontNames.regular,
    fontSize: 14,
  },
  removeFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 6,
    marginTop: 8,
  },
  removeFileText: {
    marginLeft: 4,
    color: '#ff4444',
    fontFamily: fontNames.regular,
    fontSize: 12,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
  },
  pdfUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.button,
    marginBottom: 12,
  },
  pdfUploadText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.button,
    fontFamily: fontNames.semibold,
  },
  selectedFileInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    fontFamily: fontNames.regular,
  },
  createCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  offlineBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: fontNames.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  searchInputText: {
    fontSize: 16,
    fontFamily: fontNames.regular,
  },
  clearButton: {
    padding: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.button,
  },
  demoButtonText: {
    color: colors.button,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontNames.semibold,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  cardContent: {
    flex: 1,
    paddingRight: 32, // espaço para o botão de favorito
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: colors.button,
  },
  statsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  statsContent: {
    flex: 1,
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
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    marginTop: 4,
  },
  progressSection: {
    marginTop: 16,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.button,
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    textAlign: 'right',
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  demoNoticeText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.button,
    fontFamily: fontNames.regular,
  },
  filtersContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fontNames.bold,
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.button,
    borderColor: colors.button,
  },
  filterOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
    flex: 1,
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.button,
    marginTop: 16,
  },
  clearFiltersText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.button,
    fontFamily: fontNames.semibold,
  },
  listContainerGrid: {
    width: '100%',
    marginRight: 0,
  },
  listHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  cardItemGrid: {
    width: '48%',
    marginBottom: 8,
  },
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tutorialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fontNames.bold,
    flex: 1,
  },
  tutorialSkip: {
    padding: 4,
  },
  tutorialSkipText: {
    fontSize: 14,
    color: '#999',
    fontFamily: fontNames.regular,
  },
  tutorialDescription: {
    fontSize: 16,
    color: '#666',
    fontFamily: fontNames.regular,
    lineHeight: 24,
    marginBottom: 24,
  },
  tutorialProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  tutorialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  tutorialDotActive: {
    backgroundColor: colors.button,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tutorialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tutorialButtonSecondary: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.button,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tutorialButtonSecondaryText: {
    fontSize: 16,
    color: colors.button,
    fontFamily: fontNames.semibold,
  },
  tutorialButtonPrimary: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.button,
    alignItems: 'center',
  },
  tutorialButtonPrimaryText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: fontNames.semibold,
  },
  createCardModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  createCardContent: {
    flex: 1,
    paddingVertical: 16,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  networkStatusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
    fontFamily: fontNames.regular,
  },
});

export default EscolarScreen;
