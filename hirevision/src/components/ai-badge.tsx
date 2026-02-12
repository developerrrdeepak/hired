import { Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

export function AIBadge({ className = '' }: { className?: string }) {
  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
      <Sparkles className="h-3 w-3" />
      AI
    </Badge>
  );
}


