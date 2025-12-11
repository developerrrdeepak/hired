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

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('GOOGLE_GENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const context = conversationHistory
      ?.slice(-6)
      .map((msg: any) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
      .join('\n') || '';

    const prompt = `You are a professional AI interviewer conducting a live voice interview. Act like a real human interviewer - be conversational, empathetic, and adaptive.

Key behaviors:
- Ask follow-up questions based on candidate's answers
- Probe deeper into interesting points
- Adapt difficulty based on candidate's responses
- Be encouraging but professional
- Ask behavioral, technical, and situational questions
- Keep responses natural and conversational (2-3 sentences max)

Conversation history:
${context}

Candidate just said: ${message}

Your response as interviewer:`;

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
