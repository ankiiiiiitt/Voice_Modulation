import React, { useState } from 'react';
import { GenerationRecord } from '../types/tts';
import { downloadAudioWav, createBlobUrl, formatDuration } from '../utils/audio';
import {
  History,
  Play,
  Pause,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Users,
  Search,
  Bookmark,
} from 'lucide-react';

interface HistoryDrawerProps {
  history: GenerationRecord[];
  onSelectRecord: (record: GenerationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectRecord,
  onDeleteRecord,
  onClearHistory,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const togglePlay = (record: GenerationRecord) => {
    if (playingId === record.id && audioElement) {
      audioElement.pause();
      setPlayingId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const url = createBlobUrl(record.audioBase64, record.mimeType);
    const audio = new Audio(url);
    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
    };
    audio.play().catch(console.warn);
    setAudioElement(audio);
    setPlayingId(record.id);
  };

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.text.toLowerCase().includes(query) ||
      item.voice.toLowerCase().includes(query) ||
      (item.style && item.style.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voice clips, scripts, or styles..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/60 text-xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No Audio Generations Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No recordings match your search query.'
              : 'Synthesized voice clips from both Solo Voice and Dual Screenplay modes will appear here for easy playback and download.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredHistory.map((item) => {
            const isPlaying = playingId === item.id;
            const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
                          item.mode === 'dialogue'
                            ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                            : 'bg-cyan-950 text-cyan-300 border-cyan-800/60'
                        }`}
                      >
                        {item.mode === 'dialogue' ? 'Dual Dialogue' : 'Solo Voice'}
                      </span>

                      <span className="text-[11px] font-semibold text-slate-200">
                        {item.voice}
                        {item.secondaryVoice ? ` & ${item.secondaryVoice}` : ''}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                    {item.text}
                  </p>

                  {item.style && (
                    <div className="mt-2 text-[10px] text-slate-400 italic line-clamp-1">
                      Style: &quot;{item.style}&quot;
                    </div>
                  )}
                </div>

                {/* Bottom Card Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePlay(item)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectRecord(item)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Load into Player
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => downloadAudioWav(item.audioBase64, `${item.title}.wav`)}
                      className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Download WAV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete recording"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
