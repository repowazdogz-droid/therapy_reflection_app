# Environment Variable Fixes for Vercel Deployment

## Audit Results

### ✅ 1. SWITCH TO PROCESS.ENV
**Status:** Already correct
- All API routes use `process.env.*` (not `import.meta.env`)
- No client-side environment variable access in serverless functions

### ✅ 2. REMOVE VITE PREFIX
**Status:** Already correct
- No `VITE_` prefixed variables found in API routes
- All environment variables use standard names:
  - `GEMINI_API_KEY` (not `VITE_GEMINI_API_KEY`)
  - `STRIPE_SECRET_KEY` (not `VITE_STRIPE_SECRET_KEY`)

### ✅ 3. ADD SAFETY CHECK
**Status:** Fixed
- **Before:** `GEMINI_API_KEY` was read at module level (line 20)
- **After:** Environment variable check moved to handler level
- Clear error message returned if `GEMINI_API_KEY` is undefined

## Changes Made

### `api/therapy-ai.ts`
- ✅ Removed module-level `GEMINI_API_KEY` constant
- ✅ Added handler-level check for `GEMINI_API_KEY`
- ✅ Passes API key as parameter to `callGemini()`, `handleReflection()`, and `handleSummary()`
- ✅ Returns clear error message if env var is missing

### `api/create-checkout-session.ts`
- ✅ Already fixed (from previous audit)
- ✅ Checks `STRIPE_SECRET_KEY` before initializing Stripe

### `api/verify-session.ts`
- ✅ Already fixed (from previous audit)
- ✅ Checks `STRIPE_SECRET_KEY` before initializing Stripe

## Environment Variables Required in Vercel

Add these in **Vercel → Project → Settings → Environment Variables**:

1. `GEMINI_API_KEY` - Required for AI features
   - Get from: https://makersuite.google.com/app/apikey

2. `STRIPE_SECRET_KEY` - Required for checkout functionality
   - Get from: https://dashboard.stripe.com/apikeys
   - Use `sk_test_...` for testing, `sk_live_...` for production

## Testing

After deploying, verify:

1. ✅ `/api/therapy-ai` returns clear error if `GEMINI_API_KEY` is missing
2. ✅ `/api/create-checkout-session` returns clear error if `STRIPE_SECRET_KEY` is missing
3. ✅ `/api/verify-session` returns clear error if `STRIPE_SECRET_KEY` is missing
4. ✅ All routes return JSON errors (not HTML) with helpful messages

## Why This Fixes 500 Errors

**Before:**
- Module-level env var access could cause issues if undefined
- No early validation before handler execution
- Errors might not be caught properly

**After:**
- Environment variables checked at handler entry point
- Clear error messages returned immediately if missing
- Consistent error handling pattern across all API routes

