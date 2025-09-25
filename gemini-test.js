const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }

  console.log('🔑 Testing Gemini API Key...');
  console.log(`Key starts with: ${apiKey.substring(0, 5)}...`);
  console.log(`Key length: ${apiKey.length} characters`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('🚀 Sending test request...');
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Response:');
    console.log(text);
  } catch (error) {
    console.error('❌ Error:');
    console.error(error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGeminiKey();
