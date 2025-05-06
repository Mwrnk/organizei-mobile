import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootTabParamList } from './types';
import LoginScreen from '@screens/LoginScreen';

const Stack = createStackNavigator<RootTabParamList>();

const AuthRoutes = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

export default AuthRoutes;
