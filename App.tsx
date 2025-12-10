
import React, { useState, useEffect } from 'react';
import { AppMode, AppSettings, LLMSource, GeneratorState, TrendItem, TrendCategory, Task, Note, SocialPlatform, ContentIdea } from './types';
import { DEFAULT_STYLE } from './constants';
import { analyzeTrends } from './services/aiService';
import PostGenerator from './components/PostGenerator';
import TrendAnalyzer from './components/TrendAnalyzer';
import WorkAnalyzer from './components/WorkAnalyzer';
import BusinessCenter from './components/BusinessCenter';
import TaskManager from './components/TaskManager';
import Settings from './components/Settings';
import IdeaLab from './components/IdeaLab';
import { LayoutDashboard, PenTool, Settings as SettingsIcon, Image as ImageIcon, Briefcase, Activity, CheckSquare, Lightbulb } from 'lucide-react';

// Initialize defaults based on user persona
const initialLangMap: any = {};
Object.values(SocialPlatform).forEach(p => {
    if ([SocialPlatform.Telegram, SocialPlatform.TikTok, SocialPlatform.Threads, SocialPlatform.YouTube].includes(p)) {
        initialLangMap[p] = "Russian";
    } else {
        initialLangMap[p] = "English";
    }
});

const DEFAULT_SETTINGS: AppSettings = {
    userStyle: DEFAULT_STYLE,
    targetLanguage: 'English', 
    platformLanguages: initialLangMap,
    llmSource: LLMSource.CloudGemini,
    customApiUrl: '',
    customApiKey: '',
    enableDailyReminders: false,
    dailyReminderTime: "09:00"
};

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.Generator);
  // We use a timestamp to force updates in PostGenerator even if the topic string is the same but re-clicked
  const [generatorState, setGeneratorState] = useState<GeneratorState>({});
  
  const [settings, setSettings] = useState<AppSettings>(() => {
      const saved = localStorage.getItem('app_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => { localStorage.setItem('app_settings', JSON.stringify(settings)); }, [settings]);

  const [trends, setTrends] = useState<TrendItem[]>(() => {
      const saved = localStorage.getItem('app_trends');
      return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => { localStorage.setItem('app_trends', JSON.stringify(trends)); }, [trends]);

  const [activeTrendCategory, setActiveTrendCategory] = useState<TrendCategory>(TrendCategory.General);
  const [autoMonitor, setAutoMonitor] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('app_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('app_notes');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => { localStorage.setItem('app_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('app_notes', JSON.stringify(notes)); }, [notes]);

  const handleTrendSelect = (trend: TrendItem) => {
      setGeneratorState({
          initialTopic: `${trend.trendName}: ${trend.description}. Focus on: ${trend.hypeReason}.`,
          initialPlatform: trend.platform,
          timestamp: Date.now()
      });
      setCurrentMode(AppMode.Generator);
  };

  const handleIdeaSelect = (idea: ContentIdea) => {
      setGeneratorState({
          initialTopic: idea.headline,
          initialPlatform: idea.platform,
          timestamp: Date.now()
      });
      setCurrentMode(AppMode.Generator);
  }

  const performScan = async (silent = false) => {
      if(!silent) setIsScanning(true);
      try {
          const result = await analyzeTrends(settings, activeTrendCategory);
          if(result.length > 0) {
              setTrends(result);
          }
      } catch(e) { console.error(e); }
      if(!silent) setIsScanning(false);
  };

  useEffect(() => {
      let interval: any;
      if (autoMonitor) {
          interval = setInterval(() => performScan(true), 300000); // 5 mins
      }
      return () => clearInterval(interval);
  }, [autoMonitor, settings, activeTrendCategory]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <nav className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 shrink-0 z-20">
        <div>
          <div className="p-6 flex items-center gap-3 text-indigo-500">
            <LayoutDashboard className="w-8 h-8" />
            <span className="font-bold text-xl hidden md:block tracking-tight">3D Social<span className="text-white">Arch</span></span>
          </div>

          <div className="flex flex-col gap-2 p-4">
            <NavButton active={currentMode === AppMode.Generator} onClick={() => setCurrentMode(AppMode.Generator)} icon={<PenTool className="w-5 h-5" />} label="Post Generator" />
            <NavButton active={currentMode === AppMode.Ideas} onClick={() => setCurrentMode(AppMode.Ideas)} icon={<Lightbulb className="w-5 h-5" />} label="Idea Lab" />
            <NavButton active={currentMode === AppMode.Trends} onClick={() => setCurrentMode(AppMode.Trends)} icon={<Activity className="w-5 h-5" />} label="Live Radar" />
            <div className="my-2 border-t border-slate-800"></div>
            <NavButton active={currentMode === AppMode.Tasks} onClick={() => setCurrentMode(AppMode.Tasks)} icon={<CheckSquare className="w-5 h-5" />} label="Organizer" />
            <NavButton active={currentMode === AppMode.VisualAudit} onClick={() => setCurrentMode(AppMode.VisualAudit)} icon={<ImageIcon className="w-5 h-5" />} label="Visual Audit" />
            <NavButton active={currentMode === AppMode.Business} onClick={() => setCurrentMode(AppMode.Business)} icon={<Briefcase className="w-5 h-5" />} label="Business" />
            <div className="my-2 border-t border-slate-800"></div>
            <NavButton active={currentMode === AppMode.Settings} onClick={() => setCurrentMode(AppMode.Settings)} icon={<SettingsIcon className="w-5 h-5" />} label="Settings" />
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative w-full">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 h-full overflow-y-auto">
          {/* We keep all components mounted but hidden to preserve state */}
          <div className={`h-full ${currentMode === AppMode.Generator ? 'block' : 'hidden'}`}>
             <PostGenerator settings={settings} initialTopic={generatorState.initialTopic} initialPlatform={generatorState.initialPlatform} timestamp={generatorState.timestamp} />
          </div>
          <div className={`h-full ${currentMode === AppMode.Ideas ? 'block' : 'hidden'}`}>
             <IdeaLab settings={settings} onUseIdea={handleIdeaSelect} />
          </div>
          <div className={`h-full ${currentMode === AppMode.Trends ? 'block' : 'hidden'}`}>
             <TrendAnalyzer settings={settings} onSelectTrend={handleTrendSelect} trends={trends} activeCategory={activeTrendCategory} onCategoryChange={setActiveTrendCategory} autoMonitor={autoMonitor} onAutoMonitorChange={setAutoMonitor} isScanning={isScanning} onManualScan={() => performScan(false)} />
          </div>
          <div className={`h-full ${currentMode === AppMode.VisualAudit ? 'block' : 'hidden'}`}>
             <WorkAnalyzer settings={settings} />
          </div>
          <div className={`h-full ${currentMode === AppMode.Business ? 'block' : 'hidden'}`}>
             <BusinessCenter settings={settings} />
          </div>
          <div className={`h-full ${currentMode === AppMode.Tasks ? 'block' : 'hidden'}`}>
             <TaskManager tasks={tasks} notes={notes} onUpdateTasks={setTasks} onUpdateNotes={setNotes} settings={settings} onUpdateSettings={setSettings} />
          </div>
          <div className={`h-full ${currentMode === AppMode.Settings ? 'block' : 'hidden'}`}>
             <Settings settings={settings} onUpdate={setSettings} />
          </div>
        </div>
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group w-full ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span className="font-medium hidden md:block">{label}</span>
  </button>
);

export default App;
