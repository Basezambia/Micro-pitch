"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceAgent from "@/components/VoiceAgent";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  MessageSquare, 
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Shield,
  Brain
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface FeedbackItem {
  type: 'strength' | 'improvement' | 'tip';
  content: string;
}

type UIState = 'selection' | 'recording' | 'feedback' | 'ai-coach';

export default function PracticePitch() {
  const { isSignedIn } = useIsSignedIn();
  const [uiState, setUIState] = useState<UIState>('selection');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [practiceMode, setPracticeMode] = useState<'free' | 'guided' | 'qa'>('guided');
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      window.location.href = '/';
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          const simulatedTranscript = "This is a simulated transcript of your pitch practice session.";
          setCurrentTranscript(simulatedTranscript);
          
          await getAIFeedback(simulatedTranscript);
          setUIState('feedback');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setUIState('recording');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const getAIFeedback = async (transcript: string) => {
    setIsProcessing(true);
    
    try {
      const feedbackResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pitch_feedback',
          content: transcript,
          pitchContext: `Practice mode: ${practiceMode}, Duration: ${formatTime(duration)}`
        })
      });

      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        
        const feedbackItems: FeedbackItem[] = [
          {
            type: 'strength',
            content: "Great opening hook - you captured attention immediately."
          },
          {
            type: 'improvement', 
            content: feedbackData.response
          },
          {
            type: 'tip',
            content: "Try to include specific metrics to strengthen your claims."
          }
        ];
        
        setFeedback(feedbackItems);
      }

      if (practiceMode === 'qa') {
        const questionResponse = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'question_generator',
            content: transcript
          })
        });

        if (questionResponse.ok) {
          const questionData = await questionResponse.json();
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: `Great pitch! Here are some questions investors might ask:\n\n${questionData.response}`,
            timestamp: new Date()
          }]);
        }
      }

    } catch (error) {
      console.error('Error getting AI feedback:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle AI coach integration
  const handleAICoachTranscript = (transcript: string) => {
    setCurrentTranscript(transcript);
  };

  const handleAICoachResponse = (response: string) => {
    // Add AI response to messages
    const newMessage: Message = {
      id: Date.now().toString() + '_ai',
      type: 'ai',
      content: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const resetPractice = () => {
    setIsRecording(false);
    setIsPlaying(false);
    setMessages([]);
    setCurrentTranscript("");
    setFeedback([]);
    setDuration(0);
    setUIState('selection');
  };

  const modes = [
    {
      id: 'free',
      name: 'Free Practice',
      description: 'Practice your pitch without guidance',
      icon: Mic,
      color: 'from-blue-600 to-blue-800',
      accent: 'border-blue-500'
    },
    {
      id: 'guided',
      name: 'AI Coach',
      description: 'Get real-time AI coaching',
      icon: Brain,
      color: 'from-purple-600 to-purple-800',
      accent: 'border-purple-500'
    },
    {
      id: 'qa',
      name: 'Investor Q&A',
      description: 'Practice answering investor questions',
      icon: MessageSquare,
      color: 'from-green-600 to-green-800',
      accent: 'border-green-500'
    }
  ];

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Brutalist geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-transparent transform -rotate-45 -translate-x-48 -translate-y-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400/10 to-transparent transform rotate-45 translate-x-48 translate-y-48" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-transparent transform -translate-x-32 -translate-y-32" />
      </div>

      <div className="relative z-10 p-8">
        {/* Brutalist Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="border-l-8 border-yellow-400 pl-6 mb-4">
            <h1 className="text-6xl font-black tracking-tight mb-2 text-white">
              PRACTICE
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              MASTER YOUR PITCH WITH AI-POWERED PRECISION
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Mode Selection State */}
          {uiState === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = practiceMode === mode.id;
                  
                  return (
                    <motion.div
                      key={mode.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative cursor-pointer group ${isSelected ? 'z-10' : ''}`}
                      onClick={() => setPracticeMode(mode.id as any)}
                    >
                      <div className={`
                        bg-gradient-to-br ${mode.color} p-8 
                        border-4 ${isSelected ? mode.accent : 'border-gray-700'} 
                        shadow-2xl transform transition-all duration-300
                        ${isSelected ? 'shadow-yellow-400/20 scale-105' : 'hover:shadow-xl'}
                      `}>
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`
                            w-20 h-20 rounded-full bg-black/20 flex items-center justify-center
                            border-2 ${isSelected ? 'border-white' : 'border-gray-400'}
                          `}>
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-black mb-2 text-white">
                              {mode.name.toUpperCase()}
                            </h3>
                            <p className="text-gray-200 font-medium">
                              {mode.description}
                            </p>
                          </div>
                          
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                            >
                              <div className="w-2 h-2 bg-black rounded-full" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl px-12 py-6 border-4 border-black shadow-lg transform hover:scale-105 transition-all"
                  onClick={() => {
                    if (practiceMode === 'guided') {
                      setUIState('ai-coach');
                    } else {
                      startRecording();
                    }
                  }}
                >
                  START PRACTICE
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* AI Coach State */}
          {uiState === 'ai-coach' && (
            <motion.div
              key="ai-coach"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-purple-900/50 to-black border-4 border-purple-500 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-white">AI COACH ACTIVE</h2>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-400 text-white hover:bg-gray-800"
                    onClick={resetPractice}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    RESET
                  </Button>
                </div>
                
                <VoiceAgent 
                  promptId="pm_6743e5b5e4b0b8b8b8b8b8b8"
                  onTranscript={(transcript) => {
                    setCurrentTranscript(transcript);
                    const userMessage: Message = {
                      id: Date.now().toString(),
                      type: 'user',
                      content: transcript,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, userMessage]);
                  }}
                  onAIResponse={(response) => {
                    const aiMessage: Message = {
                      id: Date.now().toString() + '_ai',
                      type: 'ai',
                      content: response,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);
                  }}
                />
              </div>
            </motion.div>
          )}



          {/* Recording State */}
          {uiState === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="bg-gradient-to-br from-red-900/50 to-black border-4 border-red-500 p-12 shadow-2xl">
                <div className="mb-8">
                  <Badge className="bg-red-500 text-white text-lg px-6 py-2 font-black animate-pulse">
                    ● RECORDING - {formatTime(duration)}
                  </Badge>
                </div>

                <div className="relative mb-8">
                  <motion.div
                    className="w-40 h-40 mx-auto rounded-full bg-red-500/20 border-8 border-red-500 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <MicOff className="w-16 h-16 text-red-400" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute inset-0 rounded-full border-8 border-red-400/50"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-white mb-4">
                    PITCH IN PROGRESS
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Speak clearly and confidently. Your AI coach is listening.
                  </p>
                  
                  <Button
                    size="lg"
                    className="bg-gray-800 hover:bg-gray-700 text-white font-black text-xl px-12 py-6 border-4 border-gray-600"
                    onClick={stopRecording}
                  >
                    <MicOff className="w-6 h-6 mr-2" />
                    STOP RECORDING
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback State */}
          {uiState === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transcript */}
                <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-gray-600 p-6 shadow-xl">
                  <h3 className="text-2xl font-black text-white mb-4 border-b-2 border-gray-600 pb-2">
                    TRANSCRIPT
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{currentTranscript}</p>
                </div>

                {/* AI Feedback */}
                <div className="space-y-4">
                  {feedback.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className={`
                        p-6 border-4 shadow-xl
                        ${item.type === 'strength' 
                          ? 'bg-gradient-to-br from-green-900/50 to-black border-green-500' 
                          : item.type === 'improvement'
                            ? 'bg-gradient-to-br from-yellow-900/50 to-black border-yellow-500'
                            : 'bg-gradient-to-br from-blue-900/50 to-black border-blue-500'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-4">
                        {item.type === 'strength' && <TrendingUp className="w-8 h-8 text-green-400 mt-1 flex-shrink-0" />}
                        {item.type === 'improvement' && <Target className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />}
                        {item.type === 'tip' && <Zap className="w-8 h-8 text-blue-400 mt-1 flex-shrink-0" />}
                        <div>
                          <h4 className="text-lg font-black text-white mb-2">
                            {item.type.toUpperCase()}
                          </h4>
                          <p className="text-gray-300">{item.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-12 space-x-4">
                <Button
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl px-8 py-4 border-4 border-black"
                  onClick={resetPractice}
                >
                  PRACTICE AGAIN
                </Button>
                
                {practiceMode === 'qa' && (
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white font-black text-xl px-8 py-4 border-4 border-green-800"
                    onClick={() => setUIState('ai-coach')}
                  >
                    ANSWER QUESTIONS
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}