import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CardService, Card } from '../services/cardService';

const CardsScreen = () => {
  const navigation = useNavigation();
  const [cards, setCards] = React.useState<Card[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await CardService.getUserCards();
      setCards(data);
    } catch (error) {
      console.error('Erro ao carregar cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = () => {
    navigation.navigate('CreateCard' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cards</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCard}
        >
          <Text style={styles.createButtonText}>Criar Novo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando cards...</Text>
        ) : cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Você ainda não tem cards.
            </Text>
            <Text style={styles.emptyStateSubText}>
              Crie seu primeiro card para começar a praticar!
            </Text>
          </View>
        ) : (
          cards.map((card) => (
            <TouchableOpacity
              key={card._id}
              style={styles.cardItem}
              onPress={() => {/* Implementar visualização do card */}}
            >
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.content && (
                <Text style={styles.cardContent} numberOfLines={2}>
                  {card.content}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
  },
});

export default CardsScreen; 