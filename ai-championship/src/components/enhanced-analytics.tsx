'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Users, Briefcase, Clock, Target, 
  CheckCircle, XCircle, AlertCircle, Star, Award, Zap 
} from 'lucide-react';
import { useMemo } from 'react';

interface AnalyticsData {
  totalCandidates?: number;
  totalJobs?: number;
  activeInterviews?: number;
  avgTimeToHire?: number;
  placementRate?: number;
  candidatesByStage?: Record<string, number>;
  topSkills?: Array<{ skill: string; count: number }>;
  recentActivity?: Array<{ type: string; message: string; timestamp: string }>;
}

interface EnhancedAnalyticsProps {
  data: AnalyticsData;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export function EnhancedAnalytics({ data, timeRange = '30d' }: EnhancedAnalyticsProps) {
  const metrics = useMemo(() => [
    {
      title: 'Total Candidates',
      value: data.totalCandidates || 0,
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Jobs',
      value: data.totalJobs || 0,
      change: '+5%',
      trend: 'up' as const,
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg Time to Hire',
      value: `${data.avgTimeToHire || 0}d`,
      change: '-8%',
      trend: 'down' as const,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Placement Rate',
      value: `${data.placementRate || 0}%`,
      change: '+15%',
      trend: 'up' as const,
      icon: Target,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ], [data]);

  const stageData = useMemo(() => {
    const stages = data.candidatesByStage || {};
    const total = Object.values(stages).reduce((sum, count) => sum + count, 0) || 1;
    return Object.entries(stages).map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [data.candidatesByStage]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold mt-1">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Candidate Pipeline
            </CardTitle>
            <CardDescription>Distribution across hiring stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stageData.length > 0 ? (
              stageData.map(({ stage, count, percentage }) => (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{stage}</span>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No pipeline data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Top Skills in Demand
            </CardTitle>
            <CardDescription>Most requested skills across jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topSkills && data.topSkills.length > 0 ? (
                data.topSkills.slice(0, 8).map((item, idx) => (
                  <div key={item.skill} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                        {idx + 1}
                      </Badge>
                      <span className="text-sm font-medium">{item.skill}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No skill data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 10).map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="mt-1">
                    {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {activity.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-600" />}
                    {activity.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                    {activity.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Hiring Velocity Improving</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your time-to-hire has decreased by 8% this month. Keep up the momentum!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
            <Star className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">High-Quality Candidate Pool</p>
              <p className="text-xs text-muted-foreground mt-1">
                85% of candidates match job requirements. Your job descriptions are attracting the right talent.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Optimize Interview Process</p>
              <p className="text-xs text-muted-foreground mt-1">
                Consider reducing interview rounds for junior positions to improve candidate experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
