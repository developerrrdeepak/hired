'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit, GraduationCap, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SkillGapPage() {
  const [formData, setFormData] = useState({
    currentSkillsInput: '',
    targetRole: '',
    targetJobDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!formData.currentSkillsInput || !formData.targetRole) {
        toast({ title: "Error", description: "Skills and Target Role are required", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
      const currentSkills = formData.currentSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
      
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skill-gap',
          currentSkills,
          targetRole: formData.targetRole,
          targetJobDescription: formData.targetJobDescription
        })
      });

      const data = await response.json();
      if (data.success) {
        const parsed = parseSkillGapResponse(data.data.answer);
        setResult(parsed);
        toast({ title: "Success", description: "Analysis complete!" });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Analysis failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const parseSkillGapResponse = (text: string) => {
    const result: any = {
      analysisSummary: '',
      readinessScore: 50,
      skillGaps: [],
      projectIdea: ''
    };

    const lines = text.split('\n');
    let section = '';
    let currentGap: any = null;

    for (const line of lines) {
      if (line.includes('Analysis Summary')) section = 'summary';
      else if (line.includes('Readiness Score')) section = 'score';
      else if (line.includes('Skill Gaps')) section = 'gaps';
      else if (line.includes('Project Idea')) section = 'project';
      else if (line.includes('- Skill:')) {
        if (currentGap) result.skillGaps.push(currentGap);
        currentGap = { missingSkill: line.split(':')[1]?.trim() || '', importance: 'Medium', gapDescription: '', recommendedResources: [] };
      } else if (line.includes('- Importance:') && currentGap) {
        currentGap.importance = line.split(':')[1]?.trim() || 'Medium';
      } else if (line.includes('- Gap Description:') && currentGap) {
        currentGap.gapDescription = line.split(':')[1]?.trim() || '';
      } else if (line.match(/^\s*\*/) && currentGap) {
        const match = line.match(/\[(.+?)\]:\s*(.+?)\s*-\s*(.+)/);
        if (match) currentGap.recommendedResources.push({ type: match[1], title: match[2], estimatedTime: match[3] });
      } else if (section === 'summary' && line.trim() && !line.includes('**')) {
        result.analysisSummary += line.trim() + ' ';
      } else if (section === 'score' && line.match(/\d+/)) {
        const score = parseInt(line.match(/\d+/)?.[0] || '50');
        result.readinessScore = Math.min(100, Math.max(0, score));
      } else if (section === 'project' && line.trim() && !line.includes('**')) {
        result.projectIdea += line.trim() + ' ';
      }
    }

    if (currentGap) result.skillGaps.push(currentGap);
    result.analysisSummary = result.analysisSummary.trim() || 'Analysis complete';
    result.projectIdea = result.projectIdea.trim() || 'Build a comprehensive project showcasing these skills';
    
    return result;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Skill Gap Analyzer
        </h1>
        <p className="text-muted-foreground">Identify missing skills and get a personalized learning roadmap.</p>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Career Transition Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Current Skills (comma separated)</Label>
                        <Textarea 
                            value={formData.currentSkillsInput} 
                            onChange={(e) => setFormData({...formData, currentSkillsInput: e.target.value})} 
                            placeholder="e.g. React, Node.js, SQL, Team Leadership..." 
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Target Role</Label>
                            <Input 
                                value={formData.targetRole} 
                                onChange={(e) => setFormData({...formData, targetRole: e.target.value})} 
                                placeholder="e.g. Senior Solutions Architect" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Target Job Description (Optional)</Label>
                            <Textarea 
                                value={formData.targetJobDescription} 
                                onChange={(e) => setFormData({...formData, targetJobDescription: e.target.value})} 
                                placeholder="Paste a specific JD for better accuracy..." 
                                className="h-[84px]"
                            />
                        </div>
                    </div>
                </div>
                <Button className="w-full" onClick={handleAnalyze} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Analyze Gaps
                </Button>
            </CardContent>
        </Card>

        {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                            <CardTitle>Readiness Assessment</CardTitle>
                            <Badge variant={result.readinessScore > 75 ? "default" : result.readinessScore > 50 ? "secondary" : "destructive"} className="text-lg px-3 py-1">
                                {result.readinessScore}% Ready
                            </Badge>
                        </div>
                        <Progress value={result.readinessScore} className="h-2" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{result.analysisSummary}</p>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Identified Gaps & Learning Plan
                    </h2>
                    {result.skillGaps?.map((gap: any, i: number) => (
                        <Card key={i} className="border-l-4 border-l-orange-400">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{gap.missingSkill}</CardTitle>
                                        <CardDescription>{gap.gapDescription}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className={
                                        gap.importance === 'Critical' ? 'text-red-600 border-red-200 bg-red-50' : 
                                        gap.importance === 'High' ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-blue-600'
                                    }>
                                        {gap.importance}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h4 className="text-sm font-semibold mb-2">Recommended Resources:</h4>
                                <ul className="space-y-2">
                                    {gap.recommendedResources?.map((res: any, idx: number) => (
                                        <li key={idx} className="text-sm bg-muted/50 p-2 rounded flex justify-between items-center">
                                            <span>
                                                <span className="font-medium text-primary">{res.type}:</span> {res.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                                                {res.estimatedTime}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            Suggested Portfolio Project
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-medium text-primary/80 mb-2">Build this to prove your skills:</p>
                        <p className="text-muted-foreground leading-relaxed">
                            {result.projectIdea}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
