'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, Loader2, Sparkles, Wand2, Mic, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Question {
  text: string
  audio?: string
  sampleAnswer?: string
}

export default function InterviewPrepPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [candidateProfile, setCandidateProfile] = useState('')
  const [questionType, setQuestionType] = useState<'technical' | 'behavioral' | 'mixed'>('mixed')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [generatingAnswerIndex, setGeneratingAnswerIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGeneratePrep = async () => {
    if (!jobDescription.trim() || !candidateProfile.trim()) {
      setError('Please fill in both job description and candidate profile')
      return
    }

    setLoading(true)
    setError(null)
    setQuestions([])

    try {
      const response = await fetch('/api/google-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate 5 high-quality ${questionType} interview questions for this role.
          
          Job Description:
          ${jobDescription}
          
          Candidate Profile:
          ${candidateProfile}
          
          Return only the questions, numbered 1-5.`,
          context: 'interview_assistant'
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      const aiQuestions = data.response
        .split('\n')
        .filter((line: string) => line.trim() && /^\d+\./.test(line.trim()))
        .map((line: string) => ({
          text: line.replace(/^\d+\.\s*/, '').trim()
        }));

      if (aiQuestions.length === 0) {
        throw new Error('No questions generated. Please try again.');
      }

      setQuestions(aiQuestions);
      toast({
        title: 'Interview Prep Ready!',
        description: `Generated ${aiQuestions.length} tailored questions.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate questions. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSampleAnswer = async (index: number, questionText: string) => {
    setGeneratingAnswerIndex(index);
    try {
      const response = await fetch('/api/google-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Provide a concise, ideal "STAR" method answer for this interview question: "${questionText}".
          Keep it professional and tailored to the candidate profile provided earlier if possible.`,
          context: 'interview_assistant'
        })
      });

      const data = await response.json();
      if (data.success) {
        setQuestions(prev => prev.map((q, i) => 
          i === index ? { ...q, sampleAnswer: data.response } : q
        ));
      }
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate answer.' });
    } finally {
      setGeneratingAnswerIndex(null);
    }
  }

  const playQuestionAudio = async (text: string, index: number) => {
    try {
      setPlayingIndex(index);
      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingIndex(null);
        audio.play();
      } else {
        throw new Error('TTS failed');
      }
    } catch (error) {
      console.error(error);
      setPlayingIndex(null);
      toast({ variant: 'destructive', title: 'Audio Error', description: 'Could not play audio.' });
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Interview Coach
        </h1>
        <p className="text-muted-foreground text-lg">
          Master your interview with personalized questions and AI feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-4 border-t-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-500" />
                Setup Interview
              </CardTitle>
              <CardDescription>Customize your practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description</label>
                <Textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste JD here..."
                  className="h-32 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Profile / Resume Summary</label>
                <Textarea
                  value={candidateProfile}
                  onChange={e => setCandidateProfile(e.target.value)}
                  placeholder="Paste your skills/experience..."
                  className="h-32 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Area</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['technical', 'behavioral', 'mixed'] as const).map(type => (
                    <Button
                      key={type}
                      type="button"
                      variant={questionType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuestionType(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGeneratePrep}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Questions Section */}
        <div className="lg:col-span-2">
           {questions.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-slate-50 text-slate-400">
               <Mic className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-center text-lg font-medium">Ready to practice?</p>
               <p className="text-center text-sm">Fill in the details and click generate to start.</p>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    Your Questions <Badge variant="secondary">{questions.length}</Badge>
                  </h2>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setQuestions([])}>
                    Clear Session
                  </Button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <Card key={idx} className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                            {idx + 1}
                          </span>
                          <div className="flex-1 space-y-3">
                            <p className="text-lg font-medium text-slate-800">{q.text}</p>
                            
                            <div className="flex gap-2">
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 onClick={() => playQuestionAudio(q.text, idx)}
                                 disabled={playingIndex === idx}
                               >
                                  {playingIndex === idx ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <PlayCircle className="w-3 h-3 mr-2" />}
                                  Listen
                               </Button>
                               
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                 onClick={() => generateSampleAnswer(idx, q.text)}
                                 disabled={generatingAnswerIndex === idx}
                               >
                                  {generatingAnswerIndex === idx ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                                  Get AI Answer
                               </Button>
                            </div>

                            {q.sampleAnswer && (
                              <div className="mt-4 p-4 bg-slate-50 rounded-lg border text-sm text-slate-700 animate-in fade-in slide-in-from-top-2">
                                <p className="font-semibold mb-1 text-blue-700">💡 Suggested Answer Strategy:</p>
                                <div className="whitespace-pre-wrap">{q.sampleAnswer}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
