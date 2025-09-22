import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { LocationMarkerIcon } from './Icons';

const LocationPermissionModal = ({ visible = true, onAllow, onSkip }) => {
  const { t } = useLocalization();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconWrapper}>
            <LocationMarkerIcon width={32} height={32} fill="#16a34a" />
          </View>
          <Text style={styles.title}>{t('locationPermissionTitle')}</Text>
          <Text style={styles.description}>{t('locationPermissionDesc')}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onAllow} style={[styles.button, styles.allowButton]}>
              <Text style={styles.allowText}>{t('allowLocation')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSkip} style={[styles.button, styles.skipButton]}>
              <Text style={styles.skipText}>{t('maybeLater')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    spaceBetween: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  allowButton: {
    backgroundColor: '#16a34a',
  },
  skipButton: {
    backgroundColor: '#f3f4f6',
  },
  allowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  skipText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LocationPermissionModal;
