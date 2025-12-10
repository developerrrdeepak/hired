import {genkit} from 'genkit';
import {googleAI, gemini15Flash, gemini15Pro} from '@genkit-ai/googleai';

// Configure the AI instance with the Google AI plugin
export const ai = genkit({
  plugins: [googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, 
  })],
});

// Export the models for use in flows
export const geminiPro = gemini15Pro;
export const geminiFlash = gemini15Flash;
