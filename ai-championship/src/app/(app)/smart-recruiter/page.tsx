'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Brain, FileText, Target, Sparkles, Volume2, TrendingUp, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SmartRecruiterPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast({ variant: 'destructive', title: 'Missing Resume', description: 'Please paste a resume to analyze.' });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      // We will create a new API route for this consolidated analysis or use the existing one enhanced
      // For now, let's assume we use the new consolidated logic we just built
      const response = await fetch('/api/ai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'analyze_candidate_comprehensive',
          data: { resumeText, jobDescription } 
        })
      });

      const data = await response.json();
      if(data.success) {
          setAnalysis(data.data);
      } else {
          throw new Error(data.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not process the resume.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sampleResume = `John Smith - Senior Software Engineer
  ... (Full resume content) ...`;

  return (
    <div className="flex-1 space-y-6 py-6">
      <PageHeader
        title="Smart Recruiter AI 2.0"
        description="Advanced Candidate Analysis & Career Intelligence"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Candidate Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Resume</label>
                <Textarea
                  placeholder="Paste resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target Job Description (Optional)</label>
                <Textarea
                  placeholder="Paste JD for Fit Score..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run Smart Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          {!analysis ? (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-slate-50 text-slate-400">
                <Brain className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Ready to Analyze</p>
                <p className="text-sm">Paste a resume to see ATS scores, Career paths, and Job Fit.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Top Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">ATS Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-green-700">{analysis.atsScore}%</div>
                            <p className="text-xs text-green-600 mt-1">Optimization Level</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800">Job Fit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-700">{analysis.fitScore || 'N/A'}%</div>
                            <p className="text-xs text-blue-600 mt-1">{analysis.fitReason || 'Based on provided JD'}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Career Advisor */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <TrendingUp className="h-5 w-5" />
                            Career Path Advisor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline" className="text-base px-3 py-1">Current Role</Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Badge className="text-base px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200">{analysis.nextRole}</Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Recommended Skills to Learn:</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.skillsToLearn?.map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Improvements */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Resume Enhancements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium mb-2">Missing Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.missingKeywords?.map((kw: string, i: number) => (
                                    <Badge key={i} variant="outline" className="border-amber-200 text-amber-800 bg-amber-50">{kw}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                            <strong>AI Suggestion:</strong> {analysis.suggestions?.[0]}
                        </div>
                    </CardContent>
                </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
