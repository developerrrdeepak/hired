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

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const context = conversationHistory
      ?.slice(-4)
      .map((msg: any) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
      .join('\n') || '';

    const prompt = `You are a professional AI interviewer. Be conversational and ask follow-up questions.

${context}

Candidate: ${message}

Interviewer:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('Voice interview error:', error);
    return NextResponse.json(
      { success: true, response: 'Could you please repeat that?' },
      { status: 200 }
    );
  }
}
