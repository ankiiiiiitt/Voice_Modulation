import React from 'react';
import { VOCAL_BURSTS } from '../data/voices';
import { Sparkles, HelpCircle } from 'lucide-react';

interface VocalBurstToolbarProps {
  onInsertTag: (tag: string) => void;
}

export const VocalBurstToolbar: React.FC<VocalBurstToolbarProps> = ({ onInsertTag }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1 px-2 bg-slate-900/60 rounded-lg border border-slate-800 text-xs">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span className="hidden sm:inline">Gemini 3.8 Expressive Tags:</span>
        <span className="sm:hidden">Tags:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {VOCAL_BURSTS.map((burst) => {
          const isBackchannel = burst.type === 'backchannel';
          return (
            <button
              key={burst.tag}
              type="button"
              onClick={() => onInsertTag(burst.tag)}
              title={`${burst.label}: ${burst.desc}`}
              className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium transition-all duration-150 flex items-center gap-1 border ${
                isBackchannel
                  ? 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border-purple-800/60 hover:border-purple-600'
                  : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-800/60 hover:border-amber-600'
              }`}
            >
              <span>+</span>
              <span>{burst.tag}</span>
            </button>
          );
        })}
      </div>

      <div className="ml-auto hidden md:flex items-center gap-1 text-[10px] text-slate-500 font-mono">
        <HelpCircle className="w-3 h-3" />
        Click to insert at cursor
      </div>
    </div>
  );
};
