# Stripe Integration Setup Guide

## Quick Setup: Stripe Payment Link (Recommended)

### Step 1: Create Your Stripe Payment Link

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com/
2. **Navigate to:** Products → Payment Links → Create payment link
3. **Configure:**
   - **Product name:** "Lifetime Pro Access"
   - **Price:** £99.00 GBP (one-time payment)
   - **Description:** "Advanced Reflective Workbook + Unlimited Summaries"
4. **Set Redirect URL:**
   - In "After payment" section, set redirect to: `https://YOUR-APP-URL.vercel.app/?pro=1`
   - Replace `YOUR-APP-URL` with your actual Vercel deployment URL
   - Example: `https://therapy-reflection-app.vercel.app/?pro=1`
5. **Copy the Payment Link URL** (looks like: `https://buy.stripe.com/abc123xyz`)

### Step 2: Add Payment Link to Code

Replace `YOUR_STRIPE_PAYMENT_LINK_URL` in the code with your actual Payment Link URL.

**Locations to update:**
- `src/components/TherapyReflectionApp.tsx` (3 places)

### Step 3: Test

1. Click "Upgrade to Pro – £99"
2. Complete test payment
3. Should redirect to `/?pro=1`
4. App unlocks Pro automatically

---

## Alternative: Stripe API (If You Prefer)

If you want to use Stripe Checkout API instead:

### Step 1: Get Stripe Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (`sk_test_...` for testing)

### Step 2: Add to Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** Your Stripe secret key
   - **Environment:** Production, Preview, Development

### Step 3: Update Success URL

Update `api/create-checkout-session.ts` line 39:
```typescript
success_url: `${req.headers.origin}/?pro=1`,
```

---

## Current Status

✅ **Stripe API code is ready** - Just needs `STRIPE_SECRET_KEY` in Vercel
✅ **Payment Link placeholders** - Need your Payment Link URL

**Recommendation:** Use Stripe Payment Link (simpler, no API keys needed)
