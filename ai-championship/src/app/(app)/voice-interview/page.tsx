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
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeContact, setEyeContact] = useState(0);
  const [lookingAway, setLookingAway] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const faceDetectionRef = useRef<NodeJS.Timeout | null>(null);

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

  // Calculate confidence score based on behavior and face analysis
  useEffect(() => {
    if (!isInterviewStarted) {
      setConfidenceScore(0);
      return;
    }
    const baseScore = 100;
    const tabPenalty = tabSwitches * 10;
    const focusPenalty = focusLosses * 5;
    const faceBonus = faceDetected ? 10 : -20;
    const eyeContactRatio = eyeContact / Math.max(1, eyeContact + lookingAway);
    const eyeContactBonus = eyeContactRatio * 15;
    const score = Math.max(0, baseScore - tabPenalty - focusPenalty + faceBonus + eyeContactBonus);
    setConfidenceScore(Math.round(score));
  }, [tabSwitches, focusLosses, faceDetected, eyeContact, lookingAway, isInterviewStarted]);

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

  // Face Detection
  const detectFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Simple face detection using skin tone and face proportions
    let skinPixels = 0;
    let totalPixels = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Skin tone detection (simplified)
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinPixels++;
      }
    }
    
    const skinRatio = skinPixels / totalPixels;
    const facePresent = skinRatio > 0.02; // Threshold for face detection
    
    setFaceDetected(facePresent);
    
    // Eye contact simulation (center region focus)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerRegion = 100;
    
    let centerPixels = 0;
    for (let y = centerY - centerRegion; y < centerY + centerRegion; y++) {
      for (let x = centerX - centerRegion; x < centerX + centerRegion; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const idx = (y * canvas.width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          
          if (r > 95 && g > 40 && b > 20) {
            centerPixels++;
          }
        }
      }
    }
    
    if (facePresent) {
      if (centerPixels > 500) {
        setEyeContact(prev => prev + 1);
      } else {
        setLookingAway(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (videoRef.current && isInterviewStarted) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 }, 
            audio: false 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            
            // Start face detection
            faceDetectionRef.current = setInterval(detectFace, 1000);
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
      if (faceDetectionRef.current) {
        clearInterval(faceDetectionRef.current);
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
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Voice Interview"
        description="Practice with our AI interviewer using voice commands"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Interview Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                {!isInterviewStarted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Video className="h-12 w-12 mx-auto mb-2" />
                      <p>Camera will start when interview begins</p>
                    </div>
                  </div>
                )}
                {isInterviewStarted && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={faceDetected ? "default" : "destructive"} className="text-xs">
                      {faceDetected ? "Face ✓" : "No Face"}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleStartListening}
                    disabled={isListening || isSpeaking}
                    variant={isListening ? "destructive" : "default"}
                    size="sm"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? 'Listening...' : 'Start Speaking'}
                  </Button>
                  
                  {isSpeaking && (
                    <Badge variant="secondary" className="animate-pulse">
                      <Volume2 className="h-3 w-3 mr-1" />
                      AI Speaking
                    </Badge>
                  )}
                </div>
                
                {isInterviewStarted && (
                  <div className="text-sm text-muted-foreground">
                    Duration: {formatTime(interviewDuration)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        {message.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                      </div>
                      <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                        <p className="text-sm">{message.content}</p>
                        {message.timestamp && (
                          <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response or use voice..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Settings & Analytics */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Voice Gender</Label>
                <RadioGroup value={voiceGender} onValueChange={(value: 'male' | 'female') => setVoiceGender(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoSend"
                  checked={autoSendEnabled}
                  onChange={(e) => setAutoSendEnabled(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="autoSend">Auto-send voice messages</Label>
              </div>
            </CardContent>
          </Card>
          
          {isInterviewStarted && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Confidence Score:</span>
                  <Badge variant={confidenceScore >= 80 ? "default" : confidenceScore >= 60 ? "secondary" : "destructive"}>
                    {confidenceScore}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Face Detected:</span>
                  <Badge variant={faceDetected ? "default" : "destructive"} className="text-xs">
                    {faceDetected ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Eye Contact:</span>
                  <span className="text-sm font-medium">
                    {Math.round((eyeContact / Math.max(1, eyeContact + lookingAway)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tab Switches:</span>
                  <span className="text-sm font-medium">{tabSwitches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Focus Losses:</span>
                  <span className="text-sm font-medium">{focusLosses}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {warnings.slice(-5).map((warning, index) => (
                    <p key={index} className="text-xs text-orange-600">{warning}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
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