import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Check for STRIPE_SECRET_KEY before initializing Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return res.status(500).json({ 
        error: "STRIPE_SECRET_KEY is not configured. Please add it in Vercel → Project → Settings → Environment Variables."
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 9900, // £99.00
            product_data: {
              name: "Lifetime Pro Access - Advanced Reflective Workbook + Unlimited Summaries",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/?pro=1`,
      cancel_url: `${req.headers.origin}/#/cancelled`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ 
      error: error?.message || "Unable to create checkout session. Check your Stripe configuration."
    });
  }
}
