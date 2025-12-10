
import React, { useState } from 'react';
import { AppSettings, ContentIdea, SocialPlatform } from '../types';
import { generateBatchIdeas } from '../services/aiService';
import { Lightbulb, RefreshCw, ArrowRight, Target, BarChart2, Filter, Layers } from 'lucide-react';
import { SUPPORTED_PLATFORMS } from '../constants';

interface IdeaLabProps {
  settings: AppSettings;
  onUseIdea: (idea: ContentIdea) => void;
}

const IdeaLab: React.FC<IdeaLabProps> = ({ settings, onUseIdea }) => {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(SUPPORTED_PLATFORMS.map(p => p.id));
  const [quantityPerPlatform, setQuantityPerPlatform] = useState<number>(3);

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const toggleAll = () => {
    if (selectedPlatforms.length === SUPPORTED_PLATFORMS.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(SUPPORTED_PLATFORMS.map(p => p.id));
    }
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) return;
    setIsGenerating(true);
    setIdeas([]); // Clear old ideas to show fresh start
    try {
        const newIdeas = await generateBatchIdeas(settings, selectedPlatforms, quantityPerPlatform);
        setIdeas(newIdeas);
    } catch(e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 h-full flex flex-col">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-8 h-8 text-amber-400" />
                    Idea Lab
                </h2>
                <p className="text-slate-400">Generate viral hooks tailored to specific platforms.</p>
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={isGenerating || selectedPlatforms.length === 0}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                    isGenerating || selectedPlatforms.length === 0 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'
                }`}
            >
                {isGenerating ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
                {isGenerating ? 'Cooking...' : `Generate ${selectedPlatforms.length * quantityPerPlatform} Hooks`}
            </button>
        </div>

        {/* Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            {/* Quantity Slider */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-300 w-32 shrink-0">
                    <Layers className="w-4 h-4 text-amber-500" />
                    Count per App:
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={quantityPerPlatform} 
                    onChange={(e) => setQuantityPerPlatform(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-amber-400 font-bold w-8 text-center">{quantityPerPlatform}</span>
            </div>

            {/* Platform Toggles */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                        <Filter className="w-4 h-4 text-amber-500" />
                        Target Platforms:
                    </div>
                    <button onClick={toggleAll} className="text-xs text-indigo-400 hover:text-white">
                        {selectedPlatforms.length === SUPPORTED_PLATFORMS.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SUPPORTED_PLATFORMS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => togglePlatform(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                                selectedPlatforms.includes(p.id)
                                ? `bg-slate-800 ${p.color} border-slate-600 ring-1 ring-slate-500`
                                : 'bg-slate-950 text-slate-600 border-slate-800 hover:border-slate-700'
                            }`}
                        >
                            {p.id}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 pr-2">
        {ideas.length === 0 && !isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
               <Lightbulb className="w-16 h-16 mb-4 opacity-20" />
               <p>Select platforms above and click Generate to fill your content calendar.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea, idx) => {
                    const platformMeta = SUPPORTED_PLATFORMS.find(p => p.id === idea.platform);
                    return (
                        <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-all group flex flex-col h-full shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${platformMeta?.color || 'text-white'}`}>{idea.platform}</span>
                                    {settings.platformLanguages[idea.platform] === 'Russian' && <span className="text-[10px] bg-red-900/30 text-red-300 px-1.5 rounded font-bold">RU</span>}
                                    {settings.platformLanguages[idea.platform] === 'English' && <span className="text-[10px] bg-blue-900/30 text-blue-300 px-1.5 rounded font-bold">EN</span>}
                                </div>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${
                                    idea.goal === 'Sales' ? 'border-green-500/30 text-green-400' :
                                    idea.goal === 'Viral' ? 'border-pink-500/30 text-pink-400' :
                                    'border-indigo-500/30 text-indigo-400'
                                }`}>
                                    {idea.goal}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-3 leading-snug">{idea.headline}</h3>
                            
                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Target className="w-4 h-4" />
                                    <span>Target: <span className="text-slate-200">{idea.targetAudience}</span></span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-950/50 p-3 rounded border border-slate-800/50">
                                    <BarChart2 className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />
                                    <span>{idea.reasoning}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => onUseIdea(idea)}
                                className="w-full py-3 bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 rounded-lg font-bold transition-all flex items-center justify-center gap-2 mt-auto border border-slate-700 hover:border-transparent"
                            >
                                Use This Idea <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default IdeaLab;
