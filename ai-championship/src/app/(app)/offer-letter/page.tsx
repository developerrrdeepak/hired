'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download, Sparkles, Printer, Upload, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PageHeader } from '@/components/page-header';
import { useFirebase } from '@/firebase';
import { useUserContext } from '@/app/(app)/layout';

export default function OfferLetterPage() {
    const { toast } = useToast();
    const { user } = useFirebase();
    const { displayName } = useUserContext();
    const [isGenerating, setIsGenerating] = useState(false);
    const [offerContent, setOfferContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [candidateName, setCandidateName] = useState('');
    const [role, setRole] = useState('');
    const [salary, setSalary] = useState('');
    const [joiningDate, setJoiningDate] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);

    // Auto-populate logic if user has profile data
    useEffect(() => {
        if (user?.displayName) {
             // Basic inference
             setCompanyName("My Company"); // Replace with actual company from user profile if stored
        }
        if (user?.photoURL) {
            // Default to user avatar if no company logo uploaded, though ideally we'd separate
            // For now, let's keep it null unless uploaded specifically
        }
    }, [user]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCompanyLogo(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!candidateName || !role || !salary || !companyName) {
            toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill in all fields.' });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/features', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_offer_letter',
                    data: {
                        candidateName,
                        role,
                        salary,
                        joiningDate,
                        companyName,
                        benefits: "Health, Dental, 401k, Unlimited PTO"
                    }
                })
            });
            const json = await response.json();
            if (json.success) {
                setOfferContent(json.data);
                toast({ title: 'Offer Letter Generated' });
                setIsEditing(false);
            } else {
                throw new Error(json.error);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate offer letter.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!printRef.current) return;
        
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${candidateName.replace(/\s+/g, '_')}_Offer_Letter.pdf`);
            
            toast({ title: 'Downloaded PDF' });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Download Failed' });
        }
    };

    return (
        <div className="container py-8 max-w-6xl space-y-8">
            <PageHeader 
                title="AI Offer Letter Generator" 
                description="Generate official, legally-sound offer letters in seconds."
            />
            
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Offer Details</CardTitle>
                            <CardDescription>Enter the terms of employment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Company Logo</Label>
                                <div className="flex items-center gap-4">
                                    {companyLogo ? (
                                        <img src={companyLogo} alt="Logo" className="w-16 h-16 object-contain border rounded p-1" />
                                    ) : (
                                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No Logo</div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp" />
                            </div>
                            <div className="space-y-2">
                                <Label>Candidate Name</Label>
                                <Input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Role Title</Label>
                                <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Engineer" />
                            </div>
                            <div className="space-y-2">
                                <Label>Annual Salary</Label>
                                <Input value={salary} onChange={e => setSalary(e.target.value)} placeholder="$120,000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} />
                            </div>

                            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate Offer
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                         <div className="flex gap-2">
                            <Button 
                                variant={isEditing ? "secondary" : "ghost"} 
                                onClick={() => setIsEditing(!isEditing)}
                                disabled={!offerContent}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                {isEditing ? 'Done Editing' : 'Edit Text'}
                            </Button>
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                            <Button onClick={handleDownload} disabled={!offerContent}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </div>

                    <div className="border bg-white text-black p-12 shadow-2xl min-h-[800px] font-serif leading-relaxed relative mx-auto max-w-[210mm]" ref={printRef}>
                        {offerContent ? (
                            <>
                                {/* Header */}
                                <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-6">
                                    <div>
                                        {companyLogo ? (
                                            <img src={companyLogo} alt="Company Logo" className="h-16 w-auto object-contain mb-2" />
                                        ) : (
                                            <h1 className="text-3xl font-bold uppercase tracking-wide">{companyName}</h1>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">123 Innovation Drive, Tech City</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">OFFER OF EMPLOYMENT</p>
                                        <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Body */}
                                {isEditing ? (
                                    <Textarea 
                                        value={offerContent} 
                                        onChange={(e) => setOfferContent(e.target.value)} 
                                        className="w-full h-[500px] font-serif text-base border-none focus:ring-0 p-0 resize-none bg-transparent"
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap text-[11pt] text-justify">{offerContent}</div>
                                )}
                                
                                {/* Signature Section */}
                                <div className="mt-20 grid grid-cols-2 gap-16 break-inside-avoid">
                                    <div className="space-y-4">
                                        <div className="border-b border-black w-full pb-2">
                                            {/* Signature Image Placeholder or Real Signature */}
                                            <div className="h-12 w-full"></div> 
                                        </div>
                                        <div>
                                            <p className="font-bold">{displayName || "Hiring Manager"}</p>
                                            <p className="text-sm text-gray-500">Authorized Representative</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="border-b border-black w-full pb-14"></div>
                                        <div>
                                            <p className="font-bold">{candidateName}</p>
                                            <p className="text-sm text-gray-500">Candidate Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-xl font-medium">Ready to generate</p>
                                <p className="text-sm">Fill in the details and click generate.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
