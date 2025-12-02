'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Job } from '@/lib/definitions';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
  delay?: number;
}

export function JobCard({ job, showApplyButton = true, delay = 0 }: JobCardProps) {
  return (
    <Card 
      className="flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 glassmorphism animate-in fade-in-0 slide-in-from-top-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold hover:text-primary cursor-pointer truncate">
              <Link href={`/jobs/${job.id}?orgId=${job.organizationId}`}>
                {job.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm mt-1">{job.department}</CardDescription>
          </div>
          <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="shrink-0">
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-2 text-sm p-5 pt-0">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-4 w-4 shrink-0" />
          <span className="truncate">{job.employmentType} · {job.seniorityLevel}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {job.isRemote ? 'Remote' : `${job.locationCity}, ${job.locationCountry}`}
          </span>
        </div>
        
        {(job.salaryRangeMin || job.salaryRangeMax) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span className="truncate">
              ${job.salaryRangeMin ? (job.salaryRangeMin / 1000).toFixed(0) : 'N/A'}k - 
              ${job.salaryRangeMax ? (job.salaryRangeMax / 1000).toFixed(0) : 'N/A'}k
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="truncate">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {job.requiredSkills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.requiredSkills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{job.requiredSkills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      {showApplyButton && (
        <CardFooter className="p-5 pt-0">
          <Button className="w-full" asChild>
            <Link href={`/jobs/${job.id}?orgId=${job.organizationId}`}>
              View Details
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
