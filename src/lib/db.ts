import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types based on your schema
export interface User {
  id: string;
  email: string;
  name?: string;
  wallet_address?: string;
  role: 'FOUNDER' | 'INVESTOR';
  bio?: string;
  profile_image?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pitch {
  id: string;
  title: string;
  description: string;
  category: string;
  tags?: string;
  deck_url?: string;
  one_liner?: string;
  target_amount?: number;
  equity_offered?: number;
  valuation?: number;
  traction?: string;
  team_size?: number;
  stage?: string;
  is_public: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  founder_id: string;
  creator_wallet_address?: string;
  analysis_score?: number;
  analysis_data?: string;
  ai_improved: boolean;
  created_at: string;
  updated_at: string;
}

export interface PitchSession {
  id: string;
  pitch_id: string;
  investor_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  rate_per_second: number;
  total_cost?: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  recording_url?: string;
  transcript?: string;
  ai_feedback?: string;
  investor_notes?: string;
  meeting_link?: string;
  payment_tx_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  pitch_id: string;
  investor_id: string;
  amount: number;
  equity?: number;
  terms?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image_url: string;
  animation_url?: string;
  token_id?: string;
  contract_address?: string;
  owner_id: string;
  pitch_id?: string;
  session_id?: string;
  metadata?: string;
  minted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: string;
  purpose: 'PITCH_CREATION' | 'PITCH_PRACTICE' | 'INVESTOR_CHAT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transaction_id?: string;
  pitch_id?: string;
  session_id?: string;
  recipient_address: string;
  payer_info?: string;
  created_at: string;
  updated_at: string;
}