import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const context = conversationHistory
      ?.slice(-6)
      .map((msg: any) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
      .join('\n') || '';

    const prompt = `You are a professional AI interviewer conducting a voice interview. Be conversational, friendly, and ask relevant follow-up questions based on the candidate's responses.

Conversation so far:
${context}

Candidate: ${message}

Respond as the interviewer (keep it concise, 2-3 sentences):`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('Voice interview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}
