'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, AreaChart, Area } from 'recharts';
import { Users, Briefcase, CheckCircle, Clock, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

const mockData = [
  { name: 'Mon', applicants: 4, interviews: 2, hired: 0 },
  { name: 'Tue', applicants: 7, interviews: 3, hired: 1 },
  { name: 'Wed', applicants: 5, interviews: 4, hired: 0 },
  { name: 'Thu', applicants: 12, interviews: 6, hired: 2 },
  { name: 'Fri', applicants: 9, interviews: 5, hired: 1 },
  { name: 'Sat', applicants: 3, interviews: 1, hired: 0 },
  { name: 'Sun', applicants: 2, interviews: 0, hired: 0 },
];

const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

export function DashboardAnalytics() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Cards - Glassmorphism Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Applicants</CardTitle>
            <Users className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <p className="text-xs opacity-75 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs opacity-75 flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1" /> +2 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-pink-600 text-white border-0 shadow-lg hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Interviews</CardTitle>
            <Clock className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs opacity-75 mt-1">Scheduled this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Hired</CardTitle>
            <CheckCircle className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
            <p className="text-xs opacity-75 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +3 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Application Velocity */}
        <Card className="lg:col-span-2 shadow-md border-t-4 border-t-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recruitment Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#888888" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#888888" />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="applicants" stroke="#6366f1" fillOpacity={1} fill="url(#colorApplicants)" strokeWidth={2} />
                <Area type="monotone" dataKey="interviews" stroke="#ec4899" fillOpacity={1} fill="url(#colorInterviews)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Secondary Chart - Hiring Efficiency */}
        <Card className="shadow-md border-t-4 border-t-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Hires vs Interviews
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#888888" />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="interviews" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hired" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
