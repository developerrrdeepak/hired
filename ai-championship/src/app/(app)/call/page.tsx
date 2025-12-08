'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function CallContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'voice';
  const { toast } = useToast();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isConnecting) {
      const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isConnecting]);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video'
        });
        streamRef.current = stream;
        
        if (localVideoRef.current && type === 'video') {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Media error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to access camera/microphone',
        });
      }
    };

    startMedia();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [type, toast]);

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current && type === 'video') {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    window.close();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gray-900/50 border-gray-700 backdrop-blur">
        <div className="p-6">
          {isConnecting ? (
            <div className="text-center py-20">
              <div className="animate-pulse mb-4">
                {type === 'video' ? (
                  <Video className="h-16 w-16 mx-auto text-primary" />
                ) : (
                  <Phone className="h-16 w-16 mx-auto text-primary" />
                )}
              </div>
              <p className="text-white text-xl">Connecting...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-white text-lg font-semibold">Call in Progress</p>
                <p className="text-gray-400">{formatDuration(callDuration)}</p>
              </div>

              {type === 'video' ? (
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-6">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                      <VideoOff className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto animate-pulse">
                      <Phone className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-white text-lg">Voice Call Active</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? 'destructive' : 'secondary'}
                  size="lg"
                  className="rounded-full h-14 w-14"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                {type === 'video' && (
                  <Button
                    variant={isVideoOff ? 'destructive' : 'secondary'}
                    size="lg"
                    className="rounded-full h-14 w-14"
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full h-16 w-16"
                  onClick={endCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-gray-900 flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <CallContent />
    </Suspense>
  );
}
