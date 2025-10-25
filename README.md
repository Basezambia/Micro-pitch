# MicroPitch - 1-5 Minute Speed Pitching Platform

A revolutionary platform where founders can pitch their ideas to VCs and angel investors through lightning-fast, pay-per-chat pitch sessions.

## 🚀 Features

### Core Functionality
- **Speed Pitching**: 1-5 minute pitch sessions with real-time billing
- **Per-Second Billing**: Transparent pricing using USDC on Base
- **NFT Certificates**: Receive verifiable NFT certificates for completed sessions
- **AI Practice Agent**: Get AI-powered feedback and practice your pitch
- **Investor Matching**: Connect with verified VCs and angel investors

### Technology Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **Blockchain**: Base Network, USDC payments, NFT minting
- **Storage**: Pinata IPFS for NFT metadata and certificates
- **AI**: Z.ai Web SDK for pitch feedback and coaching

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # User authentication
│   │   ├── pitches/       # Pitch management
│   │   ├── ipfs/          # IPFS storage
│   │   ├── nft/           # NFT minting
│   │   ├── payment/       # Base Pay integration
│   │   └── ai/            # AI services
│   ├── create/            # Create pitch page
│   ├── practice/          # Pitch practice interface
│   ├── pitch/             # Live pitch session
│   ├── investors/         # Investor dashboard
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # shadcn/ui components
└── lib/
    └── db.ts              # Database client
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## 🎯 Key Pages

### Landing Page (`/`)
- Stunning black background with yellow accent design
- Glassmorphism effects and water-like animations
- Key statistics and feature highlights
- Navigation to main platform features

### Create Pitch (`/create`)
- Multi-step pitch creation wizard
- Business details, financial information, and review
- Real-time validation and helpful tips
- Submit to investor marketplace

### Practice Pitch (`/practice`)
- AI-powered pitch coaching
- Recording and transcription
- Real-time feedback and suggestions
- Multiple practice modes (free, guided, Q&A)

### Live Pitch Session (`/pitch`)
- Real-time video/audio interface
- Per-second billing counter
- Session recording and transcript
- AI assistant for live coaching

### Investor Dashboard (`/investors`)
- Browse and filter investment opportunities
- Detailed pitch profiles and metrics
- Book pitch sessions directly
- Track portfolio and performance

## 💰 Payment System

### Base Pay Integration
- USDC payments on Base network
- Per-second billing model
- Automatic payment processing
- Transaction history and receipts

### Pricing
- Default rate: $0.01 USD per second
- Custom rates for premium investors
- Session caps at 5 minutes (300 seconds)
- Maximum cost per session: $3.00

## 🎨 NFT Certificates

### Certificate Features
- Unique NFT for each completed session
- Stored on IPFS via Pinata
- Includes session metadata and achievements
- Verifiable on blockchain explorers

### Metadata Structure
```json
{
  "name": "Pitch Certificate: [Startup Name]",
  "description": "Certificate of completion for pitch session",
  "attributes": [
    {
      "trait_type": "Duration",
      "value": 180
    },
    {
      "trait_type": "Total Cost", 
      "value": "1.80 USDC"
    }
  ]
}
```

## 🤖 AI Integration

### AI Services
- **Pitch Feedback**: Detailed analysis of pitch content
- **Question Generator**: Practice tough investor questions
- **Pitch Improver**: Enhance pitch language and structure
- **Practice Partner**: Simulate real investor conversations

### AI Prompts
The system uses carefully crafted prompts to provide:
- Constructive feedback on delivery and content
- Industry-specific insights and recommendations
- Realistic investor questions and scenarios
- Actionable improvement suggestions

## 🔧 Configuration

### Environment Variables
```env
# Coinbase CDP Configuration
NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id

# Pinata IPFS Configuration  
PINATA_API_KEY=your-pinata-api-key
PINATA_API_SECRET=your-pinata-secret
PINATA_JWT=your-pinata-jwt

# Database
DATABASE_URL="file:./dev.db"
```

### Database Schema
- **Users**: Founder and investor profiles
- **Pitches**: Startup information and details
- **Sessions**: Pitch session records and billing
- **NFTs**: Certificate metadata and ownership
- **Investments**: Funding transactions and terms

## 🚀 Deployment

### Production Setup
1. Configure production environment variables
2. Set up production database
3. Configure Base Pay for production
4. Deploy to Vercel or similar platform

### Security Considerations
- Secure API key management
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement
- Smart contract security audits

## 📊 Analytics & Metrics

### Key Performance Indicators
- Session completion rate
- Average session duration
- Funding conversion rate
- User engagement metrics
- NFT minting statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Join our Discord community
- Check the documentation

---

Built with ❤️ for the startup ecosystem