import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '@styles/global';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Input from '@components/Input';
import CustomButton from '@components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';
import api from '../services/api';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';

const RegisterScreen = () => {
  const [etapa, setEtapa] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfBirthFormatted, setDateOfBirthFormatted] = useState('');
  const [coduser, setCoduser] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>();

  // Função para formatar a data enquanto o usuário digita (DD/MM/YYYY)
  const formatDateInput = (text: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = text.replace(/\D/g, '');

    // Aplica a máscara DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para converter DD/MM/YYYY para YYYY-MM-DD
  const convertDateToISO = (dateStr: string): string => {
    if (!dateStr || dateStr.length !== 10) return '';

    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Função para validar se a data é válida
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr || dateStr.length !== 10) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  // Handler para mudança na data
  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDateOfBirthFormatted(formatted);

    // Se a data estiver completa (DD/MM/YYYY), converte para ISO
    if (formatted.length === 10) {
      const isoDate = convertDateToISO(formatted);
      setDateOfBirth(isoDate);
    } else {
      setDateOfBirth('');
    }
  };

  const limparCampos = () => {
    setCoduser('');
    setName('');
    setEmail('');
    setPassword('');
    setDateOfBirth('');
    setDateOfBirthFormatted('');
    setError('');
  };

  const etapaAnterior = () => {
    setEtapa(etapa - 1);
    setError('');
  };

  const proximaEtapa = () => {
    if (!coduser.trim()) {
      setError('Por favor, digite seu nickname');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setEtapa(etapa + 1);
    setError('');
  };

  const validateEtapa2 = () => {
    if (!name.trim()) {
      setError('Por favor, digite seu nome completo');
      return false;
    }

    if (!email.trim()) {
      setError('Por favor, digite seu email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    if (!password.trim()) {
      setError('Por favor, digite uma senha');
      return false;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (!dateOfBirthFormatted.trim()) {
      setError('Por favor, selecione sua data de nascimento');
      return false;
    }

    if (dateOfBirthFormatted.length !== 10) {
      setError('Digite a data completa (DD/MM/YYYY)');
      return false;
    }

    if (!isValidDate(dateOfBirthFormatted)) {
      setError('Data de nascimento inválida');
      return false;
    }

    // Verificar idade mínima (13 anos)
    const [day, month, year] = dateOfBirthFormatted.split('/').map(Number);
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      age < 13 ||
      (age === 13 && monthDiff < 0) ||
      (age === 13 && monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      setError('Você deve ter pelo menos 13 anos para se registrar');
      return false;
    }

    return true;
  };

  const handleDateConfirm = (date: Date) => {
    const formatted = date.toLocaleDateString('pt-BR');
    const isoDate = date.toISOString().split('T')[0];
    setDateOfBirth(isoDate);
    setDatePickerVisibility(false);
    setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
  };

  const handleRegister = async () => {
    if (!validateEtapa2()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar payload com validação
      const payload = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        dateOfBirth: dateOfBirth,
        coduser: coduser.trim(),
      };

      const response = await api.post('/signup', payload);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Conta criada! 🎉',
        `Bem-vindo, ${response.data.name}! Sua conta foi criada com sucesso.`,
        [
          {
            text: 'Continuar',
            onPress: () => {
              // Voltar para a tela de login automaticamente
              limparCampos();
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('RegisterScreen - Erro ao registrar:', error);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Tratamento de erros específicos
      let errorMessage = 'Erro inesperado. Tente novamente.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      }

      Alert.alert('Erro no cadastro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (etapa === 1) {
      proximaEtapa();
    } else {
      handleRegister();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={GlobalStyles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {etapa > 1 && (
              <TouchableOpacity onPress={etapaAnterior} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerCenter}>
            <Text style={GlobalStyles.title}>organiz.ei</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.etapaText}>{etapa}/2</Text>
          </View>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={GlobalStyles.title2}>Bem-vindo{'\n'}novato!</Text>
          <Text style={styles.subtitle}>
            {etapa === 1 ? 'Primeiro, escolha seu nickname' : 'Agora, complete seus dados'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {etapa === 1 && (
            <>
              <Input
                placeholder="Nickname"
                value={coduser}
                onChangeText={setCoduser}
                autoCapitalize="none"
                autoComplete="username"
              />
            </>
          )}

          {etapa === 2 && (
            <>
              <Input
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Input
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
              <Input
                placeholder="Data de nascimento (DD/MM/YYYY)"
                value={dateOfBirthFormatted}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.dateHint}>💡 Exemplo: 15/03/1995</Text>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.navigationContainer}>
          <Text style={GlobalStyles.textSmall}>Já tem uma conta? </Text>
          <Text
            style={GlobalStyles.textLink}
            onPress={() => {
              limparCampos();
              navigation.navigate('Login');
            }}
          >
            Faça login
          </Text>
        </View>

        <CustomButton
          title={loading ? 'Processando...' : etapa === 1 ? 'Próximo' : 'Registrar'}
          loading={loading}
          onPress={handleSubmit}
          buttonStyle={styles.submitButton}
          disabled={loading}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
  },
  etapaText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  welcomeContainer: {
    marginBottom: 32,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  formContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 24,
    gap: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitButton: {
    width: '80%',
    alignSelf: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  dateHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
});

export default RegisterScreen;
