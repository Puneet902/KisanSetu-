import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { HomeIcon, ChatBubbleIcon, MarketIcon, CommunityIcon, ProfileIcon } from './Icons';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLocalization();

  const navItems = [
    { id: 'home', label: t('home'), icon: <HomeIcon width={24} height={24} /> },
    { id: 'advisory', label: t('advisory'), icon: <ChatBubbleIcon width={24} height={24} /> },
    { id: 'market', label: t('market'), icon: <MarketIcon width={24} height={24} /> },
    { id: 'community', label: t('community'), icon: <CommunityIcon width={24} height={24} /> },
    { id: 'profile', label: t('profile'), icon: <ProfileIcon width={24} height={24} /> },
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.nav}>
        {navItems.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setActiveTab(item.id)}
            style={styles.navItem}
          >
            {React.cloneElement(item.icon, {
              color: activeTab === item.id ? '#16a34a' : '#6b7280'
            })}
            <Text style={[styles.label, activeTab === item.id && { color: '#16a34a' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    elevation: 5,
  },
  nav: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    color: '#6b7280',
  },
});

export default BottomNav;
