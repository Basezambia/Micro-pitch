"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  MessageSquare,
  Clock,
  DollarSign,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";

interface ChatSessionProps {
  chatId: string;
  investorName: string;
  founderName: string;
  pitchTitle: string;
  ratePerSecond: number;
  onEndSession: () => void;
}

export default function ChatSession({
  chatId,
  investorName,
  founderName,
  pitchTitle,
  ratePerSecond,
  onEndSession
}: ChatSessionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState<Array<{id: string, sender: string, text: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isConnected) {
      intervalRef.current = setInterval(() => {
        setSessionDuration(prev => {
          const newDuration = prev + 1;
          setTotalCost(newDuration * ratePerSecond);
          return newDuration;
        });
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
  }, [isConnected, ratePerSecond]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    onEndSession();
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: "You",
        text: newMessage,
        timestamp: new Date()
      }]);
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">PITCH SESSION</h1>
            <p className="text-gray-400">{pitchTitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-green-500 text-green-400">
              {isConnected ? "CONNECTED" : "READY"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Call Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-2 border-gray-700 h-96">
              <CardContent className="p-6 h-full flex items-center justify-center">
                {!isConnected ? (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Ready to Connect</h3>
                    <p className="text-gray-400 mb-4">Click the call button to start your pitch session</p>
                    <Button 
                      onClick={handleConnect}
                      className="bg-green-600 hover:bg-green-700 font-black"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      START CALL
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-300">Video call in progress...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Call Controls */}
            {isConnected && (
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`border-2 ${isMuted ? 'border-red-500 bg-red-500/20' : 'border-gray-600'}`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`border-2 ${!isVideoOn ? 'border-red-500 bg-red-500/20' : 'border-gray-600'}`}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleDisconnect}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Session Info & Chat */}
          <div className="space-y-6">
            {/* Session Details */}
            <Card className="bg-gray-900 border-2 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Session Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Founder:</span>
                    <span className="text-white font-medium">{founderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investor:</span>
                    <span className="text-white font-medium">{investorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-mono">{formatTime(sessionDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate:</span>
                    <span className="text-white">{formatCurrency(ratePerSecond)}/sec</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Cost:</span>
                      <span className="text-yellow-400 font-bold text-lg">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gray-900 border-2 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI Assistant
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">💡 Great opening! Consider highlighting your unique value proposition.</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">📊 The investor seems interested in your market size data.</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">🎯 Perfect time to discuss your go-to-market strategy.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gray-900 border-2 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Quick Tips
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Keep your pitch concise and engaging</p>
                  <p>• Focus on problem-solution fit</p>
                  <p>• Be prepared for tough questions</p>
                  <p>• Show traction and market validation</p>
                  <p>• Have clear next steps ready</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}