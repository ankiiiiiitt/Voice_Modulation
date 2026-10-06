import React, { useState, useRef } from 'react';
import { VoiceSelector } from './VoiceSelector';
import { VocalBurstToolbar } from './VocalBurstToolbar';
import { TagPalette } from './TagPalette';
import { AudioPlayer } from './AudioPlayer';
import { STYLE_PRESETS, SAMPLE_SCRIPTS } from '../data/voices';
import { GeminiVoiceName, GenerationRecord } from '../types/tts';
import { estimateSpeechDurationSeconds } from '../utils/audio';
import {
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  BookOpen,
  Wand2,
  AlertCircle,
  FileText,
  Clock,
  Mic,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SingleSpeakerStudioProps {
  onGenerated: (record: GenerationRecord) => void;
  userName?: string;
}

export const SingleSpeakerStudio: React.FC<SingleSpeakerStudioProps> = ({
  onGenerated,
  userName = 'Ankit',
}) => {
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoiceName>('Adam');
  const [showTagPalette, setShowTagPalette] = useState<boolean>(true);
  const [ttsModel, setTtsModel] = useState<'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts'>('gemini-3.8-flash-tts');
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);
  const [text, setText] = useState<string>(
    `Hello ${userName}! <breath> Welcome to VoxGemini Studio with the ElevenLabs Adam sound profile. [laughing] This studio now supports expressive speech tags like [whispering], [clears throat], [excited], and [sighing]. What would you like me to voice next?`
  );
  const [stylePrompt, setStylePrompt] = useState<string>(
    'Warm, friendly, and engaging podcast host speaking directly to listeners'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<GenerationRecord | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setText((prev) => prev + ` ${tag} `);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = text;
    const newText = currentText.substring(0, start) + ` ${tag} ` + currentText.substring(end);
    setText(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursorPosition = start + tag.length + 2;
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 50);
  };

  const handleSelectPreset = (presetPrompt: string) => {
    setStylePrompt(presetPrompt);
  };

  const handleLoadSample = (sample: (typeof SAMPLE_SCRIPTS)[0]) => {
    setSelectedVoice(sample.voice);
    setStylePrompt(sample.style);
    setText(sample.text);
  };

  // Enhance text using gemini-3.8-flash endpoint
  const handleEnhanceScript = async (action: 'polish' | 'vocal_bursts') => {
    if (!text.trim()) return;
    setIsEnhancing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/enhance-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to enhance script');
      }
      if (data.result) {
        setText(data.result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Script enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate TTS with gemini-3.8-flash-tts
  const handleSynthesize = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter some text to synthesize.');
      return;
    }
    setIsGenerating(true);
    setErrorMessage(null);
    setQuotaNotice(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          text: text.trim(),
          voice: selectedVoice,
          style: stylePrompt.trim(),
          model: ttsModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Speech generation failed');
      }

      if (data.quotaNotice) {
        setQuotaNotice(data.quotaNotice);
      }
      if (data.model && data.model !== ttsModel) {
        setTtsModel(data.model);
      }

      const newRecord: GenerationRecord = {
        id: `rec-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'single',
        title: text.trim().slice(0, 36) + (text.length > 36 ? '...' : ''),
        text: text.trim(),
        voice: selectedVoice,
        style: stylePrompt.trim(),
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        duration: estimateSpeechDurationSeconds(text),
        provider: data.provider,
      };

      setCurrentAudio(newRecord);
      onGenerated(newRecord);
    } catch (err: any) {
      console.error('TTS Generation Error:', err);
      setErrorMessage(err.message || 'Failed to synthesize speech. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = estimateSpeechDurationSeconds(text);

  return (
    <div className="space-y-6">
      {/* Top Banner / Template Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Quick Templates:</span>
          <span className="hidden sm:inline text-slate-400">Jumpstart with pre-tuned styles</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_SCRIPTS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(s)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700/60 transition-all flex items-center gap-1.5"
            >
              <span>{s.title}</span>
              <span className={`text-[10px] font-mono ${s.voice === 'Adam' ? 'text-amber-400 font-bold' : 'text-cyan-400'}`}>
                ({s.voice})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <VoiceSelector selectedVoice={selectedVoice} onSelectVoice={setSelectedVoice} />

        {selectedVoice === 'Adam' && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900 border border-amber-800/60 flex items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-sm shrink-0">
                A
              </span>
              <div>
                <span className="font-bold text-amber-200">
                  ElevenLabs &quot;Adam&quot; Sound Selected:
                </span>{' '}
                <span className="text-slate-300">
                  Deep, velvety American baritone narrator with calm gravitas, rich vocal resonance, and natural storytelling cadence.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const adamSample = SAMPLE_SCRIPTS.find((s) => s.voice === 'Adam');
                if (adamSample) handleLoadSample(adamSample);
              }}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-900/50 hover:bg-amber-800/60 text-amber-200 border border-amber-700/60 text-[11px] font-medium transition-all"
            >
              Load Adam Script
            </button>
          </div>
        )}
      </div>

      {/* Script & Voice Direction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Text Editor (8 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Script to Synthesize
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isEnhancing || !text.trim()}
                  onClick={() => handleEnhanceScript('vocal_bursts')}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-[11px] font-medium flex items-center gap-1 transition-all disabled:opacity-50"
                  title="Use Gemini 3.8 to inject authentic vocal bursts (<breath>, <laugh>, etc.)"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>{isEnhancing ? 'Enhancing...' : 'Auto Vocal Bursts'}</span>
                </button>

                <button
                  type="button"
                  disabled={isEnhancing || !text.trim()}
                  onClick={() => handleEnhanceScript('polish')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 text-[11px] font-medium flex items-center gap-1 transition-all disabled:opacity-50"
                  title="Polish text rhythm and punctuation for natural speech"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Polish Speech Cadence</span>
                </button>
              </div>
            </div>

            {/* Vocal Burst Chips Toolbar */}
            <VocalBurstToolbar onInsertTag={handleInsertTag} />

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter script text here... Click expressive tags above to add <breath>, <laugh>, or |yeah| for realistic human delivery."
                rows={7}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans leading-relaxed resize-y"
              />
            </div>

            {/* Footer metrics */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px]">
                  {text.length} chars • {wordCount} words
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                  <Clock className="w-3 h-3" /> ~{estimatedSeconds}s audio
                </span>
              </div>

              <button
                type="button"
                onClick={() => setText('')}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear text
              </button>
            </div>

            {/* Speech Direction Tag Palette matching user screenshot */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowTagPalette(!showTagPalette)}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Speech Tags Palette</span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    Emotion • Vocalizations • Delivery
                  </span>
                  {showTagPalette ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  {showTagPalette ? 'Click to insert at cursor' : '27 audio tags available'}
                </span>
              </div>

              {showTagPalette && (
                <div className="pt-1">
                  <TagPalette onInsertTag={handleInsertTag} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Style Direction & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Voice Direction & Tone Style
              </label>
              <span className="text-[10px] font-mono text-cyan-400">speechMetadata.style</span>
            </div>

            <textarea
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              placeholder="e.g. Warm and friendly podcast host, whispering mysteriously, dramatic trailer voice..."
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-none"
            />

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Style Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {STYLE_PRESETS.map((p) => {
                  const isSelected = stylePrompt === p.prompt;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.prompt)}
                      className={`p-2 rounded-xl text-left text-xs transition-all border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-cyan-950/70 text-cyan-200 border-cyan-700 shadow-sm'
                          : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm">{p.icon}</span>
                      <span className="font-medium truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Model Selector & Quota Information */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                Gemini TTS Model
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {ttsModel === 'gemini-3.8-flash-tts' ? 'Flagship Expressive' : 'High Throughput'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTtsModel('gemini-3.8-flash-tts')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  ttsModel === 'gemini-3.8-flash-tts'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white font-medium'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-[11px] truncate">gemini-3.8-flash-tts</div>
                <div className="text-[10px] text-slate-400">Expressive • 10 req/day free</div>
              </button>

              <button
                type="button"
                onClick={() => setTtsModel('gemini-3.8-flash-lite-tts')}
                className={`p-2 rounded-xl border text-left transition-all ${
                  ttsModel === 'gemini-3.8-flash-lite-tts'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white font-medium'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-[11px] truncate">gemini-3.8-flash-lite-tts</div>
                <div className="text-[10px] text-slate-400">High Quota • Fast generation</div>
              </button>
            </div>
          </div>

          {/* Quota Notice Banner */}
          {quotaNotice && (
            <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-700/80 text-amber-200 text-xs flex items-start gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{quotaNotice}</div>
            </div>
          )}

          {/* Synthesize Button */}
          <button
            type="button"
            disabled={isGenerating || !text.trim()}
            onClick={handleSynthesize}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2.5 ${
              isGenerating || !text.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Speech with {ttsModel}...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Synthesize Speech ({selectedVoice})</span>
              </>
            )}
          </button>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>

              {errorMessage.includes('Quota') && (
                <button
                  type="button"
                  onClick={() => {
                    setTtsModel('gemini-3.8-flash-lite-tts');
                    setErrorMessage(null);
                    setTimeout(() => handleSynthesize(), 50);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Switch to gemini-3.8-flash-lite-tts & Synthesize</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Output Audio Player */}
      <div className="mt-6">
        <AudioPlayer
          audioBase64={currentAudio?.audioBase64 || null}
          mimeType={currentAudio?.mimeType || 'audio/wav'}
          title={currentAudio?.title || 'Generated Speech Output'}
          subtitle={
            currentAudio?.provider
              ? `${currentAudio.provider} • Voice: ${currentAudio.voice}`
              : `Voice: ${currentAudio?.voice || selectedVoice} • gemini-3.8-flash-tts`
          }
          voiceName={currentAudio?.voice || selectedVoice}
        />
      </div>
    </div>
  );
};
