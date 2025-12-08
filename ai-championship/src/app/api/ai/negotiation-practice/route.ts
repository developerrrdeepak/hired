
import { NextRequest, NextResponse } from 'next/server';
import { negotiationPracticeFlow } from '../../../../ai/flows/ai-negotiation-practice';
import { configureGenkit } from '../../../../ai/genkit';

configureGenkit();

export async function POST(req: NextRequest) {
  const { role, userResponse, history } = await req.json();

  if (!role || !userResponse) {
    return NextResponse.json({ error: 'Role and user response are required' }, { status: 400 });
  }

  try {
    const response = await negotiationPracticeFlow.run({
      input: {
        role,
        userResponse,
        history,
      },
    });
    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred during negotiation practice' }, { status: 500 });
  }
}
