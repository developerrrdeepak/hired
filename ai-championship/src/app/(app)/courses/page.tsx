'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Compass, BookOpen, Target, Loader2, Code, Lightbulb, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CoursesPage() {
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skillAnalysis, setSkillAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [projectIdea, setProjectIdea] = useState<any>(null);
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const { toast } = useToast();

  const handleSkillAnalysis = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_skill_gap',
          data: { currentSkills: currentSkills.split(','), targetRole }
        })
      });
      const json = await res.json();
      if(json.success) setSkillAnalysis(json.data);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Analysis failed.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateProject = async () => {
    if (!currentSkills.trim()) return;
    setIsGeneratingProject(true);
    try {
      const res = await fetch('/api/ai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_project_idea',
          data: { skills: currentSkills.split(',') }
        })
      });
      const json = await res.json();
      if(json.success) setProjectIdea(json.data);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate project.' });
    } finally {
      setIsGeneratingProject(false);
    }
  };

  return (
    <div className="space-y-8 py-8 container max-w-7xl mx-auto">
      <PageHeader
        title="AI Learning Hub"
        description="Personalized roadmaps and project-based learning."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Skill Gap Analyzer */}
        <section className="space-y-6">
          <Card className="border-t-4 border-t-indigo-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Compass className="w-6 h-6" />
                Career Compass
              </CardTitle>
              <CardDescription>Find your path from where you are to where you want to be.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Your Skills (comma separated)</label>
                <Input 
                  placeholder="React, CSS, JavaScript..." 
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Dream Role</label>
                <Input 
                  placeholder="Full Stack Developer, AI Engineer..." 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSkillAnalysis} 
                disabled={isAnalyzing} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Map className="w-4 h-4 mr-2" />}
                Generate Roadmap
              </Button>

              {skillAnalysis && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Missing Critical Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {skillAnalysis.missingSkills?.map((s: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-white text-indigo-700">{s}</Badge>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-3 text-lg">Your 8-Week Plan</h4>
                    <div className="space-y-3">
                        {skillAnalysis.roadmap?.slice(0, 4).map((week: any, i: number) => (
                            <div key={i} className="flex gap-4 items-start p-3 bg-white border rounded-lg hover:border-indigo-300 transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                                    W{week.week}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{week.focus}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Resources: {week.resources?.join(', ')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Project Generator */}
        <section className="space-y-6">
          <Card className="border-t-4 border-t-emerald-500 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <Code className="w-6 h-6" />
                Project Idea Generator
              </CardTitle>
              <CardDescription>Don't just watch tutorials. Build something real.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-sm text-emerald-800">
                <p>Based on your skills: <strong>{currentSkills || '...'}</strong></p>
              </div>
              
              <Button 
                onClick={handleGenerateProject} 
                disabled={isGeneratingProject} 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isGeneratingProject ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                Suggest a Portfolio Project
              </Button>

              {projectIdea && (
                <div className="mt-6 p-5 bg-white border-2 border-emerald-100 rounded-xl shadow-sm animate-in fade-in zoom-in-95">
                  <h3 className="text-xl font-bold text-emerald-900 mb-1">{projectIdea.title}</h3>
                  <p className="text-sm text-emerald-600 mb-4 font-medium italic">{projectIdea.problem}</p>
                  
                  <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-bold uppercase text-muted-foreground mb-2">MVP Features</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {projectIdea.mvp?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold uppercase text-muted-foreground mb-2">Bonus Challenge</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-purple-600">
                            {projectIdea.bonus?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                        </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
