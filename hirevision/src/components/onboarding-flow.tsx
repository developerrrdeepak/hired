'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Rocket, Briefcase, Users, Sparkles } from 'lucide-react';

const steps = [
  {
    title: 'Welcome to HireVision',
    description: 'AI-powered recruitment platform for modern teams',
    icon: Rocket,
  },
  {
    title: 'Post Your First Job',
    description: 'Create job listings and attract top talent',
    icon: Briefcase,
  },
  {
    title: 'Find Candidates',
    description: 'Browse our talent pool and shortlist candidates',
    icon: Users,
  },
  {
    title: 'AI-Powered Matching',
    description: 'Let AI find the best candidates for your roles',
    icon: Sparkles,
  },
];

export function OnboardingFlow({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onComplete()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{currentStep.title}</DialogTitle>
          <DialogDescription className="text-center">{currentStep.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Progress value={((step + 1) / steps.length) * 100} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {steps.length}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {step < steps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


