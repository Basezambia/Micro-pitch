"use client";

import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";

interface ProvidersProps {
  children: React.ReactNode;
}

const config: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
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
  return (
    <CDPReactProvider config={config} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}