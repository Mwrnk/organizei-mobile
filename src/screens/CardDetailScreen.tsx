import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PdfViewer from '../components/PdfViewer';
import { useAuth } from '../contexts/AuthContext';
import { TOKEN_KEY } from '../services/auth';
import { fontNames } from '@styles/fonts';
import colors from '@styles/colors';
import CustomButton from '@components/CustomButton';
import api from '../services/api';
import apiConfig from '../config/api';

const { width: screenWidth } = Dimensions.get('window');

interface CardData {
  id: string;
  title: string;
  userId: string;
  createdAt?: string;
  pdfs?: {
    url: string;
    filename: string;
    uploaded_at: string;
    size_kb?: number;
  }[];
  image_url?: string[];
  content?: string;
  priority?: 'baixa' | 'media' | 'alta';
  is_published?: boolean;
}

interface RouteParams {
  card: CardData;
  listId: string;
  listName: string;
}

const CardDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { card, listId, listName } = route.params as RouteParams;
  const { user } = useAuth();

  // Estados
  const [cardData, setCardData] = useState<CardData>(card);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'escolar' | 'exercicio'>('escolar');
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Carregar dados completos do card
  useEffect(() => {
    loadCardDetails();
  }, []);

  const loadCardDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cards/${card.id}`);
      const updatedCard = {
        ...card,
        ...res.data.data,
        pdfs: res.data.data.pdfs || [],
        image_url: res.data.data.image_url || [],
        content: res.data.data.content || '',
      };
      setCardData(updatedCard);

      // Carregar PDF automaticamente se existir
      if (updatedCard.pdfs && updatedCard.pdfs.length > 0) {
        loadPdf(card.id);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do card:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar PDF
  const loadPdf = useCallback(
    async (cardId: string, pdfIndex: number = 0) => {
      try {
        if (!cardData?.pdfs || cardData.pdfs.length === 0) {
          setPdfUrl(null);
          return;
        }

        setPdfLoading(true);
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        // Construir URL para visualização do PDF
        const pdfViewUrl = `${api.defaults.baseURL}/cards/${cardId}/pdf/${pdfIndex}/view?token=${token}`;
        setPdfUrl(pdfViewUrl);
        setCurrentPdfIndex(pdfIndex);

        console.log('📄 URL do PDF gerada:', pdfViewUrl);
      } catch (error) {
        console.error('Erro ao carregar PDF:', error);
        setPdfUrl(null);
        Alert.alert('Erro', 'Não foi possível carregar o PDF');
      } finally {
        setPdfLoading(false);
      }
    },
    [cardData]
  );

  // Função para abrir PDF em modal
  const openPdfModal = (pdfIndex: number) => {
    setCurrentPdfIndex(pdfIndex);
    loadPdf(cardData.id, pdfIndex);
    setShowPdfModal(true);
  };

  // Função para alternar favorito
  const toggleFavorite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Implementar lógica de favorito
    Alert.alert('Favorito', 'Funcionalidade de favoritos será implementada em breve.');
  };

  // Função para compartilhar
  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Compartilhar', 'Funcionalidade de compartilhamento será implementada em breve.');
  };

  // Função para visualizar resposta
  const handleViewAnswer = () => {
    setShowAnswerModal(true);
  };

  // Função para adicionar comentário
  const handleAddComment = () => {
    setShowCommentModal(true);
  };

  // Função para publicar na comunidade
  const handlePublishToCommunity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Publicar na Comunidade',
      'Deseja publicar este card na comunidade para que outros usuários possam vê-lo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Publicar',
          onPress: () => {
            // Implementar lógica de publicação
            Alert.alert('Sucesso', 'Card publicado na comunidade!');
          },
        },
      ]
    );
  };

  const loadPdfWithAuth = async (pdfUrl: string) => {
    try {
      setLoadingPdf(true);
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const pdfViewUrl = `${api.defaults.baseURL}/cards/pdf/${encodeURIComponent(
        pdfUrl
      )}?token=${encodeURIComponent(token)}`;

      setPdfViewerUrl(pdfViewUrl);
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      Alert.alert('Erro', 'Não foi possível carregar o PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    if (selectedPdf) {
      // PDF carregado com sucesso
    }
  }, [selectedPdf]);

  // Renderizar conteúdo da aba Escolar
  const renderEscolarContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Informações do card */}
      <View style={styles.cardInfoSection}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{cardData.title}</Text>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.gray} />
              <Text style={styles.metaText}>
                {cardData.createdAt
                  ? new Date(cardData.createdAt).toLocaleDateString('pt-BR')
                  : 'Data não disponível'}
              </Text>
            </View>

            {cardData.pdfs && cardData.pdfs.length > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="document-text-outline" size={16} color={colors.gray} />
                <Text style={styles.metaText}>{cardData.pdfs.length} arquivo(s)</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Conteúdo do card */}
      {cardData.content && (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Conteúdo</Text>
          <Text style={styles.contentText}>{cardData.content}</Text>
        </View>
      )}

      {/* Visualização de PDFs */}
      {cardData.pdfs && cardData.pdfs.length > 0 && (
        <View style={styles.pdfSection}>
          <Text style={styles.sectionTitle}>Arquivos anexados</Text>
          {cardData.pdfs.map((pdf, index) => (
            <View key={index} style={styles.pdfItem}>
              <View style={styles.pdfItemHeader}>
                <Ionicons name="document-text" size={20} color="#007AFF" />
                <View style={styles.pdfItemInfo}>
                  <Text style={styles.pdfName}>{pdf.filename}</Text>
                  <Text style={styles.pdfSize}>
                    {pdf.size_kb ? `${Math.round(pdf.size_kb)}KB` : 'Tamanho não disponível'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.pdfActionButton}
                  onPress={() => openPdfModal(index)}
                  disabled={pdfLoading}
                >
                  {pdfLoading && currentPdfIndex === index ? (
                    <ActivityIndicator size="small" color={colors.button} />
                  ) : (
                    <Ionicons name="eye-outline" size={16} color={colors.button} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Imagens */}
      {cardData.image_url && cardData.image_url.length > 0 && (
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Imagens</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cardData.image_url.map((imageUrl, index) => {
              // Construir URL completa da imagem
              const fullImageUrl = imageUrl.startsWith('http')
                ? imageUrl
                : `${apiConfig.baseURL}${imageUrl}`;

              console.log(`🖼️ Carregando imagem ${index + 1}:`, fullImageUrl);

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.imageContainer}
                  onPress={() => {
                    setSelectedImageIndex(index);
                    setImageModalVisible(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Image
                    source={{ uri: fullImageUrl }}
                    style={styles.cardImage}
                    onLoad={() => {
                      // Imagem carregada com sucesso
                    }}
                    onError={(error) => {
                      console.error('Erro ao carregar imagem:', error.nativeEvent.error);
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );

  // Renderizar conteúdo da aba Exercício
  const renderExercicioContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Questão exemplo */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>QUESTÃO 1:</Text>

        {/* Imagem da questão (exemplo) */}
        <View style={styles.questionImageContainer}>
          <View style={styles.questionImagePlaceholder}>
            <Text style={styles.questionImageText}>📐 Diagrama da questão</Text>
          </View>
        </View>

        {/* Texto da questão */}
        <Text style={styles.questionText}>
          Considere dois círculos concêntricos em um ponto O e de raios distintos, dois segmentos.
          Sabendo que o ângulo mede 30° e que o segmento PD mede 12, pode-se afirmar que os
          diâmetros dos círculos medem:
        </Text>

        {/* Botão para visualizar resposta */}
        <TouchableOpacity style={styles.answerButton} onPress={handleViewAnswer}>
          <Text style={styles.answerButtonText}>Visualizar resposta</Text>
        </TouchableOpacity>
      </View>

      {/* Próxima questão */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>QUESTÃO 2:</Text>
        <View style={styles.questionPlaceholder}>
          <Ionicons name="add-circle-outline" size={48} color={colors.gray} />
          <Text style={styles.questionPlaceholderText}>Adicionar nova questão</Text>
        </View>
      </View>

      {/* Seção de comentários */}
      <View style={styles.commentSection}>
        <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.gray} />
          <Text style={styles.commentButtonText}>Escrever um comentário...</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Seu card</Text>

        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'escolar' && styles.activeTab]}
          onPress={() => setActiveTab('escolar')}
        >
          <Text style={[styles.tabText, activeTab === 'escolar' && styles.activeTabText]}>
            Escolar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'exercicio' && styles.activeTab]}
          onPress={() => setActiveTab('exercicio')}
        >
          <Text style={[styles.tabText, activeTab === 'exercicio' && styles.activeTabText]}>
            Exercício
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo das tabs */}
      <View style={styles.content}>
        {activeTab === 'escolar' ? renderEscolarContent() : renderExercicioContent()}
      </View>

      {/* Botão de publicar na comunidade */}
      <View style={styles.bottomActions}>
        <CustomButton
          title="PUBLICAR NA COMUNIDADE"
          onPress={handlePublishToCommunity}
          buttonStyle={styles.publishButton}
          textStyle={styles.publishButtonText}
        />
      </View>

      {/* Modal de resposta */}
      <Modal
        visible={showAnswerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnswerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resposta da Questão 1</Text>
              <TouchableOpacity onPress={() => setShowAnswerModal(false)}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.answerText}>
                Para resolver esta questão, precisamos aplicar as propriedades dos círculos
                concêntricos e trigonometria.
                {'\n\n'}
                Dado que o ângulo é de 30° e o segmento PD mede 12, podemos calcular os raios usando
                as relações trigonométricas.
                {'\n\n'}
                Resposta: Os diâmetros medem 24 e 36 unidades.
              </Text>
            </ScrollView>

            <CustomButton
              title="Entendi"
              onPress={() => setShowAnswerModal(false)}
              buttonStyle={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de comentário */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Comentário</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Escreva seu comentário..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancelar"
                onPress={() => {
                  setShowCommentModal(false);
                  setComment('');
                }}
                variant="outline"
                buttonStyle={styles.modalActionButton}
              />
              <CustomButton
                title="Publicar"
                onPress={() => {
                  setShowCommentModal(false);
                  setComment('');
                  Alert.alert('Sucesso', 'Comentário adicionado!');
                }}
                buttonStyle={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de visualização de PDF */}
      <Modal
        visible={showPdfModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowPdfModal(false)}
      >
        <SafeAreaView style={styles.pdfModalContainer}>
          {/* Header do modal PDF */}
          <View style={styles.pdfModalHeader}>
            <TouchableOpacity onPress={() => setShowPdfModal(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={styles.pdfModalTitle}>
              {(cardData.pdfs && cardData.pdfs[currentPdfIndex]?.filename) || 'Documento PDF'}
            </Text>

            <TouchableOpacity
              onPress={() => {
                // Implementar download/compartilhamento
                Alert.alert('Download', 'Funcionalidade de download será implementada em breve.');
              }}
              style={styles.downloadButton}
            >
              <Ionicons name="download-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Visualizador de PDF */}
          <View style={styles.pdfContainer}>
            {pdfUrl ? (
              <PdfViewer
                source={{
                  uri: pdfUrl,
                }}
                style={styles.pdf}
                onLoad={() => {
                  console.log('📄 PDF carregado com sucesso');
                }}
                onError={(error) => {
                  console.error('📄 Erro ao carregar PDF:', error);
                  Alert.alert('Erro', 'Não foi possível carregar o PDF');
                  setShowPdfModal(false);
                }}
              />
            ) : (
              <View style={styles.pdfLoadingContainer}>
                <ActivityIndicator size="large" color={colors.button} />
                <Text style={styles.pdfLoadingText}>Carregando PDF...</Text>
              </View>
            )}
          </View>

          {/* Navegação entre PDFs se houver múltiplos */}
          {cardData.pdfs && cardData.pdfs.length > 1 && (
            <View style={styles.pdfNavigation}>
              <TouchableOpacity
                style={[styles.pdfNavButton, currentPdfIndex === 0 && styles.pdfNavButtonDisabled]}
                onPress={() => {
                  if (currentPdfIndex > 0) {
                    openPdfModal(currentPdfIndex - 1);
                  }
                }}
                disabled={currentPdfIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={currentPdfIndex === 0 ? colors.gray : colors.button}
                />
                <Text
                  style={[styles.pdfNavText, currentPdfIndex === 0 && styles.pdfNavTextDisabled]}
                >
                  Anterior
                </Text>
              </TouchableOpacity>

              <Text style={styles.pdfCounter}>
                {currentPdfIndex + 1} de {cardData.pdfs?.length || 0}
              </Text>

              <TouchableOpacity
                style={[
                  styles.pdfNavButton,
                  currentPdfIndex === (cardData.pdfs?.length || 1) - 1 &&
                    styles.pdfNavButtonDisabled,
                ]}
                onPress={() => {
                  if (cardData.pdfs && currentPdfIndex < cardData.pdfs.length - 1) {
                    openPdfModal(currentPdfIndex + 1);
                  }
                }}
                disabled={currentPdfIndex === (cardData.pdfs?.length || 1) - 1}
              >
                <Text
                  style={[
                    styles.pdfNavText,
                    currentPdfIndex === (cardData.pdfs?.length || 1) - 1 &&
                      styles.pdfNavTextDisabled,
                  ]}
                >
                  Próximo
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    currentPdfIndex === (cardData.pdfs?.length || 1) - 1
                      ? colors.gray
                      : colors.button
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
  },
  shareButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fontNames.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    flex: 1,
    paddingTop: 16,
  },
  cardInfoSection: {
    marginBottom: 24,
  },
  cardHeader: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
    lineHeight: 24,
  },
  pdfSection: {
    marginBottom: 24,
  },
  pdfItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pdfItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfItemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  pdfName: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
    marginBottom: 2,
  },
  pdfSize: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  pdfActionButton: {
    padding: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  pdfViewer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pdfViewerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 12,
  },
  pdfViewerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pdfViewerPlaceholder: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginBottom: 8,
    textAlign: 'center',
  },
  pdfViewerNote: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
  imageSection: {
    marginBottom: 24,
  },
  cardImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  questionSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    marginBottom: 16,
  },
  questionImageContainer: {
    marginBottom: 16,
  },
  questionImagePlaceholder: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  questionImageText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  questionText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
    lineHeight: 20,
    marginBottom: 16,
  },
  answerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  answerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontNames.semibold,
  },
  questionPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  questionPlaceholderText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginTop: 8,
  },
  commentSection: {
    marginTop: 24,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  commentButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  publishButton: {
    backgroundColor: colors.button,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontNames.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
  },
  modalBody: {
    maxHeight: 300,
    marginBottom: 16,
  },
  answerText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
    lineHeight: 24,
  },
  modalButton: {
    marginTop: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: fontNames.regular,
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
  },
  pdfModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  pdfModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fontNames.semibold,
    flex: 1,
  },
  downloadButton: {
    padding: 8,
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pdfLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfLoadingText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginTop: 16,
  },
  pdfNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  pdfNavButton: {
    padding: 8,
  },
  pdfNavButtonDisabled: {
    opacity: 0.5,
  },
  pdfNavText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginLeft: 8,
  },
  pdfNavTextDisabled: {
    color: colors.gray,
  },
  pdfCounter: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginHorizontal: 16,
  },
  imageContainer: {
    padding: 8,
  },
});

export default CardDetailScreen;
