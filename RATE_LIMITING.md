# Rate Limiting Implementation

## Overview

The "Generate 9-step summary" feature is rate-limited to:
- **Free users**: 1 summary per 24 hours
- **Pro users**: Unlimited summaries

## Architecture

### Server-Side Rate Limiting
- Uses **Upstash Redis** for distributed rate limiting
- API route: `/api/check-summary-limit`
- Rate limit: 1 request per 24 hours (sliding window)

### User Identification
- **Device ID**: Generated and stored in localStorage
- **Pro Status**: Checked from localStorage (`tra_pro_unlocked_v1`)
- **Future**: Can be extended with Stripe customer ID verification

## Setup

### 1. Upstash Redis Setup

1. Go to [Upstash Console](https://console.upstash.com/redis)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add to Vercel environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2. Environment Variables

Add to `.env` (local) and Vercel (production):

```env
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

### 3. Graceful Degradation

If Redis is not configured, the API will allow requests (graceful degradation). This ensures the app works even if rate limiting is temporarily unavailable.

## API Endpoint

### `POST /api/check-summary-limit`

**Request Body:**
```json
{
  "deviceId": "device_1234567890_abc123",
  "isPro": false,
  "stripeCustomerId": "cus_xxx" // Optional
}
```

**Response (Allowed):**
```json
{
  "allowed": true,
  "pro": false,
  "remaining": 0,
  "resetAt": 1234567890
}
```

**Response (Rate Limited):**
```json
{
  "allowed": false,
  "pro": false,
  "reason": "Daily limit reached",
  "resetAt": 1234567890,
  "hoursUntilReset": 12,
  "message": "You've used your free summary today..."
}
```

## Frontend Flow

1. User clicks "Generate AI summary"
2. Component calls `/api/check-summary-limit` with device ID
3. If allowed → Generate summary
4. If rate limited → Show error message + Upgrade button
5. Pro users bypass rate limit check entirely

## Files Created/Modified

- ✅ `api/check-summary-limit.ts` - Rate limit API route
- ✅ `src/utils/deviceId.ts` - Device ID utility
- ✅ `src/components/BuyProButton.tsx` - Stripe checkout button
- ✅ `src/components/TherapyReflectionApp.tsx` - Updated summary handler
- ✅ `package.json` - Added `@upstash/ratelimit` and `@upstash/redis`

## Testing

1. **Free User Test:**
   - Generate summary → Should work
   - Try again immediately → Should be rate limited
   - Wait 24 hours → Should work again

2. **Pro User Test:**
   - Set `tra_pro_unlocked_v1` in localStorage to `"true"`
   - Generate multiple summaries → Should all work

3. **Redis Down Test:**
   - Remove Redis env vars
   - Generate summary → Should still work (graceful degradation)

## Future Enhancements

- [ ] Verify Stripe customer ID server-side
- [ ] Add user authentication (Clerk/Supabase/NextAuth)
- [ ] Track rate limits per user ID instead of device ID
- [ ] Add admin dashboard for rate limit monitoring

