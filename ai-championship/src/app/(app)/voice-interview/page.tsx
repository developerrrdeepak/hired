'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PageHeader } from '@/components/page-header';
import { Video, Mic, MicOff, Volume2, Send, User, Bot, Sparkles } from 'lucide-react';

export default function VoiceInterviewPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string, timestamp?: Date}>>([
    { role: 'assistant', content: '👋 Hello! I\'m your AI interviewer. Ready for a realistic interview? Tell me what role you\'re preparing for!', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [focusLosses, setFocusLosses] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Interview Timer
  useEffect(() => {
    if (isInterviewStarted) {
      timerRef.current = setInterval(() => {
        setInterviewDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setInterviewDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInterviewStarted]);

  // Calculate confidence score based on behavior
  useEffect(() => {
    if (!isInterviewStarted) {
      setConfidenceScore(0);
      return;
    }
    const baseScore = 100;
    const tabPenalty = tabSwitches * 10;
    const focusPenalty = focusLosses * 5;
    const score = Math.max(0, baseScore - tabPenalty - focusPenalty);
    setConfidenceScore(score);
  }, [tabSwitches, focusLosses, isInterviewStarted]);

  // Behavior Detection - Tab Switch & Focus Loss
  useEffect(() => {
    if (!isInterviewStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        const warning = `⚠️ Tab switch detected at ${new Date().toLocaleTimeString()}`;
        setWarnings(prev => [...prev, warning]);
      }
    };

    const handleBlur = () => {
      setFocusLosses(prev => prev + 1);
      const warning = `⚠️ Focus lost at ${new Date().toLocaleTimeString()}`;
      setWarnings(prev => [...prev, warning]);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isInterviewStarted]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (videoRef.current && isInterviewStarted) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: false 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch (err) {
          console.error('Camera error:', err);
        }
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isInterviewStarted]);

  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    setIsListening(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    let finalTranscript = '';
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      setInput(finalTranscript + interimTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        setInput(finalTranscript.trim());
        // Auto-send if enabled
        if (autoSendEnabled && finalTranscript.trim()) {
          setTimeout(() => {
            const trimmed = finalTranscript.trim();
            if (trimmed) {
              setInput(trimmed);
              // Trigger send
              handleSendMessage();
            }
          }, 500);
        }
      }
    };
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  };

  const speakMessage = async (text: string) => {
    setIsSpeaking(true);
    try {
      const voiceId = voiceGender === 'female' 
        ? 'EXAVITQu4vr4xnSDxMaL' // Female voice
        : '21m00Tcm4TlvDq8ikWAM'; // Male voice

      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        if (audioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            // Fallback to browser speech synthesis
            useBrowserSpeech(text);
          };
          await audio.play();
        } else {
          // Use browser speech synthesis as fallback
          useBrowserSpeech(text);
        }
      } else {
        useBrowserSpeech(text);
      }
    } catch (error) {
      console.error('Voice error:', error);
      useBrowserSpeech(text);
    }
  };

  const useBrowserSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = voiceGender === 'male' ? 0.8 : 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    if (!isInterviewStarted) {
      setIsInterviewStarted(true);
    }

    try {
      const response = await fetch('/api/voice-interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          conversationHistory: messages
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.response || data.error || 'Could you please repeat that?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      await speakMessage(assistantMessage.content);
    } catch (error: any) {
      console.error('Interview error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, I had trouble processing that. Could you please repeat?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      await speakMessage(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: '👋 Hello! I\'m your AI interviewer. Ready for a realistic interview? Tell me what role you\'re preparing for!', timestamp: new Date() }]);
    setIsInterviewStarted(false);
    setInput('');
    setTabSwitches(0);
    setFocusLosses(0);
    setWarnings([]);
    setInterviewDuration(0);
    setConfidenceScore(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex-1 space-y-6 py-6">
      <PageHeader
        title="Live AI Interview Practice"
        description="Practice with a live AI interviewer - like a real video call"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interview Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Call Interface */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-0">
                {/* AI Interviewer */}
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bot className="h-16 w-16" />
                    </div>
                    <p className="text-lg font-semibold">AI Interviewer</p>
                    <Badge variant="secondary" className="mt-2">
                      {voiceGender === 'female' ? '👩 Female Voice' : '👨 Male Voice'}
                    </Badge>
                    {isSpeaking && (
                      <div className="mt-4 flex items-center justify-center gap-1">
                        <div className="w-2 h-8 bg-white rounded animate-pulse" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-12 bg-white rounded animate-pulse" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-6 bg-white rounded animate-pulse" style={{animationDelay: '300ms'}}></div>
                        <div className="w-2 h-10 bg-white rounded animate-pulse" style={{animationDelay: '450ms'}}></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Your Video */}
                <div className="relative bg-gray-900 aspect-video overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {!isInterviewStarted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <User className="h-16 w-16 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-400">Camera will activate when interview starts</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 text-white z-10">
                    <Badge variant="secondary">You</Badge>
                  </div>
                  {isInterviewStarted && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="default" className="bg-green-500">
                        🔴 {formatTime(interviewDuration)}
                      </Badge>
                    </div>
                  )}
                  {isListening && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
                        <Mic className="h-4 w-4" />
                        <span className="text-sm font-medium">Listening...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Live Interview Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-blue-600 text-white'
                        }`}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-blue-600 text-white dark:bg-blue-700'
                        }`}>
                          <p className="text-sm text-white">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-blue-600 dark:bg-blue-700 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer or click mic to speak..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleStartListening}
                    disabled={isListening || isLoading}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">⚙️ Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Interviewer Voice</Label>
                <RadioGroup value={voiceGender} onValueChange={(v) => setVoiceGender(v as 'male' | 'female')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">👩 Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">👨 Male</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Label htmlFor="auto-send" className="text-sm cursor-pointer">Auto-send voice</Label>
                <input
                  id="auto-send"
                  type="checkbox"
                  checked={autoSendEnabled}
                  onChange={(e) => setAutoSendEnabled(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleReset}>
                🔄 Start New Interview
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInput('Tell me about yourself')}>
                💼 Tell me about yourself
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInput('What are your strengths and weaknesses?')}>
                💪 Strengths & Weaknesses
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInput('Why should we hire you?')}>
                🎯 Why hire you?
              </Button>
            </CardContent>
          </Card>

          {/* Interview Stats */}
          {isInterviewStarted && (
            <Card className="border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>📊</span>
                  Interview Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <Badge variant="secondary">{formatTime(interviewDuration)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Questions:</span>
                  <Badge variant="secondary">{Math.floor(messages.length / 2)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <Badge variant="secondary" className={getConfidenceColor(confidenceScore)}>
                    {confidenceScore}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Proctoring */}
          {isInterviewStarted && (
            <Card className="border-orange-500/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-orange-500">👁️</span>
                  AI Proctoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tab Switches:</span>
                  <Badge variant={tabSwitches > 0 ? "destructive" : "secondary"}>
                    {tabSwitches}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Focus Losses:</span>
                  <Badge variant={focusLosses > 0 ? "destructive" : "secondary"}>
                    {focusLosses}
                  </Badge>
                </div>
                {warnings.length > 0 && (
                  <div className="mt-3 p-2 bg-orange-500/10 rounded text-xs space-y-1 max-h-32 overflow-y-auto">
                    {warnings.slice(-3).map((warning, i) => (
                      <p key={i} className="text-orange-600 dark:text-orange-400">{warning}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Live Video</Badge>
                <span className="text-xs text-muted-foreground">Real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Voice AI</Badge>
                <span className="text-xs text-muted-foreground">ElevenLabs</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">AI Proctoring</Badge>
                <span className="text-xs text-muted-foreground">Behavior</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Any Field</Badge>
                <span className="text-xs text-muted-foreground">Custom</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Interview Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Speak naturally
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Any field/role
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Voice or text
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Instant feedback
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}