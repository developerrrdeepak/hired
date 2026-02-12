
export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  photoUrl?: string;
  role: 'Founder' | 'Recruiter' | 'Hiring Manager' | 'Candidate';
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
  isShortlisted?: boolean;
  profileVisibility?: 'public' | 'private';
  [key: string]: any;
}

export interface Candidate extends User {
  currentRole?: string;
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  skills?: string[];
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }[];
  experience?: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  yearsOfExperience?: number;
  rawResumeText?: string;
  resumeUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: 'open' | 'closed' | 'draft';
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  requiredSkills?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  status: 'Active' | 'Withdrawn';
  fitScore?: number;
  appliedAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  industry?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
    id: string;
    participantIds: string[];
    participants: {
      id: string;
      name: string;
      role: string;
    }[];
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: { [userId: string]: number };
    createdAt: string;
    updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: { [userId: string]: boolean };
}

