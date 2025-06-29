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
  Animated,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { fontNames } from '@styles/fonts';
import colors from '@styles/colors';
import Input from '@components/Input';
import CustomButton from '@components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import FilterIcon from 'assets/icons/FilterIcon';
import AnaliticsIcon from 'assets/icons/AnaliticsIcon';
import NewIcon from 'assets/icons/NewIcon';
import SearchIcon from 'assets/icons/SearchIcon';
import CloseIcon from 'assets/icons/CloseIcon';
import RefreshIcon from '@icons/RefreshIcon';
import FileDocumentIcon from '@icons/FileDocumentIcon';
import HeartIcon from '@icons/HeartIcon';
import FolderIcon from '@icons/FolderIcon';

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

const EscolarScreen = () => {
  const { user } = useAuth();
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
  const { width } = useWindowDimensions();

  // Estados para modais
  const [showListModal, setShowListModal] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  // Estados para formulários
  const [listName, setListName] = useState('');

  // Estados de loading
  const [creatingList, setCreatingList] = useState(false);
  const [editingList, setEditingList] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  // Carrega listas e cards
  useEffect(() => {
    if (userId) {
      fetchListsAndCards();
    }
  }, [userId]);

  // Listener para atualizar quando voltar de outras telas
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) {
        fetchListsAndCards();
      }
    });

    return unsubscribe;
  }, [navigation, userId]);

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
        activeFilters,
        favorites: Array.from(favorites),
      };
      await AsyncStorage.setItem(`escolar_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  // Salva preferências apenas quando estados realmente usados mudam
  useEffect(() => {
    if (userId) {
      savePreferences();
    }
  }, [activeFilters, favorites, userId]);

  const fetchListsAndCards = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Buscar listas do usuário
      const listsRes = await api.get(`/lists/user/${userId}`);
      const listas = listsRes.data.data || [];
      setLists(listas);

      if (listas.length === 0) {
        // Nenhuma lista para exibir – encerra loading antes de sair
        setCards({});
        setLoading(false);
        return;
      }

      // Buscar cards para cada lista
      const cardsPorLista: Record<string, CardData[]> = {};
      await Promise.all(
        listas.map(async (list: Lista) => {
          try {
            const cardsRes = await api.get(`/lists/${list.id}/cards`);
            cardsPorLista[list.id] = cardsRes.data.data.map((card: any) => ({
              id: card.id || card._id,
              title: card.title,
              userId: card.userId,
              createdAt: card.createdAt,
              pdfs: card.pdfs || [],
              image_url: card.image_url || [],
              content: card.content || '',
              priority: card.priority || 'media',
              is_published: card.is_published || false,
            }));
          } catch (cardError) {
            console.error(`Erro ao buscar cards da lista ${list.id}:`, cardError);
            cardsPorLista[list.id] = [];
          }
        })
      );

      setCards(cardsPorLista);
    } catch (err: any) {
      console.error('Erro ao buscar listas ou cards', err);

      // Verificar se é erro de rede ou servidor
      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível conectar ao servidor. Deseja carregar dados de demonstração?',
          [
            { text: 'Tentar Novamente', onPress: () => fetchListsAndCards() },
            { text: 'Modo Demo', onPress: () => loadDemoData() },
          ]
        );
      } else {
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao carregar os dados. Carregando dados de demonstração.',
          [{ text: 'OK', onPress: () => loadDemoData() }]
        );
      }
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

  // Memoiza listas filtradas de cards por lista para evitar recomputo por render
  const filteredCardsByList = useMemo(() => {
    const result: Record<string, CardData[]> = {};
    Object.keys(cards).forEach((listId) => {
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
      listCards = [...listCards].sort((a, b) => {
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

      result[listId] = listCards;
    });
    return result;
  }, [cards, searchText, activeFilters, favorites]);

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
    const highPriorityCards = Object.values(cards).reduce(
      (acc, listCards) => acc + listCards.filter((card) => card.priority === 'alta').length,
      0
    );
    const mediumPriorityCards = Object.values(cards).reduce(
      (acc, listCards) => acc + listCards.filter((card) => card.priority === 'media').length,
      0
    );

    return {
      totalLists,
      totalCards,
      totalPdfs,
      favoriteCards,
      highPriorityCards,
      mediumPriorityCards,
    };
  }, [lists, cards, favorites]);

  // Função para deletar card com swipe
  const handleDeleteCard = (cardId: string, listId: string) => {
    const cardToDelete = cards[listId]?.find((card) => card.id === cardId);

    // Haptic feedback forte para ação destrutiva
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Excluir Card', `Tem certeza que deseja excluir o card "${cardToDelete?.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (offlineMode) {
            setCards((prev) => {
              if (!prev[listId]) return prev;
              return {
                ...prev,
                [listId]: prev[listId].filter((card) => card.id !== cardId),
              };
            });

            setFavorites((prev) => {
              const newFavorites = new Set(prev);
              newFavorites.delete(cardId);
              return newFavorites;
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sucesso', 'Card excluído com sucesso! (Modo Offline)');
            return;
          }

          try {
            await api.delete(`/cards/${cardId}`);

            setCards((prev) => {
              if (!prev[listId]) return prev;
              return {
                ...prev,
                [listId]: prev[listId].filter((card) => card.id !== cardId),
              };
            });

            setFavorites((prev) => {
              const newFavorites = new Set(prev);
              newFavorites.delete(cardId);
              return newFavorites;
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sucesso', 'Card excluído com sucesso!');
          } catch (err: any) {
            console.error('Erro ao excluir card', err);
            const errorMessage = err.response?.data?.message || 'Não foi possível excluir o card';
            Alert.alert('Erro', errorMessage);
          }
        },
      },
    ]);
  };

  const handleCreateList = async () => {
    if (!isListNameValid) {
      Alert.alert('Erro', 'Preencha o nome da lista corretamente.');
      return;
    }
    setCreatingList(true);
    try {
      if (offlineMode) {
        // Modo offline - criar lista localmente
        const novaLista: Lista = {
          id: `demo-${Date.now()}`,
          name: listName.trim(),
          userId: userId as string,
        };

        setLists((prev) => [...prev, novaLista]);
        setCards((prev) => ({ ...prev, [novaLista.id]: [] }));
        setListName('');
        setShowListModal(false);
        Alert.alert('Sucesso', 'Lista criada com sucesso! (Modo Offline)');
        return;
      }

      // Dados para criação de lista (logger removido)
      const payload = {
        name: listName.trim(),
        userId,
      };

      const res = await api.post(`/lists`, payload);

      const novaLista: Lista = {
        id: res.data.data.id || res.data.data._id,
        name: res.data.data.name,
        userId: userId as string,
      };

      setLists((prev) => [...prev, novaLista]);
      setCards((prev) => ({ ...prev, [novaLista.id]: [] }));
      setListName('');
      setShowListModal(false);

      // Haptic feedback de sucesso
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Lista criada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar lista', err);
      const errorMessage = err.response?.data?.message || 'Não foi possível criar a lista';
      Alert.alert('Erro', errorMessage);
    } finally {
      setCreatingList(false);
    }
  };

  const handleEditList = async (listId: string, newName: string) => {
    if (!newName.trim()) {
      Alert.alert('Erro', 'O nome da lista não pode estar vazio.');
      return;
    }

    if (offlineMode) {
      setLists((prev) =>
        prev.map((list) => (list.id === listId ? { ...list, name: newName.trim() } : list))
      );
      Alert.alert('Sucesso', 'Lista editada com sucesso! (Modo Offline)');
      return;
    }

    try {
      const payload = { name: newName.trim() };
      await api.put(`/lists/${listId}`, payload);

      setLists((prev) =>
        prev.map((list) => (list.id === listId ? { ...list, name: newName.trim() } : list))
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Lista editada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao editar lista', err);
      const errorMessage = err.response?.data?.message || 'Não foi possível editar a lista';
      Alert.alert('Erro', errorMessage);
    }
  };

  const handleDeleteList = async (listId: string) => {
    setDeletingListId(listId);
    try {
      // Ação de excluir lista
      const listToDelete = lists.find((list) => list.id === listId);
      const cardsInList = cards[listId] || [];

      const confirmMessage = `Tem certeza que deseja excluir a lista "${listToDelete?.name}"?\n\nEsta ação é permanente e irá excluir também todos os cards que ela possui (${cardsInList.length} card(s)).`;

      if (Platform.OS === 'web') {
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) return;
        // Executa a exclusão
        await api.delete(`/lists/${listId}`);
        setLists((prev) => prev.filter((list) => list.id !== listId));
        setCards((prev) => {
          const updated = { ...prev };
          delete updated[listId];
          return updated;
        });
        alert('Lista e todos os seus cards foram excluídos permanentemente!');
      } else {
        // Mobile: Alert.alert
        Alert.alert('Excluir Lista', confirmMessage, [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              if (offlineMode) {
                setLists((prev) => prev.filter((list) => list.id !== listId));
                setCards((prev) => {
                  const updated = { ...prev };
                  delete updated[listId];
                  return updated;
                });
                Alert.alert('Sucesso', 'Lista excluída com sucesso! (Modo Offline)');
              } else {
                await api.delete(`/lists/${listId}`);
                setLists((prev) => prev.filter((list) => list.id !== listId));
                setCards((prev) => {
                  const updated = { ...prev };
                  delete updated[listId];
                  return updated;
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Sucesso',
                  'Lista e todos os seus cards foram excluídos permanentemente!'
                );
              }
            },
          },
        ]);
      }
    } finally {
      setDeletingListId(null);
    }
  };

  // Função para editar card
  const handleEditCard = async (cardId: string, listId: string, updatedData: Partial<CardData>) => {
    if (offlineMode) {
      setCards((prev) => {
        if (!prev[listId]) return prev;
        return {
          ...prev,
          [listId]: prev[listId].map((card) =>
            card.id === cardId ? { ...card, ...updatedData } : card
          ),
        };
      });
      Alert.alert('Sucesso', 'Card editado com sucesso! (Modo Offline)');
      return;
    }

    try {
      const res = await api.patch(`/cards/${cardId}`, updatedData);

      setCards((prev) => {
        if (!prev[listId]) return prev;
        return {
          ...prev,
          [listId]: prev[listId].map((card) =>
            card.id === cardId ? { ...card, ...res.data.data } : card
          ),
        };
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Card editado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao editar card', err);
      const errorMessage = err.response?.data?.message || 'Não foi possível editar o card';
      Alert.alert('Erro', errorMessage);
    }
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
    const filteredCards = filteredCardsByList[item.id] || [];

    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <View style={styles.listTitleContainer}>
            <Text style={styles.listTitle}>{item.name}</Text>
            <View style={[styles.listIndicator, { backgroundColor: getListColor(item.id) }]} />
          </View>
          <View style={styles.listHeaderActions}>
            <TouchableOpacity
              style={styles.listMoreButton}
              onPress={() => {
                setSelectedListId(item.id);
                setEditingListName(item.name);
                setShowEditListModal(true);
              }}
            >
              <Ionicons name="pencil" size={16} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listMoreButton}
              onPress={() => handleDeleteList(item.id)}
              disabled={deletingListId === item.id}
            >
              {deletingListId === item.id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="trash" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredCards}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(card) => card.id}
          initialNumToRender={5}
          windowSize={5}
          contentContainerStyle={styles.cardsScrollContent}
          renderItem={({ item: cardItem, index }) => (
            <View style={styles.cardContainer}>
              <TouchableOpacity
                onPress={() => handleCardPress(cardItem, item.id)}
                onLongPress={() => handleDeleteCard(cardItem.id, item.id)}
                activeOpacity={0.7}
                style={styles.cardContent}
              >
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(cardItem.id)}
                >
                  <View style={styles.favoriteIcon}>
                    <Ionicons
                      name={favorites.has(cardItem.id) ? 'heart' : 'heart-outline'}
                      size={14}
                      color={favorites.has(cardItem.id) ? '#ff4444' : '#999'}
                    />
                  </View>
                </TouchableOpacity>

                <Text style={styles.cardTitle}>{cardItem.title}</Text>

                <View style={styles.cardProgress}>
                  <Text style={styles.progressText}>
                    {cardItem.createdAt
                      ? new Date(cardItem.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        })
                      : '11/01'}
                  </Text>

                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: getProgressColor(cardItem.priority) },
                    ]}
                  />
                  
                </View>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity
              style={styles.addCardContainer}
              onPress={() => openCardModal(item.id)}
            >
              <View style={styles.addCardIcon}>
                <Ionicons name="add" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Helper function to get list colors
  const getListColor = (listId: string) => {
    const colors = ['#4CAF50', '#FF9500', '#9C27B0', '#999'];
    const index = lists.findIndex((list) => list.id === listId);
    return colors[index % colors.length];
  };

  // Cor do card baseada na prioridade
  const getProgressColor = (priority?: string | null) => {
    const value = priority?.toLowerCase();
    switch (value) {
      case 'alta':
        return '#ff4444'; // Vermelho
      case 'media':
        return '#FF9500'; // Laranja
      case 'baixa':
        return '#4CAF50'; // Verde
      default:
        return '#2196F3'; // Azul (indefinida)
    }
  };

  // Função para criar card diretamente (alternativa ao modal)
  const handleCreateCard = async (
    listId: string,
    cardData: { title: string; content?: string }
  ) => {
    if (!cardData.title.trim()) {
      Alert.alert('Erro', 'O título do card não pode estar vazio.');
      return;
    }

    if (offlineMode) {
      const newCard: CardData = {
        id: `demo-card-${Date.now()}`,
        title: cardData.title.trim(),
        userId: userId || 'demo',
        createdAt: new Date().toISOString(),
        content: cardData.content || '',
        pdfs: [],
        image_url: [],
        priority: 'media',
        is_published: false,
      };

      setCards((prev) => ({
        ...prev,
        [listId]: [...(prev[listId] || []), newCard],
      }));

      Alert.alert('Sucesso', 'Card criado com sucesso! (Modo Offline)');
      return;
    }

    try {
      const payload = {
        title: cardData.title.trim(),
        listId,
        content: cardData.content || '',
      };

      const res = await api.post('/cards', payload);

      const newCard: CardData = {
        id: res.data.data.id || res.data.data._id,
        title: res.data.data.title,
        userId: res.data.data.userId,
        createdAt: res.data.data.createdAt || new Date().toISOString(),
        content: res.data.data.content || '',
        pdfs: res.data.data.pdfs || [],
        image_url: res.data.data.image_url || [],
        priority: res.data.data.priority || 'media',
        is_published: res.data.data.is_published || false,
      };

      setCards((prev) => ({
        ...prev,
        [listId]: [...(prev[listId] || []), newCard],
      }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Card criado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar card', err);
      const errorMessage = err.response?.data?.message || 'Não foi possível criar o card';
      Alert.alert('Erro', errorMessage);
    }
  };

  // Validação do nome da lista
  const isListNameValid =
    listName.trim().length >= 3 &&
    listName.trim().length <= 50 &&
    /^[a-zA-Z0-9\s\-_]+$/.test(listName.trim());
  const listNameError =
    listName.length > 0 && !isListNameValid
      ? 'O nome deve ter entre 3 e 50 caracteres e pode conter apenas letras, números, espaço, hífen e underline.'
      : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: 'rgba(255,255,255,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        {/* Network Status Indicator */}
        {offlineMode && (
          <View style={styles.networkStatus}>
            <Ionicons name="wifi-outline" size={16} color="#ff9500" />
            <Text style={styles.networkStatusText}>Modo Offline - Dados de demonstração</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userSection}>
              <TouchableOpacity
                style={styles.userSection}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.avatar}>
                  {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                  )}
                </View>
                <Text style={styles.username}>{user?.name || 'username'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerActions}>
              {offlineMode && (
                <View style={styles.offlineBadge}>
                  <Text style={styles.offlineText}>DEMO</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setShowFilters(true)}
                style={styles.headerIconButton}
              >
                <FilterIcon size={24} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowStats(true)} style={styles.headerIconButton}>
                <AnaliticsIcon size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.organizationSection}>
            <TouchableOpacity style={styles.organizationButton}>
              <Text style={styles.organizationText}>Sua organização</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredLists}
          renderItem={renderList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredLists.length === 0 ? styles.listEmptyContainer : styles.listContent
          }
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

        {/* Floating Action Button - Sempre visível */}
        <TouchableOpacity
          style={styles.floatingActionButton}
          onPress={() => setShowListModal(true)}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <NewIcon size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Modal para criar lista */}
        <Modal
          visible={showListModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowListModal(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              style={[styles.modalContent, { width: width > 500 ? 450 : width * 0.9 }]}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Cabeçalho do modal */}
              <View style={styles.cardDetailsHeader}>
                <Text style={styles.modalTitle}>Nova Lista</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowListModal(false);
                    setListName('');
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.gray} />
                </TouchableOpacity>
              </View>

              <Input
                placeholder="Nome da lista"
                value={listName}
                onChangeText={(text) => {
                  setListName(text);
                }}
              />
              {/* Contador de caracteres */}
              <Text style={{ alignSelf: 'flex-end', fontSize: 12, color: '#888' }}>
                {listName.trim().length}/50
              </Text>

              <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                O nome deve ter entre 3 e 50 caracteres e pode conter apenas letras, números,
                espaço, hífen e underline.
              </Text>
              {!!listNameError && (
                <Text style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{listNameError}</Text>
              )}

              <View style={styles.modalButtonContainer}>
                <CustomButton
                  title="Cancelar"
                  onPress={() => {
                    setShowListModal(false);
                    setListName('');
                  }}
                  variant="outline"
                  buttonStyle={[
                    styles.modalButton,
                    {
                      backgroundColor: '#F5F5F5', // cinza leve para destaque
                      borderColor: '#E0E0E0',
                    },
                  ]}
                />
                <CustomButton
                  title={creatingList ? '' : 'Criar'}
                  onPress={handleCreateList}
                  buttonStyle={styles.modalButton}
                  disabled={creatingList}
                  icon={creatingList ? <ActivityIndicator size="small" color="#fff" /> : undefined}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Modal de Estatísticas */}
        <Modal
          visible={showStats}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowStats(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <View style={styles.cardDetailsHeader}>
                <View style={styles.titleModalContainer}>
                  <AnaliticsIcon size={24} color={colors.primary} />
                  <Text style={styles.modalTitle}>Estatísticas Escolar</Text>
                </View>
                <TouchableOpacity onPress={() => setShowStats(false)} style={styles.closeButton}>
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

                  <View style={styles.statCard}>
                    <Ionicons name="document-text-outline" size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.totalPdfs}</Text>
                    <Text style={styles.statLabel}>PDFs</Text>
                  </View>

                  <View style={styles.statCard}>
                    <HeartIcon size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.favoriteCards}</Text>
                    <Text style={styles.statLabel}>Favoritos</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="alert-circle-outline" size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.highPriorityCards}</Text>
                    <Text style={styles.statLabel}>Alta Prioridade</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="alert-outline" size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.mediumPriorityCards}</Text>
                    <Text style={styles.statLabel}>Média Prioridade</Text>
                  </View>
                </View>

                {offlineMode && (
                  <View style={styles.demoNotice}>
                    <Ionicons name="information-circle" size={20} color={colors.button} />
                    <Text style={styles.demoNoticeText}>Estatísticas em modo demonstração</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal de Filtros */}
        <Modal
          visible={showFilters}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <View style={styles.cardDetailsHeader}>
                <View style={styles.titleModalContainer}>
                  <SearchIcon size={24} color={colors.primary} />
                  <Text style={styles.modalTitle}>Filtros</Text>
                </View>

                <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.closeButton}>
                  <CloseIcon size={24} color={colors.gray} />
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
                    <HeartIcon
                      size={20}
                      color={activeFilters.onlyFavorites ? colors.white : colors.primary}
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
                    <FileDocumentIcon
                      size={20}
                      color={activeFilters.onlyWithPdfs ? colors.white : colors.primary}
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
                        color={activeFilters.sortBy === option.key ? '#fff' : colors.primary}
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
                  <RefreshIcon size={20} color={colors.primary} />
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

        {/* Modal para editar lista */}
        <Modal
          visible={showEditListModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowEditListModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={styles.modalContent}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              <Text style={styles.modalTitle}>Editar Lista</Text>

              <Input
                placeholder="Nome da lista"
                value={editingListName}
                onChangeText={(text) => {
                  setEditingListName(text);
                }}
                style={styles.placeholderInput}
              />

              <View style={styles.modalButtonContainer}>
                <CustomButton
                  title="Cancelar"
                  onPress={() => {
                    setShowEditListModal(false);
                    setEditingListName('');
                    setSelectedListId(null);
                  }}
                  variant="outline"
                  buttonStyle={styles.modalButton}
                />
                <CustomButton
                  title="Salvar"
                  onPress={async () => {
                    if (selectedListId) {
                      await handleEditList(selectedListId, editingListName);
                      setShowEditListModal(false);
                      setEditingListName('');
                      setSelectedListId(null);
                    }
                  }}
                  buttonStyle={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 40,
    paddingBottom: 16,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
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
  listEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 100, // espaço para o floating button
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // espaço para o FAB
  },
  listContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 20,
    marginBottom: 20,
  },
  listHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    gap: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.bold,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: fontNames.regular,
  },
  listIndicator: {
    flex: 1,
    width: 60,
    height: 4,
    borderRadius: 2,
    marginLeft: 8,
  },
  deleteListButton: {
    padding: 4,
  },
  cardsScrollView: {
    marginBottom: 0,
  },
  cardsScrollContent: {
    paddingHorizontal: 0,
    paddingRight: 20,
  },
  cardContainer: {
    width: 180,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  favoriteIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 12,
    marginTop: 8,
    paddingRight: 30,
  },
  cardProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  progressBar: {
    flex: 1,
    height: 6,
    justifyContent: 'center',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  addCardContainer: {
    width: 180,
    height: 120,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listMoreButton: {
    padding: 4,
  },
  listHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
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
  cardDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: fontNames.regular,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fontNames.bold,
  },
  username: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
  },
  organizationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    width: '100%',
  },
  organizationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  organizationText: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
  },

  emptyContainer: {
    flex: 1,
    height: '100%',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)', // overlay mais suave
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: colors.primary,
    fontFamily: fontNames.bold,
    textAlign: 'center',
  },

  placeholderInput: {
    width: '100%',
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: colors.gray,
  },

  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    width: '100%',
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
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
  floatingActionButton: {
    position: 'absolute',
    bottom: 130,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'visible',
  },
  // Stats Modal Styles
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
    justifyContent: 'center',
    alignItems: 'center',
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
  // Filters Modal Styles
  filtersContent: {
    flexGrow: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
    flex: 1,
  },
  filterOptionTextActive: {
    color: colors.white,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    marginTop: 16,
  },
  clearFiltersText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.semibold,
  },
  // Grid view styles (kept for compatibility)
  listContainerGrid: {
    width: '100%',
    marginRight: 0,
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
});

export default EscolarScreen;
