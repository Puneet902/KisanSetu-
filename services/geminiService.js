// services/geminiService.js
import { GEMINI_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';
import { encode as base64Encode } from 'base-64';

if (!GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY missing in .env");
}

// No SDK client in React Native to avoid Base64/polyfill issues

// Utility
function parseJsonLenient(text) {
  if (!text || typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch (_) {}
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (_) {}
  }
  return null;
}

// ✅ General chat response
async function generateChatResponse(message, context = {}) {
  try {
    const { location = "India", previousMessages = [] } = context;
    const historyText = previousMessages
      .map(m => `${m.sender === 'user' ? 'Farmer' : 'Assistant'}: ${m.text}`)
      .join("\n");

    const prompt = `
You are an AI farming advisor for Indian farmers.
Always give direct, practical advice.

Location policy:
- If the farmer's message mentions a location/region/state/city, USE THAT location.
- Otherwise, default to: ${location}.

Conversation so far:
${historyText}

Farmer: ${message}
Assistant:`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 512 },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini REST error ${res.status}: ${errText}`);
    }
    const data = await res.json();
    let text = '';
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    for (const p of parts) if (typeof p.text === 'string') text += p.text;
    return { type: "general_response", text, data: parseJsonLenient(text) };
  } catch (err) {
    console.error("❌ generateChatResponse error:", err);
    return { type: "error", text: "⚠️ AI error. Please try again.", data: null };
  }
}

// ✅ Soil analysis (used by Advisory/VoiceAssistant)
async function getSoilAnalysisFromGemini(lat, lon) {
  const prompt = `
Analyze soil at coordinates:
Latitude: ${lat}, Longitude: ${lon}

Respond in JSON only:
{
  "country": "Country",
  "region": "Region/State",
  "soilType": "Clay/Loam/Sandy",
  "ph": "6.0-7.5",
  "clay": "percent",
  "sand": "percent",
  "silt": "percent",
  "nitrogen": "Low/Medium/High",
  "climate": "Climate type",
  "description": "Short note"
}
`;

  const response = await generateChatResponse(prompt, { location: `${lat},${lon}` });
  return response.data || {
    country: "Unknown",
    region: "Unknown",
    soilType: "Unknown",
    ph: "Unknown",
    clay: "?",
    sand: "?",
    silt: "?",
    nitrogen: "?",
    climate: "Unknown",
    description: "No soil data"
  };
}

export { generateChatResponse, getSoilAnalysisFromGemini };

// ✅ Voice assistant: generate answer from recorded audio using Gemini Multimodal
// audioUri: file URI returned by Expo Audio.Recording
// options: { location?: string, language?: string }
export async function generateVoiceAnswerFromAudio(audioUri, options = {}) {
  const { location = 'India', language = 'en-IN' } = options;

  if (!audioUri) {
    throw new Error('Audio URI is required');
  }

  try {
    // Read audio file as base64. Some SDKs expect a string literal key.
    let base64Audio = '';
    try {
      base64Audio = await FileSystem.readAsStringAsync(audioUri, { encoding: 'base64' });
    } catch (e) {
      // Fallback: fetch file and manual Base64 encode
      const response = await fetch(audioUri);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      base64Audio = base64Encode(binary);
    }

    // Infer mime type from extension; default to audio/m4a
    let mimeType = 'audio/m4a';
    const lower = audioUri.toLowerCase();
    if (lower.endsWith('.wav')) mimeType = 'audio/wav';
    else if (lower.endsWith('.mp3')) mimeType = 'audio/mpeg';
    else if (lower.endsWith('.ogg')) mimeType = 'audio/ogg';
    else if (lower.endsWith('.webm')) mimeType = 'audio/webm';

    const prompt = `You are an Indian farming voice assistant.
- First, understand the user's spoken question from the audio.
- Location policy: If the user mentions a specific region/city/state in speech, USE THAT location; otherwise, use this fallback: ${location}.
- Answer directly and practically in ${language}.
- Keep it concise (2-4 sentences) unless the user asks for detail.`;

    // Use REST API to avoid SDK Base64/polyfill issues in React Native
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 256,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini REST error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    let text = '';
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    for (const p of parts) {
      if (typeof p.text === 'string') text += p.text;
    }
    if (!text) text = 'Sorry, I could not understand the audio. Please try again.';
    return { type: 'voice_response', text };
  } catch (err) {
    console.error('❌ generateVoiceAnswerFromAudio error:', err);
    throw err;
  }
}
