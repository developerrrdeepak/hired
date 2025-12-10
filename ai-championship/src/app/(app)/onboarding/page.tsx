'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Calendar, BookOpen, Users } from 'lucide-react';
import { aiOnboardingPlan } from '@/ai/flows/ai-onboarding-plan';

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    candidateName: '',
    jobTitle: '',
    startDate: '',
    jobDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!formData.candidateName || !formData.jobTitle || !formData.jobDescription) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
      const response = await aiOnboardingPlan(formData);
      setPlan(response);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate onboarding plan.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Onboarding Generator</h1>
        <p className="text-muted-foreground">Create a personalized 30-60-90 day success plan in seconds.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>New Hire Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                            value={formData.candidateName} 
                            onChange={(e) => setFormData({...formData, candidateName: e.target.value})} 
                            placeholder="e.g. Alex Johnson" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input 
                            value={formData.jobTitle} 
                            onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} 
                            placeholder="e.g. Product Designer" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input 
                            type="date"
                            value={formData.startDate} 
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Job Description / Key Responsibilities</Label>
                        <Textarea 
                            value={formData.jobDescription} 
                            onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} 
                            placeholder="Paste the JD here to tailor the plan..." 
                            className="min-h-[200px]"
                        />
                    </div>
                    <Button className="w-full" onClick={handleGenerate} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                        Generate Plan
                    </Button>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            {!plan ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                    <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Ready to Launch?</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Enter the new hire's details on the left to generate a comprehensive onboarding roadmap.
                    </p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Welcome Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="italic text-muted-foreground">"{plan.welcomeMessage}"</p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        {plan.roadmap.map((phase: any, i: number) => (
                            <Card key={i}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {i === 0 ? '30' : i === 1 ? '60' : '90'}
                                        </div>
                                        <CardTitle className="text-lg">{phase.phaseName}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Key Goals
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                                            {phase.goals.map((g: string, idx: number) => <li key={idx}>{g}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Action Items</h4>
                                        <ul className="list-check pl-2 text-sm space-y-1">
                                            {phase.tasks.map((t: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                                                    {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-muted p-3 rounded text-sm">
                                        <span className="font-semibold">Success Metric: </span>
                                        {phase.successMetrics}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" /> Recommended Reading
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {plan.recommendedReading.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Key Stakeholders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {plan.keyStakeholders.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
