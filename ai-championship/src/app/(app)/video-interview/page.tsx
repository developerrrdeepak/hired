'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users, Activity, Copy, Check, Code, FileText, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Editor from '@monaco-editor/react';

export default function VideoInterviewPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'ai' | 'peer'>('ai');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [code, setCode] = useState('// Write your code here\n');
  const [documentText, setDocumentText] = useState('');
  const [aiCheatingDetected, setAiCheatingDetected] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // AI Cheating Detection
  useEffect(() => {
    if (!isCallActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        if (tabSwitchCount >= 2) {
          setAiCheatingDetected(true);
          toast({
            title: 'Warning',
            description: 'Multiple tab switches detected!',
            variant: 'destructive'
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isCallActive, tabSwitchCount, toast]);

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);
    return id;
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Room ID copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const startCall = async (isPeer: boolean = false) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        await localVideoRef.current.play();
      }
      
      setIsCallActive(true);
      setTabSwitchCount(0);
      setAiCheatingDetected(false);
      
      if (isPeer && !roomId) {
        const newRoomId = generateRoomId();
        toast({ 
          title: 'Room Created', 
          description: `Share Room ID: ${newRoomId}`,
          duration: 5000 
        });
      }
      
      if (!isPeer) {
        toast({ title: 'AI Interview Started', description: 'AI analysis enabled' });
        setTimeout(() => analyzeInterview('start'), 3000);
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Could not access camera/microphone', 
        variant: 'destructive' 
      });
    }
  };

  const joinRoom = async () => {
    if (!joinRoomId.trim()) {
      toast({ title: 'Error', description: 'Please enter a Room ID', variant: 'destructive' });
      return;
    }
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        await localVideoRef.current.play();
      }
      
      setRoomId(joinRoomId);
      setIsCallActive(true);
      setTabSwitchCount(0);
      setAiCheatingDetected(false);
      
      toast({ 
        title: 'Joined Room', 
        description: `Connected to room: ${joinRoomId}`,
        duration: 3000 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Could not access camera/microphone', 
        variant: 'destructive' 
      });
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCallActive(false);
    setRoomId('');
    setJoinRoomId('');
    setShowCodeEditor(false);
    setShowDocuments(false);
    setIsScreenSharing(false);
    toast({ title: 'Call Ended' });
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(!isAudioOn);
    }
  };

  const analyzeInterview = async (type: string) => {
    if (mode !== 'ai') return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/video-interview/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: type === 'start' ? 'suggest-question' : 'analyze-confidence',
          data: { 
            text: type === 'start' ? 'Interview starting' : 'Analyzing performance',
            context: 'Technical interview'
          }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        toast({ title: 'Screen Sharing', description: 'Now sharing your screen' });
      } else {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        setIsScreenSharing(false);
        toast({ title: 'Screen Share Stopped' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Could not share screen', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Video Interview</h1>
            <p className="text-muted-foreground">AI Interview or Connect with Real Interviewer</p>
        </div>
        {isCallActive && (
          <div className="flex gap-2">
            {roomId && (
              <Badge variant="outline" className="px-4 py-2 border-green-500 text-green-500 bg-green-50">
                  ● Room: {roomId}
              </Badge>
            )}
            {aiCheatingDetected && (
              <Badge variant="destructive" className="px-4 py-2 animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Suspicious Activity
              </Badge>
            )}
          </div>
        )}
      </div>

      {!isCallActive && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Interview Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'ai' | 'peer')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai">AI Interview</TabsTrigger>
                <TabsTrigger value="peer">Real Interviewer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="space-y-4 mt-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Interview</h3>
                  <p className="text-sm text-muted-foreground mb-6">Practice with AI emotion & confidence analysis</p>
                  <Button onClick={() => startCall(false)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Video className="h-5 w-5 mr-2" />
                    Start AI Interview
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="peer" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Create Room
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Start a new interview room and share the ID with interviewer</p>
                      <Button onClick={() => startCall(true)} className="w-full">
                        Create & Start
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Join Room
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="roomId">Room ID</Label>
                        <Input 
                          id="roomId"
                          placeholder="Enter room ID"
                          value={joinRoomId}
                          onChange={(e) => setJoinRoomId(e.target.value)}
                        />
                      </div>
                      <Button onClick={joinRoom} className="w-full" variant="outline">
                        Join Interview
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {isCallActive && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden border-2 shadow-xl">
              <CardContent className="p-0">
                <div className="relative bg-slate-900 aspect-video">
                  {isScreenSharing ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                      <div className="text-center text-white">
                        <Users className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                        <p className="text-xl font-medium">{mode === 'ai' ? 'AI Interviewer' : 'Waiting for interviewer...'}</p>
                      </div>
                    </div>
                  )}
                  
                  {mode === 'peer' && roomId && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Room ID:</span>
                        <code className="text-sm font-mono">{roomId}</code>
                        <Button size="sm" variant="ghost" onClick={copyRoomId} className="h-6 w-6 p-0">
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  )}


                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Button onClick={toggleVideo} variant={isVideoOn ? 'default' : 'secondary'} size="lg" className="rounded-full w-12 h-12 p-0">
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-red-500" />}
                  </Button>
                  <Button onClick={toggleAudio} variant={isAudioOn ? 'default' : 'secondary'} size="lg" className="rounded-full w-12 h-12 p-0">
                    {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-500" />}
                  </Button>
                  <Button onClick={toggleScreenShare} variant={isScreenSharing ? 'default' : 'outline'} size="lg" className="rounded-full w-12 h-12 p-0">
                    <Monitor className="h-5 w-5" />
                  </Button>
                  <Button onClick={() => setShowCodeEditor(!showCodeEditor)} variant={showCodeEditor ? 'default' : 'outline'} size="lg" className="rounded-full w-12 h-12 p-0">
                    <Code className="h-5 w-5" />
                  </Button>
                  <Button onClick={() => setShowDocuments(!showDocuments)} variant={showDocuments ? 'default' : 'outline'} size="lg" className="rounded-full w-12 h-12 p-0">
                    <FileText className="h-5 w-5" />
                  </Button>
                  <Button onClick={endCall} variant="destructive" size="lg" className="rounded-full w-16 h-12">
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showCodeEditor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Live Code Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Editor
                    height="400px"
                    defaultLanguage="javascript"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {showDocuments && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Shared Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Share notes, requirements, or documents here..."
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    rows={10}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-950 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Your Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black aspect-video rounded-lg overflow-hidden border border-slate-800">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <Video className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  AI Proctoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Tab Switches</span>
                  <Badge variant={tabSwitchCount > 2 ? 'destructive' : 'secondary'}>
                    {tabSwitchCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge variant={aiCheatingDetected ? 'destructive' : 'default'}>
                    {aiCheatingDetected ? 'Suspicious' : 'Normal'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {mode === 'ai' && (
              <Card className="border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-purple-500" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isAnalyzing ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Analyzing...</div>
                  ) : aiAnalysis ? (
                    <div className="text-sm bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                      {aiAnalysis}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">AI will analyze your performance in real-time</div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Screen Share</Badge>
                  <span className="text-muted-foreground">Share your screen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Code Editor</Badge>
                  <span className="text-muted-foreground">Live coding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Documents</Badge>
                  <span className="text-muted-foreground">Share notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">AI Analysis</Badge>
                  <span className="text-muted-foreground">Real-time feedback</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
