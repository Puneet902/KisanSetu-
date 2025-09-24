# Voice Assistant Setup Instructions

## Current Implementation
The Voice Assistant is currently implemented with fallback functionality that works without additional dependencies. It includes:

- ✅ **Audio Recording**: Uses `expo-av` (already installed)
- ✅ **Speech-to-Text Simulation**: Random farming questions for demo
- ✅ **AI Processing**: Uses existing Gemini API
- ✅ **Text-to-Speech Simulation**: Shows response in alert dialog

## To Enable Full Voice Features

### 1. Install Required Packages
```bash
# Install expo-speech for text-to-speech
expo install expo-speech

# For real speech-to-text, you'll need one of these services:
npm install @google-cloud/speech  # Google Speech-to-Text
# OR
npm install microsoft-cognitiveservices-speech-sdk  # Azure Speech
# OR
npm install aws-sdk  # AWS Transcribe
```

### 2. Update VoiceAssistantScreen.js

#### Enable Text-to-Speech
Uncomment and update the speech import:
```javascript
import * as Speech from 'expo-speech';
```

Replace the `speakResponse` function with:
```javascript
const speakResponse = async (text) => {
  try {
    setIsSpeaking(true);
    
    const speechLanguage = language === 'hi' ? 'hi-IN' : 
                         language === 'te' ? 'te-IN' : 
                         language === 'ta' ? 'ta-IN' : 'en-US';

    await Speech.speak(text, {
      language: speechLanguage,
      pitch: 1.0,
      rate: 0.8,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  } catch (error) {
    console.error('Failed to speak response:', error);
    setIsSpeaking(false);
  }
};
```

#### Enable Real Speech-to-Text
Replace the `simulateSpeechToText` function with a real implementation using your chosen service.

### 3. Add API Keys
Add your speech service API keys to `.env`:
```
EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY=your_google_key
EXPO_PUBLIC_AZURE_SPEECH_KEY=your_azure_key
EXPO_PUBLIC_AWS_ACCESS_KEY=your_aws_key
```

### 4. Permissions
The app already requests microphone permissions through `expo-av`.

## Features

### Current Features ✅
- **Voice Recording**: Tap and hold to record voice
- **Visual Feedback**: Animated microphone with pulse effect
- **AI Processing**: Processes questions with Gemini API
- **Location Context**: Includes user location in AI responses
- **Multi-language Support**: Supports Hindi, Telugu, Tamil, English
- **Beautiful UI**: Modern design with gradients and animations

### Planned Features 🚧
- **Real Speech-to-Text**: Convert voice to text accurately
- **Real Text-to-Speech**: Speak responses in user's language
- **Continuous Conversation**: Keep conversation context
- **Voice Commands**: Quick actions via voice
- **Offline Mode**: Basic voice features without internet

## Usage
1. Tap the microphone button to start recording
2. Speak your farming question clearly
3. Tap stop when finished
4. Wait for AI to process and respond
5. Listen to the response (currently shows in dialog)

## Troubleshooting
- **No audio recording**: Check microphone permissions
- **No speech output**: Install expo-speech package
- **Poor recognition**: Implement real speech-to-text service
- **Wrong language**: Check language settings in app

## API Integration Examples

### Google Speech-to-Text
```javascript
import speech from '@google-cloud/speech';

const client = new speech.SpeechClient({
  keyFilename: 'path/to/service-account-key.json',
});

const request = {
  audio: { content: audioBytes },
  config: {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  },
};

const [response] = await client.recognize(request);
```

### Azure Speech Services
```javascript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
speechConfig.speechRecognitionLanguage = 'en-US';

const recognizer = new sdk.SpeechRecognizer(speechConfig);
```

## Notes
- The current implementation is fully functional for demo purposes
- Real speech services require API keys and internet connection
- Consider implementing offline speech recognition for better user experience
- Test thoroughly on different devices and languages
