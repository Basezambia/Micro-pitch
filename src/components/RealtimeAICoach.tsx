'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Square, Bot, User, RotateCcw, Clock, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface RealtimeAICoachProps {
  onSessionEnd?: (finalTranscript: string, messages: Message[]) => void;
  className?: string;
}

interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

const AI_COACH_SYSTEM_PROMPT = `You are an expert AI pitch coach specializing in helping entrepreneurs improve their pitch delivery. Your role is to:

1. PRONUNCIATION & CLARITY: Help users pronounce words clearly and speak at an appropriate pace
2. TONE & ENERGY: Guide users to use the right tone, energy level, and vocal variety
3. PITCH STRUCTURE: Ensure the pitch flows logically and hits key points
4. ENGAGEMENT: Help users sound confident, passionate, and engaging
5. DELIVERY TIPS: Provide specific, actionable feedback on presentation skills

Be PROACTIVE and ask specific coaching questions like:
- "I noticed you're speaking quite fast - try slowing down for emphasis on key points"
- "Your tone sounds a bit flat - can you add more energy when talking about your solution?"
- "The word '[specific word]' wasn't clear - try emphasizing the consonants"
- "Great passion! Now let's work on pausing after important statements"
- "I can help you with pacing - try taking a breath between main points"
- "Your energy dipped when explaining the problem - investors need to feel the urgency"

Provide immediate, specific feedback on:
- Speaking pace (too fast/slow)
- Pronunciation of specific words
- Vocal energy and enthusiasm
- Clarity and articulation
- Pauses and emphasis
- Confidence in delivery

Keep responses brief (1-2 sentences), encouraging, and immediately actionable. Focus on one specific improvement at a time. Always be supportive while being direct about areas for improvement.`;

// Add proactive coaching prompts that trigger based on speech patterns
const PROACTIVE_COACHING_PROMPTS = [
  "How's your pacing feeling? Remember to slow down on key points for emphasis.",
  "Let's work on your tone - try adding more energy and enthusiasm to your voice.",
  "Focus on clear pronunciation - make sure every word is crisp and understandable.",
  "Great start! Now let's add some strategic pauses after important statements.",
  "I'm listening for confidence in your voice - speak with authority about your solution.",
  "Remember to vary your vocal energy - get excited about the benefits you're describing!"
];

const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function RealtimeAICoach({
  onSessionEnd,
  className = ''
}: RealtimeAICoachProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [hasIntroduced, setHasIntroduced] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const lastTranscriptRef = useRef('');
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add proactive coaching during session
  useEffect(() => {
    if (isRecording && transcript.length > 50) {
      const coachingInterval = setInterval(() => {
        const randomPrompt = PROACTIVE_COACHING_PROMPTS[Math.floor(Math.random() * PROACTIVE_COACHING_PROMPTS.length)];
        const coachingMessage: Message = {
          id: Date.now().toString() + '_coaching',
          type: 'ai',
          content: randomPrompt,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, coachingMessage]);
      }, 30000); // Every 30 seconds during active session

      return () => clearInterval(coachingInterval);
    }
  }, [isRecording, transcript]);

  // Add introduction when component mounts
  useEffect(() => {
    if (!hasIntroduced) {
      const introMessage: Message = {
        id: 'intro',
        type: 'ai',
        content: "Hi! I'm your AI Pitch Coach. I'm here to help you improve your pitch delivery, pronunciation, tone, and overall presentation skills. Click 'Start Coaching' when you're ready to begin your 5-minute practice session!",
        timestamp: new Date()
      };
      setMessages([introMessage]);
      setHasIntroduced(true);
    }
  }, [hasIntroduced]);

  // Timer effect
  useEffect(() => {
    if (isRecording && sessionStartTime) {
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime;
        const remaining = Math.max(0, SESSION_DURATION - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          // Auto-cutoff when time is up
          stopSession();
        }
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRecording, sessionStartTime]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const cleanup = useCallback(() => {
    // Clear AI timeout
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }

    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

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
    setSessionStartTime(null);
    setTimeRemaining(SESSION_DURATION);
  }, []);

  // Get AI response for transcript
  const getAIResponse = useCallback(async (userTranscript: string) => {
    if (!userTranscript.trim() || isProcessingAI) return;

    setIsProcessingAI(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userTranscript,
          systemPrompt: AI_COACH_SYSTEM_PROMPT,
          conversationHistory: messages.slice(-4) // Include last 4 messages for context
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: Date.now().toString() + '_ai',
          type: 'ai',
          content: data.response || 'I heard you, keep going!',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsProcessingAI(false);
    }
  }, [messages, isProcessingAI]);

  // Debounced AI response trigger
  const triggerAIResponse = useCallback((newTranscript: string) => {
    // Clear existing timeout
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }

    // Set new timeout to trigger AI response after user stops speaking
    aiTimeoutRef.current = setTimeout(() => {
      const trimmedTranscript = newTranscript.trim();
      const lastTrimmedTranscript = lastTranscriptRef.current.trim();
      
      // Only trigger AI if there's new meaningful content
      if (trimmedTranscript && trimmedTranscript !== lastTrimmedTranscript && trimmedTranscript.length > lastTrimmedTranscript.length + 10) {
        const newContent = trimmedTranscript.slice(lastTrimmedTranscript.length).trim();
        
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: newContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Get AI response
        getAIResponse(newContent);
        lastTranscriptRef.current = trimmedTranscript;
      }
    }, 2000); // Wait 2 seconds after user stops speaking
  }, [getAIResponse]);

  const startSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setConnectionStatus('connecting');
      setTranscript('');
      lastTranscriptRef.current = '';
      setSessionStartTime(Date.now());
      setTimeRemaining(SESSION_DURATION);

      // Add coaching start message
      const startMessage: Message = {
        id: 'start_' + Date.now(),
        type: 'ai',
        content: "Great! I'm listening now. Start speaking about your pitch and I'll provide real-time feedback on your delivery, pronunciation, and tone. Remember, you have 5 minutes!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, startMessage]);

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
                  triggerAIResponse(newTranscript);
                }
                break;
              
              case 'input_audio_buffer.speech_started':
                console.log('Speech started');
                // Clear AI timeout when user starts speaking
                if (aiTimeoutRef.current) {
                  clearTimeout(aiTimeoutRef.current);
                  aiTimeoutRef.current = null;
                }
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
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
      cleanup();
    }
  }, [transcript, triggerAIResponse, cleanup]);

  const stopSession = useCallback(() => {
    if (transcript && onSessionEnd) {
      onSessionEnd(transcript, messages);
    }
    cleanup();
    setTranscript('');
    setMessages([]);
  }, [transcript, messages, onSessionEnd, cleanup]);

  const resetSession = useCallback(() => {
    cleanup();
    setTranscript('');
    setError(null);
    setTimeRemaining(SESSION_DURATION);
    setSessionStartTime(null);
    
    // Reset to introduction message
    const introMessage: Message = {
      id: 'intro_reset',
      type: 'ai',
      content: "Hi! I'm your AI Pitch Coach. I'm here to help you improve your pitch delivery, pronunciation, tone, and overall presentation skills. Click 'Start Coaching' when you're ready to begin your 5-minute practice session!",
      timestamp: new Date()
    };
    setMessages([introMessage]);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-blue-400" />
            AI PITCH COACH
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                  'bg-gray-400'
                }`}
              />
              <span className="text-sm text-gray-300 capitalize">
                {connectionStatus}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
              onClick={resetSession}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              RESET
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        {isRecording && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Session Time Remaining:</span>
              </div>
              <div className={`text-xl font-mono font-bold ${
                timeRemaining <= 60000 ? 'text-red-400' : 'text-blue-400'
              }`}>
                {Math.floor(timeRemaining / 60000)}:{String(Math.floor((timeRemaining % 60000) / 1000)).padStart(2, '0')}
              </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeRemaining <= 60000 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(timeRemaining / SESSION_DURATION) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Control Button */}
        <div className="mb-6">
          <Button
            onClick={isRecording ? stopSession : startSession}
            disabled={isConnecting}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="w-full flex items-center justify-center gap-3 text-lg py-4"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Connecting to AI Coach...
              </>
            ) : isRecording ? (
              <>
                <Square className="h-6 w-6" />
                Stop Coaching Session
              </>
            ) : (
              <>
                <Mic className="h-6 w-6" />
                Start 5-Minute Coaching Session
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Live Transcript */}
        {isRecording && transcript && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h3 className="font-medium mb-2 text-white flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Live Transcript:
            </h3>
            <div className="text-gray-300 whitespace-pre-wrap">
              {transcript}
              <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* AI Coach Conversation */}
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3 className="font-medium text-white">AI Coach Feedback</h3>
            {isProcessingAI && (
              <Badge variant="secondary" className="ml-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-1"></div>
                Analyzing...
              </Badge>
            )}
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${
                    message.type === 'ai' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      message.type === 'ai'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.type === 'ai' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}