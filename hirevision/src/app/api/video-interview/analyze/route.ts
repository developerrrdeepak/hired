import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    let prompt = '';

    switch (action) {
      case 'analyze-confidence':
        prompt = `Analyze this interview response for confidence level (1-10): "${data.text}". Provide: confidence score, body language tips, and improvement suggestions. Keep it brief (2-3 sentences).`;
        break;

      case 'analyze-answer':
        prompt = `Analyze this interview answer: "${data.text}". Provide: quality score (1-10), strengths, and areas to improve. Keep it concise (2-3 sentences).`;
        break;

      case 'suggest-question':
        prompt = `Based on this conversation context: "${data.context}", suggest the next relevant interview question. Keep it professional and concise.`;
        break;

      case 'detect-emotion':
        prompt = `Analyze the emotional tone of this response: "${data.text}". Identify: primary emotion, confidence level, and professionalism score. Brief response only.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ success: true, analysis: response });
  } catch (error: any) {
    console.error('Video interview AI error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze', details: error.message },
      { status: 500 }
    );
  }
}

