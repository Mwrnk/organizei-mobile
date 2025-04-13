import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { GlobalStyles } from '@styles/global';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@components/CustomButton';

const HomeScreen = () => {
  const { logout, user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={GlobalStyles.container}>
        <View style={styles.header}>
          <Text style={GlobalStyles.title}>organiz.ei</Text>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={GlobalStyles.title2}>Olá, {user?.name || 'Usuário'}!</Text>
          <Text style={GlobalStyles.text}>Bem-vindo à sua área de organização.</Text>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Conteúdo principal do app irá aqui */}
          <Text style={GlobalStyles.text}>Seu conteúdo principal aqui</Text>
        </View>
        
        <CustomButton 
          title="Sair"
          loading={loading}
          onPress={handleLogout}
          buttonStyle={styles.logoutButton}
          variant="outline"
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeContainer: {
    width: '80%',
    marginBottom: 32,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: '80%',
    marginBottom: 20,
  },
});

export default HomeScreen;
