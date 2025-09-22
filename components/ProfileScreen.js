import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, Alert, Platform } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { EditIcon, CameraIcon } from './Icons';

const ToggleSwitch = () => {
	const [isEnabled, setIsEnabled] = useState(false);
	return (
		<TouchableOpacity onPress={() => setIsEnabled(!isEnabled)} style={[styles.toggle, isEnabled ? styles.toggleOn : styles.toggleOff]}>
			<View style={[styles.toggleKnob, isEnabled ? styles.knobOn : styles.knobOff]} />
		</TouchableOpacity>
	);
};

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

export default function ProfileScreen() {
	const { t, language, setLanguage } = useLocalization();
	const [languageModalVisible, setLanguageModalVisible] = useState(false);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
	const [profileData, setProfileData] = useState({
		name: 'Ram Kumar',
		landSize: '2.5',
		soilType: 'Loamy Soil',
		profileImage: 'https://imgs.search.brave.com/bDPcRAObcsITmVBR8H78ip6OyphUyRehZinem4zd1x8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzkxL2Fj/LzU3LzkxYWM1NzA0/ZTJlZGExYWIxZjUw/NGM3YjAzYTllNDU1/LmpwZw'
	});

	const languageLabel = (() => {
		switch (language) {
			case 'hi': return t('Hindi >') || 'हिन्दी';
			case 'ta': return t('Tamil >') || 'தமிழ்';
			case 'te': return t('Telugu >') || 'తెలుగు';
			default: return t('English >') || 'English';
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
		// Here you would typically save to storage/backend
		setEditModalVisible(false);
	};

	const handleImagePicker = () => {
		setImagePickerModalVisible(true);
	};

	const handleCameraCapture = () => {
		setImagePickerModalVisible(false);
		Alert.alert(
			'Camera',
			'Camera functionality would be implemented here. For demo purposes, we\'ll use a placeholder image.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{ 
					text: 'OK', 
					onPress: () => {
						// In a real app, you would capture from camera here
						setProfileData(prev => ({
							...prev,
							profileImage: 'https://via.placeholder.com/150/22c55e/ffffff?text=Photo'
						}));
					}
				}
			]
		);
	};

	const handleGalleryPick = () => {
		setImagePickerModalVisible(false);
		Alert.alert(
			'Gallery',
			'Gallery picker would be implemented here. For demo purposes, we\'ll use a placeholder image.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{ 
					text: 'OK', 
					onPress: () => {
						// In a real app, you would pick from gallery here
						setProfileData(prev => ({
							...prev,
							profileImage: 'https://via.placeholder.com/150/16a34a/ffffff?text=Gallery'
						}));
					}
				}
			]
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
			<View style={{ padding: 12 }}>
				<Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{t('profileAndSettings') || 'Profile & Settings'}</Text>
			</View>

			<View style={{ padding: 12 }}>
				<View style={styles.card}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
							<TouchableOpacity onPress={handleImagePicker}>
								<View style={styles.avatarContainer}>
									<Image source={{ uri: profileData.profileImage }} style={styles.avatar} />
									<View style={styles.cameraIconOverlay}>
										<CameraIcon style={styles.cameraIcon} />
									</View>
								</View>
							</TouchableOpacity>
							<View>
								<Text style={{ fontSize: 16, fontWeight: '700' }}>{profileData.name}</Text>
							</View>
						</View>
						<TouchableOpacity 
							onPress={() => setEditModalVisible(true)}
							style={styles.editButton}
						>
							<EditIcon style={styles.editIcon} />
						</TouchableOpacity>
					</View>
					<View style={{ marginTop: 12, borderTopWidth: 1, borderColor: '#eee', paddingTop: 12 }}>
						<View style={styles.row}>
							<Text>{t('landSize') || 'Land Size'}</Text>
							<Text style={{ fontWeight: '700' }}>{profileData.landSize} {t('acresUnit') || 'Acres'}</Text>
						</View>
						<View style={styles.row}>
							<Text>{t('soilType') || 'Soil Type'}</Text>
							<Text style={{ fontWeight: '700' }}>{profileData.soilType}</Text>
						</View>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={{ fontWeight: '700', marginBottom: 8 }}>{t('appSettings') || 'App Settings'}</Text>
					<View style={styles.row}>
						<Text>{t('language') || 'Language'}</Text>
						<TouchableOpacity onPress={() => setLanguageModalVisible(true)}>
							<Text style={{ color: '#666' }}>{languageLabel}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<Text>{t('voiceAssistant') || 'Voice Assistant'}</Text>
						<ToggleSwitch />
					</View>
				</View>

				<View style={styles.card}>
					<Text style={{ fontWeight: '700', marginBottom: 8 }}>{t('offlineData') || 'Offline Data'}</Text>
					<TouchableOpacity style={styles.actionBtn}><Text style={{ color: '#fff' }}>{t('downloadAdvisoryData') || 'Download Advisory Data'}</Text></TouchableOpacity>
				</View>

				<View style={styles.card}>
					<Text style={{ fontWeight: '700', marginBottom: 8 }}>{t('support') || 'Support'}</Text>
					<TouchableOpacity style={styles.secondaryBtn}><Text>{t('helpAndSupport') || 'Help & Support'}</Text></TouchableOpacity>
				</View>
			</View>

			{/* Image Picker Modal */}
			<Modal visible={imagePickerModalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.imagePickerModalContainer}>
						<Text style={styles.modalTitle}>Select Profile Picture</Text>
						
						<TouchableOpacity 
							style={styles.imagePickerOption}
							onPress={handleCameraCapture}
						>
							<CameraIcon style={styles.optionIcon} />
							<Text style={styles.optionText}>Take Photo</Text>
						</TouchableOpacity>

						<TouchableOpacity 
							style={styles.imagePickerOption}
							onPress={handleGalleryPick}
						>
							<Text style={styles.optionIcon}>🖼️</Text>
							<Text style={styles.optionText}>Choose from Gallery</Text>
						</TouchableOpacity>

						<TouchableOpacity 
							style={styles.modalClose} 
							onPress={() => setImagePickerModalVisible(false)}
						>
							<Text style={styles.modalCloseText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Edit Profile Modal */}
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

						<View style={styles.modalButtonRow}>
							<TouchableOpacity 
								style={[styles.modalButton, styles.cancelButton]} 
								onPress={() => setEditModalVisible(false)}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity 
								style={[styles.modalButton, styles.saveButton]} 
								onPress={handleSaveProfile}
							>
								<Text style={styles.saveButtonText}>Save</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Language Selection Modal */}
			<Modal visible={languageModalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>{t('selectLanguage') || 'Select Language'}</Text>
						<FlatList
							data={languages}
							keyExtractor={(item) => item.code}
							renderItem={({ item }) => (
								<TouchableOpacity 
									style={[
										styles.modalItem, 
										language === item.code && styles.selectedItem
									]} 
									onPress={() => handleLanguageSelect(item.code)}
								>
									<Text style={[
										styles.langNative,
										language === item.code && styles.selectedText
									]}>
										{item.nativeName}
									</Text>
									<Text style={[
										styles.langName,
										language === item.code && styles.selectedText
									]}>
										({item.name})
									</Text>
								</TouchableOpacity>
							)}
						/>
						<TouchableOpacity 
							style={styles.modalClose} 
							onPress={() => setLanguageModalVisible(false)}
						>
							<Text style={styles.modalCloseText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
	avatar: { width: 64, height: 64, borderRadius: 32 },
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
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
	actionBtn: { backgroundColor: '#16a34a', padding: 12, borderRadius: 8, alignItems: 'center' },
	secondaryBtn: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, alignItems: 'center' },
	toggle: { width: 44, height: 24, borderRadius: 12, padding: 2 },
	toggleOn: { backgroundColor: '#16a34a', alignItems: 'flex-end' },
	toggleOff: { backgroundColor: '#e5e7eb', alignItems: 'flex-start' },
	toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
	knobOn: { marginRight: 0 },
	knobOff: { marginLeft: 0 },
	// Modal styles
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
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 8,
		shadowColor: '#064e3b',
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 6,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#064e3b',
		textAlign: 'center',
		marginBottom: 16,
		padding: 8,
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
	// Edit button styles
	editButton: {
		padding: 8,
		borderRadius: 6,
		backgroundColor: '#f0fff4',
	},
	editIcon: {
		fontSize: 16,
	},
	// Edit modal styles
	editModalContainer: {
		width: '100%',
		maxWidth: 400,
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 24,
		shadowColor: '#064e3b',
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 6,
	},
	inputGroup: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 8,
	},
	textInput: {
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#f9fafb',
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
		color: '#ffffff',
		fontWeight: '600',
		fontSize: 16,
	},
	// Image picker modal styles
	imagePickerModalContainer: {
		width: '100%',
		maxWidth: 320,
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 24,
		shadowColor: '#064e3b',
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 6,
	},
	imagePickerOption: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
		paddingHorizontal: 12,
		borderRadius: 8,
		backgroundColor: '#f9fafb',
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	optionIcon: {
		fontSize: 20,
		marginRight: 12,
	},
	optionText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#374151',
	},
});
