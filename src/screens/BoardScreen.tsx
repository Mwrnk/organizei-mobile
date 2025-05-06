import { StyleSheet, Text, View, FlatList, Modal, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Input from '@components/Input';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { GlobalStyles } from '@styles/global';
import { useAuth } from '@contexts/AuthContext';
import BoardController, { Board, Card } from '../controllers/BoardController';
import CustomButton from '@components/CustomButton';
import colors from '@styles/colors';

const BoardScreen = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega os boards do usuário ao montar o componente
  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  // Função para carregar os boards do usuário
  const loadBoards = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userBoards = await BoardController.getBoards(user.id);
      setBoards(userBoards);

      // Seleciona o primeiro board por padrão, se existir
      if (userBoards.length > 0 && !selectedBoard) {
        setSelectedBoard(userBoards[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar boards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar um novo card
  const handleCreateCard = async () => {
    if (!user || !selectedBoard || !cardTitle.trim()) return;

    setLoading(true);
    try {
      await BoardController.addCard(selectedBoard.id, user.id, { title: cardTitle });
      setCardTitle('');
      setIsModalOpen(false);

      // Recarrega os boards para atualizar a lista
      await loadBoards();
    } catch (error) {
      console.error('Erro ao criar card:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza um item de card
  const renderCardItem = ({ item }: { item: Card }) => (
    <View style={styles.cardItem}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
    </View>
  );

  // Renderiza um item de board
  const renderBoardItem = ({ item }: { item: Board }) => (
    <TouchableOpacity
      style={[styles.boardItem, selectedBoard?.id === item.id && styles.selectedBoardItem]}
      onPress={() => setSelectedBoard(item)}
    >
      <Text style={styles.boardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={GlobalStyles.container}>
        <View style={styles.header}>
          <Text style={GlobalStyles.title}>Seus Quadros</Text>
        </View>

        {/* Lista horizontal de boards */}
        <View style={styles.boardsContainer}>
          <FlatList
            horizontal
            data={boards}
            renderItem={renderBoardItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.boardsList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Lista de cards do board selecionado */}
        {selectedBoard ? (
          <View style={styles.cardsContainer}>
            <Text style={GlobalStyles.title2}>{selectedBoard.title}</Text>

            {selectedBoard.cards.length > 0 ? (
              <FlatList
                data={selectedBoard.cards}
                renderItem={renderCardItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.cardsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={GlobalStyles.text}>Nenhum card criado ainda</Text>
              </View>
            )}

            <CustomButton
              title="Adicionar Card"
              onPress={() => setIsModalOpen(true)}
              buttonStyle={styles.addButton}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={GlobalStyles.text}>
              {boards.length > 0 ? 'Selecione um quadro' : 'Você ainda não tem quadros'}
            </Text>
          </View>
        )}

        {/* Modal para criar novo card */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={GlobalStyles.title2}>Novo Card</Text>

              <View style={styles.inputContainer}>
                <Input
                  placeholder="Digite o título do seu card"
                  value={cardTitle}
                  onChangeText={setCardTitle}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalButtons}>
                <CustomButton
                  title="Cancelar"
                  onPress={() => setIsModalOpen(false)}
                  variant="outline"
                  buttonStyle={styles.modalButton}
                />
                <CustomButton
                  title="Criar"
                  loading={loading}
                  onPress={handleCreateCard}
                  buttonStyle={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  boardsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  boardsList: {
    paddingHorizontal: 20,
  },
  boardItem: {
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedBoardItem: {
    backgroundColor: colors.button,
  },
  boardTitle: {
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  cardsList: {
    paddingTop: 10,
  },
  cardItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: colors.button,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '48%',
  },
});
