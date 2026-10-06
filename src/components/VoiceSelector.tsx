import React from 'react';
import { GEMINI_VOICES } from '../data/voices';
import { GeminiVoiceName } from '../types/tts';
import { Check, Mic, Sparkles } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: GeminiVoiceName;
  onSelectVoice: (voice: GeminiVoiceName) => void;
  label?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  label = 'Select Gemini Voice Persona',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          {label}
        </label>
        <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
          7 Curated Personas
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
        {GEMINI_VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          const isAdam = v.id === 'Adam';

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVoice(v.id)}
              className={`relative p-3 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between group ${
                isSelected
                  ? isAdam
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : isAdam
                  ? 'bg-slate-900/60 border-amber-900/40 hover:border-amber-700/60 hover:bg-slate-900'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Badge for Adam or other special voices */}
              {v.badge && (
                <div className="mb-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-900/90 to-orange-900/90 text-amber-200 border border-amber-700/50">
                    ★ {v.badge}
                  </span>
                </div>
              )}

              {/* Active Indicator Badge */}
              {isSelected && (
                <div
                  className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${
                    isAdam ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-slate-950'
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center text-white shadow-sm font-bold text-xs`}
                  >
                    {v.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white leading-tight">
                      {v.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {v.gender}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {v.character}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 line-clamp-1 italic">
                  {v.bestFor}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
