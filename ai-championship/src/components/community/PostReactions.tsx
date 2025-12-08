'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PostReactions({ initialCount = 0 }: { initialCount?: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setCount(prev => prev - 1);
    } else {
      setLiked(true);
      setCount(prev => prev + 1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2 transition-colors",
        liked && "text-blue-500"
      )}
      onClick={handleLike}
    >
      <ThumbsUp className={cn("w-4 h-4", liked && "fill-current")} />
      {count > 0 ? count : 'Like'}
    </Button>
  );
}
