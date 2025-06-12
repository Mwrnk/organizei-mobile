import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ICard } from '../../types/community.types';
import { useCommunity } from '../../contexts/CommunityContext';
import LikeButton from './LikeButton';
import CommentsButton from './CommentsButton';
import DownloadButton from './DownloadButton';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--/--/--';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <Image
        source={{ uri: card.image_url?.[0] || 'https://via.placeholder.com/300x150' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {card.title}
        </Text>
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            {card.userId?.profileImage ? (
              <Image source={{ uri: card.userId.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{card.userId?.name?.[0] ?? 'U'}</Text>
              </View>
            )}
            <View>
              <Text style={styles.authorName}>{card.userId?.name ?? 'Usuário'}</Text>
              <Text style={styles.date}>{formatDate(card.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <LikeButton liked={!!card.likedByUser} count={card.likes} onPress={handleLikeToggle} />
            <CommentsButton
              count={Array.isArray(card.comments) ? card.comments.length : card.comments}
              cardId={card.id}
            />
            <DownloadButton count={card.downloads} cardId={card.id} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#eee',
  },
  content: { padding: 12 },
  title: {
    fontSize: 18,
    fontFamily: fontNames.bold,
    color: colors.primary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 13,
    fontFamily: fontNames.semibold,
    color: colors.primary,
  },
  date: {
    fontSize: 12,
    fontFamily: fontNames.regular,
    color: colors.gray,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CommunityCard;
