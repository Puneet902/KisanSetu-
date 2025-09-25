const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Directly use the API key from environment
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('🔑 API Key starts with:', API_KEY.substring(0, 8) + '...');
console.log('🔑 API Key length:', API_KEY.length);

async function testGemini() {
  try {
    console.log('🚀 Initializing Gemini client...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try with the current text model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 100,
      },
    });

    console.log('📡 Sending test request to Gemini...');
    const result = await model.generateContent('Hello, is this working?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Gemini response:', text);
  } catch (error) {
    console.error('❌ Error testing Gemini API:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    // Additional debug info
    console.log('\n🔍 Debug Info:');
    console.log('- API Key exists:', !!API_KEY);
    console.log('- API Key starts with:', API_KEY.substring(0, 8) + '...');
    console.log('- Node.js version:', process.version);
    console.log('- Current directory:', process.cwd());
  }
}

testGemini();
