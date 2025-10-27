'use client';

import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '@/components/auth/AuthWrapper';
import { ChatManager } from '@/components/chat/ChatManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration
const mockChatSessions = [
  {
    id: '1',
    pitchId: 'pitch-1',
    pitchTitle: 'AI-Powered Healthcare Platform',
    founderId: 'founder-1',
    founderName: 'Sarah Chen',
    investorId: 'investor-1',
    investorName: 'Michael Rodriguez',
    status: 'SCHEDULED' as const,
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    duration: 5,
    paymentId: 'payment-1',
    messages: []
  },
  {
    id: '2',
    pitchId: 'pitch-2',
    pitchTitle: 'Sustainable Energy Storage Solution',
    founderId: 'founder-2',
    founderName: 'David Kim',
    investorId: 'investor-2',
    investorName: 'Emily Johnson',
    status: 'PENDING_PAYMENT' as const,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    duration: 5,
    messages: []
  },
  {
    id: '3',
    pitchId: 'pitch-3',
    pitchTitle: 'Blockchain-Based Supply Chain',
    founderId: 'founder-3',
    founderName: 'Alex Thompson',
    investorId: 'investor-3',
    investorName: 'Lisa Wang',
    status: 'COMPLETED' as const,
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    duration: 5,
    paymentId: 'payment-3',
    messages: [
      {
        id: 'msg-1',
        senderId: 'founder-3',
        senderName: 'Alex Thompson',
        senderRole: 'FOUNDER' as const,
        content: 'Thank you for your interest in our blockchain supply chain solution!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: 'text' as const
      },
      {
        id: 'msg-2',
        senderId: 'investor-3',
        senderName: 'Lisa Wang',
        senderRole: 'INVESTOR' as const,
        content: 'I\'m very interested. Can you tell me more about your go-to-market strategy?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1 * 60 * 1000).toISOString(),
        type: 'text' as const
      }
    ]
  }
];

export default function ChatPage() {
  const { user, isSignedIn } = useCurrentUser();
  const [chatSessions, setChatSessions] = useState(mockChatSessions);
  const { toast } = useToast();

  // Filter sessions based on user role and ID
  const getUserSessions = () => {
    if (!user) return [];
    
    return chatSessions.filter(session => {
      if (user.role === 'FOUNDER') {
        return session.founderId === user.id;
      } else if (user.role === 'INVESTOR') {
        return session.investorId === user.id;
      }
      return false;
    });
  };

  const handleCreateSession = (pitchId: string) => {
    if (!user) return;

    // In a real app, this would open a modal to select a pitch and investor/founder
    toast({
      title: 'Create Session',
      description: 'This feature will be implemented to create new chat sessions.',
    });
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to access chat sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user?.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <CardTitle>Role Selection Required</CardTitle>
            <CardDescription>
              Please select your role to access chat features
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userSessions = getUserSessions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <ChatManager
          currentUserId={user.id}
          currentUserRole={user.role as 'FOUNDER' | 'INVESTOR'}
          sessions={userSessions}
          onCreateSession={handleCreateSession}
        />
      </div>
    </div>
  );
}