import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {defineModel} from '@genkit-ai/ai';

export const geminiPro = defineModel(
  {
    name: 'googleai/gemini-1.5-pro-latest',
    config: {
      temperature: 1,
    },
  },
  googleAI()
);

export const geminiFlash = defineModel(
  {
    name: 'googleai/gemini-1.5-flash-latest',
    config: {
      temperature: 0.2,
    },
  },
  googleAI()
);

export const ai = genkit({
  plugins: [googleAI()],
});
