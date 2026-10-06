import { GeminiVoiceName, VoiceProfile, StylePreset } from '../types/tts';

export const GEMINI_VOICES: VoiceProfile[] = [
  {
    id: 'Adam',
    name: 'Adam',
    gender: 'Male',
    character: 'Deep, velvety, warm & narrative baritone (ElevenLabs Profile)',
    accent: 'American English',
    color: 'from-amber-600 via-orange-600 to-red-600',
    bestFor: 'Narrative audiobooks, documentaries, YouTube voiceovers, essays',
    avatarSeed: 'adam',
    badge: 'ElevenLabs Sound',
    engineHint: 'Iconic Baritone Narrator',
  },
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    character: 'Warm, clear & natural',
    accent: 'Neutral English',
    color: 'from-amber-500 to-rose-500',
    bestFor: 'Storytelling, podcast hosting, customer guides',
    avatarSeed: 'kore',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    character: 'Energetic, dynamic & youthful',
    accent: 'Contemporary English',
    color: 'from-cyan-500 to-blue-600',
    bestFor: 'Tech reviews, gaming, fast-paced dialogue',
    avatarSeed: 'puck',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    character: 'Deep, resonant & authoritative',
    accent: 'Deep English',
    color: 'from-indigo-600 to-violet-700',
    bestFor: 'Documentaries, audiobooks, dramatic voiceover',
    avatarSeed: 'charon',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    character: 'Bold, cinematic & grounded',
    accent: 'Commanding English',
    color: 'from-emerald-600 to-teal-700',
    bestFor: 'Movie trailers, keynote speeches, epic fiction',
    avatarSeed: 'fenrir',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    character: 'Bright, cheerful & upbeat',
    accent: 'Friendly English',
    color: 'from-pink-500 to-rose-600',
    bestFor: 'Product walkthroughs, cheery assistants, ads',
    avatarSeed: 'zephyr',
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Female',
    character: 'Melodic, expressive & poetic',
    accent: 'Refined English',
    color: 'from-purple-500 to-indigo-600',
    bestFor: 'Poetry, luxury branding, meditation, drama',
    avatarSeed: 'aoede',
  },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'warm_podcast',
    label: 'Podcast Host',
    icon: '🎙️',
    prompt: 'Warm, engaging, and friendly podcast host speaking directly to listeners',
    category: 'casual',
  },
  {
    id: 'breaking_news',
    label: 'News Anchor',
    icon: '📰',
    prompt: 'Clear, crisp, fast-paced and objective professional broadcast journalist',
    category: 'professional',
  },
  {
    id: 'dramatic_trailer',
    label: 'Cinematic Drama',
    icon: '🎬',
    prompt: 'Deep, intense, cinematic narration with dramatic pauses and intense gravitas',
    category: 'dramatic',
  },
  {
    id: 'calm_meditation',
    label: 'Zen Meditation',
    icon: '🌿',
    prompt: 'Calm, soothing, slow-paced, gentle breathing cadence with soft vocal tone',
    category: 'mood',
  },
  {
    id: 'excited_tech',
    label: 'Tech Keynote',
    icon: '⚡',
    prompt: 'Enthusiastic, confident visionary tech presenter unveiling an exciting invention',
    category: 'professional',
  },
  {
    id: 'bedtime_story',
    label: 'Whispered Tale',
    icon: '🌙',
    prompt: 'Soft, mysterious, intimate whispered storyteller sharing an ancient secret',
    category: 'mood',
  },
  {
    id: 'comedy_banter',
    label: 'Playful Banter',
    icon: '😄',
    prompt: 'Humorous, lively tone with spontaneous vocal smiles and chuckles',
    category: 'casual',
  },
];

export const VOCAL_BURSTS = [
  { tag: '<breath>', label: 'Breath', desc: 'Natural intake or exhale of breath', type: 'burst' },
  { tag: '<laugh>', label: 'Chuckle', desc: 'Spontaneous warm laugh or chuckle', type: 'burst' },
  { tag: '<gasp>', label: 'Gasp', desc: 'Sudden gasp of surprise or realization', type: 'burst' },
  { tag: '<sigh>', label: 'Sigh', desc: 'Relaxed or weary vocal sigh', type: 'burst' },
  { tag: '|yeah|', label: 'Backchannel: Yeah', desc: 'Natural conversational affirmation', type: 'backchannel' },
  { tag: '|mhm|', label: 'Backchannel: Mhm', desc: 'Subtle listening agreement', type: 'backchannel' },
  { tag: '|uh-huh|', label: 'Backchannel: Uh-huh', desc: 'Conversational acknowledgement', type: 'backchannel' },
];

export interface TagCategory {
  name: string;
  tags: string[];
}

export const SPEECH_TAG_CATEGORIES: TagCategory[] = [
  {
    name: 'Emotion',
    tags: [
      '[weak]',
      '[angry]',
      '[bored]',
      '[menacing]',
      '[playful]',
      '[tired]',
      '[excited]',
    ],
  },
  {
    name: 'Vocalizations',
    tags: [
      '[clears throat]',
      '[coughing]',
      '[chuckling]',
      '[sighing]',
      '[sniffling]',
      '[yawning]',
      '[laughing]',
      '[sharp exhale]',
      '[scoffing]',
      '[humming]',
      '[panting]',
      '[gasping]',
    ],
  },
  {
    name: 'Delivery',
    tags: [
      '[whispering]',
      '[singing]',
      '[slowly]',
      '[softly]',
      '[fast]',
      '[voice breaking]',
      '[shouting]',
      '[trembling]',
    ],
  },
];

export const SAMPLE_SCRIPTS = [
  {
    title: 'Adam (ElevenLabs Narration)',
    category: 'Audiobook / Documentary',
    voice: 'Adam' as GeminiVoiceName,
    style: 'Deep, warm, velvety baritone American narrator with articulate, calm cadence in the style of ElevenLabs Adam',
    text: "Some stories begin with a loud crash. <breath> But the most profound transformations always start in utter silence. <sigh> When you listen closely to the cadence of the human voice, you realize we're not just exchanging words—we're transmitting soul.",
  },
  {
    title: 'Ankit’s Studio Welcome',
    category: 'Personalized',
    voice: 'Puck' as GeminiVoiceName,
    style: 'Enthusiastic and welcoming studio producer',
    text: "Hey Ankit! <breath> Welcome to your dedicated Gemini 3.8 Flash TTS studio! <laugh> With lightning-fast audio generation and ultra-realistic vocal cues, |yeah| you can craft podcasts, dramatic voiceovers, or conversational dialogues in seconds. Let's make something amazing!",
  },
  {
    title: 'Cosmic Wonders Narration',
    category: 'Documentary',
    voice: 'Charon' as GeminiVoiceName,
    style: 'Deep, awe-inspiring documentary narrator',
    text: "Look up at the night sky. <breath> Across billions of light-years, ancient stars whisper the origins of matter itself. <gasp> What if the cosmos isn't just expanding, but reaching back out to us?",
  },
  {
    title: 'Quantum Keynote Pitch',
    category: 'Technology',
    voice: 'Fenrir' as GeminiVoiceName,
    style: 'Confident visionary technology speaker',
    text: "Good morning creators! Today we shatter the boundaries between written prose and human voice. <breath> With Gemini 3.8 Flash TTS, every subtle cadence, breath, and nuance sounds indistinguishable from real human speech. |yeah| The future has arrived.",
  },
  {
    title: 'Mindful Breathing Guide',
    category: 'Meditation',
    voice: 'Kore' as GeminiVoiceName,
    style: 'Gentle, soothing meditation instructor with soft pauses',
    text: "Close your eyes. Gently soften your shoulders. <breath> Inhale deeply through your nose... <sigh> and slowly release all tension from your day. You are right where you need to be.",
  },
];
