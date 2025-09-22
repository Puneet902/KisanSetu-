import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';

export default function Onboarding({ navigation }) {
	const { t } = useLocalization();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('onboardingTitle')}</Text>
			<Text style={styles.subtitle}>{t('onboardingDesc')}</Text>
			<TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
				<Text style={styles.buttonText}>{t('getStarted')}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
	title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
	subtitle: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 24 },
	button: { backgroundColor: '#2b6cb0', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
	buttonText: { color: '#fff', fontWeight: '600' }
});
