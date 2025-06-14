import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@styles/colors';

interface Props {
  liked: boolean;
  count: number;
  onPress: () => void;
  loading?: boolean;
}

const LikeButton: React.FC<Props> = ({ liked, count, onPress, loading = false }) => {
  // Memoiza o ícone e cor para evitar cálculos em cada re-render
  const iconName = useMemo(() => (liked ? 'heart' : 'heart-outline'), [liked]);
  const iconColor = useMemo(() => (liked ? colors.highPriority : colors.gray), [liked]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size={16} color={colors.primary} />
      ) : (
        <Ionicons name={iconName} size={18} color={iconColor} />
      )}
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  count: { marginLeft: 4, color: colors.gray, fontSize: 12 },
});

export default LikeButton;
