# MicroPitch - 5-Minute Speed Pitching Platform

A modern platform connecting investors and founders through timed pitch sessions with integrated Base Pay payments and real-time communication.

## 🚀 Features

### Implemented Features ✅
- **Role-Based Authentication**: Secure wallet-based sign-in with Dynamic
- **5-Minute Chat System**: Timed conversations between investors and founders
- **Base Pay Integration**: Seamless cryptocurrency payments for chat sessions
- **Real-Time Communication**: Socket.IO powered messaging system
- **Session Management**: Complete lifecycle (pending, scheduled, active, completed, expired)
- **Professional UI**: Modern, responsive design with Tailwind CSS and shadcn/ui
- **Multi-Role Support**: Founders, Investors, and Both role options

### Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: Dynamic (wallet-based auth)
- **Payments**: Base Pay integration
- **Real-time**: Socket.IO
- **Database**: MongoDB with Mongoose
- **Storage**: Pinata IPFS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat system page
│   └── page.tsx           # Landing page
├── components/
│   ├── auth/              # Authentication components
│   │   ├── AuthWrapper.tsx
│   │   └── RoleSelection.tsx
│   ├── chat/              # Chat system components
│   │   ├── ChatSystem.tsx
│   │   └── ChatManager.tsx
│   ├── dashboard/         # Role-based dashboards
│   │   ├── FounderDashboard.tsx
│   │   └── InvestorDashboard.tsx
│   ├── payments/          # Base Pay integration
│   │   └── BasePayComponents.tsx
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── db.ts              # Database client
│   ├── socket.ts          # Socket.IO client
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB database
- Dynamic account for authentication
- Base network setup for payments

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd micropitch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `DYNAMIC_ENVIRONMENT_ID`: Your Dynamic environment ID
   - `MONGODB_URI`: MongoDB connection string
   - `PINATA_JWT`: Pinata JWT token
   - `BASE_PAY_*`: Base Pay configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💡 Usage

### For Founders
1. Sign in with your wallet
2. Select "Founder" role
3. Access your dashboard to manage pitch sessions
4. Navigate to Chat Sessions to view and manage conversations

### For Investors  
1. Sign in with your wallet
2. Select "Investor" role
3. Browse available founders
4. Initiate paid chat sessions
5. Manage your investment conversations

## 🔧 Key Components

### Authentication System
- `AuthWrapper.tsx`: Main authentication wrapper with Dynamic integration
- `RoleSelection.tsx`: Role selection interface for multi-role support
- Wallet-based secure authentication

### Chat System
- `ChatSystem.tsx`: Core chat functionality with 5-minute timer
- `ChatManager.tsx`: Multi-session management interface
- Real-time messaging with Socket.IO
- Base Pay integration for session payments

### Dashboard System
- `FounderDashboard.tsx`: Founder-specific interface and navigation
- `InvestorDashboard.tsx`: Investor-specific interface and tools
- Role-based feature access and session statistics

## 🌐 Live Application

The application is deployed and accessible at:
**[https://micropitch-cxqwn96p2-lliseli-projects.vercel.app](https://micropitch-cxqwn96p2-lliseli-projects.vercel.app)**

### Deploy Your Own
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<repository-url>)

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