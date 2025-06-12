import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ICard } from '../../types/community.types';
import { useCommunity } from '../../contexts/CommunityContext';
import LikeButton from './LikeButton';
import CommentsButton from './CommentsButton';
import DownloadButton from './DownloadButton';
import colors from '@styles/colors';

interface Props {
  card: ICard;
  onPress: () => void;
}

const CommunityCard: React.FC<Props> = ({ card, onPress }) => {
  const { likeCard, unlikeCard } = useCommunity();

  const handleLikeToggle = () => {
    if (card.likedByUser) {
      unlikeCard(card.id);
    } else {
      likeCard(card.id);
    }
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <Image
        source={{ uri: card.image_url?.[0] || 'https://via.placeholder.com/120x80' }}
        style={styles.image}
      />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {card.title}
        </Text>
        <View style={styles.actionsRow}>
          <LikeButton liked={!!card.likedByUser} count={card.likes} onPress={handleLikeToggle} />
          <DownloadButton count={card.downloads} cardId={card.id} />
          <CommentsButton
            count={Array.isArray(card.comments) ? card.comments.length : (card.comments as number)}
            cardId={card.id}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: { width: '100%', height: 120, backgroundColor: '#eee' },
  body: { padding: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
});

export default CommunityCard;
