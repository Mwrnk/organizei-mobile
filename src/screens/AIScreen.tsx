import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '@styles/global';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';
import AIService, { ChatMessage } from '../services/aiService';

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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: 36, marginBottom: 12 }}>
          <Text style={{ fontSize: 32, fontWeight: '600', color: '#1D1B20', letterSpacing: -1 }}>
            <Text style={{ fontSize: 32 }}>🤖</Text> Organi.ai
          </Text>
        </View>

        {/* Título e subtítulo */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: '500',
            color: '#1D1B20',
            textAlign: 'center',
            lineHeight: 28,
          }}>
            A <Text style={{ color: '#007AFF', fontStyle: 'italic', fontWeight: '600' }}>ia</Text> que te torna mais{'\n'}produtivo
          </Text>
        </View>

        {/* Card de chat */}
        <View
          style={{
            backgroundColor: '#F6F6F6',
            borderRadius: 32,
            width: '92%',
            height: 340,
            alignSelf: 'center',
            justifyContent: 'flex-end',
            padding: 0,
            marginBottom: 0,
            shadowColor: '#000',
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 1,
            overflow: 'hidden',
          }}
        >
          {/* Chat messages */}
          <ScrollView
            style={{
              flex: 1,
              padding: 24,
            }}
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
                  }}
                >
                  {message.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
                <Text style={{ color: '#1D1B20', fontSize: 14 }}>Analisando...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input area */}
          <View style={{
            width: '100%',
            padding: 24,
            paddingTop: 0,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginRight: 12,
                fontSize: 14,
                color: '#1D1B20',
                shadowColor: '#000',
                shadowOpacity: 0.02,
                shadowRadius: 2,
                elevation: 1,
              }}
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={handleSendMessage}
              editable={!isLoading}
            />
            <CustomButton
              title="Enviar"
              variant="primary"
              buttonStyle={{
                backgroundColor: '#1D1B20',
                borderRadius: 20,
                height: 44,
                paddingHorizontal: 24,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
                opacity: isLoading ? 0.7 : 1,
              }}
              textStyle={{
                color: '#fff',
                fontWeight: '600',
                fontSize: 14,
                letterSpacing: 0.5,
              }}
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
