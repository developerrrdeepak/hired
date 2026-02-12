'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { SEED_USERS, SEED_JOBS, SEED_POSTS, SEED_CONNECTIONS } from '@/lib/seed-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SeedPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const seedDatabase = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Firebase not initialized' });
      return;
    }

    setLoading(true);
    try {
      // Seed Users
      for (const user of SEED_USERS) {
        await setDoc(doc(firestore, 'users', user.id), {
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Seed Jobs
      for (const job of SEED_JOBS) {
        await setDoc(doc(firestore, 'organizations/org-demo-owner-id/jobs', job.id), {
          ...job,
          organizationId: 'org-demo-owner-id',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Seed Posts
      for (const post of SEED_POSTS) {
        await setDoc(doc(firestore, 'posts', post.id), {
          ...post,
          authorRole: SEED_USERS.find(u => u.id === post.authorId)?.role || 'User',
          authorAvatar: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Seed Connections
      for (const conn of SEED_CONNECTIONS) {
        await setDoc(doc(firestore, 'connections', conn.id), {
          ...conn,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      toast({ title: 'Success!', description: 'Database seeded successfully' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to seed database' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will populate the database with realistic demo data including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>16 Users (10 Candidates, 4 Recruiters, 2 Owners)</li>
            <li>5 Job Postings</li>
            <li>4 Community Posts</li>
            <li>4 Connections</li>
          </ul>
          <p className="text-sm text-amber-600">
            ⚠️ Warning: This will overwrite existing data with the same IDs
          </p>
          <Button onClick={seedDatabase} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              'Seed Database'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sample Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Candidates (Indian):</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Priya Sharma - Full Stack Developer</li>
              <li>Rahul Verma - Frontend Developer</li>
              <li>Anjali Patel - Backend Developer</li>
              <li>Vikram Singh - DevOps Engineer</li>
              <li>Sneha Reddy - Data Scientist</li>
            </ul>
            <p className="font-semibold mt-4">Candidates (US):</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>John Smith - Senior Software Engineer</li>
              <li>Emily Johnson - UI/UX Designer</li>
              <li>Michael Brown - Mobile Developer</li>
              <li>Sarah Davis - Product Manager</li>
              <li>David Wilson - QA Engineer</li>
            </ul>
            <p className="font-semibold mt-4">Recruiters:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Amit Kumar - TechCorp India</li>
              <li>Neha Gupta - Innovate Solutions</li>
              <li>Jennifer Lee - TechGiant Inc</li>
              <li>Robert Martinez - Startup.io</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


