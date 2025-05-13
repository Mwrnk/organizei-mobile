import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { fontNames } from '../styles/fonts';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootTabParamList } from '../navigation/types';

const dummyCards = [
  {
    id: '1',
    title: 'Citações Fisioterapia',
    date: '11/01/01',
    type: 'Escolar',
    image: 'https://via.placeholder.com/80x60',
  },
  {
    id: '2',
    title: 'Banco de Dados...',
    date: '11/01/01',
    type: 'Profissional',
    image: 'https://via.placeholder.com/80x60',
  },
  {
    id: '3',
    title: 'Boas Práticas Front...',
    date: '11/01/01',
    type: 'Profissional',
    image: 'https://via.placeholder.com/80x60',
  },
];

const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootTabParamList>>();
  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner} />

      {/* Avatar centralizado */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {/* Placeholder do avatar */}
          <Text style={styles.avatarText}>{user?.name ? user.name[0] : 'G'}</Text>
        </View>
      </View>

      {/* Nome, pontos e editar */}
      <View style={styles.nameRow}>
        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.editIconCircle}>
            <Text style={styles.editIcon}>✎</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.pointsRow}>
        <Text style={styles.pointsIcon}>⚡</Text>
        <Text style={styles.pointsText}>+0pts</Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsHeaderRow}>
        <Text style={styles.cardsTitle}>#meus cards</Text>
        <Text style={styles.cardsSeeAll}>Ver todos</Text>
      </View>
      <FlatList
        data={dummyCards}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardsList}
        contentContainerStyle={{ paddingLeft: 12, paddingRight: 12 }}
        renderItem={({ item }) => (
          <View style={styles.cardBox}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardDate}>{item.date}</Text>
              <Text style={styles.cardType}>{item.type}</Text>
            </View>
          </View>
        )}
      />

      {/* Botões de menu */}
      <View style={styles.menuBox}>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Informação Pessoal</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Minhas Análises</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Plan')}>
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuText}>Meu Plano</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Premium */}
      <TouchableOpacity style={styles.premiumBtn}>
        <Text style={styles.premiumBtnText}>Vire Premium</Text>
        <Text style={styles.menuArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    width: '100%',
    height: 140,
    backgroundColor: '#ddd',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 0,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -48,
  },
  avatar: {
    width: 96,
    height: 96,
    backgroundColor: '#181818',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    fontFamily: fontNames.bold,
  },
  editBtn: {
    marginLeft: 8,
  },
  editIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 18,
    color: '#888',
    fontFamily: fontNames.regular,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pointsIcon: {
    fontSize: 16,
    color: '#222',
    marginRight: 2,
  },
  pointsText: {
    fontSize: 14,
    color: '#222',
    fontFamily: fontNames.regular,
  },
  cardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginHorizontal: 18,
  },
  cardsTitle: {
    color: '#222',
    fontWeight: '500',
    fontSize: 13,
    fontFamily: fontNames.semibold,
  },
  cardsSeeAll: {
    color: '#888',
    fontSize: 13,
    fontFamily: fontNames.regular,
  },
  cardsList: {
    marginTop: 8,
    minHeight: 140,
    maxHeight: 160,
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    padding: 10,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 60,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
    fontFamily: fontNames.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDate: {
    fontSize: 11,
    color: '#888',
    fontFamily: fontNames.regular,
  },
  cardType: {
    fontSize: 11,
    color: '#888',
    fontFamily: fontNames.regular,
  },
  menuBox: {
    marginTop: 18,
    marginHorizontal: 12,
  },
  menuBtn: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    fontFamily: fontNames.semibold,
  },
  menuArrow: {
    fontSize: 18,
    color: '#888',
  },
  premiumBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 18,
  },
  premiumBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
    fontFamily: fontNames.bold,
  },
});
