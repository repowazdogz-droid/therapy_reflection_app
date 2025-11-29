import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { session_id } = req.query;
  
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ ok: false, error: "Missing session_id" });
  }

  try {
    // Check for STRIPE_SECRET_KEY before initializing Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return res.status(500).json({ 
        ok: false,
        error: "STRIPE_SECRET_KEY is not configured. Please add it in Vercel → Project → Settings → Environment Variables."
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid" || session.status === "complete";
    
    if (!paid) {
      return res.status(200).json({ ok: false, status: session.payment_status });
    }

    return res.status(200).json({ ok: true, status: session.payment_status });
  } catch (error: any) {
    console.error("Error verifying session:", error);
    return res.status(500).json({ 
      ok: false, 
      error: error?.message || "Verification failed. Check your Stripe configuration."
    });
  }
}
