'use client';

import React, { useState, useEffect } from 'react';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { RoleSelection } from './RoleSelection';
import { FounderDashboard } from '@/components/dashboard/FounderDashboard';
import { InvestorDashboard } from '@/components/dashboard/InvestorDashboard';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'FOUNDER' | 'INVESTOR' | null;

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
  allowedRoles = ['FOUNDER', 'INVESTOR']
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
    if (!isSignedIn || !evmAddress) {
      setUser(null);
      setShowRoleSelection(false);
      setIsLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch user data from database API first
        try {
          const response = await fetch(`/api/auth?walletAddress=${encodeURIComponent(evmAddress)}`);
          
          if (response.ok) {
            const { user: dbUser } = await response.json();
            const userData: User = {
              id: dbUser.id,
              email: dbUser.email || 'user@example.com',
              name: dbUser.name || 'User Name',
              role: dbUser.role
            };
            
            setUser(userData);
            setShowRoleSelection(!dbUser.role);
            return; // Successfully loaded from database
          } else if (response.status === 404) {
            // User doesn't exist in database, show role selection
            const userData: User = {
              id: evmAddress,
              email: 'user@example.com',
              name: 'User Name',
              role: null
            };
            setUser(userData);
            setShowRoleSelection(true); // Always show role selection for new users
            return;
          }
        } catch (dbError) {
          console.warn('Database unavailable, falling back to localStorage:', dbError);
        }
        
        // Fallback to localStorage if database is unavailable
        const savedRole = localStorage.getItem(`userRole_${evmAddress}`) as UserRole | null;
        const userData: User = {
          id: evmAddress,
          email: 'user@example.com',
          name: 'User Name',
          role: savedRole
        };
        
        setUser(userData);
        setShowRoleSelection(!savedRole);
        
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
      
      // Save role to database via API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: user.id,
          email: user.email,
          name: user.name,
          role: role
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user role');
      }

      const { user: updatedDbUser } = await response.json();
      
      // Update user state
      const updatedUser = { 
        ...user, 
        role: updatedDbUser.role,
        id: updatedDbUser.id 
      };
      setUser(updatedUser);
      setSelectedRole(role);
      setShowRoleSelection(false);

      toast({
        title: 'Role Selected',
        description: `Welcome to MicroPitch as ${role === 'FOUNDER' ? 'a Founder' : 'an Investor'}!`,
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
        currentUserRole={user.role}
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !evmAddress) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/auth?walletAddress=${encodeURIComponent(evmAddress)}`);
        
        if (response.ok) {
          const { user: dbUser } = await response.json();
          setUser({
            id: dbUser.id,
            email: dbUser.email || 'user@example.com',
            name: dbUser.name || 'User Name',
            role: dbUser.role
          });
        } else {
          // User not found in database, set to null
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isSignedIn, evmAddress]);

  return { user, isSignedIn, isLoading };
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