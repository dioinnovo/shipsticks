# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ship Sticks Intelligence Platform is a Next.js 15.5.2 application for AI-powered golf equipment and luggage shipping logistics. It demonstrates how AI can help golfers optimize their travel experience, track shipments, manage bookings, and coordinate with partner golf courses and resorts worldwide through the Ship Sticks Travel Assistant.

## Development Commands

### Running the Application
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.5.2 with App Router
- **UI**: React 18.2, Tailwind CSS 3.3, shadcn/ui components
- **State Management**: React hooks, Zustand (to be added)
- **Animations**: Framer Motion 11.0
- **AI Integration**: AI SDK (Vercel), ChromaDB for vectors
- **PDF Generation**: @pdfme/generator
- **Data Visualization**: Recharts
- **Shipping APIs**: FedEx, UPS, DHL integration via Ship Sticks platform

### Project Structure
```
shipsticks/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── assistant/      # Travel AI Assistant interface
│   │   ├── care-sessions/  # Shipment tracking & management
│   │   ├── compliance/     # Shipping compliance monitoring
│   │   ├── referrals/      # Partner golf course network
│   │   └── reports/        # Analytics and insights
│   ├── api/                # API routes
│   ├── demo/               # Interactive demo page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── policy/            # Shipping policy components
│   ├── dashboard/         # Dashboard components
│   └── layout/            # Layout components
├── lib/
│   ├── ai/                # AI service integrations
│   ├── arthur/            # Ship Sticks API integration
│   ├── db/                # Database utilities
│   ├── utils/             # Helper functions
│   └── hooks/             # Custom React hooks
├── public/
│   └── images/            # Static images
└── .env.local             # Environment variables
```

### Key Features

1. **Landing Page** (`app/page.tsx`)
   - Hero section with Ship Sticks value proposition
   - Golfer and travel benefits showcase
   - AI-powered shipping optimization
   - Partner network highlights (3,500+ golf courses)

2. **Travel Assistant Dashboard** (`app/dashboard/assistant/page.tsx`)
   - Real-time shipping quotes
   - Golf course recommendations
   - Travel planning assistance
   - Shipment cost optimization

3. **Shipment Coordination** (`app/dashboard/care-sessions/page.tsx`)
   - Intelligent shipment tracking
   - Partner course network
   - Delivery timeline management
   - Performance analytics

4. **Interactive Demo** (`app/demo/page.tsx`)
   - Shipping quote calculator
   - Simulated AI travel planning
   - Real-time delivery tracking
   - Cost savings calculator

5. **AI Integration**
   - Travel Assistant for shipping queries
   - NLP for travel planning
   - Predictive analytics for delivery times
   - Real-time golf course partner network insights

### Environment Variables

Key environment variables in `.env.local`:
- `ANTHROPIC_API_KEY` - Claude API access for Travel AI
- `OPENAI_API_KEY` - OpenAI API for embeddings
- `SHIPSTICKS_API_ENDPOINT` - Ship Sticks API endpoint
- `SHIPSTICKS_API_KEY` - Ship Sticks API authentication
- `FEDEX_API_KEY` - FedEx shipping integration
- `UPS_API_KEY` - UPS shipping integration
- `NEXT_PUBLIC_DEMO_MODE` - Enable demo mode
- `DATABASE_URL` - PostgreSQL connection string

### Design System

- **Colors**:
  - Primary: Ship Sticks Green (#5fd063)
  - Secondary: Accent Green (#4fab55)
  - Dark: Navy (#231f20)
- **Components**: Using shadcn/ui with golf/travel-focused customizations
- **Animations**: Framer Motion for smooth, professional transitions
- **Accessibility**: WCAG 2.1 AA compliant

### Demo Mode

The application includes a demo mode (`NEXT_PUBLIC_DEMO_MODE=true`) that:
- Uses mock shipping and customer data
- Simulates Travel AI analysis
- Shows sample golf course partner networks
- Demonstrates shipping cost optimization
- Highlights shipment tracking workflows

### Security & Compliance

- **PCI Compliance**: Payment data handling follows PCI-DSS standards
- **Data Encryption**: End-to-end encryption for customer data
- **Audit Logging**: Comprehensive audit trail for all transactions
- **Access Control**: Role-based access control (RBAC)
- **Security**: SOC 2 Type II compliance ready

### Next Steps

To complete the full implementation:
1. Integrate FedEx, UPS, DHL shipping APIs
2. Implement secure payment gateway
3. Set up real-time shipment tracking engine
4. Add golf course partner network integration
5. Implement automated booking workflows
6. Set up shipment coordination dashboards
7. Add shipping compliance monitoring tools
8. Deploy on secure cloud infrastructure