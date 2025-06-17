/**
 * CONFIGURAÇÃO DO METRO BUNDLER
 * 
 * Metro é o bundler JavaScript usado pelo React Native e Expo.
 * Ele é responsável por:
 * - Empacotar o código JavaScript
 * - Resolver dependências
 * - Processar assets (imagens, fontes, etc.)
 * - Configurar aliases de módulos
 */

const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');

// Obtém a configuração padrão do Expo
const config = getDefaultConfig(__dirname);

/**
 * CONFIGURAÇÃO DE ASSETS
 * 
 * Define extensões de arquivo que devem ser tratadas como assets
 * (não como código JavaScript)
 */
config.resolver.assetExts = [
  ...config.resolver.assetExts, // Extensões padrão do Expo
  'ttf',  // Fontes TrueType
  'otf',  // Fontes OpenType
];

/**
 * CONFIGURAÇÃO DE ALIASES
 * 
 * Define aliases para facilitar importações de módulos
 * Deve corresponder aos aliases definidos no babel.config.js
 */
config.resolver.alias = {
  // Componentes reutilizáveis
  '@components': path.resolve(__dirname, 'src/components'),
  // Fontes customizadas
  '@fonts': path.resolve(__dirname, 'assets/fonts'),
  // Estilos globais
  '@styles': path.resolve(__dirname, 'src/styles'),
  // Telas do aplicativo
  '@screens': path.resolve(__dirname, 'src/screens'),
  // Contextos do React
  '@contexts': path.resolve(__dirname, 'src/contexts'),
  // Funções utilitárias
  '@utils': path.resolve(__dirname, 'src/utils'),
  // Ícones SVG
  '@icons': path.resolve(__dirname, 'assets/icons'),
};

/**
 * CONFIGURAÇÃO DE EXTENSÕES DE CÓDIGO
 * 
 * Define extensões de arquivo que devem ser tratadas como código
 * e processadas pelo Metro
 */
config.resolver.sourceExts = [
  ...config.resolver.sourceExts, // Extensões padrão
  'ttf',  // Fontes como código (para importação)
  'otf',  // Fontes como código (para importação)
];

module.exports = config; 
