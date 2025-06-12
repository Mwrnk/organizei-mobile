import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';
import CommentsModal from './CommentsModal';

interface Props {
  cardId: string;
  count: number;
}

const CommentsButton: React.FC<Props> = ({ cardId, count }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="chatbubble-outline" size={18} color={colors.gray} />
        <Text style={styles.count}>{count}</Text>
      </TouchableOpacity>
      <CommentsModal visible={visible} onClose={() => setVisible(false)} cardId={cardId} />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  count: { marginLeft: 4, color: colors.gray, fontSize: 12 },
});
export default CommentsButton;
