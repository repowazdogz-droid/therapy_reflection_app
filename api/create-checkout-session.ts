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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  if (!stripe) {
    return res.status(500).json({
      error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
    })
  }

  try {
    const origin = req.headers.origin || req.headers.referer?.split("/").slice(0, 3).join("/") || "http://localhost:5176"
    
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 1499,
            product_data: {
              name: "Advanced Reflective Workbook + Unlimited Summaries",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/#/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/cancelled`,
    })

    return res.status(200).json({ id: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return res.status(500).json({ error: "Unable to create checkout session" })
  }
}
