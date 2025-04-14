import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import api from '../services/api';

/**
 * Verifica se o dispositivo está conectado à internet
 * @returns Promise<boolean> - true se conectado, false caso contrário
 */
export const isConnected = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected === true;
};

/**
 * Verifica se a API está acessível
 * @returns Promise<boolean> - true se a API está acessível, false caso contrário
 */
export const isApiReachable = async (): Promise<boolean> => {
  try {
    // Faz uma requisição simples para verificar se a API está acessível
    await api.get('/users');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Verifica a conectividade e exibe um alerta se não estiver conectado
 * @returns Promise<boolean> - true se conectado, false caso contrário
 */
export const checkConnectivity = async (): Promise<boolean> => {
  const connected = await isConnected();
  
  if (!connected) {
    Alert.alert(
      'Sem conexão',
      'Você está sem conexão com a internet. Por favor, verifique sua conexão e tente novamente.',
      [{ text: 'OK' }]
    );
    return false;
  }
  
  const apiReachable = await isApiReachable();
  
  if (!apiReachable) {
    Alert.alert(
      'Servidor indisponível',
      'Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.',
      [{ text: 'OK' }]
    );
    return false;
  }
  
  return true;
};

export default {
  isConnected,
  isApiReachable,
  checkConnectivity
}; 
