import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';

const ToggleSwitch = () => {
	const [isEnabled, setIsEnabled] = useState(false);
	return (
		<TouchableOpacity onPress={() => setIsEnabled(!isEnabled)} style={[styles.toggle, isEnabled ? styles.toggleOn : styles.toggleOff]}>
			<View style={[styles.toggleKnob, isEnabled ? styles.knobOn : styles.knobOff]} />
		</TouchableOpacity>
	);
};

export default function ProfileScreen() {
	const { t, language } = useLocalization();

	const languageLabel = (() => {
		switch (language) {
			case 'hi': return t('hindi') || 'हिन्दी';
			case 'ta': return t('tamil') || 'தமிழ்';
			case 'te': return t('telugu') || 'తెలుగు';
			default: return t('english') || 'English';
		}
	})();

	return (
		<View style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
			<View style={{ padding: 12 }}>
				<Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{t('profileAndSettings') || 'Profile & Settings'}</Text>
			</View>

			<View style={{ padding: 12 }}>
				<View style={styles.card}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Image source={{ uri: 'https://i.imgur.com/3Z4Y5Zp.png' }} style={styles.avatar} />
						<View>
							<Text style={{ fontSize: 16, fontWeight: '700' }}>Ram Kumar</Text>
						</View>
					</View>
						<View style={{ marginTop: 12, borderTopWidth: 1, borderColor: '#eee', paddingTop: 12 }}>
						<View style={styles.row}>
							<Text>{t('landSize') || 'Land Size'}</Text>
							<Text style={{ fontWeight: '700' }}>2.5 {t('acresUnit') || 'Acres'}</Text>
						</View>
						<View style={styles.row}>
							<Text>{t('soilType') || 'Soil Type'}</Text>
							<Text style={{ fontWeight: '700' }}>{t('loamySoil') || 'Loamy Soil'}</Text>
						</View>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={{ fontWeight: '700', marginBottom: 8 }}>{t('appSettings') || 'App Settings'}</Text>
					<View style={styles.row}>
						<Text>{t('language') || 'Language'}</Text>
						<TouchableOpacity>
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
		</View>
	);
}

const styles = StyleSheet.create({
	card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
	avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
	actionBtn: { backgroundColor: '#16a34a', padding: 12, borderRadius: 8, alignItems: 'center' },
	secondaryBtn: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, alignItems: 'center' },
	toggle: { width: 44, height: 24, borderRadius: 12, padding: 2 },
	toggleOn: { backgroundColor: '#16a34a', alignItems: 'flex-end' },
	toggleOff: { backgroundColor: '#e5e7eb', alignItems: 'flex-start' },
	toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
	knobOn: { marginRight: 0 },
	knobOff: { marginLeft: 0 }
});
