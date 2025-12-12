'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Send, Bot, User, Shield, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VideoInterviewPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'ai' | 'real'>('ai');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([
    { role: 'ai', content: 'Hello! I\'m your AI interviewer. Ready to begin?' }
  ]);
  const [input, setInput] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!isCallActive) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isCallActive]);

  const createRoom = async () => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);
    await startCamera();
    setIsCallActive(true);
    toast({ title: 'Room Created', description: `Room ID: ${id}` });
  };

  const joinRoom = async () => {
    if (!joinRoomId.trim()) {
      toast({ title: 'Error', description: 'Enter Room ID', variant: 'destructive' });
      return;
    }
    setRoomId(joinRoomId);
    await startCamera();
    setIsCallActive(true);
    toast({ title: 'Joined', description: `Room: ${joinRoomId}` });
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      if (mainVideoRef.current && mode === 'ai') {
        mainVideoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Camera access denied', variant: 'destructive' });
    }
  };

  const startAIInterview = async () => {
    await startCamera();
    setIsCallActive(true);
    toast({ title: 'AI Interview Started' });
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCallActive(false);
    setRoomId('');
    setMessages([{ role: 'ai', content: 'Hello! I\'m your AI interviewer. Ready to begin?' }]);
    toast({ title: 'Interview Ended' });
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isAudioOn;
      setIsAudioOn(!isAudioOn);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: 'Great answer! Tell me more about your experience.' }]);
    }, 1000);
    setInput('');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast({ title: 'Copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Video Interview
        </h1>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'ai' | 'real')} className="w-full">
          <TabsList className="w-full bg-[#1A1D24] border-b border-gray-800">
            <TabsTrigger value="ai" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
              AI Interview
            </TabsTrigger>
            <TabsTrigger value="real" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
              Real Interview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-6">
            {!isCallActive ? (
              <Card className="bg-[#1A1D24] border-gray-800">
                <CardContent className="p-12 text-center">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-xl font-semibold mb-2">AI Interview Mode</h3>
                  <p className="text-gray-400 mb-6">Practice with AI-powered interviewer</p>
                  <Button onClick={startAIInterview} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Start AI Interview
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="bg-[#1A1D24] border-gray-800 overflow-hidden">
                    <div className="relative aspect-video bg-black flex items-center justify-center">
                      <video ref={mainVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      {!stream && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Bot className="w-24 h-24 text-purple-500" />
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-[#1A1D24] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg">Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-64 overflow-y-auto space-y-3 p-4 bg-[#0D0F12] rounded-lg">
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              </div>
                              <div className={`rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                <p className="text-sm">{msg.content}</p>
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
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type your answer..."
                          className="bg-[#0D0F12] border-gray-700"
                        />
                        <Button onClick={sendMessage} size="icon" className="bg-gradient-to-r from-purple-600 to-blue-600">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center gap-2">
                    <Button onClick={toggleVideo} variant={isVideoOn ? 'default' : 'destructive'} size="icon" className="rounded-full">
                      {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button onClick={toggleAudio} variant={isAudioOn ? 'default' : 'destructive'} size="icon" className="rounded-full">
                      {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button onClick={endCall} variant="destructive" size="icon" className="rounded-full">
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="bg-[#1A1D24] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm">Your Feed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1A1D24] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        AI Proctoring
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tab Switches</span>
                        <Badge variant={tabSwitchCount > 2 ? 'destructive' : 'secondary'}>{tabSwitchCount}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge variant={tabSwitchCount > 2 ? 'destructive' : 'default'}>
                          {tabSwitchCount > 2 ? 'Suspicious' : 'Normal'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="real" className="mt-6">
            {!isCallActive ? (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#1A1D24] border-gray-800">
                  <CardHeader>
                    <CardTitle>Create Room</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">Start a new interview room</p>
                    <Button onClick={createRoom} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Create & Start
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A1D24] border-gray-800">
                  <CardHeader>
                    <CardTitle>Join Room</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      placeholder="Enter Room ID"
                      className="bg-[#0D0F12] border-gray-700"
                    />
                    <Button onClick={joinRoom} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Join Interview
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="bg-[#1A1D24] border-gray-800 overflow-hidden">
                    <div className="relative aspect-video bg-black flex items-center justify-center">
                      <video ref={mainVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      {!stream && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-gray-400">Waiting for interviewer...</p>
                        </div>
                      )}
                      {roomId && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white p-3 rounded-xl flex items-center gap-2">
                          <span className="text-xs">Room: {roomId}</span>
                          <Button size="sm" variant="ghost" onClick={copyRoomId} className="h-6 w-6 p-0">
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  <div className="flex justify-center gap-2">
                    <Button onClick={toggleVideo} variant={isVideoOn ? 'default' : 'destructive'} size="icon" className="rounded-full">
                      {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button onClick={toggleAudio} variant={isAudioOn ? 'default' : 'destructive'} size="icon" className="rounded-full">
                      {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button onClick={endCall} variant="destructive" size="icon" className="rounded-full">
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="bg-[#1A1D24] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm">Your Feed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1A1D24] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        AI Proctoring
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tab Switches</span>
                        <Badge variant={tabSwitchCount > 2 ? 'destructive' : 'secondary'}>{tabSwitchCount}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge variant={tabSwitchCount > 2 ? 'destructive' : 'default'}>
                          {tabSwitchCount > 2 ? 'Suspicious' : 'Normal'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
