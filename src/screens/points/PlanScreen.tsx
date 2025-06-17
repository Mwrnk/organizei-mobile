import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { fontNames } from '@styles/fonts';
import colors from '@styles/colors';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@contexts/AuthContext';
import { AuthService } from '../../services/auth';
import api from '../../services/api';

// Função utilitária multiplataforma para alertas
function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

const PlanScreen = () => {
  const { user, updateUserData } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [freePlanId, setFreePlanId] = useState<string | null>(null);
  const [premiumPlanId, setPremiumPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/plans');
        setPlans(response.data.data);
        const freePlan = response.data.data.find((plan: any) => plan.isDefault);
        setFreePlanId(freePlan?._id || null);
        const premiumPlan = response.data.data.filter((plan: any) => !plan.isDefault).sort((a: any, b: any) => b.price - a.price)[0];
        setPremiumPlanId(premiumPlan?._id || null);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
      }
    };
    fetchPlans();
  }, []);

  const isUserPremium = user?.plan && freePlanId && user.plan !== freePlanId;

  // Filtra apenas o plano mensal
  const selectedPlan: any = plans.filter((plan: any) => !plan.isDefault)
    .find((plan: any) => plan.duration < 365);

  // Função para voltar ao plano free
  const handleDowngrade = async () => {
    if (!user?._id || !freePlanId) return;
    try {
      setLoading(true);
      const updatedUser = await AuthService.updateUserPlan(user._id, freePlanId);
      await updateUserData(updatedUser);
      showAlert('Até logo, Premium!', 'Sentiremos sua falta! Você voltou para o plano Free, mas esperamos te ver novamente como Premium em breve. 😊');
      navigation.goBack();
    } catch (error) {
      showAlert('Erro', 'Não foi possível alterar seu plano.');
    } finally {
      setLoading(false);
    }
  };

  // Função para assinar o plano premium
  const handleUpgrade = async () => {
    if (!user?._id || !premiumPlanId) return;
    try {
      setLoading(true);
      const updatedUser = await AuthService.updateUserPlan(user._id, premiumPlanId);
      await updateUserData(updatedUser);
      showAlert('Obrigado por apoiar!', 'Parabéns! Agora você é Premium. Agradecemos por apoiar nosso projeto e esperamos que aproveite todos os benefícios! 🥳');
      navigation.goBack();
    } catch (error) {
      showAlert('Erro', 'Não foi possível assinar o plano premium.');
    } finally {
      setLoading(false);
    }
  };

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
            value={!!(user?.plan && user.plan !== freePlanId)}
            onValueChange={(value) => {
              if (value) {
                // Aqui você pode implementar o upgrade para premium se quiser
              } else {
                handleDowngrade();
              }
            }}
            trackColor={{ false: '#EAEAEA', true: colors.button }}
            thumbColor={user?.plan && user.plan !== freePlanId ? colors.button : '#fff'}
            style={styles.switch}
          />
          <Text style={styles.title}>premium</Text>
        </View>
      </View>

      {/* Plano atual */}
      <Text style={styles.currentPlan}>
        Seu Plano: <Text style={styles.currentPlanFree}>{isUserPremium ? 'Premium' : 'Free'}</Text>
      </Text>

      {/* Card do plano mensal */}
      <View style={styles.planContainer}>
        {selectedPlan && (
          <>
            <Text style={styles.planTitle}>{selectedPlan.name}</Text>
            <Text style={styles.planPrice}>R$ {selectedPlan.price.toFixed(2)}/mês</Text>
            <View style={styles.featuresList}>
              {selectedPlan.features.map((feature: string, idx: number) => (
                <View key={idx} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            {isUserPremium ? (
              <TouchableOpacity style={styles.downgradeButton} onPress={handleDowngrade} disabled={loading}>
                <Text style={styles.downgradeButtonText}>{loading ? 'Processando...' : 'Voltar para o Free'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} disabled={loading}>
                <Text style={styles.upgradeButtonText}>{loading ? 'Processando...' : 'Assinar Premium'}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
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
    fontSize: 36,
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
  planContainer: {
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
  planPrice: {
    color: '#fff',
    fontSize: 32,
    fontFamily: fontNames.bold,
    marginBottom: 12,
  },
  featuresList: {
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    color: '#4CD964',
    fontSize: 20,
    fontFamily: fontNames.bold,
    marginRight: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: fontNames.bold,
  },
  downgradeButton: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 48,
    marginTop: 8,
    marginBottom: 8,
  },
  downgradeButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: fontNames.bold,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 48,
    marginTop: 8,
    marginBottom: 8,
  },
  upgradeButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: fontNames.bold,
    textAlign: 'center',
  },
}); 
