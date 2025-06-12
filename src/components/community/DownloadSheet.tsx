import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import colors from '@styles/colors';
import api from '../../services/api';
import { useCommunity } from '../../contexts/CommunityContext';
// @ts-ignore
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  cardId: string;
}

interface IList {
  id: string;
  name: string;
}

const DownloadSheet: React.FC<Props> = ({ visible, onClose, cardId }) => {
  const [lists, setLists] = useState<IList[]>([]);
  const [loading, setLoading] = useState(false);
  const { downloadCard } = useCommunity();

  const loadLists = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ status: string; data: any[] }>('/lists');
      const normalized = data.data.map((l) => ({ id: l.id || l._id, name: l.name }));
      setLists(normalized);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar listas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) loadLists();
  }, [visible]);

  const handleSelect = async (listId: string) => {
    await downloadCard(cardId, listId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Escolha uma lista</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <FlatList
              data={lists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => handleSelect(item.id)}>
                  <Text style={{ color: '#222' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.gray, textAlign: 'center' }}>Nenhuma lista</Text>
              }
            />
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: colors.white,
    maxHeight: '60%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.lightGray },
  closeBtn: { marginTop: 8, alignSelf: 'center' },
});
export default DownloadSheet;
