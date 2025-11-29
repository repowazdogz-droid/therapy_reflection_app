# Vercel Deployment Audit & Fixes

## Issues Found & Fixed

### 🔴 CRITICAL: Stripe Initialization at Module Level

**Problem:**
- `create-checkout-session.ts` and `verify-session.ts` were creating Stripe instances at module load time (line 4)
- If `STRIPE_SECRET_KEY` is undefined, `new Stripe(undefined)` throws immediately when the module loads
- This causes a 500 error before the handler even runs

**Fix Applied:**
- Moved Stripe initialization inside the handler functions
- Added explicit checks for `STRIPE_SECRET_KEY` before creating Stripe instance
- Returns clear error message if env var is missing

**Files Fixed:**
- ✅ `api/create-checkout-session.ts`
- ✅ `api/verify-session.ts`

### ✅ Environment Variables

**Status:** GOOD
- `therapy-ai.ts` correctly checks `GEMINI_API_KEY` before use
- Stripe files now check `STRIPE_SECRET_KEY` before use
- `.env.example` exists (though filtered by .cursorignore)

**Required Vercel Environment Variables:**
- `GEMINI_API_KEY` - Required for AI features
- `STRIPE_SECRET_KEY` - Required for checkout functionality

### ✅ Error Handling

**Status:** GOOD
- All three API routes have try/catch blocks
- Error messages are now more descriptive
- Errors are logged to console for debugging

### ✅ Database Connections

**Status:** N/A
- No database connections found in API routes
- Not applicable to this project

### ✅ File System Operations

**Status:** N/A
- No `fs` operations found in API routes
- Not applicable to this project

## Most Likely Culprit

**The Stripe initialization issue was the most likely cause of 500 errors.**

When `STRIPE_SECRET_KEY` is missing or undefined:
1. Module loads → Stripe constructor called with `undefined`
2. Stripe throws error immediately
3. Vercel returns 500 before handler executes
4. No clear error message in response

## Testing Checklist

After deploying, verify:

1. ✅ `/api/therapy-ai` works (requires `GEMINI_API_KEY`)
2. ✅ `/api/create-checkout-session` returns clear error if `STRIPE_SECRET_KEY` missing
3. ✅ `/api/verify-session` returns clear error if `STRIPE_SECRET_KEY` missing
4. ✅ All routes return JSON errors (not HTML)

## Next Steps

1. **Verify Environment Variables in Vercel:**
   - Go to Project → Settings → Environment Variables
   - Ensure both `GEMINI_API_KEY` and `STRIPE_SECRET_KEY` are set
   - Redeploy after adding variables

2. **Check Vercel Logs:**
   - Go to Project → Deployments → [Latest] → Functions
   - Check function logs for any remaining errors

3. **Test Each Endpoint:**
   - Test `/api/therapy-ai` with valid input
   - Test `/api/create-checkout-session` (should work if Stripe key is set)
   - Test `/api/verify-session` with a valid session_id

