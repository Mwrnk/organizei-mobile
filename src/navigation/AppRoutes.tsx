import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { RootTabParamList, EscolarStackParamList } from './types';
import CustomTabBar from '@components/CustomTabBar';

import GamesScreen from '@screens/games/GamesScreen';
import EscolarScreen from '@screens/escolar/EscolarScreen';
import CreateCardScreen from '@screens/cards/CreateCardScreen';
import CardDetailScreen from '@screens/cards/CardDetailScreen';
import CommunityScreen from '@screens/community/CommunityScreen';
import AIScreen from '@screens/ai/AIScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';
import PlanScreen from '@screens/points/PlanScreen';
import EditProfileScreen from '@screens/profile/EditProfileScreen';
import FlashCardsScreen from '@screens/cards/FlashCardsScreen';
import JogoDoMilhaoScreen from '@screens/games/JogoDoMilhaoScreen';
import PointsScreen from '@screens/points/PointsScreen';
import AboutScreen from '@screens/info/AboutScreen';
import AllCardsScreen from '@screens/cards/AllCardsScreen';
import UserProfileScreen from '@screens/profile/UserProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ProfileStack = createStackNavigator();
const EscolarStack = createStackNavigator<EscolarStackParamList>();
const GameStack = createStackNavigator();
const CommunityStack = createStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Plan" component={PlanScreen} />
      <ProfileStack.Screen name="Points" component={PointsScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="AllCards" component={AllCardsScreen} />
      <ProfileStack.Screen name="CardDetail" component={CardDetailScreen} />
      <ProfileStack.Screen name="Games" component={GamesScreen} />
    </ProfileStack.Navigator>
  );
}

function EscolarStackScreen() {
  return (
    <EscolarStack.Navigator screenOptions={{ headerShown: false }}>
      <EscolarStack.Screen name="EscolarMain" component={EscolarScreen} />
      <EscolarStack.Screen name="CreateCard" component={CreateCardScreen} />
      <EscolarStack.Screen name="CardDetail" component={CardDetailScreen} />
      <EscolarStack.Screen name="Profile" component={ProfileScreen} />
    </EscolarStack.Navigator>
  );
}

function GameStackScreen() {
  return (
    <GameStack.Navigator screenOptions={{ headerShown: false }}>
      <GameStack.Screen name="GameHome" component={GamesScreen} />
      <GameStack.Screen name="FlashCards" component={FlashCardsScreen} />
      <GameStack.Screen name="JogoDoMilhao" component={JogoDoMilhaoScreen} />
      <GameStack.Screen name="Points" component={PointsScreen} />
      <GameStack.Screen name="Plan" component={PlanScreen} />
    </GameStack.Navigator>
  );
}

function CommunityStackScreen() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="CommunityMain" component={CommunityScreen} />
      <CommunityStack.Screen name="CardDetail" component={CardDetailScreen} />
      <CommunityStack.Screen name="UserProfile" component={UserProfileScreen} />
    </CommunityStack.Navigator>
  );
}

const AppRoutes = () => (
  <Tab.Navigator
    initialRouteName="Escolar"
    screenOptions={{ headerShown: false }}
    tabBar={(props: any) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Escolar" component={EscolarStackScreen} />
    <Tab.Screen name="Game" component={GameStackScreen} />
    <Tab.Screen name="Comunidade" component={CommunityStackScreen} />
    <Tab.Screen name="IA" component={AIScreen} />
    <Tab.Screen name="Eu" component={ProfileStackScreen} />
  </Tab.Navigator>
);

export default AppRoutes;
