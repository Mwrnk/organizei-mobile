import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootTabParamList } from './types';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';

const Stack = createStackNavigator<RootTabParamList>();

const AuthRoutes = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export default AuthRoutes;
