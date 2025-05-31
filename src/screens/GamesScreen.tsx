// Importações de bibliotecas React e React Native
import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

// Importações de contextos, estilos e componentes de navegação
import { useAuth } from '../contexts/AuthContext';
import { GlobalStyles } from '@styles/global';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';

// Importações de componentes e assets customizados
import ArrowBack from 'assets/icons/ArrowBack';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
import CapaFlashCards from 'assets/banners/capaFlashCards';
import RaioIcon from 'assets/icons/RaioIcon';

// Definição do tipo de navegação para tipagem do TypeScript
type GameStackNavigationProp = StackNavigationProp<RootTabParamList>;

const GamesScreen = () => {
  // Hooks para autenticação e navegação
  const { user } = useAuth();
  const navigation = useNavigation<GameStackNavigationProp>();

  return (
    <SafeAreaProvider>
      {/* Container principal com área segura para notch e barra de status */}
      <SafeAreaView style={GlobalStyles.container}>
        {/* Cabeçalho da tela */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Games</Text>
        </View>

        {/* Container principal dos cards de jogos */}
        <View style={styles.cardsContainer}>
          {/* Banner principal com background */}
          <ImageBackground
            source={require('../../assets/banners/bannerGames.png')}
            style={styles.mainCard}
          >
            <Text style={styles.mainCardTitle}>O que vai jogar hoje?</Text>
            {/* Container de pontuação com ícone */}
            <View style={styles.pointsContainer}>
              <RaioIcon color="#ffffff" size={16} />
              <Text style={styles.pointsText}>{user?.orgPoints || 0}pts</Text>
            </View>
          </ImageBackground>

          {/* Card do jogo Flash Cards */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('FlashCards')}>
            <View style={styles.gameIconContainer}>
              <CapaFlashCards size={130} />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Flash Cards</Text>
              <Text style={styles.gameDescription}>
                Perguntas geradas por IA com o tema da matéria escolhida.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card do jogo do Milhão */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('JogoDoMilhao')}>
            <View style={styles.gameIconContainer}>
              <CapaFlashCards size={130} />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Jogo do milhão</Text>
              <Text style={styles.gameDescription}>
                Inúmeras perguntas com temas diversos.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 130,
    gap: 1,
  },

  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 130,
    gap: 16,
    paddingHorizontal: 16,
  },

  header: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },

  headerTitle: {
    fontSize: 16,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },

  mainCard: {
    width: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 64,
    gap: 12,
    overflow: 'hidden',
    resizeMode: 'cover'
  },

  mainCardTitle: {
    color: 'white',
    fontFamily: fontNames.regular,
    fontSize: 24,
    fontWeight: 'bold',
  },

  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 61, 128, 0.1)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },

  pointsText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fontNames.regular,
  },

  // Estilos dos cards de jogos
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 61, 128, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },

  gameIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  gameIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 20,
    fontFamily: fontNames.bold,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: '#8E8E93',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },

  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#8E8E93',
  },
});

export default GamesScreen;
