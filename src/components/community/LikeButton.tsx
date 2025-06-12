import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';

interface Props {
  liked: boolean;
  count: number;
  onPress: () => void;
}

const LikeButton: React.FC<Props> = ({ liked, count, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={18}
        color={liked ? colors.highPriority : colors.gray}
      />
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  count: { marginLeft: 4, color: colors.gray, fontSize: 12 },
});

export default LikeButton;
