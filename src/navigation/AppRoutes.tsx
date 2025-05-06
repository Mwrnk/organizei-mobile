import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import CustomTabBar from '@components/CustomTabBar';

import HomeScreen from '@screens/HomeScreen';
import CommunityScreen from '@screens/CommunityScreen';
import AIScreen from '@screens/AIScreen';
import ProfileScreen from '@screens/ProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppRoutes = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Comunidade" component={CommunityScreen} />
    <Tab.Screen name="IA" component={AIScreen} />
    <Tab.Screen name="Eu" component={ProfileScreen} />
  </Tab.Navigator>
);

export default AppRoutes;
