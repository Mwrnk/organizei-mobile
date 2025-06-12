import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActionSheetIOS,
  Platform,
  ScrollView,
} from 'react-native';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import UserController from '../controllers/UserController';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { convertImageToBase64 } from '../utils/imageUtils';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUserData } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados de erro
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [dateError, setDateError] = useState('');

  // Funções de validação
  const validateName = (value: string) => {
    if (!value) return '';
    if (value.length < 3 || value.length > 50) return 'O nome deve ter entre 3 e 50 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'O nome deve conter apenas letras e espaços';
    return '';
  };
  const validateEmail = (value: string) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Email inválido';
    return '';
  };
  const validatePassword = (value: string) => {
    if (!value) return '';
    if (value.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
      return 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número';
    return '';
  };
  const validateDate = (date: Date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (isNaN(birthDate.getTime())) return 'Data de nascimento inválida';
    if (age < 13) return 'Você deve ter pelo menos 13 anos';
    if (age > 120) return 'Data de nascimento inválida';
    return '';
  };

  // Handlers com validação em tempo real
  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(validateName(value));
  };
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };
  const handleDateChange = (date: Date) => {
    setDateOfBirth(date);
    setDateError(validateDate(date));
  };

  // Função para solicitar permissões
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Precisamos de acesso à câmera e galeria para alterar sua foto de perfil.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Função para abrir a câmera
  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfileImageWithUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir câmera:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  // Função para abrir a galeria
  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfileImageWithUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  // Função para atualizar a foto de perfil
  const updateProfileImageWithUri = async (imageUriOrBase64: string) => {
    if (!user) return;

    setLoading(true);
    try {
      let base64Image: string;
      if (Platform.OS === 'web') {
        // Já é base64 (data:image/...) vindo do FileReader
        base64Image = imageUriOrBase64;
      } else {
        // Precisa converter usando expo-file-system
        base64Image = await convertImageToBase64(imageUriOrBase64);
      }

      const updatedUser = await UserController.updateProfileImage(user._id, base64Image);
      console.log('Resposta do servidor:', updatedUser);
      if (updatedUser) {
        setProfileImage(updatedUser.profileImage);
        await updateUserData(updatedUser);
        Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
      } else {
        console.error('Erro: Usuário não atualizado');
        Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
      }
    } catch (error) {
      console.error('Erro detalhado ao atualizar foto de perfil:', error);
      Alert.alert(
        'Erro',
        'Não foi possível atualizar a foto de perfil. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para mostrar opções de mudança de foto
  const handleChangeProfileImage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openGallery();
          }
        }
      );
    } else {
      Alert.alert('Alterar Foto de Perfil', 'Escolha uma opção:', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tirar Foto', onPress: openCamera },
        { text: 'Escolher da Galeria', onPress: openGallery },
      ]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updatePayload: any = { name, email };
      if (password) updatePayload.password = password;
      if (dateOfBirth) updatePayload.dateOfBirth = dateOfBirth.toISOString();

      const updated = await UserController.updateUser(user._id, updatePayload);
      if (updated) {
        await updateUserData(updated);
        Alert.alert('Perfil atualizado com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro ao atualizar perfil');
      }
    } catch (e) {
      Alert.alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImageWeb = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await updateProfileImageWithUri(base64); // já está no formato data:image/jpeg;base64,...
    };
    reader.readAsDataURL(file);
  };

  // Função para checar se pode salvar
  const canSave = () => {
    // Só valida campos que o usuário alterou (não obriga todos)
    const nameValid = !nameError && name.length > 0;
    const emailValid = !emailError && email.length > 0;
    const passwordValid = !passwordError;
    const dateValid = !dateError && dateOfBirth;
    // Só bloqueia se algum campo alterado estiver inválido
    return nameValid && emailValid && passwordValid && dateValid;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informações Pessoais</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Foto de perfil */}
      <View style={styles.avatarBox}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
          </View>
        )}
        {Platform.OS === 'web' ? (
          <>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="web-profile-image-input"
              onChange={handlePickImageWeb}
            />
            <TouchableOpacity
              onPress={() =>
                (document.getElementById('web-profile-image-input') as HTMLInputElement)?.click()
              }
            >
              <Ionicons name="camera-outline" size={22} color="#181818" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.fabEditAvatar}
            onPress={handleChangeProfileImage}
            disabled={loading}
          >
            <Ionicons name="camera-outline" size={22} color="#181818" />
          </TouchableOpacity>
        )}
      </View>

      {/* Nome */}
      <Text style={styles.label}>Nome Completo</Text>
      <View style={[styles.inputBox, nameError ? styles.inputBoxError : null]}>
        <Ionicons name="person-outline" size={22} color={colors.button} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={handleNameChange}
          placeholder="Nome Completo"
          placeholderTextColor="#aaa"
        />
      </View>
      <Text style={styles.helperText}>Entre 3 e 50 caracteres, apenas letras e espaços.</Text>
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <View style={[styles.inputBox, emailError ? styles.inputBoxError : null]}>
        <MaterialIcons name="email" size={22} color={colors.button} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={handleEmailChange}
          placeholder="Email"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
        />
      </View>
      <Text style={styles.helperText}>
        Digite um email válido. Não pode estar em uso por outro usuário.
      </Text>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Senha */}
      <Text style={styles.label}>Senha</Text>
      <View style={[styles.inputBox, passwordError ? styles.inputBoxError : null]}>
        <Ionicons
          name="lock-closed-outline"
          size={22}
          color={colors.button}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="**********"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#888"
            style={styles.inputIconRight}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>
        Mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula e um número.
      </Text>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {/* Data de Nascimento */}
      <Text style={styles.label}>Data de Nascimento</Text>
      <View style={[styles.inputBox, dateError ? styles.inputBoxError : null]}>
        <Ionicons
          name="calendar-outline"
          size={22}
          color={colors.button}
          style={styles.inputIcon}
        />
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={dateOfBirth.toISOString().slice(0, 10)}
            onChange={(e) => {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) handleDateChange(date);
            }}
            style={{
              flex: 1,
              fontSize: 15,
              fontFamily: fontNames.regular,
              color: colors.primary,
              padding: 6,
              border: 'none',
              background: 'transparent',
            }}
          />
        ) : (
          <>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDatePicker(true)}>
              <Text style={{ fontSize: 15, color: colors.primary }}>
                {dateOfBirth.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) handleDateChange(selectedDate);
                }}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
      </View>
      <Text style={styles.helperText}>Você deve ter entre 13 e 120 anos.</Text>
      {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

      {/* Botão */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading || !canSave()}
      >
        <Ionicons name="create-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.saveBtnText}>{loading ? 'Salvando...' : 'Editar perfil'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontNames.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  avatarBox: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontFamily: fontNames.bold,
    color: '#fff',
  },
  fabEditAvatar: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontFamily: fontNames.regular,
    color: colors.primary,
    fontSize: 15,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EAEAEA',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputIconRight: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontNames.regular,
    color: colors.primary,
    paddingVertical: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 24,
    marginBottom: 18,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontNames.bold,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputBoxError: {
    borderColor: '#e53935',
  },
  errorText: {
    color: '#e53935',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
});
