import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import {
  ChevronLeftIcon,
  OfflineIcon,
  CloudIcon,
  SoilHealthIcon,
  AdvisoryDataIcon
} from './Icons';

const DataSyncCard = ({ icon, title, lastSynced }) => (
  <View style={styles.card}>
    <View style={styles.cardIcon}>{icon}</View>
    <View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{lastSynced}</Text>
    </View>
  </View>
);

const OfflineScreen = () => {
  const { t } = useLocalization();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <ChevronLeftIcon width={24} height={24} fill="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('offlineMode')}</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <OfflineIcon width={24} height={24} fill="#EF4444" />
          <Text style={styles.statusText}>{t('offlineStatus')}</Text>
        </View>

        <View style={{ marginTop: 16, gap: 12 }}>
          <DataSyncCard 
            icon={<CloudIcon width={32} height={32} />}
            title={t('weatherData')}
            lastSynced={`${t('lastSynced')}: Today, 10:30 AM`}
          />
          <DataSyncCard 
            icon={<SoilHealthIcon width={32} height={32} />}
            title={t('soilHealthData')}
            lastSynced={`${t('lastSynced')}: Yesterday, 04:00 PM`}
          />
          <DataSyncCard 
            icon={<AdvisoryDataIcon width={32} height={32} />}
            title={t('advisoryData')}
            lastSynced={`${t('lastSynced')}: Yesterday, 06:15 PM`}
          />
        </View>

        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateText}>{t('updateWhenAvailable')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(220,252,231,0.5)',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  updateButton: {
    marginTop: 16,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OfflineScreen;
