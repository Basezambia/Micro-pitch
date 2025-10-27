"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Star,
  Calendar,
  Target,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Building,
  Award,
  BarChart3,
  Lightbulb,
  Shield,
  Globe
} from "lucide-react";

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

interface PitchDetailModalProps {
  pitch: Pitch | null;
  isOpen: boolean;
  onClose: () => void;
  onScheduleCall: (pitchId: string) => void;
  onStartChat: (pitchId: string) => void;
}

export default function PitchDetailModal({ 
  pitch, 
  isOpen, 
  onClose, 
  onScheduleCall, 
  onStartChat 
}: PitchDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'financials' | 'team'>('overview');

  if (!pitch) return null;

  // Mock detailed data that would come from the database
  const detailedPitch = {
    ...pitch,
    description: "Our AI-powered healthcare platform revolutionizes patient care by providing real-time diagnostics and personalized treatment recommendations. We leverage machine learning algorithms to analyze patient data and provide actionable insights to healthcare providers.",
    problem: "Healthcare providers struggle with accurate diagnosis and personalized treatment plans, leading to delayed care and suboptimal patient outcomes.",
    solution: "Our platform uses advanced AI algorithms to analyze patient symptoms, medical history, and real-time data to provide instant diagnostic suggestions and personalized treatment recommendations.",
    marketSize: "$350B global healthcare market with 15% annual growth",
    businessModel: "SaaS subscription model with tiered pricing for healthcare providers",
    competition: "Traditional EMR systems and basic diagnostic tools",
    traction: "50+ healthcare providers, $2M ARR, 95% customer retention",
    useOfFunds: "Product development (40%), Sales & Marketing (35%), Team expansion (25%)",
    founder: {
      ...pitch.founder,
      title: "CEO & Co-Founder",
      bio: "Former healthcare executive with 15+ years experience. Previously led digital transformation at major hospital networks.",
      education: "MD from Harvard Medical School, MBA from Stanford",
      linkedin: "https://linkedin.com/in/founder",
      email: "founder@healthtech.com",
      location: "San Francisco, CA"
    },
    team: [
      {
        name: pitch.founder.name,
        role: "CEO & Co-Founder",
        bio: "Healthcare industry veteran with deep expertise in digital health solutions"
      },
      {
        name: "Dr. Sarah Chen",
        role: "CTO & Co-Founder", 
        bio: "Former Google AI researcher specializing in healthcare applications"
      },
      {
        name: "Michael Rodriguez",
        role: "VP of Sales",
        bio: "10+ years in healthcare sales with extensive provider network"
      }
    ],
    milestones: [
      { date: "Q1 2024", milestone: "Product MVP Launch", status: "completed" },
      { date: "Q2 2024", milestone: "First 10 Customers", status: "completed" },
      { date: "Q3 2024", milestone: "Series A Funding", status: "in-progress" },
      { date: "Q4 2024", milestone: "100+ Customers", status: "planned" }
    ],
    metrics: {
      revenue: "$2M ARR",
      growth: "25% MoM",
      customers: "50+",
      retention: "95%"
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'business', label: 'Business', icon: Building },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'team', label: 'Team', icon: Users }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{detailedPitch.title}</h2>
                  <p className="text-gray-400">{detailedPitch.oneLiner}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                    {detailedPitch.category}
                  </Badge>
                  <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                    {detailedPitch.stage}
                  </Badge>
                  {detailedPitch.founder.isVerified && (
                    <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-yellow-400 border-b-2 border-yellow-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Target Funding</p>
                        <p className="text-lg font-bold text-white">${detailedPitch.targetAmount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Equity Offered</p>
                        <p className="text-lg font-bold text-white">{detailedPitch.equityOffered}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Valuation</p>
                        <p className="text-lg font-bold text-white">${detailedPitch.valuation.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Team Size</p>
                        <p className="text-lg font-bold text-white">{detailedPitch.teamSize}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                        About This Pitch
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">{detailedPitch.description}</p>
                    </CardContent>
                  </Card>

                  {/* Problem & Solution */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Problem</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{detailedPitch.problem}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Solution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{detailedPitch.solution}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Market Size</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{detailedPitch.marketSize}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Business Model</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">{detailedPitch.businessModel}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Traction & Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-400">{detailedPitch.metrics.revenue}</p>
                          <p className="text-sm text-gray-400">Annual Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{detailedPitch.metrics.growth}</p>
                          <p className="text-sm text-gray-400">Monthly Growth</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">{detailedPitch.metrics.customers}</p>
                          <p className="text-sm text-gray-400">Customers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-400">{detailedPitch.metrics.retention}</p>
                          <p className="text-sm text-gray-400">Retention Rate</p>
                        </div>
                      </div>
                      <p className="text-gray-300">{detailedPitch.traction}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'financials' && (
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Use of Funds</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{detailedPitch.useOfFunds}</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Product Development</span>
                          <span className="text-white font-semibold">40%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Sales & Marketing</span>
                          <span className="text-white font-semibold">35%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Team Expansion</span>
                          <span className="text-white font-semibold">25%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {detailedPitch.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-400' :
                              milestone.status === 'in-progress' ? 'bg-yellow-400' :
                              'bg-gray-600'
                            }`} />
                            <div className="flex-1">
                              <p className="text-white font-medium">{milestone.milestone}</p>
                              <p className="text-sm text-gray-400">{milestone.date}</p>
                            </div>
                            <Badge className={
                              milestone.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                              milestone.status === 'in-progress' ? 'bg-yellow-400/20 text-yellow-400' :
                              'bg-gray-600/20 text-gray-400'
                            }>
                              {milestone.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  {/* Founder Profile */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-400" />
                        Founder Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-black" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{detailedPitch.founder.name}</h3>
                          <p className="text-yellow-400 font-medium">{detailedPitch.founder.title}</p>
                          <p className="text-gray-300 mt-2">{detailedPitch.founder.bio}</p>
                          <p className="text-sm text-gray-400 mt-2">{detailedPitch.founder.education}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center text-sm text-gray-400">
                              <MapPin className="w-4 h-4 mr-1" />
                              {detailedPitch.founder.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <Mail className="w-4 h-4 mr-1" />
                              {detailedPitch.founder.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Members */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Team Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {detailedPitch.team.map((member, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-700/50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{member.name}</h4>
                              <p className="text-yellow-400 text-sm">{member.role}</p>
                              <p className="text-gray-300 text-sm mt-1">{member.bio}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {detailedPitch._count.sessions} views
                </span>
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {detailedPitch._count.investments} offers
                </span>
                <span>Created {new Date(detailedPitch.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                  onClick={() => onStartChat(detailedPitch.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
                <Button
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                  onClick={() => onScheduleCall(detailedPitch.id)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Call
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}