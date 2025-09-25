import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Linking, Animated, ScrollView, BackHandler } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { generateVoiceAnswerFromAudio } from '../services/geminiService';

export default function VoiceAssistant({ route, navigation }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastText, setLastText] = useState('');
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [audioSessionReady, setAudioSessionReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('India');
  const [locationLoading, setLocationLoading] = useState(false);
  const locationHint = locationName;

  // Single source of truth for recording
  const currentRecording = useRef(null);
  const isCurrentlyRecording = useRef(false);

  // Animation refs for Gemini-style effects
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.5)).current;
  const waveAnim3 = useRef(new Animated.Value(0.7)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Location fetching function
  const fetchUserLocation = async () => {
    try {
      console.log('📍 Fetching user location...');
      setLocationLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Location permission denied');
        setLocationName('India'); // Fallback to India
        return;
      }

      // Get current position with timeout and error handling
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000, // 10 second timeout
        maximumAge: 300000, // Accept cached location up to 5 minutes old
      });

      console.log('📍 Location coordinates:', location.coords);
      setUserLocation(location.coords);

      // Reverse geocode to get readable address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        console.log('📍 Reverse geocoded address:', address);
        
        // Create a readable location string
        let locationString = '';
        if (address.subregion) locationString += address.subregion;
        if (address.region) {
          locationString += locationString ? `, ${address.region}` : address.region;
        }
        if (address.country) {
          locationString += locationString ? `, ${address.country}` : address.country;
        }
        
        if (!locationString) locationString = 'India';
        
        console.log('📍 Final location string:', locationString);
        setLocationName(locationString);
      } else {
        setLocationName('India');
      }
    } catch (error) {
      console.error('❌ Error fetching location:', error);
      
      // Provide more specific error handling
      if (error.message.includes('location services') || error.message.includes('unavailable')) {
        console.log('💡 Location services are disabled or unavailable');
        setLocationName('India'); // Fallback to India
      } else if (error.message.includes('permission') || error.message.includes('denied')) {
        console.log('💡 Location permission was denied');
        setLocationName('India'); // Fallback to India
      } else if (error.message.includes('timeout')) {
        console.log('💡 Location request timed out');
        setLocationName('India'); // Fallback to India
      } else {
        console.log('💡 Unknown location error, using fallback');
        setLocationName('India'); // Fallback to India
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // Enhanced Gemini-style animations
  const startRecordingAnimation = () => {
    // Scale up button with bounce
    Animated.spring(scaleAnim, {
      toValue: 1.15,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Start glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Start wave animations with different speeds
    const waveAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim1, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim1, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const waveAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim2, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim2, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const waveAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim3, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim3, {
          toValue: 0.7,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    waveAnimation1.start();
    waveAnimation2.start();
    waveAnimation3.start();
  };

  const startProcessingAnimation = () => {
    // Stop all other animations
    pulseAnim.stopAnimation();
    waveAnim1.stopAnimation();
    waveAnim2.stopAnimation();
    waveAnim3.stopAnimation();
    glowAnim.stopAnimation();

    // Scale down slightly for processing
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();

    // Start rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();
  };

  const stopAllAnimations = () => {
    // Reset all animations
    pulseAnim.stopAnimation();
    waveAnim1.stopAnimation();
    waveAnim2.stopAnimation();
    waveAnim3.stopAnimation();
    rotateAnim.stopAnimation();
    glowAnim.stopAnimation();

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const setupAudioSession = async () => {
    // Only set up once and track state
    if (audioSessionReady) {
      console.log('✅ Audio session already ready');
      return true;
    }

    try {
      console.log('🔧 Setting up audio session...');
      
      // First ensure we have permissions
      if (!permissionResponse?.granted) {
        console.log('❌ No audio permissions granted');
        return false;
      }

      // Basic audio session setup - minimal configuration that should work
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      setAudioSessionReady(true);
      console.log('✅ Audio session setup successful');
      return true;
    } catch (err) {
      console.error('❌ Error setting up audio session:', err?.message || String(err));
      setAudioSessionReady(false);
      return false;
    }
  };

  // Handle back button press (both software and hardware)
  const handleBackPress = async () => {
    console.log('🔙 Back button pressed (hardware/software)');
    
    // Stop speech immediately if currently speaking
    if (isSpeaking) {
      try {
        console.log('🔇 Stopping speech due to back navigation...');
        await Speech.stop();
        setIsSpeaking(false);
        console.log('✅ Speech stopped successfully');
      } catch (e) {
        console.error('❌ Error stopping speech on navigation:', e);
      }
    }
    
    // Stop any ongoing recording
    if (isRecording || isCurrentlyRecording.current) {
      try {
        console.log('🛑 Stopping recording due to back navigation...');
        await forceCleanupAllRecordings();
        console.log('✅ Recording stopped successfully');
      } catch (e) {
        console.error('❌ Error stopping recording on navigation:', e);
      }
    }
    
    // Navigate back to home
    navigation.navigate('Home');
    return true; // Prevent default back action
  };

  useEffect(() => {
    // Add hardware back button handler for Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    // Request necessary permissions when component mounts
    const setupAudio = async () => {
      try {
        console.log('🚀 Initializing Voice Assistant...');
        setIsInitializing(true);
        setError('');
        
        // Fetch user location first (in parallel with audio setup)
        fetchUserLocation();
        
        // Request audio recording permissions first
        console.log('🎤 Requesting audio permissions...');
        if (!permissionResponse?.granted) {
          const { status } = await Audio.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('❌ Audio permission denied');
            setError('Microphone permission is required to use voice features.');
            setIsInitializing(false);
            return;
          }
          console.log('✅ Audio permission granted');
        } else {
          console.log('✅ Audio permission already granted');
        }

        // Set up audio mode
        console.log('🔧 Setting up audio session...');
        const success = await setupAudioSession();
        if (!success) {
          setError('Audio session setup failed. This is usually an iOS issue. Please completely close the app (swipe up and swipe away) and reopen it.');
        } else {
          console.log('✅ Voice Assistant ready!');
        }
        
        setIsInitializing(false);
      } catch (err) {
        console.error('❌ Error setting up audio:', err?.message || String(err));
        setError('Failed to set up audio. Please close and reopen the app.');
        setIsInitializing(false);
      }
    };

    setupAudio();

    // Clean up on unmount
    return () => {
      console.log('🧹 Component unmounting - cleaning up...');
      
      // Remove hardware back button handler
      backHandler.remove();
      
      // Stop speech if currently speaking
      if (isSpeaking) {
        Speech.stop().catch(console.error);
        console.log('🔇 Speech stopped on component unmount');
      }
      
      // Force cleanup all recordings
      forceCleanupAllRecordings().catch(console.error);
      
      // Reset audio mode when component unmounts
      if (audioSessionReady) {
        Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
        }).catch(console.error);
      }
    };
  }, [permissionResponse]);

  // Simple cleanup function (keeping the UI improvements)
  const forceCleanupAllRecordings = async () => {
    console.log('🧹 FORCE cleaning all recordings...');
    
    try {
      // Stop any existing recording objects
      if (currentRecording.current) {
        console.log('🛑 Force stopping current recording...');
        await currentRecording.current.stopAndUnloadAsync();
      }
    } catch (e) {
      console.log('⚠ Error stopping current recording (expected):', e?.message);
    }

    try {
      if (recording) {
        console.log('🛑 Force stopping state recording...');
        await recording.stopAndUnloadAsync();
      }
    } catch (e) {
      console.log('⚠ Error stopping state recording (expected):', e?.message);
    }

    // Reset everything
    currentRecording.current = null;
    setRecording(null);
    isCurrentlyRecording.current = false;
    setIsRecording(false);
    setProcessing(false);
    
    console.log('✅ Force cleanup complete');
  };

  const handleRecordingToggle = async () => {
    console.log('🎯 Toggle pressed - isRecording:', isRecording, 'isCurrentlyRecording:', isCurrentlyRecording.current, 'processing:', processing);
    
    // If currently speaking, stop speech immediately
    if (isSpeaking) {
      console.log('🔇 Stopping speech...');
      try {
        await Speech.stop();
        setIsSpeaking(false);
      } catch (e) {
        console.error('Error stopping speech:', e);
      }
    }

    if (isRecording || isCurrentlyRecording.current) {
      // STOP recording - immediate UI feedback
      console.log('🛑 STOPPING recording immediately...');
      setIsRecording(false);
      isCurrentlyRecording.current = false;
      stopAllAnimations();
      
      // Set processing immediately to prevent multiple taps
      setProcessing(true);
      
      // Process the recording in background with timeout
      const stopPromise = stopRecording();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stop recording timeout')), 45000)
      );
      
      Promise.race([stopPromise, timeoutPromise]).catch(err => {
        console.error('❌ Error in stopRecording or timeout:', err);
        setError('Recording processing timed out. Please try again.');
        
        // Force cleanup on timeout
        forceCleanupAllRecordings().finally(() => {
          setProcessing(false);
        });
      });
      
    } else {
      // START recording - simplified condition
      console.log('🎤 Attempting to start recording...');
      if (processing) {
        console.log('⚠ Cannot start - currently processing');
        return;
      }
      
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      console.log('🎙 Starting recording...');
      
      // Prevent multiple recordings
      if (isCurrentlyRecording.current || isRecording) {
        console.log('⚠ Recording already in progress, skipping...');
        return;
      }

      // Check permissions
      if (!permissionResponse?.granted) {
        console.log('❌ No permissions for recording');
        setError('Microphone permission required');
        return;
      }

      // Check if audio session is ready
      if (!audioSessionReady) {
        console.log('❌ Audio session not ready - setting up now...');
        const success = await setupAudioSession();
        if (!success) {
          setError('Failed to setup audio session. Please try again.');
          return;
        }
      }

      // Clean up any existing recordings first
      await forceCleanupAllRecordings();

      // Set flags
      isCurrentlyRecording.current = true;
      setIsRecording(true);
      setError('');
      startRecordingAnimation();

      console.log('🎤 Creating new recording...');
      
      // Create new recording with better options
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);

      // Store recording
      currentRecording.current = newRecording;
      setRecording(newRecording);
      
      console.log('✅ Recording started successfully');
    } catch (err) {
      console.error('❌ Error starting recording:', err?.message || String(err));
      
      // Reset flags on error
      isCurrentlyRecording.current = false;
      setIsRecording(false);
      stopAllAnimations();
      
      // Better error handling
      if (err?.message?.includes('Only one Recording object')) {
        setError('Recording conflict detected. Please wait a moment and try again.');
        await forceCleanupAllRecordings();
      } else if (err?.message?.includes('Session activation failed') || err?.message?.includes('561017449')) {
        setError('Audio session error. Please close and restart the app.');
      } else if (err?.message?.includes('permission')) {
        setError('Microphone permission denied. Please enable it in settings.');
      } else {
        setError(`Recording failed: ${err?.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  const stopRecording = async () => {
    try {
      console.log('🛑 Stop recording called...');
      
      if (!currentRecording.current) {
        console.log('⚠ No recording to stop');
        isCurrentlyRecording.current = false;
        setProcessing(false);
        return;
      }

      // Prevent multiple calls
      if (processing && !isCurrentlyRecording.current) {
        console.log('⚠ Already processing, skipping duplicate stop call');
        return;
      }

      startProcessingAnimation();

      // Stop and get the recording URI
      console.log('📁 Stopping and saving recording...');
      await currentRecording.current.stopAndUnloadAsync();
      const uri = currentRecording.current.getURI();
      console.log('📁 Recording saved to:', uri);

      // Clean up immediately
      const recordingToProcess = currentRecording.current;
      currentRecording.current = null;
      setRecording(null);
      isCurrentlyRecording.current = false;

      if (!uri) {
        throw new Error('No audio was recorded');
      }

      // Verify file exists and has content
      let fileInfo;
      try {
        fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('📁 File info:', fileInfo);
        if (!fileInfo.exists || fileInfo.size === 0) {
          throw new Error('Recording file is empty or does not exist');
        }
      } catch (fileError) {
        console.error('❌ File verification error:', fileError);
        throw new Error('Recording file could not be verified');
      }

      // Process the audio with timeout
      console.log('🤖 Processing audio with AI...');
      console.log('📊 Audio file details:');
      console.log('- URI:', uri);
      console.log('- File size:', fileInfo?.size || 'unknown', 'bytes');
      console.log('- Location context:', locationHint);
      
      let text;
      try {
        // Add timeout to prevent hanging
        const aiPromise = generateVoiceAnswerFromAudio(uri, {
          location: locationHint,
          language: 'en-IN'
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI processing timeout')), 30000)
        );
        
        const result = await Promise.race([aiPromise, timeoutPromise]);
        text = result.text;
        
        console.log('✅ AI response received:', text);
        setLastText(text);
      } catch (aiError) {
        console.error('❌ AI processing error:', aiError);
        
        // Enhanced error logging for debugging
        console.error('📊 Error details:');
        console.error('- Error type:', aiError.constructor.name);
        console.error('- Error message:', aiError.message);
        console.error('- Audio URI:', uri);
        console.error('- File exists:', fileInfo?.exists || 'unknown');
        console.error('- File size:', fileInfo?.size || 'unknown');
        
        // Check if it's the specific Gemini API error
        if (aiError.message.includes('invalid argument')) {
          text = 'Audio format issue detected. Please try recording again with a shorter message.';
          console.log('💡 Suggestion: Try recording a shorter audio clip (5-10 seconds)');
        } else if (aiError.message.includes('quota') || aiError.message.includes('limit')) {
          text = 'API limit reached. Please try again in a few minutes.';
        } else if (aiError.message.includes('network') || aiError.message.includes('fetch')) {
          text = 'Network error. Please check your internet connection and try again.';
        } else {
          text = 'Sorry, I had trouble processing your request. Please try recording again.';
        }
        
        setLastText(text);
      }

      // Speak the response with timeout
      console.log('🔊 Speaking response...');
      setIsSpeaking(true);
      
      try {
        // Add timeout for speech as well
        const speechPromise = new Promise((resolve, reject) => {
          Speech.speak(text, {
            language: 'en-IN',
            rate: 0.85,
            pitch: 1.2,
            voice: Platform.OS === 'ios' ? 'com.apple.ttsbundle.Samantha-compact' : undefined,
            onStart: () => {
              console.log('🔊 Speech started');
              setIsSpeaking(true);
            },
            onDone: () => {
              console.log('🔊 Speech completed');
              setIsSpeaking(false);
              resolve();
            },
            onError: (e) => {
              console.error('❌ Speech error:', e?.message || String(e));
              setIsSpeaking(false);
              reject(e);
            }
          });
        });
        
        const speechTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Speech timeout')), 15000)
        );
        
        await Promise.race([speechPromise, speechTimeoutPromise]);
      } catch (speechError) {
        console.error('❌ Speech error or timeout:', speechError);
        setIsSpeaking(false);
      }

    } catch (err) {
      console.error('❌ Error processing recording:', err?.message || String(err));
      
      // More specific error messages
      if (err?.message?.includes('API key')) {
        setError('AI service configuration error. Please check your settings.');
      } else if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err?.message?.includes('empty') || err?.message?.includes('not exist')) {
        setError('Recording was empty. Please try speaking again.');
      } else {
        setError(`Sorry, I had trouble processing that. ${err?.message || 'Please try again.'}`);
      }
    } finally {
      setProcessing(false);
      stopAllAnimations();
      
      // Final cleanup
      currentRecording.current = null;
      setRecording(null);
      isCurrentlyRecording.current = false;

      console.log('✅ Recording processing complete');
    }
  };

  // Handle recording errors with better UX
  useEffect(() => {
    if (error) {
      console.log('⚠ Showing error to user:', error);
      Alert.alert(
        'Voice Assistant',
        error,
        [
          {
            text: 'Try Again',
            onPress: () => {
              setError('');
              console.log('🔄 User chose to try again');
            }
          },
          {
            text: 'OK',
            onPress: () => {
              setError('');
              console.log('✅ Error dismissed');
            }
          }
        ]
      );
    }
  }, [error]);

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Assistant</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <Text style={styles.hint}>
        {isRecording ? 'Tap anywhere to stop recording' : processing ? 'Processing...' : 'Tap to start recording'}
      </Text>
      
      {/* Location display */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          {locationLoading ? '📍 Getting your location...' : `📍 Location: ${locationName}`}
        </Text>
        {!locationLoading && (
          <TouchableOpacity 
            style={styles.refreshLocationButton}
            onPress={fetchUserLocation}
          >
            <Text style={styles.refreshLocationText}>🔄 Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {!permissionResponse?.granted ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            🎤 Microphone permission is required to use the voice assistant.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      ) : isInitializing ? (
        <View style={styles.initializingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.initializingText}>🔧 Setting up voice assistant...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError('');
              setIsInitializing(true);
              // Retry setup
              setTimeout(async () => {
                const success = await setupAudioSession();
                if (!success) {
                  setError('Audio session setup failed. Please completely close and reopen the app.');
                }
                setIsInitializing(false);
              }, 100);
            }}
          >
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Status text */}
          <Text style={styles.statusText}>
            {isRecording
              ? '🎙 Recording... Tap anywhere to stop'
              : processing
              ? '🤖 Processing your request...'
              : isSpeaking
              ? '🔊 Speaking... Tap to interrupt'
              : '🎤 Ready to listen - Ask for location-specific farming advice!'}
          </Text>

          {/* Enhanced button container - entire area is tappable */}
          <TouchableOpacity 
            style={styles.micContainer}
            onPress={handleRecordingToggle}
            disabled={false} // Always allow interaction for interruption
            activeOpacity={0.9}
          >
            {/* Outer wave rings - only show when recording */}
            {isRecording && (
              <>
                <Animated.View
                  style={[
                    styles.waveRing,
                    styles.waveRing1,
                    {
                      opacity: waveAnim1.interpolate({
                        inputRange: [0.3, 1.2],
                        outputRange: [0.2, 0.8],
                      }),
                      transform: [{ scale: waveAnim1 }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.waveRing,
                    styles.waveRing2,
                    {
                      opacity: waveAnim2.interpolate({
                        inputRange: [0.5, 1.1],
                        outputRange: [0.15, 0.6],
                      }),
                      transform: [{ scale: waveAnim2 }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.waveRing,
                    styles.waveRing3,
                    {
                      opacity: waveAnim3.interpolate({
                        inputRange: [0.7, 1],
                        outputRange: [0.1, 0.4],
                      }),
                      transform: [{ scale: waveAnim3 }],
                    },
                  ]}
                />
              </>
            )}

            {/* Glow effect for recording */}
            {isRecording && (
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    }),
                  },
                ]}
              />
            )}

            {/* Main button */}
            <Animated.View
              style={[
                {
                  transform: [
                    { scale: scaleAnim },
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.micButton,
                  isRecording && styles.micRecording,
                  processing && styles.micProcessing,
                  isSpeaking && styles.micSpeaking,
                ]}
              >
                {processing ? (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator color="#fff" size="large" />
                    <Text style={styles.processingText}>AI</Text>
                  </View>
                ) : (
                  <Text style={styles.micText}>
                    {isRecording ? '🛑' : isSpeaking ? '🔊' : '🎤'}
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Pulse effect for recording */}
            {isRecording && (
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.4],
                      outputRange: [0.6, 0],
                    }),
                  },
                ]}
              />
            )}
          </TouchableOpacity>

          {!!lastText && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🤖 AI Response</Text>
              <ScrollView 
                style={styles.scrollableTextContainer}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <Text style={styles.cardText}>{lastText}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60, // Same width as back button to center the title
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  hint: { 
    fontSize: 16, 
    color: '#64748b', 
    textAlign: 'center', 
    marginBottom: 20,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginBottom: 30,
  },
  micButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  micRecording: { 
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.4,
  },
  micProcessing: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
  },
  micSpeaking: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
  },
  micText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 36,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
  // Enhanced Gemini-style wave rings
  waveRing: {
    position: 'absolute',
    borderRadius: 150,
    borderWidth: 2.5,
  },
  waveRing1: {
    width: 180,
    height: 180,
    borderColor: '#10b981',
  },
  waveRing2: {
    width: 220,
    height: 220,
    borderColor: '#34d399',
  },
  waveRing3: {
    width: 260,
    height: 260,
    borderColor: '#6ee7b7',
  },
  // Glow ring for enhanced recording effect
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#10b981',
    zIndex: 5,
  },
  // Enhanced pulse ring for recording
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ef4444',
    zIndex: 5,
  },
  card: { 
    marginTop: 20,
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 24, 
    borderColor: '#e2e8f0', 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: 200, // Limit height to make it scrollable
  },
  scrollableTextContainer: {
    maxHeight: 120, // Limit the text area height
    marginTop: 8,
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 12,
  },
  cardText: { 
    fontSize: 16, 
    color: '#475569',
    lineHeight: 26,
    fontWeight: '400',
  },
  initializingContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginTop: 20,
  },
  initializingText: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  permissionContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  permissionText: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  refreshLocationButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  refreshLocationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});