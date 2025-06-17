/**
 * SISTEMA DE FONTES DO APLICATIVO
 * 
 * Este arquivo define as fontes customizadas utilizadas no Organizei Mobile.
 * A fonte principal é Kodchasan, uma fonte moderna e legível.
 * 
 * Funcionalidades:
 * - Carregamento de fontes customizadas
 * - Aliases para facilitar uso das fontes
 * - Organização por peso e estilo
 */

/**
 * CONFIGURAÇÃO DE FONTES CUSTOMIZADAS
 * 
 * Define os arquivos de fonte que serão carregados pelo Expo Font.
 * Cada fonte tem um nome específico que será usado no CSS.
 */
export const customFonts = {
  'Kodchasan-Regular': require('../../assets/fonts/Kodchasan-Regular.ttf'),    // Peso normal
  'Kodchasan-Medium': require('../../assets/fonts/Kodchasan-Medium.ttf'),      // Peso médio
  'Kodchasan-Bold': require('../../assets/fonts/Kodchasan-Bold.ttf'),          // Peso negrito
  'Kodchasan-Italic': require('../../assets/fonts/Kodchasan-Italic.ttf'),      // Estilo itálico
  'Kodchasan-Light': require('../../assets/fonts/Kodchasan-Light.ttf'),        // Peso leve
  'Kodchasan-SemiBold': require('../../assets/fonts/Kodchasan-SemiBold.ttf'),  // Peso semi-negrito
};

/**
 * ALIASES DE FONTES
 * 
 * Nomes simplificados para facilitar o uso das fontes no código.
 * Permite usar fontNames.bold ao invés de 'Kodchasan-Bold'.
 */
export const fontNames = {
  regular: 'Kodchasan-Regular',    // Texto normal
  medium: 'Kodchasan-Medium',      // Texto médio
  bold: 'Kodchasan-Bold',          // Texto em negrito
  italic: 'Kodchasan-Italic',      // Texto em itálico
  light: 'Kodchasan-Light',        // Texto leve
  semibold: 'Kodchasan-SemiBold',  // Texto semi-negrito
};

// Exporta as fontes customizadas como padrão
export default customFonts;
