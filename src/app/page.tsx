"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthComponent from "@/components/auth/AuthComponent";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import Link from "next/link";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  ArrowRight,
  Mic,
  Brain,
  Users
} from "lucide-react";

export default function Home() {
  const { isSignedIn } = useIsSignedIn();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Brutalist geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-yellow-400/5 via-transparent to-blue-400/5 transform -skew-y-1" />
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-l from-purple-400/5 via-transparent to-green-400/5 transform skew-y-1" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-yellow-400/10 transform rotate-45 translate-x-32" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-blue-400/10 transform -rotate-45 -translate-x-32" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Brutalist Navigation */}
        <nav className="p-8 border-b-4 border-gray-800">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="text-3xl font-black tracking-wider">
              MICRO<span className="text-yellow-400">PITCH</span>
            </div>
            <div className="flex items-center space-x-8">
              {isSignedIn && (
                <>
                  <Link href="/practice">
                    <Button 
                      variant="ghost" 
                      className="text-white hover:text-yellow-400 font-black text-lg border-2 border-transparent hover:border-yellow-400 px-6 py-3"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      PRACTICE
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button 
                      variant="ghost" 
                      className="text-white hover:text-blue-400 font-black text-lg border-2 border-transparent hover:border-blue-400 px-6 py-3"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      CREATE PITCH
                    </Button>
                  </Link>
                  <Link href="/investors">
                    <Button 
                      variant="ghost" 
                      className="text-white hover:text-green-400 font-black text-lg border-2 border-transparent hover:border-green-400 px-6 py-3"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      FOR INVESTORS
                    </Button>
                  </Link>
                </>
              )}
              <div className="border-l-4 border-gray-600 pl-6">
                <AuthComponent />
              </div>
            </div>
          </div>
        </nav>

        {/* Brutalist Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >

              
              <div className="border-l-8 border-yellow-400 pl-8 mb-12 text-left max-w-4xl mx-auto">
                <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-6 leading-none">
                  PERFECT
                  <br />
                  YOUR
                  <br />
                  <span className="text-yellow-400">PITCH</span>
                </h1>
                
                <p className="text-2xl md:text-3xl text-gray-300 font-medium max-w-3xl">
                  MASTER STARTUP PITCHING WITH BRUTAL PRECISION.
                  <br />
                  AI COACHING. REAL FEEDBACK. INVESTOR READY.
                </p>
              </div>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Zap,
                  title: "INSTANT FEEDBACK",
                  description: "Get real-time AI analysis of your pitch performance",
                  color: "from-yellow-600 to-yellow-800",
                  accent: "border-yellow-500"
                },
                {
                  icon: Target,
                  title: "PRECISION TRAINING",
                  description: "Practice with investor-grade questions and scenarios",
                  color: "from-blue-600 to-blue-800",
                  accent: "border-blue-500"
                },
                {
                  icon: TrendingUp,
                  title: "TRACK PROGRESS",
                  description: "Monitor improvement with detailed analytics",
                  color: "from-green-600 to-green-800",
                  accent: "border-green-500"
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                    className="group"
                  >
                    <div className={`bg-gradient-to-br ${feature.color} p-8 border-4 ${feature.accent} shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20`}>
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center border-2 border-white">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white">
                          {feature.title}
                        </h3>
                        <p className="text-gray-200 font-medium">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              {!isSignedIn ? (
                <div className="space-y-6">
                  <h2 className="text-4xl font-black text-white mb-4">
                    READY TO DOMINATE?
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Sign in to access premium pitch training tools
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/practice">
                    <Button 
                      size="lg" 
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-2xl px-12 py-6 border-4 border-black shadow-lg transform hover:scale-105 transition-all"
                    >
                      START PRACTICING
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button 
                      size="lg" 
                      className="bg-transparent border-4 border-white text-white hover:bg-white hover:text-black font-black text-2xl px-12 py-6 shadow-lg transform hover:scale-105 transition-all"
                    >
                      CREATE PITCH
                      <Brain className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}