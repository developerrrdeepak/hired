'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function PostReactions({ initialCount = 0 }: { initialCount?: number }) {
  const [reaction, setReaction] = useState<string | null>(null);
  const [count, setCount] = useState(initialCount);
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (emoji: string) => {
    if (reaction === emoji) {
      setReaction(null);
      setCount(prev => prev - 1);
    } else {
      if (!reaction) setCount(prev => prev + 1);
      setReaction(emoji);
    }
    setShowPicker(false);
  };

  return (
    <div className="relative" onMouseLeave={() => setShowPicker(false)}>
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 bg-background border shadow-lg rounded-full p-2 animate-in fade-in zoom-in duration-200 z-10">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onMouseEnter={() => setShowPicker(true)}
        onClick={() => !reaction ? handleReact('👍') : handleReact(reaction)}
      >
        {reaction ? <span className="text-base">{reaction}</span> : <ThumbsUp className="w-4 h-4" />}
        {count > 0 ? count : 'Like'}
      </Button>
    </div>
  );
}
