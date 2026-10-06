import React, { useState } from 'react';
import { GEMINI_VOICES } from '../data/voices';
import { GeminiVoiceName, GenerationRecord, DialogueTurn } from '../types/tts';
import { VocalBurstToolbar } from './VocalBurstToolbar';
import { TagPalette } from './TagPalette';
import { AudioPlayer } from './AudioPlayer';
import {
  Users,
  Plus,
  Trash2,
  Play,
  Wand2,
  Sparkles,
  AlertCircle,
  MessageSquare,
  ArrowDownUp,
  Volume2,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DialogueStudioProps {
  onGenerated: (record: GenerationRecord) => void;
  userName?: string;
}

export const DialogueStudio: React.FC<DialogueStudioProps> = ({
  onGenerated,
  userName = 'Ankit',
}) => {
  const [speaker1, setSpeaker1] = useState<{ name: string; voice: GeminiVoiceName }>({
    name: userName || 'Ankit',
    voice: 'Puck',
  });
  const [speaker2, setSpeaker2] = useState<{ name: string; voice: GeminiVoiceName }>({
    name: 'Nova',
    voice: 'Kore',
  });

  const [dialogueTurns, setDialogueTurns] = useState<DialogueTurn[]>([
    {
      id: '1',
      speaker: userName || 'Ankit',
      voice: 'Puck',
      text: "Hey Nova, did you hear about the new Gemini 3.8 Flash TTS model? <breath> The audio fidelity is unreal!",
      style: 'Excited and energized',
    },
    {
      id: '2',
      speaker: 'Nova',
      voice: 'Kore',
      text: "I did! |yeah| The subtle backchanneling and vocal bursts make it sound completely human. <laugh> Listen to how smooth this sounds!",
      style: 'Friendly, warm and impressed',
    },
    {
      id: '3',
      speaker: userName || 'Ankit',
      voice: 'Puck',
      text: "Exactly. <gasp> Dual-speaker screenplay generation with real-time inflection direction is finally here.",
      style: 'Enthusiastic creator',
    },
    {
      id: '4',
      speaker: 'Nova',
      voice: 'Kore',
      text: "That's why developers are building next-generation podcasts and audio dramas with it. |mhm| Ready to craft something together?",
      style: 'Inspiring and poised',
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<GenerationRecord | null>(null);
  const [focusedTurnId, setFocusedTurnId] = useState<string | null>('1');
  const [showTagPalette, setShowTagPalette] = useState(false);

  const addTurn = (speakerChoice?: string) => {
    const speaker = speakerChoice || (dialogueTurns[dialogueTurns.length - 1]?.speaker === speaker1.name ? speaker2.name : speaker1.name);
    const newTurn: DialogueTurn = {
      id: `turn-${Date.now()}-${Math.random()}`,
      speaker,
      voice: speaker === speaker1.name ? speaker1.voice : speaker2.voice,
      text: '',
      style: 'Conversational and clear',
    };
    setDialogueTurns([...dialogueTurns, newTurn]);
    setFocusedTurnId(newTurn.id);
  };

  const removeTurn = (id: string) => {
    if (dialogueTurns.length <= 1) return;
    setDialogueTurns(dialogueTurns.filter((t) => t.id !== id));
  };

  const updateTurn = (id: string, updates: Partial<DialogueTurn>) => {
    setDialogueTurns(
      dialogueTurns.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleInsertTag = (tag: string) => {
    if (!focusedTurnId) return;
    setDialogueTurns((turns) =>
      turns.map((t) => {
        if (t.id === focusedTurnId) {
          return { ...t, text: t.text + ` ${tag} ` };
        }
        return t;
      })
    );
  };

  // AI Dialogue Generator via gemini-3.8-flash
  const handleAutoDraft = async (topic: string) => {
    setIsAiDrafting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/enhance-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_dialogue',
          topic,
          speaker1: speaker1.name,
          speaker2: speaker2.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate dialogue');
      }

      if (Array.isArray(data.dialogue) && data.dialogue.length > 0) {
        const generatedTurns: DialogueTurn[] = data.dialogue.map((item: any, idx: number) => ({
          id: `draft-${idx}-${Date.now()}`,
          speaker: item.speaker || (idx % 2 === 0 ? speaker1.name : speaker2.name),
          voice: item.speaker === speaker1.name ? speaker1.voice : speaker2.voice,
          text: item.text || '',
          style: item.style || 'Natural conversational tone',
        }));
        setDialogueTurns(generatedTurns);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Auto-draft failed');
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Synthesize multi-speaker screenplay
  const handleSynthesizeDialogue = async () => {
    if (dialogueTurns.some((t) => !t.text.trim())) {
      setErrorMessage('Please fill in text for all dialogue turns before generating.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'dialogue',
          speakers: [
            { name: speaker1.name, voice: speaker1.voice },
            { name: speaker2.name, voice: speaker2.voice },
          ],
          dialogue: dialogueTurns.map((turn) => ({
            speaker: turn.speaker,
            text: turn.text.trim(),
            style: turn.style?.trim() || undefined,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Dual dialogue synthesis failed');
      }

      const newRecord: GenerationRecord = {
        id: `dialogue-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'dialogue',
        title: `Dialogue: ${speaker1.name} & ${speaker2.name}`,
        text: dialogueTurns.map((t) => `${t.speaker}: ${t.text}`).join('\n'),
        voice: speaker1.voice,
        secondaryVoice: speaker2.voice,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        dialogueTurns,
      };

      setCurrentAudio(newRecord);
      onGenerated(newRecord);
    } catch (err: any) {
      console.error('Dialogue synthesis error:', err);
      setErrorMessage(err.message || 'Failed to synthesize dialogue.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Speaker Casting Card */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">Speaker Casting (Gemini 3.8 Dual Voice)</h3>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/60">
            multiSpeakerVoiceConfig
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Speaker 1 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Speaker 1 (Host)
              </span>
              <span className="text-xs text-slate-400 font-mono">Assigned: {speaker1.voice}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Character Name</label>
                <input
                  type="text"
                  value={speaker1.name}
                  onChange={(e) => setSpeaker1({ ...speaker1, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Gemini Voice</label>
                <select
                  value={speaker1.voice}
                  onChange={(e) =>
                    setSpeaker1({ ...speaker1, voice: e.target.value as GeminiVoiceName })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {GEMINI_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.badge ? `[★ ${v.badge}]` : `(${v.gender})`} - {v.character.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Speaker 2 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Speaker 2 (Guest / Co-Host)
              </span>
              <span className="text-xs text-slate-400 font-mono">Assigned: {speaker2.voice}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Character Name</label>
                <input
                  type="text"
                  value={speaker2.name}
                  onChange={(e) => setSpeaker2({ ...speaker2, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Gemini Voice</label>
                <select
                  value={speaker2.voice}
                  onChange={(e) =>
                    setSpeaker2({ ...speaker2, voice: e.target.value as GeminiVoiceName })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {GEMINI_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.badge ? `[★ ${v.badge}]` : `(${v.gender})`} - {v.character.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenplay Director Bar & Auto-draft */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-200">
            AI Script Director (gemini-3.8-flash):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isAiDrafting}
            onClick={() => handleAutoDraft("Ankit unveiling a futuristic AI audio studio with Nova")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Tech Podcast Draft</span>
          </button>

          <button
            type="button"
            disabled={isAiDrafting}
            onClick={() => handleAutoDraft("A funny discussion about whether aliens listen to radio podcasts")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Comedy Banter Draft</span>
          </button>
        </div>
      </div>

      {/* Vocal burst toolbar for active turn */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Insert expressive tags into active turn:</span>
            <button
              type="button"
              onClick={() => setShowTagPalette(!showTagPalette)}
              className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/60 hover:bg-cyan-900/60 transition-all cursor-pointer"
            >
              <Tag className="w-3 h-3 text-cyan-400" />
              <span>Full Tag Palette</span>
              {showTagPalette ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>
          {focusedTurnId && (
            <span className="text-[11px] text-cyan-400 font-mono">
              Target: Turn #{dialogueTurns.findIndex((t) => t.id === focusedTurnId) + 1}
            </span>
          )}
        </div>
        <VocalBurstToolbar onInsertTag={handleInsertTag} />

        {showTagPalette && (
          <div className="pt-2">
            <TagPalette onInsertTag={handleInsertTag} />
          </div>
        )}
      </div>

      {/* Dialogue Turns List */}
      <div className="space-y-3">
        {dialogueTurns.map((turn, index) => {
          const isSpeaker1 = turn.speaker === speaker1.name;
          const isFocused = turn.id === focusedTurnId;

          return (
            <div
              key={turn.id}
              onClick={() => setFocusedTurnId(turn.id)}
              className={`p-4 rounded-2xl transition-all border ${
                isFocused
                  ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>

                  {/* Speaker Toggle */}
                  <select
                    value={turn.speaker}
                    onChange={(e) => updateTurn(turn.id, { speaker: e.target.value })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                      isSpeaker1
                        ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                        : 'bg-purple-950/70 text-purple-300 border-purple-800'
                    }`}
                  >
                    <option value={speaker1.name}>{speaker1.name} ({speaker1.voice})</option>
                    <option value={speaker2.name}>{speaker2.name} ({speaker2.voice})</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {/* Style Direction for this turn */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Style:</span>
                    <input
                      type="text"
                      value={turn.style}
                      onChange={(e) => updateTurn(turn.id, { style: e.target.value })}
                      placeholder="e.g. Enthusiastic, whisper, amused..."
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                    />
                  </div>

                  {/* Delete Turn */}
                  {dialogueTurns.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTurn(turn.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete turn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Turn Text */}
              <textarea
                value={turn.text}
                onChange={(e) => updateTurn(turn.id, { text: e.target.value })}
                onFocus={() => setFocusedTurnId(turn.id)}
                placeholder={`What does ${turn.speaker} say? Use <laugh>, <breath>, or |yeah| for natural cadence.`}
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed font-sans"
              />
            </div>
          );
        })}
      </div>

      {/* Turn Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => addTurn(speaker1.name)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add {speaker1.name}&apos;s Turn</span>
          </button>

          <button
            type="button"
            onClick={() => addTurn(speaker2.name)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add {speaker2.name}&apos;s Turn</span>
          </button>
        </div>

        {/* Synthesize Dialogue Button */}
        <button
          type="button"
          disabled={isGenerating || dialogueTurns.length === 0}
          onClick={handleSynthesizeDialogue}
          className={`py-3 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 ${
            isGenerating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white shadow-indigo-500/25 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Dialogue with gemini-3.8-flash-tts...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Synthesize Screenplay ({dialogueTurns.length} Turns)</span>
            </>
          )}
        </button>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Dialogue Audio Output */}
      <div className="mt-6">
        <AudioPlayer
          audioBase64={currentAudio?.audioBase64 || null}
          mimeType={currentAudio?.mimeType || 'audio/wav'}
          title={currentAudio?.title || 'Dual-Speaker Dialogue Track'}
          subtitle={`Dual voices: ${speaker1.name} (${speaker1.voice}) & ${speaker2.name} (${speaker2.voice}) • gemini-3.8-flash-tts`}
          voiceName={`${speaker1.voice} + ${speaker2.voice}`}
        />
      </div>
    </div>
  );
};
