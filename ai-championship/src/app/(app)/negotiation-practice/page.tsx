'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function NegotiationPracticePage() {
  const [role, setRole] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = async () => {
    if (!role || !userResponse.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a role and your message.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const newHistory: Message[] = [...history, { role: 'user', content: userResponse }];
    setHistory(newHistory);
    setUserResponse('');

    try {
      const res = await fetch('/api/ai/negotiation-practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, userResponse, history }),
      });

      if (!res.ok) {
        throw new Error('Failed to get a response from the AI');
      }

      const { response } = await res.json();
      setHistory([...newHistory, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
      setHistory(history);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRole('');
    setUserResponse('');
    setHistory([]);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Salary Negotiation Practice</CardTitle>
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Enter the role you are applying for (e.g., Software Engineer)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={history.length > 0}
            />
          </div>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4 mb-4" ref={scrollRef}>
            {history.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Enter a role and start your negotiation practice
              </div>
            )}
            {history.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 my-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'model' && (
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar>
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              placeholder="Type your response..."
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading || !role}
            />
            <Button onClick={handleSendMessage} disabled={loading || !role}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
