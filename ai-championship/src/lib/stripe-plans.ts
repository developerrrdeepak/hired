export const STRIPE_PLANS = {
  candidate: {
    free: {
      name: 'Free',
      price: 0,
      priceId: null,
      features: [
        'Basic job search',
        'Apply to 5 jobs/month',
        'Basic profile',
        'Community access',
      ],
    },
    pro: {
      name: 'Pro',
      price: 999,
      priceId: process.env.NEXT_PUBLIC_STRIPE_CANDIDATE_PRO_PRICE_ID,
      features: [
        'Unlimited job applications',
        'AI Resume Builder',
        'Interview Prep Tools',
        'Skill Gap Analysis',
        'Salary Insights',
        'Priority support',
      ],
    },
  },
  employer: {
    starter: {
      name: 'Starter',
      price: 4999,
      priceId: process.env.NEXT_PUBLIC_STRIPE_EMPLOYER_STARTER_PRICE_ID,
      features: [
        'Post 5 jobs',
        'Basic candidate search',
        'Email support',
      ],
    },
    growth: {
      name: 'Growth',
      price: 9999,
      priceId: process.env.NEXT_PUBLIC_STRIPE_EMPLOYER_GROWTH_PRICE_ID,
      features: [
        'Post 20 jobs',
        'AI Smart Sourcing',
        'Interview Tools',
        'Analytics Dashboard',
        'Priority support',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 24999,
      priceId: process.env.NEXT_PUBLIC_STRIPE_EMPLOYER_ENTERPRISE_PRICE_ID,
      features: [
        'Unlimited jobs',
        'Full AI Suite',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
      ],
    },
  },
} as const;

export type CandidatePlan = keyof typeof STRIPE_PLANS.candidate;
export type EmployerPlan = keyof typeof STRIPE_PLANS.employer;
