import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '@styles/global';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';
import AIService, { ChatMessage } from '../../services/aiService';
import BotIcon from '@icons/BotIcon';
import { fontNames } from '@styles/fonts';
import { useAuth } from '@contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import Markdown from 'react-native-markdown-display';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const AIScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [freePlanId, setFreePlanId] = useState<string | null>(null);

  // Verifica se o usuário é premium
  const isPremium = user?.plan && freePlanId && user.plan !== freePlanId;

  useEffect(() => {
    const fetchFreePlanId = async () => {
      try {
        const response = await api.get('/plans');
        const freePlan = response.data.data.find((plan: any) => plan.isDefault);
        setFreePlanId(freePlan?._id || null);
      } catch (error) {
        console.error('Erro ao buscar plano free:', error);
      }
    };

    fetchFreePlanId();
  }, []);

  useEffect(() => {
    if (isPremium) {
      initializeIA();
    } else {
      setIsInitialLoading(false);
    }
  }, [isPremium]);

  const initializeIA = async () => {
    setIsInitialLoading(true);

    // Simular delay de inicialização
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mensagem de boas-vindas da IA
    const welcomeMessage: Message = {
      id: Date.now(),
      text: 'Olá! Eu sou a ORGAN.IA, sua assistente de organização. Como posso ajudá-lo hoje?',
      isUser: false,
    };

    setMessages([welcomeMessage]);
    setIsInitialLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await AIService.sendMessage(userMessage.text);

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: 'Erro ao se comunicar com a IA. Tente novamente mais tarde.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderiza a tela de bloqueio para usuários free
  const renderLockedScreen = () => (
    <View style={styles.lockedContainer}>
      <BotIcon color="#1D1B20" size={48} />
      <Text style={styles.lockedTitle}>Recurso Premium</Text>
      <Text style={styles.lockedDescription}>
        Para acessar a ORGAN.IA e aproveitar todos os benefícios da inteligência artificial, você
        precisa assinar o plano Premium.
      </Text>
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => navigation.navigate('Plan' as never)}
      >
        <Text style={styles.upgradeButtonText}>Assinar Premium</Text>
      </TouchableOpacity>
    </View>
  );

  // Estilos de markdown para melhorar legibilidade
  const markdownStyles = {
    body: {
      color: '#1D1B20',
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fontNames.bold,
    },
    paragraph: {
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 8,
      paddingLeft: 16,
    },
    ordered_list: {
      marginBottom: 8,
      paddingLeft: 16,
    },
    list_item: {
      marginBottom: 4,
    },
    link: {
      color: colors.button,
    },
    strong: {
      fontFamily: fontNames.bold,
    },
  } as const;

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isPremium) {
    return renderLockedScreen();
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.logoIa}>
          <BotIcon color="#1D1B20" size={20} />
          <Text style={styles.nomeIA}>Organi.ai</Text>
        </View>

        {/* Espaço removido para oferecer área maior ao chat */}

        {/* Card de chat */}
        <View style={styles.cardChat}>
          {/* Chat messages */}
          <ScrollView
            style={styles.chatMessages}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'flex-end',
            }}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={{
                  backgroundColor: message.isUser ? '#1D1B20' : '#fff',
                  borderRadius: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  marginBottom: 16,
                  alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  shadowColor: '#000',
                  shadowOpacity: 0.02,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                {message.isUser ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#fff',
                      fontWeight: '500',
                      fontFamily: fontNames.bold,
                    }}
                  >
                    {message.text}
                  </Text>
                ) : (
                  <Markdown style={markdownStyles}>{message.text}</Markdown>
                )}
              </View>
            ))}
            {isLoading && (
              <View style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
                <Text style={{ color: '#1D1B20', fontSize: 14, fontFamily: fontNames.bold }}>
                  Analisando...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.txtInput}
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={handleSendMessage}
              editable={!isLoading}
            />

            <CustomButton
              title="Enviar"
              variant="primary"
              style={styles.button}
              textStyle={styles.txtButton}
              onPress={handleSendMessage}
              disabled={isLoading}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default AIScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 120,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  lockedTitle: {
    fontSize: 24,
    fontFamily: fontNames.bold,
    color: '#1D1B20',
    marginTop: 24,
    marginBottom: 16,
  },
  lockedDescription: {
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: '#1D1B20',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontNames.bold,
  },
  nomeIA: {
    fontSize: 20,
    fontFamily: fontNames.bold,
    fontWeight: '600',
    color: '#1D1B20',
  },
  logoIa: {
    gap: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1B20',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 12,
    fontFamily: fontNames.bold,
  },
  cardChat: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 32,
    width: '100%',
    alignSelf: 'center',
    marginTop: 24,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1B20',
    borderRadius: 20,
    height: 44,
    paddingHorizontal: 24,
  },
  txtButton: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
    fontFamily: fontNames.bold,
  },
  txtInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 44,
    paddingLeft: 24,
    paddingRight: 12,
    color: 'rgba(29, 27, 32, 0.5)',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fontNames.regular,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
});
