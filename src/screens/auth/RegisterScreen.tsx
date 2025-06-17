import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { GlobalStyles } from '@styles/global';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Input from '@components/Input';
import CustomButton from '@components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../../navigation/types';
import api from '../../services/api';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@contexts/AuthContext';

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
  const [coduserError, setCoduserError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [coduserStatus, setCoduserStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'error'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>();
  const { login } = useAuth();

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

  // Função para abrir o date picker
  const openDatePicker = () => setShowDatePicker(true);

  // Função para lidar com a seleção da data
  const handleDateChangePicker = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('pt-BR');
      setDateOfBirthFormatted(formatted);
      setDateOfBirth(selectedDate.toISOString().split('T')[0]);
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
    console.log('handleRegister chamado');
    if (!validateEtapa2()) {
      console.log('Validação da etapa 2 falhou');
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

      console.log('Enviando payload para /signup:', payload);
      const response = await api.post('/signup', payload);
      console.log('Resposta da API:', response.data);

      // Login automático após cadastro
      console.log('Tentando login automático com:', payload.email, payload.password);
      await login(payload.email, payload.password);
      limparCampos();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Escolar' }],
      });
    } catch (err: any) {
      setLoading(false);
      console.log('Erro ao cadastrar:', err);
      const apiMessage = err.response?.data?.message || '';
      if (apiMessage.includes('código de usuário') || apiMessage.includes('nickname')) {
        setCoduserError('Nickname em uso, por favor, escolha outro nickname.');
      } else if (apiMessage.includes('email')) {
        setEmailError('E-mail em uso, por favor, escolha outro e-mail.');
      } else {
        setError(apiMessage || 'Erro ao criar conta.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (etapa === 1) {
      proximaEtapa();
    } else {
      handleRegister();
    }
  };

  const checkCoduser = async () => {
    setCoduserStatus('checking');
    try {
      const res = await api.get(`/users/check-nickname?coduser=${encodeURIComponent(coduser.trim())}`);
      if (res.data.available) {
        setCoduserStatus('valid');
      } else {
        setCoduserStatus('invalid');
      }
    } catch (err) {
      setCoduserStatus('error');
    }
  };

  const checkEmail = async () => {
    setEmailStatus('checking');
    try {
      const res = await api.get(`/users/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      if (res.data.available) {
        setEmailStatus('valid');
      } else {
        setEmailStatus('invalid');
      }
    } catch (err) {
      setEmailStatus('error');
    }
  };

  const isFormValid =
    name.trim().length >= 3 &&
    name.trim().length <= 50 &&
    /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim()) &&
    password.length >= 8 &&
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) &&
    dateOfBirthFormatted.length === 10 &&
    isValidDate(dateOfBirthFormatted);

  // Funções para checar requisitos da senha
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const passwordChecklist = [
    { label: 'Mínimo 8 caracteres', valid: hasMinLength },
    { label: 'Pelo menos uma letra maiúscula', valid: hasUppercase },
    { label: 'Pelo menos uma letra minúscula', valid: hasLowercase },
    { label: 'Pelo menos um número', valid: hasNumber },
  ];

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
              <Text style={styles.title}>Crie sua conta</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Input
                  style={{ flex: 1 }}
                  placeholder="Nickname (ex: joaosilva)"
                  value={coduser}
                  onChangeText={(text) => {
                    setCoduser(text);
                    setCoduserStatus('idle');
                  }}
                  autoCapitalize="none"
                  maxLength={20}
                />
                <TouchableOpacity onPress={checkCoduser} style={{ marginLeft: 8 }}>
                  <Ionicons
                    name={
                      coduserStatus === 'valid'
                        ? 'checkmark-circle'
                        : coduserStatus === 'invalid'
                        ? 'close-circle'
                        : 'help-circle-outline'
                    }
                    size={24}
                    color={
                      coduserStatus === 'valid'
                        ? 'green'
                        : coduserStatus === 'invalid'
                        ? 'red'
                        : '#888'
                    }
                  />
                </TouchableOpacity>
              </View>
              {coduserStatus === 'valid' && (
                <Text style={[styles.rulesText, { color: 'green' }]}>Nickname válido!</Text>
              )}
              {coduserStatus === 'invalid' && (
                <Text style={[styles.rulesText, { color: 'red' }]}>Nickname em uso, por favor, escolha outro.</Text>
              )}
              {coduserStatus === 'error' && (
                <Text style={[styles.rulesText, { color: 'red' }]}>Erro ao verificar nickname.</Text>
              )}
              <Text style={styles.rulesText}>
                • 4 a 20 caracteres, apenas letras e números (sem espaços ou símbolos)
              </Text>
              <CustomButton
                title="Próxima"
                onPress={proximaEtapa}
                disabled={coduserStatus !== 'valid'}
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}
            </>
          )}

          {etapa === 2 && (
            <>
              <Input
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={50}
              />
              <Text style={styles.rulesText}>
                • 3 a 50 caracteres, apenas letras e espaços
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Input
                  style={{ flex: 1 }}
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailStatus('idle');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity onPress={checkEmail} style={{ marginLeft: 8 }}>
                  <Ionicons
                    name={
                      emailStatus === 'valid'
                        ? 'checkmark-circle'
                        : emailStatus === 'invalid'
                        ? 'close-circle'
                        : 'help-circle-outline'
                    }
                    size={24}
                    color={
                      emailStatus === 'valid'
                        ? 'green'
                        : emailStatus === 'invalid'
                        ? 'red'
                        : '#888'
                    }
                  />
                </TouchableOpacity>
              </View>
              {emailStatus === 'valid' && (
                <Text style={[styles.rulesText, { color: 'green' }]}>E-mail válido!</Text>
              )}
              {emailStatus === 'invalid' && (
                <Text style={[styles.rulesText, { color: 'red' }]}>E-mail em uso, por favor, escolha outro.</Text>
              )}
              {emailStatus === 'error' && (
                <Text style={[styles.rulesText, { color: 'red' }]}>Erro ao verificar e-mail.</Text>
              )}
              <Text style={styles.rulesText}>
                • Deve ser um email válido e não pode já estar cadastrado
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Input
                  style={{ flex: 1 }}
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  maxLength={32}
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={{ marginLeft: 8 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 8, marginBottom: 4 }}>
                {passwordChecklist.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Ionicons
                      name={item.valid ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={item.valid ? 'green' : '#bbb'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{ color: item.valid ? 'green' : '#888', fontSize: 13 }}>{item.label}</Text>
                  </View>
                ))}
              </View>
              {Platform.OS === 'web' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => {
                      setDateOfBirth(e.target.value);
                      const [year, month, day] = e.target.value.split('-');
                      setDateOfBirthFormatted(`${day}/${month}/${year}`);
                    }}
                    style={{ flex: 1, fontSize: 16, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Ionicons name="calendar" size={22} color="#888" style={{ marginLeft: 8 }} />
                </View>
              ) : (
                <TouchableOpacity onPress={openDatePicker} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 4 }}>
                  <Ionicons name="calendar" size={22} color="#888" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 16, color: dateOfBirthFormatted ? '#181818' : '#888' }}>
                    {dateOfBirthFormatted || 'Data de nascimento (DD/MM/AAAA)'}
                  </Text>
                </TouchableOpacity>
              )}
              {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01')}
                  mode="date"
                  display="default"
                  onChange={handleDateChangePicker}
                  maximumDate={new Date()}
                />
              )}
              <Text style={styles.rulesText}>
                • Idade mínima: 13 anos. Apenas datas válidas.
              </Text>
              <CustomButton
                title="Cadastrar"
                onPress={handleRegister}
                loading={loading}
                disabled={emailStatus !== 'valid' || !isFormValid}
              />
              <TouchableOpacity onPress={etapaAnterior} style={{ marginTop: 12 }}>
                <Text style={{ color: colors.primary, textAlign: 'center' }}>Voltar</Text>
              </TouchableOpacity>
              {!!error && <Text style={styles.errorText}>{error}</Text>}
            </>
          )}
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
    color: 'red',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  dateHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  rulesText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 4,
    marginTop: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default RegisterScreen;
