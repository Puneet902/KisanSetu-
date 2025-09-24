import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#0f172a" />
			
			<KeyboardAvoidingView 
				style={styles.keyboardAvoidingView}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
			>
				<ScrollView 
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* Background Gradient */}
					<LinearGradient
						colors={['#0f172a', '#1e293b', '#334155']}
						style={styles.backgroundGradient}
					>
						{/* Header Section */}
						<View style={styles.headerSection}>
							<View style={styles.logoContainer}>
								<Text style={styles.logoEmoji}>🌾</Text>
								<Text style={styles.appName}>KisanSetu</Text>
							</View>
							<Text style={styles.welcomeText}>Welcome to Smart Farming</Text>
							<Text style={styles.subtitle}>Enter your details to get started</Text>
						</View>

						{/* Form Section */}
						<View style={styles.formSection}>
							<View style={styles.formContainer}>
								<Text style={styles.formTitle}>👋 Let's get to know you</Text>
								
								{/* Name Input */}
								<View style={styles.inputContainer}>
									<View style={styles.inputIconContainer}>
										<Text style={styles.inputIcon}>👤</Text>
									</View>
									<TextInput
										style={styles.input}
										placeholder="Enter your full name"
										placeholderTextColor="#9ca3af"
										value={name}
										onChangeText={setName}
										autoCapitalize="words"
										returnKeyType="next"
										blurOnSubmit={false}
									/>
								</View>

								{/* Phone Input */}
								<View style={styles.inputContainer}>
									<View style={styles.inputIconContainer}>
										<Text style={styles.inputIcon}>📱</Text>
									</View>
									<TextInput
										style={styles.input}
										placeholder={t('enterPhone') || "Enter your phone number"}
										placeholderTextColor="#9ca3af"
										value={phone}
										onChangeText={setPhone}
										keyboardType="phone-pad"
										returnKeyType="done"
										onSubmitEditing={handleLogin}
									/>
								</View>

								{/* Continue Button */}
								<TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
									<LinearGradient
										colors={['#16a34a', '#15803d', '#166534']}
										style={styles.buttonGradient}
									>
										<Text style={styles.buttonText}>{t('continue') || 'Continue'} →</Text>
									</LinearGradient>
								</TouchableOpacity>

								{/* Info Text */}
								<Text style={styles.infoText}>
									🔒 Your information is secure and will be used to personalize your farming experience
								</Text>
							</View>
						</View>

						{/* Decorative Elements */}
						<View style={styles.decorativeCircle1} />
						<View style={styles.decorativeCircle2} />
					</LinearGradient>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0f172a',
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	backgroundGradient: {
		minHeight: '100%',
		position: 'relative',
	},
	headerSection: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20,
		minHeight: 300,
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 30,
	},
	logoEmoji: {
		fontSize: 60,
		marginBottom: 10,
	},
	appName: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#ffffff',
		letterSpacing: 1,
	},
	welcomeText: {
		fontSize: 20,
		color: '#cbd5e1',
		textAlign: 'center',
		marginBottom: 8,
		fontWeight: '600',
	},
	subtitle: {
		fontSize: 16,
		color: '#94a3b8',
		textAlign: 'center',
		lineHeight: 22,
	},
	formSection: {
		justifyContent: 'flex-start',
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
	},
	formContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		borderRadius: 25,
		padding: 30,
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 15,
	},
	formTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#1f2937',
		textAlign: 'center',
		marginBottom: 30,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f8fafc',
		borderRadius: 15,
		marginBottom: 20,
		borderWidth: 2,
		borderColor: '#e2e8f0',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	inputIconContainer: {
		paddingLeft: 15,
		paddingRight: 10,
	},
	inputIcon: {
		fontSize: 20,
	},
	input: {
		flex: 1,
		paddingVertical: 18,
		paddingRight: 15,
		fontSize: 16,
		color: '#1f2937',
		backgroundColor: 'transparent',
	},
	button: {
		borderRadius: 15,
		overflow: 'hidden',
		marginTop: 10,
		marginBottom: 20,
		elevation: 5,
		shadowColor: '#16a34a',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	buttonGradient: {
		paddingVertical: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 0.5,
	},
	infoText: {
		fontSize: 14,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 20,
		paddingHorizontal: 10,
	},
	decorativeCircle1: {
		position: 'absolute',
		top: 100,
		right: -50,
		width: 150,
		height: 150,
		borderRadius: 75,
		backgroundColor: 'rgba(34, 197, 94, 0.1)',
	},
	decorativeCircle2: {
		position: 'absolute',
		bottom: 150,
		left: -75,
		width: 200,
		height: 200,
		borderRadius: 100,
		backgroundColor: 'rgba(59, 130, 246, 0.08)',
	},
});
