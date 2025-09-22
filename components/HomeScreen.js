import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import {
	SettingsIcon,
	RobotIcon,
	UploadCloudIcon,
	MarketIcon,
	OfflineIcon,
	MicIcon
} from './Icons';
import LocationPermissionModal from './LocationPermissionModal';

const HomeScreen = ({ navigation }) => {
	const { t } = useLocalization();
	const [showLocationModal, setShowLocationModal] = useState(false);

	useEffect(() => {
		// AsyncStorage is React Native equivalent of sessionStorage
		import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
			AsyncStorage.getItem('locationPromptShown').then((val) => {
				if (!val) setShowLocationModal(true);
			});
		});
	}, []);

	const handleModalAction = async () => {
		const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
		await AsyncStorage.setItem('locationPromptShown', 'true');
		setShowLocationModal(false);
	};

	if (showLocationModal) {
		return <LocationPermissionModal onAllow={handleModalAction} onSkip={handleModalAction} />;
	}

	const FeatureCard = ({ icon, label, onClick }) => (
		<TouchableOpacity
			onPress={onClick}
			disabled={!onClick}
			style={[styles.featureCard, !onClick && styles.disabled]}
		>
			<View style={styles.iconWrapper}>{icon}</View>
			<Text style={styles.featureLabel}>{label}</Text>
		</TouchableOpacity>
	);

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerText}>{t('appName')}</Text>
				<TouchableOpacity>
					<SettingsIcon width={24} height={24} color="#6b7280" />
				</TouchableOpacity>
			</View>

			{/* Weather Card */}
			<View style={styles.weatherCard}>
				<View>
					<Text style={styles.weatherSubtitle}>{t('weather')}</Text>
					<Text style={styles.weatherMain}>28°C | Sunny</Text>
					<Text style={styles.weatherSubtitle}>{t('weatherDetails')}</Text>
				</View>
				<View style={styles.weatherIconWrapper}>
					<Image
						source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5xPaNc4iHy0TyHwa4S-xdlkf7hQgn-HPJKiYDLUE5nHDcIyuBUQEpw1-nhEtVBVXv0OSZ543N8iQuYlgFxQh7dpikj9cy3wz_wE_tep-h3irWf-zf2udeIPNeAxGWlKpMcmM1beKBI4XNBMB5qPNrdTfNWyYg03FpezFI3T-ppF6xH8CszOdtdJlsM10YXVRKTFUOYQ96czRpywXzfnxLSZTQUa0Ve55swfblgaF7yrAsUjK8q9t_v2C0hNwXM89SvC2lrYOtHmUc' }}
						style={styles.weatherIcon}
						resizeMode="contain"
					/>
				</View>
			</View>

			{/* Feature Grid */}
			<View style={styles.featureGrid}>
				<FeatureCard icon={<RobotIcon width={32} height={32} />} label={t('aiAdvisory')} onClick={() => navigation.navigate('Advisory')} />
					<FeatureCard icon={<UploadCloudIcon width={32} height={32} />} label={t('uploadImage')} onClick={() => {
						// Navigate to the Disease detection flow registered on the stack
						navigation.navigate('Disease');
					}} />
					<FeatureCard icon={<MarketIcon width={32} height={32} />} label={t('market')} onClick={() => navigation.navigate('Market')} />
					<FeatureCard icon={<OfflineIcon width={32} height={32} />} label={t('offlineMode')} onClick={() => navigation.navigate('Home')} />
			</View>

			{/* Voice Assistant Button */}
			<TouchableOpacity style={styles.voiceButton}>
				<MicIcon width={24} height={24} color="#fff" />
				<Text style={styles.voiceButtonText}>{t('voiceAssistant')}</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0fdf4',
		padding: 16
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	headerText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1f2937'
	},
	weatherCard: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 16
	},
	weatherSubtitle: {
		fontSize: 12,
		color: '#6b7280'
	},
	weatherMain: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#111827'
	},
	weatherIconWrapper: {
		backgroundColor: '#dcfce7',
		borderRadius: 12,
		padding: 8
	},
	weatherIcon: {
		width: 64,
		height: 48
	},
	featureGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 16,
		marginTop: 16
	},
	featureCard: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
		width: '47%',
		aspectRatio: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	disabled: {
		opacity: 0.6
	},
	iconWrapper: {
		marginBottom: 8
	},
	featureLabel: {
		fontWeight: '600',
		fontSize: 14,
		color: '#374151',
		textAlign: 'center'
	},
	voiceButton: {
		backgroundColor: '#16a34a',
		borderRadius: 16,
		paddingVertical: 16,
		marginTop: 24,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 4
	},
	voiceButtonText: {
		color: '#fff',
		fontWeight: '600',
		marginLeft: 8
	}
});

export default HomeScreen;
