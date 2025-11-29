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

## Local API Testing

Test your API routes locally without deploying to Vercel:

```bash
npm run test:api
```

This will:
- Load environment variables from `.env`
- Mock the Vercel request/response objects
- Run the API handler directly
- Display the output in your terminal

**Setup:**
1. Create a `.env` file in the root directory
2. Add your `GEMINI_API_KEY`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run `npm run test:api`

The test script uses a sample reflection text. Edit `scripts/local-test.ts` to customize the test input.

## Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Framework: Vite
3. Output Directory: `dist`
4. Build Command: `npm run build`
5. Add environment variables in Vercel dashboard

