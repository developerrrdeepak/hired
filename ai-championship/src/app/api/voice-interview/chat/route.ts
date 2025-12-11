import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error('GOOGLE_GENAI_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    // Build conversation context
    const context = conversationHistory && conversationHistory.length > 0
      ? conversationHistory
          .slice(-6) // Last 6 messages for context
          .map((msg: any) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
          .join('\n')
      : '';

    const prompt = `You are a professional AI interviewer conducting a job interview. Be conversational, friendly, ask follow-up questions, and provide constructive feedback. Keep responses concise (2-3 sentences).

${context ? `Previous conversation:\n${context}\n\n` : ''}Candidate: ${message}

Interviewer:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    if (!response || response.trim().length === 0) {
      throw new Error('Empty response from AI');
    }

    return NextResponse.json({ success: true, response: response.trim() });
  } catch (error: any) {
    console.error('Voice interview error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process interview', 
        details: error?.message,
        response: 'I apologize for the technical difficulty. Could you please rephrase your answer?'
      },
      { status: 500 }
    );
  }
}
