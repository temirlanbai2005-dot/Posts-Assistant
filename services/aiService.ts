import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppSettings, LLMSource, SocialPlatform, TrendItem, TrendCategory } from "../types";
import { 
  SYSTEM_INSTRUCTION_GENERATOR, 
  SYSTEM_INSTRUCTION_TRENDS,
  SYSTEM_INSTRUCTION_TRENDS_AUDIO,
  SYSTEM_INSTRUCTION_TRENDS_FORMATS,
  SYSTEM_INSTRUCTION_TRENDS_PLOTS,
  SYSTEM_INSTRUCTION_CRITIQUE,
  SYSTEM_INSTRUCTION_BUSINESS,
  SYSTEM_INSTRUCTION_GROWTH
} from "../constants";

// --- CONFIGURATION ---
const MODEL_NAME = "gemini-2.5-flash"; // Используй стабильную модель

// Инициализация API
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key not found! Add VITE_GEMINI_API_KEY to .env file");
  }
  
  return new GoogleGenerativeAI(apiKey);
};

// --- CORE GENERATION ---

export const generatePost = async ({ topic, platform, settings, useSearch }: any): Promise<string> => {
  if (settings.llmSource === LLMSource.CloudGemini) {
    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ 
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION_GENERATOR,
      });

      const prompt = `
        Style: ${settings.userStyle}
        Platform: ${platform}
        Language: ${settings.targetLanguage}
        Topic: ${topic}
        Task: Write a viral post. Output ONLY the content.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "";
      
    } catch (error: any) {
      console.error("Gemini Gen Error:", error);
      return `Error generating post. Check API Key. Details: ${error.message}`;
    }
  } else {
    return "Local LLM mode is not supported on Cloud Hosting. Please switch to Cloud Gemini in Settings.";
  }
};

// --- TRENDS ANALYSIS ---

export const analyzeTrends = async (settings: AppSettings, category: TrendCategory): Promise<TrendItem[]> => {
  try {
    const ai = getAI();
    
    let systemInstruction = SYSTEM_INSTRUCTION_TRENDS;
    let query = "Find the latest 3D Art and CGI trends.";

    if (category === TrendCategory.Audio) {
      systemInstruction = SYSTEM_INSTRUCTION_TRENDS_AUDIO;
      query = "What are trending audio/songs for 3D artists this week?";
    } else if (category === TrendCategory.Formats) {
      systemInstruction = SYSTEM_INSTRUCTION_TRENDS_FORMATS;
      query = "What are viral video formats for 3D renders on Instagram and TikTok?";
    } else if (category === TrendCategory.Plots) {
      systemInstruction = SYSTEM_INSTRUCTION_TRENDS_PLOTS;
      query = "What are trending concepts for 3D rendering in 2024-2025?";
    }

    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: systemInstruction,
    });

    const fullPrompt = `${query}
    
    Return a JSON ARRAY only (no markdown):
    [{ "platform": "...", "trendName": "...", "description": "...", "hypeReason": "...", "growthMetric": "...", "vibe": "..." }]
    `;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text() || "";
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("Trend Search Error:", error);
    return [{
      platform: SocialPlatform.Instagram,
      trendName: "Search Error",
      description: "Could not fetch trends. Check API Key.",
      hypeReason: error.message || "Unknown error",
      category: category
    }];
  }
};

// --- UTILS ---

export const generateCreativeIdea = async (settings: AppSettings, platform: SocialPlatform): Promise<string> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
      Generate ONE PROVOCATIVE, VIRAL content hook for a 3D artist for ${platform}.
      Be controversial or valuable. Max 1-2 sentences.
      Language: ${settings.targetLanguage}
      Output ONLY the text.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text() || "";
  } catch (e) { 
    return "Error generating idea."; 
  }
};

export const translatePost = async (content: string, settings: AppSettings): Promise<string> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    
    const result = await model.generateContent(`Translate to ${settings.targetLanguage}: ${content}`);
    return result.response.text() || "";
  } catch (e) { 
    return content; 
  }
};

export const analyzePostImprovement = async (content: string, platform: string, settings: AppSettings): Promise<string> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    
    const result = await model.generateContent(
      `Critique this ${platform} post for viral potential: "${content}". Language: ${settings.targetLanguage}`
    );
    return result.response.text() || "";
  } catch (e) { 
    return "Analysis failed."; 
  }
};

export const analyzeImage = async (base64Image: string, settings: AppSettings): Promise<string> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION_CRITIQUE,
    });
    
    const result = await model.generateContent([
      { text: `Analyze this 3D render. Language: ${settings.targetLanguage}` },
      { inlineData: { data: base64Image, mimeType: "image/png" } }
    ]);
    
    return result.response.text() || "";
  } catch (e: any) { 
    return `Vision Error: ${e.message}`; 
  }
};

export const generateBusinessResponse = async (input: string, type: string, settings: AppSettings): Promise<string> => {
  let instr = SYSTEM_INSTRUCTION_BUSINESS;
  if (type === 'pricing') instr += "\nMODE: PRICING";
  if (type === 'contract') instr += "\nMODE: CONTRACT";
  if (type === 'chat') instr += "\nMODE: CHAT";

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: instr,
    });
    
    const result = await model.generateContent(
      `Input: ${input}. Language: ${settings.targetLanguage}`
    );
    return result.response.text() || "";
  } catch (e) { 
    return "Business AI Error."; 
  }
};

export const generateGrowthAdvice = async (input: string, mode: string, settings: AppSettings): Promise<string> => {
  const instr = mode === 'mentor' ? "You are a Mentor." : "You are a Competitor Analyst.";
  
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION_GROWTH,
    });
    
    const result = await model.generateContent(
      `${instr} User Query: ${input}. Language: ${settings.targetLanguage}`
    );
    return result.response.text() || "";
  } catch (e) { 
    return "Growth AI Error."; 
  }
};
