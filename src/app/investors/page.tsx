"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Filter,
  Search,
  Star,
  Calendar,
  Target,
  Eye,
  MessageSquare
} from "lucide-react";
import PitchDetailModal from "@/components/pitch/PitchDetailModal";

interface Pitch {
  id: string;
  title: string;
  oneLiner: string;
  category: string;
  stage: string;
  targetAmount: number;
  equityOffered: number;
  valuation: number;
  traction: string;
  teamSize: number;
  founder: {
    name: string;
    walletAddress: string;
    isVerified: boolean;
  };
  _count: {
    sessions: number;
    investments: number;
  };
  tags: string[];
  createdAt: string;
}

export default function InvestorsDashboard() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [filteredPitches, setFilteredPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "funding">("newest");
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ["AI/ML", "FinTech", "HealthTech", "EdTech", "SaaS", "E-commerce", "Climate Tech", "Web3", "Mobile", "Other"];
  const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Growth"];

  useEffect(() => {
    fetchPitches();
  }, []);

  useEffect(() => {
    filterAndSortPitches();
  }, [pitches, searchTerm, selectedCategory, selectedStage, sortBy]);

  const fetchPitches = async () => {
    try {
      const response = await fetch('/api/pitches?limit=50');
      if (response.ok) {
        const data = await response.json();
        setPitches(data.pitches);
      }
    } catch (error) {
      console.error('Error fetching pitches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPitches = () => {
    let filtered = pitches.filter(pitch => {
      const matchesSearch = pitch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pitch.oneLiner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pitch.founder.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || pitch.category === selectedCategory;
      const matchesStage = !selectedStage || pitch.stage === selectedStage;
      
      return matchesSearch && matchesCategory && matchesStage;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b._count.sessions - a._count.sessions;
        case 'funding':
          return b.targetAmount - a.targetAmount;
        default:
          return 0;
      }
    });

    setFilteredPitches(filtered);
  };

  const bookSession = async (pitchId: string) => {
    // Instead of redirecting to pitch session, redirect to dashboard where they can see scheduled calls
    window.location.href = `/dashboard?tab=chats&scheduled=true`;
  };

  const handleViewPitch = (pitch: Pitch) => {
    setSelectedPitch(pitch);
    setIsModalOpen(true);
  };

  const handleStartChat = (pitchId: string) => {
    // Navigate to chat with the founder
    window.location.href = `/chat/new?pitchId=${pitchId}&type=instant`;
  };

  const handleScheduleCall = (pitchId: string) => {
    // Schedule a call - same as book session for now
    bookSession(pitchId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-400">Loading investment opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Investor Dashboard</h1>
          <p className="text-gray-400">Discover and invest in promising startups</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Pitches</p>
                  <p className="text-2xl font-bold text-white">{pitches.length}</p>
                </div>
                <Target className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Funding</p>
                  <p className="text-2xl font-bold text-white">
                    ${pitches.reduce((sum, p) => sum + p.targetAmount, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg. Team Size</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(pitches.reduce((sum, p) => sum + p.teamSize, 0) / pitches.length)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sessions Today</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pitches..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Stage Filter */}
              <select
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option value="">All Stages</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="funding">Highest Funding</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Pitches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPitches.map((pitch, index) => (
            <motion.div
              key={pitch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-xs">
                          {pitch.category}
                        </Badge>
                        <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                          {pitch.stage}
                        </Badge>
                        {pitch.founder.isVerified && (
                          <Badge className="bg-green-400/20 text-green-400 border-green-400/30 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-white mb-2 group-hover:text-yellow-400 transition-colors">
                        {pitch.title}
                      </CardTitle>
                      <p className="text-sm text-gray-300 line-clamp-2">{pitch.oneLiner}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Founder Info */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{pitch.founder.name}</p>
                      <p className="text-xs text-gray-400">Team of {pitch.teamSize}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {pitch.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pitch.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} className="bg-gray-800 text-gray-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {pitch.tags.length > 3 && (
                        <Badge className="bg-gray-800 text-gray-300 text-xs">
                          +{pitch.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Target</p>
                      <p className="font-semibold text-green-400">${pitch.targetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Equity</p>
                      <p className="font-semibold text-blue-400">{pitch.equityOffered}%</p>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {pitch._count.sessions} views
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {pitch._count.investments} offers
                      </span>
                    </div>
                    <span>{new Date(pitch.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300"
                      onClick={() => bookSession(pitch.id)}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      SCHEDULE CALL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-800"
                      onClick={() => handleViewPitch(pitch)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPitches.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No pitches found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Pitch Detail Modal */}
      <PitchDetailModal
        pitch={selectedPitch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScheduleCall={handleScheduleCall}
        onStartChat={handleStartChat}
      />
    </div>
  );
}