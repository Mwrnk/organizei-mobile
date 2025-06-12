import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import colors from '@styles/colors';
import { IComment } from '../../types/community.types';
import { CommunityService } from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  cardId: string;
}

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CommentsModal: React.FC<Props> = ({ visible, onClose, cardId }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState('');

  const { user } = useAuth();

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await CommunityService.getComments(cardId);
      const normalized = data.map((c) => ({ ...c, id: (c as any).id || (c as any)._id || '' }));
      setComments(normalized as any);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar comentários' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadComments();
    }
  }, [visible, cardId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await CommunityService.createComment(cardId, input.trim());
      setInput('');
      loadComments();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao enviar comentário' });
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await CommunityService.deleteComment(commentId);
      loadComments();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao deletar comentário' });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Comentários</Text>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : comments.length === 0 ? (
              <Text style={styles.empty}>Nenhum comentário ainda</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <View style={styles.commentHeader}>
                    {c.userId?.profileImage ? (
                      <Image source={{ uri: c.userId.profileImage }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {c.userId?.name?.[0]?.toUpperCase() ?? 'U'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.commentAuthorInfo}>
                      <Text style={styles.commentAuthor}>{c.userId?.name || 'Usuário'}</Text>
                      <Text style={styles.commentDate}>{formatCommentDate(c.createdAt)}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentText}>{c.description}</Text>
                  {user && (user._id === c.userId?.id || user.id === c.userId?.id) && (
                    <TouchableOpacity
                      onPress={() => handleDelete(c.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.highPriority} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>
          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Escreva um comentário..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={{ color: colors.white }}>Enviar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  container: { backgroundColor: colors.white, borderRadius: 12, padding: 16, height: '80%' },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.primary,
    textAlign: 'center',
  },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 16 },
  commentRow: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentAuthor: { fontWeight: 'bold', fontSize: 14, color: colors.primary },
  commentDate: {
    fontSize: 11,
    color: colors.gray,
  },
  commentText: { fontSize: 14, color: '#222', lineHeight: 20 },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: 8,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  closeBtn: { marginTop: 8, alignSelf: 'center' },
});

export default CommentsModal;
