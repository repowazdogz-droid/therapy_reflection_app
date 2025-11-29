import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { session_id } = req.query;
  
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ ok: false, error: "Missing session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid" || session.status === "complete";
    
    if (!paid) {
      return res.status(200).json({ ok: false, status: session.payment_status });
    }

    return res.status(200).json({ ok: true, status: session.payment_status });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Verification failed" });
  }
}
