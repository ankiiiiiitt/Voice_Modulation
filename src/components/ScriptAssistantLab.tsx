import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Copy, Check, BookOpen, Mic } from 'lucide-react';
import { VOCAL_BURSTS } from '../data/voices';

interface ScriptAssistantLabProps {
  onTransferToSolo: (text: string, style?: string) => void;
  userName?: string;
}

export const ScriptAssistantLab: React.FC<ScriptAssistantLabProps> = ({
  onTransferToSolo,
  userName = 'Ankit',
}) => {
  const [topic, setTopic] = useState(
    `Welcome podcast intro by ${userName} exploring cutting-edge Gemini 3.8 Flash speech synthesis`
  );
  const [tone, setTone] = useState('Enthusiastic and visionary');
  const [generatedScript, setGeneratedScript] = useState<string>(
    `Hey everyone, ${userName} here! <breath> Welcome to today's episode. <laugh> Today, we are witnessing a monumental leap in voice technology with Gemini 3.8 Flash TTS. |yeah| The audio fidelity, nuance, and natural cadence feel like real human speech. Sit back, relax, and let's explore what's possible!`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleIdeas = [
    `Welcome podcast intro by ${userName}`,
    'A dramatic trailer for a deep-space mystery film',
    'Soothing morning mindfulness breathing meditation',
    'Tech keynote unveiling an autonomous flying car',
    'Playful YouTube review of the world’s spiciest ramen',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/enhance-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_monologue',
          topic: `${topic}. Desired tone: ${tone}. Include expressive vocal bursts like <breath>, <laugh>, <gasp> or backchannels like |yeah|, |mhm|.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to craft script');
      }

      setGeneratedScript(data.result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Script generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-800/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-base font-bold text-slate-100">
              AI Scriptwriting Director (gemini-3.8-flash)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prompt Gemini 3.8 to draft scripts with built-in vocal tags (<code className="text-amber-300 font-mono">&lt;breath&gt;</code>, <code className="text-purple-300 font-mono">|yeah|</code>, <code className="text-pink-300 font-mono">&lt;laugh&gt;</code>) formatted specifically for Gemini 3.8 Flash TTS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-pink-400 bg-pink-950/60 px-2.5 py-1 rounded-full border border-pink-800/40">
            Model: gemini-3.8-flash
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                What is your script about?
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g. A high-energy opening speech for Ankit's AI showcase..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Topic Ideas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(idea)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/60 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700/60 transition-all text-left truncate max-w-full"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Desired Tone */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Desired Tone / Delivery Style
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. Warm, dramatic, funny, fast-paced, meditative"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Generate Script Button */}
            <button
              type="button"
              disabled={isLoading || !topic.trim()}
              onClick={handleGenerate}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                isLoading || !topic.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/25 active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Drafting Script with gemini-3.8-flash...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Draft Script for Speech Synthesis</span>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-xs">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Generated Result & Transfer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-pink-400" />
                Script Preview & Vocal Cues
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={generatedScript}
              onChange={(e) => setGeneratedScript(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500 leading-relaxed font-sans resize-y"
            />

            {/* Action Bar: Send to Solo Studio */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-400">
                Word count: {generatedScript.trim().split(/\s+/).length} words
              </div>

              <button
                type="button"
                onClick={() => onTransferToSolo(generatedScript, tone)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Send to Solo Studio & Synthesize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
