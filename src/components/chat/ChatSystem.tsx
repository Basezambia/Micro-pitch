'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { InvestorChatPayment } from '@/components/payments/BasePayComponents';
import { 
  Clock, 
  Send, 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  User,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'FOUNDER' | 'INVESTOR';
  content: string;
  timestamp: string;
  type: 'text' | 'system';
}

interface ChatSession {
  id: string;
  pitchId: string;
  pitchTitle: string;
  founderId: string;
  founderName: string;
  founderWalletAddress?: string; // Creator's wallet address for payments
  investorId: string;
  investorName: string;
  status: 'PENDING_PAYMENT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration: number; // in minutes
  paymentId?: string;
  messages: Message[];
}

interface ChatSystemProps {
  session: ChatSession;
  currentUserId: string;
  currentUserRole: 'FOUNDER' | 'INVESTOR';
  onSessionUpdate?: (session: ChatSession) => void;
  onSessionEnd?: (session: ChatSession) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  session,
  currentUserId,
  currentUserRole,
  onSessionUpdate,
  onSessionEnd
}) => {
  const [messages, setMessages] = useState<Message[]>(session.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(session.status === 'ACTIVE');
  const [showPayment, setShowPayment] = useState(session.status === 'PENDING_PAYMENT');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Timer logic
  useEffect(() => {
    if (!isActive || session.status !== 'ACTIVE') return;

    const startTime = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
    const endTime = startTime + (session.duration * 60 * 1000);

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        handleSessionEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, session.startedAt, session.duration]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentSuccess = (paymentId: string) => {
    const updatedSession: ChatSession = {
      ...session,
      status: 'SCHEDULED',
      paymentId
    };

    setShowPayment(false);
    toast({
      title: 'Payment Successful',
      description: 'Chat session has been scheduled. You can start chatting now!',
    });

    onSessionUpdate?.(updatedSession);
  };

  const handleStartChat = () => {
    if (session.status !== 'SCHEDULED') return;

    const updatedSession: ChatSession = {
      ...session,
      status: 'ACTIVE',
      startedAt: new Date().toISOString()
    };

    setIsActive(true);
    setTimeRemaining(session.duration * 60);

    // Add system message
    const systemMessage: Message = {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'System',
      senderRole: 'FOUNDER',
      content: `Chat session started. You have ${session.duration} minutes to discuss the pitch.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    setMessages(prev => [...prev, systemMessage]);
    onSessionUpdate?.(updatedSession);

    toast({
      title: 'Chat Started',
      description: `You have ${session.duration} minutes for this session.`,
    });
  };

  const handleSessionEnd = () => {
    const updatedSession: ChatSession = {
      ...session,
      status: 'COMPLETED',
      endedAt: new Date().toISOString(),
      messages
    };

    setIsActive(false);
    setTimeRemaining(0);

    // Add system message
    const systemMessage: Message = {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'System',
      senderRole: 'FOUNDER',
      content: 'Chat session has ended. Thank you for your time!',
      timestamp: new Date().toISOString(),
      type: 'system'
    };

    setMessages(prev => [...prev, systemMessage]);
    onSessionEnd?.(updatedSession);

    toast({
      title: 'Session Ended',
      description: 'The chat session has completed.',
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isActive) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserRole === 'FOUNDER' ? session.founderName : session.investorName,
      senderRole: currentUserRole,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      PENDING_PAYMENT: { color: 'bg-yellow-500', text: 'Payment Required' },
      SCHEDULED: { color: 'bg-blue-500', text: 'Ready to Start' },
      ACTIVE: { color: 'bg-green-500', text: 'Active' },
      COMPLETED: { color: 'bg-gray-500', text: 'Completed' },
      EXPIRED: { color: 'bg-red-500', text: 'Expired' }
    };

    const config = statusConfig[session.status];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  if (showPayment && currentUserRole === 'INVESTOR') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with {session.founderName}
          </CardTitle>
          <CardDescription>
            Pay to start a {session.duration}-minute chat session about "{session.pitchTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <InvestorChatPayment
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={(error) => {
                toast({
                  title: 'Payment Failed',
                  description: error,
                  variant: 'destructive',
                });
              }}
              founderName={session.founderName}
              creatorWalletAddress={session.founderWalletAddress}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">
                {currentUserRole === 'FOUNDER' 
                  ? `Chat with ${session.investorName}` 
                  : `Chat with ${session.founderName}`}
              </CardTitle>
              <CardDescription>
                About: {session.pitchTitle}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {isActive && (
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 60 ? 'text-red-500' : 'text-green-500'}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'system' 
                    ? 'justify-center' 
                    : message.senderId === currentUserId 
                      ? 'justify-end' 
                      : 'justify-start'
                }`}
              >
                {message.type === 'system' ? (
                  <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                    {message.content}
                  </div>
                ) : (
                  <div className={`flex items-start gap-2 max-w-[70%] ${
                    message.senderId === currentUserId ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.senderRole === 'FOUNDER' ? 'F' : 'I'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg px-3 py-2 ${
                      message.senderId === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="text-sm font-medium mb-1">
                        {message.senderName}
                      </div>
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          {session.status === 'SCHEDULED' && !isActive && (
            <div className="mb-4 text-center">
              <Button onClick={handleStartChat} className="bg-green-500 hover:bg-green-600">
                <Phone className="h-4 w-4 mr-2" />
                Start Chat Session
              </Button>
            </div>
          )}

          {isActive && (
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isActive}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isActive}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {session.status === 'COMPLETED' && (
            <div className="text-center text-gray-500">
              <CheckCircle className="h-5 w-5 mx-auto mb-2" />
              Chat session completed
            </div>
          )}

          {session.status === 'EXPIRED' && (
            <div className="text-center text-red-500">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              Chat session expired
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatSystem;