'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, MessageCircle, UserPlus, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface ProfileCardProps {
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  onClose?: () => void;
}

export function ProfileCard({ userId, name, role, avatarUrl, onClose }: ProfileCardProps) {
  return (
    <Card className="w-80 shadow-2xl border-border/50 bg-popover text-popover-foreground animate-in fade-in zoom-in-95 duration-200">
      <CardHeader className="relative pb-2">
        <div className="absolute top-2 right-2">
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 border-4 border-background shadow-sm mb-3">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xl">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-bold text-center leading-tight">{name}</h3>
          <p className="text-sm text-muted-foreground text-center mt-1">{role}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex justify-center gap-2">
           <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5">
             <MapPin className="w-3 h-3 mr-1 inline" /> Remote
           </Badge>
           <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5">
             <Briefcase className="w-3 h-3 mr-1 inline" /> Open to Work
           </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="w-full bg-primary/90 hover:bg-primary" asChild>
            <Link href={`/public-profile/${userId}`}>
                <ExternalLink className="w-3 h-3 mr-2" />
                Profile
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="w-full" asChild>
             <Link href={`/messages?userId=${userId}`}>
                <MessageCircle className="w-3 h-3 mr-2" />
                Message
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
