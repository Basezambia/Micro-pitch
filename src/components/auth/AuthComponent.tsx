"use client";

import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import { useCurrentUser } from "./AuthWrapper";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import Link from "next/link";

export default function AuthComponent() {
  const { isSignedIn } = useIsSignedIn();
  const { user } = useCurrentUser();

  const handleSignOut = () => {
    // Clear user role from localStorage
    if (user?.id) {
      localStorage.removeItem(`user_role_${user.id}`);
    }
    // The AuthButton handles the actual sign out
  };

  return (
    <div>
      {isSignedIn && user ? (
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="text-white hover:text-yellow-400 font-black text-lg border-2 border-transparent hover:border-yellow-400 px-4 py-2"
            >
              <User className="w-4 h-4 mr-2" />
              DASHBOARD
            </Button>
          </Link>
          <div className="text-green-400 font-medium text-sm">
            {user.role === 'BOTH' ? 'FOUNDER & INVESTOR' : user.role}
          </div>
          <AuthButton />
        </div>
      ) : (
        <div>
          <AuthButton />
        </div>
      )}
    </div>
  );
}