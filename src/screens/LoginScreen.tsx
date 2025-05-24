import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { GlobalStyles } from '@styles/global';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Input from '@components/Input';
import { useAuth } from '@contexts/AuthContext';
import CustomButton from '@components/CustomButton';
import { checkConnectivity } from '@utils/network';
import AuthController from '../controllers/AuthController';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>();

  // Debug useEffect para monitorar o estado do usuário
  useEffect(() => {
    console.log('LoginScreen - Estado atual do usuário no contexto:', {
      hasUser: !!user,
      userId: user?._id,
      userEmail: user?.email,
      userName: user?.name,
      userFields: user ? Object.keys(user) : [],
    });
  }, [user]);

  // Debug do storage na inicialização
  useEffect(() => {
    const debugStorageOnMount = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('jwtToken');
        console.log('LoginScreen - Debug inicial do storage:', {
          hasUserStr: !!userStr,
          hasToken: !!token,
          userStrLength: userStr?.length,
          tokenLength: token?.length,
        });

        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log('LoginScreen - Dados do usuário no storage:', userData);
        }
      } catch (error) {
        console.error('LoginScreen - Erro ao debugar storage:', error);
      }
    };

    debugStorageOnMount();
  }, []);

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    // Validação do formulário
    if (!validateForm()) {
      return;
    }

    // Verificação de conectividade
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      return;
    }

    try {
      setError('');
      console.log('LoginScreen - Tentando login com:', { email, password: '***' });
      // Usa a função de login do contexto que agora delega para o controller
      await login({ email, password });
      console.log('LoginScreen - Login realizado com sucesso');
    } catch (err) {
      setError('Login falhou. Verifique suas credenciais.');
      console.error('LoginScreen - Erro no login:', err);
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Cache limpo', 'Cache do app foi limpo com sucesso. Reinicie o app.');
      console.log('Cache limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      Alert.alert('Erro', 'Falha ao limpar cache');
    }
  };

  const testLogin = async () => {
    try {
      console.log('=== TESTE DE LOGIN DIRETO ===');
      setEmail('matheusmatheus@teste.com');
      setPassword('123456');

      // Aguarda um pouco para os campos serem atualizados
      setTimeout(async () => {
        await handleLogin();
      }, 500);
    } catch (error) {
      console.error('Erro no teste de login:', error);
    }
  };

  const debugCompleteStorage = async () => {
    try {
      console.log('=== DEBUG COMPLETO DO STORAGE ===');

      // Lista todas as chaves
      const keys = await AsyncStorage.getAllKeys();
      console.log('Todas as chaves no storage:', keys);

      // Pega todos os valores
      const stores = await AsyncStorage.multiGet(keys);
      stores.forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });

      // Debug específico do usuário
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('jwtToken');

      console.log('=== DADOS DO USUÁRIO ===');
      console.log('String do usuário:', userStr);
      console.log('Token:', token ? `${token.substring(0, 30)}...` : 'null');

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log('Dados parseados:', userData);
          console.log('Campos disponíveis:', Object.keys(userData));
          console.log('Validação dos campos essenciais:', {
            hasId: !!userData._id,
            hasEmail: !!userData.email,
            hasName: !!userData.name,
            id: userData._id,
            email: userData.email,
            name: userData.name,
          });
        } catch (parseError) {
          console.error('Erro ao parsear dados do usuário:', parseError);
        }
      }
    } catch (error) {
      console.error('Erro ao debugar storage:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={GlobalStyles.container}>
        <View style={styles.logoContainer}>
          <Text style={GlobalStyles.title}>organiz.ei</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={GlobalStyles.title2}>Bem-vindo de volta!</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Senha"
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.createAccountContainer}>
          <Text style={GlobalStyles.textSmall}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={GlobalStyles.textLink}>Crie uma conta</Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Entrar"
          loading={loading}
          onPress={handleLogin}
          buttonStyle={styles.loginButton}
        />

        {/* Botões temporários para desenvolvimento */}
        <TouchableOpacity onPress={clearCache} style={styles.debugButton}>
          <Text style={styles.debugText}>Limpar Cache (Debug)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testLogin}
          style={[styles.debugButton, { backgroundColor: '#4caf50' }]}
        >
          <Text style={styles.debugText}>Teste Login Automático</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={debugCompleteStorage}
          style={[styles.debugButton, { backgroundColor: '#2196f3' }]}
        >
          <Text style={styles.debugText}>Debug Storage Completo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 16,
  },
  welcomeContainer: {
    marginBottom: 32,
  },
  formContainer: {
    width: '80%',
    marginBottom: 24,
    gap: 16,
  },
  createAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButton: {
    width: '80%',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  debugButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff6b6b',
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default LoginScreen;

/*
  <TextInput placeholder="Username" onChangeText={setUsername} />
          <TextInput placeholder="Password" secureTextEntry={true} onChangeText={setPassword} />
          <Button title="Login" onPress={handleLogin} />
*/
