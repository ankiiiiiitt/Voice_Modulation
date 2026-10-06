import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini SDK client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to process bracket tags for Gemini 3.8 Flash TTS
function prepareTextForGeminiTTS(inputText: string): { processedText: string; detectedStyles: string[] } {
  let text = inputText;
  const detectedStyles: string[] = [];

  // Map bracket vocalizations to Gemini 3.8 native vocal bursts
  const vocalizationMap: Record<string, string> = {
    '\\[clears throat\\]': '<throat-clearing>',
    '\\[coughing\\]': '<cough>',
    '\\[chuckling\\]': '<laugh>',
    '\\[laughing\\]': '<laugh>',
    '\\[sighing\\]': '<sigh>',
    '\\[gasping\\]': '<gasp>',
    '\\[sharp exhale\\]': '<breath>',
    '\\[panting\\]': '<breath>',
    '\\[sniffling\\]': '<breath>',
    '\\[yawning\\]': '<sigh>',
    '\\[humming\\]': '<sigh>',
    '\\[scoffing\\]': '<sigh>',
  };

  for (const [pattern, replacement] of Object.entries(vocalizationMap)) {
    text = text.replace(new RegExp(pattern, 'gi'), replacement);
  }

  // Detect emotions and deliveries
  const emotionRegex = /\[(weak|angry|bored|menacing|playful|tired|excited|whispering|singing|slowly|softly|fast|voice breaking|shouting|trembling)\]/gi;
  let match;
  while ((match = emotionRegex.exec(inputText)) !== null) {
    const emotion = match[1].toLowerCase();
    if (!detectedStyles.includes(emotion)) {
      detectedStyles.push(emotion);
    }
  }

  return { processedText: text, detectedStyles };
}

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    geminiReady: !!process.env.GEMINI_API_KEY,
    elevenLabsConfigured: !!process.env.ELEVENLABS_API_KEY,
  });
});

// Single-speaker & Multi-speaker TTS Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const { mode = 'single', text, voice = 'Kore', style = '', speakers, dialogue } = req.body;

    if (mode === 'single') {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text prompt is required for TTS generation.' });
      }

      // Check if Adam is requested and user provided ELEVENLABS_API_KEY
      if (voice === 'Adam' && process.env.ELEVENLABS_API_KEY) {
        try {
          const elevenRes = await fetch(
            'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
            {
              method: 'POST',
              headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
                Accept: 'audio/mpeg',
              },
              body: JSON.stringify({
                text: text.trim(),
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.8,
                },
              }),
            }
          );

          if (elevenRes.ok) {
            const arrayBuffer = await elevenRes.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');
            return res.json({
              success: true,
              audioBase64: base64Audio,
              mimeType: 'audio/mpeg',
              model: 'elevenlabs-adam',
              voice: 'Adam',
              provider: 'ElevenLabs Native API (Adam pNInz6obpgDQGcFmaJgB)',
            });
          } else {
            console.warn(
              'ElevenLabs API returned non-200, falling back to Gemini 3.8 Flash TTS Voice Design for Adam'
            );
          }
        } catch (elevenErr) {
          console.warn('ElevenLabs API request failed, falling back to Gemini 3.8 Flash TTS:', elevenErr);
        }
      }

      // Gemini 3.8 Flash TTS voice synthesis (including Voice Design for Adam)
      const isAdamVoice = voice === 'Adam';
      const actualVoice = isAdamVoice ? 'Charon' : voice;

      const adamPersonaDirection =
        'Voice Persona: Deep, velvety, warm baritone American narrator with articulate, calm gravitas, rich vocal fry, and smooth storytelling cadence in the iconic style of ElevenLabs Adam.';

      // Process bracket vocalizations and emotion tags for Gemini
      const { processedText, detectedStyles } = prepareTextForGeminiTTS(text.trim());

      let combinedStyle = isAdamVoice
        ? `${adamPersonaDirection} ${style ? `Tone: ${style.trim()}` : ''}`
        : style?.trim() || '';

      if (detectedStyles.length > 0) {
        combinedStyle = `${combinedStyle ? `${combinedStyle}. ` : ''}Expressive style and delivery: ${detectedStyles.join(', ')}.`;
      }

      const speechMetadata = combinedStyle?.trim() ? { style: combinedStyle.trim() } : undefined;

      // Gemini TTS voice synthesis with automatic fallback to gemini-3.8-flash-lite-tts on 429 quota
      let usedModel = req.body.model || 'gemini-3.8-flash-tts';
      let quotaNotice: string | null = null;
      let response;

      try {
        response = await ai.models.generateContent({
          model: usedModel,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: processedText,
                  speechMetadata,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: actualVoice },
              },
            },
          },
        });
      } catch (genError: any) {
        const errorMsg = String(genError?.message || genError || '');
        const isQuotaError =
          errorMsg.includes('429') ||
          errorMsg.includes('RESOURCE_EXHAUSTED') ||
          errorMsg.includes('Quota exceeded');

        if (isQuotaError && usedModel === 'gemini-3.8-flash-tts') {
          console.warn(
            'Daily free tier quota exceeded for gemini-3.8-flash-tts. Falling back to high-throughput gemini-3.8-flash-lite-tts...'
          );
          usedModel = 'gemini-3.8-flash-lite-tts';
          quotaNotice =
            'Daily Free Tier limit (10 requests) reached for gemini-3.8-flash-tts. Automatically switched to high-efficiency gemini-3.8-flash-lite-tts.';

          response = await ai.models.generateContent({
            model: usedModel,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: processedText,
                    speechMetadata,
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: actualVoice },
                },
              },
            },
          });
        } else {
          throw genError;
        }
      }

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData && p.inlineData.data
      );

      const base64Audio = audioPart?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({
          error: 'No audio stream returned from Gemini TTS. Please adjust your text and try again.',
        });
      }

      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: audioPart.inlineData?.mimeType || 'audio/wav',
        model: usedModel,
        voice,
        quotaNotice,
        provider: isAdamVoice
          ? `ElevenLabs Adam Voice Design (${usedModel})`
          : `Gemini TTS (${usedModel})`,
      });
    } else if (mode === 'dialogue') {
      // Multi-speaker dialogue mode
      if (!Array.isArray(speakers) || speakers.length !== 2) {
        return res.status(400).json({ error: 'Multi-speaker mode requires exactly 2 speaker definitions.' });
      }

      if (!Array.isArray(dialogue) || dialogue.length === 0) {
        return res.status(400).json({ error: 'Dialogue entries are required.' });
      }

      // Map any 'Adam' voice to 'Charon' with Voice Design styling
      const speakerConfigs = speakers.map((s) => {
        const isAdam = s.voice === 'Adam';
        return {
          name: s.name,
          voice: isAdam ? 'Charon' : s.voice || 'Puck',
          isAdam,
        };
      });

      const parts = dialogue.map((line: { speaker: string; text: string; style?: string }) => {
        const speakerCfg = speakerConfigs.find((s) => s.name === line.speaker);
        const { processedText, detectedStyles } = prepareTextForGeminiTTS(line.text.trim());
        let turnStyle = line.style?.trim() || '';
        if (speakerCfg?.isAdam) {
          turnStyle = `Voice Persona: Deep, velvety, warm baritone American narrator in the style of ElevenLabs Adam. ${turnStyle}`.trim();
        }
        if (detectedStyles.length > 0) {
          turnStyle = `${turnStyle ? `${turnStyle}. ` : ''}Expressive delivery: ${detectedStyles.join(', ')}.`;
        }

        return {
          text: `${line.speaker}: ${processedText}`,
          speechMetadata: {
            speaker: line.speaker,
            style: turnStyle || undefined,
          },
        };
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speakerConfigs[0].name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speakerConfigs[0].voice },
                  },
                },
                {
                  speaker: speakerConfigs[1].name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speakerConfigs[1].voice },
                  },
                },
              ],
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData && p.inlineData.data
      );

      const base64Audio = audioPart?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({
          error: 'No audio returned from Gemini multi-speaker dialogue. Check speaker names and script.',
        });
      }

      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: audioPart.inlineData?.mimeType || 'audio/wav',
        model: 'gemini-3.8-flash-tts',
        speakers,
      });
    } else {
      return res.status(400).json({ error: `Unsupported mode: ${mode}` });
    }
  } catch (err: any) {
    console.error('Error generating TTS:', err);
    const errorMsg = String(err?.message || err || '');
    if (
      errorMsg.includes('429') ||
      errorMsg.includes('RESOURCE_EXHAUSTED') ||
      errorMsg.includes('Quota exceeded')
    ) {
      return res.status(429).json({
        error:
          'Daily Free Tier Quota Exceeded (10 requests/day on gemini-3.8-flash-tts). Switch to high-efficiency gemini-3.8-flash-lite-tts in Solo Voice Studio, or add a paid API key in Settings > Secrets.',
        isQuotaExceeded: true,
        details: err?.message,
      });
    }
    return res.status(500).json({
      error: err?.message || 'An error occurred during Gemini TTS generation.',
    });
  }
});

// AI Script Assistant using gemini-3.8-flash
app.post('/api/enhance-script', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const { action, text, topic, speaker1 = 'Alex', speaker2 = 'Sam' } = req.body;

    let systemInstruction = '';
    let prompt = '';

    if (action === 'polish') {
      systemInstruction =
        'You are an expert voiceover script director. Polish the input text for natural spoken delivery. Ensure proper breathing cadence, clear phonetic rhythm, and punctuation that guides natural voice inflection. Return only the polished script text without any meta explanations.';
      prompt = `Polish this text for spoken voiceover:\n\n${text}`;
    } else if (action === 'vocal_bursts') {
      systemInstruction =
        'You are an expert audio dramatist for Google Gemini 3.8 Flash TTS. Gemini 3.8 TTS supports expressive vocal bursts: <breath>, <laugh>, <gasp>, <sigh>, <throat-clearing>, and backchannels: |mhm|, |yeah|, |uh-huh|. Seamlessly enrich the input text with appropriate vocal bursts and backchannels to sound vividly lifelike and authentic. Return only the enhanced script with the tags included.';
      prompt = `Add lifelike vocal bursts (<breath>, <laugh>, <gasp>, <sigh>) and backchannels (|mhm|, |yeah|) to this text:\n\n${text}`;
    } else if (action === 'generate_monologue') {
      systemInstruction =
        'You are a professional voice scriptwriter. Write an engaging, well-paced spoken script on the requested topic. Length should be around 60-120 words. Include subtle vocal cues like <breath> or expressive punctuation for natural delivery. Return only the script.';
      prompt = `Write a voice script about: ${topic || 'Welcome message for Ankit'}`;
    } else if (action === 'generate_dialogue') {
      systemInstruction = `You are a podcast and audio drama scriptwriter. Generate a lively, natural 2-person dialogue between "${speaker1}" and "${speaker2}" on the given topic. Use backchannels like |yeah|, |mhm| and vocal bursts like <laugh>, <gasp>, <breath>. Respond in valid JSON format with an array of objects: [{"speaker": "${speaker1}", "text": "...", "style": "friendly and excited"}, {"speaker": "${speaker2}", "text": "...", "style": "thoughtful and calm"}]. Output must be pure JSON with no markdown wrapping.`;
      prompt = `Generate a 4 to 6 turn dialogue about: ${topic || 'The future of AI audio and voice interfaces'}`;
    } else {
      return res.status(400).json({ error: 'Invalid script action requested.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const resultText = response.text || '';

    if (action === 'generate_dialogue') {
      try {
        const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, dialogue: parsed, raw: resultText });
      } catch (parseErr) {
        // Return raw text if JSON parsing fails
        return res.json({ success: true, text: resultText });
      }
    }

    return res.json({ success: true, result: resultText.trim() });
  } catch (err: any) {
    console.error('Error enhancing script:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to process script with gemini-3.8-flash.',
    });
  }
});

// Mount Vite middleware in dev or static in prod
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoxGemini Server listening on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
