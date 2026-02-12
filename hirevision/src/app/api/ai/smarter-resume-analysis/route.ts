import { NextRequest, NextResponse } from 'next/server';
import { smarterResumeAnalysisFlow } from '@/ai/flows/ai-smarter-resume-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumePath, resumeUrl } = body;

    // Check for either resumePath OR resumeUrl
    if (!resumePath && !resumeUrl) {
      return NextResponse.json(
        { error: 'Missing required field: resumePath or resumeUrl' },
        { status: 400 }
      );
    }
    
    let sanitizedPath = '';
    
    if (resumePath) {
        if (typeof resumePath !== 'string') {
             return NextResponse.json(
                { error: 'resumePath must be a string' },
                { status: 400 }
            );
        }
        sanitizedPath = resumePath.replace(/[^a-zA-Z0-9._/-]/g, '');
        if (!sanitizedPath || sanitizedPath.includes('..')) {
          return NextResponse.json(
            { error: 'Invalid resumePath format' },
            { status: 400 }
          );
        }
    } else if (resumeUrl) {
         if (typeof resumeUrl !== 'string') {
             return NextResponse.json(
                { error: 'resumeUrl must be a string' },
                { status: 400 }
            );
        }
        // Basic url validation or sanitization if needed
        sanitizedPath = resumeUrl;
    }


    // Pass the available info to the flow
    const analysisResult = await smarterResumeAnalysisFlow(sanitizedPath);

    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: 'Resume analysis completed successfully',
    });
  } catch (error) {
    console.error('Error in resume analysis endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to process resume analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

