import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RouteParams {
  sessionId: string;
  cardTitle: string;
  totalQuestions: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizSession {
  sessionId: string;
  question: QuizQuestion;
  cardTitle: string;
}

export default function QuizGameScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, cardTitle, totalQuestions } = route.params as RouteParams;
  const token = localStorage.getItem("authenticacao");

  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [quizStats, setQuizStats] = useState({
    totalQuestions,
    correctAnswers: 0,
    pointsEarned: 0,
    currentQuestion: 1
  });

  useEffect(() => {
    if (sessionId) {
      setQuizSession({
        sessionId,
        cardTitle,
        question: {
          question: '',
          options: []
        }
      });
      loadNextQuestion();
    }
  }, [sessionId]);

  const loadNextQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:3000/quiz/start/${sessionId}`,
        { amount: totalQuestions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuizSession(response.data.data);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setCorrectAnswerIndex(null);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar a próxima pergunta');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = async () => {
    if (selectedAnswer === null || !quizSession) return;
    
    setIsAnswering(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/quiz/answer/${quizSession.sessionId}`,
        {
          answer: selectedAnswer,
          timeSpent: 30
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = response.data.data;
      setIsCorrect(result.isCorrect);
      setCorrectAnswerIndex(result.correctAnswer);
      setShowResult(true);

      setQuizStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + (result.isCorrect ? 1 : 0),
        pointsEarned: prev.pointsEarned + (result.pointsEarned || 0),
        currentQuestion: prev.currentQuestion + 1
      }));

      if (quizStats.currentQuestion >= totalQuestions) {
        setTimeout(() => {
          Alert.alert(
            'Quiz Finalizado!',
            `Você acertou ${quizStats.correctAnswers} de ${totalQuestions} perguntas e ganhou ${quizStats.pointsEarned} pontos!`,
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }, 2000);
      } else {
        setTimeout(loadNextQuestion, 2000);
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar sua resposta');
    } finally {
      setIsAnswering(false);
    }
  };

  if (isLoading || !quizSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Show do Milhão</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Pergunta {quizStats.currentQuestion} de {totalQuestions}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(quizStats.currentQuestion / totalQuestions) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{quizStats.correctAnswers}</Text>
              <Text style={styles.statLabel}>Acertos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{quizStats.pointsEarned}</Text>
              <Text style={styles.statLabel}>Pontos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round((quizStats.correctAnswers / (quizStats.currentQuestion - 1)) * 100 || 0)}%
              </Text>
              <Text style={styles.statLabel}>Taxa de Acerto</Text>
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{quizSession.question.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {quizSession.question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionSelected,
                  showResult && correctAnswerIndex === index && styles.optionCorrect,
                  showResult && selectedAnswer === index && selectedAnswer !== correctAnswerIndex && styles.optionWrong
                ]}
                onPress={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult || isAnswering}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionIndex,
                    selectedAnswer === index && styles.optionIndexSelected
                  ]}>
                    <Text style={styles.optionIndexText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {showResult && (
            <View style={styles.resultContainer}>
              <Text style={[
                styles.resultText,
                isCorrect ? styles.resultCorrect : styles.resultWrong
              ]}>
                {isCorrect ? '🎉 Parabéns!' : '😔 Que pena!'}
              </Text>
              {!isCorrect && (
                <Text style={styles.correctAnswerText}>
                  A resposta correta era: {quizSession.question.options[correctAnswerIndex || 0]}
                </Text>
              )}
            </View>
          )}

          {!showResult && (
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (selectedAnswer === null || isAnswering) && styles.confirmButtonDisabled
              ]}
              onPress={answerQuestion}
              disabled={selectedAnswer === null || isAnswering}
            >
              {isAnswering ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {selectedAnswer === null ? 'Escolha uma opção' : 'Confirmar Resposta'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a202c',
  },
  background: {
    flex: 1,
    backgroundColor: '#1a202c',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: '#cbd5e0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#cbd5e0',
    fontSize: 12,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  questionText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionSelected: {
    backgroundColor: '#667eea',
  },
  optionCorrect: {
    backgroundColor: '#48bb78',
  },
  optionWrong: {
    backgroundColor: '#f56565',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  optionIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndexSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionIndexText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultCorrect: {
    color: '#48bb78',
  },
  resultWrong: {
    color: '#f56565',
  },
  correctAnswerText: {
    color: '#cbd5e0',
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 