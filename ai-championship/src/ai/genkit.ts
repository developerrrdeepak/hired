import {genkit} from 'genkit';
import {GoogleGenerativeAI} from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export const geminiPro = genAI.getGenerativeModel({model: 'gemini-1.5-pro-latest'});
export const geminiFlash = genAI.getGenerativeModel({model: 'gemini-1.5-flash-latest'});

export const ai = genkit({plugins: []});
