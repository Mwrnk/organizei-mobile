const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearUserCache() {
  try {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('user');
    console.log('Cache limpo com sucesso!');
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

clearUserCache();
