import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';

export default function LoginScreen({ navigation }) {
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const { t } = useLocalization();

	const handleLogin = () => {
		// Validate inputs
		if (!name.trim()) {
			Alert.alert('Error', 'Please enter your name');
			return;
		}
		if (!phone.trim()) {
			Alert.alert('Error', 'Please enter your phone number');
			return;
		}
		
		// Navigate to LocationScreen with user data
		navigation.navigate('Location', { name: name.trim(), phone: phone.trim() });
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('loginTitle')}</Text>
			<TextInput
				style={styles.input}
				placeholder="Enter your name"
				value={name}
				onChangeText={setName}
				autoCapitalize="words"
			/>
			<TextInput
				style={styles.input}
				placeholder={t('enterPhone')}
				value={phone}
				onChangeText={setPhone}
				keyboardType="phone-pad"
			/>
			<TouchableOpacity style={styles.button} onPress={handleLogin}>
				<Text style={styles.buttonText}>{t('continue')}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
	title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
	input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
	button: { backgroundColor: '#2b6cb0', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
	buttonText: { color: '#fff', fontWeight: '600' }
});
