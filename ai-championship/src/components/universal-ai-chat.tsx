'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Send, Sparkles, Code, Bug, Lightbulb, Brain, Loader2, 
  FileText, Briefcase, UserCheck 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

type Mode = 'chat' | 'code' | 'debug' | 'explain' | 'brainstorm' | 'resume' | 'jd' | 'interview';

export function UniversalAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Universal AI Assistant. How can I help you today? I can assist with coding, debugging, recruitment tasks, and more.',
      timestamp: new Date(),
      suggestions: [
        'Analyze code',
        'Debug an error',
        'Generate Job Description',
        'Analyze Resume',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload: any = {
        question: input,
        userId: 'user-' + Date.now(),
      };

      // Set action based on mode
      switch (mode) {
        case 'code':
          payload.action = 'analyze-code';
          payload.code = input;
          payload.language = 'javascript'; // Default, could be improved to auto-detect
          break;
        case 'debug':
          payload.action = 'debug';
          payload.error = input;
          break;
        case 'explain':
          payload.action = 'explain';
          payload.concept = input;
          payload.level = 'intermediate';
          break;
        case 'brainstorm':
          payload.action = 'brainstorm';
          payload.topic = input;
          payload.count = 10;
          break;
        case 'resume':
          payload.action = 'analyze-resume';
          payload.resumeText = input;
          break;
        case 'jd':
          payload.action = 'generate-jd';
          payload.role = input;
          break;
        case 'interview':
          payload.action = 'generate-interview-questions';
          payload.role = input;
          break;
        default:
          // Default chat
          break;
      }

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.answer,
          timestamp: new Date(),
          suggestions: data.data.suggestions,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `I encountered an issue processing your request. Please try again or rephrase.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const useSuggestion = async (suggestion: string) => {
    setInput(suggestion);
    
    // Auto-send the message
    const userMessage: Message = {
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload: any = {
        question: suggestion,
        userId: 'user-' + Date.now(),
      };

      switch (mode) {
        case 'code':
          payload.action = 'analyze-code';
          payload.code = suggestion;
          payload.language = 'javascript';
          break;
        case 'debug':
          payload.action = 'debug';
          payload.error = suggestion;
          break;
        case 'explain':
          payload.action = 'explain';
          payload.concept = suggestion;
          payload.level = 'intermediate';
          break;
        case 'brainstorm':
          payload.action = 'brainstorm';
          payload.topic = suggestion;
          payload.count = 10;
          break;
        case 'resume':
          payload.action = 'analyze-resume';
          payload.resumeText = suggestion;
          break;
        case 'jd':
          payload.action = 'generate-jd';
          payload.role = suggestion;
          break;
        case 'interview':
          payload.action = 'generate-interview-questions';
          payload.role = suggestion;
          break;
      }

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.answer,
          timestamp: new Date(),
          suggestions: data.data.suggestions,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `I encountered an issue processing your request. Please try again or rephrase.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getModePlaceholder = (m: Mode) => {
    switch (m) {
      case 'chat': return 'Ask anything...';
      case 'code': return 'Paste code to analyze...';
      case 'debug': return 'Paste error message...';
      case 'brainstorm': return 'Enter topic to brainstorm...';
      case 'resume': return 'Paste resume text...';
      case 'jd': return 'Enter job title (e.g. Senior React Developer)...';
      case 'interview': return 'Enter job role for questions...';
      default: return 'Type your message...';
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto w-full">
      <Card className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold">Universal AI Assistant</h2>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Core Modes */}
            <div className="flex gap-1">
               <Button
                size="sm"
                variant={mode === 'chat' ? 'default' : 'ghost'}
                onClick={() => setMode('chat')}
                title="General Chat"
              >
                <Brain className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={mode === 'code' ? 'default' : 'ghost'}
                onClick={() => setMode('code')}
                title="Code Analysis"
              >
                <Code className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

            {/* Recruitment Modes Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant={['resume', 'jd', 'interview'].includes(mode) ? 'default' : 'outline'}>
                   <Briefcase className="w-4 h-4 mr-2" />
                   Recruit
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setMode('resume')}>
                  <FileText className="w-4 h-4 mr-2" /> Resume Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode('jd')}>
                  <Briefcase className="w-4 h-4 mr-2" /> Generate JD
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode('interview')}>
                  <UserCheck className="w-4 h-4 mr-2" /> Interview Qs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

             {/* Other Modes Dropdown */}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant={['debug', 'brainstorm'].includes(mode) ? 'default' : 'outline'}>
                   More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                 <DropdownMenuItem onClick={() => setMode('debug')}>
                  <Bug className="w-4 h-4 mr-2" /> Debug
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode('brainstorm')}>
                  <Lightbulb className="w-4 h-4 mr-2" /> Brainstorm
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {mode !== 'chat' && (
               <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full ml-2">
                 {mode.toUpperCase()}
               </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 overflow-x-hidden">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-lg p-3 break-words overflow-hidden`}>
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap break-words text-sm md:text-base">{message.content}</div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert break-words overflow-hidden">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs opacity-70">Suggestions:</p>
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        className="w-full text-left justify-start text-xs h-auto py-2 whitespace-normal"
                        onClick={() => useSuggestion(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getModePlaceholder(mode)}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
