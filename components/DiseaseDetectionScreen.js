import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DiseaseDetectionWidget from '../widgets/DiseaseDetectionWidget';
import { useLocalization } from '../hooks/useLocalization';

export default function DiseaseDetectionScreen() {
	const { t } = useLocalization();
	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('diseaseDetection') || 'Disease Detection'}</Text>
			<DiseaseDetectionWidget />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 12, backgroundColor: '#ecfdf5' },
	title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }
});
