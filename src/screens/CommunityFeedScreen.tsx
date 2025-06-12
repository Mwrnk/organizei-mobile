import React from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useCommunity } from '../contexts/CommunityContext';
import CommunityCard from '../components/community/CommunityCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '@styles/colors';
import { ICard } from '../types/community.types';

type RootStackParamList = {
  CardDetail: { card: ICard };
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'CardDetail'>;

const CommunityFeedScreen = () => {
  const { feed, loading, refreshing, loadMore, refreshFeed } = useCommunity();
  const navigation = useNavigation<Nav>();

  const handlePress = (card: ICard) => {
    navigation.navigate('CardDetail', { card });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={feed}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CommunityCard card={item} onPress={() => handlePress(item)} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.2}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshFeed}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default CommunityFeedScreen;
