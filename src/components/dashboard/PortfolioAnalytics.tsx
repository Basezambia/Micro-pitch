"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Briefcase
} from "lucide-react";

export default function PortfolioAnalytics() {
  // Mock data for portfolio analytics
  const portfolioStats = {
    totalValue: 2450000,
    totalInvested: 1800000,
    totalReturn: 650000,
    returnPercentage: 36.1,
    activeInvestments: 12,
    exitedInvestments: 3
  };

  const topPerformers = [
    { name: "TechFlow AI", invested: 150000, currentValue: 320000, return: 113.3, status: "growing" },
    { name: "GreenEnergy Solutions", invested: 200000, currentValue: 380000, return: 90.0, status: "growing" },
    { name: "HealthTech Innovations", invested: 100000, currentValue: 175000, return: 75.0, status: "growing" },
    { name: "FinanceBot Pro", invested: 120000, currentValue: 95000, return: -20.8, status: "declining" }
  ];

  const recentActivity = [
    { date: "2024-01-15", action: "Investment", company: "DataViz Pro", amount: 75000 },
    { date: "2024-01-10", action: "Exit", company: "MobileApp Suite", amount: 250000 },
    { date: "2024-01-05", action: "Follow-up", company: "TechFlow AI", amount: 50000 },
    { date: "2023-12-28", action: "Investment", company: "CloudStorage Plus", amount: 100000 }
  ];

  const sectorAllocation = [
    { sector: "Technology", percentage: 45, amount: 1102500 },
    { sector: "Healthcare", percentage: 25, amount: 612500 },
    { sector: "Finance", percentage: 20, amount: 490000 },
    { sector: "Energy", percentage: 10, amount: 245000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">PORTFOLIO ANALYTICS</h1>
          <p className="text-gray-400">Track your investment performance and portfolio insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            <Calendar className="w-4 h-4 mr-2" />
            Last 12 Months
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">
              ${portfolioStats.totalValue.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">+{portfolioStats.returnPercentage}%</span>
              <span className="text-gray-400 text-sm ml-2">vs invested</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">
              ${portfolioStats.totalInvested.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-blue-500 text-sm font-medium">{portfolioStats.activeInvestments} active</span>
              <span className="text-gray-400 text-sm ml-2">investments</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-500">
              +${portfolioStats.totalReturn.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">+{portfolioStats.returnPercentage}%</span>
              <span className="text-gray-400 text-sm ml-2">ROI</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <PieChart className="w-4 h-4 mr-2" />
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">
              {portfolioStats.activeInvestments}
            </div>
            <div className="flex items-center mt-2">
              <span className="text-gray-400 text-sm">{portfolioStats.exitedInvestments} exited</span>
              <span className="text-gray-600 text-sm ml-2">•</span>
              <span className="text-gray-400 text-sm ml-2">15 total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers and Sector Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-black flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              TOP PERFORMERS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((investment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-white">{investment.name}</div>
                  <div className="text-sm text-gray-400">
                    Invested: ${investment.invested.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    ${investment.currentValue.toLocaleString()}
                  </div>
                  <div className={`text-sm flex items-center ${
                    investment.return > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {investment.return > 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {investment.return > 0 ? '+' : ''}{investment.return}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sector Allocation */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-black flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              SECTOR ALLOCATION
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorAllocation.map((sector, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{sector.sector}</span>
                  <span className="text-gray-400">{sector.percentage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sector.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">
                  ${sector.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-black flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            RECENT ACTIVITY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">{activity.date}</div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      activity.action === 'Investment' ? 'border-blue-500 text-blue-500' :
                      activity.action === 'Exit' ? 'border-green-500 text-green-500' :
                      'border-yellow-500 text-yellow-500'
                    }`}
                  >
                    {activity.action}
                  </Badge>
                  <div className="font-medium text-white">{activity.company}</div>
                </div>
                <div className="font-semibold text-white">
                  ${activity.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}