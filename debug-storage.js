const AsyncStorage = require('@react-native-async-storage/async-storage');

async function debugStorage() {
  try {
    console.log('=== DEBUGGING STORAGE ===');

    // Listar todas as chaves no AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    console.log('Todas as chaves no storage:', keys);

    // Verificar dados do usuário
    const userStr = await AsyncStorage.getItem('user');
    console.log('String do usuário:', userStr);

    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('Dados do usuário parseados:', userData);
      console.log('Campos do usuário:');
      Object.keys(userData).forEach((key) => {
        console.log(`  ${key}: ${userData[key]}`);
      });
    }

    // Verificar token
    const token = await AsyncStorage.getItem('jwtToken');
    console.log('Token JWT:', token ? `${token.substring(0, 20)}...` : 'null');
  } catch (error) {
    console.error('Erro ao debugar storage:', error);
  }
}

debugStorage();
