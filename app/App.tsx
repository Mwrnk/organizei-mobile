/**
 * COMPONENTE PRINCIPAL DO APLICATIVO
 * 
 * Este é o componente raiz do Organizei Mobile que:
 * - Configura a navegação principal
 * - Carrega fontes customizadas
 * - Gerencia a tela de splash
 * - Configura os providers de contexto
 * - Inicializa o sistema de notificações toast
 */

import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { customFonts } from '@styles/fonts';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';
import Routes from '../src/navigation/Routes';
import { CommunityProvider } from '../src/contexts/CommunityContext';
// @ts-ignore
import Toast from 'react-native-toast-message';

/**
 * CONFIGURAÇÃO DA TELA DE SPLASH
 * 
 * Previne que a tela de splash seja escondida automaticamente
 * e configura sua duração e efeito de fade
 */
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000, // Duração de 1 segundo
  fade: true,     // Efeito de fade ao esconder
});

/**
 * COMPONENTE PRINCIPAL DO APP
 * 
 * Gerencia o estado de carregamento inicial e renderiza
 * a estrutura principal do aplicativo
 */
export default function App() {
  // Estado que controla se o app está pronto para ser exibido
  const [appIsReady, setAppIsReady] = useState(false);

  /**
   * EFEITO DE PREPARAÇÃO INICIAL
   * 
   * Carrega recursos necessários antes de mostrar o app:
   * - Fontes customizadas (Kodchasan)
   * - Ícones do Ionicons
   */
  useEffect(() => {
    async function prepare() {
      try {
        // Carrega fontes customizadas + ícones do Ionicons
        await Font.loadAsync({
          ...customFonts,    // Fontes Kodchasan (Bold, Regular, etc.)
          ...Ionicons.font,  // Ícones do Ionicons
        });
        console.log('Fonts loaded successfully');
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        // Marca o app como pronto, independente do resultado
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  /**
   * CALLBACK PARA ESCONDER A TELA DE SPLASH
   * 
   * Chamado quando o layout da view raiz está pronto
   * Esconde a tela de splash apenas quando o app está preparado
   */
  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hide();
    }
  }, [appIsReady]);

  // Não renderiza nada até que o app esteja pronto
  if (!appIsReady) {
    return null;
  }

  /**
   * ESTRUTURA PRINCIPAL DO APLICATIVO
   * 
   * Hierarquia de componentes:
   * - NavigationContainer: Gerencia a navegação
   * - AuthProvider: Fornece contexto de autenticação
   * - CommunityProvider: Fornece contexto da comunidade
   * - Routes: Define as rotas do aplicativo
   * - Toast: Sistema de notificações toast
   */
  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <AuthProvider>
        <CommunityProvider>
          <Routes />
        </CommunityProvider>
      </AuthProvider>
      <Toast />
    </NavigationContainer>
  );
}
