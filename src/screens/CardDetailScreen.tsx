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
  Platform,
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
import ExportIcon from '@icons/ExportIcon';
import NetworkIcon from '@icons/NetworkIcon';
import ArrowBack from '@icons/ArrowBack';
import CloseIcon from '@icons/CloseIcon';
import ChatIcon from '@icons/ChatIcon';

const { width: screenWidth } = Dimensions.get('window');

// Interfaces para comentários
interface Comment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  userProfileImage?: string;
}

interface CardData {
  id: string;
  _id?: string;
  title: string;
  userId: string;
  createdAt?: string;
  pdfs?: {
    url: string;
    filename: string;
    uploaded_at: string;
    size_kb?: number;
  }[];
  content?: string;
  priority?: 'baixa' | 'media' | 'alta';
  is_published?: boolean;
  comments?: Comment[];
}

interface RouteParams {
  card: CardData;
  listId: string;
  listName: string;
}

const errorColor = '#FF3B30'; // Cor de erro padrão do iOS

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
  const [userAnswer, setUserAnswer] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'escolar' | 'pdf'>('escolar');
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Carregar dados completos do card
  useEffect(() => {
    loadCardDetails();
  }, []);

  const loadCardDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cards/${card.id || card._id}`);
      const updatedCard = {
        ...card,
        ...res.data.data,
        id: res.data.data.id || res.data.data._id,
        pdfs: res.data.data.pdfs || [],
        content: res.data.data.content || '',
      };
      setCardData(updatedCard);

      // Carregar PDF automaticamente se existir
      if (updatedCard.pdfs && updatedCard.pdfs.length > 0) {
        loadPdf(updatedCard.id);
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

        // Construir URL base para o PDF
        const pdfViewUrl = `${api.defaults.baseURL}/cards/${cardId}/pdf/${pdfIndex}/view`;
        console.log('🔄 Tentando carregar PDF da URL:', pdfViewUrl);
        
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(pdfViewUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error(`Erro ao carregar PDF: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            console.log('📄 Tipo de conteúdo recebido:', contentType);

            const blob = await response.blob();
            console.log('📄 Blob criado com sucesso:', blob.size, 'bytes');

            const pdfObjectUrl = URL.createObjectURL(blob);
            console.log('📄 URL do objeto criada:', pdfObjectUrl);

            setPdfUrl(pdfObjectUrl);
          } catch (error) {
            console.error('❌ Erro ao processar PDF no ambiente web:', error);
            throw error;
          }
        } else {
          // No ambiente mobile, usamos a URL direta com token
          const fullUrl = `${pdfViewUrl}?token=${encodeURIComponent(token)}`;
          console.log('📄 URL mobile gerada:', fullUrl);
          setPdfUrl(fullUrl);
        }

        setCurrentPdfIndex(pdfIndex);
        console.log('✅ PDF carregado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar PDF:', error);
        setPdfUrl(null);
        Alert.alert('Erro', 'Não foi possível carregar o PDF. Por favor, tente novamente.');
      } finally {
        setPdfLoading(false);
      }
    },
    [cardData]
  );

  // Componente de visualização do PDF
  const PdfViewerComponent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      if (pdfUrl) {
        setIsLoading(true);
        setHasError(false);
      }
    }, [pdfUrl]);

    if (!pdfUrl) {
      return (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text-outline" size={48} color={colors.gray} />
          <Text style={styles.pdfPlaceholderText}>
            Selecione um arquivo para visualizar
          </Text>
        </View>
      );
    }

    return Platform.select({
      web: (
        <View style={styles.pdfViewerWrapper}>
          {isLoading && (
            <View style={styles.pdfLoadingOverlay}>
              <ActivityIndicator size="large" color={colors.button} />
              <Text style={styles.pdfLoadingText}>Carregando PDF...</Text>
            </View>
          )}
          <object
            data={pdfUrl}
            type="application/pdf"
            style={{
              width: '100%',
              height: '100%',
              minHeight: 500,
              border: 'none',
              backgroundColor: '#fff',
            }}
            onLoad={() => {
              console.log('📄 PDF carregado com sucesso');
              setIsLoading(false);
            }}
            onError={(e) => {
              console.error('❌ Erro ao carregar PDF:', e);
              setHasError(true);
              setIsLoading(false);
            }}
          >
            <iframe
              src={pdfUrl}
              style={{
                width: '100%',
                height: '100%',
                minHeight: 500,
                border: 'none',
                backgroundColor: '#fff',
              }}
              onLoad={() => {
                console.log('📄 iframe carregado com sucesso');
                setIsLoading(false);
              }}
              onError={(e) => {
                console.error('❌ Erro ao carregar iframe:', e);
                setHasError(true);
                setIsLoading(false);
              }}
            />
          </object>
          {hasError && (
            <View style={styles.pdfErrorOverlay}>
              <Ionicons name="alert-circle-outline" size={48} color={errorColor} />
              <Text style={styles.pdfErrorText}>
                Erro ao carregar o PDF. Tente novamente.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                  loadPdf(cardData.id, currentPdfIndex);
                }}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ),
      default: (
        <View style={styles.pdfViewerWrapper}>
          {isLoading && (
            <View style={styles.pdfLoadingOverlay}>
              <ActivityIndicator size="large" color={colors.button} />
              <Text style={styles.pdfLoadingText}>Carregando PDF...</Text>
            </View>
          )}
          <PdfViewer
            source={{ uri: pdfUrl }}
            style={styles.pdfViewer}
            onLoad={() => {
              console.log('📄 PDF carregado com sucesso no visualizador nativo');
              setIsLoading(false);
            }}
            onError={(error) => {
              console.error('❌ Erro ao carregar PDF no visualizador nativo:', error);
              setHasError(true);
              setIsLoading(false);
              Alert.alert('Erro', 'Não foi possível carregar o PDF');
            }}
          />
          {hasError && (
            <View style={styles.pdfErrorOverlay}>
              <Ionicons name="alert-circle-outline" size={48} color={errorColor} />
              <Text style={styles.pdfErrorText}>
                Erro ao carregar o PDF. Tente novamente.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                  loadPdf(cardData.id, currentPdfIndex);
                }}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ),
    });
  };

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

  // Função para carregar comentários
  const loadComments = useCallback(async () => {
    if (!cardData.id) return;

    setLoadingComments(true);
    try {
      const response = await api.get(`/cards/${cardData.id}/comments`);
      const commentsData = response.data.data || [];
      setComments(commentsData);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comentários');
    } finally {
      setLoadingComments(false);
    }
  }, [cardData.id]);

  // Carregar comentários quando o componente montar
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Função para adicionar um novo comentário
  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Erro', 'O comentário não pode estar vazio');
      return;
    }

    try {
      const response = await api.post(`/cards/${cardData.id}/comments`, {
        content: comment.trim()
      });

      // Atualizar a lista de comentários
      await loadComments();

      // Limpar o campo e fechar o modal
      setComment('');
      setShowCommentModal(false);

      // Feedback visual
      Alert.alert('Sucesso', 'Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o comentário');
    }
  };

  // Renderizar lista de comentários
  const renderComments = () => {
    if (loadingComments) {
      return (
        <View style={styles.commentsLoadingContainer}>
          <ActivityIndicator size="large" color={colors.button} />
          <Text style={styles.commentsLoadingText}>Carregando comentários...</Text>
        </View>
      );
    }

    if (comments.length === 0) {
      return (
        <View style={styles.noCommentsContainer}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.gray} />
          <Text style={styles.noCommentsText}>Nenhum comentário ainda. Seja o primeiro a comentar!</Text>
        </View>
      );
    }

    return (
      <View style={styles.commentsList}>
        {comments.map((comment) => (
          <View key={comment._id} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              {comment.userProfileImage ? (
                <Image
                  source={{ uri: comment.userProfileImage }}
                  style={styles.commentUserImage}
                />
              ) : (
                <View style={styles.commentUserImagePlaceholder}>
                  <Text style={styles.commentUserImagePlaceholderText}>
                    {comment.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.commentUserInfo}>
                <Text style={styles.commentUserName}>{comment.userName}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
          </View>
        ))}
      </View>
    );
  };

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

            <View style={styles.metaItem}>
              <Ionicons name="finger-print-outline" size={16} color={colors.gray} />
              <Text style={styles.metaText}>ID: {cardData.id || cardData._id}</Text>
            </View>

            {cardData.pdfs && cardData.pdfs.length > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="document-text-outline" size={16} color={colors.gray} />
                <Text style={styles.metaText}>{cardData.pdfs.length} pdf(s)</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Seção de prioridade e status */}
      <View style={styles.prioritySection}>
        <Text style={styles.sectionTitle}>Prioridade</Text>
        <View style={styles.badgesContainer}>
          <View style={[
            styles.priorityBadge,
            {
              backgroundColor: cardData.priority ? 
                (cardData.priority === 'alta' ? colors.highPriority :
                 cardData.priority === 'media' ? colors.mediumPriority :
                 colors.lowPriority) : 
                colors.background
            }
          ]}>
            <Text style={[
              styles.priorityText,
              !cardData.priority && styles.undefinedPriorityText
            ]}>
              {cardData.priority ? cardData.priority.toUpperCase() : 'NÃO DEFINIDA'}
            </Text>
          </View>

          <View style={[
            styles.publishedBadge,
            cardData.is_published ? styles.publishedBadgeActive : styles.publishedBadgeInactive
          ]}>
            <NetworkIcon size={16} color={cardData.is_published ? colors.white : colors.primary} />
            <Text style={[
              styles.publishedText,
              !cardData.is_published && styles.publishedTextInactive
            ]}>
              {cardData.is_published ? 'PUBLICADO' : 'NÃO PUBLICADO'}
            </Text>
          </View>
        </View>
      </View>

      {/* Seção de descrição */}
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {cardData.content || 'Nenhuma descrição disponível'}
          </Text>
        </View>
      </View>

      {/* Seção de comentários */}
      <View style={styles.commentSection}>
        <Text style={styles.sectionTitle}>Comentários</Text>
        {renderComments()}
      </View>
    </ScrollView>
  );

  // Renderizar conteúdo da aba PDF
  const renderPdfContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Visualização de PDFs */}
      {cardData.pdfs && cardData.pdfs.length > 0 ? (
        <View style={styles.pdfSection}>
          <Text style={styles.sectionTitle}>PDFs disponíveis</Text>
          
          {/* Lista de PDFs disponíveis */}
          <View style={styles.pdfListContainer}>
            {cardData.pdfs.map((pdf, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pdfListItem,
                  currentPdfIndex === index && styles.pdfListItemActive
                ]}
                onPress={() => {
                  setCurrentPdfIndex(index);
                  loadPdf(cardData.id, index);
                }}
              >
                <Ionicons 
                  name="document-text" 
                  size={20} 
                  color={currentPdfIndex === index ? colors.button : colors.gray} 
                />
                <Text 
                  style={[
                    styles.pdfListItemText,
                    currentPdfIndex === index && styles.pdfListItemTextActive
                  ]}
                  numberOfLines={1}
                >
                  {pdf.filename}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Visualizador de PDF */}
          <View style={styles.pdfViewerContainer}>
            {pdfLoading ? (
              <View style={styles.pdfLoadingContainer}>
                <ActivityIndicator size="large" color={colors.button} />
                <Text style={styles.pdfLoadingText}>Carregando PDF...</Text>
              </View>
            ) : (
              <PdfViewerComponent />
            )}
          </View>

          {/* Informações do PDF atual */}
          {cardData.pdfs[currentPdfIndex] && (
            <View style={styles.pdfInfo}>
              <Text style={styles.pdfInfoText}>
                {cardData.pdfs[currentPdfIndex].size_kb 
                  ? `Tamanho: ${Math.round(cardData.pdfs[currentPdfIndex].size_kb)}KB` 
                  : ''}
              </Text>
              <Text style={styles.pdfInfoText}>
                Enviado em: {new Date(cardData.pdfs[currentPdfIndex].uploaded_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noPdfContainer}>
          <Ionicons name="document-text-outline" size={48} color={colors.gray} />
          <Text style={styles.noPdfText}>Nenhum PDF disponível</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowBack color={colors.primary} size={16} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Seu card</Text>

        <View style={{ width: 24 }} /> {/* Espaçador para centralizar */}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'escolar' && styles.activeTab]}
          onPress={() => setActiveTab('escolar')}
        >
          <Text style={[styles.tabText, activeTab === 'escolar' && styles.activeTabText]}>
            Informações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'pdf' && styles.activeTab]}
          onPress={() => setActiveTab('pdf')}
        >
          <Text style={[styles.tabText, activeTab === 'pdf' && styles.activeTabText]}>
            Visualizar PDF
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo das tabs */}
      <View style={styles.content}>
        {activeTab === 'escolar' ? renderEscolarContent() : renderPdfContent()}
      </View>

      {/* Botões de ação - apenas na aba de informações */}
      {activeTab === 'escolar' && (
        <View style={styles.bottomActions}>
          <CustomButton
            title="Adicionar comentário"
            onPress={handleAddComment}
            buttonStyle={styles.commentButton}
            textStyle={styles.commentButtonText}
            icon={<ChatIcon size={20} color={colors.primary} />}
          />

          <CustomButton
            title={cardData.is_published ? "Publicado na comunidade" : "Publicar na comunidade"}
            onPress={handlePublishToCommunity}
            buttonStyle={[
              styles.publishButton,
              cardData.is_published && styles.publishedButton
            ]}
            textStyle={[
              styles.publishButtonText,
              cardData.is_published && styles.publishedButtonText
            ]}
            icon={<NetworkIcon size={24} color={cardData.is_published ? colors.gray : colors.white} />}
            disabled={cardData.is_published}
          />
        </View>
      )}

      {/* Modal de comentário */}
      <Modal
        visible={showCommentModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Comentário</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <CloseIcon size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.placeholderCommentInput}
              placeholder="Escreva seu comentário..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.gray}
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
                onPress={handleSubmitComment}
                buttonStyle={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  header: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 999,
    padding: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 999,
  },
  activeTab: {
    backgroundColor: colors.primary,
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
    color: colors.white,
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
    backgroundColor: colors.background,
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
    fontSize: 12,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: fontNames.semibold,
    lineHeight: 30,
  },
  pdfSection: {
    marginBottom: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  pdfListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pdfListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  pdfListItemActive: {
    backgroundColor: colors.background,
    borderColor: colors.button,
  },
  pdfListItemText: {
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
    maxWidth: 150,
  },
  pdfListItemTextActive: {
    color: colors.button,
    fontFamily: fontNames.medium,
  },
  pdfViewerContainer: {
    height: 400,
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  pdfViewer: {
    flex: 1,
  },
  pdfLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfLoadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  pdfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfPlaceholderText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'center',
  },
  pdfInfo: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  pdfInfoText: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },

  commentSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  commentButton: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 20,
  },
  commentButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.primary,
    fontFamily: fontNames.regular,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 130,
    left: 0,
    right: 0,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  publishButton: {
    backgroundColor: colors.button,
    height: 50,
    width: '100%',
  },
  publishedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontNames.semibold,
  },
  publishedButtonText: {
    color: colors.gray,
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

  modalButton: {
    marginTop: 8,
  },
  placeholderCommentInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
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

  noPdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 48,
    marginBottom: 24,
  },
  noPdfText: {
    fontSize: 16,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginTop: 16,
  },
  pdfViewerWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 500,
  },
  pdfLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pdfErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pdfErrorText: {
    marginTop: 16,
    fontSize: 16,
    color: errorColor,
    fontFamily: fontNames.medium,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.button,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontNames.medium,
  },
  commentsLoadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  noCommentsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
  },
  noCommentsText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
    textAlign: 'center',
  },
  commentsList: {
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUserImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentUserImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentUserImagePlaceholderText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontNames.semibold,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.semibold,
  },
  commentDate: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  commentContent: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
    lineHeight: 20,
  },
  prioritySection: {
    marginBottom: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  publishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  publishedBadgeActive: {
    backgroundColor: colors.button,
  },
  publishedBadgeInactive: {
    backgroundColor: colors.background,
  },
  priorityText: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fontNames.semibold,
    textAlign: 'center',
  },
  publishedText: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fontNames.semibold,
  },
  publishedTextInactive: {
    color: colors.primary,
  },
  undefinedPriorityText: {
    color: colors.primary,
  },
  descriptionSection: {
  },
  descriptionContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
    lineHeight: 20,
  },
});

export default CardDetailScreen;
