import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../src/lib/supabaseClient';

export default function LocationScreen({ navigation, route }) {
  const { name, phone } = route.params;
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Requesting location...');

  useEffect(() => {
    registerUser();
  }, []);

  const registerUser = async () => {
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoading(false);
        return;
      }

      setStatusText('Fetching location...');
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      setStatusText('Saving data...');
      const { data, error } = await supabase
        .from('users')
        .insert([{ name, phone, latitude, longitude }])
        .select();

      if (error) {
        Alert.alert('Error', `Failed to save user: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        Alert.alert('Success', 'User registered successfully!');
        navigation.replace('Main');
      }

    } catch (err) {
      Alert.alert('Error', 'Something went wrong: ' + err.message);
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Registration</Text>
      <Text>Name: {name}</Text>
      <Text>Phone: {phone}</Text>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2b6cb0" />
          <Text>{statusText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  loading: { marginTop: 20, alignItems: 'center' }
});
