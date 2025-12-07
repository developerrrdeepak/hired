'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Heart, Laugh, Lightbulb, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReactionType = 'like' | 'love' | 'laugh' | 'insightful';

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, color: 'text-blue-500', label: 'Like' },
  { type: 'love', icon: Heart, color: 'text-red-500', label: 'Love' },
  { type: 'laugh', icon: Laugh, color: 'text-yellow-500', label: 'Funny' },
  { type: 'insightful', icon: Lightbulb, color: 'text-amber-500', label: 'Insightful' },
];

export function PostReactions({ initialCount = 0 }: { initialCount?: number }) {
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const [count, setCount] = useState(initialCount);
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (type: ReactionType) => {
    if (activeReaction === type) {
      setActiveReaction(null);
      setCount(prev => prev - 1);
    } else {
      if (!activeReaction) setCount(prev => prev + 1);
      setActiveReaction(type);
    }
    setShowPicker(false);
  };

  const CurrentIcon = activeReaction 
    ? REACTIONS.find(r => r.type === activeReaction)?.icon || ThumbsUp 
    : ThumbsUp;

  return (
    <div className="relative" onMouseLeave={() => setShowPicker(false)}>
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-2 bg-background border shadow-lg rounded-full p-2 animate-in fade-in zoom-in duration-200 z-10">
          {REACTIONS.map(({ type, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => handleReact(type as ReactionType)}
              className={cn("p-2 rounded-full hover:bg-muted transition-colors hover:scale-125", color)}
            >
              <Icon className="w-5 h-5 fill-current" />
            </button>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 transition-colors",
          activeReaction && REACTIONS.find(r => r.type === activeReaction)?.color
        )}
        onMouseEnter={() => setShowPicker(true)}
        onClick={() => !activeReaction ? handleReact('like') : handleReact(activeReaction)}
      >
        <CurrentIcon className={cn("w-4 h-4", activeReaction && "fill-current")} />
        {count > 0 ? count : 'Like'}
      </Button>
    </div>
  );
}
