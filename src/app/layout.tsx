import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MicroPitch - 1-5 Minute Speed Pitching",
  description: "Connect with VCs and Angel Investors through lightning-fast, pay-per-chat pitch sessions. Get real-time feedback, receive NFT certificates, and fund your vision—all in under 5 minutes.",
  keywords: ["MicroPitch", "pitching", "startups", "VCs", "angel investors", "NFT", "Base", "USDC"],
  authors: [{ name: "MicroPitch Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MicroPitch - Speed Pitching Platform",
    description: "1-5 minute pay-per-chat speed pitching using Base Pay",
    url: "https://micropitch.app",
    siteName: "MicroPitch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MicroPitch - Speed Pitching Platform",
    description: "1-5 minute pay-per-chat speed pitching using Base Pay",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
