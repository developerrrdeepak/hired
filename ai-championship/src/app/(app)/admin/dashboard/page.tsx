'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Users, Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const stats = [
  { title: 'Total Users', value: '2,543', change: '+12%', icon: Users },
  { title: 'Active Jobs', value: '156', change: '+8%', icon: Briefcase },
  { title: 'Applications', value: '1,234', change: '+23%', icon: TrendingUp },
  { title: 'Revenue', value: '$45,231', change: '+18%', icon: DollarSign },
];

const chartData = [
  { name: 'Jan', users: 400, jobs: 240 },
  { name: 'Feb', users: 300, jobs: 139 },
  { name: 'Mar', users: 200, jobs: 980 },
  { name: 'Apr', users: 278, jobs: 390 },
  { name: 'May', users: 189, jobs: 480 },
  { name: 'Jun', users: 239, jobs: 380 },
];

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Platform analytics and insights"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jobs" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
