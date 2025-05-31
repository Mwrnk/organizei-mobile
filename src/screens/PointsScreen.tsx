import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
import ArrowBack from 'assets/icons/ArrowBack';
import RaioIcon from 'assets/icons/RaioIcon';
import CustomButton from '@components/CustomButton';

type PointsScreenNavigationProp = StackNavigationProp<RootTabParamList>;

const PointsScreen = () => {
  const navigation = useNavigation<PointsScreenNavigationProp>();
  const { user } = useAuth();

  const handleExchangePoints = () => {
    navigation.navigate('Plan');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowBack color="#222" size={16} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Pontos</Text>
        <View style={{ width: 24 }} /> {/* Espaçador para centralizar título */}
      </View>

      {/* Container de pontuação principal */}
      <View style={styles.pointsMainContainer}>
        <RaioIcon color="#007AFF" size={32} />
        <Text style={styles.pointsValue}>{user?.orgPoints || 0}</Text>
        <Text style={styles.pointsLabel}>pontos acumulados</Text>
      </View>

      {/* Seção de como ganhar pontos */}
      <View style={styles.howToContainer}>
        <Text style={styles.sectionTitle}>Como ganhar pontos?</Text>
        
        <View style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <RaioIcon color={colors.primary} size={16} />
            <Text style={styles.pointsText}>+10 pontos</Text>
            <Text style={styles.pointsDescription}>por FlashCard completado</Text>
          </View>

          <View style={styles.pointsRow}>
            <RaioIcon color={colors.primary} size={16} />
            <Text style={styles.pointsText}>+50 pontos</Text>
            <Text style={styles.pointsDescription}>por vitória no Jogo do Milhão</Text>
          </View>

          <View style={styles.pointsRow}>
            <RaioIcon color={colors.primary} size={16} />
            <Text style={styles.pointsText}>+5 pontos</Text>
            <Text style={styles.pointsDescription}>por card criado</Text>
          </View>
        </View>

        <CustomButton
              title="TROCAR MEUS PONTOS"
              variant="primary"
              style={styles.button}
              textStyle={styles.txtButton}
              onPress={handleExchangePoints}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  txtButton: {
    fontSize: 12,
    fontFamily: fontNames.bold,
    color: '#fff',
  },

  pointsMainContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  pointsValue: {
    fontSize: 48,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: '#8E8E93',
  },
  howToContainer: {
    marginTop: 48,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontNames.bold,
    color: colors.primary,
    marginBottom: 16,
  },
  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 61, 128, 0.1)',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontSize: 14,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  pointsDescription: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontNames.regular,
    color: '#8E8E93',
  },
});

export default PointsScreen; 