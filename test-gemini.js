const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('=== Testing Gemini API ===');
console.log('API Key starts with:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) + '...' : 'No key found');

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

async function testGemini() {
  try {
    console.log('Initializing Gemini client...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // For text-only input, use the gemini-1.5-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    console.log('Sending test request to Gemini...');
    const result = await model.generateContent('Hello, how are you?');
    const response = await result.response;
    const text = response.text();
    
    console.log('Success! Gemini response:', text);
  } catch (error) {
    console.error('Error testing Gemini API:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGemini();
