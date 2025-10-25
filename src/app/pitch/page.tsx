"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, DollarSign, Users, Mic, MicOff, Video, VideoOff, Phone, MessageSquare } from "lucide-react";

interface PitchSessionProps {
  pitchId: string;
  investorId: string;
  ratePerSecond: number;
}

export default function PitchSession({ 
  pitchId = "demo-pitch", 
  investorId = "demo-investor", 
  ratePerSecond = 0.01 
}: Partial<PitchSessionProps> = {}) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSessionActive) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
        setTotalCost(prev => prev + ratePerSecond);
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
  }, [isSessionActive, ratePerSecond]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCost = (cost: number) => {
    return `$${(cost || 0).toFixed(4)}`;
  };

  const startSession = async () => {
    setSessionStatus('connecting');
    // Simulate connection
    setTimeout(() => {
      setIsSessionActive(true);
      setSessionStatus('active');
    }, 2000);
  };

  const endSession = async () => {
    setIsSessionActive(false);
    setSessionStatus('ended');
    
    // Here you would:
    // 1. Process payment via Base Pay
    // 2. Save session data to database
    // 3. Generate NFT certificate
    // 4. Handle recording upload to IPFS
  };

  const progressPercentage = Math.min((duration / 300) * 100, 100); // 5 minutes max

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pitch Session</h1>
            <p className="text-gray-400">Connect with investors in real-time</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
              <DollarSign className="w-4 h-4 mr-1" />
              {formatCost(ratePerSecond)}/sec
            </Badge>
            <Badge className={sessionStatus === 'active' ? 'bg-green-400/20 text-green-400 border-green-400/30' : 'bg-gray-400/20 text-gray-400 border-gray-400/30'}>
              {sessionStatus === 'active' ? '● Live' : sessionStatus === 'connecting' ? '● Connecting...' : '● Inactive'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  {/* Video placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {sessionStatus === 'idle' && (
                      <div className="text-center">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Ready to start your pitch</p>
                      </div>
                    )}
                    
                    {sessionStatus === 'connecting' && (
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-yellow-400">Connecting to investor...</p>
                      </div>
                    )}
                    
                    {sessionStatus === 'active' && (
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Users className="w-16 h-16 text-black" />
                        </div>
                        <p className="text-white">Investor Connected</p>
                      </div>
                    )}
                    
                    {sessionStatus === 'ended' && (
                      <div className="text-center">
                        <div className="w-32 h-32 bg-green-400/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Phone className="w-16 h-16 text-green-400" />
                        </div>
                        <p className="text-green-400">Session Ended</p>
                      </div>
                    )}
                  </div>

                  {/* Controls overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-gray-800/80 border-gray-600 hover:bg-gray-700"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-gray-800/80 border-gray-600 hover:bg-gray-700"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                      >
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </Button>
                      
                      {sessionStatus === 'idle' && (
                        <Button
                          size="lg"
                          className="bg-green-500 hover:bg-green-600 px-8"
                          onClick={startSession}
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Start Session
                        </Button>
                      )}
                      
                      {sessionStatus === 'active' && (
                        <Button
                          size="lg"
                          className="bg-red-500 hover:bg-red-600 px-8"
                          onClick={endSession}
                        >
                          <Phone className="w-5 h-5 mr-2 rotate-135" />
                          End Session
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer and Cost Display */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Session Progress</span>
                  <div className="text-2xl font-mono text-yellow-400">
                    {formatTime(duration)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">{formatTime(duration)}</div>
                      <div className="text-sm text-gray-400">Duration</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{formatCost(totalCost)}</div>
                      <div className="text-sm text-gray-400">Total Cost</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Rate</div>
                  <div className="text-lg font-semibold text-yellow-400">{formatCost(ratePerSecond)}/second</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Max Duration</div>
                  <div className="text-lg font-semibold">5 minutes</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Payment Method</div>
                  <div className="text-lg font-semibold">USDC on Base</div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-400/10 border border-blue-400/30 rounded-lg">
                    <p className="text-sm text-blue-300">
                      💡 Start with a strong hook about your problem statement
                    </p>
                  </div>
                  <div className="p-3 bg-green-400/10 border border-green-400/30 rounded-lg">
                    <p className="text-sm text-green-300">
                      ✅ Good pace! Keep your energy up
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                    <p className="text-sm text-yellow-300">
                      ⚡ 2 minutes remaining - focus on your traction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Speak clearly and confidently</li>
                  <li>• Focus on the problem first</li>
                  <li>• Show your traction metrics</li>
                  <li>• Be ready for follow-up questions</li>
                  <li>• Keep eye contact with the camera</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}