import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';
import Toast from 'react-native-toast-message';
import { Card, CardService } from '../../services/cardService';
import { QuizService, QuizStartResponse } from '../../services/quizService';
import { useAuth } from '@contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../../navigation/types';

type NavProp = StackNavigationProp<RootTabParamList>;

const JogoDoMilhaoScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  // Setup states
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [questionAmount, setQuestionAmount] = useState(5);
  const [showAmountDropdown, setShowAmountDropdown] = useState(false);

  // Quiz states
  const [stage, setStage] = useState<'setup' | 'quiz' | 'finished'>('setup');
  const [quizSession, setQuizSession] = useState<QuizStartResponse | null>(null);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswerIdx, setCorrectAnswerIdx] = useState<number | null>(null);

  // Evita múltiplos cliques em "Próxima" enquanto carrega nova pergunta
  const [loadingNext, setLoadingNext] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    points: 0,
    current: 1,
  });

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardModalVisible, setCardModalVisible] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoadingCards(true);
      const data = await CardService.getUserCards();
      setCards(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar cards' });
    } finally {
      setLoadingCards(false);
    }
  };

  const startQuiz = async (cardId: string) => {
    try {
      const res = await QuizService.start(cardId, questionAmount);
      setQuizSession(res);
      setCurrentCardId(cardId);
      setStage('quiz');
      setStats({ total: questionAmount, correct: 0, points: 0, current: 1 });
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectAnswerIdx(null);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Erro ao iniciar quiz' });
    }
  };

  const confirmAnswer = async () => {
    if (selectedAnswer === null || !quizSession) return;
    try {
      const res = await QuizService.answer(quizSession.sessionId, selectedAnswer, 0);
      setShowResult(true);
      setCorrectAnswerIdx(res.correctAnswer);
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + (res.isCorrect ? 1 : 0),
        points: prev.points + res.pointsEarned,
      }));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro ao enviar resposta' });
    }
  };

  const handleNext = async () => {
    if (!currentCardId) return;
    // terminou?
    if (stats.current >= stats.total) {
      setStage('finished');
      return;
    }
    try {
      setLoadingNext(true);
      const res = await QuizService.start(currentCardId, questionAmount);
      setQuizSession(res);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectAnswerIdx(null);
      setStats((prev) => ({ ...prev, current: prev.current + 1 }));
    } catch (error: any) {
      // Trata erro de sessão ativa exibindo mensagem amigável
      const msg = error?.response?.data?.message || 'Erro ao carregar próxima pergunta';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoadingNext(false);
    }
  };

  /* -------------------- RENDER SETUP -------------------- */
  const renderSetup = () => (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      {/* Header texts */}
      <Text style={styles.title}>Configurar Quiz</Text>
      <Text style={styles.subtitle}>
        Escolha a quantidade de perguntas e selecione um card para começar sua jornada rumo ao
        milhão!
      </Text>

      {/* Perguntas amount */}
      <Text style={styles.sectionLabel}>Quantidade de Perguntas</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowAmountDropdown((prev) => !prev)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropdownText, questionAmount ? {} : { color: '#AAA' }]}>
          {questionAmount ? `${questionAmount} perguntas` : 'Selecionar'}
        </Text>
        <Ionicons
          name={showAmountDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>
      {showAmountDropdown && (
        <View style={styles.dropdownList}>
          {[1, 3, 5, 7, 10].map((n) => (
            <TouchableOpacity
              key={n}
              style={styles.dropdownItem}
              onPress={() => {
                setQuestionAmount(n);
                setShowAmountDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{n} perguntas</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Card selection */}
      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Selecionar Card</Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setCardModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropdownText, !selectedCard && { color: '#AAA' }]}>
          {selectedCard ? selectedCard.title : 'Selecionar o card'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.primary} />
      </TouchableOpacity>

      {/* Modal de seleção de card */}
      <Modal
        visible={cardModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCardModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCardModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione um card</Text>
            {loadingCards ? (
              <ActivityIndicator />
            ) : cards.length === 0 ? (
              <Text style={styles.emptyText}>Você não tem cards.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
                {cards.map((c) => (
                  <TouchableOpacity
                    key={c._id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCard(c);
                      setCardModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{c.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Create Quiz Button */}
      <TouchableOpacity
        style={[styles.createButton, !(selectedCard && questionAmount) && { opacity: 0.5 }]}
        disabled={!selectedCard}
        onPress={() => selectedCard && startQuiz(selectedCard._id!)}
      >
        <Text style={styles.createButtonText}>Criar Quiz</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  /* -------------------- RENDER QUIZ -------------------- */
  const renderQuiz = () => {
    if (!quizSession) return null;
    const { question } = quizSession;

    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.questionCounter}>
          Pergunta {stats.current} de {stats.total}
        </Text>

        <ScrollView style={styles.questionBox} contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.questionText}>{question.question}</Text>
        </ScrollView>

        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = showResult && correctAnswerIdx === idx;
          const isWrong =
            showResult && selectedAnswer === idx && selectedAnswer !== correctAnswerIdx;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                isCorrect && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
              disabled={showResult}
              onPress={() => setSelectedAnswer(idx)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {!showResult ? (
          <TouchableOpacity
            style={[styles.confirmButton, selectedAnswer === null && { opacity: 0.4 }]}
            disabled={selectedAnswer === null}
            onPress={confirmAnswer}
          >
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.confirmButton, loadingNext && { opacity: 0.5 }]}
            onPress={handleNext}
            disabled={loadingNext}
          >
            {loadingNext ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Próxima</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFinished = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={styles.title}>Resultado Final</Text>
      <Text style={styles.resultText}>
        Acertos: {stats.correct} / {stats.total}
      </Text>
      <Text style={styles.resultText}>Pontuação: {stats.points}</Text>

      <TouchableOpacity
        style={[styles.confirmButton, { marginTop: 24 }]}
        onPress={() => setStage('setup')}
      >
        <Text style={styles.confirmText}>Jogar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jogo do Milhão</Text>
        <View style={{ width: 24 }} />
      </View>

      {stage === 'setup' && renderSetup()}
      {stage === 'quiz' && renderQuiz()}
      {stage === 'finished' && renderFinished()}

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: { fontSize: 16, fontFamily: fontNames.bold, color: colors.primary },

  /* Setup */
  title: { fontSize: 20, fontFamily: fontNames.bold, marginBottom: 12 },
  subtitle: { fontSize: 14, fontFamily: fontNames.regular, marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontFamily: fontNames.bold, marginBottom: 8 },
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
  dropdownList: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    maxHeight: 200,
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  dropdownItemText: { fontFamily: fontNames.regular },
  createButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontFamily: fontNames.bold },

  /* Quiz */
  questionCounter: { fontFamily: fontNames.regular, marginBottom: 8 },
  questionBox: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    maxHeight: 200,
    marginBottom: 16,
  },
  questionText: { fontFamily: fontNames.bold, fontSize: 16 },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionButtonSelected: { backgroundColor: 'rgba(0, 61, 128, 0.1)' },
  optionCorrect: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  optionWrong: { backgroundColor: '#F44336', borderColor: '#F44336' },
  optionText: { fontFamily: fontNames.regular },
  confirmButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontFamily: fontNames.bold },

  /* Result */
  resultText: { fontFamily: fontNames.bold, fontSize: 16, marginTop: 8 },

  /* removed dropdown list styles no longer used */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontFamily: fontNames.bold,
    fontSize: 18,
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    fontFamily: fontNames.regular,
  },
  emptyText: {
    fontFamily: fontNames.regular,
    color: '#AAA',
    textAlign: 'center',
  },
});

export default JogoDoMilhaoScreen;
