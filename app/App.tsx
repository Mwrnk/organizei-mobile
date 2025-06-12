import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { customFonts } from '@styles/fonts';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';
import Routes from '../src/navigation/Routes';
import { CommunityProvider } from '../src/contexts/CommunityContext';
// @ts-ignore
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync(customFonts);
        console.log('Fonts loaded successfully');
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <AuthProvider>
        <CommunityProvider>
          <Routes />
        </CommunityProvider>
      </AuthProvider>
      <Toast />
    </NavigationContainer>
  );
}
