import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useLocalization from '../hooks/useLocalization';

export default function MarketPriceWidget({ prices = [{ crop: 'Wheat', price: '₹2000' }, { crop: 'Rice', price: '₹2500' }] }) {
  const { t } = useLocalization();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('market')}</Text>
      {prices.map((item) => (
        <View key={item.crop} style={styles.row}>
          <Text style={styles.crop}>{item.crop}</Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#111827' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  crop: { fontWeight: '600' },
  price: { fontWeight: '700' }
});
