/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SingleSpeakerStudio } from './components/SingleSpeakerStudio';
import { DialogueStudio } from './components/DialogueStudio';
import { ScriptAssistantLab } from './components/ScriptAssistantLab';
import { HistoryDrawer } from './components/HistoryDrawer';
import { GenerationRecord } from './types/tts';
import {
  Sparkles,
  Volume2,
  Radio,
  Users,
  Mic,
  Info,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solo' | 'dialogue' | 'assistant' | 'history'>('solo');
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const userName = 'Ankit';

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voxgemini_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const handleGenerated = (record: GenerationRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('voxgemini_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      return updated;
    });
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('voxgemini_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('voxgemini_history');
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }
  };

  const handleTransferToSolo = (text: string, style?: string) => {
    setActiveTab('solo');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased">
      {/* Top Studio Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        userName={userName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Banner for Ankit */}
        {showInfoBanner && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-indigo-950/60 border border-cyan-800/40 p-4 sm:p-5 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Welcome to VoxGemini Studio, {userName}!</span>
                    <span className="text-[10px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      TTS Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Featuring the iconic <strong className="text-amber-300 font-semibold">Adam (ElevenLabs Sound)</strong> baritone profile and powered by Google&apos;s latest{' '}
                    <strong className="text-cyan-300 font-mono">gemini-3.8-flash-tts</strong> model.
                    Transform any script into human-grade audio with custom voice personas,
                    inflection styling, dual-speaker screenplays, and expressive vocal bursts (
                    <code className="text-amber-300 font-mono text-[11px]">&lt;breath&gt;</code>,{' '}
                    <code className="text-amber-300 font-mono text-[11px]">&lt;laugh&gt;</code>,{' '}
                    <code className="text-purple-300 font-mono text-[11px]">|yeah|</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-mono">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>24kHz WAV Unary</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfoBanner(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 p-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Studio View Modes */}
        {activeTab === 'solo' && (
          <SingleSpeakerStudio onGenerated={handleGenerated} userName={userName} />
        )}

        {activeTab === 'dialogue' && (
          <DialogueStudio onGenerated={handleGenerated} userName={userName} />
        )}

        {activeTab === 'assistant' && (
          <ScriptAssistantLab onTransferToSolo={handleTransferToSolo} userName={userName} />
        )}

        {activeTab === 'history' && (
          <HistoryDrawer
            history={history}
            onSelectRecord={(rec) => {
              setActiveTab(rec.mode === 'dialogue' ? 'dialogue' : 'solo');
            }}
            onDeleteRecord={handleDeleteRecord}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Studio Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-400">VoxGemini Studio</span>
            <span>•</span>
            <span>Crafted for {userName}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Model: gemini-3.8-flash-tts</span>
            <span>•</span>
            <span>24kHz Mono 16-bit WAV</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
