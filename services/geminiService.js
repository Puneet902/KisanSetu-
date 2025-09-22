// Mobile-compatible geminiService stub. Keeps same API as web service but uses mock when no API key.
const generateChatResponse = async (message, history, language) => {
  try {
    if (!process.env.API_KEY) {
      console.warn('API_KEY not set; returning mock response for mobile.');
      return 'Mock response from mobile geminiService.';
    }
    // In a production mobile app, call your secure backend to interact with Gemini.
    const res = await fetch('https://your-backend.example.com/genai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, language }),
    });
    const data = await res.json();
    return data.text || '';
  } catch (err) {
    console.error('geminiService error', err);
    return 'Error contacting AI service.';
  }
};

export { generateChatResponse };
export default { generateChatResponse };
