'use client';

import { Card, CardProps } from './card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends CardProps {
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
  gradient?: 'blue' | 'green' | 'purple' | 'none';
}

export function EnhancedCard({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  glass = false,
  gradient = 'none',
  ...props 
}: EnhancedCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:shadow-lg',
        glow && 'hover-glow',
        glass && 'glassmorphism',
        gradient === 'blue' && 'gradient-bg-blue text-white',
        gradient === 'green' && 'gradient-bg-green text-white',
        gradient === 'purple' && 'gradient-bg-purple text-white',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}


