import { NextRequest, NextResponse } from 'next/server';
import { analyzeCandidateProfile } from '@/ai/features/analysis/candidate-analyzer';
import { generateJobDescription } from '@/ai/features/generation/job-description';
import { matchCandidateToJob } from '@/ai/features/matching/candidate-matcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case 'analyze_candidate':
        result = await analyzeCandidateProfile(data.resumeText, data.jobDescription);
        break;
      case 'generate_jd':
        result = await generateJobDescription(data.title, data.requirements, data.companyContext);
        break;
      case 'match_candidate':
        result = await matchCandidateToJob(data.candidateProfile, data.jobDescription);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('AI Feature Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
