# CarbonWise

CarbonWise is a production-ready, premium sustainability SaaS web application designed to help users track, understand, and reduce their daily carbon footprint. Empowered by India-specific emission factor utilities, interactive Recharts analytics, and Google Gemini AI insights, CarbonWise provides direct, actionable plans to help users build long-term, eco-friendly habits.

## Key Features

- **Google OAuth & Sandbox Demo Mode**: Secure login via Auth.js v5 with a fully functional credentials fallback for sandbox testing without API credentials.
- **India-Specific Calculation Engine**: Tracks transportation, food meals, and home electricity using official, localized carbon factors.
- **Dynamic Carbon Status Levels**: Automatically flags levels (Green, Moderate, High, Critical) based on user activity weights.
- **Interactive Recharts Visuals**: Includes pie charts showing emission distribution share and area graphs tracing historical weekly footprint trends.
- **Weekly Performance Audits**: Auto-compiles weekly reports showing highest/lowest days, category breakdown percentages, and week-over-week progress.
- **AI Sustainability Coach**: Queries the Google Gemini API to analyze current logs and generate custom recommendations, quick wins, and habits.
- **Eco Badge Achievements**: Unlocks badges (Green Starter, Tracked First Week, Low Carbon Week, Sustainable Commuter, Eco Champion) dynamically.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server Actions, Route Handlers.
- **Database**: MongoDB Atlas via Mongoose ODM.
- **Authentication**: Auth.js (NextAuth v5) with Google OAuth and Credentials Providers.
- **Charts**: Recharts (dynamically imported to optimize load speeds).
- **AI Engine**: Google Gemini API SDK (free-tier `gemini-1.5-flash`).

## Folder Structure

```text
src/
├── app/
│   ├── actions/          # Next.js Server Actions (auth, footprint updates)
│   ├── api/
│   │   ├── auth/         # NextAuth OAuth callback route
│   │   └── insights/     # Gemini recommendations endpoint
│   ├── dashboard/        # Core analytics and form interface
│   ├── history/          # Paginated data table, filters, and CSV downloads
│   ├── reports/          # Automated weekly report summaries
│   ├── profile/          # Achievements and goal adjustment
│   ├── layout.tsx        # Global theme template & navbar wrapper
│   └── page.tsx          # Marketing landing page
├── components/
│   ├── ai/               # AI Sustainability Coach card UI
│   ├── charts/           # Recharts pie & trend visual charts
│   ├── dashboard/        # Summary metric card grid
│   ├── forms/            # Activity tracking input tabs
│   ├── history/          # Historical search list and table
│   └── ui/               # Standard Card components
├── lib/
│   ├── auth.ts           # NextAuth provider callbacks
│   ├── calculations.ts   # Local emission factor constants
│   ├── gemini.ts         # Google GenAI wrapper
│   ├── mongodb.ts        # Database connection pool manager
│   └── reports.ts        # Weekly report compilation scheduler
├── models/
│   ├── User.ts           # User profiles & carbon goals
│   ├── Footprint.ts      # Footprint records
│   └── Report.ts         # Generated weekly reports
├── types/                # Session and model type definitions
└── utils/
    └── cn.ts             # Tailwind utility merger
```

## Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- A local MongoDB instance or a MongoDB Atlas Database URI

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in the configuration details:
```properties
# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_uri

# Auth.js Secrets
AUTH_SECRET=generate_with_openssl_rand_hex_32

# Google OAuth (Optional - falls back to Demo Mode if left blank)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Google Gemini API Key (Optional - falls back to rule-based coach if left blank)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Packages
Install dependencies using the legacy peer deps flag to satisfy React 19/Next 15 dependencies:
```bash
npm install --legacy-peer-deps
```

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the CarbonWise homepage.

## Emission Calculations (India Standard Factors)

Carbon emissions are calculated in **kg CO₂** using standard factors optimized for India:

### 1. Transportation
- **Car**: `0.192 kg CO₂/km`
- **Bus**: `0.105 kg CO₂/km`
- **Train**: `0.041 kg CO₂/km`
- **Bike / Walk**: `0 kg CO₂`

### 2. Food choices
- **Beef Meal**: `5.0 kg CO₂ per meal`
- **Chicken Meal**: `1.8 kg CO₂ per meal`
- **Vegetarian / Vegan**: `0.8 kg CO₂ per meal`

### 3. Household Utilities
- **Electricity**: `0.82 kg CO₂ per kWh`

## Carbon Levels Rating

Based on the calculated footprint of the latest logged activities:
- **Green** (0–50 kg CO₂): *Excellent sustainability performance.*
- **Moderate** (51–150 kg CO₂): *Room for improvement.*
- **High** (151–300 kg CO₂): *Significant environmental impact.*
- **Critical** (300+ kg CO₂): *Immediate action recommended.*
