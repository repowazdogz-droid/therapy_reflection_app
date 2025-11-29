# Therapy Reflection App

A gentle, therapist-designed reflection tool for support workers, carers, and overwhelmed adults.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Add your `GEMINI_API_KEY` (get from https://makersuite.google.com/app/apikey)

3. Run development server:

**Option A: Using Vercel CLI (Recommended for API routes)**
```bash
npm run dev:vercel
```
This will start both the Vite dev server and handle `/api/*` routes properly.

**Option B: Using Vite only (API won't work locally)**
```bash
npm run dev
```
Note: API routes won't work with this method. Use `dev:vercel` instead.

## Environment Variables

- `GEMINI_API_KEY` - Your Gemini API key (required)
- `STRIPE_SECRET_KEY` - Stripe secret key (for checkout, optional)

For Vercel deployment, add these in Project Settings > Environment Variables.

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Framework: Vite
3. Output Directory: `dist`
4. Build Command: `npm run build`
5. Add environment variables in Vercel dashboard

