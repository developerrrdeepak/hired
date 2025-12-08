'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download, Sparkles, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PageHeader } from '@/components/page-header';

export default function OfferLetterPage() {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [offerContent, setOfferContent] = useState('');
    const printRef = useRef<HTMLDivElement>(null);

    // Form State
    const [candidateName, setCandidateName] = useState('');
    const [role, setRole] = useState('');
    const [salary, setSalary] = useState('');
    const [joiningDate, setJoiningDate] = useState('');
    const [companyName, setCompanyName] = useState('');

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
                        companyName
                    }
                })
            });
            const json = await response.json();
            if (json.success) {
                setOfferContent(json.data);
                toast({ title: 'Offer Letter Generated' });
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
            const canvas = await html2canvas(printRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${candidateName.replace(/\s+/g, '_')}_Offer_Letter.pdf`);
            
            toast({ title: 'Downloaded PDF' });
        } catch (e) {
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
                    <div className="flex justify-end gap-2">
                         <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button onClick={handleDownload} disabled={!offerContent}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>

                    <div className="border bg-white text-black p-8 shadow-2xl min-h-[800px] font-serif leading-relaxed relative" ref={printRef}>
                        {offerContent ? (
                            <div className="whitespace-pre-wrap">{offerContent}</div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-xl font-medium">Ready to generate</p>
                                <p className="text-sm">Fill in the details and click generate.</p>
                            </div>
                        )}
                        
                        {offerContent && (
                            <div className="mt-16 grid grid-cols-2 gap-8 pt-8 border-t border-black/10 break-inside-avoid">
                                <div className="space-y-8">
                                    <div className="border-b border-black w-48"></div>
                                    <p className="font-bold">{companyName} Representative</p>
                                </div>
                                <div className="space-y-8">
                                    <div className="border-b border-black w-48"></div>
                                    <p className="font-bold">{candidateName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
