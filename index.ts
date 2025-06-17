/**
 * ARQUIVO PRINCIPAL DE ENTRADA DO APLICATIVO
 * 
 * Este é o ponto de entrada principal do aplicativo Organizei Mobile.
 * Responsável por registrar o componente raiz e inicializar o app.
 */

import { registerRootComponent } from 'expo';

// Importa o componente principal do aplicativo
import App from './app/App';

/**
 * REGISTRA O COMPONENTE RAIZ
 * 
 * registerRootComponent é uma função do Expo que:
 * - Chama AppRegistry.registerComponent('main', () => App)
 * - Garante que o ambiente seja configurado adequadamente
 * - Funciona tanto no Expo Go quanto em builds nativos
 * - Configura automaticamente as dependências necessárias
 */
registerRootComponent(App);
