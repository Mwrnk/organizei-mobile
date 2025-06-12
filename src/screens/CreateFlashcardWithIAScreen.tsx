import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { ScreenTitle } from '../components/ScreenTitle';
import { FormContainer } from '../components/FormContainer';
import colors from '../styles/colors';
import { fontNames } from '../styles/fonts';

const CreateFlashcardWithIAScreen = () => {
  const navigation = useNavigation();
  const [cardId, setCardId] = useState('');
  const [amount, setAmount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);

  const handleCreate = async () => {
    if (!cardId || !amount) {
      setError('Preencha o ID do card e a quantidade.');
      return;
    }
    setLoading(true);
    setError(null);
    setFlashcards([]);
    try {
      const response = await api.post('/flashcards/withAI', {
        cardId,
        amount: Number(amount)
      });
      if (response.data?.status === 'success' && Array.isArray(response.data.data.flashcards)) {
        setFlashcards(response.data.data.flashcards);
        Alert.alert('Sucesso', 'Flashcards criados com sucesso!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('FlashCards'),
          },
        ]);
      } else {
        setError('Resposta inválida da API');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar flashcards com IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer style={{ backgroundColor: colors.background }}>
      <View style={styles.card}>
        <ScreenTitle title="Criar Flashcards com IA" style={styles.title} />
        <TextInput
          value={cardId}
          onChangeText={setCardId}
          placeholder="ID do Card"
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Quantidade de flashcards"
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.iaButton} onPress={handleCreate} disabled={loading}>
          <Text style={styles.iaButtonText}>{loading ? 'Gerando...' : 'Gerar Flashcards'}</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator style={{ marginVertical: 16 }} color={colors.button} />}
        {error && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={flashcards}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.flashcard}>
              <Text style={styles.question}>{item.front}</Text>
              <Text style={styles.answer}>{item.back}</Text>
              <View style={styles.tags}>
                {item.tags.map((tag: any) => (
                  <Text key={tag._id || tag} style={styles.tag}>{tag.name || tag}</Text>
                ))}
              </View>
            </View>
          )}
          ListEmptyComponent={!loading && (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
              Nenhum flashcard gerado ainda.
            </Text>
          )}
        />
      </View>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: fontNames.bold,
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    fontFamily: fontNames.regular,
    fontSize: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    color: colors.primary,
  },
  iaButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flashcard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0e0e0',
    padding: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CreateFlashcardWithIAScreen; 