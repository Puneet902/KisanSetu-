import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import useLocalization from '../hooks/useLocalization';

// Lazy require image picker so bundler doesn't fail when the package isn't installed.
let ImagePicker;
try {
  // eslint-disable-next-line global-require
  ImagePicker = require('expo-image-picker');
} catch (e) {
  ImagePicker = null;
}

export default function DiseaseDetectionWidget() {
  const { t } = useLocalization();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    if (!ImagePicker) {
      // If expo-image-picker isn't installed, show a friendly console message and return.
      console.warn('expo-image-picker is not installed. Install it with `expo install expo-image-picker`.');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
  // Use the newer MediaType API (not MediaTypeOptions) to avoid deprecation warnings
  const mediaTypes = ImagePicker && ImagePicker.MediaType ? ImagePicker.MediaType.Images : undefined;
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes, quality: 0.7 });
    if (!res.cancelled) {
      setImage(res.uri);
      analyzeImage(res.uri);
    }
  };

  const analyzeImage = async (uri) => {
    setIsLoading(true);
    // Placeholder: In production upload to server or run ML model
    setTimeout(() => {
      setResult({ disease: 'Leaf Rust', fertilizer: 'Use NPK', pesticide: 'Apply 1% solution' });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('diseaseDetection')}</Text>
      <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
        <Text style={{color:'#6b7280'}}>{t('uploadImage')}</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {isLoading && <ActivityIndicator style={{marginTop:12}} />}

      {result && (
        <View style={styles.resultBox}>
          <Text style={{fontWeight:'700'}}>{result.disease}</Text>
          <Text>{t('fertilizerRec')}: {result.fertilizer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth:1, borderColor:'#e5e7eb' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom:8 },
  uploadBox: { padding: 14, borderWidth:1, borderStyle:'dashed', borderColor:'#d1d5db', borderRadius:8, alignItems:'center' },
  preview: { width: '100%', height: 180, marginTop: 12, borderRadius:8 },
  resultBox: { marginTop:12, padding:10, backgroundColor:'#f0fdf4', borderRadius:8 }
});

