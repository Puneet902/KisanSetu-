import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useLocalization from '../hooks/useLocalization';

export default function WeatherWidget({ weatherData = { temperature: '33°C', condition: 'Sunny', city: 'Delhi' } }) {
  const { t } = useLocalization();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('weather')}</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.temp}>{weatherData.temperature}</Text>
          <Text style={styles.sub}>{weatherData.condition} in {weatherData.city}</Text>
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
  sub: { color: '#6b7280' },
  forecastRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  forecastItem: { alignItems: 'center' },
  forecastDay: { fontWeight: '600' },
  forecastTemp: { color: '#6b7280' }
});
