import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GlobalStyles } from '@styles/global';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Input from '@components/Input';
import CustomButton from '@components/CustomButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';
import axios from 'axios';

interface RegisterScreenProps {
  navigation: StackNavigationProp<RootTabParamList, 'Register'>;
}

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name || !dateOfBirth || !email || !password) {
      setError('Por favor, preencha todos os campos');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        coduser: email.split('@')[0],
        name,
        dateOfBirth,
        email,
        password,
        role: 'user',
      };
      await axios.post('http://localhost:3000/signup', payload);
      setLoading(false);
      navigation.navigate('Login');
    } catch (err: any) {
      setError('Falha ao registrar. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={GlobalStyles.container}>
        <View style={styles.logoContainer}>
          <Text style={GlobalStyles.title}>Organiz<span style={{fontWeight: 'bold'}}>ei</span></Text>
        </View>
        <View style={styles.welcomeContainer}>
          <Text style={GlobalStyles.title2}>Bem-vindo{`\n`}novato!</Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            placeholder="Usuário da Silva"
            onChangeText={setName}
            value={name}
          />
          <Input
            placeholder="06-12-2004"
            onChangeText={setDateOfBirth}
            value={dateOfBirth}
          />
          <Input
            placeholder="usuario@example.com"
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="**********"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        <CustomButton
          title="Avançar"
          loading={loading}
          onPress={handleRegister}
          buttonStyle={styles.registerButton}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  welcomeContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  formContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 24,
    gap: 16,
  },
  registerButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default RegisterScreen; 
