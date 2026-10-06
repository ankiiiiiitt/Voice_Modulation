export type GeminiVoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Aoede' | 'Adam';

export interface VoiceProfile {
  id: GeminiVoiceName;
  name: string;
  gender: 'Female' | 'Male';
  character: string;
  accent: string;
  color: string;
  bestFor: string;
  avatarSeed: string;
  badge?: string;
  engineHint?: string;
}

export interface DialogueTurn {
  id: string;
  speaker: string;
  voice: GeminiVoiceName;
  text: string;
  style: string;
}

export interface GenerationRecord {
  id: string;
  timestamp: number;
  mode: 'single' | 'dialogue';
  title: string;
  text: string;
  voice: GeminiVoiceName | string;
  secondaryVoice?: GeminiVoiceName;
  style?: string;
  audioBase64: string;
  mimeType: string;
  duration?: number;
  dialogueTurns?: DialogueTurn[];
  bookmarked?: boolean;
  provider?: string;
}

export interface StylePreset {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  category: 'mood' | 'professional' | 'dramatic' | 'casual';
}
