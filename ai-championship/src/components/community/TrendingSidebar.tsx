'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hash, TrendingUp } from 'lucide-react';

const TRENDING_TOPICS = [
  { tag: 'AIHiring', posts: '12.5k' },
  { tag: 'RemoteWork', posts: '8.2k' },
  { tag: 'WebDevelopment', posts: '5.1k' },
  { tag: 'CareerAdvice', posts: '3.4k' },
  { tag: 'TechNews', posts: '2.8k' },
];

export function TrendingSidebar() {
  return (
    <Card className="glassmorphism p-4 sticky top-20">
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        Trending Now
      </h3>
      <div className="space-y-3">
        {TRENDING_TOPICS.map((topic, i) => (
          <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
            <div>
              <p className="font-medium text-sm flex items-center gap-1 group-hover:text-primary transition-colors">
                <Hash className="w-3 h-3 text-muted-foreground" />
                {topic.tag}
              </p>
              <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Follow
            </Button>
          </div>
        ))}
      </div>
      <Button variant="link" className="w-full mt-2 text-xs">
        Show more
      </Button>
    </Card>
  );
}
