"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Plus, 
  BarChart3, 
  Users, 
  MessageSquare,
  TrendingUp,
  Eye,
  Calendar,
  ArrowRight,
  Filter,
  Search,
  Edit,
  Sparkles,
  DollarSign
} from "lucide-react";
import { InvestorChatPayment } from "@/components/payments/BasePayComponents";
import { useCurrentUser } from "@/components/auth/AuthWrapper";

interface DashboardView {
  id: string;
  name: string;
  icon: any;
}

const views: DashboardView[] = [
  { id: "overview", name: "OVERVIEW", icon: BarChart3 },
  { id: "pitches", name: "PITCHES", icon: TrendingUp },
  { id: "investors", name: "INVESTORS", icon: Users },
  { id: "chats", name: "CHATS", icon: MessageSquare }
];

export default function Dashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useCurrentUser();

  // Mock data with enhanced fields
  const stats = {
    totalPitches: 12,
    totalViews: 1247,
    interestedInvestors: 23,
    chatSessions: 3
  };

  const mockPitches = [
    {
      id: 1,
      title: "AI-Powered Healthcare Platform",
      category: "HealthTech",
      stage: "Series A",
      status: "active",
      views: 1247,
      interested: 23,
      lastActivity: "2 hours ago",
      analysisScore: 85,
      aiImproved: true,
      tags: ["AI", "Healthcare", "B2B"],
      targetAmount: 2000000,
      currentAmount: 450000
    },
    {
      id: 2,
      title: "Sustainable Energy Storage",
      category: "CleanTech",
      stage: "Seed",
      status: "active",
      views: 892,
      interested: 15,
      lastActivity: "1 day ago",
      analysisScore: 78,
      aiImproved: true,
      tags: ["Energy", "Sustainability", "Hardware"],
      targetAmount: 1500000,
      currentAmount: 320000
    },
    {
      id: 3,
      title: "Blockchain Supply Chain",
      category: "Logistics",
      stage: "Pre-Seed",
      status: "draft",
      views: 234,
      interested: 8,
      lastActivity: "3 days ago",
      analysisScore: 65,
      aiImproved: false,
      tags: ["Blockchain", "Supply Chain", "B2B"],
      targetAmount: 500000,
      currentAmount: 75000
    }
  ];

  const recentPitches = mockPitches;

  const upcomingChats = [
    {
      id: "1",
      investorName: "Michael Rodriguez",
      pitchTitle: "AI-Powered Healthcare Platform",
      time: "Today 2:00 PM",
      status: "CONFIRMED",
      founderWalletAddress: "0x1234567890123456789012345678901234567890" // Mock wallet address
    },
    {
      id: "2",
      investorName: "Emily Johnson", 
      pitchTitle: "Sustainable Energy Storage",
      time: "Tomorrow 10:30 AM",
      status: "PENDING PAYMENT",
      founderWalletAddress: "0x0987654321098765432109876543210987654321" // Mock wallet address
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "TOTAL PITCHES", value: stats.totalPitches, icon: TrendingUp, color: "border-yellow-400" },
          { label: "TOTAL VIEWS", value: stats.totalViews, icon: Eye, color: "border-blue-400" },
          { label: "INTERESTED INVESTORS", value: stats.interestedInvestors, icon: Users, color: "border-green-400" },
          { label: "CHAT SESSIONS", value: stats.chatSessions, icon: MessageSquare, color: "border-purple-400" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-black border-4 ${stat.color} hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-bold tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-black text-white mt-2">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Show create/practice options only for founders or users with both roles */}
        {(user?.role === 'FOUNDER' || user?.role === 'BOTH') && (
          <>
            <Link href="/create">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-8 border-4 border-yellow-400 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">CREATE NEW PITCH</h3>
                    <p className="text-yellow-100 font-medium">Build your next startup pitch</p>
                  </div>
                  <Plus className="w-12 h-12 text-white group-hover:rotate-90 transition-transform duration-300" />
                </div>
              </motion.div>
            </Link>

            <Link href="/practice">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 border-4 border-blue-400 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">PRACTICE PITCH</h3>
                    <p className="text-blue-100 font-medium">Perfect your presentation skills</p>
                  </div>
                  <ArrowRight className="w-12 h-12 text-white group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </motion.div>
            </Link>
          </>
        )}

        {/* Show investor-specific options for investors or users with both roles */}
        {(user?.role === 'INVESTOR' || user?.role === 'BOTH') && (
          <>
            <Link href="/investors">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-600 to-green-800 p-8 border-4 border-green-400 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">BROWSE PITCHES</h3>
                    <p className="text-green-100 font-medium">Discover promising startups</p>
                  </div>
                  <Search className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </motion.div>
            </Link>

            <Link href="/investors">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 border-4 border-purple-400 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">PORTFOLIO ANALYTICS</h3>
                    <p className="text-purple-100 font-medium">Track your investments</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </motion.div>
            </Link>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pitches */}
        <Card className="bg-gray-900 border-2 border-gray-700">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">RECENT PITCHES</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveView('pitches')}
                className="text-yellow-400 hover:text-yellow-300"
              >
                View All →
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentPitches.slice(0, 3).map((pitch) => (
                <div key={pitch.id} className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white">{pitch.title}</h3>
                      {pitch.aiImproved && (
                        <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      <Badge className={`text-xs ${
                        pitch.status === 'active' ? 'bg-green-400/20 text-green-400 border-green-400/30' :
                        'bg-yellow-400/20 text-yellow-400 border-yellow-400/30'
                      }`}>
                        {pitch.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Score: <span className={`font-bold ${
                        pitch.analysisScore >= 80 ? 'text-green-400' : 
                        pitch.analysisScore >= 70 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>{pitch.analysisScore}/100</span></span>
                      <span>•</span>
                      <span>${(pitch.currentAmount / 1000).toFixed(0)}K raised</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Chats */}
        <Card className="bg-gray-900 border-2 border-gray-700">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">UPCOMING CHATS</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveView('chats')}
                className="text-yellow-400 hover:text-yellow-300"
              >
                View All →
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingChats.map((chat) => (
                <div key={chat.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white mb-1">{chat.investorName}</h3>
                      <p className="text-sm text-gray-400 mb-2">{chat.pitchTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Calendar className="w-3 h-3" />
                        {chat.time}
                      </div>
                    </div>
                    <Badge className={`text-xs ${
                      chat.status === 'CONFIRMED' ? 'bg-green-400/20 text-green-400 border-green-400/30' :
                      'bg-orange-400/20 text-orange-400 border-orange-400/30'
                    }`}>
                      {chat.status}
                    </Badge>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className={`w-full font-bold ${
                      chat.status === 'CONFIRMED' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {chat.status === 'CONFIRMED' ? 'JOIN CHAT' : 'PAY NOW'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPitches = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">YOUR PITCHES</h2>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-2 border-gray-600 text-white hover:border-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            FILTER
          </Button>
          <Link href="/create">
            <Button className="bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 font-black">
              <Plus className="w-4 h-4 mr-2" />
              NEW PITCH
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {recentPitches.map((pitch, index) => (
          <motion.div
            key={pitch.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900 border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-bold text-white">{pitch.title}</h3>
                      {pitch.aiImproved && (
                        <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30">
                          AI Enhanced
                        </Badge>
                      )}
                      <Badge 
                        variant={pitch.status === "active" ? "default" : "secondary"}
                        className={`font-black ${pitch.status === "active" ? "bg-green-600 text-white" : "bg-gray-600 text-gray-200"}`}
                      >
                        {pitch.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span>{pitch.category}</span>
                      <span>•</span>
                      <span>{pitch.stage}</span>
                      <span>•</span>
                      <span>Score: <span className={`font-bold ${
                        pitch.analysisScore >= 80 ? 'text-green-400' : 
                        pitch.analysisScore >= 70 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>{pitch.analysisScore}/100</span></span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {pitch.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Funding Progress</span>
                        <span className="text-white">
                          ${(pitch.currentAmount / 1000).toFixed(0)}K / ${(pitch.targetAmount / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((pitch.currentAmount / pitch.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {((pitch.currentAmount / pitch.targetAmount) * 100).toFixed(1)}% funded
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" className="border-2 border-gray-600 text-white hover:border-white">
                      VIEW
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 border-t border-gray-800 pt-3">
                  Last activity: {pitch.lastActivity}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">UPCOMING CHATS</h2>
        <Button variant="outline" className="border-2 border-gray-600 text-white hover:border-white">
          VIEW ALL CHATS
        </Button>
      </div>

      <div className="grid gap-4">
        {upcomingChats.map((chat, index) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900 border-2 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{chat.investorName}</h3>
                    <p className="text-gray-400 text-sm mb-2">{chat.pitchTitle}</p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-sm text-gray-300">
                        <Calendar className="w-4 h-4" />
                        {chat.time}
                      </span>
                      <Badge 
                        variant={chat.status === "CONFIRMED" ? "default" : "secondary"}
                        className={`font-black text-xs ${chat.status === "CONFIRMED" ? "bg-green-600" : "bg-orange-600"}`}
                      >
                        {chat.status}
                      </Badge>
                    </div>
                  </div>
                  {chat.status === "CONFIRMED" ? (
                    <Button 
                      className="font-black bg-green-600 hover:bg-green-700"
                    >
                      JOIN
                    </Button>
                  ) : (
                    <InvestorChatPayment
                      onPaymentSuccess={(paymentId) => {
                        console.log('Payment successful:', paymentId);
                        // Update chat status to confirmed
                      }}
                      onPaymentError={(error) => {
                        console.error('Payment failed:', error);
                      }}
                      founderName={chat.investorName}
                      creatorWalletAddress={chat.founderWalletAddress}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case "overview": return renderOverview();
      case "pitches": return renderPitches();
      case "chats": return renderChats();
      case "investors": return (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">INVESTOR CONNECTIONS</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      );
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b-4 border-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black tracking-wider mb-2">
            DASHBOARD
          </h1>
          <p className="text-gray-400 text-lg">Manage your startup journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-gray-800 pb-4">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-6 py-3 font-black text-sm transition-all duration-300 border-2 ${
                  activeView === view.id
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-gray-400 border-gray-600 hover:text-white hover:border-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}