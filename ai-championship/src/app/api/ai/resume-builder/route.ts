import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetRole, experience, skills, oldResumeText, action } = body;

        if (action !== 'generate_resume') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
             // Mock fallback if no API key
             return NextResponse.json({
                success: true,
                data: {
                    fullName: "Candidate Name",
                    title: targetRole,
                    summary: `A highly motivated ${targetRole} with a strong background in ${skills}. Dedicated to delivering high-quality solutions.`,
                    experience: [
                        {
                            role: targetRole,
                            company: "Previous Tech Corp",
                            date: "2021 - Present",
                            points: ["Led development of key features.", "Improved performance by 20%."]
                        }
                    ],
                    skills: skills.split(',').map((s: string) => s.trim())
                }
             });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are an expert Resume Writer and Career Coach.
        Create a professional, ATS-optimized resume for a "${targetRole}".
        
        Input Data:
        - Skills: ${skills}
        - Experience/Background: "${experience} ${oldResumeText}"
        
        Output a JSON object with this structure:
        {
            "fullName": "Name Placeholder",
            "title": "${targetRole}",
            "summary": "Professional summary...",
            "experience": [
                { "role": "Job Title", "company": "Company Name", "date": "Date Range", "points": ["Achievement 1", "Achievement 2"] }
            ],
            "skills": ["Skill 1", "Skill 2"]
        }
        
        Make the bullet points result-oriented (use numbers/metrics). Use strong action verbs.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const resumeData = JSON.parse(jsonMatch[0]);

        return NextResponse.json({ success: true, data: resumeData });

    } catch (error: any) {
        console.error('Resume Builder Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
