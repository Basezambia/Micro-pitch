'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageSquare,
  Calendar,
  BarChart3,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export function FounderDashboard() {
  // Mock data for demonstration
  const stats = {
    totalPitches: 12,
    activePitches: 8,
    totalViews: 1247,
    interestedInvestors: 23,
    scheduledChats: 3,
    completedChats: 7
  };

  const recentPitches = [
    {
      id: '1',
      title: 'AI-Powered Healthcare Platform',
      status: 'active',
      views: 156,
      interested: 8,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Sustainable Energy Storage',
      status: 'active',
      views: 89,
      interested: 5,
      createdAt: '2024-01-12'
    },
    {
      id: '3',
      title: 'Blockchain Supply Chain',
      status: 'draft',
      views: 0,
      interested: 0,
      createdAt: '2024-01-10'
    }
  ];

  const upcomingChats = [
    {
      id: '1',
      investorName: 'Michael Rodriguez',
      pitchTitle: 'AI-Powered Healthcare Platform',
      scheduledAt: '2024-01-20T14:00:00Z',
      status: 'scheduled'
    },
    {
      id: '2',
      investorName: 'Emily Johnson',
      pitchTitle: 'Sustainable Energy Storage',
      scheduledAt: '2024-01-21T10:30:00Z',
      status: 'pending_payment'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Founder Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your pitches and connect with investors</p>
        </div>
        <div className="flex gap-3">
          <Link href="/chat">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Sessions
            </Button>
          </Link>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Pitch
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Pitches</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPitches}</div>
            <p className="text-xs text-gray-400">
              {stats.activePitches} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
            <p className="text-xs text-gray-400">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Interested Investors</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.interestedInvestors}</div>
            <p className="text-xs text-gray-400">
              Across all pitches
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Chat Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.scheduledChats}</div>
            <p className="text-xs text-gray-400">
              {stats.completedChats} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pitches */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Pitches</CardTitle>
            <CardDescription className="text-gray-400">
              Your latest pitch submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPitches.map((pitch) => (
                <div key={pitch.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{pitch.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {pitch.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {pitch.interested} interested
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant={pitch.status === 'active' ? 'default' : 'secondary'}
                    className={pitch.status === 'active' ? 'bg-green-600' : ''}
                  >
                    {pitch.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Pitches
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Chats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Chat Sessions</CardTitle>
            <CardDescription className="text-gray-400">
              Scheduled conversations with investors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingChats.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{chat.investorName}</h4>
                    <p className="text-sm text-gray-400">{chat.pitchTitle}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(chat.scheduledAt).toLocaleDateString()} at{' '}
                      {new Date(chat.scheduledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <Badge 
                    variant={chat.status === 'scheduled' ? 'default' : 'secondary'}
                    className={chat.status === 'scheduled' ? 'bg-blue-600' : 'bg-yellow-600'}
                  >
                    {chat.status === 'scheduled' ? 'Ready' : 'Pending Payment'}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/chat">
              <Button variant="outline" className="w-full mt-4">
                <MessageSquare className="h-4 w-4 mr-2" />
                View All Chats
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <PlusCircle className="h-6 w-6 mb-2" />
              Create New Pitch
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Payment History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}