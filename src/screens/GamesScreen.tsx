// Importações de bibliotecas React e React Native
import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  InteractionManager,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';

// Importações de contextos, estilos e componentes de navegação
import { useAuth } from '../contexts/AuthContext';
import { GlobalStyles } from '@styles/global';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';

// Importações de componentes e assets customizados
import ArrowBack from 'assets/icons/ArrowBack';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
import CapaFlashCards from 'assets/banners/CapaFlashCards';
import RaioIcon from 'assets/icons/RaioIcon';
import { CardService, Card } from '../services/cardService';
import { TagService, Tag } from '../services/tagService';
import { FlashcardService, Flashcard } from '../services/flashcardService';
import Toast from 'react-native-toast-message';
import BotIcon from '@icons/BotIcon';
import EditIcon from '@icons/EditIcon';

// Definição do tipo de navegação para tipagem do TypeScript
type GameStackNavigationProp = StackNavigationProp<RootTabParamList>;

const GamesScreen = () => {
  // Hooks para autenticação e navegação
  const { user } = useAuth();
  const navigation = useNavigation<GameStackNavigationProp>();

  // =====================  FLASHCARD CREATION FLOW STATE  ===================== //
  const [isCreating, setIsCreating] = useState(false); // controla se está no fluxo
  const [creationStep, setCreationStep] = useState<0 | 1 | 2 | 3>(0);
  const [creationType, setCreationType] = useState<'ai' | 'manual' | null>(null);

  // Dados remotos
  const [cards, setCards] = useState<Card[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Loading flags
  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  // Evita lag inicial: só renderiza SVGs/banners depois que navegação terminou
  const [uiReady, setUiReady] = useState(false);

  // =====================  ESTUDO DE FLASHCARDS  ===================== //
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  // Animation value for fade in/out when flipping a card
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Seleções e inputs
  const [searchCardTerm, setSearchCardTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchFlashcardTerm, setSearchFlashcardTerm] = useState('');

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [aiTitle, setAiTitle] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // --------------- Helpers --------------- //
  const resetFlow = () => {
    setCreationStep(0);
    setCreationType(null);
    setSelectedCard(null);
    setFront('');
    setBack('');
    setAiTitle('');
    setSelectedTags([]);
  };

  const exitFlow = () => {
    resetFlow();
    setIsCreating(false);
    loadFlashcards();
  };

  const loadCards = async () => {
    try {
      setLoadingCards(true);
      const data = await CardService.getUserCards();
      setCards(data);
    } catch (error) {
      console.error('GamesScreen: erro ao carregar cards', error);
      Toast.show({ type: 'error', text1: 'Erro ao carregar cards' });
    } finally {
      setLoadingCards(false);
    }
  };

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const data = await TagService.getAll();
      setTags(data);
    } catch (error) {
      console.error('GamesScreen: erro ao carregar tags', error);
      Toast.show({ type: 'error', text1: 'Erro ao carregar tags' });
    } finally {
      setLoadingTags(false);
    }
  };

  const loadFlashcards = async () => {
    try {
      setLoadingFlashcards(true);
      const data = await FlashcardService.getAll();
      setFlashcards(data);
    } catch (error) {
      console.error('GamesScreen: erro ao carregar flashcards', error);
      Toast.show({ type: 'error', text1: 'Erro ao carregar flashcards' });
    } finally {
      setLoadingFlashcards(false);
    }
  };

  useEffect(() => {
    if (isCreating) {
      loadCards();
      loadTags();
      // Carrega flashcards somente quando realmente necessário, evitando lag na entrada da tela
      loadFlashcards();
    }
  }, [isCreating]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setUiReady(true);
    });
    return () => task?.cancel();
  }, []);

  // --------------- Submissão --------------- //
  const handleFinalize = async () => {
    if (!selectedCard) {
      Toast.show({ type: 'info', text1: 'Selecione um card' });
      return;
    }
    if (selectedTags.length === 0) {
      Toast.show({ type: 'info', text1: 'Selecione pelo menos uma tag' });
      return;
    }

    try {
      setSubmitting(true);

      const cardIdToUse = selectedCard._id || selectedCard.id || '';
      const validCardId = /^[0-9a-fA-F]{24}$/.test(cardIdToUse);
      const validTags = selectedTags.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

      if (!validCardId) {
        Toast.show({ type: 'error', text1: 'Card inválido. Tente outro.' });
        return;
      }

      if (validTags.length === 0) {
        Toast.show({ type: 'info', text1: 'Selecione pelo menos uma tag válida' });
        return;
      }

      const payloadManual = {
        cardId: cardIdToUse,
        front: front.trim(),
        back: back.trim(),
        tags: validTags,
      };

      const payloadAI = {
        cardId: cardIdToUse,
        amount: 1,
        tags: validTags,
        title: aiTitle.trim(),
      };

      if (creationType === 'manual') {
        if (!front.trim() || !back.trim()) {
          Toast.show({ type: 'info', text1: 'Preencha pergunta e resposta' });
          return;
        }
        console.log('Flashcard manual payload:', payloadManual);
        await FlashcardService.createManual(payloadManual);
        Toast.show({ type: 'success', text1: 'Flashcard criado!' });
      } else if (creationType === 'ai') {
        if (!aiTitle.trim()) {
          Toast.show({ type: 'info', text1: 'Digite o tema/pergunta' });
          return;
        }
        console.log('Flashcard IA payload:', payloadAI);
        await FlashcardService.createWithAI(payloadAI);
        Toast.show({ type: 'success', text1: 'Flashcard gerado pela IA!' });
      }
      exitFlow();
    } catch (error) {
      console.error('GamesScreen: erro ao criar flashcard', error);
      Toast.show({ type: 'error', text1: 'Erro ao criar flashcard' });
    } finally {
      setSubmitting(false);
    }
  };

  // --------------- Tag helpers --------------- //
  const toggleTagSelection = (id: string) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await TagService.create(newTagName.trim());
      setTags((prev) => [...prev, tag]);
      setSelectedTags((prev) => [...prev, tag._id]);
      setNewTagName('');
      setShowTagModal(false);
    } catch (error) {
      console.error('GamesScreen: erro ao criar tag', error);
      Toast.show({ type: 'error', text1: 'Erro ao criar tag' });
    }
  };

  // =====================  STUDY MODE HANDLERS ===================== //
  const startStudyMode = (flashcardId: string) => {
    const idx = flashcards.findIndex((f) => f._id === flashcardId);
    if (idx !== -1) {
      setStudyIndex(idx);
      setShowBack(false);
      setStudyMode(true);
    }
  };

  const exitStudyMode = () => {
    setStudyMode(false);
    setShowBack(false);
  };

  const handleGrade = async (grade: number) => {
    try {
      const current = flashcards[studyIndex];
      if (!current) return;
      await FlashcardService.review(current._id, grade);
      Toast.show({ type: 'success', text1: `Nota ${grade} enviada` });
      if (studyIndex < flashcards.length - 1) {
        setStudyIndex(studyIndex + 1);
        setShowBack(false);
      } else {
        exitStudyMode();
        loadFlashcards();
      }
    } catch (error) {
      console.error('GamesScreen: erro ao avaliar flashcard', error);
      Toast.show({ type: 'error', text1: 'Erro ao enviar nota' });
    }
  };

  // =====================  CARD FLIP ANIMATION  ===================== //
  const handleCardFlip = () => {
    // Fade out current side
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // After fade-out completes, toggle side
      setShowBack((prev) => !prev);
      // Fade in new side
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // =====================  UI RENDER FUNCTIONS ===================== //
  const renderStep0 = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.containerOptions}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <View style={styles.txt}>
        <Text style={styles.h1}> Como deseja criar? </Text>
        <Text style={styles.sub}> Escolha o método de criação dos flashcards </Text>
      </View>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          setCreationType('ai');
          setCreationStep(1);
        }}
      >
        <View style={styles.optionInner}>
          <BotIcon size={24} color={colors.primary} />
          <Text style={styles.optionText}>Criar com IA</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          setCreationType('manual');
          setCreationStep(1);
        }}
      >
        <View style={styles.optionInner}>
          <EditIcon size={24} color={colors.primary} />
          <Text style={styles.optionText}>Criar Manualmente</Text>
        </View>
      </TouchableOpacity>

      {/* ===================== FLASHCARDS DO USUÁRIO ===================== */}
      <View style={styles.flashcardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seus Flashcards</Text>
          <View style={styles.sectionLine} />
        </View>

        <TextInput
          placeholder="Pesquisar flashcards..."
          value={searchFlashcardTerm}
          onChangeText={setSearchFlashcardTerm}
          style={styles.input}
        />

        {loadingFlashcards ? (
          <ActivityIndicator />
        ) : flashcards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Você ainda não tem flashcards</Text>
            <Text style={styles.emptyStateSubText}>
              Crie seu primeiro flashcard usando IA ou manualmente
            </Text>
          </View>
        ) : (
          <ScrollView
            nestedScrollEnabled
            contentContainerStyle={{ gap: 12, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {flashcards
              .filter((fc) =>
                (fc.front + ' ' + fc.back).toLowerCase().includes(searchFlashcardTerm.toLowerCase())
              )
              .map((fc) => {
                const tagNames = fc.tags
                  .map((t) =>
                    typeof t === 'string'
                      ? tags.find((tg) => tg._id === t)?.name || ''
                      : (t as Tag).name
                  )
                  .filter(Boolean);

                return (
                  <TouchableOpacity
                    key={fc._id}
                    style={styles.flashcardItem}
                    onPress={() => startStudyMode(fc._id)}
                  >
                    <Text style={styles.flashcardFront}>{fc.front}</Text>
                    <Text style={styles.flashcardBack}>{fc.back}</Text>

                    {/* Tags */}
                    {tagNames.length > 0 && (
                      <View style={styles.flashcardTagsContainer}>
                        {tagNames.map((name, idx) => (
                          <View key={`${fc._id}-${idx}`} style={styles.flashcardTag}>
                            <Text style={styles.flashcardTagText}>{name}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );

  const renderStep1 = () => (
    <View style={GlobalStyles.frame}>
      <TextInput
        placeholder="Pesquisar card..."
        value={searchCardTerm}
        onChangeText={setSearchCardTerm}
        style={styles.input}
      />
      {loadingCards ? (
        <ActivityIndicator />
      ) : (
        <ScrollView style={{ flex: 1, marginTop: 16 }}>
          {cards
            .filter((c) => c.title.toLowerCase().includes(searchCardTerm.toLowerCase()))
            .map((c) => (
              <TouchableOpacity
                key={c._id}
                style={styles.cardOption}
                onPress={() => {
                  setSelectedCard(c);
                  setCreationStep(2);
                }}
              >
                <Text style={{ fontFamily: fontNames.bold }}>{c.title}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}
    </View>
  );

  const renderStep2 = () => (
    <ScrollView style={GlobalStyles.frame} contentContainerStyle={{ gap: 20 }}>
      {creationType === 'manual' ? (
        <>
          <TextInput
            placeholder="Pergunta"
            value={front}
            onChangeText={setFront}
            style={styles.input}
            multiline
          />
          <TextInput
            placeholder="Resposta"
            value={back}
            onChangeText={setBack}
            style={styles.input}
            multiline
          />
        </>
      ) : (
        <TextInput
          placeholder="Tema ou pergunta do flashcard"
          value={aiTitle}
          onChangeText={setAiTitle}
          style={styles.input}
          multiline
        />
      )}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setCreationStep(3)}
        disabled={creationType === 'manual' ? !(front.trim() && back.trim()) : !aiTitle.trim()}
      >
        <Text style={styles.nextButtonText}>Avançar</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      style={{ flex: 1, gap: 16 }}
      contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
    >
      <TouchableOpacity style={styles.tagCreateButton} onPress={() => setShowTagModal(true)}>
        <Text style={{ color: colors.primary }}> + Criar nova tag </Text>
      </TouchableOpacity>
      {loadingTags ? (
        <ActivityIndicator />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {tags.map((t) => (
            <TouchableOpacity
              key={t._id}
              style={[
                styles.tagItem,
                selectedTags.includes(t._id) && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => toggleTagSelection(t._id)}
            >
              <Text style={{ color: selectedTags.includes(t._id) ? 'white' : colors.primary }}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.nextButton} onPress={handleFinalize} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.nextButtonText}>Finalizar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCreationFlow = () => (
    <SafeAreaView style={[GlobalStyles.frame]}>
      {/* Header Custom */}
      <View style={[styles.header, { marginTop: 0, justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={exitFlow} style={{ marginRight: 16 }}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Flashcards</Text>
        <View style={{ width: 24 }} /> {/* Espaçador para centralizar título */}
      </View>

      {creationStep === 0 && renderStep0()}
      {creationStep === 1 && renderStep1()}
      {creationStep === 2 && renderStep2()}
      {creationStep === 3 && renderStep3()}

      {/* Modal de criação de tag */}
      <Modal visible={showTagModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontFamily: fontNames.bold, fontSize: 18, marginBottom: 12 }}>
              Nova Tag
            </Text>
            <TextInput
              placeholder="Nome da tag"
              value={newTagName}
              onChangeText={setNewTagName}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setShowTagModal(false)}>
                <Text style={{ color: colors.warning }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateTag}>
                <Text style={{ color: colors.primary }}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  if (studyMode) {
    const current = flashcards[studyIndex];
    return (
      <SafeAreaProvider>
        <SafeAreaView style={GlobalStyles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={exitStudyMode} style={{ position: 'absolute', left: 16 }}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Estudar Flashcards</Text>
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCardFlip}
              style={{ width: '100%' }}
            >
              <Animated.View
                style={[
                  styles.studyCard,
                  showBack ? styles.answerCard : styles.questionCard,
                  { opacity: fadeAnim },
                ]}
              >
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={showBack ? styles.studyBackText : styles.studyFrontText}>
                    {showBack ? current?.back : current?.front}
                  </Text>
                </ScrollView>
              </Animated.View>
            </TouchableOpacity>

            {showBack && (
              <View style={styles.gradeBlock}>
                <Text style={styles.gradeTitle}>Como você se saiu?</Text>
                <View style={styles.gradeContainer}>
                  {[0, 1, 2, 3, 4, 5].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={styles.gradeButton}
                      onPress={() => handleGrade(g)}
                    >
                      <Text style={styles.gradeText}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
        <Toast />
      </SafeAreaProvider>
    );
  }

  if (isCreating) {
    return (
      <SafeAreaProvider>
        {renderCreationFlow()}
        <Toast />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Container principal com área segura para notch e barra de status */}
      <SafeAreaView style={GlobalStyles.container}>
        {/* Cabeçalho da tela */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Games</Text>
        </View>

        {/* Conteúdo scrollável */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Container principal dos cards de jogos */}
          <View style={styles.cardsContainer}>
            {/* Banner principal que leva para a tela de pontos */}
            {uiReady && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Points')}
                style={styles.mainCard}
              >
                {/* Faded lightning icon */}
                <View style={styles.mainCardBgIcon}>
                  <RaioIcon size={180} color={colors.white} />
                </View>

                <Text style={styles.mainCardTitle}>O que vai jogar hoje?</Text>

                {/* Pontuação */}
                <View style={styles.pointsContainer}>
                  <RaioIcon color={colors.white} size={16} />
                  <Text style={styles.pointsText}>{user?.orgPoints || 0}pts</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Card do jogo Flash Cards */}
            <TouchableOpacity style={styles.gameCard} onPress={() => setIsCreating(true)}>
              <View style={styles.gameIconContainer}>
                {uiReady && <CapaFlashCards size={130} />}
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>Flash Cards</Text>
                <Text style={styles.gameDescription}>
                  Perguntas geradas por IA com o tema da matéria escolhida.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Card do jogo do Milhão */}
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => navigation.navigate('JogoDoMilhao')}
            >
              <View style={styles.gameIconContainer}>
                {uiReady && <CapaFlashCards size={130} />}
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>Jogo do milhão</Text>
                <Text style={styles.gameDescription}>Inúmeras perguntas com temas diversos.</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* padding extra para não colar no bottomTab */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
      <Toast />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 130,
    gap: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
    gap: 16,
  },

  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 130,
    gap: 16,
    paddingHorizontal: 16,
  },

  header: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  headerTitle: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },

  mainCard: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 64,
    gap: 12,
    overflow: 'hidden',
    backgroundColor: '#007AFF',
  },

  mainCardBgIcon: {
    position: 'absolute',
    opacity: 0.12,
    right: -20,
    top: -20,
    transform: [{ rotate: '20deg' }],
  },

  mainCardTitle: {
    color: 'white',
    fontFamily: fontNames.regular,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    flexWrap: 'wrap',
    maxWidth: '90%',
  },

  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 61, 128, 0.1)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },

  pointsText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fontNames.regular,
  },

  // Estilos dos cards de jogos
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 61, 128, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },

  gameIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  gameIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 20,
    fontFamily: fontNames.bold,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: '#8E8E93',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },

  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#8E8E93',
  },

  h1: {
    fontSize: 24,
    fontFamily: fontNames.bold,
    textAlign: 'center',
  },

  txt: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  sub: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    textAlign: 'center',
  },

  // Additional styles for flow
  optionButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  optionText: {
    fontFamily: fontNames.bold,
    fontSize: 16,
  },

  containerOptions: {
    paddingBottom: 130,
    gap: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    fontFamily: fontNames.regular,
    backgroundColor: 'white',
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontFamily: fontNames.bold,
  },
  cardOption: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  tagItem: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  tagCreateButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },

  /* Flashcards list styles */
  flashcardsSection: {
    marginTop: 24,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },

  flashcardItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 12,
  },

  flashcardFront: {
    fontFamily: fontNames.bold,
    fontSize: 14,
    color: '#000',
  },

  flashcardBack: {
    fontFamily: fontNames.regular,
    fontSize: 12,
    color: '#555',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyStateText: {
    fontSize: 18,
    fontFamily: fontNames.bold,
    color: colors.primary,
    marginBottom: 10,
  },

  emptyStateSubText: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: '#8E8E93',
    textAlign: 'center',
  },

  studyCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    minHeight: 220,
    maxHeight: '60%',
    minWidth: 220,
    alignSelf: 'center',
  },

  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },

  gradeButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  gradeText: {
    color: '#000',
    fontFamily: fontNames.bold,
  },

  gradeTitle: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },

  questionCard: {
    backgroundColor: '#000',
  },

  answerCard: {
    backgroundColor: '#F2F2F7',
  },

  studyFrontText: {
    fontFamily: fontNames.bold,
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  studyBackText: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },

  gradeBlock: {
    alignItems: 'center',
  },

  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  /* Tag chips inside flashcards */
  flashcardTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },

  flashcardTag: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  flashcardTagText: {
    fontSize: 10,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },
});

export default GamesScreen;
