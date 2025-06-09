// Configurações da API
const API_CONFIG = {
  // Configuração para ambiente de desenvolvimento
  dev: {
    baseURL: 'http://localhost:3000',
  },
  // Configuração para ambiente de produção
  prod: {
    baseURL: 'https://api.organizei.com', // Substitua pela URL da API em produção
  },
  // Configuração para ambiente de teste
  test: {
    baseURL: 'http://localhost:3001',
  },
};

// Determina qual ambiente está sendo usado
// Em uma aplicação real, você pode querer usar variáveis de ambiente
const ENV = __DEV__ ? 'dev' : 'prod';

// Exporta a configuração para o ambiente atual
export default API_CONFIG[ENV]; 
