import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

const INTERVIEW_STAGES = {
  INTRO: 'intro',
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  CLOSING: 'closing',
};

function determineStage(messageCount: number): string {
  if (messageCount <= 2) return INTERVIEW_STAGES.INTRO;
  if (messageCount <= 8) return INTERVIEW_STAGES.TECHNICAL;
  if (messageCount <= 14) return INTERVIEW_STAGES.BEHAVIORAL;
  return INTERVIEW_STAGES.CLOSING;
}

function getStagePrompt(stage: string): string {
  switch (stage) {
    case INTERVIEW_STAGES.INTRO:
      return 'Start with warm introduction. Ask about their background and what role they\'re interested in.';
    case INTERVIEW_STAGES.TECHNICAL:
      return 'Focus on technical skills, experience, and problem-solving abilities. Ask specific questions about their expertise.';
    case INTERVIEW_STAGES.BEHAVIORAL:
      return 'Ask behavioral questions about teamwork, challenges, leadership, and conflict resolution.';
    case INTERVIEW_STAGES.CLOSING:
      return 'Wrap up the interview. Ask if they have questions, discuss next steps, and thank them.';
    default:
      return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, jobRole, candidateSkills } = body;

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

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 250,
        topP: 0.95,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      ],
    });

    const messageCount = conversationHistory?.length || 0;
    const stage = determineStage(messageCount);
    const stagePrompt = getStagePrompt(stage);

    const context = conversationHistory
      ?.slice(-8)
      .map((msg: any) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
      .join('\n') || '';

    const roleContext = jobRole ? `\nTarget Role: ${jobRole}` : '';
    const skillsContext = candidateSkills ? `\nCandidate Skills: ${candidateSkills.join(', ')}` : '';

    const prompt = `You are an expert AI interviewer conducting a professional voice interview. Be natural, empathetic, and adaptive like a real human interviewer.

**INTERVIEW STAGE:** ${stage.toUpperCase()}
**STAGE GUIDANCE:** ${stagePrompt}${roleContext}${skillsContext}

**YOUR INTERVIEWING STYLE:**
- Natural and conversational (like talking to a colleague)
- Ask ONE clear question at a time
- Listen actively and ask relevant follow-ups
- Adapt difficulty based on candidate's expertise level
- Be encouraging but maintain professionalism
- Show genuine interest in their responses
- Keep responses concise (2-3 sentences)
- Use varied question types: open-ended, situational, technical

**CONVERSATION SO FAR:**
${context}

**CANDIDATE'S LATEST RESPONSE:** "${message}"

**YOUR NEXT RESPONSE AS INTERVIEWER:**
(Respond naturally, acknowledge their answer, then ask your next question)`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const sentiment = analyzeSentiment(message);
    const responseQuality = assessResponseQuality(message);

    return NextResponse.json({ 
      success: true, 
      response,
      metadata: {
        stage,
        messageCount,
        sentiment,
        responseQuality,
      }
    });
  } catch (error: any) {
    console.error('Voice interview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}

function analyzeSentiment(text: string): { score: number; label: string } {
  const positiveWords = ['excited', 'passionate', 'love', 'enjoy', 'great', 'excellent', 'amazing', 'wonderful', 'enthusiastic', 'motivated'];
  const negativeWords = ['difficult', 'challenging', 'hard', 'struggle', 'problem', 'issue', 'worried', 'nervous', 'concerned', 'unsure'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 50;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) score += 8;
    if (negativeWords.some(nw => word.includes(nw))) score -= 5;
  });
  
  score = Math.max(0, Math.min(100, score));
  
  let label = 'neutral';
  if (score >= 65) label = 'positive';
  else if (score <= 35) label = 'negative';
  
  return { score, label };
}

function assessResponseQuality(text: string): { score: number; feedback: string } {
  const wordCount = text.split(/\s+/).length;
  let score = 50;
  let feedback = '';
  
  if (wordCount < 10) {
    score = 30;
    feedback = 'Response is too brief. Provide more details.';
  } else if (wordCount < 30) {
    score = 60;
    feedback = 'Good length, but could add more examples.';
  } else if (wordCount < 100) {
    score = 85;
    feedback = 'Well-detailed response with good examples.';
  } else {
    score = 70;
    feedback = 'Very detailed, but try to be more concise.';
  }
  
  const hasExample = /for example|for instance|such as|like when/i.test(text);
  if (hasExample) score += 10;
  
  const hasNumbers = /\d+/.test(text);
  if (hasNumbers) score += 5;
  
  return { score: Math.min(100, score), feedback };
}
