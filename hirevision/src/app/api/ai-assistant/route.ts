import { NextRequest, NextResponse } from 'next/server';
import { createAIAssistant } from '@/lib/universal-ai-assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userId, context, action } = body;

    // Validate that we have enough information to proceed
    if (!action && !question) {
       return NextResponse.json(
        { error: 'Question or action is required' },
        { status: 400 }
      );
    }

    const assistant = createAIAssistant();

    let response;

    switch (action) {
      case 'analyze-code':
        response = await assistant.analyzeCode(body.code, body.language || 'javascript');
        break;
      
      case 'debug':
        response = await assistant.debugError(body.error, body.code);
        break;
      
      case 'explain':
        response = await assistant.explainConcept(body.concept, body.level);
        break;
      
      case 'brainstorm':
        response = await assistant.brainstorm(body.topic, body.count);
        break;
      
      case 'solve':
        response = await assistant.solveProblems(body.problem);
        break;
      
      case 'analyze-resume':
        response = await assistant.analyzeResume(body.resumeText);
        break;
      
      case 'generate-jd':
        response = await assistant.generateJobDescription(body.role, body.companyContext);
        break;
      
      case 'generate-interview-questions':
        response = await assistant.generateInterviewQuestions(body.role, body.skillLevel, body.focusAreas);
        break;

      case 'enhance-post':
        response = await assistant.enhancePostDraft(body.draft, body.type);
        break;

      case 'suggest-comments':
        response = await assistant.suggestComment(body.postContent, body.userRole);
        break;

      case 'salary-insights':
        response = await assistant.getSalaryInsights(body.role, body.location, body.experienceLevel, body.companyType);
        break;

      case 'skill-gap':
        response = await assistant.analyzeSkillGap(body.currentSkills, body.targetRole, body.targetJobDescription);
        break;

      case 'project-ideas':
        response = await assistant.generateProjectIdeas(body.skill, body.difficulty);
        break;

      case 'career-guidance':
        response = await assistant.getCareerGuidance(body.currentRole, body.goals, body.experience);
        break;

      case 'parse-resume':
        response = await assistant.parseResume(body.resumeText);
        break;
      
      case 'summarize-text':
        response = await assistant.summarizeText(body.text);
        break;

      case 'generate-email':
        response = await assistant.generateEmailDraft(body.topic, body.recipient, body.tone);
        break;

      case 'meeting-notes':
        response = await assistant.generateMeetingNotes(body.transcript);
        break;
      
      default:
        // Default chat behavior
        response = await assistant.ask(question, userId, context);
    }

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('AI Assistant API Error:', error);
    
    // Check for specific error types (e.g., API key missing)
    const errorMessage = error.message || 'Failed to process request';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        fallback: 'I encountered an issue. Please try again later or check system configuration.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    capabilities: [
      'General Q&A',
      'Code Analysis',
      'Debugging',
      'Concept Explanation',
      'Brainstorming',
      'Problem Solving',
      'Resume Analysis',
      'Job Description Generation',
      'Interview Question Generation',
      'Post Enhancement',
      'Comment Suggestions',
      'Salary & Market Insights',
      'Skill Gap Analysis',
      'Project Ideas Generator',
      'Career Guidance',
      'Resume Parser',
      'Text Summarization',
      'Email Generation',
      'Meeting Notes Organization',
    ],
    message: 'Universal AI Assistant is ready.',
  });
}

