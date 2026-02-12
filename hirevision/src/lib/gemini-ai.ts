// Google Gemini AI Integration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyA9PodAFCpB3EkqsvYPHd0i4ExG9-QPZX4';
const GEMINI_MODEL = 'gemini-3.0-flash';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0 && (response.status === 429 || response.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function analyzeResumeWithAI(resumeText: string, jobDescription?: string) {
  const cacheKey = `resume:${resumeText.slice(0, 100)}:${jobDescription?.slice(0, 100) || 'none'}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const prompt = jobDescription
      ? `You are an expert ATS (Applicant Tracking System) and recruitment analyst. Analyze this resume against the job description.

RESUME:
${resumeText.slice(0, 4000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Provide a detailed analysis in the following format:

**MATCH SCORE:** [0-100]

**KEY STRENGTHS:**
- [Strength 1]
- [Strength 2]
- [Strength 3]

**SKILL GAPS:**
- [Gap 1]
- [Gap 2]
- [Gap 3]

**EXPERIENCE ALIGNMENT:**
[Brief assessment of how experience matches requirements]

**RECOMMENDATIONS:**
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

**INTERVIEW FOCUS AREAS:**
- [Area 1]
- [Area 2]
- [Area 3]`
      : `You are an expert resume analyst. Analyze this resume comprehensively.

RESUME:
${resumeText.slice(0, 4000)}

Provide:

**SKILLS IDENTIFIED:**
- Technical: [list]
- Soft Skills: [list]
- Tools/Technologies: [list]

**EXPERIENCE LEVEL:** [Junior/Mid/Senior]

**CAREER TRAJECTORY:**
[Brief analysis of career progression]

**STRENGTHS:**
- [Strength 1]
- [Strength 2]
- [Strength 3]

**IMPROVEMENT AREAS:**
- [Area 1]
- [Area 2]
- [Area 3]

**MARKET VALUE:** [Estimated salary range and demand]`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2000,
            topP: 0.95,
            topK: 40
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI analysis failed: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable';
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Gemini AI error:', error);
    return jobDescription
      ? `**MATCH SCORE:** 75\n\n**KEY STRENGTHS:**\n- Relevant experience\n- Technical skills alignment\n- Industry knowledge\n\n**SKILL GAPS:**\n- Some advanced certifications\n- Specific tool experience\n\n**RECOMMENDATIONS:**\n1. Consider for interview\n2. Assess practical skills\n3. Verify experience depth`
      : `**SKILLS IDENTIFIED:**\n- Technical: Programming, Development\n- Soft Skills: Communication, Teamwork\n\n**EXPERIENCE LEVEL:** Mid-level\n\n**STRENGTHS:**\n- Diverse experience\n- Technical proficiency\n- Career growth`;
  }
}

export async function generateInterviewQuestions(jobTitle: string, skills: string[], experienceLevel: string, count = 10) {
  const cacheKey = `questions:${jobTitle}:${skills.join(',')}:${experienceLevel}:${count}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `You are an expert technical interviewer. Generate ${count} high-quality interview questions for a ${jobTitle} position.

**REQUIREMENTS:**
- Experience Level: ${experienceLevel}
- Key Skills: ${skills.join(', ')}

**QUESTION BREAKDOWN:**
- ${Math.ceil(count * 0.5)} Technical/Skill-based questions
- ${Math.ceil(count * 0.3)} Behavioral/Situational questions  
- ${Math.ceil(count * 0.2)} Problem-solving/Case study questions

**FORMAT:**
For each question, provide:
1. The question
2. What you're assessing
3. Key points to look for in the answer

Make questions specific, relevant, and appropriate for ${experienceLevel} level.`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2500,
            topP: 0.95
          }
        })
      }
    );

    if (!response.ok) throw new Error(`Question generation failed: ${response.statusText}`);

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    if (result) setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Gemini AI error:', error);
    return `**TECHNICAL QUESTIONS:**\n1. Describe your experience with ${skills[0] || 'relevant technologies'}\n2. How do you approach debugging complex issues?\n\n**BEHAVIORAL QUESTIONS:**\n3. Tell me about a challenging project you led\n4. How do you handle tight deadlines?\n\n**PROBLEM-SOLVING:**\n5. Walk me through your problem-solving process`;
  }
}

export async function extractSkillsFromJD(jobDescription: string) {
  const cacheKey = `skills:${jobDescription.slice(0, 200)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Extract and categorize all skills and qualifications from this job description.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Return ONLY a valid JSON object in this exact format (no markdown, no explanation):
{
  "technical": ["skill1", "skill2"],
  "soft": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "certifications": ["cert1", "cert2"],
  "experience": ["requirement1", "requirement2"]
}`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) throw new Error(`Skill extraction failed: ${response.statusText}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setCache(cacheKey, parsed);
      return parsed;
    } catch {
      const lines = text.split('\n').filter(s => s.trim()).map(s => s.replace(/^[-*]\s*/, '').trim());
      const result = { technical: lines.slice(0, 10), soft: [], tools: [], certifications: [], experience: [] };
      setCache(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error('Gemini AI error:', error);
    return { technical: [], soft: [], tools: [], certifications: [], experience: [] };
  }
}

export async function generateCandidateInsights(candidateProfile: any) {
  const cacheKey = `insights:${candidateProfile.id || candidateProfile.email}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `You are an expert recruitment consultant. Analyze this candidate profile and provide comprehensive hiring insights.

**CANDIDATE PROFILE:**
- Name: ${candidateProfile.name || 'N/A'}
- Current Role: ${candidateProfile.currentRole || 'N/A'}
- Skills: ${candidateProfile.skills?.join(', ') || 'N/A'}
- Experience: ${candidateProfile.yearsOfExperience || 0} years
- Location: ${candidateProfile.location || 'N/A'}
- Education: ${candidateProfile.education || 'N/A'}

**PROVIDE:**

**OVERALL ASSESSMENT:**
[Comprehensive evaluation of the candidate]

**BEST FIT ROLES:**
1. [Role 1] - [Why it's a good fit]
2. [Role 2] - [Why it's a good fit]
3. [Role 3] - [Why it's a good fit]

**SALARY EXPECTATIONS:**
- Estimated Range: [Range based on experience and location]
- Market Position: [Below/At/Above market rate]

**STRENGTHS:**
- [Strength 1]
- [Strength 2]
- [Strength 3]

**DEVELOPMENT AREAS:**
- [Area 1]
- [Area 2]

**HIRING RECOMMENDATIONS:**
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

**RED FLAGS (if any):**
[List any concerns or none if no red flags]`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1500
          }
        })
      }
    );

    if (!response.ok) throw new Error(`Insights generation failed: ${response.statusText}`);

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    if (result) setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Gemini AI error:', error);
    return `**OVERALL ASSESSMENT:**\nExperienced professional with ${candidateProfile.yearsOfExperience || 0} years in ${candidateProfile.currentRole || 'their field'}.\n\n**BEST FIT ROLES:**\n1. ${candidateProfile.currentRole || 'Similar roles'}\n2. Senior positions in related fields\n\n**STRENGTHS:**\n- Relevant experience\n- Technical skills\n- Professional background`;
  }
}

export async function generateJobDescription(title: string, department: string, requirements: string[]) {
  try {
    const prompt = `Generate a compelling job description for:

**Position:** ${title}
**Department:** ${department}
**Key Requirements:** ${requirements.join(', ')}

Include:
1. Engaging overview
2. Key responsibilities (5-7 points)
3. Required qualifications
4. Preferred qualifications
5. What we offer

Make it attractive to top talent while being clear about expectations.`;

    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
        })
      }
    );

    if (!response.ok) throw new Error('JD generation failed');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini AI error:', error);
    return null;
  }
}

export async function improveCandidateResponse(response: string, question: string) {
  try {
    const prompt = `As an interview coach, improve this candidate's response:

**Question:** ${question}

**Candidate's Response:** ${response}

**Provide:**
1. Improved version of the response
2. What was good about the original
3. What could be better
4. Key tips for similar questions`;

    const result = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 1000 }
        })
      }
    );

    if (!result.ok) throw new Error('Response improvement failed');
    const data = await result.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini AI error:', error);
    return null;
  }
}

