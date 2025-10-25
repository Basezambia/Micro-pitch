"use client";

import { SendEvmTransactionButton } from "@coinbase/cdp-react";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Send } from "lucide-react";

export default function TransactionComponent() {
  const { evmAddress } = useEvmAddress();

  if (!evmAddress) {
    return null; // Don't show transaction component if not signed in
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="w-5 h-5 text-yellow-400" />
          Send Transaction
        </CardTitle>
        <CardDescription className="text-gray-400">
          Send ETH to another address using your embedded wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
            Connected: {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
          </Badge>
        </div>
        
        <SendEvmTransactionButton
          account={evmAddress}
          network="base"
          transaction={{
            to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            value: BigInt("1000000000000000"), // 0.001 ETH in wei as bigint
            chainId: 8453, // Base Mainnet chain ID
            type: "eip1559"
          }}
          onSuccess={(txHash) => {
            console.log("Transaction successful:", txHash);
            alert(`Transaction sent successfully! Hash: ${txHash}`);
          }}
          onError={(error) => {
            console.error("Transaction failed:", error);
            alert(`Transaction failed: ${error.message}`);
          }}
          className="w-full bg-yellow-400 text-black hover:bg-yellow-300 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Send className="w-4 h-4" />
          Send 0.001 ETH
        </SendEvmTransactionButton>
        
        <p className="text-xs text-gray-500">
          This will send 0.001 ETH on Base Mainnet to a demo address. Real funds required.
        </p>
      </CardContent>
    </Card>
  );
}