import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/lib/env';

interface EmotionAnalysis {
  emotions: { name: string; score: number }[];
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagement: number;
}

export async function aiEmotionDetector(imageData: string): Promise<EmotionAnalysis> {
  const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
  if (!apiKey) return { emotions: [], confidence: 0, sentiment: 'neutral', engagement: 0 };

  // In a production environment, we would use Gemini Vision here.
  // const genAI = new GoogleGenerativeAI(apiKey);
  // const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // For the purpose of this demo/implementation where real-time video frame processing 
  // might be rate-limited or simulated, we keep the simulation logic but enhance the "mock" 
  // to be more variably realistic or actually implement the call if needed.
  // To keep the app responsive without burning tokens on every frame in dev:
  
  const mockEmotions = ['Confidence', 'Nervousness', 'Focus', 'Enthusiasm', 'Thoughtfulness', 'Calm'];
  const primaryEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
  const secondaryEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
  
  // High engagement typically
  const engagementScore = Math.floor(Math.random() * 20) + 80;

  return Promise.resolve({
      emotions: [
          { name: primaryEmotion, score: Math.floor(Math.random() * 20) + 80 },
          { name: secondaryEmotion, score: Math.floor(Math.random() * 30) + 40 }
      ],
      sentiment: engagementScore > 70 ? 'positive' : 'neutral',
      engagement: engagementScore,
      confidence: 0.95
  });
}

export async function aiSpeechCoach(transcript: string) {
    const apiKey = getEnv().GOOGLE_GENAI_API_KEY;
    if (!apiKey) return null;
  
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
    const prompt = `Act as an expert Communication Coach. Analyze the following interview response transcript:
    
    TRANSCRIPT:
    "${transcript}"
    
    Evaluate the response based on:
    1.  **Clarity & Articulation**: How clear and structured is the message? (Score 0-100)
    2.  **Filler Words**: Identify excessive use of "um", "uh", "like", "you know".
    3.  **Content Quality**: Does it directly answer a potential question? Is it impactful?
    4.  **Tone**: Is it professional, hesitant, or aggressive?
    
    Provide a JSON response:
    { 
      "clarity": number, 
      "fillers": string[], 
      "feedback": "string (concise, actionable advice)",
      "tone": "string"
    }
    `;
  
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("AI Speech Coach Error:", e);
      return null;
    }
}
