import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Button, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FlashcardService } from '../services/flashcardService';
import { Flashcard } from '../models/Flashcard';

const FlashCardsScreen = () => {
  const navigation = useNavigation<any>();
  const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFlashcard, setSelectedFlashcard] = React.useState<Flashcard | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [showBack, setShowBack] = React.useState(false);
  const [iaLoading, setIaLoading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const data = await FlashcardService.getUserFlashcards();
      setFlashcards(data);
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlashcard = () => {
    navigation.navigate('CreateFlashcard');
  };

  const openFlashcard = (flashcard: Flashcard) => {
    setSelectedFlashcard(flashcard);
    setShowBack(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowBack(false);
    setSelectedFlashcard(null);
  };

  const handleGenerateWithIA = async () => {
    if (!selectedFlashcard) return;
    setIaLoading(true);
    setTimeout(() => {
      setSelectedFlashcard((prev) => prev ? {
        ...prev,
        front: `Pergunta gerada pela IA a partir do PDF do card ${prev.cardId}`,
        back: `Resposta gerada pela IA a partir do PDF do card ${prev.cardId}`
      } : prev);
      setIaLoading(false);
    }, 1500);
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    console.log('Tentando excluir flashcard:', flashcardId);
    Alert.alert(
      'Excluir flashcard',
      'Tem certeza que deseja excluir este flashcard? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive', onPress: async () => {
            setDeletingId(flashcardId);
            setFlashcards((prev) => prev.filter(f => f._id !== flashcardId));
            closeModal();
            try {
              await FlashcardService.deleteFlashcard(flashcardId);
              console.log('Excluído do backend:', flashcardId);
              Alert.alert('Excluído', 'Flashcard excluído com sucesso!');
            } catch (error: any) {
              console.error('Erro ao excluir:', error && error.response && error.response.data ? error.response.data : error);
              Alert.alert('Erro', 'Não foi possível excluir o flashcard no servidor. Atualizando lista...');
              await loadFlashcards();
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flash Cards</Text>
      </View>

      {/* Botões de criação manual e IA */}
      <View style={styles.modeButtonsContainer}>
        <TouchableOpacity
          style={[styles.modeButton, { backgroundColor: '#2196f3' }]}
          onPress={() => navigation.navigate('CreateFlashcardManual')}
        >
          <Text style={styles.modeButtonText}>Criar flashcard manualmente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, { backgroundColor: '#4caf50' }]}
          onPress={() => navigation.navigate('CreateFlashcardWithIA')}
        >
          <Text style={styles.modeButtonText}>Criar flashcard com IA</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando flashcards...</Text>
        ) : flashcards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Você ainda não tem flashcards.
            </Text>
            <Text style={styles.emptyStateSubText}>
              Crie seu primeiro flashcard para começar a praticar!
            </Text>
          </View>
        ) : (
          flashcards.map((flashcard) => (
            <View key={flashcard._id} style={styles.flashcardItemContainer}>
              <TouchableOpacity
                style={styles.flashcardItem}
                onPress={() => openFlashcard(flashcard)}
              >
                <Text style={styles.flashcardTitle}>{flashcard.front}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteFlashcard(flashcard._id)}
                disabled={deletingId === flashcard._id}
              >
                {deletingId === flashcard._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de visualização do flashcard */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFlashcard && (
              <>
                {(!selectedFlashcard.front || !selectedFlashcard.back) ? (
                  iaLoading ? (
                    <ActivityIndicator size="large" color="#2196f3" style={{ marginVertical: 24 }} />
                  ) : (
                    <TouchableOpacity style={styles.modalButton} onPress={handleGenerateWithIA}>
                      <Text style={styles.modalButtonText}>Gerar pergunta e resposta com IA</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <>
                    <Text style={styles.modalLabel}>{showBack ? 'Resposta' : 'Pergunta'}</Text>
                    <Text style={styles.modalText}>
                      {showBack ? selectedFlashcard.back : selectedFlashcard.front}
                    </Text>
                    {!showBack ? (
                      <TouchableOpacity style={styles.modalButton} onPress={() => setShowBack(true)}>
                        <Text style={styles.modalButtonText}>Ver resposta</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#4caf50' }]} onPress={closeModal}>
                          <Text style={styles.modalButtonText}>Lembrei</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#f44336' }]} onPress={closeModal}>
                          <Text style={styles.modalButtonText}>Não lembrei</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#f44336', marginTop: 8 }]}
                  onPress={() => handleDeleteFlashcard(selectedFlashcard._id)}
                  disabled={deletingId === selectedFlashcard._id}
                >
                  {deletingId === selectedFlashcard._id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Excluir</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  flashcardItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  flashcardItem: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  flashcardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 20,
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 8,
    padding: 8,
  },
  closeButtonText: {
    color: '#2196f3',
    fontSize: 14,
  },
  deleteButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    backgroundColor: '#f44336',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default FlashCardsScreen; 