'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users, Activity, Smile, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VideoInterviewPage() {
  const { toast } = useToast();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analysisInterval, setAnalysisInterval] = useState<NodeJS.Timeout | null>(null);
  const [liveEmotions, setLiveEmotions] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [stream, analysisInterval]);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      
      setIsCallActive(true);
      startAIAnalysis();
      toast({ title: 'Call Started', description: 'AI Emotion detection enabled' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Could not access camera/microphone', 
        variant: 'destructive' 
      });
    }
  };

  const startAIAnalysis = () => {
    // Simulate real-time analysis loop
    const interval = setInterval(async () => {
        try {
            // In a real app, capture frame from video element here
            // const frame = captureVideoFrame(localVideoRef.current);
            const response = await fetch('/api/ai/features', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'analyze_interview_emotion', 
                    data: { image: 'placeholder-base64' } 
                })
            });
            const json = await response.json();
            if(json.success) {
                setLiveEmotions(json.data);
            }
        } catch (e) {
            console.error("Analysis failed", e);
        }
    }, 3000); // Analyze every 3 seconds
    setAnalysisInterval(interval);
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (analysisInterval) clearInterval(analysisInterval);
    setIsCallActive(false);
    setLiveEmotions(null);
    toast({ title: 'Call Ended', description: 'Session analysis saved.' });
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

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        toast({ title: 'Screen Sharing', description: 'Now sharing your screen' });
      } else {
        if (stream && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AI Video Interview</h1>
            <p className="text-muted-foreground">Real-time emotion & confidence analysis</p>
        </div>
        {isCallActive && (
            <Badge variant="outline" className="px-4 py-2 border-red-500 text-red-500 animate-pulse bg-red-50">
                ● Recording & Analyzing
            </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden border-2 border-slate-200 shadow-xl relative">
            <CardContent className="p-0">
              <div className="relative bg-slate-900 aspect-video">
                <video
                  ref={remoteVideoRef} // In a real peer-to-peer, this would be remote stream
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* AI Overlay */}
                {isCallActive && liveEmotions && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-3 rounded-xl border border-white/20 shadow-lg animate-in fade-in transition-all">
                        <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-1">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">Live AI Insights</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-slate-300">Confidence</span>
                                <div className="h-2 w-16 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${liveEmotions.engagement}%` }}></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-slate-300">Emotion</span>
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30">
                                    {liveEmotions.emotions[0]?.name || 'Analyzing...'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {!isCallActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm animate-bounce">
                          <Users className="h-10 w-10 text-blue-400" />
                      </div>
                      <p className="text-xl font-medium">Waiting for candidate...</p>
                      <p className="text-sm text-slate-400 mt-2">Start the call to enable AI features</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                {!isCallActive ? (
                  <Button onClick={startCall} size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                    <Video className="h-5 w-5 mr-2" />
                    Start Interview
                  </Button>
                ) : (
                  <>
                    <Button onClick={toggleVideo} variant={isVideoOn ? 'default' : 'secondary'} size="lg" className="rounded-full w-12 h-12 p-0">
                      {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-red-500" />}
                    </Button>
                    <Button onClick={toggleAudio} variant={isAudioOn ? 'default' : 'secondary'} size="lg" className="rounded-full w-12 h-12 p-0">
                      {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-500" />}
                    </Button>
                    <Button onClick={toggleScreenShare} variant="outline" size="lg" className="rounded-full w-12 h-12 p-0">
                      <Monitor className="h-5 w-5" />
                    </Button>
                    <Button onClick={endCall} variant="destructive" size="lg" className="rounded-full w-16 h-12">
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
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
                />
                {!isCallActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <VideoOff className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-600" />
                Live Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {liveEmotions ? (
                   <div className="space-y-3">
                       {liveEmotions.emotions.map((e: any, i: number) => (
                           <div key={i}>
                               <div className="flex justify-between text-sm mb-1">
                                   <span className="font-medium">{e.name}</span>
                                   <span className="text-muted-foreground">{e.score}%</span>
                               </div>
                               <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                   <div className="h-full bg-purple-500" style={{width: `${e.score}%`}}></div>
                               </div>
                           </div>
                       ))}
                       <div className="pt-4 border-t mt-4">
                           <div className="flex items-center gap-2 mb-2">
                               <Smile className="w-4 h-4 text-orange-500" />
                               <span className="text-sm font-semibold">Engagement Score</span>
                           </div>
                           <div className="text-2xl font-bold text-slate-800">{liveEmotions.engagement}/100</div>
                           <p className="text-xs text-muted-foreground">Based on eye contact & expression</p>
                       </div>
                   </div>
               ) : (
                   <p className="text-sm text-muted-foreground text-center py-8">
                       Start the call to see real-time emotional intelligence metrics.
                   </p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
