import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, KeyboardAvoidingView, Platform, Alert, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalization } from '../hooks/useLocalization';
import { ChevronLeftIcon, MicIcon, CameraIcon, SendIcon, LogoIcon } from './Icons';
import { generateChatResponse, getSoilAnalysisFromGemini as getGeminiSoilAnalysis } from '../services/geminiService';
import * as Location from 'expo-location';
import { supabase } from '../src/lib/supabaseClient';

const commonQuestionsData = [
  { key: 'What crops should I add?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAq9ADrufO6L_FLDVa2HULD5F5P0HvYuDYtHR8_SrWKQKq6e3I7Rs8XThsJJV-lT5I8JzUI-eq6-a66gMq6yfMf_zDw0ku0E3F9YSeo_R0BlSw8jwiMNKtLS2b49-vBvyyqRTq1Y5Ps6ZvMytQFZOSbeqLAGS0TYO6VE3D-9Ks5dc0CiLNB8axv2pHczM3qXqiYiep96JU95-Xnn-eZT6x6_bZfqsgKWS8JlLdf1d-z1md1s5ljyxDL9z52XH8dO9g9qFLfS6LxliP' },
  { key: 'When is the right time to cut the crops?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX8-yY4WE06eSYYL3nIrpE3EBaw0I494zREeYWfHUsIBS2ggKhNAZigmeha3FSfVYw1LNlx009LikmSMfZRgHwcXIENkBrI9M9sAiKf_j9uymA6xh9_UsHQDru-41Zino6eleFUD9Mzmpyjpf_kkODEDq0ebVbfdRXQROvlqpTCc6tGiNeBLUHLem_slKspQu_2kdCv2s94bnvNEo7a_0dKnToCE_mk2LaTEzzt6seWfEBsV5XPUHYl03mlPKbULS0VUQEI2OVWypY' },
  { key: 'What kind of pesticides should I use and fertilizers?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtik0QhPBNWe-287X6WyJcRl_RB2iqIae2-ZAgnwhyib7o-b2qG2Ijuy-ukrMIwaetLwy6GH0AVQvZnYuNZX1fW-I96pD17VN1k-duxx3ArI1hOgkzeJTxejUlU-CtfNlk7GzVmg54gVikmnq7zzjx72LJXPUwP6SgIsuU7Do5BHM0r6rkqfEmp4NolDRYRyT-K_UIvnr2m0mLenyJB5a6A3bXDikkUFAzvW7IuuyFVE9YPOCqDhNJMtsusoFCgfdHP7RHpT1ijqGy' },
  { key: 'When to sell?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT_4bgwwlatzmmG5mqTSuD0oQRlqD9yLmkNcEJFLeyz3Ml0D3dNcPKkLbOlgK2JLJhdCWpGhv28RfdJbRBGmjTnatFheUeFeGZTInzIp6P8ditF5JwNtSoEj6kH2nY0G8NTAZ_gOOgUuZbHkwI64shbGn13x16UWrpsrZlvztmlWJ5LK_FMrtJ8o5fYDuQ9ywAqlbGfhobKQRdycLQJt6pXjnxSkrdxvducpycXGXRlR585IrcK410v2-P-g9X3-x1btR-lvjsmjPZ' },
  { key: 'How to maximize profits?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfy2tAhvDkBYptM_H-LwlO15nbUgIthgK9VI4Lg8izOMDmCzeHbqHhtjKs0EjQusy6yAg15tcfaew8lh9GOyd44yFykpjQT9Qb4-h12UA4NyzcHP0qXTCTq6z3Wa1yfKwOkLQbO4S0qRxHJmFpWEOln9wPygOA8Nh8iDgkLL11obmD2ljzA4kjUwwxP44Y2UF4PTkvYGbVZRoEUo2w2XA6J6S6FY5Y5l17VtwqQni7T8r_2DUv7rT00DVH_hIQlcLDzdnGCh5W5JMQ' }
];

const AdvisoryScreen = () => {
  const { t, language } = useLocalization();
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soilInfo, setSoilInfo] = useState(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (isChatting) scrollToBottom();
  }, [messages, isChatting]);

  // ✅ Get real user location from device or database
  const fetchUserLocation = async () => {
    try {
      // First try to get from Supabase user data
      const { data, error } = await supabase
        .from('users')
        .select('latitude, longitude, name')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const { latitude, longitude } = data[0];
        if (latitude && longitude) {
          console.log('📍 Location from database:', { lat: latitude, lon: longitude });
          return { lat: latitude, lon: longitude };
        }
      }

      // If no database location, try device location
      console.log('📱 Requesting device location...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('⚠️ Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      console.log('📍 Location from device:', { lat: latitude, lon: longitude });
      
      return { lat: latitude, lon: longitude };
      
    } catch (error) {
      console.error("❌ Error fetching location:", error);
      return null;
    }
  };

  // ✅ Get soil analysis using Gemini AI based on location
  const getSoilAnalysisFromGemini = async (lat, lon) => {
    try {
      console.log('🤖 Getting soil analysis from Gemini AI for coordinates:', lat, lon);
      
      // Use the new simplified Gemini service function
      const soilData = await getGeminiSoilAnalysis(lat, lon);
      console.log('🌾 Gemini soil analysis response:', soilData);
      
      // Transform the response to match the expected format
      if (soilData && typeof soilData === 'object') {
        return {
          type: soilData.soilType || soilData.type || "Clay Loam",
          ph: soilData.ph || "6.5-7.0",
          clay: soilData.clay || "35%",
          sand: soilData.sand || "40%", 
          silt: soilData.silt || "25%",
          nitrogen: soilData.nitrogen || "Medium",
          bestCrops: soilData.bestCrops || ["Rice", "Wheat", "Cotton", "Sugarcane"],
          region: soilData.region || "India",
          country: soilData.country || "India",
          climate: soilData.climate || "Tropical/Subtropical",
          description: soilData.description || "Fertile agricultural soil suitable for multiple crops based on location analysis.",
          source: "Gemini AI Analysis"
        };
      }
      
      // Fallback with location-based defaults for India
      const isInIndia = (lat >= 8.0 && lat <= 37.0 && lon >= 68.0 && lon <= 97.0);
      
      if (isInIndia) {
        return {
          type: "Alluvial Clay Loam",
          ph: "6.8-7.2",
          clay: "40%",
          sand: "35%", 
          silt: "25%",
          nitrogen: "Medium to High",
          bestCrops: ["Rice", "Wheat", "Cotton", "Sugarcane", "Pulses"],
          region: "India",
          country: "India",
          climate: "Tropical Monsoon",
          description: "Fertile alluvial soil typical of Indian agricultural regions, suitable for diverse crop cultivation with good water retention.",
          source: "Location-based Analysis"
        };
      }
      
      // Generic fallback for other locations
      return {
        type: "Mixed Soil",
        ph: "6.0-7.0",
        clay: "30%",
        sand: "45%", 
        silt: "25%",
        nitrogen: "Medium",
        bestCrops: ["Cereals", "Vegetables", "Legumes"],
        region: "Unknown",
        country: "Unknown",
        climate: "Temperate",
        description: "General soil composition based on geographic coordinates.",
        source: "Default Analysis"
      };
      
    } catch (error) {
      console.error('❌ Gemini soil analysis failed:', error);
      
      // Return intelligent defaults based on coordinates if available
      const isInIndia = lat && lon && (lat >= 8.0 && lat <= 37.0 && lon >= 68.0 && lon <= 97.0);
      
      return {
        type: isInIndia ? "Alluvial Loam" : "Mixed Soil",
        ph: isInIndia ? "6.8" : "6.5",
        clay: isInIndia ? "38%" : "30%",
        sand: isInIndia ? "37%" : "45%", 
        silt: isInIndia ? "25%" : "25%",
        nitrogen: isInIndia ? "Medium" : "Low-Medium",
        bestCrops: isInIndia ? ["Rice", "Wheat", "Cotton"] : ["Cereals", "Vegetables"],
        region: isInIndia ? "India" : "Unknown",
        country: isInIndia ? "India" : "Unknown",
        climate: isInIndia ? "Tropical" : "Temperate",
        description: "Soil analysis unavailable. Using location-based estimates.",
        source: "Fallback Analysis"
      };
    }
  };

  // ✅ Helper function to extract data from text response
  const extractFromText = (text, regex) => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  // ✅ Format Gemini response for better readability
  const formatGeminiResponse = (response) => {
    if (!response || typeof response !== 'string') return String(response || 'No response available');
    
    let formatted = response
      // Remove ALL asterisks and markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** bold markers
      .replace(/\*(.*?)\*/g, '$1')      // Remove * italic markers
      .replace(/\*/g, '')               // Remove any remaining asterisks
      .replace(/#{1,6}\s*/g, '')        // Remove # headers
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code backticks
      
      // Improve bullet points
      .replace(/^[\s]*[-•]\s*/gm, '🌱 ') // Use plant emoji for bullets
      .replace(/^\d+\.\s*/gm, '🌱 ')     // Convert numbers to plant bullets
      
      // Clean up spacing and formatting
      .replace(/\n{3,}/g, '\n\n')       // Remove excessive line breaks
      .replace(/^\s+/gm, '')            // Remove leading spaces
      .replace(/\s+$/gm, '')            // Remove trailing spaces
      .trim();
    
    // Add farming-relevant emojis for better visual appeal
    formatted = formatted
      .replace(/Direct Answer:/gi, '🎯 Answer:')
      .replace(/Key Actions:/gi, '📋 Action Steps:')
      .replace(/Important Note:/gi, '💡 Key Tip:')
      .replace(/Recommendation:/gi, '✅ Recommendation:')
      .replace(/Warning:/gi, '⚠️ Warning:')
      .replace(/Tip:/gi, '💡 Tip:')
      .replace(/Steps:/gi, '📝 Steps:')
      .replace(/Solution:/gi, '🔧 Solution:')
      
      // Add context-specific emojis
      .replace(/\b(fertilizer|fertilizers)\b/gi, '🧪 fertilizer')
      .replace(/\b(seed|seeds)\b/gi, '🌰 seed')
      .replace(/\b(water|watering|irrigation)\b/gi, '💧 water')
      .replace(/\b(soil)\b/gi, '🌍 soil')
      .replace(/\b(crop|crops)\b/gi, '🌾 crops')
      .replace(/\b(plant|planting)\b/gi, '🌱 plant')
      .replace(/\b(harvest|harvesting)\b/gi, '🚜 harvest')
      .replace(/\b(pesticide|pesticides)\b/gi, '🦠 pesticide')
      .replace(/\b(disease|diseases)\b/gi, '🦠 disease')
      .replace(/\b(weather|climate)\b/gi, '🌤️ weather')
      .replace(/\b(profit|income|money)\b/gi, '💰 profit')
      .replace(/\b(market|selling)\b/gi, '🏪 market');
    
    return formatted;
  };

  // ✅ Determine soil type based on clay, silt, sand percentages
  const getSoilType = (clay, silt, sand) => {
    if (!clay || !silt || !sand) return "Unknown";
    
    if (clay > 40) return "Clay";
    if (sand > 70) return "Sandy";
    if (silt > 40) return "Silty";
    if (clay > 20 && sand > 40) return "Sandy Clay";
    if (clay > 20 && silt > 40) return "Silty Clay";
    return "Loamy";
  };

  // ✅ Wrapper for AI responses (with soil + location context)
  const askGeminiWithContext = async (question, history = [], language = 'en') => {
    try {
      // Get location first
      const location = await fetchUserLocation();
      console.log('📍 Location for context:', location);
      
      if (!location) {
        console.warn('⚠️ No location available, using default soil data');
        return "🌾 I need your location to provide specific farming advice. Please ensure location services are enabled or add your location in the profile.";
      }
      
      // Get soil analysis based on location
      let soil = null;
      if (location && location.lat && location.lon) {
        console.log('🌱 Analyzing soil with Gemini AI for:', location.lat, location.lon);
        soil = await getSoilAnalysisFromGemini(location.lat, location.lon);
        console.log('🌾 Soil analysis received:', soil);
        setSoilInfo(soil); // Store soil info in state for display
      } else {
        console.error('❌ Invalid location data:', location);
        return "⚠️ Unable to get valid location coordinates. Please check your location settings.";
      }

      const context = `
        LOCATION: ${soil?.country || "Unknown"}, ${soil?.region || "Unknown"} (${location ? `${location.lat}, ${location.lon}` : "Unknown"})
        SOIL: ${soil?.type || "Unknown"} | pH: ${soil?.ph || "Unknown"} | Climate: ${soil?.climate || "Unknown"}
        COMPOSITION: Clay ${soil?.clay || "?"} | Sand ${soil?.sand || "?"} | Silt ${soil?.silt || "?"} | Nitrogen ${soil?.nitrogen || "?"}
        
        QUESTION: ${question}
        
        INSTRUCTIONS:
        - Give a direct, focused answer to the farmer's question
        - Use simple, clear language (avoid technical jargon)
        - Provide 3-5 specific, actionable points
        - Consider the soil type, pH, and local climate in your advice
        - Format response with bullet points for easy reading
        - Keep each point under 25 words
        - Be practical and cost-effective for small farmers
        
        Format your response like this:
        
        **Direct Answer:**
        [One sentence directly answering the question]
        
        **Key Actions:**
        • [Action 1 - specific and practical]
        • [Action 2 - with timing if relevant]
        • [Action 3 - with cost consideration]
        • [Action 4 - with local context]
        
        **Important Note:**
        [One key tip specific to their soil/climate]
      `;

      const rawResponse = await generateChatResponse(context, { 
        location: soil?.region || "India", 
        previousMessages: history || [] 
      });
      const responseText = typeof rawResponse === 'string' ? rawResponse : (rawResponse?.text || '');
      const formattedResponse = formatGeminiResponse(responseText);
      return typeof formattedResponse === 'string' ? formattedResponse : 'Error: Unable to format AI response';
    } catch (error) {
      console.error("Gemini context error:", error);
      return "⚠️ Failed to fetch advisory with soil data.";
    }
  };

  const startChat = async (question) => {
    if (!question.trim()) return;
    setIsChatting(true);
    setMessages([{ sender: 'user', text: question }]);
    setIsLoading(true);

    const responseText = await askGeminiWithContext(question, []);
    const safeResponseText = typeof responseText === 'string' ? responseText : 'Error: Invalid response from AI';
    setMessages(prev => [...prev, { sender: 'bot', text: safeResponseText }]);
    setIsLoading(false);
  };

  const handleSendFollowUp = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const responseText = await askGeminiWithContext(input, history);
    const safeResponseText = typeof responseText === 'string' ? responseText : 'Error: Invalid response from AI';
    setMessages(prev => [...prev, { sender: 'bot', text: safeResponseText }]);
    setIsLoading(false);
  };

  const QuestionCard = ({ questionKey, imageUrl }) => (
    <TouchableOpacity style={styles.questionCard} onPress={() => startChat(t(questionKey))}>
      <Image source={{ uri: imageUrl }} style={styles.questionImage} />
      <View style={styles.questionOverlay} />
      <Text style={styles.questionText}>{t(questionKey)}</Text>
    </TouchableOpacity>
  );

  const InitialView = () => {
    const [initialInput, setInitialInput] = useState('');
    return (
      <ScrollView 
        style={styles.initialContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.initialScrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <LinearGradient 
            colors={['#1e40af', '#3b82f6', '#60a5fa']} 
            style={styles.welcomeBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.welcomeTitle}>🌾 AI Crop Health Scanner</Text>
            <Text style={styles.welcomeSubtitle}>
              AI-powered detection + smart solutions
            </Text>
          </LinearGradient>
        </View>

        {/* Enhanced Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>🌱 Ask Your Farming Question</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g., What crops should I plant this season?"
              placeholderTextColor="#9ca3af"
              value={initialInput}
              onChangeText={setInitialInput}
              onSubmitEditing={() => { startChat(initialInput); setInitialInput(''); }}
              style={styles.input}
              multiline
              textAlignVertical="top"
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.sendButton, !initialInput.trim() && styles.sendButtonDisabled]}
                onPress={() => { startChat(initialInput); setInitialInput(''); }}
                disabled={!initialInput.trim()}
              >
                {initialInput.trim() ? (
                  <SendIcon width={20} height={20} color="#ffffff" />
                ) : (
                  <MicIcon width={20} height={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton}>
                <CameraIcon width={20} height={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Questions Section */}
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Quick Start Questions</Text>
          <Text style={styles.sectionSubtitle}>Tap any question to get instant advice</Text>
          {commonQuestionsData.map(item => (
            <QuestionCard key={item.key} questionKey={item.key} imageUrl={item.imageUrl} />
          ))}
        </View>
      </ScrollView>
    );
  };

  const ChatView = () => (
    <View style={styles.chatViewContainer}>
      {/* Chat Header with Back Button */}
      <View style={styles.chatHeader}>
        <TouchableOpacity 
          style={styles.chatBackButton}
          onPress={() => setIsChatting(false)}
        >
          <ChevronLeftIcon width={20} height={20} color="#16a34a" />
          <Text style={styles.backButtonText}>Back to Questions</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView ref={scrollRef} style={styles.chatContainer} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {messages.map((msg, i) => (
          <View key={i} style={[styles.chatMessageWrapper, msg.sender === 'user' && styles.chatMessageUser]}>
            {msg.sender === 'bot' && (
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
              </View>
            )}
            <View style={[styles.chatMessage, msg.sender === 'user' ? styles.userMessage : styles.botMessage]}>
              <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>
                {typeof msg.text === 'string' ? msg.text : 'Error: Invalid message format'}
              </Text>
              <Text style={styles.messageTime}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {msg.sender === 'user' && (
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>👨‍🌾</Text>
              </View>
            )}
          </View>
        ))}
        {isLoading && (
          <View style={styles.chatMessageWrapper}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarText}>🤖</Text>
            </View>
            <View style={[styles.chatMessage, styles.botMessage, styles.loadingMessage]}>
              <Text style={styles.loadingText}>AI is analyzing your question...</Text>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>AI Advisory</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>{isChatting ? <ChatView /> : <InitialView />}</View>
        
        {isChatting && (
          <View style={styles.chatInputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSendFollowUp}
                placeholder="💬 Ask me anything about farming..."
                placeholderTextColor="#9ca3af"
                style={styles.chatInput}
                editable={!isLoading}
                multiline
                textAlignVertical="top"
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <TouchableOpacity 
                onPress={handleSendFollowUp} 
                disabled={isLoading || !input.trim()} 
                style={[styles.sendFollowUpButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
              >
                {isLoading ? (
                  <Text style={styles.loadingDots}>⋯</Text>
                ) : (
                  <SendIcon width={22} height={22} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  keyboardContainer: { flex: 1 },
  
  // Content
  content: { flex: 1 },
  
  // Initial View
  initialContainer: { flex: 1 },
  initialScrollContent: { 
    flexGrow: 1, 
    padding: 20, 
    paddingBottom: 40 
  },
  welcomeSection: { marginBottom: 30, alignItems: 'center' },
  welcomeBox: {
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 22 },
  
  inputSection: { marginBottom: 30 },
  inputLabel: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  inputWrapper: { position: 'relative' },
  input: { 
    backgroundColor: '#ffffff', 
    borderWidth: 2, 
    borderColor: '#e5e7eb', 
    borderRadius: 20, 
    paddingVertical: 16, 
    paddingHorizontal: 20, 
    paddingRight: 100,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputButtons: { 
    flexDirection: 'row', 
    position: 'absolute', 
    right: 8, 
    top: 8, 
    alignItems: 'center', 
    gap: 6 
  },
  sendButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#16a34a', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendButtonDisabled: { backgroundColor: '#d1d5db' },
  cameraButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#6b7280', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 3,
  },
  
  questionsSection: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  questionCard: { 
    height: 140, 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  questionImage: { width: '100%', height: '100%' },
  questionOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  questionText: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 16,
    lineHeight: 22,
  },
  
  // Chat View
  chatViewContainer: { flex: 1 },
  chatHeader: { 
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  chatBackButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: { 
    fontSize: 16, 
    color: '#16a34a', 
    fontWeight: '600', 
    marginLeft: 8 
  },
  chatContainer: { flex: 1, padding: 16 },
  chatMessageWrapper: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chatMessageUser: { justifyContent: 'flex-end' },
  
  botAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#16a34a', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8,
    marginBottom: 4,
  },
  botAvatarText: { fontSize: 18 },
  userAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#3b82f6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8,
    marginBottom: 4,
  },
  userAvatarText: { fontSize: 18 },
  
  chatMessage: { 
    maxWidth: '75%', 
    padding: 16, 
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: { 
    backgroundColor: '#3b82f6', 
    borderBottomRightRadius: 6,
  },
  botMessage: { 
    backgroundColor: '#ffffff', 
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userText: { color: '#ffffff', fontSize: 16, lineHeight: 22 },
  botText: { color: '#1f2937', fontSize: 16, lineHeight: 24 },
  messageTime: { 
    fontSize: 11, 
    opacity: 0.7, 
    marginTop: 4,
    textAlign: 'right',
  },
  
  loadingMessage: { backgroundColor: '#f3f4f6' },
  loadingText: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center' },
  typingDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#9ca3af', 
    marginRight: 4,
  },
  
  // Chat Input
  chatInputWrapper: { 
    padding: 16, 
    paddingBottom: Platform.OS === 'ios' ? 16 : 20,
    borderTopWidth: 1, 
    borderTopColor: '#e5e7eb', 
    backgroundColor: '#ffffff',
    elevation: 8,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  chatInput: { 
    flex: 1, 
    borderRadius: 20, 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: 'transparent',
  },
  sendFollowUpButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#16a34a', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginLeft: 4,
    elevation: 3,
  },
  loadingDots: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});

export default AdvisoryScreen;
