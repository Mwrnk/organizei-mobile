/**
 * CONFIGURAÇÃO DO BABEL
 * 
 * Babel é um transpilador JavaScript que converte código moderno
 * em código compatível com versões mais antigas do JavaScript.
 * 
 * Esta configuração define:
 * - Presets para Expo
 * - Aliases de módulos para facilitar importações
 * - Cache para melhor performance
 */

module.exports = function (api) {
  // Habilita cache do Babel para melhor performance
  api.cache(true);
  
  return {
    // Preset principal para projetos Expo
    presets: ['babel-preset-expo'],
    
    // Plugins adicionais
    plugins: [
      [
        // Plugin para resolver aliases de módulos
        'module-resolver',
        {
          // Diretório raiz para resolução de módulos
          root: ['./src'],
          
          // Aliases para facilitar importações
          alias: {
            // Componentes reutilizáveis
            '@components': './src/components',
            // Fontes customizadas
            '@fonts': './assets/fonts',
            // Estilos globais
            '@styles': './src/styles',
            // Telas do aplicativo
            '@screens': './src/screens',
            // Contextos do React
            '@contexts': './src/contexts',
            // Funções utilitárias
            '@utils': './src/utils',
            // Ícones SVG
            '@icons': './assets/icons',
          },
        },
      ],
    ],
  };
};
