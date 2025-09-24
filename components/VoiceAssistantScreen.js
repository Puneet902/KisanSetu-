import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Animated, Platform, TextInput, Modal, ScrollView, BackHandler } from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalization } from '../hooks/useLocalization';
import { ChevronLeftIcon, MicIcon, StopIcon, SettingsIcon } from './Icons';
import { generateChatResponse, getSoilAnalysisFromGemini } from '../services/geminiService';
import * as Location from 'expo-location';
import { supabase } from '../src/lib/supabaseClient';

const VoiceAssistantScreen = ({ navigation }) => {
  const { t, language } = useLocalization();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [soilInfo, setSoilInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);

  // Predefined questions that cycle through on voice input
  const voiceQuestions = [
    "What crops should I plant this season?",
    "When is the right time to harvest my crops?",
    "How do I improve my soil quality?",
    "What fertilizer should I use for my crops?",
    "How do I protect my crops from pests?",
    "When should I water my plants?",
    "What are the signs of plant diseases?",
    "How do I prepare soil for planting?"
  ];

  // Common farming questions for quick buttons
  const commonQuestions = [
    "What crops should I plant this season?",
    "How do I treat leaf spot disease?",
    "When is the best time to harvest wheat?",
    "What fertilizer should I use for tomatoes?",
    "How can I improve my soil quality?",
    "What are the signs of nitrogen deficiency?"
  ];

  useEffect(() => {
    fetchUserLocationFromDB();
    
    // Cleanup function to stop speech when component unmounts
    return () => {
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, []);

  // Stop speech when component unmounts or back button is pressed
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Stop speech when screen loses focus (back button, navigation, etc.)
  useFocusEffect(
    React.useCallback(() => {
      // Handle Android hardware back button
      const onBackPress = () => {
        console.log('🔊 Hardware back button pressed - stopping speech');
        Speech.stop();
        setIsSpeaking(false);
        setIsListening(false);
        setIsRecording(false);
        stopPulseAnimation();
        return false; // Let the default back action happen
      };

      // Add back button listener for Android
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        // This runs when screen loses focus
        console.log('🔊 Screen lost focus - stopping speech');
        Speech.stop();
        setIsSpeaking(false);
        setIsListening(false);
        setIsRecording(false);
        stopPulseAnimation();
        
        // Remove back button listener
        backHandler.remove();
      };
    }, [])
  );

  const fetchUserLocationFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, latitude, longitude')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.log('Supabase error:', error);
        return;
      }

      if (data && data.length > 0) {
        const { latitude, longitude } = data[0];
        setUserLocation({ lat: latitude, lon: longitude });
        console.log('🌍 User location loaded:', { lat: latitude, lon: longitude });
      }
    } catch (err) {
      console.log('Error fetching user location:', err);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startVoiceInput = () => {
    if (isListening) {
      // Stop listening and process current question
      stopVoiceInput();
      return;
    }

    setTranscription('');
    setResponse('');
    setIsListening(true);
    setIsRecording(true);
    startPulseAnimation();

    // Get current question from cycle
    const currentQuestion = voiceQuestions[currentQuestionIndex];
    console.log(`🎤 Voice activated - Ready for Question ${currentQuestionIndex + 1}: ${currentQuestion}`);
    
    // Don't show the question yet - just start listening
  };

  const stopVoiceInput = () => {
    if (!isListening) return;

    setIsListening(false);
    setIsRecording(false);
    stopPulseAnimation();

    // Get current question and show it now
    const currentQuestion = voiceQuestions[currentQuestionIndex];
    console.log(`🎤 Processing voice question: ${currentQuestion}`);
    
    // Now show the question that will be processed
    setTranscription(`Voice Question ${currentQuestionIndex + 1}: ${currentQuestion}`);
    setIsProcessing(true);
    processWithGemini(currentQuestion);

    // Move to next question for next time
    setCurrentQuestionIndex((prev) => (prev + 1) % voiceQuestions.length);
  };

  const handleSubmitInput = () => {
    if (inputText.trim()) {
      setTranscription(inputText.trim());
      setIsProcessing(true);
      setShowInputModal(false);
      setIsRecording(false);
      stopPulseAnimation();
      processWithGemini(inputText.trim());
    }
  };

  const handleCommonQuestion = (question) => {
    setTranscription(question);
    setIsProcessing(true);
    processWithGemini(question);
  };

  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    
 
  };

  const processWithGemini = async (text) => {
    try {
      console.log('🤖 Processing question with AI:', text);
      
      // Use stored location or try to get current location
      let location = userLocation;
      if (!location) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const currentLocation = await Location.getCurrentPositionAsync({});
            location = {
              lat: currentLocation.coords.latitude,
              lon: currentLocation.coords.longitude
            };
            setUserLocation(location);
          }
        } catch (locationError) {
          console.log('Location not available:', locationError);
        }
      }

      // Get soil analysis if we have location
      let soil = soilInfo;
      if (location && !soil) {
        console.log('🌱 Analyzing soil with Gemini AI...');
        soil = await getSoilAnalysisFromGemini(location.lat, location.lon);
        console.log('🌾 Soil analysis received:', soil);
        setSoilInfo(soil);
      }

      // Create comprehensive context with soil and location data
      const context = `
        LOCATION: ${soil?.country || "Unknown"}, ${soil?.region || "Unknown"} (${location ? `${location.lat}, ${location.lon}` : "Unknown"})
        SOIL: ${soil?.type || "Unknown"} | pH: ${soil?.ph || "Unknown"} | Climate: ${soil?.climate || "Unknown"}
        COMPOSITION: Clay ${soil?.clay || "?"} | Sand ${soil?.sand || "?"} | Silt ${soil?.silt || "?"} | Nitrogen ${soil?.nitrogen || "?"}
        
        QUESTION: ${text}
        
        INSTRUCTIONS:
        - Give a direct, focused answer to the farmer's question
        - Use simple, clear language (avoid technical jargon)
        - Provide 3-5 specific, actionable points
        - Consider the soil type, pH, and local climate in your advice
        - Format response with bullet points for easy reading
        - Keep each point under 25 words
        - Be practical and cost-effective for small farmers
        - Include location-specific recommendations
      `;

      console.log('📤 Sending context to Gemini...');
      const rawResponse = await generateChatResponse(context, [], language);
      
      // Format the response
      const formattedResponse = formatGeminiResponse(rawResponse);
      
      setResponse(formattedResponse);
      setIsProcessing(false);
      
      // Speak the response
      speakResponse(formattedResponse);
      
    } catch (error) {
      console.error('Failed to process with Gemini:', error);
      const errorMessage = "Sorry, I couldn't process your request. Please try again.";
      setResponse(errorMessage);
      setIsProcessing(false);
      speakResponse(errorMessage);
    }
  };

  // Format Gemini response for better readability
  const formatGeminiResponse = (response) => {
    if (!response) return response;
    
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
    
    return formatted;
  };

  const speakResponse = async (text) => {
    try {
      setIsSpeaking(true);
      console.log('🔊 Speaking response with female voice:', text);
      
      // Use expo-speech with female voice settings
      const speechLanguage = language === 'hi' ? 'hi-IN' : 
                           language === 'te' ? 'te-IN' : 
                           language === 'ta' ? 'ta-IN' : 'en-US';
      
      await Speech.speak(text, {
        language: speechLanguage,
        pitch: 1.2,  // Higher pitch for female voice
        rate: 0.8,   // Moderate rate for clarity
        quality: Speech.QUALITY_ENHANCED,
        onDone: () => {
          console.log('🔊 Speech completed');
          setIsSpeaking(false);
        },
        onStopped: () => {
          console.log('🔊 Speech stopped');
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error('🔊 Speech error:', error);
          setIsSpeaking(false);
        },
      });
      
    } catch (error) {
      console.error('Failed to speak response:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const getStatusText = () => {
    if (isListening) return `🎤 Ready! Tap again to ask question ${currentQuestionIndex + 1}`;
    if (isProcessing) return "🤖 Processing your question...";
    if (isSpeaking) return "🔊 AI is speaking...";
    return `👋 Tap to start (Question ${currentQuestionIndex + 1} ready)`;
  };

  const getStatusColor = () => {
    if (isRecording) return '#ef4444';
    if (isProcessing) return '#f59e0b';
    if (isSpeaking) return '#10b981';
    return '#6b7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              // Stop any ongoing speech
              Speech.stop();
              setIsSpeaking(false);
              navigation.goBack();
            }}
          >
            <ChevronLeftIcon width={24} height={24} color="#e2e8f0" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerGreeting}>{getTimeBasedGreeting()}</Text>
            <Text style={styles.headerText}>🎙️ Voice Assistant</Text>
          </View>
       
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Display */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {soilInfo && (
            <View style={styles.soilInfoContainer}>
              <Text style={styles.soilInfoText}>
                📍 {soilInfo.region}, {soilInfo.country} | 🌍 {soilInfo.type} soil | pH: {soilInfo.ph}
              </Text>
            </View>
          )}
        </View>

        {/* Voice Button */}
        <View style={styles.voiceButtonContainer}>
          <Animated.View style={[styles.voiceButtonWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={isRecording ? ['#ef4444', '#dc2626'] : ['#16a34a', '#15803d']}
              style={styles.voiceButton}
            >
              <TouchableOpacity
                style={styles.voiceButtonTouch}
                onPress={isRecording ? stopVoiceInput : startVoiceInput}
                disabled={isProcessing || isSpeaking}
              >
                {isRecording ? (
                  <StopIcon width={60} height={60} color="#ffffff" />
                ) : (
                  <MicIcon width={60} height={60} color="#ffffff" />
                )}
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Common Questions */}
        {!transcription && !response && !isProcessing && (
          <View style={styles.commonQuestionsContainer}>
            <Text style={styles.commonQuestionsTitle}>Quick Questions:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.commonQuestionsScroll}
            >
              {commonQuestions.slice(0, 6).map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.commonQuestionButton}
                  onPress={() => handleCommonQuestion(question)}
                >
                  <Text style={styles.commonQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Transcription Display */}
        {transcription ? (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionLabel}>You asked:</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        ) : null}

        {/* Response Display */}
        {response ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseLabel}>AI Response:</Text>
            <Text style={styles.responseText}>{response}</Text>
            {isSpeaking && (
              <TouchableOpacity style={styles.stopSpeakingButton} onPress={stopSpeaking}>
                <Text style={styles.stopSpeakingText}>🔇 Stop Speaking</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            • First tap: Start listening (red pulse){'\n'}
            • Second tap: Ask current question to AI{'\n'}
            • Questions cycle automatically (1→2→3...){'\n'}
            • Listen to responses with female voice{'\n'}
            • Or use quick question buttons above
          </Text>
          <Text style={styles.noteText}>
            🎤 Two-tap system! First tap = ready, second tap = ask question and get AI answer.
          </Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    minHeight: '100%',
  },
  statusContainer: {
    marginTop: 40,
    marginBottom: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  soilInfoContainer: {
    marginTop: 10,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  soilInfoText: {
    fontSize: 12,
    color: '#16a34a',
    textAlign: 'center',
    fontWeight: '500',
  },
  voiceButtonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  voiceButtonWrapper: {
    borderRadius: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  voiceButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonTouch: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcriptionContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  transcriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
  },
  responseContainer: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  stopSpeakingButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  stopSpeakingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  commonQuestionsContainer: {
    marginBottom: 20,
    width: '100%',
  },
  commonQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  commonQuestionsScroll: {
    flexGrow: 0,
  },
  commonQuestionButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 200,
  },
  commonQuestionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginTop: 'auto',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitDisabled: {
    backgroundColor: '#d1d5db',
  },
  modalSubmitText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default VoiceAssistantScreen;
