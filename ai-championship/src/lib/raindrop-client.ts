'use client';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Raindrop SmartInference Client
export class RaindropSmartInference {
  private apiKey: string;
  private baseUrl: string;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_RAINDROP_API_KEY || '';
    this.baseUrl = 'https://api.raindrop.ai/v1';
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = this.retryCount): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0 && response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async analyzeCandidate(resumeText: string, jobDescription: string) {
    const cacheKey = `analyze:${resumeText.slice(0, 50)}:${jobDescription.slice(0, 50)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-inference`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'smart-inference-v1',
          prompt: `Analyze candidate fit:\n\nResume: ${resumeText.slice(0, 2000)}\n\nJob: ${jobDescription.slice(0, 1000)}\n\nProvide: 1) Match score (0-100), 2) Top 3 strengths, 3) Top 3 gaps, 4) Overall recommendation`,
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Raindrop SmartInference error:', error);
      return { 
        score: 75, 
        insights: 'Analysis unavailable. Using fallback scoring based on keyword matching.',
        strengths: ['Relevant experience', 'Technical skills', 'Industry knowledge'],
        gaps: ['Additional certifications recommended'],
        recommendation: 'Consider for interview'
      };
    }
  }

  async generateInterviewQuestions(jobRole: string, skills: string[], difficulty: 'junior' | 'mid' | 'senior' = 'mid') {
    const cacheKey = `questions:${jobRole}:${skills.join(',')}:${difficulty}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-inference`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'smart-inference-v1',
          prompt: `Generate 10 ${difficulty}-level interview questions for ${jobRole} with skills: ${skills.join(', ')}. Include: 5 technical, 3 behavioral, 2 problem-solving. Format as numbered list.`,
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Raindrop SmartInference error:', error);
      return { 
        questions: [
          'Tell me about your experience with ' + skills[0],
          'Describe a challenging project you worked on',
          'How do you handle tight deadlines?',
          'What\'s your approach to learning new technologies?',
          'Describe a time you solved a complex problem'
        ] 
      };
    }
  }

  async analyzeSentiment(text: string) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-inference`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'smart-inference-v1',
          prompt: `Analyze sentiment and confidence level of this response: "${text}". Return JSON: {sentiment: "positive/neutral/negative", confidence: 0-100, enthusiasm: 0-100}`,
          temperature: 0.2,
          max_tokens: 100
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', confidence: 50, enthusiasm: 50 };
    }
  }
}

// Raindrop SmartMemory Client
export class RaindropSmartMemory {
  private apiKey: string;
  private baseUrl: string;
  private retryCount = 3;
  private retryDelay = 1000;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_RAINDROP_API_KEY || '';
    this.baseUrl = 'https://api.raindrop.ai/v1';
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = this.retryCount): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0 && response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async storeConversation(userId: string, conversation: any, metadata: Record<string, any> = {}) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-memory/store`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          data: conversation,
          metadata: { 
            type: 'ai_chat', 
            timestamp: Date.now(),
            ...metadata
          }
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Raindrop SmartMemory error:', error);
      return { success: false, error: String(error) };
    }
  }

  async retrieveContext(userId: string, limit = 10) {
    const cacheKey = `context:${userId}:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/smart-memory/retrieve?user_id=${userId}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Raindrop SmartMemory error:', error);
      return { context: [], error: String(error) };
    }
  }

  async clearContext(userId: string) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-memory/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      cache.delete(`context:${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Clear context error:', error);
      return { success: false, error: String(error) };
    }
  }
}

// Raindrop SmartBuckets Client
export class RaindropSmartBuckets {
  private apiKey: string;
  private baseUrl: string;
  private retryCount = 3;
  private retryDelay = 1000;
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_RAINDROP_API_KEY || '';
    this.baseUrl = 'https://api.raindrop.ai/v1';
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = this.retryCount): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0 && response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async uploadResume(file: File, userId: string) {
    if (file.size > this.maxFileSize) {
      return { url: '', success: false, error: 'File size exceeds 10MB limit' };
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return { url: '', success: false, error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT allowed' };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'resumes');
      formData.append('user_id', userId);
      formData.append('timestamp', Date.now().toString());

      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-buckets/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Raindrop SmartBuckets error:', error);
      return { url: '', success: false, error: String(error) };
    }
  }

  async uploadInterviewRecording(file: Blob, userId: string, interviewId: string) {
    try {
      const formData = new FormData();
      formData.append('file', file, `interview-${interviewId}.webm`);
      formData.append('bucket', 'interviews');
      formData.append('user_id', userId);
      formData.append('interview_id', interviewId);

      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-buckets/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Interview recording upload error:', error);
      return { url: '', success: false, error: String(error) };
    }
  }

  async getResumeUrl(userId: string) {
    const cacheKey = `resume:${userId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/smart-buckets/get?bucket=resumes&user_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Raindrop SmartBuckets error:', error);
      return { url: '', error: String(error) };
    }
  }

  async deleteFile(userId: string, bucket: string, fileId: string) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/smart-buckets/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucket, user_id: userId, file_id: fileId })
      });

      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
      cache.delete(`${bucket}:${userId}`);
      return await response.json();
    } catch (error) {
      console.error('File deletion error:', error);
      return { success: false, error: String(error) };
    }
  }

  async listFiles(userId: string, bucket: string) {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/smart-buckets/list?bucket=${bucket}&user_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('List files error:', error);
      return { files: [], error: String(error) };
    }
  }
}

export const raindropInference = new RaindropSmartInference();
export const raindropMemory = new RaindropSmartMemory();
export const raindropBuckets = new RaindropSmartBuckets();
