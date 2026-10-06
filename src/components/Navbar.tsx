import React from 'react';
import { Volume2, Sparkles, User, History, Radio, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'solo' | 'dialogue' | 'assistant' | 'history';
  setActiveTab: (tab: 'solo' | 'dialogue' | 'assistant' | 'history') => void;
  historyCount: number;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  userName = 'Ankit',
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
                VoxGemini <span className="text-cyan-400 font-extrabold text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 uppercase tracking-wider">Studio</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-300">
                <Cpu className="w-3 h-3 text-cyan-400" /> gemini-3.8-flash-tts
              </span>
              <span className="text-slate-600">•</span>
              <span className="hidden sm:inline font-mono text-[11px] text-indigo-300">
                gemini-3.8-flash
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('solo')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'solo'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Solo Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('dialogue')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'dialogue'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual Dialogue</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span className="hidden sm:inline">Script Lab</span>
            <span className="sm:hidden">Script</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Library</span>
            {historyCount > 0 && (
              <span className="text-[10px] bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* User Pill Greeting */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm">
              <User className="w-3.5 h-3.5 text-slate-900" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                Hi, {userName}!
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                TTS Ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
