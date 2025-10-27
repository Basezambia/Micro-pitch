'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Square } from 'lucide-react';

interface RealtimeTranscriptionProps {
  onTranscriptionUpdate?: (text: string) => void;
  onSessionEnd?: (finalTranscript: string) => void;
  className?: string;
}

interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

export default function RealtimeTranscription({
  onTranscriptionUpdate,
  onSessionEnd,
  className = ''
}: RealtimeTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clean up audio element
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    setConnectionStatus('disconnected');
    setIsRecording(false);
    setIsConnecting(false);
  }, []);

  const startTranscription = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setConnectionStatus('connecting');

      // Get user media
      const localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        } 
      });
      localStreamRef.current = localStream;

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      // Set up audio element for playback
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;

      // Handle incoming audio stream
      pc.ontrack = (event) => {
        console.log('Received remote track:', event);
        if (audioEl) {
          audioEl.srcObject = event.streams[0];
        }
      };

      // Handle data channel for transcription events
      pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannelRef.current = dataChannel;
        
        dataChannel.onopen = () => {
          console.log('Data channel opened');
          setConnectionStatus('connected');
          setIsRecording(true);
          setIsConnecting(false);
        };

        dataChannel.onmessage = (event) => {
          try {
            const data: RealtimeEvent = JSON.parse(event.data);
            console.log('Received realtime event:', data);
            
            // Handle different event types
            switch (data.type) {
              case 'conversation.item.input_audio_transcription.completed':
                if (data.transcript) {
                  const newTranscript = transcript + ' ' + data.transcript;
                  setTranscript(newTranscript);
                  onTranscriptionUpdate?.(newTranscript);
                }
                break;
              
              case 'input_audio_buffer.speech_started':
                console.log('Speech started');
                break;
              
              case 'input_audio_buffer.speech_stopped':
                console.log('Speech stopped');
                break;
              
              case 'error':
                console.error('Realtime API error:', data);
                setError(data.error?.message || 'Unknown error occurred');
                break;
            }
          } catch (err) {
            console.error('Error parsing data channel message:', err);
          }
        };

        dataChannel.onerror = (error) => {
          console.error('Data channel error:', error);
          setError('Data channel error occurred');
        };

        dataChannel.onclose = () => {
          console.log('Data channel closed');
          setConnectionStatus('disconnected');
        };
      };

      // Add local audio track
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Get ephemeral key
      const tokenResponse = await fetch('/api/realtime/ephemeral-key');
      if (!tokenResponse.ok) {
        throw new Error('Failed to get ephemeral key');
      }
      
      const { ephemeral_key } = await tokenResponse.json();

      // Send offer to OpenAI Realtime API
      const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${ephemeral_key}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: answerSdp,
      };

      await pc.setRemoteDescription(answer);

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setError('Connection failed');
          cleanup();
        }
      };

    } catch (err) {
      console.error('Error starting transcription:', err);
      setError(err instanceof Error ? err.message : 'Failed to start transcription');
      cleanup();
    }
  }, [transcript, onTranscriptionUpdate, cleanup]);

  const stopTranscription = useCallback(() => {
    if (transcript && onSessionEnd) {
      onSessionEnd(transcript);
    }
    cleanup();
    setTranscript('');
  }, [transcript, onSessionEnd, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Real-time Transcription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={isRecording ? stopTranscription : startTranscription}
            disabled={isConnecting}
            variant={isRecording ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Connecting...
              </>
            ) : isRecording ? (
              <>
                <Square className="h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600 capitalize">
              {connectionStatus}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="min-h-[200px] p-4 bg-gray-50 rounded-md border">
          <h3 className="font-medium mb-2">Live Transcript:</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {transcript || (isRecording ? 'Listening...' : 'Click "Start Recording" to begin transcription')}
            {isRecording && (
              <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}