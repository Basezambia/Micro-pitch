'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageSquare,
  Calendar,
  BarChart3,
  Target,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export function InvestorDashboard() {
  // Mock data for demonstration
  const stats = {
    totalInvestments: 8,
    activeInvestments: 5,
    totalInvested: 450000,
    portfolioValue: 520000,
    scheduledChats: 2,
    completedChats: 12
  };

  const recentPitches = [
    {
      id: '1',
      title: 'AI-Powered Healthcare Platform',
      founder: 'Sarah Chen',
      category: 'Healthcare',
      fundingGoal: 500000,
      equityOffered: 10,
      status: 'active',
      interested: 15
    },
    {
      id: '2',
      title: 'Sustainable Energy Storage',
      founder: 'David Kim',
      category: 'CleanTech',
      fundingGoal: 750000,
      equityOffered: 12,
      status: 'active',
      interested: 8
    },
    {
      id: '3',
      title: 'Blockchain Supply Chain',
      founder: 'Alex Thompson',
      category: 'Blockchain',
      fundingGoal: 300000,
      equityOffered: 15,
      status: 'active',
      interested: 12
    }
  ];

  const myInvestments = [
    {
      id: '1',
      companyName: 'HealthTech Solutions',
      founder: 'Maria Garcia',
      investedAmount: 75000,
      equityOwned: 8,
      currentValue: 95000,
      status: 'growing',
      lastUpdate: '2024-01-18'
    },
    {
      id: '2',
      companyName: 'EcoDelivery',
      founder: 'James Wilson',
      investedAmount: 50000,
      equityOwned: 12,
      currentValue: 48000,
      status: 'stable',
      lastUpdate: '2024-01-15'
    }
  ];

  const upcomingChats = [
    {
      id: '1',
      founderName: 'Sarah Chen',
      pitchTitle: 'AI-Powered Healthcare Platform',
      scheduledAt: '2024-01-20T14:00:00Z',
      status: 'scheduled'
    },
    {
      id: '2',
      founderName: 'David Kim',
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
          <h1 className="text-3xl font-bold text-white">Investor Dashboard</h1>
          <p className="text-gray-400 mt-2">Discover promising startups and manage your portfolio</p>
        </div>
        <div className="flex gap-3">
          <Link href="/chat">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Sessions
            </Button>
          </Link>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Browse Pitches
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Investments</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalInvestments}</div>
            <p className="text-xs text-gray-400">
              {stats.activeInvestments} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalInvested.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              Across {stats.totalInvestments} companies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.portfolioValue.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              +{Math.round(((stats.portfolioValue - stats.totalInvested) / stats.totalInvested) * 100)}% return
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
            <CardTitle className="text-white">Latest Pitches</CardTitle>
            <CardDescription className="text-gray-400">
              Discover new investment opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPitches.map((pitch) => (
                <div key={pitch.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{pitch.title}</h4>
                    <p className="text-sm text-gray-400">by {pitch.founder}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${pitch.fundingGoal.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {pitch.interested} interested
                      </span>
                      <span>{pitch.equityOffered}% equity</span>
                    </div>
                  </div>
                  <Badge className="bg-blue-600">
                    {pitch.category}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Search className="h-4 w-4 mr-2" />
              Browse All Pitches
            </Button>
          </CardContent>
        </Card>

        {/* My Investments */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">My Portfolio</CardTitle>
            <CardDescription className="text-gray-400">
              Track your investment performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myInvestments.map((investment) => (
                <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{investment.companyName}</h4>
                    <p className="text-sm text-gray-400">by {investment.founder}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>${investment.investedAmount.toLocaleString()} invested</span>
                      <span>{investment.equityOwned}% equity</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      ${investment.currentValue.toLocaleString()}
                    </div>
                    <Badge 
                      variant={investment.status === 'growing' ? 'default' : 'secondary'}
                      className={investment.status === 'growing' ? 'bg-green-600' : 'bg-gray-600'}
                    >
                      {investment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Full Portfolio
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Chats */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Upcoming Chat Sessions</CardTitle>
          <CardDescription className="text-gray-400">
            Scheduled conversations with founders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingChats.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{chat.founderName}</h4>
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
              View All Chat Sessions
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Search className="h-6 w-6 mb-2" />
              Browse Pitches
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Filter className="h-6 w-6 mb-2" />
              Filter by Category
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              Portfolio Analytics
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Investment History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}