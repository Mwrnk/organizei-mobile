import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SelectFlashcardModeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Como deseja criar seu flashcard?</Text>
    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => navigation.navigate('CreateFlashcardWithIA')}
    >
      <Text style={styles.optionText}>Criar com IA</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => navigation.navigate('CreateFlashcardManual')}
    >
      <Text style={styles.optionText}>Criar manualmente</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 32 },
  optionButton: {
    backgroundColor: '#2196f3',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: 250,
    alignItems: 'center',
  },
  optionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SelectFlashcardModeScreen; 