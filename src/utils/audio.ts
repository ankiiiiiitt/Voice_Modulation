/**
 * Audio helper utilities for VoxGemini (Gemini 3.8 Flash TTS)
 */

export function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export function createBlobUrl(base64: string, mimeType = 'audio/wav'): string {
  const blob = base64ToBlob(base64, mimeType);
  return URL.createObjectURL(blob);
}

export function downloadAudioWav(base64: string, filename = 'speech-audio', mimeType = 'audio/wav') {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  const ext = mimeType.includes('mpeg') || mimeType.includes('mp3') ? '.mp3' : '.wav';
  const cleanName = filename.replace(/\.(wav|mp3)$/i, '');
  a.download = `${cleanName}${ext}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function estimateSpeechDurationSeconds(text: string): number {
  if (!text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  // Average speaking rate: ~145 words per minute (2.4 words/sec)
  return Math.max(1, Math.round((words / 145) * 60));
}

export async function extractWaveformPeaks(
  base64: string,
  numBars = 48
): Promise<{ peaks: number[]; duration: number }> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0); // Left/mono channel
    const blockSize = Math.floor(rawData.length / numBars);
    const peaks: number[] = [];

    for (let i = 0; i < numBars; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j] || 0);
      }
      peaks.push(Math.min(1, Math.max(0.12, (sum / blockSize) * 2.8)));
    }

    const duration = audioBuffer.duration;
    await audioContext.close();
    return { peaks, duration };
  } catch (err) {
    console.warn('Could not decode audio buffer for waveform, using fallback peaks:', err);
    // Fallback pseudo-random waveform
    const fallbackPeaks = Array.from({ length: numBars }, (_, i) => {
      const v = Math.sin(i * 0.45) * 0.4 + Math.cos(i * 0.9) * 0.3 + 0.4;
      return Math.min(1, Math.max(0.15, v));
    });
    return { peaks: fallbackPeaks, duration: 5 };
  }
}
