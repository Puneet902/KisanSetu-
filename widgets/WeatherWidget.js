import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import useLocalization from '../hooks/useLocalization';
import { supabase } from '../src/lib/supabaseClient';

export default function WeatherWidget({ weatherData = { temperature: '33°C', condition: 'Sunny', city: 'Delhi' } }) {
  const { t } = useLocalization();
  const [userLocation, setUserLocation] = useState(null); // start with null
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, latitude, longitude')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.log('Supabase error:', error);
        setUserLocation('Unknown');
        setLoadingLocation(false);
        return;
      }

      if (data && data.length > 0) {
        const { name, latitude, longitude } = data[0];

        // Try reverse geocoding with better error handling for precise location
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'KisanSetu-App/1.0'
              }
            }
          );
          
          if (res.ok) {
            const locationData = await res.json();
            
            if (locationData && locationData.address) {
              const address = locationData.address;
              
              // Get the most relevant single location name (prioritize local areas)
              const singleLocation = 
                address.town ||           // Towns like Mangalagiri
                address.village ||        // Villages  
                address.suburb ||         // Suburbs/areas
                address.neighbourhood ||  // Neighborhoods
                address.locality ||       // Local areas
                address.city ||           // Cities (lower priority)
                address.municipality ||
                address.county ||
                address.state ||
                `${name}'s Location`;
              
              setUserLocation(singleLocation);
            } else {
              setUserLocation(`${name}'s Location`);
            }
          } else {
            setUserLocation(`${name}'s Location`);
          }
        } catch (geoError) {
          console.log('Geocoding error:', geoError);
          setUserLocation(`${name}'s Location`);
        }
      } else {
        setUserLocation('No Location Data');
      }
    } catch (err) {
      console.log('Error fetching user location:', err);
      setUserLocation('Unknown');
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('weather')}</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.temp}>{weatherData.temperature}</Text>
          <Text style={styles.sub}>
            {weatherData.condition} in {loadingLocation ? <ActivityIndicator size="small" /> : userLocation}
          </Text>
        </View>
      </View>
      <View style={styles.forecastRow}>
        {['Mon','Tue','Wed','Thu','Fri'].map((d) => (
          <View key={d} style={styles.forecastItem}>
            <Text style={styles.forecastDay}>{d}</Text>
            <Text style={styles.forecastTemp}>31°C</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center' },
  temp: { fontSize: 28, fontWeight: '800', color: '#111827' },
  sub: { color: '#6b7280', marginTop: 2 },
  forecastRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  forecastItem: { alignItems: 'center' },
  forecastDay: { fontWeight: '600' },
  forecastTemp: { color: '#6b7280' }
});
