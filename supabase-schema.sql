-- Supabase Schema for Micro Pitch Platform
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('FOUNDER', 'INVESTOR');
CREATE TYPE pitch_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED');
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE investment_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');
CREATE TYPE payment_purpose AS ENUM ('PITCH_CREATION', 'PITCH_PRACTICE', 'INVESTOR_CHAT');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  wallet_address TEXT UNIQUE,
  role user_role DEFAULT 'FOUNDER',
  bio TEXT,
  profile_image TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pitches table
CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array of tags
  deck_url TEXT, -- Presentation deck URL
  one_liner TEXT, -- Quick pitch line
  target_amount DECIMAL, -- Target investment amount
  equity_offered DECIMAL, -- Equity percentage offered
  valuation DECIMAL, -- Company valuation
  traction TEXT, -- Traction metrics
  team_size INTEGER,
  stage TEXT, -- Pre-seed, Seed, Series A, etc.
  is_public BOOLEAN DEFAULT TRUE,
  status pitch_status DEFAULT 'DRAFT',
  founder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_wallet_address TEXT, -- Creator's wallet address for payments
  
  -- AI Analysis fields
  analysis_score INTEGER, -- AI analysis score (0-100)
  analysis_data TEXT, -- JSON string of AI analysis results
  ai_improved BOOLEAN DEFAULT FALSE, -- Whether pitch was improved by AI
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pitch Sessions table
CREATE TABLE pitch_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  rate_per_second DECIMAL NOT NULL, -- USDC per second
  total_cost DECIMAL, -- Total cost in USDC
  status session_status DEFAULT 'SCHEDULED',
  recording_url TEXT, -- IPFS URL of recording
  transcript TEXT, -- Session transcript
  ai_feedback TEXT, -- AI-generated feedback
  investor_notes TEXT, -- Private investor notes
  meeting_link TEXT, -- Video call link
  payment_tx_id TEXT, -- Transaction ID for payment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL, -- Investment amount in USDC
  equity DECIMAL, -- Equity percentage
  terms TEXT, -- Investment terms
  status investment_status DEFAULT 'PENDING',
  transaction_id TEXT, -- Blockchain transaction ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFTs table
CREATE TABLE nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL, -- IPFS URL
  animation_url TEXT, -- IPFS URL for video/audio
  token_id TEXT, -- Blockchain token ID
  contract_address TEXT, -- NFT contract address
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE, -- Associated pitch (if any)
  session_id TEXT, -- Associated session (if any)
  metadata TEXT, -- IPFS metadata URL
  minted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount TEXT NOT NULL, -- Amount in USDC (as string to match Base Pay)
  purpose payment_purpose NOT NULL,
  status payment_status DEFAULT 'PENDING',
  transaction_id TEXT, -- Base Pay transaction ID
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE, -- Associated pitch (for pitch creation/practice)
  session_id UUID REFERENCES pitch_sessions(id) ON DELETE CASCADE, -- Associated session (for investor chat)
  recipient_address TEXT NOT NULL, -- Platform wallet address
  payer_info TEXT, -- JSON string of collected payer info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_pitches_founder_id ON pitches(founder_id);
CREATE INDEX idx_pitches_status ON pitches(status);
CREATE INDEX idx_pitch_sessions_pitch_id ON pitch_sessions(pitch_id);
CREATE INDEX idx_pitch_sessions_investor_id ON pitch_sessions(investor_id);
CREATE INDEX idx_investments_pitch_id ON investments(pitch_id);
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_nfts_owner_id ON nfts(owner_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pitches_updated_at BEFORE UPDATE ON pitches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pitch_sessions_updated_at BEFORE UPDATE ON pitch_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY; -- Disabled to allow unrestricted access
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - you can customize these)
-- Users can read their own data
-- CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
-- CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
-- CREATE POLICY "Anyone can create new users" ON users FOR INSERT WITH CHECK (true);

-- Public pitches are viewable by everyone, private pitches only by founder
CREATE POLICY "Public pitches are viewable by everyone" ON pitches FOR SELECT USING (is_public = true);
CREATE POLICY "Founders can view own pitches" ON pitches FOR SELECT USING (auth.uid()::text = founder_id::text);
CREATE POLICY "Founders can manage own pitches" ON pitches FOR ALL USING (auth.uid()::text = founder_id::text);

-- Sessions are viewable by participants
CREATE POLICY "Session participants can view sessions" ON pitch_sessions FOR SELECT USING (
  auth.uid()::text = investor_id::text OR 
  auth.uid()::text IN (SELECT founder_id::text FROM pitches WHERE id = pitch_id)
);

-- Investments are viewable by participants
CREATE POLICY "Investment participants can view investments" ON investments FOR SELECT USING (
  auth.uid()::text = investor_id::text OR 
  auth.uid()::text IN (SELECT founder_id::text FROM pitches WHERE id = pitch_id)
);

-- NFTs are viewable by owner
CREATE POLICY "NFT owners can view own NFTs" ON nfts FOR SELECT USING (auth.uid()::text = owner_id::text);

-- Payments are viewable by user
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid()::text = user_id::text);