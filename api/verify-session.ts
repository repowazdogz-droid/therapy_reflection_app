import type { VercelRequest, VercelResponse } from "@vercel/node"
import Stripe from "stripe"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables")
}

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { session_id } = req.query

  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ ok: false, error: "Missing session_id" })
  }

  if (!stripe) {
    return res.status(500).json({
      ok: false,
      error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
    })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    const paid =
      session.payment_status === "paid" ||
      session.status === "complete"

    if (!paid) {
      return res.status(200).json({ ok: false, status: session.payment_status })
    }

    return res.status(200).json({
      ok: true,
      status: session.payment_status,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ ok: false, error: "Verification failed" })
  }
}
