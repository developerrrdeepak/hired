'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Copy, Globe, Linkedin, Github } from 'lucide-react';
import { aiBooleanSearch } from '@/ai/flows/ai-boolean-search';
import { Checkbox } from '@/components/ui/checkbox';

const PLATFORMS = ['LinkedIn', 'Google', 'GitHub', 'StackOverflow'];

export default function SourcingPage() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    requiredSkills: '',
    location: '',
    platforms: ['LinkedIn', 'Google'] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handlePlatformToggle = (platform: string) => {
      setFormData(prev => {
          const newPlatforms = prev.platforms.includes(platform)
              ? prev.platforms.filter(p => p !== platform)
              : [...prev.platforms, platform];
          return { ...prev, platforms: newPlatforms };
      });
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle || !formData.requiredSkills) {
        toast({ title: "Error", description: "Job Title and Skills are required", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      const response = await aiBooleanSearch({
        jobTitle: formData.jobTitle,
        requiredSkills: skillsArray,
        location: formData.location,
        platforms: formData.platforms as any
      });
      setResult(response);
    } catch (error) {
      toast({ title: "Error", description: "Generation failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Search string copied to clipboard." });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Search className="h-8 w-8 text-primary" />
            AI Boolean Builder
        </h1>
        <p className="text-muted-foreground">Generate complex sourcing strings for finding hidden talent.</p>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Search Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input 
                            value={formData.jobTitle} 
                            onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} 
                            placeholder="e.g. Senior Frontend Engineer" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Location (Optional)</Label>
                        <Input 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                            placeholder="e.g. San Francisco or Remote" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Must-Have Skills (comma separated)</Label>
                    <Input 
                        value={formData.requiredSkills} 
                        onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} 
                        placeholder="e.g. React, TypeScript, GraphQL, AWS" 
                    />
                </div>
                
                <div className="space-y-2">
                    <Label className="mb-2 block">Target Platforms</Label>
                    <div className="flex gap-4 flex-wrap">
                        {PLATFORMS.map(p => (
                            <div key={p} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={p} 
                                    checked={formData.platforms.includes(p)}
                                    onCheckedChange={() => handlePlatformToggle(p)}
                                />
                                <label htmlFor={p} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {p}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button className="w-full" onClick={handleGenerate} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Strings
                </Button>
            </CardContent>
        </Card>

        {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-4">
                    {result.searchStrings.map((item: any, i: number) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 py-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    {item.platform === 'LinkedIn' && <Linkedin className="h-4 w-4 text-blue-600" />}
                                    {item.platform === 'GitHub' && <Github className="h-4 w-4" />}
                                    {item.platform === 'Google' && <Globe className="h-4 w-4 text-green-600" />}
                                    {item.platform}
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.query)}>
                                    <Copy className="h-4 w-4 mr-1" /> Copy
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-sm break-all mb-2">
                                    {item.query}
                                </div>
                                <p className="text-xs text-muted-foreground">{item.explanation}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-base">💡 Sourcing Pro-Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            {result.sourcingTips.map((tip: string, idx: number) => (
                                <li key={idx}>{tip}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
