'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { aiReferenceCheck } from '@/ai/flows/ai-reference-check';

export default function ReferenceCheckPage() {
  const [candidateName, setCandidateName] = useState('');
  const [notes, setNotes] = useState([{ refereeName: '', refereeTitle: '', relationship: '', notes: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const addNote = () => {
    setNotes([...notes, { refereeName: '', refereeTitle: '', relationship: '', notes: '' }]);
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const updateNote = (index: number, field: string, value: string) => {
    const newNotes = [...notes];
    newNotes[index] = { ...newNotes[index], [field]: value };
    setNotes(newNotes);
  };

  const handleAnalyze = async () => {
    if (!candidateName) {
        toast({ title: "Error", description: "Candidate name is required", variant: "destructive" });
        return;
    }
    setLoading(true);
    try {
      const response = await aiReferenceCheck({
        candidateName,
        referenceNotes: notes
      });
      setResult(response);
    } catch (error) {
      toast({ title: "Error", description: "Failed to analyze references.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Reference Check Analyzer</h1>
        <p className="text-muted-foreground">Detect patterns and red flags across multiple reference calls.</p>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Candidate Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Candidate Name</Label>
                    <Input id="name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="e.g. John Doe" />
                </div>
            </CardContent>
        </Card>

        {notes.map((note, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Reference #{index + 1}</CardTitle>
              {notes.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeNote(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Referee Name</Label>
                  <Input value={note.refereeName} onChange={(e) => updateNote(index, 'refereeName', e.target.value)} placeholder="Jane Smith" />
                </div>
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={note.refereeTitle} onChange={(e) => updateNote(index, 'refereeTitle', e.target.value)} placeholder="VP of Engineering" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input value={note.relationship} onChange={(e) => updateNote(index, 'relationship', e.target.value)} placeholder="Former Manager" />
              </div>
              <div className="space-y-2">
                <Label>Notes/Transcript</Label>
                <Textarea 
                    value={note.notes} 
                    onChange={(e) => updateNote(index, 'notes', e.target.value)} 
                    placeholder="Paste notes from the call here..." 
                    className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between">
            <Button variant="outline" onClick={addNote}>
                <Plus className="mr-2 h-4 w-4" /> Add Another Reference
            </Button>
            <Button onClick={handleAnalyze} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze References
            </Button>
        </div>

        {result && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center justify-between">
                            Analysis Result
                            <span className={`text-sm px-3 py-1 rounded-full border ${
                                result.hiringRecommendation === 'Strong Hire' ? 'bg-green-100 text-green-700 border-green-200' :
                                result.hiringRecommendation === 'Do Not Hire' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                                {result.hiringRecommendation}
                            </span>
                        </CardTitle>
                        <CardDescription>Reliability Score: {result.overallReliabilityScore}/100</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Management Advice</h3>
                            <p className="text-muted-foreground bg-white/50 p-4 rounded-lg">{result.managementAdvice}</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2 text-green-700">Consistent Strengths</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {result.consistentStrengths.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 text-red-700">Flagged Concerns</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {result.flaggedConcerns.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                    {result.flaggedConcerns.length === 0 && <li className="text-muted-foreground italic">No major concerns flagged.</li>}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
