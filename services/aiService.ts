import { GoogleGenAI } from "@google/genai";
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
const MODEL_NAME = "gemini-2.5-flash"; 

// --- CORE GENERATION ---

export const generatePost = async ({ topic, platform, settings, useSearch }: any): Promise<string> => {
  if (settings.llmSource === LLMSource.CloudGemini) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION_GENERATOR,
        // No safety settings needed as per new guidance unless blocking is required
      };

      // Enable Google Search Tool if requested
      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const prompt = `
        Style: ${settings.userStyle}
        Platform: ${platform}
        Language: ${settings.targetLanguage}
        Topic: ${topic}
        Task: Write a viral post. Output ONLY the content.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: config
      });
      
      return response.text || "";
    } catch (error: any) {
      console.error("Gemini Gen Error:", error);
      return `Error generating post. Check API Key. Details: ${error.message}`;
    }
  } else {
    return "Local LLM mode is not supported on Cloud Hosting (Render). Please switch to Cloud Gemini in Settings.";
  }
};

// --- TRENDS WITH REAL INTERNET SEARCH ---

export const analyzeTrends = async (settings: AppSettings, category: TrendCategory): Promise<TrendItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 1. Select prompt based on category
  let systemInstruction = SYSTEM_INSTRUCTION_TRENDS;
  let query = "Find the absolutely latest, breaking 3D Art and CGI trends from the last 24 hours.";

  if (category === TrendCategory.Audio) {
    systemInstruction = SYSTEM_INSTRUCTION_TRENDS_AUDIO;
    query = "Search TikTok Creative Center and Instagram Reels trends for trending audio/songs used by 3D artists this week.";
  } else if (category === TrendCategory.Formats) {
    systemInstruction = SYSTEM_INSTRUCTION_TRENDS_FORMATS;
    query = "Search for viral video editing formats and templates for 3D renders on Instagram and TikTok right now.";
  } else if (category === TrendCategory.Plots) {
    systemInstruction = SYSTEM_INSTRUCTION_TRENDS_PLOTS;
    query = "Search for trending hashtags and popular satisfying video concepts for 3D rendering in 2024-2025.";
  }

  const fullPrompt = `${query}
  
  CRITICAL INSTRUCTION:
  After searching, compile your findings into a STRICT JSON ARRAY.
  Do not include markdown code blocks. Just the raw array.
  
  Format:
  [{ "platform": "...", "trendName": "...", "description": "...", "hypeReason": "...", "growthMetric": "...", "vibe": "..." }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }] // Enforce Real Search
      }
    });

    const text = response.text || "";
    
    // Clean up response if model adds markdown
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("Trend Search Error:", error);
    return [{
      platform: SocialPlatform.Instagram,
      trendName: "Search Error",
      description: "Could not access Google Search via API. Please check your API Key.",
      hypeReason: error.message || "Unknown error",
      category: category
    }];
  }
};

// --- UTILS ---

export const generateCreativeIdea = async (settings: AppSettings, platform: SocialPlatform): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const examples = `
        Examples of the desired tone:
        - "💸 Warning: The cheapest 3D quote is usually the most expensive choice in the long run."
        - "🤖 AI won't replace 3D artists. It will replace SLOW artists."
        - "🎯 You should NOT pay for a 3D model 'by the hour.' Here’s the critical reason why."
        - "❗What should a 3D artist ask before starting to model?"
        `;

        const platformNuances = `
        ADAPT FOR ${platform}:
        - If LinkedIn: Focus on Business, Pricing, Professional Standards, Client Relations. Provocative career advice.
        - If Twitter/X or Threads: Focus on "Hot Takes", Controversial Opinions on Software (Blender vs Maya), Industry Culture, or Relatable Artist Pain. Short & Punchy.
        - If Instagram/TikTok/Pinterest: Focus on Visual hooks, "Stop doing this...", "My top 3 secrets...", or Process comparisons.
        - If Telegram: Insider tips, "Real talk" about the industry, unfiltered advice.
        `;

        const prompt = `
          Generate ONE PROVOCATIVE, VIRAL content hook/idea for a 3D artist specifically for ${platform}.
          
          ${examples}

          ${platformNuances}
          
          REQUIREMENTS:
          1. Use Emojis appropriate for the tone.
          2. Be controversial or extremely valuable (Insider info).
          3. Max 1-2 sentences.
          4. Language: ${settings.targetLanguage}
          5. Output ONLY the text of the idea.
        `;

        const response = await ai.models.generateContent({ 
            model: MODEL_NAME,
            contents: prompt,
        });
        return response.text || "";
    } catch (e) { return "Error generating idea."; }
};

export const translatePost = async (content: string, settings: AppSettings): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME, 
            contents: `Translate to ${settings.targetLanguage}: ${content}`
        });
        return response.text || "";
    } catch (e) { return content; }
};

export const analyzePostImprovement = async (content: string, platform: string, settings: AppSettings): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME,
            contents: `Critique this ${platform} post for viral potential: "${content}". Language: ${settings.targetLanguage}`
        });
        return response.text || "";
    } catch (e) { return "Analysis failed."; }
};

export const analyzeImage = async (base64Image: string, settings: AppSettings): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ 
        model: MODEL_NAME,
        contents: {
            parts: [
                { text: `Analyze this 3D render. Language: ${settings.targetLanguage}` },
                { inlineData: { data: base64Image, mimeType: "image/png" } }
            ]
        },
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_CRITIQUE,
        }
    });
    return response.text || "";
  } catch (e: any) { return `Vision Error: ${e.message}`; }
};

export const generateBusinessResponse = async (input: string, type: string, settings: AppSettings): Promise<string> => {
    let instr = SYSTEM_INSTRUCTION_BUSINESS;
    if(type === 'pricing') instr += "\nMODE: PRICING";
    if(type === 'contract') instr += "\nMODE: CONTRACT";
    if(type === 'chat') instr += "\nMODE: CHAT";

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME,
            contents: `Input: ${input}. Language: ${settings.targetLanguage}`,
            config: {
                systemInstruction: instr
            }
        });

        return response.text || "";
    } catch (e) { return "Business AI Error."; }
};

export const generateGrowthAdvice = async (input: string, mode: string, settings: AppSettings): Promise<string> => {
    const instr = mode === 'mentor' ? "You are a Mentor." : "You are a Competitor Analyst.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ 
            model: MODEL_NAME,
            contents: `${instr} User Query: ${input}. Language: ${settings.targetLanguage}`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_GROWTH
            }
        });
        return response.text || "";
    } catch (e) { return "Growth AI Error."; }
};