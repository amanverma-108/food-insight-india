

## Project info

# TrueInside (FOODINSIGHT) — Know What You Consume

> Decode every ingredient. Understand every impact. Make healthier choices.

**Live app:** [trueinside.vercel.app](https://trueinside.vercel.app)

---

## What is TrueInside?

TrueInside is an AI-powered food transparency platform built for Indian consumers. It analyses any packaged food product and tells you exactly what is inside — in plain language.

Most people cannot decode what "E621", "Maltodextrin", or "Acidity Regulator (296)" actually means for their health. TrueInside solves that.

---

## Features

- **Ingredient decoder** — Every ingredient explained: what it is, what it does, and how it affects your body
- **Verified nutrition facts** — Label-accurate nutritional data sourced from Open Food Facts, not AI guesses
- **Threshold warnings** — Flags when common ingredients like sugar, sodium, or saturated fat exceed WHO / FSSAI safe daily limits — with specific numbers and percentages
- **Interactive body map** — Visual diagram showing which organs are affected by which ingredients
- **Health score** — 0–100 score based on actual nutrition data and ingredient analysis
- **Healthier alternatives** — Real Indian market alternatives with specific comparisons
- **Camera scan** — Point your phone at any packaged product to identify and analyse it instantly
- **E-code decoder** — All food additives decoded with concern level ratings

---

## How it works

```
User searches product name or scans barcode / photo
         ↓
Open Food Facts API → real nutrition data from product label
         ↓
Gemini AI → ingredient analysis, health effects, organ impacts, alternatives
         ↓
Threshold engine → compares against WHO / FSSAI daily limits
         ↓
Supabase database → caches result (repeat searches are instant and free)
         ↓
Full analysis shown to user
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| AI Analysis | Google Gemini 1.5 Flash |
| Nutrition Data | Open Food Facts API (verified label data) |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Camera | Gemini Vision API |

---

## Data credibility

TrueInside separates data sources by what each is best at:

- **Open Food Facts** provides nutrition numbers directly from product labels — these match the packet exactly
- **Gemini AI** reasons about what those numbers mean — it never invents nutrition values
- **WHO / FSSAI thresholds** are hardcoded reference limits used to generate warnings

When verified label data is available, a **"Verified from product label"** badge is shown. When only AI estimation is available, a clear **"AI estimated · may vary"** warning is displayed.

---

## Local development

```bash
# Clone the repository
git clone https://github.com/amanverma-108/food-insight-india.git
cd food-insight-india

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your keys (see Environment Variables section below)

# Start development server
npm run dev
```

---

## Environment variables

Create a `.env` file in the root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Get your keys from:
- Supabase: [supabase.com](https://supabase.com) → your project → Settings → API
- Gemini: [aistudio.google.com](https://aistudio.google.com) → Get API Key

---

## Database setup

Run this SQL in your Supabase SQL Editor to create the required tables:

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_name_normalized TEXT NOT NULL UNIQUE,
  brand TEXT,
  category TEXT,
  health_score INTEGER,
  health_rating TEXT,
  health_summary TEXT,
  ingredients JSONB DEFAULT '[]',
  nutrition_facts JSONB,
  additives JSONB DEFAULT '[]',
  body_effects JSONB DEFAULT '{}',
  alternatives JSONB DEFAULT '[]',
  threshold_warnings JSONB DEFAULT '[]',
  off_verified BOOLEAN DEFAULT FALSE,
  nutrition_source TEXT DEFAULT 'ai_estimated',
  search_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE search_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  cache_hit BOOLEAN DEFAULT FALSE,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Project structure

```
src/
├── components/         # UI components (tabs, body map, cards)
├── services/
│   ├── gemini.ts       # Gemini AI analysis service
│   ├── openFoodFacts.ts # Open Food Facts API integration
│   └── productService.ts # Main search pipeline (cache-aside)
├── constants/
│   └── nutritionLimits.ts # WHO / FSSAI threshold constants
├── types/
│   └── product.ts      # TypeScript type definitions
└── lib/
    └── supabase.ts     # Supabase client
```

---

## Final year project

This project was developed as a Final Year B.Tech project focused on food transparency and consumer health awareness in India.

**Key problems addressed:**
- Indian consumers cannot understand ingredient labels written in coded/chemical language
- E-codes (food additives) are opaque to the general public
- Nutritional data on labels is present but not contextualised against daily safe limits
- No existing tool provides this analysis specifically for Indian packaged foods

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with the goal of making every Indian consumer a more informed food buyer.*
## How can I edit this code?

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
