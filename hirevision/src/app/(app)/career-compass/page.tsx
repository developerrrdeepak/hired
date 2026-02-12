'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Compass, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CareerCompassPage() {
  const [formData, setFormData] = useState({
    currentRole: '',
    goals: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!formData.currentRole || !formData.goals) {
      toast({ title: "Error", description: "Current role and goals are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'career-guidance',
          currentRole: formData.currentRole,
          goals: formData.goals,
          experience: formData.experience
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data.answer);
        toast({ title: "Success", description: "Career guidance generated!" });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate guidance", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Compass className="h-8 w-8 text-blue-600" />
          Career Compass
        </h1>
        <p className="text-muted-foreground">Get personalized AI-powered career guidance</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Career Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <Input 
                value={formData.currentRole} 
                onChange={(e) => setFormData({...formData, currentRole: e.target.value})} 
                placeholder="e.g. Software Engineer" 
              />
            </div>
            <div className="space-y-2">
              <Label>Career Goals</Label>
              <Textarea 
                value={formData.goals} 
                onChange={(e) => setFormData({...formData, goals: e.target.value})} 
                placeholder="What do you want to achieve in your career?" 
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input 
                value={formData.experience} 
                onChange={(e) => setFormData({...formData, experience: e.target.value})} 
                placeholder="e.g. 5 years" 
              />
            </div>
            <Button className="w-full" onClick={handleAnalyze} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Sparkles className="mr-2 h-4 w-4" />
              Get Career Guidance
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Your Personalized Career Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


