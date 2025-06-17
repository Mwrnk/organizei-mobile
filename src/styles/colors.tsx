/**
 * SISTEMA DE CORES DO APLICATIVO
 * 
 * Este arquivo define todas as cores utilizadas no Organizei Mobile.
 * As cores são organizadas por categoria e seguem um design system consistente.
 * 
 * Categorias:
 * - Cores base (background, primary, secondary)
 * - Cores de interface (button, textLink)
 * - Cores de texto (gray, lightGray)
 * - Cores de feedback (warning)
 * - Cores de prioridade (high, medium, low)
 */

export default {
  // CORES BASE
  background: '#F7F7F7',    // Cor de fundo principal (cinza claro)
  primary: '#1D1B20',       // Cor primária (preto escuro)
  secondary: '#1a1a1a',     // Cor secundária (preto)
  secundary10: '#rgba(26, 26, 26, 0.1)',  // Cor secundária com 10% de opacidade
  
  // CORES DE INTERFACE
  button: '#007AFF',        // Cor dos botões (azul iOS)
  textLink: '#007AFF',      // Cor dos links de texto
  
  // CORES DE TEXTO
  gray: '#666666',          // Texto secundário
  lightGray: '#f0f0f0',     // Fundo de elementos secundários
  
  // CORES DE FEEDBACK
  warning: '#ff9500',       // Cor de aviso/alerta (laranja)
  white: '#FFFFFF',         // Branco puro
  
  // CORES DE PRIORIDADE
  // Usadas para indicar níveis de prioridade em cards e tarefas
  highPriority: '#FF3B30',    // Prioridade alta (vermelho)
  mediumPriority: '#FF9500',  // Prioridade média (laranja)
  lowPriority: '#34C759',     // Prioridade baixa (verde)
};
