import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '@styles/global';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';

const AIScreen = () => {
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
          {/* Placeholder para chat */}
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            padding: 24,
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              paddingVertical: 10,
              paddingHorizontal: 14,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOpacity: 0.02,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <Text style={{
                fontSize: 14,
                color: '#1D1B20',
                fontWeight: '500',
                opacity: 0.7,
              }}>
                Como posso te ajudar hoje?
              </Text>
            </View>
          </View>
          {/* Botão iniciar conversa */}
          <View style={{
            width: '100%',
            alignItems: 'flex-end',
            padding: 24,
            paddingTop: 0,
          }}>
            <CustomButton
              title="INICIAR UMA CONVERSA"
              variant="primary"
              buttonStyle={{
                backgroundColor: '#1D1B20',
                borderRadius: 20,
                height: 44,
                minWidth: 200,
                paddingHorizontal: 24,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }}
              textStyle={{
                color: '#fff',
                fontWeight: '600',
                fontSize: 14,
                letterSpacing: 0.5,
              }}
              onPress={() => {}}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default AIScreen;
