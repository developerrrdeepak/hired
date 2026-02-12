'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SalaryInsightsPage() {
  const [formData, setFormData] = useState({
    role: '',
    location: '',
    experienceLevel: '',
    companyType: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!formData.role || !formData.location || !formData.experienceLevel) {
        toast({ title: "Error", description: "Role, Location and Level are required", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'salary-insights',
          role: formData.role,
          location: formData.location,
          experienceLevel: formData.experienceLevel,
          companyType: formData.companyType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const answer = data.data.answer;
        const parsed = parseSalaryResponse(answer);
        setResult(parsed);
      } else {
        throw new Error(data.error || 'Failed to get insights');
      }
    } catch (error) {
      toast({ title: "Error", description: "Analysis failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const parseSalaryResponse = (text: string) => {
    const lines = text.split('\n');
    const result: any = {
      estimatedRange: { min: '0', max: '0', median: '0', currency: '$' },
      marketTrends: [],
      negotiationLevers: [],
      costOfLivingFactor: ''
    };

    let section = '';
    for (const line of lines) {
      if (line.includes('Min:')) {
        const match = line.match(/[\$€£¥]?([\d,]+)/g);
        if (match) result.estimatedRange.min = match[0].replace(/[^\d]/g, '');
      } else if (line.includes('Max:')) {
        const match = line.match(/[\$€£¥]?([\d,]+)/g);
        if (match) result.estimatedRange.max = match[0].replace(/[^\d]/g, '');
      } else if (line.includes('Median:')) {
        const match = line.match(/[\$€£¥]?([\d,]+)/g);
        if (match) result.estimatedRange.median = match[0].replace(/[^\d]/g, '');
      } else if (line.includes('Market Trends')) {
        section = 'trends';
      } else if (line.includes('Negotiation Levers')) {
        section = 'levers';
      } else if (line.includes('Cost of Living')) {
        section = 'cost';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const item = line.replace(/^[\s-•]+/, '').trim();
        if (item && section === 'trends') result.marketTrends.push(item);
        if (item && section === 'levers') result.negotiationLevers.push(item);
      } else if (section === 'cost' && line.trim() && !line.includes('**')) {
        result.costOfLivingFactor += line.trim() + ' ';
      }
    }

    result.costOfLivingFactor = result.costOfLivingFactor.trim() || 'Location-adjusted estimate';
    return result;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Salary & Market Insights
        </h1>
        <p className="text-muted-foreground">Real-time compensation data to help you negotiate better.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-t-4 border-t-green-600">
            <CardHeader>
                <CardTitle>Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Role Title</Label>
                        <Input 
                            value={formData.role} 
                            onChange={(e) => setFormData({...formData, role: e.target.value})} 
                            placeholder="e.g. Product Manager" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                            placeholder="e.g. New York, NY" 
                        />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select onValueChange={(v) => setFormData({...formData, experienceLevel: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Junior">Junior (0-2 years)</SelectItem>
                                <SelectItem value="Mid-Level">Mid-Level (3-5 years)</SelectItem>
                                <SelectItem value="Senior">Senior (5-8 years)</SelectItem>
                                <SelectItem value="Staff/Principal">Staff/Principal (8+ years)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Company Type</Label>
                        <Select onValueChange={(v) => setFormData({...formData, companyType: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Startup">Startup</SelectItem>
                                <SelectItem value="Enterprise">Enterprise</SelectItem>
                                <SelectItem value="Agency">Agency</SelectItem>
                                <SelectItem value="Non-profit">Non-profit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleAnalyze} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Get Insights
                </Button>
            </CardContent>
        </Card>

        {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Main Salary Card */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-green-800">Estimated Base Salary</CardTitle>
                        <CardDescription className="text-green-700">{formData.role} in {formData.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="text-4xl font-bold text-green-900 mb-2">
                            {result.estimatedRange.currency}{result.estimatedRange.min} - {result.estimatedRange.currency}{result.estimatedRange.max}
                        </div>
                        <p className="text-sm font-medium text-green-800">Median: {result.estimatedRange.currency}{result.estimatedRange.median}</p>
                        <div className="mt-4 text-xs text-green-700 bg-white/50 inline-block px-3 py-1 rounded-full">
                            {result.costOfLivingFactor}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" /> Market Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
                                {result.marketTrends.map((t: string, i: number) => (
                                    <li key={i}>{t}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-purple-600" /> Negotiation Levers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
                                {result.negotiationLevers.map((l: string, i: number) => (
                                    <li key={i}>{l}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}


