import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Repeat,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  createBlobUrl,
  downloadAudioWav,
  formatDuration,
  extractWaveformPeaks,
} from '../utils/audio';

interface AudioPlayerProps {
  audioBase64: string | null;
  mimeType?: string;
  title?: string;
  subtitle?: string;
  voiceName?: string;
  onReset?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  title = 'Gemini 3.8 Generated Speech',
  subtitle = 'High Fidelity 24kHz Audio',
  voiceName,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  // Initialize Audio Source and decode peaks
  useEffect(() => {
    if (!audioBase64) {
      setBlobUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const url = createBlobUrl(audioBase64, mimeType);
    setBlobUrl(url);

    // Extract real waveform peaks
    extractWaveformPeaks(audioBase64, 52).then(({ peaks: extractedPeaks, duration: estDuration }) => {
      setPeaks(extractedPeaks);
      if (estDuration && !duration) {
        setDuration(estDuration);
      }
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBase64, mimeType]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.warn('Audio playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (index: number) => {
    if (!audioRef.current || !duration) return;
    const seekPercent = index / (peaks.length || 52);
    const targetTime = seekPercent * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleSliderSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const isMp3 = mimeType.includes('mpeg') || mimeType.includes('mp3');

  const handleDownload = () => {
    if (!audioBase64) return;
    const cleanTitle = (title || 'speech-audio').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 32);
    downloadAudioWav(audioBase64, `${cleanTitle}-${Date.now()}`, mimeType);
  };

  const handleCopyLink = () => {
    if (!audioBase64) return;
    navigator.clipboard.writeText(`data:${mimeType};base64,${audioBase64}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!audioBase64 || !blobUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500 mb-3">
          <Volume2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">No Audio Generated Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Type your script or choose a preset, then hit &quot;Synthesize Speech&quot; to hear Gemini 3.8 Flash TTS in action.
        </p>
      </div>
    );
  }

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-xl shadow-cyan-950/20">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden native audio tag */}
      <audio
        ref={audioRef}
        src={blobUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        loop={isLooping}
      />

      {/* Audio Info Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              gemini-3.8-flash-tts
            </span>
            {voiceName && (
              <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                Voice: {voiceName}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1 leading-snug">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copy Audio Data URI"
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Data URI'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title={isMp3 ? 'Download MP3 Audio' : 'Download WAV Audio'}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isMp3 ? 'Download MP3' : 'Download WAV'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Waveform Visualizer */}
      <div className="relative py-3 px-2 bg-slate-950/70 rounded-xl border border-slate-800/90 mb-4">
        <div className="flex items-end justify-between h-16 gap-1 px-1 cursor-pointer select-none">
          {peaks.map((peak, idx) => {
            const barPercent = (idx / (peaks.length - 1)) * 100;
            const isPlayed = barPercent <= currentPercent;
            const barHeight = Math.max(12, Math.round(peak * 56));

            return (
              <div
                key={idx}
                onClick={() => handleSeek(idx)}
                className="flex-1 flex items-end justify-center h-full group"
                title={`Seek to ${formatDuration((barPercent / 100) * duration)}`}
              >
                <div
                  style={{ height: `${barHeight}px` }}
                  className={`w-full max-w-[5px] rounded-full transition-all duration-100 ${
                    isPlayed
                      ? 'bg-gradient-to-t from-cyan-500 to-blue-400 group-hover:from-cyan-400 group-hover:to-cyan-300 shadow-sm shadow-cyan-500/30'
                      : 'bg-slate-800 group-hover:bg-slate-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Hidden Range Input for Accessibility / Scrubbing */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSliderSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
        />

        {/* Time Progress & Total Duration */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
          <span className="text-cyan-400 font-semibold">{formatDuration(currentTime)}</span>
          <div className="text-[10px] text-slate-500">24kHz • 16-bit Mono WAV</div>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Audio Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-current text-slate-950 translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            title="Replay from start"
            className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            title={isLooping ? 'Looping enabled' : 'Loop disabled'}
            className={`p-2.5 rounded-lg border transition-all ${
              isLooping
                ? 'bg-cyan-950 text-cyan-400 border-cyan-700'
                : 'bg-slate-800/70 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => changeRate(rate)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                playbackRate === rate
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume Scrub */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};
