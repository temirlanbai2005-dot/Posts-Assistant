
import React from 'react';
import { AppSettings, LLMSource, SocialPlatform } from '../types';
import { LANGUAGES, DEFAULT_STYLE, SUPPORTED_PLATFORMS } from '../constants';
import { Server, PenTool, Globe, RefreshCcw } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const handleChange = (key: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handlePlatformLangChange = (platform: SocialPlatform, lang: string) => {
    onUpdate({
        ...settings,
        platformLanguages: {
            ...settings.platformLanguages,
            [platform]: lang
        }
    });
  };

  const resetLanguages = () => {
     const defaults: any = {};
     // Your specific defaults
     Object.values(SocialPlatform).forEach(p => {
         if ([SocialPlatform.Telegram, SocialPlatform.TikTok, SocialPlatform.Threads, SocialPlatform.YouTube].includes(p)) {
             defaults[p] = "Russian";
         } else {
             defaults[p] = "English";
         }
     });
     handleChange('platformLanguages', defaults);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 overflow-y-auto h-full">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Server className="w-8 h-8 text-indigo-500" />
          Configuration
        </h2>
        <p className="text-slate-400">Manage your AI sources and personalization preferences.</p>
      </div>

      {/* Language Strategy */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Platform Language Strategy
            </h3>
            <button onClick={resetLanguages} className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" /> Reset to Defaults
            </button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_PLATFORMS.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${p.color}`}>{p.id}</span>
                    </div>
                    <select
                        value={settings.platformLanguages[p.id] || settings.targetLanguage}
                        onChange={(e) => handlePlatformLangChange(p.id, e.target.value)}
                        className="bg-slate-800 text-slate-200 text-sm rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-cyan-500"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>
            ))}
         </div>
      </div>

      {/* LLM Source Selection */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" /> AI Backend Source
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(Object.values(LLMSource) as LLMSource[]).map((source) => (
            <button
              key={source}
              onClick={() => handleChange('llmSource', source)}
              className={`p-4 rounded-lg border text-sm font-medium transition-all ${
                settings.llmSource === source
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {source}
            </button>
          ))}
        </div>

        {settings.llmSource !== LLMSource.CloudGemini && (
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">API URL</label>
              <input
                type="text"
                value={settings.customApiUrl}
                onChange={(e) => handleChange('customApiUrl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">API Key (Optional for local)</label>
              <input
                type="password"
                value={settings.customApiKey}
                onChange={(e) => handleChange('customApiKey', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="sk-..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Personalization */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5" /> Personalization
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">My Style Description</label>
            <textarea
              value={settings.userStyle}
              onChange={(e) => handleChange('userStyle', e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              placeholder={DEFAULT_STYLE}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
