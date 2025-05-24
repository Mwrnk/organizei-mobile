// Script para testar o login com credenciais reais
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearAndDebugLogin() {
  try {
    console.log('=== LIMPANDO CACHE COMPLETO ===');

    // Listar todas as chaves
    const keys = await AsyncStorage.getAllKeys();
    console.log('Chaves antes da limpeza:', keys);

    // Limpar tudo
    await AsyncStorage.clear();
    console.log('Cache limpo com sucesso!');

    // Verificar se foi limpo
    const keysAfter = await AsyncStorage.getAllKeys();
    console.log('Chaves após limpeza:', keysAfter);
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

clearAndDebugLogin();
