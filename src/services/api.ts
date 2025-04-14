import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../config/api';
import { TOKEN_KEY } from './auth';

// Configuração base da API
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT a todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros nas respostas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // IMPLEMENTAR REFRESH TOKEN
      // Por enquanto, apenas redireciona para login
      await AsyncStorage.removeItem(TOKEN_KEY);
      // Navegação seria manipulada no componente usando o serviço
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api; 
