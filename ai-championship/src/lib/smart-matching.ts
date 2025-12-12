// Enhanced AI-Powered Candidate-Job Matching Algorithm

interface Candidate {
  id: string;
  skills: string[];
  yearsOfExperience: number;
  location?: string;
  currentRole?: string;
  education?: string;
  certifications?: string[];
  salaryExpectation?: number;
  preferredWorkType?: 'remote' | 'hybrid' | 'onsite';
}

interface Job {
  id: string;
  title: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minExperience: number;
  maxExperience?: number;
  location?: string;
  isRemote: boolean;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  department?: string;
}

interface MatchResult {
  candidateId: string;
  jobId: string;
  overallScore: number;
  breakdown: {
    skillMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    cultureFit: number;
  };
  strengths: string[];
  gaps: string[];
  recommendation: 'strong' | 'good' | 'moderate' | 'weak';
}

export class SmartMatcher {
  private skillSynonyms: Map<string, string[]> = new Map([
    ['javascript', ['js', 'ecmascript', 'node', 'nodejs']],
    ['typescript', ['ts']],
    ['python', ['py']],
    ['react', ['reactjs', 'react.js']],
    ['angular', ['angularjs']],
    ['vue', ['vuejs', 'vue.js']],
    ['aws', ['amazon web services', 'amazon aws']],
    ['gcp', ['google cloud', 'google cloud platform']],
    ['azure', ['microsoft azure']],
    ['docker', ['containerization']],
    ['kubernetes', ['k8s']],
    ['ci/cd', ['continuous integration', 'continuous deployment']],
  ]);

  private normalizeSkill(skill: string): string {
    const normalized = skill.toLowerCase().trim();
    for (const [key, synonyms] of this.skillSynonyms) {
      if (synonyms.includes(normalized) || key === normalized) {
        return key;
      }
    }
    return normalized;
  }

  private calculateSkillMatch(candidate: Candidate, job: Job): { score: number; matched: string[]; missing: string[] } {
    const candidateSkills = new Set(candidate.skills.map(s => this.normalizeSkill(s)));
    const requiredSkills = job.requiredSkills.map(s => this.normalizeSkill(s));
    const preferredSkills = (job.preferredSkills || []).map(s => this.normalizeSkill(s));

    const matchedRequired = requiredSkills.filter(skill => candidateSkills.has(skill));
    const matchedPreferred = preferredSkills.filter(skill => candidateSkills.has(skill));
    const missingRequired = requiredSkills.filter(skill => !candidateSkills.has(skill));

    const requiredScore = requiredSkills.length > 0 
      ? (matchedRequired.length / requiredSkills.length) * 70 
      : 70;
    
    const preferredScore = preferredSkills.length > 0 
      ? (matchedPreferred.length / preferredSkills.length) * 30 
      : 30;

    return {
      score: Math.round(requiredScore + preferredScore),
      matched: [...matchedRequired, ...matchedPreferred],
      missing: missingRequired,
    };
  }

  private calculateExperienceMatch(candidate: Candidate, job: Job): number {
    const candidateExp = candidate.yearsOfExperience;
    const minExp = job.minExperience;
    const maxExp = job.maxExperience || minExp + 10;

    if (candidateExp < minExp) {
      const deficit = minExp - candidateExp;
      return Math.max(0, 100 - (deficit * 15));
    }

    if (candidateExp > maxExp) {
      const excess = candidateExp - maxExp;
      return Math.max(70, 100 - (excess * 5));
    }

    return 100;
  }

  private calculateLocationMatch(candidate: Candidate, job: Job): number {
    if (job.isRemote || candidate.preferredWorkType === 'remote') {
      return 100;
    }

    if (!candidate.location || !job.location) {
      return 50;
    }

    const candidateLoc = candidate.location.toLowerCase();
    const jobLoc = job.location.toLowerCase();

    if (candidateLoc === jobLoc) {
      return 100;
    }

    if (candidateLoc.includes(jobLoc) || jobLoc.includes(candidateLoc)) {
      return 80;
    }

    const candidateState = candidateLoc.split(',').pop()?.trim();
    const jobState = jobLoc.split(',').pop()?.trim();
    
    if (candidateState === jobState) {
      return 60;
    }

    return 30;
  }

  private calculateSalaryMatch(candidate: Candidate, job: Job): number {
    if (!candidate.salaryExpectation || !job.salaryRangeMin || !job.salaryRangeMax) {
      return 75;
    }

    const expectation = candidate.salaryExpectation;
    const min = job.salaryRangeMin;
    const max = job.salaryRangeMax;

    if (expectation >= min && expectation <= max) {
      return 100;
    }

    if (expectation < min) {
      const diff = ((min - expectation) / min) * 100;
      return Math.max(50, 100 - diff);
    }

    if (expectation > max) {
      const diff = ((expectation - max) / max) * 100;
      return Math.max(30, 100 - (diff * 2));
    }

    return 75;
  }

  private calculateCultureFit(candidate: Candidate, job: Job): number {
    let score = 70;

    if (candidate.preferredWorkType === 'remote' && job.isRemote) {
      score += 15;
    } else if (candidate.preferredWorkType === 'onsite' && !job.isRemote) {
      score += 15;
    } else if (candidate.preferredWorkType === 'hybrid') {
      score += 10;
    }

    if (candidate.currentRole && job.title) {
      const roleMatch = candidate.currentRole.toLowerCase().includes(job.title.toLowerCase()) ||
                       job.title.toLowerCase().includes(candidate.currentRole.toLowerCase());
      if (roleMatch) score += 15;
    }

    return Math.min(100, score);
  }

  public matchCandidateToJob(candidate: Candidate, job: Job): MatchResult {
    const skillMatch = this.calculateSkillMatch(candidate, job);
    const experienceMatch = this.calculateExperienceMatch(candidate, job);
    const locationMatch = this.calculateLocationMatch(candidate, job);
    const salaryMatch = this.calculateSalaryMatch(candidate, job);
    const cultureFit = this.calculateCultureFit(candidate, job);

    const weights = {
      skill: 0.40,
      experience: 0.25,
      location: 0.15,
      salary: 0.10,
      culture: 0.10,
    };

    const overallScore = Math.round(
      skillMatch.score * weights.skill +
      experienceMatch * weights.experience +
      locationMatch * weights.location +
      salaryMatch * weights.salary +
      cultureFit * weights.culture
    );

    const strengths: string[] = [];
    const gaps: string[] = [];

    if (skillMatch.score >= 80) strengths.push('Strong skill alignment');
    if (skillMatch.score < 60) gaps.push(`Missing key skills: ${skillMatch.missing.join(', ')}`);
    
    if (experienceMatch >= 90) strengths.push('Perfect experience level');
    if (experienceMatch < 70) gaps.push('Experience level mismatch');
    
    if (locationMatch >= 90) strengths.push('Excellent location match');
    if (locationMatch < 50) gaps.push('Location may require relocation');
    
    if (salaryMatch >= 90) strengths.push('Salary expectations aligned');
    if (salaryMatch < 60) gaps.push('Salary expectations may not align');

    if (cultureFit >= 85) strengths.push('Great culture fit');

    let recommendation: 'strong' | 'good' | 'moderate' | 'weak';
    if (overallScore >= 85) recommendation = 'strong';
    else if (overallScore >= 70) recommendation = 'good';
    else if (overallScore >= 55) recommendation = 'moderate';
    else recommendation = 'weak';

    return {
      candidateId: candidate.id,
      jobId: job.id,
      overallScore,
      breakdown: {
        skillMatch: skillMatch.score,
        experienceMatch,
        locationMatch,
        salaryMatch,
        cultureFit,
      },
      strengths,
      gaps,
      recommendation,
    };
  }

  public matchCandidateToJobs(candidate: Candidate, jobs: Job[]): MatchResult[] {
    return jobs
      .map(job => this.matchCandidateToJob(candidate, job))
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  public matchJobToCandidates(job: Job, candidates: Candidate[]): MatchResult[] {
    return candidates
      .map(candidate => this.matchCandidateToJob(candidate, job))
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  public batchMatch(candidates: Candidate[], jobs: Job[]): Map<string, MatchResult[]> {
    const results = new Map<string, MatchResult[]>();
    
    for (const candidate of candidates) {
      const matches = this.matchCandidateToJobs(candidate, jobs);
      results.set(candidate.id, matches.filter(m => m.overallScore >= 50));
    }
    
    return results;
  }

  public getTopMatches(candidate: Candidate, jobs: Job[], limit = 5): MatchResult[] {
    return this.matchCandidateToJobs(candidate, jobs).slice(0, limit);
  }
}

export const smartMatcher = new SmartMatcher();
