
export enum SocialPlatform {
  Telegram = 'Telegram',
  Instagram = 'Instagram',
  Twitter = 'Twitter/X',
  LinkedIn = 'LinkedIn',
  ArtStation = 'ArtStation',
  TikTok = 'TikTok',
  Pinterest = 'Pinterest',
  Threads = 'Threads',
  YouTube = 'YouTube'
}

export enum LLMSource {
  CloudGemini = 'Cloud Gemini',
  Local = 'Local LLM',
  CustomAPI = 'Custom API'
}

export enum AppMode {
  Generator = 'generator',
  Ideas = 'ideas', // New Tab
  Trends = 'trends',
  VisualAudit = 'visual_audit',
  Business = 'business',
  Tasks = 'tasks',
  Settings = 'settings'
}

export enum TrendCategory {
  General = 'General',
  Audio = 'Viral Audio',
  Formats = 'Video Formats',
  Plots = 'Hashtags & Plots'
}

export interface AppSettings {
  userStyle: string;
  // Global Fallback
  targetLanguage: string; 
  // Per-Platform Language Overrides
  platformLanguages: Record<SocialPlatform, string>;
  
  llmSource: LLMSource;
  customApiUrl: string;
  customApiKey: string;
  enableDailyReminders: boolean;
  dailyReminderTime: string;
}

export interface GeneratedPost {
  platform: SocialPlatform;
  content: string;
  critique: string;
  hashtags: string[];
}

export interface ContentIdea {
  headline: string;
  platform: SocialPlatform;
  targetAudience: string; // "Clients", "Juniors", "General"
  goal: string; // "Sales", "Viral", "Brand"
  reasoning: string;
}

export interface TrendItem {
  platform: SocialPlatform;
  trendName: string;
  description: string;
  hypeReason: string;
  category?: TrendCategory;
  growthMetric?: string;
  difficulty?: string;
  vibe?: string;
}

export interface GeneratorState {
  initialTopic?: string;
  initialPlatform?: SocialPlatform;
  timestamp?: number; // Added to force effect triggers
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isDaily: boolean; 
  createdAt: number;
}

export interface Note {
  id: string;
  text: string;
  createdAt: number;
}
