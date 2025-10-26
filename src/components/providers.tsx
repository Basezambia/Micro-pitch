"use client";

import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";

interface ProvidersProps {
  children: React.ReactNode;
}

// Error boundary component for CDP provider
function CDPErrorFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">
            Configuration Required
          </h2>
          <p className="text-yellow-200 mb-4">
            The Coinbase CDP SDK is not properly configured. Please set up the required environment variables.
          </p>
          <div className="bg-gray-800 rounded p-3 text-sm font-mono">
            <p className="text-gray-300">Missing: NEXT_PUBLIC_CDP_PROJECT_ID</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

const config: Config = {
  projectId: projectId || "placeholder-project-id",
  ethereum: {
    createOnLogin: "smart",
  },
  appName: "MicroPitch",
  appLogoUrl: "",
  authMethods: ["email", "sms", "oauth:google"],
  showCoinbaseFooter: true,
};

const theme: Partial<Theme> = {
  "colors-bg-default": "#1a1a1a",
  "colors-bg-alternate": "#2a2a2a",
  "colors-bg-primary": "#3b82f6",
  "colors-bg-secondary": "#374151",
  "colors-fg-default": "#f9fafb",
  "colors-fg-muted": "#9ca3af",
  "colors-fg-primary": "#3b82f6",
  "colors-fg-onPrimary": "#ffffff",
  "colors-fg-onSecondary": "#f9fafb",
  "colors-fg-positive": "#10b981",
  "colors-fg-negative": "#ef4444",
  "colors-fg-warning": "#f59e0b",
  "colors-line-default": "#374151",
  "colors-line-heavy": "#6b7280",
  "borderRadius-cta": "var(--cdp-web-borderRadius-md)",
  "borderRadius-link": "var(--cdp-web-borderRadius-md)",
  "borderRadius-input": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-trigger": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-list": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-modal": "var(--cdp-web-borderRadius-sm)",
  "font-family-sans": "'Rethink Sans', 'Rethink Sans Fallback'",
};

export default function Providers({ children }: ProvidersProps) {
  // If project ID is missing, show error fallback
  if (!projectId || projectId === "your-project-id-here" || projectId === "placeholder-project-id") {
    return <CDPErrorFallback>{children}</CDPErrorFallback>;
  }

  try {
    return (
      <CDPReactProvider config={config} theme={theme}>
        {children}
      </CDPReactProvider>
    );
  } catch (error) {
    console.error("CDP Provider initialization error:", error);
    // In production, try to recover gracefully
    if (process.env.NODE_ENV === 'production') {
      console.warn("CDP Provider failed in production, attempting fallback...");
      return (
        <div className="min-h-screen bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-400 mb-2">
                Network Configuration Issue
              </h2>
              <p className="text-red-200 mb-4">
                There's a network configuration issue. Please try refreshing the page or contact support.
              </p>
            </div>
            {children}
          </div>
        </div>
      );
    }
    return <CDPErrorFallback>{children}</CDPErrorFallback>;
  }
}