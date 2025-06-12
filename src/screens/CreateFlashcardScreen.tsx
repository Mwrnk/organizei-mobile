import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlashcardService } from '../services/flashcardService';
import { CardService, Card } from '../services/cardService';
import api from '../services/api';
import { FormInput } from '../components/FormInput';
import { TagSelector } from '../components/TagSelector';
import { CardInfo } from '../components/CardInfo';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenTitle } from '../components/ScreenTitle';
import { FormContainer } from '../components/FormContainer';
import colors from '../styles/colors';
import { fontNames } from '../styles/fonts';

interface FormData {
  cardId: string;
  front: string;
  back: string;
  tags: string[];
}

export const CreateFlashcardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormData>({ cardId: '', front: '', back: '', tags: [] });
  const [validation, setValidation] = useState<{ isValid: boolean; errors: any }>({ isValid: false, errors: {} });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadCards();
    const fetchTags = async () => {
      try {
        const response = await api.get('/tags');
        setAvailableTags(response.data.tags || []);
      } catch (error) {
        setAvailableTags([]);
      }
    };
    fetchTags();
  }, []);

  const loadCards = async () => {
    try {
      setLoadingCards(true);
      await CardService.getUserCards();
      setLoadingCards(false);
    } catch (error) {
      setLoadingCards(false);
    }
  };

  const handleCardIdChange = async (cardId: string) => {
    setFormData(prev => ({ ...prev, cardId }));
    setValidation(prev => ({ ...prev, errors: { ...prev.errors, cardId: undefined } }));
    if (cardId.length === 24) {
      try {
        const card = await CardService.getCardById(cardId);
        setSelectedCard(card);
      } catch (error) {
        setSelectedCard(null);
      }
    } else {
      setSelectedCard(null);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const validateForm = (): boolean => {
    const errors: any = {};
    if (!formData.cardId) {
      errors.cardId = 'Digite o ID do card';
    } else if (formData.cardId.length !== 24) {
      errors.cardId = 'ID do card inválido';
    } else if (!selectedCard) {
      errors.cardId = 'Card não encontrado';
    }
    if (!formData.front.trim()) {
      errors.front = 'O conteúdo da frente é obrigatório';
    }
    if (formData.back && !formData.back.trim()) {
      errors.back = 'O conteúdo do verso não pode estar vazio';
    }
    if (selectedTags.length === 0) {
      errors.tags = 'Selecione pelo menos uma tag.';
    }
    setValidation({ isValid: Object.keys(errors).length === 0, errors });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await FlashcardService.createFlashcard({ ...formData, tags: selectedTags });
      Alert.alert('Sucesso', 'Flashcard criado com sucesso');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível criar o flashcard');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCards) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.button} />
      </View>
    );
  }

  return (
    <FormContainer style={{ backgroundColor: colors.background }}>
      <View style={styles.card}>
        <ScreenTitle title="Criar Flashcard Manualmente" style={styles.title} />
        <FormInput
          label="ID do Card *"
          value={formData.cardId}
          onChangeText={handleCardIdChange}
          placeholder="Digite o ID do card"
          autoCapitalize="none"
          error={validation.errors.cardId}
          style={styles.input}
        />
        {selectedCard && <CardInfo card={selectedCard} />}
        <FormInput
          label="Conteúdo da Frente *"
          value={formData.front}
          onChangeText={(text) => setFormData({ ...formData, front: text })}
          placeholder="Digite o conteúdo da frente do flashcard"
          multiline
          error={validation.errors.front}
          style={styles.input}
        />
        <FormInput
          label="Conteúdo do Verso"
          value={formData.back}
          onChangeText={(text) => setFormData({ ...formData, back: text })}
          placeholder="Digite o conteúdo do verso do flashcard (opcional)"
          multiline
          error={validation.errors.back}
          style={styles.input}
        />
        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          error={validation.errors.tags}
        />
        <PrimaryButton
          title="Criar Flashcard"
          onPress={handleSubmit}
          loading={loading}
          style={styles.saveButton}
        />
      </View>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
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
  saveButton: {
    marginTop: 20,
    borderRadius: 12,
    height: 50,
  },
}); 