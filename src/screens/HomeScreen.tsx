import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { GlobalStyles } from '@styles/global';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootTabParamList } from '../navigation/types';
import ArrowBack from 'assets/icons/ArrowBack';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
type GameStackNavigationProp = StackNavigationProp<RootTabParamList>;

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<GameStackNavigationProp>();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={GlobalStyles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Games</Text>
        </View>

        <View style={styles.cardsContainer}>
          <ImageBackground
            source={require('../../assets/banners/bannerGames.png')}
            style={styles.mainCard}
          >
            <Text style={styles.mainCardTitle}>O que vai jogar hoje?</Text>
            <View style={styles.pointsContainer}>
              <Ionicons name="flash" size={20} color="white" />
              <Text style={styles.pointsText}>30pts</Text>
            </View>
          </ImageBackground>

          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('FlashCards')}>
            <View style={styles.gameIconContainer}>
              <Text style={styles.gameIcon}>?</Text>
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>Flash Cards</Text>
              <Text style={styles.gameDescription}>
                Perguntas geradas por IA com o tema da matéria escolhida
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('JogoDoMilhao')}>
            <View style={styles.gameIconContainer}>
              <Text style={styles.gameIcon}>?</Text>
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

  gameCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 61, 128, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },

  gameIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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

export default HomeScreen;
