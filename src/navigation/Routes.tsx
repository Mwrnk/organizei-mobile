/**
 * SISTEMA DE ROTEAMENTO PRINCIPAL
 * 
 * Este componente é responsável por determinar qual conjunto de rotas
 * deve ser exibido baseado no estado de autenticação do usuário.
 * 
 * Funcionalidades:
 * - Verifica se o usuário está logado
 * - Exibe tela de carregamento durante verificação
 * - Redireciona para rotas de autenticação ou aplicativo principal
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AppRoutes from './AppRoutes';
import AuthRoutes from './AuthRoutes';

/**
 * COMPONENTE PRINCIPAL DE ROTEAMENTO
 * 
 * Decide qual conjunto de rotas exibir baseado no estado de autenticação:
 * - Se loading: exibe tela de carregamento
 * - Se user existe: exibe rotas do aplicativo principal (AppRoutes)
 * - Se user não existe: exibe rotas de autenticação (AuthRoutes)
 */
const Routes = () => {
  // Obtém o estado de autenticação do contexto
  const { user, loading } = useAuth();

  /**
   * TELA DE CARREGAMENTO
   * 
   * Exibida enquanto verifica se há um usuário logado
   * no armazenamento local
   */
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  /**
   * DECISÃO DE ROTEAMENTO
   * 
   * Renderização condicional baseada no estado de autenticação:
   * - user existe: aplicativo principal (telas autenticadas)
   * - user não existe: telas de autenticação (login/registro)
   */
  return user ? <AppRoutes /> : <AuthRoutes />;
};

export default Routes;
