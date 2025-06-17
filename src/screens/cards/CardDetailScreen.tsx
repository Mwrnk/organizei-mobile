import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { WebView } from 'react-native-webview';
import { useAuth } from '@contexts/AuthContext';
import { TOKEN_KEY } from '../../services/auth';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';
import CustomButton from '@components/CustomButton';
import api from '../../services/api';
import NetworkIcon from '@icons/NetworkIcon';
import ArrowBack from '@icons/ArrowBack';
import CloseIcon from '@icons/CloseIcon';
import ChatIcon from '@icons/ChatIcon';
import { RouteProp } from '@react-navigation/native';
import { ICard } from '../../types/community.types';
import { useCommunity } from '@contexts/CommunityContext';
import { CommunityService } from '../../services/communityService';
import LikeButton from '../../components/community/LikeButton';
import CommentsButton from '../../components/community/CommentsButton';
import DownloadButton from '../../components/community/DownloadButton';
import Toast from 'react-native-toast-message';

interface Comment {
  _id: string;
  userId: string | { _id: string; name?: string; profileImage?: string };
  userName?: string;
  description: string;
  createdAt: string;
  userProfileImage?: string;
}

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
  content?: string;
  priority?: 'baixa' | 'media' | 'alta';
  is_published?: boolean;
  image_url?: string[];
  comments?: Comment[];
}

type ParamList = {
  CardDetail: {
    card: ICard;
  };
};

const errorColor = '#FF3B30';

const CardDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'CardDetail'>>();
  const { card } = route.params;
  const { user } = useAuth();
  const { likeCard, unlikeCard } = useCommunity();

  const [cardData, setCardData] = useState<ICard>(card);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'escolar' | 'pdf'>('escolar');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const likePendingRef = useRef(false);

  // Carrega detalhes completos do card (inclusive URL do PDF assinada)
  const loadCardDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cards/${card.id}`);
      const updatedCard: ICard = {
        ...card,
        ...res.data.data,
        pdfs: res.data.data.pdfs || [],
        content: res.data.data.content || '',
      };

      // Se existir imagem no novo modelo (armazenada binária), busca info e cria URL de visualização
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          // Monta URL do PDF se existir
          if (updatedCard.pdfs && updatedCard.pdfs.length > 0) {
            const pdfViewUrl = `${api.defaults.baseURL}/cards/${updatedCard.id}/pdf/0/view`;
            setPdfUrl(`${pdfViewUrl}?token=${encodeURIComponent(token)}`);
          }

          // Verifica se já temos image_url; caso não, consulta info
          if (!updatedCard.image_url || updatedCard.image_url.length === 0) {
            const infoRes = await api.get(`/cards/${updatedCard.id}/image/info`);
            if (infoRes.data?.data) {
              const imageViewUrl = `${api.defaults.baseURL}/cards/${
                updatedCard.id
              }/image/view?token=${encodeURIComponent(token)}`;
              updatedCard.image_url = [imageViewUrl];
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao montar URL da imagem do card:', err);
      }

      setCardData(updatedCard);
    } catch (err) {
      console.error('Erro ao carregar card:', err);
      Alert.alert('Erro', 'Não foi possível carregar o card');
    } finally {
      setLoading(false);
    }
  }, [card.id]);

  useEffect(() => {
    loadCardDetails();
  }, [loadCardDetails]);

  useEffect(() => {
    console.log('cardData.image_url', cardData.image_url);
  }, [cardData.image_url]);

  /** Comentários */
  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await api.get(`/comments/${card.id}`);
      setComments(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [card.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Erro', 'O comentário não pode estar vazio');
      return;
    }
    try {
      await api.post('/comments', { cardId: card.id, description: comment.trim() });
      setComment('');
      setShowCommentModal(false);
      loadComments();
      Alert.alert('Sucesso', 'Comentário adicionado!');
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
      Alert.alert('Erro', 'Não foi possível adicionar o comentário');
    }
  };

  /** PDF viewer interno */
  const PdfViewer = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    if (!pdfUrl) {
      return (
        <View style={styles.noPdfContainer}>
          <Ionicons name="document-text-outline" size={48} color={colors.gray} />
          <Text style={styles.noPdfText}>Nenhum PDF disponível</Text>
        </View>
      );
    }

    return (
      <View style={styles.pdfViewerWrapper}>
        {isLoading && (
          <View style={styles.pdfLoadingOverlay}>
            <ActivityIndicator size="large" color={colors.button} />
            <Text style={styles.pdfLoadingText}>Carregando PDF...</Text>
          </View>
        )}
        <WebView
          source={{ uri: pdfUrl }}
          style={styles.pdfViewer}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
            Alert.alert('Erro', 'Não foi possível carregar o PDF');
          }}
        />
        {hasError && (
          <View style={styles.pdfErrorOverlay}>
            <Ionicons name="alert-circle-outline" size={48} color={errorColor} />
            <Text style={styles.pdfErrorText}>Erro ao carregar o PDF.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCardDetails}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  /** Abre diálogo de impressão/visualização nativo */
  const handleOpenPdf = useCallback(async () => {
    if (!pdfUrl) return;
    try {
      await Print.printAsync({ uri: pdfUrl });
    } catch (err) {
      console.error('Erro ao abrir PDF:', err);
      Alert.alert('Erro', 'Não foi possível abrir o PDF');
    }
  }, [pdfUrl]);

  const toggleLike = async () => {
    if (likeLoading || likePendingRef.current) return;

    // Validação de auto-curtida
    if (cardData.userId === user?.id) {
      Toast.show({ type: 'info', text1: 'Você não pode curtir seu próprio post' });
      return;
    }

    // Otimista
    const optimisticLiked = !cardData.likedByUser;
    const optimisticLikes = cardData.likes + (optimisticLiked ? 1 : -1);
    setCardData({ ...cardData, likedByUser: optimisticLiked, likes: optimisticLikes });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setLikeLoading(true);
    likePendingRef.current = true;
    try {
      if (optimisticLiked) {
        await likeCard(cardData.id);
      } else {
        await unlikeCard(cardData.id);
      }
      // Sucesso — nada a fazer pois estado já está consistente
    } catch (err: any) {
      // Rollback para estado anterior
      setCardData((prev) => ({
        ...prev,
        likedByUser: !optimisticLiked,
        likes: prev.likes - (optimisticLiked ? 1 : -1),
      }));
      const message = err?.response?.data?.message || 'Erro ao atualizar like';
      Toast.show({ type: 'error', text1: message });
    } finally {
      setLikeLoading(false);
      likePendingRef.current = false;
    }
  };

  const handleAddComment = () => setShowCommentModal(true);

  const handlePublishToCommunity = async () => {
    if (cardData.is_published) return;

    // Checa se possui PDF (mesma regra do web)
    if (!cardData.pdfs || cardData.pdfs.length === 0) {
      Alert.alert('Atenção', 'Adicione um PDF ao card antes de publicar na comunidade.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPublishing(true);
    try {
      await CommunityService.publishCard(cardData.id);
      Toast.show({ type: 'success', text1: 'Card publicado com sucesso!' });
      setCardData({ ...cardData, is_published: true });
    } catch (err: any) {
      console.error('Erro ao publicar card:', err);
      const message = err.response?.data?.message || 'Erro ao publicar card.';
      Alert.alert('Erro', message);
    } finally {
      setPublishing(false);
    }
  };

  /** Renderizações auxiliares */
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
          <Text style={styles.noCommentsText}>Nenhum comentário ainda.</Text>
        </View>
      );
    }

    return (
      <View style={styles.commentsList}>
        {comments.map((c) => {
          const populated = typeof c.userId === 'object' ? (c.userId as any) : null;
          const name = c.userName || populated?.name || 'Usuário';
          const img = c.userProfileImage || populated?.profileImage;
          const initial = name.charAt(0).toUpperCase();

          return (
            <View key={c._id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                {img ? (
                  <Image source={{ uri: img }} style={styles.commentUserImage} />
                ) : (
                  <View style={styles.commentUserImagePlaceholder}>
                    <Text style={styles.commentUserImagePlaceholderText}>{initial}</Text>
                  </View>
                )}
                <View style={styles.commentUserInfo}>
                  <Text style={styles.commentUserName}>{name}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentContent}>{c.description}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderEscolarContent = () => (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações do card */}
        <View style={styles.cardInfoSection}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{cardData.title}</Text>
              <LikeButton
                liked={!!cardData.likedByUser}
                count={cardData.likes}
                onPress={toggleLike}
                loading={likeLoading}
              />
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
                  <Text style={styles.metaText}>1 pdf</Text>
                </View>
              )}
            </View>
          </View>
          {/* Imagem do card */}
          {cardData.image_url && cardData.image_url.length > 0 && (
            <Image
              source={{
                uri: cardData.image_url[0].startsWith('http')
                  ? cardData.image_url[0]
                  : `${api.defaults.baseURL}${cardData.image_url[0]}`,
              }}
              style={styles.cardMainImage}
            />
          )}
        </View>

        {/* Descrição */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {cardData.content || 'Nenhuma descrição disponível'}
            </Text>
          </View>
        </View>

        {/* Comentários */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Comentários</Text>
          {renderComments()}
        </View>
      </ScrollView>

      {/* Ações */}
      <View style={styles.actionsContainer}>
        <CustomButton
          title="Adicionar comentário"
          onPress={handleAddComment}
          buttonStyle={styles.commentButton}
          textStyle={styles.commentButtonText}
          icon={<ChatIcon size={20} color={colors.primary} />}
        />

        <CustomButton
          title={cardData.is_published ? 'Publicado na comunidade' : 'Publicar na comunidade'}
          onPress={handlePublishToCommunity}
          buttonStyle={[styles.publishButton, cardData.is_published && styles.publishedButton]}
          textStyle={[
            styles.publishButtonText,
            cardData.is_published && styles.publishedButtonText,
          ]}
          icon={
            <NetworkIcon size={24} color={cardData.is_published ? colors.gray : colors.white} />
          }
          disabled={cardData.is_published || publishing}
        />
      </View>
    </View>
  );

  const renderPdfContent = () => (
    <View style={{ flex: 1, paddingTop: 16 }}>
      {pdfLoading ? (
        <View style={styles.pdfLoadingOverlay}>
          <ActivityIndicator size="large" color={colors.button} />
          <Text style={styles.pdfLoadingText}>Carregando PDF...</Text>
        </View>
      ) : (
        <PdfViewer />
      )}

      {pdfUrl && (
        <CustomButton
          title="Abrir PDF no sistema"
          onPress={handleOpenPdf}
          buttonStyle={[styles.publishButton, { marginTop: 24 }]}
          textStyle={styles.publishButtonText}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.pdfLoadingOverlay}>
        <ActivityIndicator size="large" color={colors.button} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowBack color={colors.primary} size={16} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seu card</Text>
        <View style={{ width: 24 }} />
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

      {/* Conteúdo */}
      <View style={styles.content}>
        {activeTab === 'escolar' ? renderEscolarContent() : renderPdfContent()}
      </View>

      {/* Modal Comentário */}
      <Modal
        visible={showCommentModal}
        animationType="fade"
        transparent
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
                onPress={() => setShowCommentModal(false)}
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
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 16, fontFamily: fontNames.bold, color: colors.primary },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 999,
    padding: 6,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 999 },
  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 16, color: colors.gray, fontFamily: fontNames.regular },
  activeTabText: { color: colors.white, fontFamily: fontNames.semibold },
  content: { flex: 1, paddingHorizontal: 16 },
  tabContent: { flex: 1, paddingTop: 16 },
  cardInfoSection: { marginBottom: 24 },
  cardHeader: { backgroundColor: colors.background, borderRadius: 12, padding: 16 },
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
  favoriteButton: { padding: 4 },
  cardMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 14, color: colors.gray, fontFamily: fontNames.regular },
  sectionTitle: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginBottom: 12,
  },
  descriptionSection: {},
  descriptionContainer: { backgroundColor: colors.background, borderRadius: 8, padding: 16 },
  descriptionText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
    lineHeight: 20,
  },
  commentSection: { marginTop: 24, marginBottom: 24 },
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
  publishButton: { backgroundColor: colors.button, height: 50, width: '100%' },
  publishedButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  publishButtonText: { color: colors.white, fontSize: 16, fontFamily: fontNames.semibold },
  publishedButtonText: { color: colors.gray },
  actionsContainer: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },
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
  pdfViewer: { flex: 1 },
  pdfLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pdfLoadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.gray,
    fontFamily: fontNames.regular,
  },
  pdfErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
  retryButtonText: { color: colors.white, fontSize: 14, fontFamily: fontNames.medium },
  commentsLoadingContainer: { padding: 24, alignItems: 'center', justifyContent: 'center' },
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
  commentsList: { marginBottom: 16 },
  commentItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  commentUserImage: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
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
  commentUserInfo: { flex: 1 },
  commentUserName: { fontSize: 14, color: colors.primary, fontFamily: fontNames.semibold },
  commentDate: { fontSize: 12, color: colors.gray, fontFamily: fontNames.regular },
  commentContent: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fontNames.regular,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
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
  modalTitle: { fontSize: 18, fontFamily: fontNames.semibold, color: colors.primary },
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
  modalActions: { flexDirection: 'row', gap: 12 },
  modalActionButton: { flex: 1 },
  cardMainImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 12 },
});

export default CardDetailScreen;
