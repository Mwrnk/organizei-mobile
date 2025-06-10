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
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';

const EMAIL_KEY = 'lastLoginEmail';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>();
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(EMAIL_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberEmail(true);
        }
      } catch (e) {
        // Ignorar erro
      }
    };
    loadEmail();
  }, []);

  // Função para validar e-mail
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Função para validar senha
  const isPasswordValid = (password: string) => password.length >= 8;

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    if (!isEmailValid(email)) {
      setError('Digite um e-mail válido');
      return;
    }
    if (!isPasswordValid(password)) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    // Verificação de conectividade
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      return;
    }

    try {
      setError('');
      await login({ email, password });
      if (rememberEmail) {
        await AsyncStorage.setItem(EMAIL_KEY, email);
      } else {
        await AsyncStorage.removeItem(EMAIL_KEY);
      }
    } catch (err) {
      setError('Login falhou. Verifique suas credenciais.');
      console.error('LoginScreen - Erro no login:', err);
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
          <View style={{ position: 'relative', width: '100%' }}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {email.length > 0 && !isEmailValid(email) && (
            <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Digite um e-mail válido</Text>
          )}
          <View style={{ position: 'relative', width: '100%' }}>
            <Input
              placeholder="Senha"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              autoCapitalize="none"
              keyboardType="default"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: 16,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {password.length > 0 && !isPasswordValid(password) && (
            <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>A senha deve ter pelo menos 8 caracteres</Text>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginLeft: 32 }}>
          <TouchableOpacity onPress={() => setRememberEmail((prev) => !prev)} style={{ marginRight: 8 }}>
            <Ionicons
              name={rememberEmail ? 'checkbox' : 'square-outline'}
              size={22}
              color={rememberEmail ? colors.primary : '#888'}
            />
          </TouchableOpacity>
          <Text style={{ color: '#444', fontSize: 15 }}>Lembrar meu e-mail</Text>
        </View>

        <View style={styles.createAccountContainer}>
          <Text style={GlobalStyles.textSmall}>Não tem uma conta? </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Register');
            }}
          >
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
