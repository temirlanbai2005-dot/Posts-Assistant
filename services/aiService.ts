import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppSettings, LLMSource, SocialPlatform, TrendItem, TrendCategory, ContentIdea } from "../types";
import { 
  SYSTEM_INSTRUCTION_GENERATOR, 
  SYSTEM_INSTRUCTION_IDEAS,
  SYSTEM_INSTRUCTION_TRENDS,
  SYSTEM_INSTRUCTION_TRENDS_AUDIO,
  SYSTEM_INSTRUCTION_TRENDS_FORMATS,
  SYSTEM_INSTRUCTION_TRENDS_PLOTS,
  SYSTEM_INSTRUCTION_CRITIQUE,
  SYSTEM_INSTRUCTION_BUSINESS,
  SYSTEM_INSTRUCTION_GROWTH
} from "../constants";

// --- CONFIGURATION ---
const MODEL_NAME = "gemini-2.5-flash";

// --- HELPER: Get AI Instance ---
const getAI = (): GoogleGenerativeAI => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ VITE_GEMINI_API_KEY is not set!");
    throw new Error("API Key not configured. Add VITE_GEMINI_API_KEY to environment variables.");
  }
  
  console.log("✅ API Key found, length:", apiKey.length);
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

      const targetLang = settings.platformLanguages?.[platform] || settings.targetLanguage || "English";

      const prompt = `
        Target Platform: ${platform}
        Target Language: ${targetLang}
        User Style: ${settings.userStyle}
        Topic/Idea: ${topic}
        
        TASK: Write a post optimized for ${platform}'s specific audience.
        Include appropriate Emojis, CTA, and Hashtags.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
      
    } catch (error: any) {
      console.error("Gemini Gen Error:", error);
      return `Error generating post. Details: ${error.message}`;
    }
  } else {
    return "Local LLM mode is not supported. Please switch to Cloud Gemini in Settings.";
  }
};

// --- IDEA LAB GENERATION ---

export const generateBatchIdeas = async (
  settings: AppSettings, 
  platforms: SocialPlatform[] = [], 
  countPerPlatform: number = 2
): Promise<ContentIdea[]> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION_IDEAS,
    });

    const langContext = platforms
      .map(p => `${p}: ${settings.platformLanguages?.[p] || "English"}`)
      .join(", ");

    const prompt = `
      Generate viral content ideas/headlines for a 3D Artist.
      
      REQUESTED PLATFORMS: ${platforms.join(", ")}
      QUANTITY: Generate exactly ${countPerPlatform} distinct ideas for EACH platform.
      LANGUAGE RULES: ${langContext}.
      
      Strategy mix: Clients (Sales/B2B), Junior Artists (Tutorials), General Public (Visuals).
      
      OUTPUT STRICT JSON ARRAY ONLY, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
    
  } catch (error) {
    console.error("Idea Generation Error:", error);
    return [];
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
      query = "What are viral video formats for 3D renders?";
    } else if (category === TrendCategory.Plots) {
      systemInstruction = SYSTEM_INSTRUCTION_TRENDS_PLOTS;
      query = "What are trending concepts for 3D rendering in 2024-2025?";
    }

    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: systemInstruction,
    });

    const fullPrompt = `${query}
    
    Return JSON ARRAY only (no markdown):
    [{ "platform": "...", "trendName": "...", "description": "...", "hypeReason": "...", "growthMetric": "...", "vibe": "..." }]
    `;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("Trend Search Error:", error);
    return [{
      platform: SocialPlatform.Instagram,
      trendName: "Error",
      description: "Could not fetch trends.",
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
    
    const targetLang = settings.platformLanguages?.[platform] || settings.targetLanguage;

    const prompt = `
      Generate ONE PROVOCATIVE, VIRAL content hook for a 3D artist for ${platform}.
      Be controversial or extremely valuable. Max 1-2 sentences.
      Use appropriate Emojis.
      Language: ${targetLang}
      Output ONLY the text.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) { 
    return "Error generating idea."; 
  }
};

export const translatePost = async (content: string, settings: AppSettings): Promise<string> => {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    
    const result = await model.generateContent(`Translate to ${settings.targetLanguage}: ${content}`);
    return result.response.text();
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
    return result.response.text();
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
    
    return result.response.text();
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
    return result.response.text();
  } catch (e) { 
    return "Business AI Error."; 
  }
};

export const generateGrowthAdvice = async (input: string, mode: string, settings: AppSettings): Promise<string> => {
  const modeInstr = mode === 'mentor' ? "You are a Mentor." : "You are a Competitor Analyst.";
  
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION_GROWTH,
    });
    
    const result = await model.generateContent(
      `${modeInstr} User Query: ${input}. Language: ${settings.targetLanguage}`
    );
    return result.response.text();
  } catch (e) { 
    return "Growth AI Error."; 
  }
};
