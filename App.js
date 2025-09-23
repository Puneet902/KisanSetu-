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
import LocationScreen from './components/LocationScreen';
import MultiStepOnboarding from './components/MultiStepOnboarding';
import LanguageSelector from './components/LanguageSelector';
import LocationPermissionModal from './components/LocationPermissionModal';

const Stack = createStackNavigator();

export default function App() {
  const [languageSelected, setLanguageSelected] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Language selection step
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

  // After onboarding, show location modal
  const handleOnboardingDone = () => {
    setOnboardingDone(true);
    setLocationModalVisible(true);
  };

  const handleAllowLocation = () => {
    setLocationModalVisible(false);
  };
  const handleSkipLocation = () => {
    setLocationModalVisible(false);
  };

  return (
    <NavigationContainer>
      <LocalizationProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          {!languageSelected ? (
            <LanguageSetter />
          ) : !onboardingDone ? (
            <MultiStepOnboarding onDone={handleOnboardingDone} onSkip={handleOnboardingDone} />
          ) : (
            <>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Location" component={LocationScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
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
