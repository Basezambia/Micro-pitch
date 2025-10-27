"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ChatSession from "@/components/chat/ChatSession";

// Mock data - in a real app, this would come from your database
const mockChatData = {
  "1": {
    investorName: "Michael Rodriguez",
    founderName: "Sarah Chen",
    pitchTitle: "AI-Powered Healthcare Platform",
    ratePerSecond: 50 // $0.50 per second
  },
  "2": {
    investorName: "Emily Johnson",
    founderName: "David Kim",
    pitchTitle: "Sustainable Energy Storage",
    ratePerSecond: 75 // $0.75 per second
  }
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  
  const [chatData, setChatData] = useState<any>(null);

  useEffect(() => {
    // In a real app, fetch chat data from your database
    const data = mockChatData[chatId as keyof typeof mockChatData];
    if (data) {
      setChatData(data);
    } else {
      // Redirect to dashboard if chat not found
      router.push('/dashboard');
    }
  }, [chatId, router]);

  const handleEndSession = () => {
    // In a real app, save session data and process payment
    console.log('Session ended for chat:', chatId);
    router.push('/dashboard');
  };

  if (!chatData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading chat session...</div>
      </div>
    );
  }

  return (
    <ChatSession
      chatId={chatId}
      investorName={chatData.investorName}
      founderName={chatData.founderName}
      pitchTitle={chatData.pitchTitle}
      ratePerSecond={chatData.ratePerSecond}
      onEndSession={handleEndSession}
    />
  );
}