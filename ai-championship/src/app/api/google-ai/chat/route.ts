import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    // Mock AI response for now - integrate with your Genkit flows later
    const responses: Record<string, string> = {
      'recruitment_assistant': `I can help you with: 
• Finding and matching candidates
• Writing job descriptions
• Interview preparation
• Candidate screening
• Resume analysis

What would you like help with?`,
      'default': 'I\'m your AI recruitment assistant. How can I help you today?'
    };

    return NextResponse.json({
      success: true,
      response: responses[context] || responses.default
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
