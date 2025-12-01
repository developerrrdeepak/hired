import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question, answer, context } = await request.json();

    // Mock AI feedback - integrate with Raindrop SmartInference later
    const feedback = `Great answer! Here's some feedback:

✅ Strengths:
• Clear communication
• Relevant experience mentioned
• Good structure

💡 Suggestions:
• Add specific metrics or numbers
• Include more concrete examples
• Emphasize your unique value proposition

Keep practicing!`;

    return NextResponse.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to analyze answer' },
      { status: 500 }
    );
  }
}
