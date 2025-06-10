import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardService, Card } from '../services/cardService';
import { RootTabParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootTabParamList>;

interface SimpleCard {
  _id: string;
  title: string;
}

export default function JogoDoMilhaoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const token = localStorage.getItem("authenticacao");

  const [cards, setCards] = useState<SimpleCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [questionAmount, setQuestionAmount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const userCards = await CardService.getUserCards();
      
      // Mapear apenas os campos necessários
      const simpleCards = userCards.map(card => ({
        _id: card._id,
        title: card.title
      }));
      
      setCards(simpleCards);
    } catch (err) {
      console.error("Erro ao carregar cards do usuário", err);
      Alert.alert(
        "Erro",
        "Não foi possível carregar os cards. Por favor, tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async (cardId: string, cardTitle: string) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/quiz/start/${cardId}`,
        { amount: questionAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigation.navigate('QuizGame', {
        sessionId: response.data.data.sessionId,
        cardTitle,
        totalQuestions: questionAmount
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert('Erro', 'Quiz não encontrado. Verifique se o card selecionado existe.');
      } else if (error.response?.data?.message?.includes('active session')) {
        Alert.alert('Aviso', 'Você já tem uma sessão de quiz ativa. Por favor, aguarde alguns minutos.');
      } else {
        Alert.alert('Erro', 'Erro ao iniciar o quiz. Por favor, tente novamente.');
      }
    }
  };

  const questionOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Filtrar cards baseado no termo de busca
  const filteredCards = searchTerm
    ? cards.filter(card => 
        card.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cards;

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

        <ScrollView style={styles.content}>
          <View style={styles.setupSection}>
            <Text style={styles.sectionTitle}>Configurar Quiz</Text>
            <Text style={styles.sectionSubtitle}>
              Escolha a quantidade de perguntas e selecione um card para começar!
            </Text>

            <View style={styles.questionAmountSection}>
              <Text style={styles.label}>Quantidade de Perguntas</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.amountScroll}
              >
                {questionOptions.map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.amountOption,
                      questionAmount === num && styles.amountOptionSelected
                    ]}
                    onPress={() => setQuestionAmount(num)}
                  >
                    <Text style={[
                      styles.amountOptionText,
                      questionAmount === num && styles.amountOptionTextSelected
                    ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.cardsSection}>
              <Text style={styles.label}>Selecionar Card</Text>
              {isLoading ? (
                <ActivityIndicator size="large" color="#667eea" />
              ) : cards.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>Nenhum card disponível</Text>
                  <Text style={styles.emptyStateDescription}>
                    Você precisa criar cards na seção Escolar antes de jogar.
                  </Text>
                  <TouchableOpacity
                    style={styles.createCardButton}
                    onPress={() => navigation.navigate('Escolar')}
                  >
                    <Text style={styles.createCardButtonText}>Ir para Escolar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardsList}>
                  {filteredCards.map((card) => (
                    <TouchableOpacity
                      key={card._id}
                      style={styles.cardOption}
                      onPress={() => startQuiz(card._id, card.title)}
                    >
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardSubtitle}>
                        💎 Iniciar quiz com {questionAmount} pergunta{questionAmount > 1 ? 's' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  setupSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#cbd5e0',
    marginBottom: 30,
  },
  questionAmountSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  amountScroll: {
    flexGrow: 0,
  },
  amountOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  amountOptionSelected: {
    backgroundColor: '#667eea',
  },
  amountOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  amountOptionTextSelected: {
    fontWeight: 'bold',
  },
  cardsSection: {
    flex: 1,
  },
  cardsList: {
    gap: 15,
  },
  cardOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#cbd5e0',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#cbd5e0',
    textAlign: 'center',
    marginBottom: 20,
  },
  createCardButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createCardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 