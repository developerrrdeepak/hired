'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Peer from 'simple-peer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function CallContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'voice';
  const isVideo = type === 'video';
  const { toast } = useToast();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  // Mocking remote stream for demo purposes since we don't have a signaling server in this context
  // In a real app, this would be replaced by actual WebRTC signaling logic (Socket.io/Firebase)
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo
        });
        streamRef.current = stream;
        
        if (localVideoRef.current && isVideo) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate connection delay
        setTimeout(() => {
            setCallStatus('connected');
            // Mock remote stream display (mirroring local for demo)
            if (remoteVideoRef.current && isVideo) {
               remoteVideoRef.current.srcObject = stream; // In real app, this is the peer stream
            }
        }, 2000);

      } catch (error) {
        console.error('Media error:', error);
        toast({
          variant: 'destructive',
          title: 'Media Access Error',
          description: 'Please check your camera/microphone permissions.',
        });
        setCallStatus('ended');
      }
    };

    startMedia();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
    };
  }, [isVideo, toast]);

  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current && isVideo) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    setCallStatus('ended');
    setTimeout(() => window.close(), 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callStatus === 'ended') {
      return (
        <div className="h-screen w-screen bg-gray-950 flex items-center justify-center">
            <div className="text-white text-center">
                <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
                <p className="text-gray-400">Closing window...</p>
            </div>
        </div>
      )
  }

  return (
    <div className="h-screen w-screen bg-gray-950 flex flex-col relative overflow-hidden">
      {/* Remote Video (Full Screen) */}
      {isVideo && (
        <div className="absolute inset-0 z-0">
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            {/* Overlay gradient for controls visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
        </div>
      )}

      {/* Voice Call UI (Centered) */}
      {!isVideo && (
          <div className="flex-1 flex flex-col items-center justify-center z-10">
              <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center mb-6 animate-pulse">
                  <User className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                  {callStatus === 'connecting' ? 'Calling...' : 'Connected'}
              </h2>
              <p className="text-gray-400 font-mono text-lg">{formatDuration(callDuration)}</p>
          </div>
      )}

      {/* Local Video (PiP) */}
      {isVideo && !isVideoOff && (
        <div className="absolute top-4 right-4 w-40 h-56 bg-black rounded-xl overflow-hidden border border-white/20 shadow-2xl z-20 transition-all hover:scale-105">
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror-mode"
                style={{ transform: 'scaleX(-1)' }}
            />
        </div>
      )}

      {/* Controls Bar */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center items-center gap-6">
        <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border-0"
            onClick={toggleMute}
        >
            {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
        </Button>

        {isVideo && (
            <Button
                variant={isVideoOff ? 'destructive' : 'secondary'}
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border-0"
                onClick={toggleVideo}
            >
                {isVideoOff ? <VideoOff className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
            </Button>
        )}

        <Button
            variant="destructive"
            size="icon"
            className="h-16 w-16 rounded-full shadow-xl bg-red-600 hover:bg-red-700 border-4 border-red-800"
            onClick={endCall}
        >
            <PhoneOff className="h-8 w-8 text-white" />
        </Button>
      </div>
      
      {/* Connecting Overlay for Video */}
      {isVideo && callStatus === 'connecting' && (
          <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/50 animate-pulse">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                  </Avatar>
                  <p className="text-white text-lg font-medium">Connecting...</p>
              </div>
          </div>
      )}
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <CallContent />
    </Suspense>
  );
}
