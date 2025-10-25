'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ChatSystem } from './ChatSystem';
import { 
  MessageSquare, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Plus
} from 'lucide-react';

interface ChatSession {
  id: string;
  pitchId: string;
  pitchTitle: string;
  founderId: string;
  founderName: string;
  investorId: string;
  investorName: string;
  status: 'PENDING_PAYMENT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration: number;
  paymentId?: string;
  messages: any[];
}

interface ChatManagerProps {
  currentUserId: string;
  currentUserRole: 'FOUNDER' | 'INVESTOR';
  sessions?: ChatSession[];
  onCreateSession?: (pitchId: string) => void;
}

export const ChatManager: React.FC<ChatManagerProps> = ({
  currentUserId,
  currentUserRole,
  sessions = [],
  onCreateSession
}) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(sessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setChatSessions(sessions);
  }, [sessions]);

  const handleSessionUpdate = (updatedSession: ChatSession) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  };

  const handleSessionEnd = (endedSession: ChatSession) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === endedSession.id ? endedSession : session
      )
    );
    setActiveSessionId(null);
    
    toast({
      title: 'Session Completed',
      description: 'The chat session has ended successfully.',
    });
  };

  const getSessionsByStatus = (status: ChatSession['status']) => {
    return chatSessions.filter(session => session.status === status);
  };

  const getStatusIcon = (status: ChatSession['status']) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'ACTIVE':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'EXPIRED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ChatSession['status']) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SessionCard: React.FC<{ session: ChatSession }> = ({ session }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(session.status)}
            <CardTitle className="text-sm">
              {currentUserRole === 'FOUNDER' 
                ? session.investorName 
                : session.founderName}
            </CardTitle>
          </div>
          <Badge className={getStatusColor(session.status)}>
            {session.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {session.pitchTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{session.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>
              {session.startedAt 
                ? `Started ${formatDate(session.startedAt)}`
                : `Scheduled ${formatDate(session.scheduledAt)}`}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => setActiveSessionId(session.id)}
            variant={session.status === 'ACTIVE' ? 'default' : 'outline'}
          >
            {session.status === 'ACTIVE' ? 'Join Chat' : 'View Session'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (activeSessionId) {
    const activeSession = chatSessions.find(s => s.id === activeSessionId);
    if (activeSession) {
      return (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveSessionId(null)}
            className="mb-4"
          >
            ← Back to Sessions
          </Button>
          <ChatSystem
            session={activeSession}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onSessionUpdate={handleSessionUpdate}
            onSessionEnd={handleSessionEnd}
          />
        </div>
      );
    }
  }

  const activeSessions = getSessionsByStatus('ACTIVE');
  const scheduledSessions = getSessionsByStatus('SCHEDULED');
  const pendingPaymentSessions = getSessionsByStatus('PENDING_PAYMENT');
  const completedSessions = getSessionsByStatus('COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat Sessions</h2>
          <p className="text-gray-600">
            Manage your {currentUserRole === 'FOUNDER' ? 'investor' : 'founder'} conversations
          </p>
        </div>
        {onCreateSession && (
          <Button onClick={() => onCreateSession('')}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        )}
      </div>

      {/* Active Sessions Alert */}
      {activeSessions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Active Chat Sessions ({activeSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledSessions.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingPaymentSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({chatSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled chat sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scheduledSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingPaymentSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending payment sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingPaymentSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {chatSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No chat sessions yet</p>
                {onCreateSession && (
                  <Button 
                    className="mt-4" 
                    onClick={() => onCreateSession('')}
                  >
                    Create Your First Session
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {chatSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatManager;