import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

const recommendedCards = [
  {
    id: '1',
    title: 'Citações Fisioterapia',
    date: '11/01/01',
    type: 'Escolar',
    image: 'https://via.placeholder.com/120x80',
    avatar: null,
  },
  {
    id: '2',
    title: 'Banco de Dados...',
    date: '11/01/01',
    type: 'Profissional',
    image: 'https://via.placeholder.com/120x80',
    avatar: 'https://via.placeholder.com/24',
  },
  {
    id: '3',
    title: 'Boas práticas\nFront End',
    date: '11/01/01',
    type: 'Profissional',
    image: 'https://via.placeholder.com/240x80',
    avatar: 'https://via.placeholder.com/24',
  },
];

const CommunityScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('Escolar');
  const [selectedCard, setSelectedCard] = useState('');

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>O que está procurando hoje?</Text>

      {/* Barra de busca */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquise o nome do card..."
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={22} color="#181818" />
        </TouchableOpacity>
      </View>

      {/* Recomendados */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>#recomendados</Text>
        <View style={styles.sectionLine} />
      </View>
      <FlatList
        data={recommendedCards}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardBox}>
            <Image source={{ uri: item.image }} style={styles.cardImg} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardFooterRow}>
              <Text style={styles.cardDate}>{item.date}</Text>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.cardAvatar} />
              ) : (
                <Ionicons name="person-circle-outline" size={18} color="#181818" style={{ marginLeft: 4 }} />
              )}
              <Text style={styles.cardType}>{item.type}</Text>
            </View>
          </View>
        )}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 18 }}
      />

      {/* Publique */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>#publique</Text>
        <View style={styles.sectionLine} />
      </View>
      <Text style={styles.publishTitle}>Publique os seus cards{"\n"}mais fácil!</Text>
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>Selecionar o card</Text>
        <Ionicons name="chevron-down" size={20} color="#888" />
      </TouchableOpacity>
      <View style={styles.radioRow}>
        <TouchableOpacity style={styles.radioBtn} onPress={() => setSelectedType('Escolar')}>
          <View style={[styles.radioCircle, selectedType === 'Escolar' && styles.radioCircleActive]} />
          <Text style={styles.radioLabel}>Escolar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioBtn} onPress={() => setSelectedType('Profissional')}>
          <View style={[styles.radioCircle, selectedType === 'Profissional' && styles.radioCircleActive]} />
          <Text style={styles.radioLabel}>Profissional</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.publishBtn}>
        <Text style={styles.publishBtnText}>Publicar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: fontNames.bold,
    color: colors.primary,
    marginBottom: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 24,
    paddingHorizontal: 18,
    marginBottom: 18,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontNames.regular,
    color: colors.primary,
  },
  searchBtn: {
    backgroundColor: '#181818',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fontNames.regular,
    color: '#222',
    fontSize: 14,
    marginRight: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
    borderRadius: 1,
  },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImg: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontFamily: fontNames.bold,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    fontFamily: fontNames.regular,
    marginRight: 8,
  },
  cardAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginHorizontal: 4,
  },
  cardType: {
    fontSize: 12,
    color: '#888',
    fontFamily: fontNames.regular,
    marginLeft: 8,
  },
  publishTitle: {
    fontFamily: fontNames.bold,
    fontSize: 20,
    color: colors.primary,
    marginBottom: 12,
    marginTop: 8,
  },
  dropdown: {
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dropdownText: {
    fontFamily: fontNames.regular,
    color: '#888',
    fontSize: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 18,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#EAEAEA',
    backgroundColor: '#EAEAEA',
    marginRight: 6,
  },
  radioCircleActive: {
    borderColor: colors.button,
    backgroundColor: colors.button,
  },
  radioLabel: {
    fontFamily: fontNames.regular,
    color: colors.primary,
    fontSize: 15,
  },
  publishBtn: {
    backgroundColor: colors.button,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 18,
  },
  publishBtnText: {
    color: '#fff',
    fontFamily: fontNames.bold,
    fontSize: 16,
  },
});
