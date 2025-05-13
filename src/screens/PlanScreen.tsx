import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { fontNames } from '../styles/fonts';
import colors from '../styles/colors';
import { useNavigation } from '@react-navigation/native';

const PlanScreen = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Título e switch */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Vire um usuário</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Switch
            value={isPremium}
            onValueChange={setIsPremium}
            trackColor={{ false: '#EAEAEA', true: colors.button }}
            thumbColor={isPremium ? colors.button : '#fff'}
            style={styles.switch}
          />
          <Text style={styles.title}>premium</Text>
        </View>
      </View>

      {/* Plano atual */}
      <Text style={styles.currentPlan}>
        Seu Plano: <Text style={styles.currentPlanFree}>Free</Text>
      </Text>

      {/* Tabs mensal/anual */}
      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tab, !isAnnual && styles.tabActive]} onPress={() => setIsAnnual(false)}>
          <Text style={[styles.tabText, !isAnnual && styles.tabTextActive]}>Mensal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, isAnnual && styles.tabActive]} onPress={() => setIsAnnual(true)}>
          <Text style={[styles.tabText, isAnnual && styles.tabTextActive]}>Anual</Text>
        </TouchableOpacity>
      </View>

      {/* Card do plano */}
      {isAnnual ? (
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Plano A</Text>
          <View style={styles.planFeaturesRow}>
            <View style={styles.planFeaturesCol}>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureGreen}>✓ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureGreen}>✓ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
            </View>
            <View style={styles.planFeaturesCol}>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureGreen}>✓ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
            </View>
          </View>
          <Text style={styles.price}><Text style={styles.priceCurrency}>R$</Text>00.<Text style={styles.priceCents}>00</Text><Text style={styles.pricePeriod}>/anual</Text></Text>
          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>Assinar</Text>
          </TouchableOpacity>
          <Text style={styles.recommended}>Plano recomendado</Text>
        </View>
      ) : (
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Plano A</Text>
          <View style={styles.planFeaturesRow}>
            <View style={styles.planFeaturesCol}>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureGreen}>✓ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureGreen}>✓ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
            </View>
            <View style={styles.planFeaturesCol}>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureGreen}>✓ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
              <Text style={styles.featureRed}>✗ <Text style={styles.featureText}>Teste</Text></Text>
            </View>
          </View>
          <Text style={styles.price}><Text style={styles.priceCurrency}>R$</Text>00.<Text style={styles.priceCents}>00</Text><Text style={styles.pricePeriod}>/mês</Text></Text>
          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>Assinar</Text>
          </TouchableOpacity>
          <Text style={styles.recommended}>Plano recomendado</Text>
        </View>
      )}
    </View>
  );
};

export default PlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  backArrow: {
    fontSize: 22,
    color: colors.primary,
    fontFamily: fontNames.bold,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: fontNames.bold,
  },
  titleRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: fontNames.bold,
    textAlign: 'center',
  },
  switch: {
    marginHorizontal: 8,
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  currentPlan: {
    fontSize: 15,
    color: colors.primary,
    fontFamily: fontNames.regular,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  currentPlanFree: {
    color: colors.button,
    fontFamily: fontNames.bold,
  },
  tabsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    marginVertical: 12,
    padding: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    color: '#bbb',
    fontFamily: fontNames.bold,
  },
  tabTextActive: {
    color: colors.primary,
  },
  planCard: {
    backgroundColor: '#181818',
    borderRadius: 32,
    marginHorizontal: 18,
    marginTop: 18,
    padding: 24,
    alignItems: 'center',
  },
  planTitle: {
    color: '#fff',
    fontSize: 28,
    fontFamily: fontNames.bold,
    marginBottom: 12,
  },
  planFeaturesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    width: '100%',
  },
  planFeaturesCol: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  featureRed: {
    color: '#FF4C4C',
    fontSize: 16,
    fontFamily: fontNames.bold,
  },
  featureGreen: {
    color: '#4CD964',
    fontSize: 16,
    fontFamily: fontNames.bold,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontNames.regular,
  },
  price: {
    color: '#fff',
    fontSize: 32,
    fontFamily: fontNames.bold,
    marginVertical: 12,
  },
  priceCurrency: {
    fontSize: 18,
    fontFamily: fontNames.regular,
  },
  priceCents: {
    fontSize: 18,
    fontFamily: fontNames.regular,
  },
  pricePeriod: {
    fontSize: 16,
    fontFamily: fontNames.regular,
  },
  subscribeBtn: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 48,
    marginTop: 8,
    marginBottom: 8,
  },
  subscribeBtnText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: fontNames.bold,
    textAlign: 'center',
  },
  recommended: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fontNames.regular,
    marginTop: 8,
    opacity: 0.7,
  },
}); 
