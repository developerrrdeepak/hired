'use client';

import type { Job } from './definitions';

export interface CandidateProfile {
  skills?: string[];
  location?: string;
  yearsOfExperience?: number;
  preferredLocation?: 'Remote' | 'Hybrid' | 'Onsite';
}

export interface JobMatch extends Job {
  matchScore: number;
  matchReasons: string[];
}

/**
 * Calculate match score between candidate profile and job
 * Returns score from 0-100
 */
export function calculateJobMatch(
  candidateProfile: CandidateProfile,
  job: Job
): JobMatch {
  let score = 0;
  const matchReasons: string[] = [];
  const maxScore = 100;

  // Skills match (40 points max)
  if (candidateProfile.skills && candidateProfile.skills.length > 0 && job.requiredSkills) {
    const candidateSkillsLower = candidateProfile.skills.map(s => s.toLowerCase());
    const jobSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
    
    const matchingSkills = candidateSkillsLower.filter(skill =>
      jobSkillsLower.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
    );
    
    const skillMatchPercentage = matchingSkills.length / jobSkillsLower.length;
    const skillScore = Math.round(skillMatchPercentage * 40);
    score += skillScore;
    
    if (matchingSkills.length > 0) {
      matchReasons.push(`${matchingSkills.length} matching skills`);
    }
  }

  // Location match (30 points max)
  if (job.isRemote) {
    score += 30;
    matchReasons.push('Remote position');
  } else if (candidateProfile.location && job.locationCity) {
    const candidateLocationLower = candidateProfile.location.toLowerCase();
    const jobLocationLower = `${job.locationCity}, ${job.locationCountry}`.toLowerCase();
    
    if (candidateLocationLower.includes(job.locationCity.toLowerCase()) ||
        jobLocationLower.includes(candidateProfile.location.toLowerCase())) {
      score += 30;
      matchReasons.push('Location match');
    } else {
      score += 10; // Partial points for different location
    }
  }

  // Experience match (30 points max)
  if (candidateProfile.yearsOfExperience !== undefined) {
    const candidateExp = candidateProfile.yearsOfExperience;
    const minExp = job.minimumExperience || 0;
    const maxExp = job.maximumExperience || 100;
    
    if (candidateExp >= minExp && candidateExp <= maxExp) {
      score += 30;
      matchReasons.push('Experience level match');
    } else if (candidateExp >= minExp - 1 && candidateExp <= maxExp + 2) {
      score += 20; // Close to required experience
      matchReasons.push('Close experience match');
    } else if (candidateExp >= minExp) {
      score += 15; // More experience than required
      matchReasons.push('Exceeds experience requirement');
    } else {
      score += 5; // Less experience but still considered
    }
  }

  // Normalize score to 0-100
  const finalScore = Math.min(Math.round(score), maxScore);

  return {
    ...job,
    matchScore: finalScore,
    matchReasons,
  };
}

/**
 * Get recommended jobs for a candidate
 * Filters and sorts jobs by match score
 */
export function getRecommendedJobs(
  candidateProfile: CandidateProfile,
  allJobs: Job[],
  minScore: number = 30
): JobMatch[] {
  // Calculate match scores for all jobs
  const jobsWithScores = allJobs
    .filter(job => job.status === 'open') // Only open jobs
    .map(job => calculateJobMatch(candidateProfile, job))
    .filter(job => job.matchScore >= minScore) // Filter by minimum score
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending

  return jobsWithScores;
}

/**
 * Get match score color based on score value
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

/**
 * Get match score label
 */
export function getMatchScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  return 'Potential Match';
}
