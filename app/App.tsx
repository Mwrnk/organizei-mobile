import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CustomTabBar from '../src/components/CustomTabBar';

import HomeScreen from '../src/views/HomeScreen';
import CommunityScreen from '../src/views/CommunityScreen';
import AIScreen from '../src/views/AIScreen';
import ProfileScreen from '../src/views/ProfileScreen';


export type RootTabParamList = {
  Home: undefined;
  Comunidade: undefined;
  IA: undefined;
  Eu: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Comunidade" component={CommunityScreen} />
        <Tab.Screen name="IA" component={AIScreen} />
        <Tab.Screen name="Eu" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
