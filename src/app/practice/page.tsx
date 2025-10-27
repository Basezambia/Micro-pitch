"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceAgent from "@/components/VoiceAgent";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import { PitchPracticePayment } from "@/components/payments/BasePayComponents";
import { pay } from '@base-org/account';
import { useToast } from '@/hooks/use-toast';
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
import RealtimeTranscription from "@/components/RealtimeTranscription";
import RealtimeAICoach from "@/components/RealtimeAICoach";

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

type UIState = 'selection' | 'option-details' | 'payment' | 'recording' | 'feedback' | 'ai-coach' | 'realtime-transcription' | 'realtime-ai-coach';

export default function PracticePitch() {
  const { isSignedIn } = useIsSignedIn();
  const { toast } = useToast();
  const [uiState, setUIState] = useState<UIState>('selection');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [practiceMode, setPracticeMode] = useState<'free' | 'guided' | 'qa' | 'realtime'>('free');
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'free' | 'guided' | 'qa' | 'realtime' | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [useRealtimeTranscription, setUseRealtimeTranscription] = useState(false);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
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
        
        setIsProcessing(true);
        
        try {
          // Create FormData for transcription API
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.wav');
          
          // Call transcription API
          const transcriptionResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (transcriptionResponse.ok) {
            const transcriptionData = await transcriptionResponse.json();
            const transcript = transcriptionData.transcript || "Unable to transcribe audio. Please try again.";
            setCurrentTranscript(transcript);
            
            // Only get AI feedback for paid sessions
            if (isPaid) {
              await getAIFeedback(transcript);
            }
            setUIState('feedback');
          } else {
            // Fallback to simulated transcript if transcription fails
            const fallbackTranscript = "Transcription service unavailable. This is a simulated transcript of your pitch practice session.";
            setCurrentTranscript(fallbackTranscript);
            
            if (isPaid) {
              await getAIFeedback(fallbackTranscript);
            }
            setUIState('feedback');
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          // Fallback to simulated transcript
          const fallbackTranscript = "Error occurred during transcription. This is a simulated transcript of your pitch practice session.";
          setCurrentTranscript(fallbackTranscript);
          
          if (isPaid) {
            await getAIFeedback(fallbackTranscript);
          }
          setUIState('feedback');
        } finally {
          setIsProcessing(false);
        }
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

  // Handle direct Base Pay
  const handleDirectBasePay = async () => {
    if (!selectedOption) return;
    
    setIsPaymentProcessing(true);
    
    try {
      const result = await pay({
        amount: '1.00', // USD amount (USDC used internally)
        to: '0x742d35Cc6634C0532925a3b8D0C9e3e0C0C0C0C0', // Replace with actual recipient address
        testnet: true // Set to false for mainnet
      });

      // Payment successful - result contains id, amount, to properties
      setIsPaid(true);
      setPaymentId(result.id); // result.id is the transaction hash
      
      toast({
        title: "Payment Successful!",
        description: "Your practice session is now ready to start.",
      });

      // Automatically start the practice after payment
      if (selectedOption === 'guided') {
        setUIState('realtime-ai-coach');
      } else {
        startRecording();
      }
    } catch (error: any) {
      console.error('Base Pay failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentProcessing(false);
    }
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
      detailedDescription: 'Record your pitch and get basic feedback without any coaching or interruptions. Perfect for rehearsing your presentation flow and timing.',
      icon: Mic,
      color: 'from-blue-600 to-blue-800',
      accent: 'border-blue-500'
    },
    {
      id: 'guided',
      name: 'AI Coach',
      description: 'Get real-time AI coaching',
      detailedDescription: 'Practice with an AI coach that provides real-time feedback, suggestions, and guidance throughout your pitch. Interactive coaching to improve your delivery.',
      icon: Brain,
      color: 'from-purple-600 to-purple-800',
      accent: 'border-purple-500'
    },
    {
      id: 'qa',
      name: 'Investor Q&A',
      description: 'Practice answering investor questions',
      detailedDescription: 'Simulate a real investor meeting with AI-generated questions based on your pitch. Practice handling tough questions and objections.',
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
      {/* Geometric background matching dashboard */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-transparent transform -rotate-45 -translate-x-48 -translate-y-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400/10 to-transparent transform rotate-45 translate-x-48 translate-y-48" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-transparent transform -translate-x-32 -translate-y-32" />
      </div>

      <div className="relative z-10 p-8">
        {/* Header matching dashboard style */}
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
                  
                  return (
                    <motion.div
                      key={mode.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative cursor-pointer group"
                      onClick={() => {
                        setSelectedOption(mode.id as any);
                        setUIState('option-details');
                      }}
                    >
                      <div className={`
                        bg-gray-900 p-8 
                        border-2 border-gray-700 hover:border-gray-600
                        shadow-2xl transform transition-all duration-300
                        hover:shadow-xl hover:shadow-yellow-400/10
                      `}>
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="w-20 h-20 rounded-full bg-black/20 flex items-center justify-center border-2 border-gray-400 group-hover:border-white transition-colors">
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
                          
                          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-6 h-6 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center">
                Choose a practice mode to get started
              </div>
            </motion.div>
          )}

          {/* Option Details State */}
          {uiState === 'option-details' && selectedOption && (
            <motion.div
              key="option-details"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-4xl mx-auto"
            >
              {(() => {
                const selectedMode = modes.find(mode => mode.id === selectedOption);
                if (!selectedMode) return null;
                
                const Icon = selectedMode.icon;
                
                return (
                  <div className="bg-gray-900 p-8 border-2 border-gray-700 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-600">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-white">{selectedMode.name.toUpperCase()}</h2>
                          <p className="text-gray-300">{selectedMode.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-2 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500"
                        onClick={() => {
                          setSelectedOption(null);
                          setUIState('selection');
                        }}
                      >
                        ← BACK
                      </Button>
                    </div>
                    
                    <div className="mb-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-3">What you'll get:</h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {selectedMode.detailedDescription}
                      </p>
                    </div>

                    <div className="text-center">
                       <div className="text-center">
                         {!isPaid ? (
                           <div className="space-y-6">
                             {/* Free Practice Option */}
                             <div className="space-y-4">
                               <Button
                                 size="lg"
                                 className="bg-gray-600 hover:bg-gray-700 text-white font-black text-xl px-12 py-6 border-2 border-gray-500 shadow-lg transform hover:scale-105 transition-all w-full"
                                 onClick={() => {
                                   setPracticeMode(selectedOption);
                                   if (selectedOption === 'guided') {
                                     setUIState('realtime-ai-coach');
                                   } else {
                                     startRecording();
                                   }
                                 }}
                               >
                                 START FREE PRACTICE
                                 <ArrowRight className="w-6 h-6 ml-2" />
                               </Button>
                               <p className="text-gray-400 text-sm">
                                 Basic practice session - no AI feedback
                               </p>
                             </div>

                             {/* Divider */}
                             <div className="flex items-center space-x-4">
                               <div className="flex-1 h-px bg-gray-600"></div>
                               <span className="text-gray-400 text-sm">OR</span>
                               <div className="flex-1 h-px bg-gray-600"></div>
                             </div>

                             {/* Paid Practice Option */}
                             <div className="space-y-4">
                               <Button
                                 size="lg"
                                 className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl px-12 py-6 border-4 border-black shadow-lg transform hover:scale-105 transition-all w-full"
                                 onClick={() => {
                                   setPracticeMode(selectedOption);
                                   handleDirectBasePay();
                                 }}
                                 disabled={isPaymentProcessing}
                               >
                                 {isPaymentProcessing ? 'Processing Payment...' : `START PREMIUM ${selectedMode.name.toUpperCase()}`}
                                 {!isPaymentProcessing && <ArrowRight className="w-6 h-6 ml-2" />}
                               </Button>
                               <p className="text-white/80 text-sm">
                                 Premium practice with AI feedback & analysis (0.001 ETH)
                               </p>
                             </div>
                           </div>
                         ) : (
                           <div className="space-y-4">
                             <div className="p-4 bg-green-400/20 border border-green-400/50 rounded-lg">
                               <p className="text-green-200">
                                 ✅ Payment completed! Ready to start your premium practice session.
                               </p>
                             </div>
                             <Button
                               size="lg"
                               className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl px-12 py-6 border-4 border-black shadow-lg transform hover:scale-105 transition-all"
                               onClick={() => {
                                 setPracticeMode(selectedOption);
                                 if (selectedOption === 'guided') {
                                   setUIState('ai-coach');
                                 } else {
                                   startRecording();
                                 }
                               }}
                             >
                               START PREMIUM {selectedMode.name.toUpperCase()}
                               <ArrowRight className="w-6 h-6 ml-2" />
                             </Button>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Payment State */}
          {uiState === 'payment' && selectedOption && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              {(() => {
                const selectedMode = modes.find(mode => mode.id === selectedOption);
                if (!selectedMode) return null;
                
                const Icon = selectedMode.icon;
                
                return (
                  <div className="bg-gray-900/95 border-4 border-yellow-400 p-8 shadow-2xl backdrop-blur-sm">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400/20 flex items-center justify-center border-2 border-yellow-400 mb-4">
                        <Icon className="w-8 h-8 text-yellow-400" />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2">
                        {selectedMode.name.toUpperCase()}
                      </h2>
                      <p className="text-gray-300">
                        Complete payment to start your practice session
                      </p>
                    </div>

                    <div className="mb-6">
                      <PitchPracticePayment
                        onPaymentSuccess={(paymentId) => {
                          setIsPaid(true);
                          setPaymentId(paymentId);
                          console.log('Payment successful:', paymentId);
                          // Automatically start the practice after payment
                          if (selectedOption === 'guided') {
                            setUIState('realtime-ai-coach');
                          } else {
                            startRecording();
                          }
                        }}
                        onPaymentError={(error) => {
                          console.error('Payment failed:', error);
                        }}
                      />
                    </div>

                    <div className="text-center">
                      <Button
                        variant="outline"
                        className="border-2 border-gray-400 text-white hover:bg-gray-800"
                        onClick={() => {
                          setUIState('option-details');
                        }}
                      >
                        ← BACK TO DETAILS
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Realtime AI Coach State */}
          {uiState === 'realtime-ai-coach' && (
            <motion.div
              key="realtime-ai-coach"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 border-2 border-gray-700 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-white">REAL-TIME AI COACH</h2>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500"
                    onClick={resetPractice}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    RESET
                  </Button>
                </div>
                
                <RealtimeAICoach 
                  onSessionEnd={(transcript, messages) => {
                    setCurrentTranscript(transcript);
                    setMessages(messages);
                    setUIState('feedback');
                  }}
                />
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
              <div className="bg-gray-900 border-2 border-gray-700 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-white">AI COACH ACTIVE</h2>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500"
                    onClick={resetPractice}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    RESET
                  </Button>
                </div>
                
                <VoiceAgent 
                  promptId="pmpt_68fb2d1827708193ab1bc2be4879229f0799b5c98bd97416"
                  transcriptContext={currentTranscript}
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
              <div className="bg-gray-900 border-2 border-gray-700 p-12 shadow-2xl">
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
                <div className="bg-gray-900 border-2 border-gray-700 p-6 shadow-xl">
                  <h3 className="text-2xl font-black text-white mb-4 border-b border-gray-700 pb-2">
                    TRANSCRIPT
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{currentTranscript}</p>
                </div>

                {/* AI Feedback or Free Practice Message */}
                <div className="space-y-4">
                  {isPaid ? (
                    // Show AI feedback for paid sessions
                    feedback.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-gray-900 border-2 border-gray-700 p-6 shadow-xl"
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
                    ))
                  ) : (
                    // Show upgrade message for free sessions
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-900 border-2 border-gray-700 p-6 shadow-xl"
                    >
                      <div className="flex items-start space-x-4">
                        <Shield className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-black text-white mb-2">
                            FREE PRACTICE COMPLETE
                          </h4>
                          <p className="text-gray-300 mb-4">
                            Great job practicing! Your speech has been transcribed above.
                          </p>
                          <p className="text-gray-400 text-sm">
                            💡 Upgrade to Premium Practice to get AI-powered feedback, suggestions, and detailed analysis of your pitch.
                          </p>
                          <Button
                            size="sm"
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold mt-4"
                            onClick={() => {
                              setUIState('option-details');
                              setIsPaid(false);
                            }}
                          >
                            Upgrade to Premium
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
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
                    onClick={() => {
                      // Pass the transcript context to the AI coach for enhanced feedback
                      setUIState('ai-coach');
                    }}
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