import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalization } from '../hooks/useLocalization';
import { EditIcon, CameraIcon, SettingsIcon } from './Icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../src/lib/supabaseClient';

// --- Reusable Modern ToggleSwitch Component ---
const ToggleSwitch = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  return (
    <TouchableOpacity
      onPress={() => setIsEnabled(!isEnabled)}
      style={[styles.toggle, isEnabled ? styles.toggleOn : styles.toggleOff]}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleKnob, isEnabled ? styles.knobOn : styles.knobOff]}>
        <LinearGradient
          colors={isEnabled ? ['#22c55e', '#16a34a'] : ['#ffffff', '#f3f4f6']}
          style={styles.toggleKnobGradient}
        />
      </View>
    </TouchableOpacity>
  );
};

// --- Data for Modals ---
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

// --- Data for Dropdowns ---
const cropOptions = ['Wheat', 'Rice', 'Maize', 'Others'];
const fertilizerOptions = ['Urea', 'DAP', 'Potash', 'Others'];

export default function ProfileScreen() {
  const { t, language, setLanguage } = useLocalization();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [profileData, setProfileData] = useState({
    name: 'Loading...',
    landSize: '2.5',
    soilType: 'Loamy Soil',
    profileImage: 'https://via.placeholder.com/150/16a34a/ffffff?text=Profile',
    currentCrop: 'Wheat',
    lastSeasonYield: '',
    fertilizer: 'Urea',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, latitude, longitude')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.log('Supabase error:', error);
        setProfileData(prev => ({ ...prev, name: 'Unknown User' }));
        return;
      }

      if (data && data.length > 0) {
        const { name } = data[0];
        console.log('Fetched user name:', name);
        setProfileData(prev => ({ ...prev, name: name || 'Unknown User' }));
      } else {
        setProfileData(prev => ({ ...prev, name: 'No User Data' }));
      }
    } catch (err) {
      console.log('Error fetching user data:', err);
      setProfileData(prev => ({ ...prev, name: 'Error Loading' }));
    } finally {
      setLoadingUserData(false);
    }
  };

  const languageLabel = (() => {
    switch (language) {
      case 'hi':
        return t('Hindi >') || 'हिन्दी >';
      case 'ta':
        return t('Tamil >') || 'தமிழ் >';
      case 'te':
        return t('Telugu >') || 'తెలుగు >';
      default:
        return t('English >') || 'English >';
    }
  })();

  const handleLanguageSelect = (langCode) => {
    if (typeof setLanguage === 'function') {
      setLanguage(langCode);
    }
    setLanguageModalVisible(false);
  };

  const handleProfileUpdate = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setOpenDropdown(null);
    setEditModalVisible(false);
  };

  // --- Image Picker Functions ---
  const handleImagePicker = () => {
    setImagePickerModalVisible(true);
  };

  const handleCameraCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileData((prev) => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }));
    }
    setImagePickerModalVisible(false);
  };

  const handleGalleryPick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileData((prev) => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }));
    }
    setImagePickerModalVisible(false);
  };

  const handleDropdownSelect = (field, value) => {
    if (value === 'Others') {
      handleProfileUpdate(field, '');
    } else {
      handleProfileUpdate(field, value);
    }
    setOpenDropdown(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header Gradient - Matching HomeScreen */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Text style={styles.headerGreeting}>Welcome Back! 👋</Text>
            <Text style={styles.headerText}>{t('profileAndSettings') || 'Profile & Settings'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.1)', 'rgba(22, 163, 74, 0.05)']}
            style={styles.profileCardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.profileInfo}>
                <TouchableOpacity onPress={handleImagePicker} activeOpacity={0.8}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{ uri: profileData.profileImage }}
                      style={styles.avatar}
                    />
                    <LinearGradient
                      colors={['#22c55e', '#16a34a']}
                      style={styles.cameraIconOverlay}
                    >
                      <CameraIcon style={styles.cameraIcon} />
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
                <View style={styles.profileTextContainer}>
                  {loadingUserData ? (
                    <View style={styles.loadingNameContainer}>
                      <ActivityIndicator size="small" color="#16a34a" />
                      <Text style={styles.loadingNameText}>Loading...</Text>
                    </View>
                  ) : (
                    <Text style={styles.profileName}>{profileData.name}</Text>
                  )}
                  <Text style={styles.profileSubtext}>Farmer Profile</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(true)}
                style={styles.editButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#f0fdf4', '#dcfce7']}
                  style={styles.editButtonGradient}
                >
                  <EditIcon style={styles.editIcon} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profileData.landSize}</Text>
                  <Text style={styles.statLabel}>{t('acresUnit') || 'Acres'}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profileData.soilType}</Text>
                  <Text style={styles.statLabel}>{t('soilType') || 'Soil Type'}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* App Settings */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{t('appSettings') || 'App Settings'}</Text>
            <View style={styles.cardTitleAccent} />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>{t('language') || 'Language'}</Text>
              <Text style={styles.settingSubtext}>Choose your preferred language</Text>
            </View>
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(true)}
              style={styles.languageButton}
              activeOpacity={0.7}
            >
              <Text style={styles.languageText}>{languageLabel}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>
                {t('voiceAssistant') || 'Voice Assistant'}
              </Text>
              <Text style={styles.settingSubtext}>Enable voice commands</Text>
            </View>
            <ToggleSwitch />
          </View>
        </View>

        {/* Offline Data */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{t('Offline Data') || 'Offline Data'}</Text>
            <View style={styles.cardTitleAccent} />
          </View>
          <TouchableOpacity style={styles.modernActionBtn} activeOpacity={0.8}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb', '#1d4ed8']}
              style={styles.actionBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionBtnText}>
                {t('Download Advisory Data') || 'Download Advisory Data'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Farm Records */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{t('Farm Records') || 'Farm Records'}</Text>
            <View style={styles.cardTitleAccent} />
          </View>
          <View style={styles.recordItem}>
            <Text style={styles.recordLabel}>{t('Current Crop') || 'Current Crop'}</Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              style={styles.recordValue}
              activeOpacity={0.7}
            >
              <Text style={styles.recordText}>{profileData.currentCrop}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recordItem}>
            <Text style={styles.recordLabel}>
              {t('Last Season Yield') || 'Last Season Yield (Quintals)'}
            </Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              style={styles.recordValue}
              activeOpacity={0.7}
            >
              <Text style={styles.recordText}>
                {profileData.lastSeasonYield || 'Enter Yield'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recordItem}>
            <Text style={styles.recordLabel}>
              {t('Fertilizer Used') || 'Fertilizer Used'}
            </Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              style={styles.recordValue}
              activeOpacity={0.7}
            >
              <Text style={styles.recordText}>{profileData.fertilizer}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{t('Support') || 'Support'}</Text>
            <View style={styles.cardTitleAccent} />
          </View>
          <TouchableOpacity style={styles.supportButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#f8fafc', '#f1f5f9']}
              style={styles.supportBtnGradient}
            >
              <Text style={styles.supportBtnText}>
                {t('Help And Support') || 'Help & Support'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={styles.blurOverlay}>
            <View style={styles.editModalContainer}>
              <LinearGradient
                colors={['#ffffff', '#fafafa']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <View style={styles.modalTitleAccent} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={profileData.name}
                      onChangeText={(text) => handleProfileUpdate('name', text)}
                      placeholder="Enter your name"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Land Size (Acres)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={profileData.landSize}
                      onChangeText={(text) => handleProfileUpdate('landSize', text)}
                      placeholder="Enter land size"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Soil Type</Text>
                    <TextInput
                      style={styles.textInput}
                      value={profileData.soilType}
                      onChangeText={(text) => handleProfileUpdate('soilType', text)}
                      placeholder="Enter soil type"
                    />
                  </View>

                  <View
                    style={[
                      styles.inputGroup,
                      openDropdown === 'crop' && styles.dropdownActive,
                    ]}
                  >
                    <Text style={styles.inputLabel}>Current Crop</Text>
                    <TouchableOpacity
                      style={styles.textInput}
                      onPress={() =>
                        setOpenDropdown(openDropdown === 'crop' ? null : 'crop')
                      }
                    >
                      <Text style={styles.dropdownText}>
                        {profileData.currentCrop || 'Select a crop'}
                      </Text>
                    </TouchableOpacity>
                    {openDropdown === 'crop' && (
                      <View style={styles.dropdownMenu}>
                        {cropOptions.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={styles.dropdownItem}
                            onPress={() => handleDropdownSelect('currentCrop', option)}
                          >
                            <Text style={styles.dropdownItemText}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {!cropOptions.includes(profileData.currentCrop) && (
                      <TextInput
                        style={[styles.textInput, { marginTop: 8 }]}
                        value={profileData.currentCrop}
                        onChangeText={(text) =>
                          handleProfileUpdate('currentCrop', text)
                        }
                        placeholder="Enter custom crop name"
                      />
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Last Season Yield (Quintals)
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      value={profileData.lastSeasonYield}
                      onChangeText={(text) =>
                        handleProfileUpdate('lastSeasonYield', text)
                      }
                      placeholder="Enter yield (e.g., 15)"
                      keyboardType="numeric"
                    />
                  </View>

                  <View
                    style={[
                      styles.inputGroup,
                      openDropdown === 'fertilizer' && styles.dropdownActive,
                    ]}
                  >
                    <Text style={styles.inputLabel}>Fertilizer Used</Text>
                    <TouchableOpacity
                      style={styles.textInput}
                      onPress={() =>
                        setOpenDropdown(
                          openDropdown === 'fertilizer' ? null : 'fertilizer'
                        )
                      }
                    >
                      <Text style={styles.dropdownText}>
                        {profileData.fertilizer || 'Select a fertilizer'}
                      </Text>
                    </TouchableOpacity>
                    {openDropdown === 'fertilizer' && (
                      <View style={styles.dropdownMenu}>
                        {fertilizerOptions.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={styles.dropdownItem}
                            onPress={() =>
                              handleDropdownSelect('fertilizer', option)
                            }
                          >
                            <Text style={styles.dropdownItemText}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {!fertilizerOptions.includes(profileData.fertilizer) && (
                      <TextInput
                        style={[styles.textInput, { marginTop: 8 }]}
                        value={profileData.fertilizer}
                        onChangeText={(text) =>
                          handleProfileUpdate('fertilizer', text)
                        }
                        placeholder="Enter custom fertilizer name"
                      />
                    )}
                  </View>
                </ScrollView>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#22c55e', '#16a34a']}
                      style={styles.saveButtonGradient}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={languageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={styles.blurOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#ffffff', '#fafafa']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {t('selectLanguage') || 'Select Language'}
                  </Text>
                  <View style={styles.modalTitleAccent} />
                </View>
                <FlatList
                  data={languages}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        language === item.code && styles.selectedItem,
                      ]}
                      onPress={() => handleLanguageSelect(item.code)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.langNative,
                          language === item.code && styles.selectedText,
                        ]}
                      >
                        {item.nativeName}
                      </Text>
                      <Text
                        style={[
                          styles.langName,
                          language === item.code && styles.selectedText,
                        ]}
                      >
                        ({item.name})
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setLanguageModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal visible={imagePickerModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={styles.blurOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#ffffff', '#fafafa']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose Image</Text>
                  <View style={styles.modalTitleAccent} />
                </View>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={handleCameraCapture}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalItemText}>📷 Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={handleGalleryPick}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalItemText}>🖼️ Select from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setImagePickerModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </BlurView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingNameText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#6b7280',
  },
  profileCard: {
    borderRadius: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  profileCardGradient: {
    padding: 24,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
  },
  cardTitleContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardTitleAccent: {
    width: 40,
    height: 3,
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileTextContainer: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  profileSubtext: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cameraIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 20,
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButtonGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 18,
    color: '#16a34a',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  languageButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  languageText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#dcfce7',
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: '#f1f5f9',
    alignItems: 'flex-start',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleKnobGradient: {
    flex: 1,
  },
  modernActionBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionBtnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recordLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  recordValue: {
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  supportButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  supportBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  modalGradient: {
    padding: 20,
    borderRadius: 16,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  modalTitleAccent: {
    marginTop: 6,
    alignSelf: 'center',
    width: 40,
    height: 3,
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  selectedItem: {
    backgroundColor: '#dcfce7',
  },
  selectedText: {
    color: '#16a34a',
    fontWeight: '700',
  },
  langNative: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  langName: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  modalClose: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    fontSize: 14,
    color: '#1e293b',
  },
  dropdownText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1e293b',
  },
  dropdownActive: {
    borderColor: '#16a34a',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
