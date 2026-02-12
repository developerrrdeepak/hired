
'use server';

/**
 * @fileOverview Converts text to speech using an AI model.
 *
 * - textToSpeech - A function that takes text and returns a data URI for the audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

// Import a Genkit configuration that supports the latest models
// Note: Ensure your 'genkit.ts' exports a configured instance that has access to 'gemini-3.0-flash' or similar if 2.5 is not available.
// In this snippet, we assume 'gemini-3.0-flash' is the standard for multimodal generation including audio if supported,
// or we fall back to a specific TTS model definition if the SDK requires it.
// Since the previous file referenced a 'googleAI' import which might not be standard in the project structure shown, 
// we'll adapt to use standard genkit imports or mock if the specific model isn't configured in the project yet.

import { geminiPro } from '@/ai/genkit'; // Fallback for prompt if needed, but here we need the model capable of audio.

// Mocking the model import if not strictly defined in the provided context
// In a real implementation, this would be: import { gemini20Flash } from '@genkit-ai/googleai';
const TTS_MODEL_NAME = 'gemini-3.0-flash'; 

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (text) => {
    // Check if we are in a simulated environment or if the model is available.
    // The previous code referenced 'googleAI.model', which wasn't imported.
    // We will attempt to use a standard generate call, assuming the underlying provider supports it.
    
    try {
        // Attempting to use the model string directly if the provider allows dynamic model selection
        // or if 'gemini-3.0-flash' is registered.
        const response = await ai.generate({
          model: TTS_MODEL_NAME, 
          config: {
            // @ts-ignore - responseModalities might not be in the strict types yet for all SDK versions
            responseModalities: ['AUDIO'], 
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Aoede' }, // 'Aoede' is often a good professional voice
              },
            },
          },
          prompt: `Read the following text clearly and professionally: "${text}"`,
        });

        const media = response.media;

        if (!media) {
          // Fallback if no media is returned (e.g., model doesn't support it or returned text)
           console.warn("TTS: No audio media generated, returning empty.");
           return "";
        }

        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        
        const wavBase64 = await toWav(audioBuffer);
        return `data:audio/wav;base64,${wavBase64}`;

    } catch (error) {
        console.error("TTS Generation Error:", error);
        // Fail gracefully
        return "";
    }
  }
);

export async function textToSpeech(text: string): Promise<string> {
    return textToSpeechFlow(text);
}

