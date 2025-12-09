'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Code, Zap, Trophy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  title: string;
  description: string;
  mvpFeatures: string[];
  bonusChallenges: string[];
  techStack: string[];
  estimatedHours: number;
}

export default function AILearningHubPage() {
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const skills = ['React', 'Node.js', 'Python', 'TypeScript', 'Next.js', 'Machine Learning', 'DevOps', 'Mobile Development'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const generateProjects = async () => {
    if (!skill || !difficulty) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select skill and difficulty' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/project-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, difficulty }),
      });

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate projects' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Learning Hub"
        description="Get AI-generated project ideas with MVP features and bonus challenges"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Project Ideas
          </CardTitle>
          <CardDescription>Select your skill and difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={skill} onValueChange={setSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select Skill" />
              </SelectTrigger>
              <SelectContent>
                {skills.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button onClick={generateProjects} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate Ideas
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 mt-6">
        {projects.map((project, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="mt-2">{project.description}</CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {project.estimatedHours}h
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  MVP Features
                </h4>
                <ul className="space-y-1">
                  {project.mvpFeatures.map((feature, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Bonus Challenges
                </h4>
                <ul className="space-y-1">
                  {project.bonusChallenges.map((challenge, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-1">★</span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <Badge key={i} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
