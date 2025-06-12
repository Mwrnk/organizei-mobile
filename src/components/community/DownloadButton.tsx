import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';
import DownloadSheet from './DownloadSheet';

interface Props {
  cardId: string;
  count: number;
}

const DownloadButton: React.FC<Props> = ({ cardId, count }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="download-outline" size={18} color={colors.gray} />
        <Text style={styles.count}>{count}</Text>
      </TouchableOpacity>
      <DownloadSheet visible={visible} onClose={() => setVisible(false)} cardId={cardId} />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  count: { marginLeft: 4, color: colors.gray, fontSize: 12 },
});
export default DownloadButton;
