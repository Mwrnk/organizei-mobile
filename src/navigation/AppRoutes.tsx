import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { RootTabParamList } from './types';
import CustomTabBar from '@components/CustomTabBar';

import HomeScreen from '@screens/HomeScreen';
import EscolarScreen from '@screens/EscolarScreen';
import CommunityScreen from '@screens/CommunityScreen';
import AIScreen from '@screens/AIScreen';
import ProfileScreen from '@screens/ProfileScreen';
import PlanScreen from '@screens/PlanScreen';
import EditProfileScreen from '@screens/EditProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ProfileStack = createStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Plan" component={PlanScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

const AppRoutes = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Escolar" component={EscolarScreen} />
    <Tab.Screen name="Comunidade" component={CommunityScreen} />
    <Tab.Screen name="IA" component={AIScreen} />
    <Tab.Screen name="Eu" component={ProfileStackScreen} />
  </Tab.Navigator>
);

export default AppRoutes;
