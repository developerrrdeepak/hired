'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Send, Bot, User, Shield, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Peer from 'peerjs';

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
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
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

  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    if (mode === 'ai' && stream && mainVideoRef.current) {
      mainVideoRef.current.srcObject = stream;
    }
  }, [stream, mode]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const createRoom = async () => {
    await startCamera();
    const peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', (id) => {
      setRoomId(id);
      setIsCallActive(true);
      toast({ title: 'Room Created', description: `Room ID: ${id}` });
    });

    peer.on('call', (call) => {
      if (stream) {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });
        callRef.current = call;
      }
    });

    peerRef.current = peer;
  };

  const joinRoom = async () => {
    if (!joinRoomId.trim()) {
      toast({ title: 'Error', description: 'Enter Room ID', variant: 'destructive' });
      return;
    }
    
    await startCamera();
    const peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', () => {
      if (stream) {
        const call = peer.call(joinRoomId, stream);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });
        callRef.current = call;
        setRoomId(joinRoomId);
        setIsCallActive(true);
        toast({ title: 'Joined', description: `Room: ${joinRoomId}` });
      }
    });

    peerRef.current = peer;
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
    } catch (error) {
      console.error('Camera error:', error);
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
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setRemoteStream(null);
    setIsCallActive(false);
    setRoomId('');
    setJoinRoomId('');
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
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Video Interview</h1>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'ai' | 'real')} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="ai" className="flex-1">AI Interview</TabsTrigger>
          <TabsTrigger value="real" className="flex-1">Real Interview</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          {!isCallActive ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">AI Interview Mode</h3>
                <p className="text-muted-foreground mb-6">Practice with AI-powered interviewer</p>
                <Button onClick={startAIInterview}>Start AI Interview</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <div className="relative aspect-video bg-black">
                    {stream ? (
                      <video ref={mainVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-24 h-24 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-64 overflow-y-auto space-y-3 p-4 bg-muted rounded-lg">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
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
                      />
                      <Button onClick={sendMessage} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center gap-2">
                  <Button onClick={toggleVideo} variant={isVideoOn ? 'default' : 'destructive'} size="icon">
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  <Button onClick={toggleAudio} variant={isAudioOn ? 'default' : 'destructive'} size="icon">
                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button onClick={endCall} variant="destructive" size="icon">
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Your Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      {stream ? (
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle>Create Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Start a new interview room</p>
                  <Button onClick={createRoom} className="w-full">Create & Start</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Join Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="Enter Room ID"
                  />
                  <Button onClick={joinRoom} className="w-full">Join Interview</Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <div className="relative aspect-video bg-black">
                    {remoteStream ? (
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted-foreground">Waiting for interviewer...</p>
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
                  <Button onClick={toggleVideo} variant={isVideoOn ? 'default' : 'destructive'} size="icon">
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  <Button onClick={toggleAudio} variant={isAudioOn ? 'default' : 'destructive'} size="icon">
                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button onClick={endCall} variant="destructive" size="icon">
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Your Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      {stream ? (
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
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
  );
}
