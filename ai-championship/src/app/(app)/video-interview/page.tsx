'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users } from 'lucide-react';
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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
      toast({ title: 'Call Started', description: 'Video interview is now active' });
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
    toast({ title: 'Call Ended', description: 'Interview session completed' });
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
      <div>
        <h1 className="text-3xl font-bold">Video Interview</h1>
        <p className="text-muted-foreground">Conduct live video interviews with candidates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-black aspect-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isCallActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-600/20">
                    <div className="text-center text-white">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Waiting for interview to start...</p>
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
                  <Button onClick={startCall} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Video className="h-5 w-5 mr-2" />
                    Start Interview
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoOn ? 'default' : 'destructive'}
                      size="lg"
                    >
                      {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioOn ? 'default' : 'destructive'}
                      size="lg"
                    >
                      {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    <Button onClick={toggleScreenShare} variant="outline" size="lg">
                      <Monitor className="h-5 w-5" />
                    </Button>
                    <Button onClick={endCall} variant="destructive" size="lg">
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCallActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-2 border rounded-md resize-none"
                placeholder="Take notes during the interview..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
