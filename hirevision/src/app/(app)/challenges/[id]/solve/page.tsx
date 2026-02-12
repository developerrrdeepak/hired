'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { ChallengeEditor } from "@/components/challenge-editor";
import { useFirebase } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { useUserContext } from "@/app/(app)/layout";
import { useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Code, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChallengeSolvePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { firestore } = useFirebase();
    const { organizationId } = useUserContext();
    const { toast } = useToast();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [details, setDetails] = useState({ name: '', description: '', githubUrl: '' });

    const orgId = searchParams.get('orgId') || organizationId || 'org-demo-owner-id';

    const challengeRef = useMemoFirebase(() => {
        if (!firestore || !orgId || !id) return null;
        return doc(firestore, `organizations/${orgId}/challenges`, id);
    }, [firestore, orgId, id]);

    const { data: challenge, isLoading } = useDoc<any>(challengeRef);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            toast({ title: 'File Selected', description: file.name });
        }
    };

    const handleSubmit = () => {
        toast({ title: 'Submission Received', description: 'Your solution has been submitted!' });
    };

    if (isLoading) return <div className="p-8"><Skeleton className="h-12 w-64 mb-4" /><Skeleton className="h-[600px] w-full" /></div>;
    if (!challenge) return <div className="p-8">Challenge not found</div>;

    return (
        <div className="flex flex-col gap-4">
             <PageHeader 
                title={challenge.title} 
                description={
                    <div className="flex items-center gap-2">
                        <Badge>{challenge.difficulty || 'Medium'}</Badge>
                        <span className="text-muted-foreground text-sm">{challenge.points || 100} Points</span>
                    </div>
                }
            />
            
            <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code"><Code className="h-4 w-4 mr-2" />Code Editor</TabsTrigger>
                    <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2" />Upload File</TabsTrigger>
                    <TabsTrigger value="details"><FileText className="h-4 w-4 mr-2" />Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="mt-4">
                    <div className="h-[calc(100vh-300px)]">
                        <ChallengeEditor 
                            challengeId={id} 
                            initialCode="// Write your solution function here...\nfunction solve(input) {\n  // TODO\n  return input;\n}" 
                        />
                    </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Solution File</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                                </Label>
                                <Input 
                                    id="file-upload" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                    accept=".zip,.js,.py,.java,.cpp,.c"
                                />
                                <p className="text-xs text-muted-foreground mt-2">ZIP, JS, PY, JAVA, CPP, C (MAX 10MB)</p>
                                {uploadedFile && (
                                    <p className="mt-4 text-sm font-medium">{uploadedFile.name}</p>
                                )}
                            </div>
                            <Button onClick={handleSubmit} className="w-full">Submit Solution</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="details" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submission Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Your Name</Label>
                                <Input 
                                    id="name" 
                                    value={details.name}
                                    onChange={(e) => setDetails({...details, name: e.target.value})}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Solution Description</Label>
                                <Textarea 
                                    id="description" 
                                    value={details.description}
                                    onChange={(e) => setDetails({...details, description: e.target.value})}
                                    placeholder="Describe your approach..."
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label htmlFor="github">GitHub Repository (Optional)</Label>
                                <Input 
                                    id="github" 
                                    value={details.githubUrl}
                                    onChange={(e) => setDetails({...details, githubUrl: e.target.value})}
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <Button onClick={handleSubmit} className="w-full">Submit Details</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
