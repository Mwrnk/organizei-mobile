import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FlashCardsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Flash Cards</Text>
      <Text style={styles.description}>
        Pratique com cartões de memória gerados por IA
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

export default FlashCardsScreen; 