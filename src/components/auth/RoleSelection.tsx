'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users, DollarSign, Lightbulb, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoleSelectionProps {
  onRoleSelected: (role: 'FOUNDER' | 'INVESTOR') => void;
  userEmail?: string;
  userName?: string;
  currentUserRole?: 'FOUNDER' | 'INVESTOR' | null;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onRoleSelected,
  userEmail,
  userName,
  currentUserRole
}) => {
  const [selectedRole, setSelectedRole] = useState<'FOUNDER' | 'INVESTOR' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRoleSelection = async (role: 'FOUNDER' | 'INVESTOR') => {
    setSelectedRole(role);
    setIsSubmitting(true);

    try {
      // Here you would typically save the role to your database
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Role Selected',
        description: `Welcome as a ${role.toLowerCase()}! Setting up your dashboard...`,
      });

      onRoleSelected(role);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set your role. Please try again.',
        variant: 'destructive',
      });
      setSelectedRole(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to the Platform!</h1>
          <p className="text-xl text-gray-600">
            Hi {userName || userEmail}! Let's set up your profile.
          </p>
          <p className="text-lg text-gray-500">
            Choose your role to get started with a personalized experience.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Founder Card - Only show if user doesn't already have a role */}
          {!currentUserRole && (
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedRole === 'FOUNDER' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => !isSubmitting && handleRoleSelection('FOUNDER')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">I'm a Founder</CardTitle>
                <CardDescription className="text-base">
                  I have a startup idea or business that needs funding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">What you can do:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Create and manage your pitches
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      Connect with investors
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Practice your pitch with AI feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Track funding progress
                    </li>
                  </ul>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  0.01 USDC per pitch creation/practice
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Investor Card - Only show if user doesn't already have a role */}
          {!currentUserRole && (
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedRole === 'INVESTOR' ? 'ring-2 ring-green-500 bg-green-50' : ''
              }`}
              onClick={() => !isSubmitting && handleRoleSelection('INVESTOR')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">I'm an Investor</CardTitle>
                <CardDescription className="text-base">
                  I'm looking to invest in promising startups and founders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">What you can do:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Browse and discover pitches
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Chat with founders (5 min sessions)
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Track your investment portfolio
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      Access detailed pitch analytics
                    </li>
                  </ul>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  0.1 USDC per founder chat session
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Show message when user already has a role */}
          {currentUserRole && (
            <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome back!
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  You're already registered as a {currentUserRole.toLowerCase()}. 
                  You can access your dashboard directly.
                </p>
                <Button 
                  onClick={() => onRoleSelected(currentUserRole)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isSubmitting && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-lg text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              Setting up your profile...
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>You can change your role anytime in your profile settings.</p>
          <p className="mt-2">All payments are processed securely using Base Pay on Base Mainnet.</p>
        </div>
      </div>
    </div>
  );
};