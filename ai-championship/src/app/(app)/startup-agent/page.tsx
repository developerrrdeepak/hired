'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Rocket, Users, Target, Presentation, Sparkles, Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StartupAgentPage() {
  const [idea, setIdea] = useState('');
  const [market, setMarket] = useState('');
  const [pitchDeck, setPitchDeck] = useState<any>(null);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  
  const [mySkills, setMySkills] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [cofounderMatches, setCofounderMatches] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const { toast } = useToast();

  const handleGenerateDeck = async () => {
    if (!idea.trim()) return;
    setIsGeneratingDeck(true);
    try {
      const res = await fetch('/api/ai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_pitch_deck',
          data: { idea, market }
        })
      });
      const json = await res.json();
      if(json.success) setPitchDeck(json.data);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate deck.' });
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const handleFindCoFounder = async () => {
    if (!mySkills.trim()) return;
    setIsMatching(true);
    try {
      const res = await fetch('/api/ai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'match_cofounder',
          data: { 
            profile: { skills: mySkills.split(',') }, 
            ideal: lookingFor 
          }
        })
      });
      const json = await res.json();
      if(json.success) setCofounderMatches(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 py-8 container max-w-7xl mx-auto">
      <PageHeader
        title="AI Startup Architect"
        description="Build your dream company with AI-powered tools."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pitch Deck Generator */}
        <section className="space-y-6">
          <Card className="border-t-4 border-t-orange-500 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Presentation className="w-6 h-6" />
                Pitch Deck Generator
              </CardTitle>
              <CardDescription>Turn your napkin idea into an investor-ready presentation structure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Your Startup Idea</label>
                <Textarea 
                  placeholder="e.g. Uber for dog walking..." 
                  className="h-24 resize-none"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target Market</label>
                <Input 
                  placeholder="e.g. Urban pet owners in US" 
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleGenerateDeck} 
                disabled={isGeneratingDeck} 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2"
              >
                {isGeneratingDeck ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                Generate Pitch Structure
              </Button>

              {pitchDeck && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="font-bold text-lg border-b pb-2">Deck Outline</h3>
                  <div className="grid gap-3">
                    {pitchDeck.slides?.map((slide: any, i: number) => (
                      <div key={i} className="p-3 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-300 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-orange-800 text-sm">Slide {i+1}: {slide.title}</span>
                            <Badge variant="outline" className="bg-white text-xs">Visual: {slide.visual?.substring(0, 15)}...</Badge>
                        </div>
                        <ul className="list-disc list-inside text-xs text-orange-900 space-y-1 pl-1">
                            {slide.content?.map((point: string, j: number) => <li key={j}>{point}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Co-Founder Matcher */}
        <section className="space-y-6">
          <Card className="border-t-4 border-t-cyan-500 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-600">
                <Users className="w-6 h-6" />
                AI Co-Founder Matcher
              </CardTitle>
              <CardDescription>Find the Steve Wozniak to your Steve Jobs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Your Skills (comma separated)</label>
                <Input 
                  placeholder="Marketing, Sales, Vision..." 
                  value={mySkills}
                  onChange={(e) => setMySkills(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Looking For</label>
                <Textarea 
                  placeholder="Technical lead, MVP builder, AI expert..." 
                  className="h-24 resize-none"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleFindCoFounder} 
                disabled={isMatching} 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2"
              >
                {isMatching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Target className="w-4 h-4 mr-2" />}
                Analyze & Find Matches
              </Button>

              {cofounderMatches.length > 0 && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="font-bold text-lg border-b pb-2">Recommended Personas</h3>
                  <div className="space-y-4">
                    {cofounderMatches.map((match: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 bg-cyan-50 rounded-xl border border-cyan-100 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-cyan-200">
                            <span className="text-xl font-bold text-cyan-600">{match.role?.[0]}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-cyan-900">{match.role}</h4>
                            <p className="text-xs text-cyan-700 mt-1 mb-2 italic">"{match.traits}"</p>
                            <div className="flex flex-wrap gap-1">
                                {match.skills?.map((s: string, k: number) => (
                                    <Badge key={k} variant="secondary" className="bg-white text-cyan-800 text-[10px]">{s}</Badge>
                                ))}
                            </div>
                        </div>
                      </div>
                    ))}
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
