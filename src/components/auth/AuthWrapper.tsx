'use client';

import React, { useState, useEffect } from 'react';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { RoleSelection } from './RoleSelection';
import { FounderDashboard } from '@/components/dashboard/FounderDashboard';
import { InvestorDashboard } from '@/components/dashboard/InvestorDashboard';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'FOUNDER' | 'INVESTOR' | 'BOTH' | null;

interface User {
  id: string;
  email?: string;
  name?: string;
  role: UserRole;
}

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = ['FOUNDER', 'INVESTOR', 'BOTH']
}) => {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const { toast } = useToast();

  // Load user data when signed in
  useEffect(() => {
    const loadUserData = async () => {
      if (!isSignedIn || !evmAddress) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Simulate API call to get user data
        // In a real app, this would be an actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock user data - replace with actual API call
        const userData: User = {
          id: evmAddress || 'mock-user-id',
          email: 'user@example.com', // This would come from your backend
          name: 'User Name', // This would come from your backend
          role: null // Initially null, will be set after role selection
        };

        // Check if user has already selected a role (from localStorage for demo)
        const savedRole = localStorage.getItem(`user_role_${userData.id}`) as UserRole;
        if (savedRole) {
          userData.role = savedRole;
          setUser(userData);
          setShowRoleSelection(false);
        } else {
          setUser(userData);
          setShowRoleSelection(true);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isSignedIn, evmAddress, toast]);

  const handleRoleSelection = async (role: UserRole) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Simulate API call to save user role
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save role to localStorage (in a real app, this would be saved to your backend)
      localStorage.setItem(`user_role_${user.id}`, role || '');
      
      // Update user state
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      setSelectedRole(role);
      setShowRoleSelection(false);

      toast({
        title: 'Role Selected',
        description: `Welcome to MicroPitch as ${role === 'BOTH' ? 'a Founder and Investor' : role === 'FOUNDER' ? 'a Founder' : 'an Investor'}!`,
      });
    } catch (error) {
      console.error('Failed to save user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your role selection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not signed in
  if (requireAuth && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">You need to sign in to access this page.</p>
          <AuthButton />
        </div>
      </div>
    );
  }

  // If user is signed in but hasn't selected a role yet
  if (isSignedIn && user && showRoleSelection) {
    return (
      <RoleSelection
        onRoleSelected={handleRoleSelection}
        userName={user.name}
        userEmail={user.email}
      />
    );
  }

  // If user has a role, check if they're allowed to access this content
  if (isSignedIn && user && user.role && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              This page is not available for your current role.
            </p>
          </div>
        </div>
      );
    }
  }

  // Return children for public pages or when user has proper access
  return <>{children}</>;
};

// Hook to get current user data
export const useCurrentUser = () => {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isSignedIn || !evmAddress) {
      setUser(null);
      return;
    }

    const userId = evmAddress || 'mock-user-id';
    const savedRole = localStorage.getItem(`user_role_${userId}`) as UserRole;
    
    if (savedRole) {
      setUser({
        id: userId,
        email: 'user@example.com',
        name: 'User Name',
        role: savedRole
      });
    }
  }, [isSignedIn, evmAddress]);

  return { user, isSignedIn };
};

// Dashboard Router Component
export const DashboardRouter: React.FC = () => {
  const { user, isSignedIn } = useCurrentUser();

  if (!isSignedIn || !user || !user.role) {
    return (
      <AuthWrapper requireAuth={true}>
        <div>Loading...</div>
      </AuthWrapper>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'FOUNDER':
      return (
        <FounderDashboard />
      );
    case 'INVESTOR':
      return (
        <InvestorDashboard />
      );
    case 'BOTH':
      // For users with both roles, default to founder dashboard
      // You could add a role switcher here
      return (
        <FounderDashboard />
      );
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Role Not Set</h2>
            <p className="text-gray-600">Please select your role to continue.</p>
          </div>
        </div>
      );
  }
};