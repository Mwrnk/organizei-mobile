import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import colors from '@styles/colors';
import { fontNames } from '@styles/fonts';
import { ICard } from '../types/community.types';

// Param list for Community stack navigator
export type CommunityStackParamList = {
  UserProfile: { userId: string };
  CardDetail: { card: ICard };
};

type UserProfileRouteProp = RouteProp<CommunityStackParamList, 'UserProfile'>;

type UserProfileNavProp = NativeStackNavigationProp<CommunityStackParamList>;

interface IUser {
  _id?: string;
  id?: string;
  name: string;
  profileImage?: string | null;
  bio?: string;
  orgPoints?: number;
  plan?: string | null;
  coduser?: string;
  email?: string;
  dateOfBirth?: string;
}

const UserProfileScreen: React.FC = () => {
  const { params } = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation<UserProfileNavProp>();
  const { userId } = params;

  const [user, setUser] = useState<IUser | null>(null);
  const [cards, setCards] = useState<ICard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch user and cards in parallel
      const [userRes, cardsRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/cards/user/${userId}`),
      ]);

      setUser(userRes.data.data);
      // Filtrar somente cards publicados
      const fetchedCards: ICard[] = (cardsRes.data.data || []).filter((c: any) => c.is_published);
      setCards(fetchedCards);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Função utilitária para formatar nome do plano
  const formatPlanName = (planId?: string | null) => {
    if (!planId) return 'Free';
    // Caso futuramente existam outros planos, mapeie aqui
    return 'Premium';
  };

  const handleCardPress = (_card: ICard) => {}; // cards section removed

  // Helper to format birth date
  const formatBirthDate = (date?: string) => {
    if (!date) return '--/--/--';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (_) {
      return '--/--/--';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Não foi possível carregar o perfil.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>{user.name?.[0] ?? 'U'}</Text>
            </View>
          )}
          <Text style={styles.name}>{user.name}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        {/* Personal Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Nickname</Text>
              <Text style={styles.infoValue}>{user.coduser ?? '---'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email ?? '---'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Data de Nascimento</Text>
              <Text style={styles.infoValue}>{formatBirthDate(user.dateOfBirth)}</Text>
            </View>
          </View>
        </View>

        {/* Pontos & Plano */}
        <View style={styles.pointsRow}>
          <Text style={styles.pointsText}>Pontos: {user.orgPoints ?? 0}</Text>
        </View>
        <Text style={styles.userPlan}>Plano: {formatPlanName(user.plan)}</Text>

        {/* A seção de cards foi removida conforme solicitado */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 32,
    fontFamily: fontNames.bold,
    color: colors.white,
  },
  name: {
    marginTop: 12,
    fontSize: 24,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  bio: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontNames.regular,
    color: colors.gray,
    textAlign: 'center',
  },
  infoSection: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: fontNames.regular,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    fontFamily: fontNames.semibold,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontNames.semibold,
    color: colors.primary,
    marginRight: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontNames.regular,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fontNames.bold,
    color: colors.primary,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  pointsText: {
    fontSize: 14,
    color: '#222',
    fontFamily: fontNames.regular,
  },
  userPlan: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginTop: 2,
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
    fontFamily: fontNames.bold,
    minHeight: 40,
  },
  placeholderImage: {
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#888',
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
});

export default UserProfileScreen;
