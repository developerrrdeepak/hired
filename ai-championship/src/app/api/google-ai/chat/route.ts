import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyA9PodAFCpB3EkqsvYPHd0i4ExG9-QPZX4';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    const systemPrompt = context === 'recruitment_assistant' 
      ? 'You are an AI recruitment assistant. Help with candidate matching, job descriptions, interview questions, and hiring strategies. Be concise and professional.'
      : 'You are a helpful AI assistant.';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
      })
    });

    if (!response.ok) throw new Error('Gemini API failed');
    
    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'I can help you with recruitment tasks. What would you like to know?';

    return NextResponse.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      success: true, 
      response: 'I can help you with candidate matching, job postings, and interview preparation. What would you like to know?' 
    });
  }
}
