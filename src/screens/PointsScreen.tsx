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
import ArrowDiag from 'assets/icons/ArrowDiag';
import GameIcon from 'assets/icons/GamesIcon';
type PointsScreenNavigationProp = StackNavigationProp<RootTabParamList>;

const PointsScreen = () => {
  const navigation = useNavigation<PointsScreenNavigationProp>();
  const { user } = useAuth();

  const handleExchangePoints = () => {
    navigation.navigate('Plan');
  };


  const handleNavigateToGames = () => {
    navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowBack color={colors.primary} size={28} />
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
            <Text style={styles.pointsDescription}>por resposta correta em quiz/flashcard</Text>
          </View>

          <View style={styles.pointsRow}>
            <RaioIcon color={colors.primary} size={16} />
            <Text style={styles.pointsText}>+1 ponto</Text>
            <Text style={styles.pointsDescription}>por curtida recebida em um card criado</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
            <CustomButton
                title="Trocar meus pontos"
                variant="primary"
                style={styles.primaryButton}
                textStyle={styles.txtButtonPrimary}
                onPress={handleExchangePoints}
                
            />

            <CustomButton
                title="Ir para os games"
                variant="secondary"
                style={styles.secondaryButton}
                textStyle={styles.txtButtonSecondary}
                onPress={handleNavigateToGames}
                icon={<GameIcon color={colors.primary} size={24} />}
                iconPosition="left"
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

  buttonContainer: {
    position: 'absolute',
    bottom: 115,
    left: 16,
    right: 16,
    flexDirection: 'column',
    gap: 12,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 999,
    paddingVertical: 20,  
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  txtButton: {
    fontSize: 12,
    fontFamily: fontNames.bold,
    color: '#fff',
  },

  pointsMainContainer: {
    alignItems: 'center',
    marginTop: 60,
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
    marginTop: 64,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
    marginLeft: 6,
    marginBottom: 16,
  },
  pointsCard: {
    borderRadius: 24,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 61, 128, 0.1)',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
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
  txtButtonPrimary: {
    color: '#fff',
  },
  
  txtButtonSecondary: {
    color: colors.primary,
  },
});

export default PointsScreen; 