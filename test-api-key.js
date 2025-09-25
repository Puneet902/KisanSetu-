const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('=== Testing Gemini API Key ===');
console.log('API Key exists:', !!GEMINI_API_KEY);
console.log('Key starts with:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) + '...' : 'N/A');

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

async function testApiKey() {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    console.log('Sending test request to Gemini API...');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048,
      },
    });
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: 'Hello, how are you?'
        }]
      }]
    });
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! API key is valid.');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ Error testing API key:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    if (error.message.includes('API key not valid')) {
      console.log('\n🔑 The API key exists but is not valid. Please:');
      console.log('1. Go to https://aistudio.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Update your .env file with the new key');
    } else if (error.message.includes('quota')) {
      console.log('\n⚠️  You might have exceeded your quota. Check your usage at:');
      console.log('https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas');
    } else {
      console.log('\n🔍 Check if the API is enabled:');
      console.log('https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    }
  }
}

testApiKey();
