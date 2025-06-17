import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { GlobalStyles } from '@styles/global';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Input from '@components/Input';
import { useAuth } from '@contexts/AuthContext';
import CustomButton from '@components/CustomButton';
import { checkConnectivity } from '@utils/network';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const EMAIL_KEY = 'lastLoginEmail';
const BIOMETRY_KEY = 'biometryEnabled';
const CREDENTIALS_KEY = 'savedCredentials';
const BIOMETRY_LAST_USED = 'biometryLastUsed';

// Tela de Login do aplicativo
const LoginScreen = () => {
  // Estados para armazenar email, senha, erro, etc.
  const [email, setEmail] = useState(''); // Armazena o e-mail digitado
  const [password, setPassword] = useState(''); // Armazena a senha digitada
  const [error, setError] = useState(''); // Armazena mensagens de erro
  const { login, loading, user } = useAuth(); // Hook de autenticação
  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>(); // Navegação
  const [rememberEmail, setRememberEmail] = useState(false); // Se deve lembrar o e-mail
  const [showPassword, setShowPassword] = useState(false); // Se a senha está visível
  const [showError, setShowError] = useState(false); // Controla exibição da mensagem de erro
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null); // Sugestão de correção de e-mail
  const [isBiometryAvailable, setIsBiometryAvailable] = useState(false);
  const [isBiometryEnabled, setIsBiometryEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [isWebPlatform, setIsWebPlatform] = useState(false);
  const rnBiometrics = new ReactNativeBiometrics();

  // Lista de domínios comuns digitados incorretamente e suas correções
  const commonDomains: { [wrong: string]: string } = {
    'gamil.com': 'gmail.com',
    'gmail.con': 'gmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmil.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outlook.con': 'outlook.com',
    'yaho.com': 'yahoo.com',
    'yahoo.con': 'yahoo.com',
  };

  // Sugere correção de domínio de e-mail se digitado errado
  function suggestEmailCorrection(email: string) {
    const parts = email.split('@');
    if (parts.length !== 2) {
      setEmailSuggestion(null);
      return;
    }
    const [user, domain] = parts;
    const suggestion = commonDomains[domain.trim().toLowerCase()];
    if (suggestion && domain.trim().toLowerCase() !== suggestion) {
      setEmailSuggestion(`${user}@${suggestion}`);
    } else {
      setEmailSuggestion(null);
    }
  }

  // Carrega o e-mail salvo no AsyncStorage ao abrir a tela
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

  // Exibe a mensagem de erro por 4 segundos e limpa ao digitar
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Verifica se está rodando na web
  useEffect(() => {
    const checkPlatform = () => {
      setIsWebPlatform(Platform.OS === 'web');
    };
    checkPlatform();
  }, []);

  // Verifica se a biometria está disponível e configurada
  useEffect(() => {
    const checkBiometry = async () => {
      try {
        if (isWebPlatform) {
          setIsBiometryAvailable(false);
          setBiometryType(null);
          return;
        }

        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        setIsBiometryAvailable(available);
        setBiometryType(biometryType || null);
        
        const biometryEnabled = await AsyncStorage.getItem(BIOMETRY_KEY);
        setIsBiometryEnabled(biometryEnabled === 'true');

        // Verifica se as credenciais salvas ainda são válidas
        if (biometryEnabled === 'true') {
          const savedCredentials = await AsyncStorage.getItem(CREDENTIALS_KEY);
          if (!savedCredentials) {
            await AsyncStorage.removeItem(BIOMETRY_KEY);
            setIsBiometryEnabled(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar biometria:', error);
        setIsBiometryAvailable(false);
      }
    };
    
    checkBiometry();
  }, [isWebPlatform]);

  // Função para desabilitar a biometria
  const handleDisableBiometry = async () => {
    Alert.alert(
      'Desabilitar Biometria',
      'Tem certeza que deseja desabilitar o login com biometria?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Desabilitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(BIOMETRY_KEY);
              await AsyncStorage.removeItem(CREDENTIALS_KEY);
              await AsyncStorage.removeItem(BIOMETRY_LAST_USED);
              setIsBiometryEnabled(false);
              Alert.alert('Sucesso', 'Login com biometria desabilitado com sucesso.');
            } catch (error) {
              console.error('Erro ao desabilitar biometria:', error);
              Alert.alert('Erro', 'Não foi possível desabilitar a biometria.');
            }
          }
        }
      ]
    );
  };

  // Função para login com biometria
  const handleBiometricLogin = async () => {
    try {
      setIsBiometricLoading(true);
      
      // Verifica se as credenciais ainda são válidas
      const savedCredentials = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (!savedCredentials) {
        setIsBiometryEnabled(false);
        Alert.alert(
          'Erro',
          'Credenciais não encontradas. Por favor, faça login novamente com email e senha.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.removeItem(BIOMETRY_KEY);
                setIsBiometricLoading(false);
              }
            }
          ]
        );
        return;
      }

      const { success, error } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirme sua identidade',
        cancelButtonText: 'Cancelar'
      });

      if (success) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
        await login(savedEmail, savedPassword);
        
        // Registra o último uso bem-sucedido da biometria
        await AsyncStorage.setItem(BIOMETRY_LAST_USED, new Date().toISOString());
      } else {
        setError('Autenticação biométrica cancelada');
      }
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      setError('Erro na autenticação biométrica');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // Função para salvar credenciais para biometria
  const saveCredentialsForBiometry = async () => {
    try {
      // Verifica se já existem credenciais salvas
      const existingCredentials = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (existingCredentials) {
        Alert.alert(
          'Atenção',
          'Já existem credenciais salvas para biometria. Deseja substituí-las?',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Substituir',
              onPress: async () => {
                await saveCredentials();
              }
            }
          ]
        );
      } else {
        await saveCredentials();
      }
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
      Alert.alert('Erro', 'Não foi possível salvar as credenciais.');
    }
  };

  const saveCredentials = async () => {
    const credentials = JSON.stringify({ email, password });
    await AsyncStorage.setItem(CREDENTIALS_KEY, credentials);
    await AsyncStorage.setItem(BIOMETRY_KEY, 'true');
    await AsyncStorage.setItem(BIOMETRY_LAST_USED, new Date().toISOString());
    setIsBiometryEnabled(true);
    Alert.alert('Sucesso', 'Login com biometria habilitado com sucesso!');
  };

  // Manipula mudança no campo de e-mail, sugere correção e limpa erro
  const handleEmailChange = (text: string) => {
    setEmail(text);
    suggestEmailCorrection(text);
    if (error) {
      setShowError(false);
      setError('');
    }
  };

  // Manipula mudança no campo de senha e limpa erro
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) {
      setShowError(false);
      setError('');
    }
  };

  // Valida se o e-mail está em formato válido
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Valida se a senha tem pelo menos 8 caracteres
  const isPasswordValid = (password: string) => password.length >= 8;

  // Valida se todos os campos obrigatórios estão preenchidos
  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return false;
    }
    return true;
  };

  // Função principal de login, chamada ao pressionar o botão
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

    const isConnected = await checkConnectivity();
    if (!isConnected) {
      setError('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      setShowError(true);
      return;
    }

    try {
      setError('');
      await login(email, password);
      
      if (rememberEmail) {
        await AsyncStorage.setItem(EMAIL_KEY, email);
      } else {
        await AsyncStorage.removeItem(EMAIL_KEY);
      }

      // Pergunta se deseja habilitar biometria após login bem-sucedido
      if (isBiometryAvailable && !isBiometryEnabled) {
        Alert.alert(
          'Habilitar Biometria',
          'Deseja habilitar o login com biometria?',
          [
            {
              text: 'Não',
              style: 'cancel'
            },
            {
              text: 'Sim',
              onPress: saveCredentialsForBiometry
            }
          ]
        );
      }
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 404) {
        setError('E-mail ou senha incorretos. Por favor, tente novamente.');
      } else {
        setError('Login falhou. Verifique suas credenciais.');
      }
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

        {isWebPlatform ? (
          <View style={styles.webMessageContainer}>
            <Ionicons name="information-circle" size={24} color={colors.warning} />
            <Text style={styles.webMessageText}>
              O login com biometria não está disponível no navegador web.{'\n'}
              Por favor, use o aplicativo móvel para acessar esta funcionalidade.
            </Text>
          </View>
        ) : isBiometryAvailable && isBiometryEnabled ? (
          <View style={styles.biometricContainer}>
            <TouchableOpacity
              style={[styles.biometricButton, isBiometricLoading && styles.biometricButtonDisabled]}
              onPress={handleBiometricLogin}
              disabled={isBiometricLoading}
              accessibilityLabel="Login com biometria"
              accessibilityHint="Toque para fazer login usando biometria"
            >
              {isBiometricLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="finger-print" size={24} color={colors.primary} />
                  <Text style={styles.biometricButtonText}>
                    Login com {biometryType === BiometryTypes.TouchID ? 'Touch ID' : 'Biometria'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.disableBiometryButton}
              onPress={handleDisableBiometry}
              accessibilityLabel="Desabilitar biometria"
              accessibilityHint="Toque para desabilitar o login com biometria"
            >
              <Text style={styles.disableBiometryText}>Desabilitar Biometria</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <View style={{ position: 'relative', width: '100%' }}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              accessibilityLabel="Campo de e-mail"
              accessibilityHint="Digite seu e-mail para login"
            />
            {emailSuggestion && (
              <TouchableOpacity onPress={() => {
                setEmail(emailSuggestion);
                setEmailSuggestion(null);
              }}>
                <Text style={{ color: '#007bff', fontSize: 13, marginBottom: 4 }}>
                  Sugerido: {emailSuggestion}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {email.length > 0 && !isEmailValid(email) && (
            <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Digite um e-mail válido</Text>
          )}
          <View style={{ position: 'relative', width: '100%' }}>
            <Input
              placeholder="Senha"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
              keyboardType="default"
              accessibilityLabel="Campo de senha"
              accessibilityHint="Digite sua senha para login"
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
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              accessibilityHint={showPassword ? 'Oculta o texto da senha' : 'Mostra o texto da senha'}
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

          {showError && error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginLeft: 32 }}>
          <TouchableOpacity onPress={() => setRememberEmail((prev) => !prev)} style={{ marginRight: 8 }}
            accessibilityLabel="Lembrar meu e-mail"
            accessibilityHint="Marque para salvar seu e-mail para próximos acessos"
          >
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
          disabled={loading}
          accessibilityLabel="Botão de login"
          accessibilityHint="Pressione para entrar no aplicativo"
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
  biometricContainer: {
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  biometricButtonDisabled: {
    opacity: 0.7,
  },
  biometricButtonText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  disableBiometryButton: {
    marginTop: 8,
    padding: 8,
    alignItems: 'center',
  },
  disableBiometryText: {
    color: colors.warning,
    fontSize: 14,
  },
  webMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    marginHorizontal: 32,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  webMessageText: {
    color: colors.warning,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default LoginScreen;

/*
  <TextInput placeholder="Username" onChangeText={setUsername} />
          <TextInput placeholder="Password" secureTextEntry={true} onChangeText={setPassword} />
          <Button title="Login" onPress={handleLogin} />
*/
