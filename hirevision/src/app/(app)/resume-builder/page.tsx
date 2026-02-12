'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, FileText, Loader2, Download, Check, AlertCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ResumeBuilderPage() {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [resumeData, setResumeData] = useState<any>(null);
    const [step, setStep] = useState(1);
    
    // Form States
    const [targetRole, setTargetRole] = useState('');
    const [experience, setExperience] = useState('');
    const [skills, setSkills] = useState('');
    const [oldResumeText, setOldResumeText] = useState('');

    const handleGenerate = async () => {
        if (!targetRole || (!experience && !oldResumeText)) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide a target role and either experience details or your old resume.'
            });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/resume-builder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetRole,
                    experience,
                    skills,
                    oldResumeText,
                    action: 'generate_resume'
                })
            });

            const data = await response.json();
            if (data.success) {
                setResumeData(data.data);
                setStep(2);
                toast({
                    title: 'Resume Generated!',
                    description: 'AI has crafted a tailored resume for you.',
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Please try again later.'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">AI Resume Architect</h1>
                    <p className="text-muted-foreground">Transform your career history into a perfect resume for any role.</p>
                </div>
                {step === 2 && (
                    <Button onClick={() => setStep(1)} variant="outline">Create New</Button>
                )}
            </div>

            {step === 1 ? (
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>1. Target Information</CardTitle>
                            <CardDescription>Tell us what you're aiming for.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Job Title</Label>
                                <Input 
                                    placeholder="e.g. Senior React Developer" 
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>Key Skills (Comma separated)</Label>
                                <Input 
                                    placeholder="React, Node.js, TypeScript, AWS" 
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>2. Your Background</CardTitle>
                            <CardDescription>Paste your old resume or type a summary.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs defaultValue="paste">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                                    <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="space-y-4">
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold mb-1">Upload Your Resume</p>
                                            <p className="text-sm text-muted-foreground">AI will analyze and improve it</p>
                                        </div>
                                        <Input 
                                            type="file" 
                                            accept=".pdf,.doc,.docx"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    toast({ title: "Analyzing Resume...", description: "AI is parsing your document" });
                                                    const formData = new FormData();
                                                    formData.append('resume', file);
                                                    try {
                                                        const res = await fetch('/api/ai/parse-resume', {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        if (res.ok) {
                                                            const { data } = await res.json();
                                                            setOldResumeText(JSON.stringify(data, null, 2));
                                                            if (data.title) setTargetRole(data.title);
                                                            if (data.skills) setSkills(data.skills.join(', '));
                                                            toast({ title: "Success!", description: "Resume parsed successfully" });
                                                        } else {
                                                            toast({ variant: "destructive", title: "Error", description: "Failed to parse resume" });
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                        toast({ variant: "destructive", title: "Error", description: "Failed to parse resume" });
                                                    }
                                                }
                                            }}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="paste" className="space-y-4">
                                    <Textarea 
                                        placeholder="Paste your current resume content or a summary of your experience here..." 
                                        className="h-[200px]"
                                        value={oldResumeText}
                                        onChange={(e) => setOldResumeText(e.target.value)}
                                    />
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Or describe manually</span>
                                        </div>
                                    </div>
                                    <Textarea 
                                        placeholder="I have 5 years of experience in..." 
                                        className="h-[100px]"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                    />
                                </TabsContent>
                            </Tabs>

                            <Button 
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg" 
                                size="lg"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Crafting Resume...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate AI Resume
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-2 border-purple-100 dark:border-purple-900 shadow-xl">
                            <CardHeader className="bg-muted/30 border-b pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>{resumeData.fullName || 'Your Name'}</CardTitle>
                                        <CardDescription>{resumeData.title || targetRole}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                                        <Check className="w-3 h-3 mr-1" />
                                        ATS Optimized
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6 font-serif text-sm leading-relaxed">
                                {/* Summary */}
                                <section>
                                    <h3 className="font-bold text-lg border-b mb-2 uppercase tracking-wider text-slate-700 dark:text-slate-300">Professional Summary</h3>
                                    <p>{resumeData.summary}</p>
                                </section>

                                {/* Experience */}
                                <section>
                                    <h3 className="font-bold text-lg border-b mb-4 uppercase tracking-wider text-slate-700 dark:text-slate-300">Experience</h3>
                                    <div className="space-y-4">
                                        {resumeData.experience?.map((exp: any, i: number) => (
                                            <div key={i}>
                                                <div className="flex justify-between font-semibold">
                                                    <span>{exp.role}</span>
                                                    <span>{exp.date}</span>
                                                </div>
                                                <div className="text-muted-foreground italic mb-1">{exp.company}</div>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {exp.points?.map((point: string, j: number) => (
                                                        <li key={j}>{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Skills */}
                                <section>
                                    <h3 className="font-bold text-lg border-b mb-2 uppercase tracking-wider text-slate-700 dark:text-slate-300">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.skills?.map((skill: string, i: number) => (
                                            <span key={i} className="bg-secondary px-2 py-1 rounded text-xs font-medium">{skill}</span>
                                        ))}
                                    </div>
                                </section>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Copy Text
                                </Button>
                                <Button className="w-full" variant="default">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    AI Improvements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-800 dark:text-purple-300">
                                    <strong>Keyword Match:</strong> We added keywords like "{skills.split(',')[0]}" to pass ATS filters.
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-300">
                                    <strong>Action Verbs:</strong> Replaced passive language with strong openers like "Orchestrated", "Developed", "Led".
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}


