import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import UserController from '../controllers/UserController';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Placeholders para simular troca de imagem
  const handleChangeProfileImage = () => {
    setProfileImage('https://via.placeholder.com/120x120?text=Nova+Foto');
    Alert.alert('Foto de perfil alterada! (dummy)');
  };
  const handleChangeBackground = () => {
    setBackgroundImage('https://via.placeholder.com/400x140?text=Novo+Background');
    Alert.alert('Background alterado! (dummy)');
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await UserController.updateUser(user._id, { name, email });
      if (updated) {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informações Pessoais</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Background */}
      <View style={styles.backgroundBox}>
        <Image
          source={{ uri: backgroundImage || 'https://via.placeholder.com/400x140?text=Background' }}
          style={styles.backgroundImg}
        />
        <TouchableOpacity style={styles.fabEditBg} onPress={handleChangeBackground}>
          <Ionicons name="camera-outline" size={22} color="#181818" />
        </TouchableOpacity>
      </View>

      {/* Foto de perfil */}
      <View style={styles.avatarBox}>
        <Image
          source={{ uri: profileImage || 'https://via.placeholder.com/120x120?text=Avatar' }}
          style={styles.avatarImg}
        />
        <TouchableOpacity style={styles.fabEditAvatar} onPress={handleChangeProfileImage}>
          <Ionicons name="camera-outline" size={22} color="#181818" />
        </TouchableOpacity>
      </View>

      {/* Nome */}
      <Text style={styles.label}>Nome Completo</Text>
      <View style={styles.inputBox}>
        <Ionicons name="person-outline" size={22} color={colors.button} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nome Completo"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputBox}>
        <MaterialIcons name="email" size={22} color={colors.button} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
        />
      </View>

      {/* Senha */}
      <Text style={styles.label}>Senha</Text>
      <View style={styles.inputBox}>
        <Ionicons
          name="lock-closed-outline"
          size={22}
          color={colors.button}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
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

      {/* Botão */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        <Ionicons name="create-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.saveBtnText}>{loading ? 'Salvando...' : 'Editar perfil'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 18,
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
  backgroundBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  backgroundImg: {
    width: 340,
    height: 120,
    borderRadius: 18,
    backgroundColor: '#eee',
  },
  fabEditBg: {
    position: 'absolute',
    right: 24,
    bottom: 12,
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
  avatarBox: {
    alignItems: 'center',
    marginTop: -60,
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
});
