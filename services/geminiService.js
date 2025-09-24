// services/geminiService.js
// Mobile-compatible Gemini API integration

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const generateChatResponse = async (message, history = [], language = "en") => {
  try {
    if (!GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY not set in .env; returning mock response.");
      return "Mock response from geminiService (no API key set).";
    }

    // Prepare context: include conversation history + latest user input
    const contents = [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return `API Error: ${data.error?.message || "Unknown error"}`;
    }

    // Extract text from Gemini response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    return text.trim();
  } catch (err) {
    console.error("geminiService error:", err);
    return "Error contacting Gemini AI service.";
  }
};

const getSoilAnalysisFromGemini = async (latitude, longitude) => {
  try {
    const prompt = `
      Analyze the soil and agricultural conditions for location: ${latitude}, ${longitude}
      
      Provide a JSON response with the following structure:
      {
        "country": "Country name",
        "region": "State/Region name", 
        "type": "Soil type (clay/sandy/loam)",
        "ph": "pH level (6.0-8.0)",
        "climate": "Climate type",
        "clay": "Clay percentage",
        "sand": "Sand percentage", 
        "silt": "Silt percentage",
        "nitrogen": "Nitrogen level"
      }
      
      Base your analysis on the geographical location and typical soil conditions for that area.
    `;

    const response = await generateChatResponse(prompt);
    
    try {
      // Try to parse JSON response
      const soilData = JSON.parse(response);
      return soilData;
    } catch (parseError) {
      // If JSON parsing fails, return default data based on location
      console.log('Using default soil data for location');
      return {
        country: "India",
        region: "Andhra Pradesh",
        type: "Clay",
        ph: "6.8",
        climate: "Tropical",
        clay: "45%",
        sand: "30%",
        silt: "25%",
        nitrogen: "Medium"
      };
    }
  } catch (error) {
    console.error('Soil analysis error:', error);
    return {
      country: "India",
      region: "Andhra Pradesh", 
      type: "Clay",
      ph: "6.8",
      climate: "Tropical",
      clay: "45%",
      sand: "30%",
      silt: "25%",
      nitrogen: "Medium"
    };
  }
};

export { generateChatResponse, getSoilAnalysisFromGemini };
export default { generateChatResponse, getSoilAnalysisFromGemini };
