import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create rate limiter: 1 request per 24 hours
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "24 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/summary",
});

interface CheckLimitRequest {
  deviceId?: string; // Client-generated device identifier
  isPro?: boolean; // Client-side Pro status (from localStorage)
  stripeCustomerId?: string; // Optional: Stripe customer ID if available
}

/**
 * Check if user can generate a summary
 * - Pro users: unlimited (bypass rate limit)
 * - Free users: 1 per 24 hours
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as CheckLimitRequest) || {};
    const { deviceId, isPro, stripeCustomerId } = body;

    // Validate deviceId
    if (!deviceId || typeof deviceId !== "string") {
      return res.status(400).json({
        allowed: false,
        error: "Device ID is required",
      });
    }

    // Check if user is Pro
    // Option 1: Client says they're Pro (from localStorage)
    // Option 2: Check Stripe customer ID if provided
    let userIsPro = false;

    if (isPro === true) {
      // Client-side Pro check (from localStorage)
      userIsPro = true;
    } else if (stripeCustomerId) {
      // TODO: Verify Stripe customer has active subscription
      // For now, if they have a customer ID, assume Pro
      // In production, you'd check Stripe API here
      userIsPro = true;
    }

    // Pro users bypass rate limiting
    if (userIsPro) {
      return res.status(200).json({
        allowed: true,
        pro: true,
        reason: "Pro user - unlimited summaries",
      });
    }

    // Free users: check rate limit
    // Use deviceId as the identifier
    const identifier = `summary:${deviceId}`;
    const result = await ratelimit.limit(identifier);

    if (result.success) {
      return res.status(200).json({
        allowed: true,
        pro: false,
        remaining: result.limit - result.remaining,
        resetAt: result.reset,
      });
    } else {
      // Rate limited
      const resetDate = new Date(result.reset);
      const now = new Date();
      const hoursUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60));

      return res.status(200).json({
        allowed: false,
        pro: false,
        reason: "Daily limit reached",
        resetAt: result.reset,
        hoursUntilReset,
        message: `You've used your free summary today. Upgrade to Pro for unlimited summaries, or try again in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? "s" : ""}.`,
      });
    }
  } catch (error: any) {
    console.error("Error checking summary limit:", error);

    // If Redis is not configured, allow the request (graceful degradation)
    if (error.message?.includes("UPSTASH") || error.message?.includes("Redis")) {
      console.warn("Redis not configured - allowing request (graceful degradation)");
      return res.status(200).json({
        allowed: true,
        pro: false,
        warning: "Rate limiting temporarily unavailable",
      });
    }

    return res.status(500).json({
      allowed: false,
      error: error?.message || "Failed to check rate limit",
    });
  }
}

