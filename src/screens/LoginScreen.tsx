import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '@styles/global';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Input from '@components/Input';
import { useAuth } from '@contexts/AuthContext';
import CustomButton from '@components/CustomButton';
import { checkConnectivity } from '@utils/network';
import AuthController from '../controllers/AuthController';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

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
      // Usa a função de login do contexto que agora delega para o controller
      await login({ email, password });
    } catch (err) {
      setError('Login falhou. Verifique suas credenciais.');
      console.error(err);
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
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input placeholder="Senha" secureTextEntry={true} onChangeText={setPassword} />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.createAccountContainer}>
          <Text style={GlobalStyles.textSmall}>Não tem uma conta? </Text>
          <TouchableOpacity>
            <Text style={GlobalStyles.textLink}>Crie uma conta</Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Entrar"
          loading={loading}
          onPress={handleLogin}
          buttonStyle={styles.loginButton}
        />
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
});

export default LoginScreen;

/*
  <TextInput placeholder="Username" onChangeText={setUsername} />
          <TextInput placeholder="Password" secureTextEntry={true} onChangeText={setPassword} />
          <Button title="Login" onPress={handleLogin} />
*/
