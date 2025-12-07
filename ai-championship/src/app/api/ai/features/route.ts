import { NextRequest, NextResponse } from 'next/server';
import { aiResumeEnhancer, aiJobFitScore, aiCareerPathAdvisor } from '@/ai/features/recruitment/candidate-tools';
import { aiJobDescriptionGenerator, aiOfferLetterGenerator } from '@/ai/features/recruitment/recruiter-tools';
import { aiHackathonIdeaGenerator, aiCodeReviewer } from '@/ai/features/hackathon/challenge-tools';
import { aiEmotionDetector, aiSpeechCoach } from '@/ai/features/interview/analysis-tools';
import { aiPitchDeckGenerator, aiCoFounderMatcher } from '@/ai/features/startup/founder-tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case 'analyze_candidate_comprehensive':
        const [enhancer, fit, career] = await Promise.all([
            aiResumeEnhancer(data.resumeText),
            data.jobDescription ? aiJobFitScore(data.resumeText, data.jobDescription) : Promise.resolve(null),
            aiCareerPathAdvisor(data.resumeText)
        ]);
        
        result = {
            ...enhancer,
            fitScore: fit?.score,
            fitReason: fit?.reasoning,
            nextRole: career?.nextRole,
            skillsToLearn: career?.skillsToLearn
        };
        break;

      case 'generate_jd':
        result = await aiJobDescriptionGenerator(data.role, data.keyPoints);
        break;
        
      case 'generate_offer_letter':
        result = await aiOfferLetterGenerator(data);
        break;

      case 'generate_hackathon_idea':
        result = await aiHackathonIdeaGenerator(data.topic, data.difficulty);
        break;

      case 'review_code_submission':
        result = await aiCodeReviewer(data.code, data.language);
        break;

      case 'analyze_interview_emotion':
        result = await aiEmotionDetector(data.image);
        break;

      case 'analyze_interview_speech':
        result = await aiSpeechCoach(data.transcript);
        break;

      case 'generate_pitch_deck':
        result = await aiPitchDeckGenerator(data.idea, data.market);
        break;

      case 'match_cofounder':
        result = await aiCoFounderMatcher(data.profile, data.ideal);
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
