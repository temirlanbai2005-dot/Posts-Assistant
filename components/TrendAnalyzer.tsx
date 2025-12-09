import React from 'react';
import { AppSettings, TrendItem, TrendCategory } from '../types';
import { Flame, RefreshCw, Globe, ArrowRight, Music2, Film, Hash, Activity } from 'lucide-react';

interface TrendAnalyzerProps {
  settings: AppSettings;
  onSelectTrend: (trend: TrendItem) => void;
  trends: TrendItem[];
  activeCategory: TrendCategory;
  onCategoryChange: (c: TrendCategory) => void;
  autoMonitor: boolean;
  onAutoMonitorChange: (v: boolean) => void;
  isScanning: boolean;
  onManualScan: () => void;
}

const TrendAnalyzer: React.FC<TrendAnalyzerProps> = ({ 
    onSelectTrend, trends, activeCategory, onCategoryChange, isScanning, onManualScan
}) => {

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Globe className="w-8 h-8 text-cyan-400" />
            Live Internet Radar
          </h2>
          <p className="text-slate-400">Scans Google Search in real-time for latest 3D trends.</p>
        </div>
        <button
          onClick={onManualScan}
          disabled={isScanning}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
        >
          {isScanning ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
          Scan Internet
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
              { id: TrendCategory.General, icon: Flame, label: "General", color: "text-orange-400" },
              { id: TrendCategory.Audio, icon: Music2, label: "Audio", color: "text-pink-400" },
              { id: TrendCategory.Formats, icon: Film, label: "Formats", color: "text-purple-400" },
              { id: TrendCategory.Plots, icon: Hash, label: "Hashtags", color: "text-emerald-400" }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    activeCategory === tab.id 
                    ? `bg-slate-800 border-white/20 shadow-lg ${tab.color}` 
                    : 'bg-slate-900 border-transparent text-slate-500 hover:bg-slate-800'
                }`}
              >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{tab.label}</span>
              </button>
          ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-20">
        {isScanning ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-cyan-400 animate-pulse">Searching Google...</p>
           </div>
        ) : trends.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-500">
               <Activity className="w-16 h-16 mb-4 opacity-20" />
               <p>No trends scanned yet. Click 'Scan Internet'.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {trends.map((trend, idx) => (
                   <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/50 transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                       
                       <div className="flex justify-between items-start mb-4">
                           <span className="text-xs font-bold bg-slate-950 px-2 py-1 rounded text-slate-300 border border-slate-800">{trend.platform}</span>
                           <span className="text-xs text-green-400 font-mono">{trend.growthMetric}</span>
                       </div>

                       <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{trend.trendName}</h3>
                       <p className="text-sm text-slate-400 mb-4 line-clamp-3">{trend.description}</p>
                       
                       <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mb-4">
                           <p className="text-[10px] text-slate-500 uppercase font-bold">Why Hype?</p>
                           <p className="text-xs text-slate-300">{trend.hypeReason}</p>
                       </div>

                       <button 
                         onClick={() => onSelectTrend(trend)}
                         className="w-full py-2 bg-cyan-900/20 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                       >
                           Create Post <ArrowRight className="w-4 h-4" />
                       </button>
                   </div>
               ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default TrendAnalyzer;
