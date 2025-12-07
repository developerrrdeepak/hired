'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Trophy, Code, Sparkles, CheckCircle2, Zap, Rocket, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HackathonDemoPage() {
  const [ideaTopic, setIdeaTopic] = useState('');
  const [generatedIdea, setGeneratedIdea] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  const handleGenerateIdea = async () => {
    if (!ideaTopic.trim()) {
        toast({ variant: 'destructive', title: 'Input Required', description: 'Enter a topic first.'});
        return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_hackathon_idea',
          data: { topic: ideaTopic, difficulty: 'Intermediate' }
        })
      });
      const json = await res.json();
      if (json.success) setGeneratedIdea(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeReview = async () => {
    if (!codeSnippet.trim()) return;
    setIsReviewing(true);
    try {
      const res = await fetch('/api/ai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_code_submission',
          data: { code: codeSnippet, language: 'JavaScript' }
        })
      });
      const json = await res.json();
      if (json.success) setReviewResult(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 py-8 container max-w-6xl mx-auto">
      <PageHeader
        title="AI Hackathon Suite"
        description="Generate challenges and auto-grade submissions with Gemini AI."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Generator Section */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-purple-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-5 h-5" />
                Challenge Generator
              </CardTitle>
              <CardDescription>Create unique hackathon problem statements instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic / Theme</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. Fintech, Green Energy, AI Agents..." 
                    value={ideaTopic}
                    onChange={(e) => setIdeaTopic(e.target.value)}
                  />
                  <Button onClick={handleGenerateIdea} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-700">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {generatedIdea && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-bold text-lg mb-2 text-purple-900">{generatedIdea.title}</h3>
                  <p className="text-sm text-purple-800 mb-3">{generatedIdea.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {generatedIdea.techStack?.map((t: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-white">{t}</Badge>
                    ))}
                  </div>
                  <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                    {generatedIdea.tasks?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grader Section */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-emerald-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Code className="w-5 h-5" />
                AI Auto-Grader
              </CardTitle>
              <CardDescription>Instant feedback on code submissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="// Paste candidate submission code here..." 
                className="font-mono text-sm h-40 bg-slate-50"
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
              />
              <Button onClick={handleCodeReview} disabled={isReviewing} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {isReviewing ? "Grading..." : "Submit for Review"}
              </Button>

              {reviewResult && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100 animate-in fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-emerald-900">Score</span>
                    <Badge variant={reviewResult.score > 70 ? "default" : "destructive"} className="text-lg px-3">
                      {reviewResult.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-emerald-800 italic">"{reviewResult.feedback}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
