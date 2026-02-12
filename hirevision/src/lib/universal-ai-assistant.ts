import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  suggestions?: string[];
}

interface ConversationContext {
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  topic?: string;
  userPreferences?: Record<string, any>;
}

export class UniversalAIAssistant {
  private genAI: GoogleGenerativeAI;
  private conversationHistory: Map<string, ConversationContext> = new Map();
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async ask(
    question: string,
    userId?: string,
    context?: Record<string, any>
  ): Promise<AIResponse> {
    try {
      const sessionId = userId || 'default';
      const conversation = this.conversationHistory.get(sessionId) || {
        history: [],
      };

      const enhancedPrompt = this.buildEnhancedPrompt(question, conversation, context);
      
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-3.0-flash',
        generationConfig: {
          temperature: 0.7, // Lower temperature for more focused, professional responses
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      const result = await model.generateContent(enhancedPrompt);
      const response = result.response;
      const answer = response.text();

      conversation.history.push(
        { role: 'user', content: question },
        { role: 'assistant', content: answer }
      );

      if (conversation.history.length > 20) {
        conversation.history = conversation.history.slice(-20);
      }

      this.conversationHistory.set(sessionId, conversation);

      return {
        answer,
        confidence: 0.95,
        suggestions: this.generateFollowUpSuggestions(question, answer),
      };
    } catch (error) {
      console.error('AI Assistant Error:', error);
      return this.getFallbackResponse(question);
    }
  }

  private buildEnhancedPrompt(
    question: string,
    conversation: ConversationContext,
    context?: Record<string, any>
  ): string {
    const systemPrompt = `You are an expert, executive-level AI consultant for a professional recruitment and career development platform. Your persona is knowledgeable, empathetic, precise, and highly professional.

CORE PRINCIPLES:
- **Professionalism First:** Maintain a polished, business-appropriate tone at all times. Avoid slang or overly casual language.
- **Comprehensive & Actionable:** Responses should not just inform but guide. Provide concrete steps, strategies, or insights.
- **Context-Aware:** Tailor your advice to the specific context provided (e.g., role, seniority, industry).
- **Nuanced Perspectives:** When discussing complex topics, present multiple viewpoints or trade-offs professionally.
- **Supportive & Constructive:** Even when delivering critique (e.g., resume review), be encouraging and solution-oriented.

CAPABILITIES:
- **Recruitment Strategy:** Expert advice on hiring processes, candidate experience, and talent acquisition.
- **Career Coaching:** High-level guidance on resume crafting, interview preparation, and career progression.
- **Technical Expertise:** Ability to explain code, system architecture, and tech trends with clarity and depth.
- **Business Writing:** Drafting and refining emails, job descriptions, and professional communications.
- **Strategic Analysis:** Evaluating profiles, matching candidates to roles, and identifying skill gaps.
- **Productivity Enhancement:** Summarizing text, generating email drafts, and organizing meeting notes.

RESPONSE FORMATTING:
- Use clear headings and bullet points for readability.
- Be concise where possible, but thorough where necessary.
- Use bolding for emphasis on key takeaways.
- If suggesting code, ensure it is clean, commented, and follows best practices.

${context ? `ADDITIONAL CONTEXT:\n${JSON.stringify(context, null, 2)}\n` : ''}

${conversation.history.length > 0 ? `CONVERSATION HISTORY:\n${this.formatHistory(conversation.history)}\n` : ''}

USER QUESTION: ${question}

Provide a high-quality, professional response:`;

    return systemPrompt;
  }

  private formatHistory(history: Array<{ role: string; content: string }>): string {
    return history
      .slice(-6)
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');
  }

  private generateFollowUpSuggestions(question: string, answer: string): string[] {
    const suggestions: string[] = [];
    
    if (answer.includes('code') || answer.includes('function')) {
      suggestions.push('Could you optimize this code further?');
      suggestions.push('What are the edge cases to consider?');
    }
    
    if (answer.includes('step') || answer.includes('process')) {
      suggestions.push('What metrics should I track for success?');
      suggestions.push('Can you provide a timeline example?');
    }

    if (answer.includes('resume') || answer.includes('candidate')) {
      suggestions.push('What specific certifications would add value?');
      suggestions.push('How should I address the employment gap professionally?');
    }

    if (answer.includes('post') || answer.includes('community')) {
      suggestions.push('How can I increase engagement on this post?');
      suggestions.push('What is the best time to publish this?');
    }

    if (answer.includes('email') || answer.includes('draft')) {
      suggestions.push('Make it more formal');
      suggestions.push('Make it shorter');
    }
    
    suggestions.push('Can you provide a real-world example?');
    suggestions.push('What are the industry standards for this?');
    
    return suggestions.slice(0, 3);
  }

  private getFallbackResponse(question: string): AIResponse {
    return {
      answer: `I apologize, but I am currently unable to process your request due to a temporary technical issue. Please ensure your query is clear and try again. If the issue persists, consider rephrasing your question with more specific details so I can assist you better.`,
      confidence: 0.5,
      suggestions: [
        'Could you rephrase specifically what you need?',
        'Would you like general information on this topic instead?',
      ],
    };
  }

  async analyzeCode(code: string, language: string): Promise<AIResponse> {
    const prompt = `Conduct a senior-level code review for the following ${language} snippet:

\`\`\`${language}
${code}
\`\`\`

Please provide a structured analysis covering:
1.  **Functionality Summary**: Briefly explain what the code achieves.
2.  **Code Quality & Best Practices**: Evaluate adherence to idioms, naming conventions, and readability.
3.  **Performance Optimization**: Identify potential bottlenecks and suggest specific improvements.
4.  **Security & Reliability**: Point out vulnerabilities or edge cases that need handling.
5.  **Refactoring Suggestions**: Provide a refactored version of the code that implements your recommendations.

Ensure the tone is constructive and the technical advice is sound.`;

    return this.ask(prompt);
  }

  async debugError(error: string, code?: string): Promise<AIResponse> {
    const prompt = `Act as a senior software engineer to troubleshoot this error:

ERROR MESSAGE: ${error}

${code ? `RELEVANT CODE:\n\`\`\`\n${code}\n\`\`\`\n` : ''}

Please provide:
1.  **Root Cause Analysis**: Explain technically why this error occurred.
2.  **Resolution Steps**: step-by-step instructions to fix the issue.
3.  **Code Fix**: The corrected code snippet (if applicable).
4.  **Prevention**: Best practices to avoid this class of errors in the future.`;

    return this.ask(prompt);
  }

  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<AIResponse> {
    const prompt = `Explain the concept of "${concept}" for a ${level} audience.

Structure your response as follows:
1.  **Executive Summary**: A concise definition (1-2 sentences).
2.  **Detailed Explanation**: Break down the mechanics and importance.
3.  **Real-World Analogy/Example**: To aid understanding.
4.  **Industry Application**: How is this currently used in the tech/business world?
5.  **Further Reading/Resources**: (Optional) Key terms to research next.`;

    return this.ask(prompt);
  }

  async brainstorm(topic: string, count: number = 10): Promise<AIResponse> {
    const prompt = `Generate ${count} strategic and innovative ideas for: "${topic}".

For each idea, provide:
*   **Concept**: A catchy name or brief summary.
*   **Value Proposition**: Why is this a good idea?
*   **Feasibility**: High/Medium/Low estimation.

Ensure the ideas are practical yet forward-thinking, suitable for a professional setting.`;

    return this.ask(prompt);
  }

  async solveProblems(problem: string): Promise<AIResponse> {
    const prompt = `Apply a structured problem-solving framework to: "${problem}"

Please provide:
1.  **Problem Diagnosis**: Deconstruct the issue to identify key constraints and variables.
2.  **Strategic Options**: Propose 3 distinct approaches (e.g., Quick Win, Long-term Strategic, Innovative).
3.  **Comparative Analysis**: Evaluate the pros/cons and risks of each option.
4.  **Recommendation**: Select the best course of action and justify it.
5.  **Implementation Plan**: High-level steps to execute the recommendation.`;

    return this.ask(prompt);
  }

  async analyzeResume(resumeText: string): Promise<AIResponse> {
    const prompt = `Perform a professional recruitment analysis of the following resume:

RESUME TEXT:
"${resumeText.substring(0, 5000)}"

Please provide a detailed report including:
1.  **Executive Profile**: A professional summary of the candidate's level and expertise.
2.  **Core Competencies**: A bulleted list of technical and soft skills identified.
3.  **Achievement Analysis**: meaningful impact extracted from their experience (quantifiable results preferred).
4.  **Constructive Critique**: Specific, actionable advice to improve the resume (formatting, phrasing, missing keywords).
5.  **Career Trajectory**: Suggested next roles or industries based on their background.
6.  **Screening Questions**: 3 targeted interview questions to validate their claimed expertise.`;

    return this.ask(prompt);
  }

  async generateJobDescription(role: string, companyContext?: string): Promise<AIResponse> {
    const prompt = `Draft a premium job description for the position of "${role}"${companyContext ? ` at ${companyContext}` : ''}.

The description should be inclusive, engaging, and professional. Structure it as follows:
1.  **Role Overview**: An inspiring introduction to the opportunity.
2.  **The Mission**: What the candidate will achieve in this role (Objectives).
3.  **Key Responsibilities**: Clear, action-oriented bullet points.
4.  **Qualifications**:
    *   *Must-Have*: Essential skills and experiences.
    *   *Nice-to-Have*: Desirable extra qualifications.
5.  **Why Join Us?**: Selling points (culture, growth, impact).
6.  **Call to Action**: A professional closing encouraging application.`;

    return this.ask(prompt);
  }

  async generateInterviewQuestions(role: string, skillLevel: string = 'Intermediate', focusAreas: string[] = []): Promise<AIResponse> {
    const prompt = `Design a structured interview guide for a ${skillLevel} ${role} position.
${focusAreas.length > 0 ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

Please provide:
1.  **Technical Assessment (3 Questions)**: Deep-dive questions to test core hard skills.
2.  **Behavioral/Situational (2 Questions)**: STAR-method aligned questions to assess soft skills and culture fit.
3.  **Problem-Solving Challenge (1 Scenario)**: A scenario or short case study to evaluate critical thinking.
4.  **Evaluation Criteria**: For each question, briefly describe what differentiates a "good" answer from a "great" answer.`;

    return this.ask(prompt);
  }

  async getSalaryInsights(role: string, location: string, experienceLevel: string, companyType?: string): Promise<AIResponse> {
    const prompt = `Act as a Compensation Analyst. Provide data-driven salary insights.

ROLE: ${role}
LOCATION: ${location}
LEVEL: ${experienceLevel}
${companyType ? `TYPE: ${companyType}` : ''}

Based on general market knowledge up to 2024/2025, provide:

1. **Estimated Salary Range**: A realistic Base Salary range with min, max, and median values in the appropriate currency.
2. **Market Trends**: What is happening in the market for this specific role? (e.g., "AI Engineers seeing 20% premiums", "Remote work impact", "High demand sectors").
3. **Negotiation Levers**: What else can be negotiated for this specific role type? (e.g., Equity, Sign-on bonus, Remote flexibility, Professional development budget).
4. **Cost of Living Factor**: Context on how the location affects this range.

Be conservative and realistic. Format your response as:

**Estimated Base Salary**
Min: $XXX,XXX
Max: $XXX,XXX
Median: $XXX,XXX

**Market Trends**
- [Trend 1]
- [Trend 2]
- [Trend 3]

**Negotiation Levers**
- [Lever 1]
- [Lever 2]
- [Lever 3]

**Cost of Living Factor**
[Brief explanation]`;

    return this.ask(prompt);
  }

  async analyzeSkillGap(currentSkills: string[], targetRole: string, targetJobDescription?: string): Promise<AIResponse> {
    const prompt = `You are a Senior Technical Career Coach. Analyze the skill gap for a candidate.

CURRENT SKILLS: ${currentSkills.join(', ')}
TARGET ROLE: ${targetRole}
${targetJobDescription ? `JOB DESCRIPTION: ${targetJobDescription}` : ''}

Provide a structured analysis with:

**Analysis Summary**
[Brief summary of readiness]

**Readiness Score**
[Score out of 100]

**Skill Gaps**
For each missing skill:
- Skill: [Name]
- Importance: [Critical/High/Medium]
- Gap Description: [Why this matters]
- Recommended Resources:
  * [Type]: [Title] - [Estimated Time]

**Project Idea**
[A practical project to build these skills]`;

    return this.ask(prompt);
  }

  async generateProjectIdeas(skill: string, difficulty: string): Promise<AIResponse> {
    const prompt = `Generate 3 unique project ideas for learning ${skill} at ${difficulty} level.

For EACH project, use this EXACT format:

1. **Title**: [Project Name]
**Description**: [2-3 sentences about the project]
**MVP Features**:
- Feature 1
- Feature 2
- Feature 3
- Feature 4
- Feature 5
**Bonus Challenges**:
- Challenge 1
- Challenge 2
- Challenge 3
**Tech Stack**:
- Technology 1
- Technology 2
- Technology 3
- Technology 4
**Estimated Time**: [X hours]

2. **Title**: [Project Name]
[Continue same format]

3. **Title**: [Project Name]
[Continue same format]

Make projects practical, modern, and portfolio-worthy. STRICTLY follow this format.`;

    return this.ask(prompt);
  }

  async getCareerGuidance(currentRole: string, goals: string, experience: string): Promise<AIResponse> {
    const prompt = `You are an Executive Career Coach. Provide strategic career guidance.

CURRENT ROLE: ${currentRole}
CAREER GOALS: ${goals}
EXPERIENCE: ${experience}

Provide comprehensive guidance covering:

1. **Career Path Analysis**: Evaluate the feasibility and timeline for achieving stated goals.
2. **Strategic Recommendations**: 3-5 specific, actionable steps to take in the next 6-12 months.
3. **Skill Development Priorities**: Key competencies to develop or strengthen.
4. **Networking Strategy**: How to build relationships in target industry/role.
5. **Potential Obstacles**: Common challenges and how to overcome them.
6. **Success Metrics**: How to measure progress toward goals.

Be strategic, realistic, and actionable.`;

    return this.ask(prompt);
  }

  async parseResume(resumeText: string): Promise<AIResponse> {
    const prompt = `Extract structured information from this resume:

${resumeText.substring(0, 8000)}

Provide a JSON-formatted extraction with:

**Contact Information**
- Name: [Full name]
- Email: [Email]
- Phone: [Phone]
- Location: [City, State/Country]
- LinkedIn: [URL if present]

**Professional Summary**
[Extract or synthesize 2-3 sentence summary]

**Skills**
- Technical: [List]
- Soft Skills: [List]

**Experience**
For each position:
- Company: [Name]
- Title: [Job title]
- Duration: [Start - End]
- Key Achievements: [Bullet points]

**Education**
- Degree: [Degree type]
- Institution: [School name]
- Year: [Graduation year]

**Certifications**
[List any certifications]

**Overall Assessment**
- Seniority Level: [Junior/Mid/Senior/Staff]
- Primary Domain: [Industry/Field]
- Years of Experience: [Estimate]`;

    return this.ask(prompt);
  }

  // --- NEW COMMUNITY FEATURES ---

  async enhancePostDraft(draft: string, type: string): Promise<AIResponse> {
    const prompt = `Refine the following draft for a professional community post (Type: ${type}):

DRAFT CONTENT:
"${draft}"

Your task:
1.  **Polish the Prose**: Improve flow, clarity, and impact without losing the author's voice.
2.  **Enhance Professionalism**: Ensure the tone is suitable for a business network.
3.  **Engagement Optimization**: Suggest a compelling headline/hook and a strong call-to-action (question or prompt).
4.  **Hashtag Strategy**: Recommend 3-5 relevant, high-visibility hashtags.

Return the "Optimized Version" followed by your specific "Strategic Suggestions".`;

    return this.ask(prompt);
  }

  async suggestComment(postContent: string, userRole: string): Promise<AIResponse> {
    const prompt = `Generate 3 distinct, professional comment options for this post, written from the perspective of a ${userRole}:

POST CONTEXT:
"${postContent.substring(0, 1000)}"

Options to provide:
1.  **The Insightful Add**: Validates the post and adds a new perspective or data point.
2.  **The Engaging Question**: Asks a thoughtful follow-up to stimulate discussion.
3.  **The Appreciative Networker**: Expresses gratitude and highlights a specific takeaway.

Ensure all comments are polite, constructive, and add value to the conversation.`;

    return this.ask(prompt);
  }

  // --- NEW PRODUCTIVITY FEATURES ---

  async summarizeText(text: string): Promise<AIResponse> {
    const prompt = `Summarize the following text efficiently:

TEXT TO SUMMARIZE:
"${text.substring(0, 10000)}"

Please provide:
1.  **Executive Summary**: A 1-2 sentence high-level overview.
2.  **Key Points**: 3-5 bullet points covering the most important information.
3.  **Action Items**: If applicable, any tasks or steps implied.
4.  **Sentiment**: Brief note on the tone (Positive/Neutral/Negative/Urgent).`;

    return this.ask(prompt);
  }

  async generateEmailDraft(topic: string, recipient: string, tone: string = 'professional'): Promise<AIResponse> {
    const prompt = `Draft a ${tone} email to ${recipient} about: "${topic}".

Please provide:
1.  **Subject Lines**: 3 options (Direct, Engaging, Urgent).
2.  **Email Body**: A well-structured draft with placeholders for specifics [like this].
3.  **Closing**: A professional sign-off.

Ensure the email is clear, concise, and effective.`;

    return this.ask(prompt);
  }

  async generateMeetingNotes(transcript: string): Promise<AIResponse> {
    const prompt = `Organize the following meeting notes/transcript into a structured summary:

TRANSCRIPT/NOTES:
"${transcript.substring(0, 8000)}"

Please output:
1.  **Meeting Goal**: What was the primary purpose?
2.  **Key Decisions**: What was agreed upon?
3.  **Action Items**: Who needs to do what? (Format: [Owner] - [Task])
4.  **Open Questions**: What is still unresolved?
5.  **Next Steps**: Immediate follow-ups required.`;

    return this.ask(prompt);
  }

  clearHistory(userId?: string): void {
    if (userId) {
      this.conversationHistory.delete(userId);
    } else {
      this.conversationHistory.clear();
    }
  }

  getConversationHistory(userId: string): ConversationContext | undefined {
    return this.conversationHistory.get(userId);
  }
}

export const createAIAssistant = (apiKey?: string) => {
  const key = apiKey || process.env.GOOGLE_GENAI_API_KEY;
  if (!key) {
    console.warn('Google AI API key is missing. AI features will fail.');
    throw new Error('Google AI API key is required');
  }
  return new UniversalAIAssistant(key);
};

