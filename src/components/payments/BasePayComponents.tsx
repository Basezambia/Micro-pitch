'use client';

import React, { useState } from 'react';
import { pay, getPaymentStatus } from '@base-org/account';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BasePayButtonProps {
  amount: string;
  purpose: 'PITCH_CREATION' | 'PITCH_PRACTICE' | 'INVESTOR_CHAT';
  onPaymentSuccess?: (paymentId: string, payerInfo?: any) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  collectPayerInfo?: boolean;
  recipientAddress?: string; // Optional custom recipient address
}

export const BasePayButton: React.FC<BasePayButtonProps> = ({
  amount,
  purpose,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  className = '',
  collectPayerInfo = false,
  recipientAddress
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const platformWalletAddress = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS;
  const targetAddress = recipientAddress || platformWalletAddress;

  const handlePayment = async () => {
    if (!targetAddress) {
      const error = recipientAddress ? 'Recipient wallet address not provided' : 'Platform wallet address not configured';
      toast({
        title: 'Configuration Error',
        description: error,
        variant: 'destructive',
      });
      onPaymentError?.(error);
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const paymentConfig: any = {
        amount,
        to: targetAddress,
        testnet: false // Using mainnet as requested
      };

      // Add payer info collection if requested
      if (collectPayerInfo) {
        paymentConfig.payerInfo = {
          requests: [
            { type: 'email' },
            { type: 'name', optional: true }
          ]
        };
      }

      const payment = await pay(paymentConfig);

      // Poll for payment status
      const checkStatus = async () => {
        try {
          const { status } = await getPaymentStatus({
            id: payment.id,
            testnet: false
          });

          if (status === 'completed') {
            setPaymentStatus('success');
            toast({
              title: 'Payment Successful',
              description: `Payment of ${amount} USDC completed successfully!`,
            });
            onPaymentSuccess?.(payment.id, payment.payerInfoResponses);
          } else if (status === 'failed') {
            setPaymentStatus('error');
            const error = 'Payment failed';
            toast({
              title: 'Payment Failed',
              description: error,
              variant: 'destructive',
            });
            onPaymentError?.(error);
          } else {
            // Still pending, check again in 2 seconds
            setTimeout(checkStatus, 2000);
          }
        } catch (error) {
          setPaymentStatus('error');
          const errorMessage = error instanceof Error ? error.message : 'Payment status check failed';
          toast({
            title: 'Payment Error',
            description: errorMessage,
            variant: 'destructive',
          });
          onPaymentError?.(errorMessage);
        }
      };

      // Start checking status
      setTimeout(checkStatus, 1000);

    } catch (error) {
      setPaymentStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPurposeText = () => {
    switch (purpose) {
      case 'PITCH_CREATION':
        return 'Create Pitch';
      case 'PITCH_PRACTICE':
        return 'Practice Session';
      case 'INVESTOR_CHAT':
        return 'Start Chat';
      default:
        return 'Pay with Base';
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing || paymentStatus === 'success'}
      className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white ${className}`}
    >
      {getStatusIcon()}
      {isProcessing ? 'Processing...' : getPurposeText()} ({amount} USDC)
    </Button>
  );
};

interface PaymentCardProps {
  title: string;
  description: string;
  amount: string;
  purpose: 'PITCH_CREATION' | 'PITCH_PRACTICE' | 'INVESTOR_CHAT';
  onPaymentSuccess?: (paymentId: string, payerInfo?: any) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
  collectPayerInfo?: boolean;
  recipientAddress?: string; // Optional custom recipient address
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  title,
  description,
  amount,
  purpose,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  collectPayerInfo = false,
  recipientAddress
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-semibold">{amount} USDC</span>
          </div>
          <BasePayButton
            amount={amount}
            purpose={purpose}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            disabled={disabled}
            collectPayerInfo={collectPayerInfo}
            recipientAddress={recipientAddress}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Specific payment components for different use cases
export const PitchCreationPayment: React.FC<{
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}> = ({ onPaymentSuccess, onPaymentError, disabled }) => (
  <PaymentCard
    title="Create Your Pitch"
    description="Pay a small fee to list your pitch on the platform and connect with investors."
    amount="0.01"
    purpose="PITCH_CREATION"
    onPaymentSuccess={onPaymentSuccess}
    onPaymentError={onPaymentError}
    disabled={disabled}
  />
);

export const PitchPracticePayment: React.FC<{
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}> = ({ onPaymentSuccess, onPaymentError, disabled }) => (
  <PaymentCard
    title="Practice Your Pitch"
    description="Get AI-powered feedback and improve your pitch with our practice session."
    amount="0.01"
    purpose="PITCH_PRACTICE"
    onPaymentSuccess={onPaymentSuccess}
    onPaymentError={onPaymentError}
    disabled={disabled}
  />
);

export const InvestorChatPayment: React.FC<{
  onPaymentSuccess?: (paymentId: string, payerInfo?: any) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
  founderName?: string;
  creatorWalletAddress?: string; // Creator's wallet address for payment
}> = ({ onPaymentSuccess, onPaymentError, disabled, founderName, creatorWalletAddress }) => (
  <PaymentCard
    title="Connect with Founder"
    description={`Start a 5-minute chat session with ${founderName || 'the founder'} to discuss their pitch.`}
    amount="0.1"
    purpose="INVESTOR_CHAT"
    onPaymentSuccess={onPaymentSuccess}
    onPaymentError={onPaymentError}
    disabled={disabled}
    collectPayerInfo={true}
    recipientAddress={creatorWalletAddress}
  />
);