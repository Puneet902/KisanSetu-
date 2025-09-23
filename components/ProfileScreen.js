import React, { useState } from 'react';
// Added ScrollView
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, Alert } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { EditIcon, CameraIcon } from './Icons';
import * as ImagePicker from 'expo-image-picker';

// --- Reusable ToggleSwitch Component ---
const ToggleSwitch = () => {
	const [isEnabled, setIsEnabled] = useState(false);
	return (
		<TouchableOpacity onPress={() => setIsEnabled(!isEnabled)} style={[styles.toggle, isEnabled ? styles.toggleOn : styles.toggleOff]}>
			<View style={[styles.toggleKnob, isEnabled ? styles.knobOn : styles.knobOff]} />
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
    
	const [openDropdown, setOpenDropdown] = useState(null); // can be 'crop', 'fertilizer', or null

	const [profileData, setProfileData] = useState({
		name: 'Ram Kumar',
		landSize: '2.5',
		soilType: 'Loamy Soil',
		profileImage: 'https://via.placeholder.com/150/16a34a/ffffff?text=Profile',
		currentCrop: 'Wheat',
		lastSeasonYield: '',
		fertilizer: 'Urea',
	});

	const languageLabel = (() => {
		switch (language) {
			case 'hi': return t('Hindi >') || 'हिन्दी >';
			case 'ta': return t('Tamil >') || 'தமிழ் >';
			case 'te': return t('Telugu >') || 'తెలుగు >';
			default: return t('English >') || 'English >';
		}
	})();

	const handleLanguageSelect = (langCode) => {
		if (typeof setLanguage === 'function') {
			setLanguage(langCode);
		}
		setLanguageModalVisible(false);
	};

	const handleProfileUpdate = (field, value) => {
		setProfileData(prev => ({
			...prev,
			[field]: value
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
			Alert.alert("Permission Required", "You need to allow camera access.");
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setProfileData(prev => ({
				...prev,
				profileImage: result.assets[0].uri,
			}));
		}

		setImagePickerModalVisible(false);
	};

	const handleGalleryPick = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (permissionResult.granted === false) {
			Alert.alert("Permission Required", "You need to allow access to your photos.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setProfileData(prev => ({
				...prev,
				profileImage: result.assets[0].uri,
			}));
		}

		setImagePickerModalVisible(false);
	};
    
    const handleDropdownSelect = (field, value) => {
        if (value === 'Others') {
            handleProfileUpdate(field, ''); // Clear field to allow custom input
        } else {
            handleProfileUpdate(field, value);
        }
        setOpenDropdown(null); // Close dropdown after selection
    };


	return (
		<SafeAreaView style={styles.safeArea}>
            {/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('profileAndSettings') || 'Profile & Settings'}</Text>
			</View>

			<ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.container}>
				{/* Profile Card */}
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<View style={styles.profileInfo}>
							<TouchableOpacity onPress={handleImagePicker}>
								<View style={styles.avatarContainer}>
									<Image source={{ uri: profileData.profileImage }} style={styles.avatar} />
									<View style={styles.cameraIconOverlay}>
										<CameraIcon style={styles.cameraIcon} />
									</View>
								</View>
							</TouchableOpacity>
							<View>
								<Text style={styles.profileName}>{profileData.name}</Text>
							</View>
						</View>
						<TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editButton}>
							<EditIcon style={styles.editIcon} />
						</TouchableOpacity>
					</View>
					<View style={styles.cardBody}>
						<View style={styles.row}>
							<Text>{t('landSize') || 'Land Size'}</Text>
							<Text style={styles.rowValue}>{profileData.landSize} {t('acresUnit') || 'Acres'}</Text>
						</View>
						<View style={styles.row}>
							<Text>{t('soilType') || 'Soil Type'}</Text>
							<Text style={styles.rowValue}>{profileData.soilType}</Text>
						</View>
					</View>
				</View>

				{/* App Settings */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>{t('appSettings') || 'App Settings'}</Text>
					<View style={styles.row}>
						<Text>{t('language') || 'Language'}</Text>
						<TouchableOpacity onPress={() => setLanguageModalVisible(true)}>
							<Text style={styles.linkText}>{languageLabel}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<Text>{t('voiceAssistant') || 'Voice Assistant'}</Text>
						<ToggleSwitch />
					</View>
				</View>

				{/* Offline Data */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>{t('Offline Data') || 'Offline Data'}</Text>
					<TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>{t('Download Advisory Data') || 'Download Advisory Data'}</Text>
                    </TouchableOpacity>
				</View>

				{/* Farm Records */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>{t('Farm Records') || 'Farm Records'}</Text>
					<View style={styles.row}>
						<Text>{t('Current Crop') || 'Current Crop'}</Text>
						<TouchableOpacity onPress={() => setEditModalVisible(true)}>
							<Text style={styles.linkText}>{profileData.currentCrop}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<Text>{t('Last Season Yield') || 'Last Season Yield (Quintals)'}</Text>
						<TouchableOpacity onPress={() => setEditModalVisible(true)}>
							<Text style={styles.linkText}>{profileData.lastSeasonYield || 'Enter Yield'}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<Text>{t('Fertilizer Used') || 'Fertilizer Used'}</Text>
						<TouchableOpacity onPress={() => setEditModalVisible(true)}>
							<Text style={styles.linkText}>{profileData.fertilizer}</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Support */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>{t('Support') || 'Support'}</Text>
					<TouchableOpacity style={styles.secondaryBtn}>
                        <Text>{t('Help And Support') || 'Help & Support'}</Text>
                    </TouchableOpacity>
				</View>
			</ScrollView>

			{/* Edit Modal */}
			<Modal visible={editModalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.editModalContainer}>
						<Text style={styles.modalTitle}>Edit Profile</Text>

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
						
                        <View style={[styles.inputGroup, openDropdown === 'crop' && styles.dropdownActive]}>
                            <Text style={styles.inputLabel}>Current Crop</Text>
                            <TouchableOpacity
                                style={styles.textInput}
                                onPress={() => setOpenDropdown(openDropdown === 'crop' ? null : 'crop')}
                            >
                                <Text style={{ fontSize: 16 }}>{profileData.currentCrop || 'Select a crop'}</Text>
                            </TouchableOpacity>
                            {openDropdown === 'crop' && (
                                <View style={styles.dropdownMenu}>
                                    {cropOptions.map(option => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.dropdownItem}
                                            onPress={() => handleDropdownSelect('currentCrop', option)}
                                        >
                                            <Text>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {!cropOptions.includes(profileData.currentCrop) && (
                                <TextInput
                                    style={[styles.textInput, { marginTop: 8 }]}
                                    value={profileData.currentCrop}
                                    onChangeText={(text) => handleProfileUpdate('currentCrop', text)}
                                    placeholder="Enter custom crop name"
                                />
                            )}
                        </View>

						<View style={styles.inputGroup}>
							<Text style={styles.inputLabel}>Last Season Yield (Quintals)</Text>
							<TextInput
								style={styles.textInput}
								value={profileData.lastSeasonYield}
								onChangeText={(text) => handleProfileUpdate('lastSeasonYield', text)}
								placeholder="Enter yield (e.g., 15)"
								keyboardType="numeric"
							/>
						</View>

                        <View style={[styles.inputGroup, openDropdown === 'fertilizer' && styles.dropdownActive]}>
                            <Text style={styles.inputLabel}>Fertilizer Used</Text>
                            <TouchableOpacity
                                style={styles.textInput}
                                onPress={() => setOpenDropdown(openDropdown === 'fertilizer' ? null : 'fertilizer')}
                            >
                                <Text style={{ fontSize: 16 }}>{profileData.fertilizer || 'Select a fertilizer'}</Text>
                            </TouchableOpacity>
                            {openDropdown === 'fertilizer' && (
                                <View style={styles.dropdownMenu}>
                                    {fertilizerOptions.map(option => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.dropdownItem}
                                            onPress={() => handleDropdownSelect('fertilizer', option)}
                                        >
                                            <Text>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {!fertilizerOptions.includes(profileData.fertilizer) && (
                                <TextInput
                                    style={[styles.textInput, { marginTop: 8 }]}
                                    value={profileData.fertilizer}
                                    onChangeText={(text) => handleProfileUpdate('fertilizer', text)}
                                    placeholder="Enter custom fertilizer name"
                                />
                            )}
                        </View>

						<View style={styles.modalButtonRow}>
							<TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveProfile}>
								<Text style={styles.saveButtonText}>Save</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Language Modal */}
			<Modal visible={languageModalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>{t('selectLanguage') || 'Select Language'}</Text>
						<FlatList
							data={languages}
							keyExtractor={(item) => item.code}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[styles.modalItem, language === item.code && styles.selectedItem]}
									onPress={() => handleLanguageSelect(item.code)}
								>
									<Text style={[styles.langNative, language === item.code && styles.selectedText]}>{item.nativeName}</Text>
									<Text style={[styles.langName, language === item.code && styles.selectedText]}>({item.name})</Text>
								</TouchableOpacity>
							)}
						/>
						<TouchableOpacity style={styles.modalClose} onPress={() => setLanguageModalVisible(false)}>
							<Text style={styles.modalCloseText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Image Picker Modal */}
			<Modal visible={imagePickerModalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Choose Image</Text>
						<TouchableOpacity style={styles.modalItem} onPress={handleCameraCapture}>
							<Text>Take Photo</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalItem} onPress={handleGalleryPick}>
							<Text>Select from Gallery</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalClose} onPress={() => setImagePickerModalVisible(false)}>
							<Text style={styles.modalCloseText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewContainer: {
        backgroundColor: '#ecfdf5',
    },
    container: {
        padding: 16,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
	card: { 
        backgroundColor: '#fff', 
        padding: 16,
        borderRadius: 12, 
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardBody: {
        marginTop: 12,
        borderTopWidth: 1,
        borderColor: '#f3f4f6',
        paddingTop: 12,
    },
    cardTitle: {
        fontWeight: '700',
        marginBottom: 8,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
    },
	avatar: { 
        width: 64,
        height: 64,
        borderRadius: 32,
    },
	avatarContainer: { 
        position: 'relative',
        marginRight: 12,
    },
	cameraIconOverlay: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#16a34a',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fff',
	},
	cameraIcon: { 
        fontSize: 12,
    },
	row: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowValue: {
        fontWeight: '700',
    },
    linkText: {
        color: '#6b7280',
    },
	actionBtn: { 
        backgroundColor: '#16a34a',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#fff',
    },
	secondaryBtn: { 
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
	toggle: { 
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
	toggleOn: { 
        backgroundColor: '#16a34a',
        alignItems: 'flex-end',
    },
	toggleOff: { 
        backgroundColor: '#e5e7eb',
        alignItems: 'flex-start',
    },
	toggleKnob: { 
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
	editButton: { 
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#f0fff4',
    },
	editIcon: { 
        fontSize: 16,
    },
	modalOverlay: { 
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
	modalContainer: { 
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
    },
	modalTitle: { 
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
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
	selectedItem: { 
        backgroundColor: '#f0fff4',
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
	selectedText: { 
        color: '#064e3b',
        fontWeight: '600',
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
	editModalContainer: { 
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
	inputGroup: { 
        marginBottom: 20,
    },
	inputLabel: { 
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
	textInput: { 
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
    },
	modalButtonRow: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
	modalButton: { 
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
	cancelButton: { 
        backgroundColor: '#f3f4f6',
    },
	saveButton: { 
        backgroundColor: '#16a34a',
    },
	cancelButtonText: { 
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
	saveButtonText: { 
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 80, 
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        zIndex: 10,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    dropdownActive: {
        zIndex: 100,
    },
});