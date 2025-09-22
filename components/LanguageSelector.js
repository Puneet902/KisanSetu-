import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, FlatList } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { LogoIcon } from './Icons';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

const LanguageSelector = ({ onSelect }) => {
  const { t } = useLocalization();
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(languages[0]);

  const open = () => setModalVisible(true);
  const close = () => setModalVisible(false);

  const pick = (lang) => {
    setSelected(lang);
    close();
    if (typeof onSelect === 'function') onSelect(lang.code);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={{ width: 200, height: 200, marginBottom: 10 }} />
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.description}>{t('appDescription')}</Text>

      <Text style={styles.subtitle}>{t('selectLanguage')}</Text>

      <TouchableOpacity style={styles.dropdown} onPress={open}>
        <Text style={styles.dropdownText}>{selected.nativeName} ({selected.name})</Text>
        <Text style={styles.dropdownChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => pick(item)}>
                  <Text style={styles.langNative}>{item.nativeName}</Text>
                  <Text style={styles.langName}> ({item.name})</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={close}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fff4', // soft green-tinged background
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#064e3b', // deep green
    marginTop: 6,
  },
  description: {
    fontSize: 16,
    color: '#14532d',
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 14,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 16,
  },
  dropdown: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#064e3b',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#064e3b',
    fontWeight: '600',
  },
  dropdownChevron: {
    color: '#064e3b',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#064e3b',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1fdf6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langNative: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  langName: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  modalClose: {
    marginTop: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#064e3b',
    fontWeight: '700',
  },
});

export default LanguageSelector;
