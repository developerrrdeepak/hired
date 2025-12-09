'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { TrendingUp, Users, Briefcase, Target, Brain, Zap, RefreshCw, BarChart2, PieChart, Activity } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    matchingAccuracy: 0,
    aiProcessed: 0,
    applicationsTrend: [] as any[],
    demographics: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
        // Simulate deeper data fetch
        // In real app, this calls your API
        await new Promise(r => setTimeout(r, 800)); 
        
        setMetrics({
          totalCandidates: Math.floor(Math.random() * 5000) + 1000,
          activeJobs: Math.floor(Math.random() * 80) + 20,
          matchingAccuracy: Math.floor(Math.random() * 15) + 84,
          aiProcessed: Math.floor(Math.random() * 500) + 100,
          applicationsTrend: [
              { name: 'Mon', apps: 40, hires: 2 },
              { name: 'Tue', apps: 60, hires: 5 },
              { name: 'Wed', apps: 85, hires: 7 },
              { name: 'Thu', apps: 70, hires: 4 },
              { name: 'Fri', apps: 90, hires: 8 },
              { name: 'Sat', apps: 45, hires: 1 },
              { name: 'Sun', apps: 30, hires: 0 },
          ],
          demographics: [
              { name: 'Engineering', value: 400 },
              { name: 'Product', value: 300 },
              { name: 'Design', value: 300 },
              { name: 'Marketing', value: 200 },
          ]
        });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="flex-1 space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Executive Analytics Dashboard"
          description="Deep-dive into recruitment performance and AI efficiency."
        />
        <Button onClick={fetchAnalytics} disabled={isLoading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Total Talent Pool", value: metrics.totalCandidates.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Active Opportunities", value: metrics.activeJobs, icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10" },
            { title: "AI Match Precision", value: `${metrics.matchingAccuracy}%`, icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
            { title: "AI Events Today", value: metrics.aiProcessed, icon: Brain, color: "text-orange-500", bg: "bg-orange-500/10" }
        ].map((stat, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-full ${stat.bg}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                        Trending up
                    </p>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Application Velocity
                </CardTitle>
                <CardDescription>Weekly flow of applications vs hires.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ChartContainer config={{}} className="h-full w-full">
                        <AreaChart data={metrics.applicationsTrend}>
                            <defs>
                                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area type="monotone" dataKey="apps" stroke="#8884d8" fillOpacity={1} fill="url(#colorApps)" />
                            <Area type="monotone" dataKey="hires" stroke="#82ca9d" fill="#82ca9d" />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Department Distribution
                </CardTitle>
                <CardDescription>Hiring needs by department.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full relative">
                    <ChartContainer config={{}} className="h-full w-full">
                        <RePieChart>
                            <Pie
                                data={metrics.demographics}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {metrics.demographics.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </RePieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-2xl font-bold block">{metrics.demographics.reduce((a,b)=>a+b.value,0)}</span>
                            <span className="text-xs text-muted-foreground">Roles</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* AI Performance */}
      <Card className="bg-gradient-to-br from-background to-muted/50 border-primary/20">
          <CardHeader>
            <CardTitle>AI Impact Report</CardTitle>
            <CardDescription>
              Quantifiable efficiency gains from Raindrop Smart Components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Time Saved (Screening)</span>
                        <span className="text-green-600">85%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[85%] rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Automated resume parsing & ranking.</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Candidate Quality</span>
                        <span className="text-blue-600">92%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[92%] rounded-full animate-pulse"></div>
                    </div>
                     <p className="text-xs text-muted-foreground">Better matches via SmartInference.</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Offer Acceptance Rate</span>
                        <span className="text-purple-600">78%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[78%] rounded-full animate-pulse"></div>
                    </div>
                     <p className="text-xs text-muted-foreground">Market-calibrated offers.</p>
                </div>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}