import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  Alert,
  ScrollView,
  Dimensions,
  StatusBar,
  Animated
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");

export default function DiseaseDetectionWidget() {
  const HF_API_KEY = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY;
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  const formatDiseaseName = (name) => {
    if (!name) return "Unknown Disease";
    return name
      .toLowerCase()
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const animateResult = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable photo library permissions.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setResult(null);
        setRecommendation(null);
        fadeAnim.setValue(0);
        detectDisease(asset.uri);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please enable camera permissions.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setResult(null);
        setRecommendation(null);
        fadeAnim.setValue(0);
        detectDisease(asset.uri);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // ✅ Hugging Face Disease Detection
  const detectDisease = async (uri) => {
    try {
      setLoading(true);
      setResult(null);

      if (!HF_API_KEY || !HF_API_KEY.startsWith("hf_")) {
        Alert.alert("API Key Required", "Please configure your Hugging Face API Key.");
        setLoading(false);
        return;
      }

      const modelName = "wambugu71/crop_leaf_diseases_vit";

      const response = await fetch(uri);
      const imageBlob = await response.blob();

      const apiResponse = await fetch(
        `https://api-inference.huggingface.co/models/${modelName}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/octet-stream",
          },
          body: imageBlob,
        }
      );

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (Array.isArray(data) && data.length > 0) {
          const top = data.sort((a, b) => b.score - a.score)[0];
          setResult({
            disease: formatDiseaseName(top.label),
            rawDisease: top.label,
          });
          animateResult();
          fetchRecommendation(top.label);
        } else {
          setResult({ disease: "Not Detected" });
          animateResult();
        }
      } else {
        const errorText = await apiResponse.text();
        throw new Error(`API request failed: ${apiResponse.status} - ${errorText}`);
      }
    } catch (err) {
      Alert.alert("Detection Error", err.message || "Failed to analyze image");
      setResult({ disease: "Analysis Error", error: true });
      animateResult();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gemini API for Fertilizer/Treatment
  const fetchRecommendation = async (disease) => {
    try {
      if (!GEMINI_API_KEY) {
        console.warn("Gemini API Key missing");
        return;
      }

      const prompt = `Disease detected: ${disease}. Provide treatment guide:
      1. What causes this disease (1 line)
      2. Best fertilizer/chemical spray to use
      3. Organic/natural treatment method
      4. Prevention tips for future
      5. When to apply treatment (timing)
      Keep each point under 20 words, use simple farmer language.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rawText = data.candidates[0].content.parts[0].text;
        const formattedText = rawText
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .trim();
        setRecommendation(formattedText);
      } else {
        setRecommendation("No specific recommendation found.");
      }
    } catch (error) {
      setRecommendation(`Failed to fetch recommendations: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.header}>
          <Text style={styles.headerTitle}>🌾 AI Crop Health Scanner</Text>
          <Text style={styles.headerSubtitle}>AI-powered detection + smart solutions</Text>
        </LinearGradient>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={takePhoto}>
            <LinearGradient colors={["#3b82f6", "#1d4ed8"]} style={styles.actionGradient}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionTitle}>Take Photo</Text>
              <Text style={styles.actionSubtitle}>Capture crop leaf</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={pickImage}>
            <LinearGradient colors={["#10b981", "#047857"]} style={styles.actionGradient}>
              <Text style={styles.actionIcon}>🖼️</Text>
              <Text style={styles.actionTitle}>Upload Image</Text>
              <Text style={styles.actionSubtitle}>From gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Image preview */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Selected Image</Text>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <View style={styles.imageOverlay} />
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingTitle}>Analyzing leaf...</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}> Disease Analysis</Text>
            <View style={styles.resultCard}>
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseLabel}>Detected Disease:</Text>
                <Text style={styles.resultDisease}>{result.disease}</Text>
              </View>
              {result.rawDisease && (
                <Text style={styles.technicalName}>
                  Technical: {result.rawDisease}
                </Text>
              )}
            </View>

            {/* Gemini Recommendation */}
            {recommendation && (
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationTitle}>🌱 Quick Treatment Guide</Text>
                <View style={styles.recommendationContent}>
                  {recommendation.split("\n").filter(line => line.trim()).map((line, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.recommendationText}>
                        {line.replace(/^\d+\.\s*/, "").trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* ✅ Instructions when no result */}
        {!loading && !result && (
          <View style={styles.instructionsContainer}>
           
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Ensure the leaf is clearly visible.</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>Take the photo in good lighting conditions.</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>Focus on the affected area of the leaf.</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>Upload or capture a photo for instant AI results.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: "#cbd5e1", textAlign: "center" },
  scrollView: { flex: 1 },
  actionContainer: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 30, gap: 15 },
  actionCard: { flex: 1, borderRadius: 20, overflow: "hidden", elevation: 5 },
  actionGradient: { padding: 20, alignItems: "center", minHeight: 120, justifyContent: "center" },
  actionIcon: { fontSize: 30, marginBottom: 8 },
  actionTitle: { fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 4 },
  actionSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 15 },
  imageContainer: { paddingHorizontal: 20, paddingTop: 30 },
  imageWrapper: { position: "relative", alignItems: "center" },
  image: { width: screenWidth - 40, height: screenWidth - 40, borderRadius: 20, maxWidth: 350, maxHeight: 350 },
  imageOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, borderWidth: 3, borderColor: "rgba(59, 130, 246, 0.5)" },
  loadingContainer: { paddingHorizontal: 20, paddingTop: 30, alignItems: "center" },
  loadingTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginTop: 10 },
  resultContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30 },
  resultCard: { backgroundColor: "white", borderRadius: 20, padding: 25, borderWidth: 2, elevation: 3 },
  diseaseHeader: { alignItems: "center", marginBottom: 15 },
  diseaseLabel: { fontSize: 16, color: "#64748b", marginBottom: 5, fontWeight: "600" },
  resultDisease: { fontSize: 26, fontWeight: "bold", color: "#1e293b", textAlign: "center" },
  technicalName: { fontSize: 12, color: "#9ca3af", fontStyle: "italic", textAlign: "center", marginTop: 8 },
  recommendationBox: { marginTop: 20, backgroundColor: "#f0fdf4", padding: 18, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: "#16a34a" },
  recommendationTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#16a34a", textAlign: "center" },
  recommendationContent: { gap: 8 },
  recommendationItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 4 },
  bullet: { fontSize: 16, color: "#16a34a", fontWeight: "bold", marginRight: 8, marginTop: 2 },
  recommendationText: { flex: 1, fontSize: 15, color: "#374151", lineHeight: 20 },
  instructionsContainer: { paddingHorizontal: 20, paddingVertical: 30 },
  instructionItem: { flexDirection: "row", alignItems: "center", marginBottom: 12, backgroundColor: "#fff", padding: 12, borderRadius: 12, elevation: 2 },
  instructionNumber: { fontSize: 16, fontWeight: "bold", color: "#fff", backgroundColor: "#3b82f6", width: 28, height: 28, borderRadius: 14, textAlign: "center", lineHeight: 28, marginRight: 12 },
  instructionText: { flex: 1, fontSize: 15, color: "#374151" },
});
