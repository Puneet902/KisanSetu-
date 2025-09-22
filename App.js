// Minimal globals shim for modules that expect a browser environment.
// This prevents runtime errors like "Property 'document' doesn't exist" when
// a web-oriented module accidentally runs in the RN bundle.
if (typeof global.window === 'undefined') {
  global.window = global;
}
if (typeof global.document === 'undefined') {
  global.document = {};
}
if (typeof global.navigator === 'undefined') {
  global.navigator = { userAgent: 'react-native' };
}

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import MainTabNavigator from './navigation/MainTabNavigator';
import { useLocalization } from './hooks/useLocalization';
import { LocalizationProvider } from './localization/LocalizationProvider';
import LoginScreen from './components/LoginScreen';
import Onboarding from './components/Onboarding';
import LanguageSelector from './components/LanguageSelector';
import LocationPermissionModal from './components/LocationPermissionModal';

const Stack = createStackNavigator();

export default function App() {
  const [languageSelected, setLanguageSelected] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(true);

  // We'll render a small wrapper inside the provider that can consume setLanguage from context
  const LanguageSetter = () => {
    const { setLanguage } = useLocalization();
    return (
      <LanguageSelector
        onSelect={(code) => {
          if (typeof setLanguage === 'function') setLanguage(code);
          setLanguageSelected(true);
        }}
      />
    );
  };

  const handleAllowLocation = () => {
    // TODO: request device location permissions and save location if granted.
    setLocationModalVisible(false);
  };

  const handleSkipLocation = () => {
    setLocationModalVisible(false);
  };

  // Render the provider at top-level so the LanguageSelector can call setLanguage
  return (
    <NavigationContainer>
      <LocalizationProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          {!languageSelected ? (
            <LanguageSetter />
          ) : (
            <>
              <Stack.Navigator initialRouteName="Onboarding">
                <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
                {/* Disease detection is a flow launched from Home (upload image). Register it on the stack so we can navigate to it */}
                <Stack.Screen name="Disease" component={require('./components/DiseaseDetectionScreen').default} options={{ headerShown: false }} />
              </Stack.Navigator>
              <LocationPermissionModal
                visible={locationModalVisible}
                onAllow={handleAllowLocation}
                onSkip={handleSkipLocation}
              />
            </>
          )}
        </SafeAreaView>
      </LocalizationProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 12, // small extra top padding to avoid notch/bezel overlap
    backgroundColor: '#fff',
  },
});
