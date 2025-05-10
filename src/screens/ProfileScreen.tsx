import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import UserController from '../controllers/UserController';
import BoardController from '../controllers/BoardController';
import api from '../services/api';

// Função utilitária para pegar as iniciais do nome
const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ProfileScreen = () => {
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authUser) return;
      setLoading(true);
      try {
        // Buscar dados do usuário
        const userData = await UserController.getUserById(authUser.id);
        setUser(userData);

        // Buscar plano do usuário
        try {
          const planRes = await api.get(`/users/${authUser.id}/plan`);
          setPlan(planRes.data.data);
        } catch (err) {
          setPlan({ name: 'Gratuito', price: 0 });
        }

        // Buscar boards e cards do usuário
        const boards = await BoardController.getBoards(authUser.id);
        const allCards = boards.flatMap((board: any) => board.cards || []);
        setCards(allCards);
      } catch (err) {
        // fallback
        setUser(null);
        setPlan({ name: 'Gratuito', price: 0 });
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [authUser]);

  // Placeholder para virar premium
  const handlePremium = () => {
    // Implementar navegação para página de assinatura
    alert('Ir para página de assinatura!');
  };

  if (authLoading || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 12 }}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner} />

      {/* Avatar e nome */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.profileImage ? 'IMG' : getInitials(user.name)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPoints}>{user.orgPoints ?? 0} pts</Text>
        </View>
      </View>

      {/* Informações pessoais */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Informações Pessoais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Código</Text>
            <Text style={styles.value}>{user.coduser}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <Text style={styles.value}>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Plano Atual</Text>
            <Text style={styles.value}>{plan?.name || 'Gratuito'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Valor</Text>
            <Text style={styles.value}>{plan?.price === 0 ? 'Gratuito' : `R$ ${plan?.price}`}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Cards criados */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Meus Cards</Text>
        {cards.length > 0 ? (
          <FlatList
            data={cards}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({ item }) => (
              <View style={styles.cardBox}>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 10 }}
          />
        ) : (
          <Text style={styles.emptyText}>Ainda não foram criados cards.</Text>
        )}
      </View>

      {/* Botão Premium */}
      <TouchableOpacity
        style={plan?.name === 'Gratuito' ? styles.premiumButton : styles.premiumButtonActive}
        onPress={handlePremium}
        disabled={plan?.name !== 'Gratuito'}
      >
        <Text style={styles.premiumButtonText}>
          {plan?.name === 'Gratuito' ? 'Vire Premium' : 'Você é premium!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },
  banner: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -40,
    marginLeft: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  avatarText: {
    fontSize: 32,
    color: '#222',
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
  userPoints: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    margin: 4,
    minWidth: 120,
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'red',
    borderRadius: 8,
    padding: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardBox: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginRight: 10,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  premiumButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    margin: 20,
    alignItems: 'center',
  },
  premiumButtonActive: {
    backgroundColor: '#00c851',
    borderRadius: 8,
    padding: 14,
    margin: 20,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
