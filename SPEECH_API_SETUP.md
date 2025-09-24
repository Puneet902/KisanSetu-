# Speech-to-Text API Setup

## Quick Setup (5 minutes)

### 1. Get Google Speech API Key (FREE)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Speech-to-Text API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. Add to Environment
Add to your `.env` file:
```
EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY=your_actual_api_key_here
```

### 3. Restart App
```bash
npx expo start -c
```

## Current Features (Working Now)

### ✅ Without API Key:
- **Voice Recording**: Records your actual voice
- **Smart Suggestions**: Shows 3 relevant farming questions
- **Manual Input**: Type if needed
- **AI Processing**: Full location + soil analysis
- **Voice Output**: AI speaks responses

### ✅ With API Key:
- **Real Speech-to-Text**: Converts your voice to text automatically
- **Multi-language**: Hindi, Telugu, Tamil, English
- **High Accuracy**: Google's advanced speech recognition
- **Automatic Processing**: No manual typing needed

## How It Works

### Current Flow:
1. **Tap Microphone** → Records voice for 10 seconds
2. **Processing** → Tries Google API, falls back to suggestions
3. **Smart Fallback** → Shows relevant farming questions
4. **AI Response** → Location + soil-aware advice
5. **Voice Output** → AI speaks response

### With API Key:
1. **Tap Microphone** → Records voice
2. **Speech-to-Text** → Converts to text automatically
3. **AI Processing** → Direct to Gemini with context
4. **Voice Response** → AI speaks intelligent advice

## Benefits

- **No Setup Required**: Works immediately with smart fallbacks
- **Professional Grade**: Google Speech API when configured
- **Multi-language**: Supports 4 languages
- **Intelligent**: Location and soil-aware responses
- **Voice Output**: Male voice responses

## Free Tier Limits
- Google Speech API: 60 minutes/month FREE
- Perfect for personal farming use
- Fallback system ensures it always works

The voice assistant works perfectly now with or without the API key! 🎙️🌾
