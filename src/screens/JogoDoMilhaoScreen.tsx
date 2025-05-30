import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArrowBack from 'assets/icons/ArrowBack';

const JogoDoMilhaoScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <ArrowBack color="#222" size={16}/>
          <Text style={styles.headerTitle}>Games</Text>
          <ArrowBack color="transparent" size={16}/>
      </View>
      
      <Text style={styles.title}>Jogo do Milhão</Text>
      <Text style={styles.description}>
        Teste seus conhecimentos e ganhe pontos respondendo perguntas
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});

export default JogoDoMilhaoScreen; 