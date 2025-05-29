import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '@styles/global';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';
import AIService, { ChatMessage } from '../services/aiService';
import BotIcon from '@icons/BotIcon';
import { fontNames } from '../styles/fonts';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const AIScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    initializeIA();
  }, []);

  const initializeIA = async () => {
    setIsInitialLoading(true);
    
    // Simular delay de inicialização
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mensagem de boas-vindas da IA
    const welcomeMessage: Message = {
      id: Date.now(),
      text: "Olá! Eu sou a ORGAN.IA, sua assistente de organização. Como posso ajudá-lo hoje?",
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

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await AIService.sendMessage(userMessage.text);

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: "Erro ao se comunicar com a IA. Tente novamente mais tarde.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
       
        {/* Header */}
        <View style={styles.logoIa}>
          <BotIcon color="#1D1B20" size={20}/>
          <Text style={styles.nomeIA}>Organi.ai</Text>
        </View>

        {/* Título e subtítulo */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.titulo}>
            A <Text style={{ color: '#007AFF', fontStyle: 'italic', fontFamily: fontNames.bold }}>ia</Text> que te torna{'\n'}mais produtivo
          </Text>
        </View>

        {/* Card de chat */}
        <View
          style={styles.cardChat}
        >
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
                <Text
                  style={{
                    fontSize: 14,
                    color: message.isUser ? '#fff' : '#1D1B20',
                    fontWeight: '500',
                    fontFamily: fontNames.bold,
                  }}
                >
                  {message.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
                <Text style={{ color: '#1D1B20', fontSize: 14, fontFamily: fontNames.bold }}>Analisando...</Text>
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

  nomeIA: {
    fontSize: 20,
    fontFamily: fontNames.bold,
    fontWeight: '600',
    color: '#1D1B20',
  },

  logoIa: {
    gap: 6,
    flexDirection: 'row',
    alignItems: "baseline",
    justifyContent: 'center',
  },

  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1B20',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 32,
    fontFamily: fontNames.bold,
  },


  cardChat: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 32,
    width: '100%',
    alignSelf: 'center',
  },

  chatMessages: {
    flex: 1,
    padding: 24,
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
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});

